using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using YoYoVoiceChatApi.Data;
using YoYoVoiceChatApi.Models.DTOs;
using YoYoVoiceChatApi.Models.Entities;
using YoYoVoiceChatApi.Services;

namespace YoYoVoiceChatApi.Hubs
{
    [Authorize]
    public class RoomHub : Hub
    {
        private readonly ApplicationDbContext _db;
        private readonly ISeatManager _seatManager;
        private readonly ICacheService _cache;
        private readonly ILogger<RoomHub> _logger;

        public RoomHub(
            ApplicationDbContext db,
            ISeatManager seatManager,
            ICacheService cache,
            ILogger<RoomHub> logger)
        {
            _db = db;
            _seatManager = seatManager;
            _cache = cache;
            _logger = logger;
        }

        private int GetCurrentUserId()
        {
            var claim = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(claim, out var id) ? id : 0;
        }

        public async Task JoinRoom(int roomId, string? password)
        {
            var userId = GetCurrentUserId();
            var user = await _db.Users.FindAsync(userId);
            if (user == null)
            {
                await Clients.Caller.SendAsync("ErrorNotice", "User not found");
                return;
            }

            // 1. Check Platform Ban (3 Days, 7 Days, Permanent)
            if (user.IsPermanentBan)
            {
                await Clients.Caller.SendAsync("UserBannedNotice", "Aapki ID permanently ban kar di gayi hai.");
                Context.Abort();
                return;
            }
            if (user.BannedUntil.HasValue && user.BannedUntil.Value > DateTime.UtcNow)
            {
                var remaining = user.BannedUntil.Value - DateTime.UtcNow;
                await Clients.Caller.SendAsync("UserBannedNotice", $"Aapki ID {remaining.Days}d {remaining.Hours}h ke liye ban hai. Reason: {user.BanReason}");
                Context.Abort();
                return;
            }

            // 2. Check Room Kick (3 Days or Permanent)
            var activeKick = await _db.RoomKicks
                .Where(k => k.RoomId == roomId && k.UserId == userId && k.IsActive)
                .OrderByDescending(k => k.CreatedAt)
                .FirstOrDefaultAsync();

            if (activeKick != null)
            {
                if (activeKick.KickType == "Permanent")
                {
                    await Clients.Caller.SendAsync("RoomKickNotice", "Aapko is room se permanently kick/ban kiya gaya hai. Jab tak room owner un-kick nahi karega, aap enter nahi ho sakte.");
                    return;
                }
                else if (activeKick.KickType == "ThreeDays" && activeKick.KickedUntil.HasValue && activeKick.KickedUntil.Value > DateTime.UtcNow)
                {
                    var rem = activeKick.KickedUntil.Value - DateTime.UtcNow;
                    await Clients.Caller.SendAsync("RoomKickNotice", $"Aap is room se 3 dino ke liye kicked hain. Remaining: {rem.Days}d {rem.Hours}h.");
                    return;
                }
            }

            // 3. Check Room Lock & Password
            var room = await _db.Rooms.Include(r => r.Owner).FirstOrDefaultAsync(r => r.Id == roomId);
            if (room == null)
            {
                await Clients.Caller.SendAsync("ErrorNotice", "Room nahi mila.");
                return;
            }

            if (room.IsLocked && room.OwnerId != userId)
            {
                if (string.IsNullOrEmpty(password) || room.PasswordHash != password)
                {
                    await Clients.Caller.SendAsync("RoomLockedNotice", "Yeh room locked hai. Kripya correct password enter karein.");
                    return;
                }
            }

            var groupName = $"room_{roomId}";
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);

            var userDto = new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                DisplayName = user.DisplayName,
                AvatarUrl = user.AvatarUrl,
                UserLevel = user.UserLevel,
                Coins = user.Coins
            };

            await Clients.Caller.SendAsync("JoinedRoomSuccess", new { RoomId = roomId, RoomTitle = room.Title });
            await Clients.Group(groupName).SendAsync("UserJoinedRoom", userDto);

            _logger.LogInformation("User {UserId} joined room {RoomId}", userId, roomId);
        }

        public async Task LeaveRoom(int roomId)
        {
            var userId = GetCurrentUserId();
            var groupName = $"room_{roomId}";

            // Free any seat occupied by this user
            var seat = await _db.RoomSeats.FirstOrDefaultAsync(s => s.RoomId == roomId && s.OccupantUserId == userId);
            if (seat != null)
            {
                seat.OccupantUserId = null;
                seat.OccupiedAt = null;
                await _db.SaveChangesAsync();
                await Clients.Group(groupName).SendAsync("SeatVacated", new { RoomId = roomId, SeatIndex = seat.SeatIndex });
            }

            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
            await Clients.Group(groupName).SendAsync("UserLeftRoom", new { UserId = userId, RoomId = roomId });
        }

        public async Task TakeSeat(int roomId, int seatIndex)
        {
            var userId = GetCurrentUserId();
            var user = await _db.Users.Include(u => u.ActiveFrame).FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) return;

            var room = await _db.Rooms.FindAsync(roomId);
            if (room == null) return;

            var targetSeat = await _db.RoomSeats.FirstOrDefaultAsync(s => s.RoomId == roomId && s.SeatIndex == seatIndex);
            if (targetSeat == null || targetSeat.IsLocked || targetSeat.OccupantUserId != null)
            {
                await Clients.Caller.SendAsync("ErrorNotice", "Yeh seat available nahi hai ya lock hai.");
                return;
            }

            // Vacate any other seat in this room
            var currentSeat = await _db.RoomSeats.FirstOrDefaultAsync(s => s.RoomId == roomId && s.OccupantUserId == userId);
            if (currentSeat != null)
            {
                currentSeat.OccupantUserId = null;
                currentSeat.OccupiedAt = null;
            }

            targetSeat.OccupantUserId = userId;
            targetSeat.OccupiedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            var occupantDto = new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                DisplayName = user.DisplayName,
                AvatarUrl = user.AvatarUrl,
                UserLevel = user.UserLevel,
                ActiveFrame = user.ActiveFrame != null ? new FrameDto
                {
                    Id = user.ActiveFrame.Id,
                    Name = user.ActiveFrame.Name,
                    BorderColor = user.ActiveFrame.BorderColor,
                    GlowEffect = user.ActiveFrame.GlowEffect
                } : null
            };

            var groupName = $"room_{roomId}";
            await Clients.Group(groupName).SendAsync("SeatOccupied", new
            {
                RoomId = roomId,
                SeatIndex = seatIndex,
                Occupant = occupantDto
            });
        }

        public async Task LeaveSeat(int roomId, int seatIndex)
        {
            var userId = GetCurrentUserId();
            var seat = await _db.RoomSeats.FirstOrDefaultAsync(s => s.RoomId == roomId && s.SeatIndex == seatIndex);
            var room = await _db.Rooms.FindAsync(roomId);

            if (seat == null || room == null) return;

            // Only occupant or room owner can vacate
            if (seat.OccupantUserId != userId && room.OwnerId != userId)
            {
                await Clients.Caller.SendAsync("ErrorNotice", "Aapko is seat ko khali karne ki permission nahi hai.");
                return;
            }

            seat.OccupantUserId = null;
            seat.OccupiedAt = null;
            await _db.SaveChangesAsync();

            var groupName = $"room_{roomId}";
            await Clients.Group(groupName).SendAsync("SeatVacated", new
            {
                RoomId = roomId,
                SeatIndex = seatIndex
            });
        }

        public async Task ToggleRoomLock(int roomId, bool isLocked, string? password)
        {
            var userId = GetCurrentUserId();
            var room = await _db.Rooms.FindAsync(roomId);
            if (room == null || room.OwnerId != userId)
            {
                await Clients.Caller.SendAsync("ErrorNotice", "Sirf room owner room lock/unlock kar sakta hai.");
                return;
            }

            room.IsLocked = isLocked;
            room.PasswordHash = isLocked ? password : null;
            await _db.SaveChangesAsync();

            var groupName = $"room_{roomId}";
            await Clients.Group(groupName).SendAsync("RoomLockStatusChanged", new
            {
                RoomId = roomId,
                IsLocked = isLocked
            });
        }

        public async Task KickUserFromRoom(int roomId, int targetUserId, string kickType)
        {
            var currentUserId = GetCurrentUserId();
            var room = await _db.Rooms.FindAsync(roomId);
            if (room == null || room.OwnerId != currentUserId)
            {
                await Clients.Caller.SendAsync("ErrorNotice", "Sirf room owner user ko kick kar sakta hai.");
                return;
            }

            if (targetUserId == room.OwnerId)
            {
                await Clients.Caller.SendAsync("ErrorNotice", "Room owner ko kick nahi kiya ja sakta.");
                return;
            }

            // Free target user's seat if occupied
            var seat = await _db.RoomSeats.FirstOrDefaultAsync(s => s.RoomId == roomId && s.OccupantUserId == targetUserId);
            if (seat != null)
            {
                seat.OccupantUserId = null;
                seat.OccupiedAt = null;
            }

            // Save Kick Record
            DateTime? kickedUntil = kickType == "ThreeDays" ? DateTime.UtcNow.AddDays(3) : null;
            var kickRecord = new RoomKick
            {
                RoomId = roomId,
                UserId = targetUserId,
                KickedByUserId = currentUserId,
                KickType = kickType,
                KickedUntil = kickedUntil,
                IsActive = true
            };
            _db.RoomKicks.Add(kickRecord);
            await _db.SaveChangesAsync();

            var groupName = $"room_{roomId}";
            await Clients.Group(groupName).SendAsync("UserKickedBroadcast", new
            {
                RoomId = roomId,
                UserId = targetUserId,
                KickType = kickType,
                KickedUntil = kickedUntil
            });

            if (seat != null)
            {
                await Clients.Group(groupName).SendAsync("SeatVacated", new { RoomId = roomId, SeatIndex = seat.SeatIndex });
            }
        }

        public async Task SendChatMessage(int roomId, string content)
        {
            var userId = GetCurrentUserId();
            var user = await _db.Users.FindAsync(userId);
            if (user == null || string.IsNullOrWhiteSpace(content)) return;

            var msg = new RoomMessage
            {
                RoomId = roomId,
                SenderUserId = userId,
                Content = content,
                MessageType = "Text",
                SentAt = DateTime.UtcNow
            };
            _db.RoomMessages.Add(msg);
            await _db.SaveChangesAsync();

            var groupName = $"room_{roomId}";
            await Clients.Group(groupName).SendAsync("ReceiveChatMessage", new
            {
                Id = msg.Id,
                RoomId = roomId,
                SenderId = userId,
                SenderName = user.DisplayName,
                SenderAvatar = user.AvatarUrl,
                UserLevel = user.UserLevel,
                Content = content,
                MessageType = "Text",
                SentAt = msg.SentAt
            });
        }

        public async Task SendImageMessage(int roomId, string imageUrl, string? caption)
        {
            var userId = GetCurrentUserId();
            var user = await _db.Users.FindAsync(userId);
            if (user == null || string.IsNullOrWhiteSpace(imageUrl)) return;

            var msg = new RoomMessage
            {
                RoomId = roomId,
                SenderUserId = userId,
                Content = string.IsNullOrWhiteSpace(caption) ? "📷 Photo" : caption,
                MessageType = "Image",
                SentAt = DateTime.UtcNow
            };
            _db.RoomMessages.Add(msg);
            await _db.SaveChangesAsync();

            var groupName = $"room_{roomId}";
            await Clients.Group(groupName).SendAsync("ReceiveChatMessage", new
            {
                Id = msg.Id,
                RoomId = roomId,
                SenderId = userId,
                SenderName = user.DisplayName,
                SenderAvatar = user.AvatarUrl,
                UserLevel = user.UserLevel,
                Content = msg.Content,
                ImageUrl = imageUrl,
                MessageType = "Image",
                SentAt = msg.SentAt
            });
        }
    }
}
