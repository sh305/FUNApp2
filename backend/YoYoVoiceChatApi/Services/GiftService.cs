using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using YoYoVoiceChatApi.Data;
using YoYoVoiceChatApi.Hubs;
using YoYoVoiceChatApi.Models.DTOs;
using YoYoVoiceChatApi.Models.Entities;

namespace YoYoVoiceChatApi.Services
{
    public interface IGiftService
    {
        Task<(bool Success, string Message, GiftBroadcastEvent? EventData)> SendGiftAsync(int senderUserId, SendGiftRequest req);
    }

    public class GiftService : IGiftService
    {
        private readonly ApplicationDbContext _db;
        private readonly ISeatManager _seatManager;
        private readonly IHubContext<RoomHub> _hubContext;

        public GiftService(
            ApplicationDbContext db,
            ISeatManager seatManager,
            IHubContext<RoomHub> hubContext)
        {
            _db = db;
            _seatManager = seatManager;
            _hubContext = hubContext;
        }

        public async Task<(bool Success, string Message, GiftBroadcastEvent? EventData)> SendGiftAsync(int senderUserId, SendGiftRequest req)
        {
            if (req.Quantity <= 0) req.Quantity = 1;

            var sender = await _db.Users.FindAsync(senderUserId);
            var receiver = await _db.Users.FindAsync(req.ReceiverUserId);
            var room = await _db.Rooms.Include(r => r.Seats).FirstOrDefaultAsync(r => r.Id == req.RoomId);
            var gift = await _db.Gifts.FindAsync(req.GiftId);

            if (sender == null || receiver == null || room == null || gift == null)
            {
                return (false, "Invalid transaction parameters.", null);
            }

            long totalCoins = gift.CoinPrice * req.Quantity;
            if (sender.Coins < totalCoins)
            {
                return (false, "Apke wallet me sufficient coins nahi hain.", null);
            }

            // Deduct Coins
            sender.Coins -= totalCoins;

            // Sender Exp and Level Up Check
            sender.UserExp += totalCoins;
            int calculatedUserLevel = 1 + (int)(sender.UserExp / 1000);
            if (calculatedUserLevel > sender.UserLevel)
            {
                sender.UserLevel = calculatedUserLevel;
            }

            // Receiver gets diamonds / commission
            long diamondsEarned = totalCoins / 10;
            receiver.Diamonds += diamondsEarned;

            // Room Exp and Dynamic Seat Growth Check
            room.RoomExp += totalCoins;
            int calculatedRoomLevel = 1 + (int)(room.RoomExp / 2000);
            int oldSeatCount = room.SeatCount;

            if (calculatedRoomLevel > room.RoomLevel)
            {
                room.RoomLevel = calculatedRoomLevel;
            }

            // Synchronize seats according to Level multiples of 12
            int newSeatCount = await _seatManager.SyncRoomSeatsAsync(room.Id, room.RoomLevel, _db);

            // Record transaction
            var transaction = new GiftTransaction
            {
                SenderUserId = senderUserId,
                ReceiverUserId = req.ReceiverUserId,
                RoomId = req.RoomId,
                GiftId = req.GiftId,
                Quantity = req.Quantity,
                TotalCoins = totalCoins,
                SentAt = DateTime.UtcNow
            };
            _db.GiftTransactions.Add(transaction);
            await _db.SaveChangesAsync();

            var broadcastEvent = new GiftBroadcastEvent
            {
                RoomId = req.RoomId,
                SenderId = sender.Id,
                SenderName = sender.DisplayName,
                SenderAvatar = sender.AvatarUrl,
                ReceiverId = receiver.Id,
                ReceiverName = receiver.DisplayName,
                Gift = new GiftDto
                {
                    Id = gift.Id,
                    Name = gift.Name,
                    Code = gift.Code,
                    IconUrl = gift.IconUrl,
                    AnimationType = gift.AnimationType,
                    CoinPrice = gift.CoinPrice,
                    ExpValue = gift.ExpValue,
                    Category = gift.Category
                },
                Quantity = req.Quantity,
                TotalCoins = totalCoins,
                SentAt = transaction.SentAt,
                NewRoomLevel = room.RoomLevel,
                NewSeatCount = newSeatCount
            };

            // Broadcast via SignalR to entire room
            var groupName = $"room_{req.RoomId}";
            await _hubContext.Clients.Group(groupName).SendAsync("ReceiveGiftAlert", broadcastEvent);

            // Accumulate Room Treasure Box points (12K, 60K, 200K, 400K, 800K)
            room.BoxPoints += totalCoins;
            long currentThreshold = room.CurrentBoxLevel switch
            {
                1 => 12000,
                2 => 60000,
                3 => 200000,
                4 => 400000,
                _ => 800000
            };
            await _hubContext.Clients.Group(groupName).SendAsync("RoomBoxProgressUpdated", new
            {
                RoomId = req.RoomId,
                CurrentBoxLevel = room.CurrentBoxLevel,
                BoxPoints = room.BoxPoints,
                BoxThreshold = currentThreshold,
                CanClaim = room.BoxPoints >= currentThreshold
            });

            // If seats expanded, broadcast seat expansion event!
            if (newSeatCount > oldSeatCount)
            {
                await _hubContext.Clients.Group(groupName).SendAsync("SeatCountExpanded", new
                {
                    RoomId = req.RoomId,
                    OldSeatCount = oldSeatCount,
                    NewSeatCount = newSeatCount,
                    RoomLevel = room.RoomLevel
                });
            }

            return (true, "Gift sent successfully!", broadcastEvent);
        }
    }
}
