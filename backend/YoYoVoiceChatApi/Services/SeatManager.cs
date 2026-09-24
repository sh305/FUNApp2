using Microsoft.EntityFrameworkCore;
using YoYoVoiceChatApi.Data;
using YoYoVoiceChatApi.Models.Entities;

namespace YoYoVoiceChatApi.Services
{
    public interface ISeatManager
    {
        int CalculateSeatCount(int roomLevel);
        Task<int> SyncRoomSeatsAsync(int roomId, int roomLevel, ApplicationDbContext db);
        Task<bool> EnsureInitialSeatsAsync(int roomId, int initialLevel, ApplicationDbContext db);
    }

    public class SeatManager : ISeatManager
    {
        /// <summary>
        /// User requirement:
        /// "pehli baar room ma 8 seat hogi uska baad jaisa jaisa room ka level increase kra ga seat bhi increase ho gi automatic
        /// or ya seat Humsa increase ho gi jab man lo room ka level 12 ka uppar ha tab har bar 12 ka multiple per seat increase ho
        /// means 12 level per 2 seat bad jaya gi fir 24 level per 2 seat bad jaya gi asa seat increase ho gi"
        ///
        /// Formula:
        /// If Level < 12: 8 seats
        /// If Level >= 12: 8 + (floor(Level / 12) * 4)
        /// Level 1-11: 8 seats
        /// Level 12-23: 8 + (1 * 4) = 12 seats (3 rows of 4)
        /// Level 24-35: 8 + (2 * 4) = 16 seats (4 rows of 4)
        /// Level 36-47: 8 + (3 * 4) = 20 seats (5 rows of 4)
        /// Level 48-59: 8 + (4 * 4) = 24 seats (6 rows of 4)
        /// </summary>
        public int CalculateSeatCount(int roomLevel)
        {
            if (roomLevel < 12)
            {
                return 8;
            }

            int multiplier = roomLevel / 12;
            return 8 + (multiplier * 4);
        }

        public async Task<bool> EnsureInitialSeatsAsync(int roomId, int initialLevel, ApplicationDbContext db)
        {
            var expectedCount = CalculateSeatCount(initialLevel);
            var existingCount = await db.RoomSeats.CountAsync(s => s.RoomId == roomId);

            if (existingCount < expectedCount)
            {
                for (int i = existingCount; i < expectedCount; i++)
                {
                    db.RoomSeats.Add(new RoomSeat
                    {
                        RoomId = roomId,
                        SeatIndex = i,
                        OccupantUserId = null,
                        IsMuted = false,
                        IsLocked = false
                    });
                }
                await db.SaveChangesAsync();
                return true;
            }

            return false;
        }

        public async Task<int> SyncRoomSeatsAsync(int roomId, int roomLevel, ApplicationDbContext db)
        {
            var targetSeats = CalculateSeatCount(roomLevel);
            var existingSeats = await db.RoomSeats
                .Where(s => s.RoomId == roomId)
                .OrderBy(s => s.SeatIndex)
                .ToListAsync();

            if (existingSeats.Count < targetSeats)
            {
                // Expand seats!
                for (int i = existingSeats.Count; i < targetSeats; i++)
                {
                    db.RoomSeats.Add(new RoomSeat
                    {
                        RoomId = roomId,
                        SeatIndex = i,
                        OccupantUserId = null,
                        IsMuted = false,
                        IsLocked = false
                    });
                }

                var room = await db.Rooms.FindAsync(roomId);
                if (room != null)
                {
                    room.SeatCount = targetSeats;
                }

                await db.SaveChangesAsync();
            }

            return targetSeats;
        }
    }
}
