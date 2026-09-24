using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using YoYoVoiceChatApi.Data;
using YoYoVoiceChatApi.Models.DTOs;
using YoYoVoiceChatApi.Models.Entities;
using YoYoVoiceChatApi.Services;

namespace YoYoVoiceChatApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoomsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly ISeatManager _seatManager;
        private readonly Microsoft.AspNetCore.SignalR.IHubContext<YoYoVoiceChatApi.Hubs.RoomHub> _hubContext;

        public RoomsController(
            ApplicationDbContext db,
            ISeatManager seatManager,
            Microsoft.AspNetCore.SignalR.IHubContext<YoYoVoiceChatApi.Hubs.RoomHub> hubContext)
        {
            _db = db;
            _seatManager = seatManager;
            _hubContext = hubContext;
        }

        private int GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(claim, out var id) ? id : 0;
        }

        [HttpGet]
        public async Task<IActionResult> GetRooms([FromQuery] string? category)
        {
            var query = _db.Rooms
                .AsNoTracking()
                .Include(r => r.Owner)
                .Include(r => r.ActiveFrame)
                .Include(r => r.Seats)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(category) && category != "All")
            {
                query = query.Where(r => r.Category == category);
            }

            var rooms = await query
                .OrderByDescending(r => r.RoomLevel)
                .Select(r => new RoomSummaryDto
                {
                    Id = r.Id,
                    RoomNumber = r.RoomNumber,
                    Title = r.Title,
                    CoverUrl = r.CoverUrl,
                    Category = r.Category,
                    RoomLevel = r.RoomLevel,
                    SeatCount = r.SeatCount,
                    OccupiedSeatsCount = r.Seats.Count(s => s.OccupantUserId != null),
                    IsLocked = r.IsLocked,
                    OwnerId = r.OwnerId,
                    OwnerName = r.Owner != null ? r.Owner.DisplayName : "Unknown",
                    OwnerAvatar = r.Owner != null ? r.Owner.AvatarUrl : null,
                    ActiveFrame = r.ActiveFrame != null ? new FrameDto
                    {
                        Id = r.ActiveFrame.Id,
                        Name = r.ActiveFrame.Name,
                        BorderColor = r.ActiveFrame.BorderColor,
                        GlowEffect = r.ActiveFrame.GlowEffect
                    } : null
                })
                .ToListAsync();

            return Ok(rooms);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetRoomById(int id)
        {
            var room = await _db.Rooms
                .AsNoTracking()
                .Where(r => r.Id == id)
                .Select(r => new RoomDetailDto
                {
                    Id = r.Id,
                    RoomNumber = r.RoomNumber,
                    Title = r.Title,
                    Description = r.Description,
                    CoverUrl = r.CoverUrl,
                    OwnerId = r.OwnerId,
                    Owner = r.Owner != null ? new UserDto
                    {
                        Id = r.Owner.Id,
                        DisplayName = r.Owner.DisplayName,
                        AvatarUrl = r.Owner.AvatarUrl,
                        UserLevel = r.Owner.UserLevel
                    } : null,
                    Category = r.Category,
                    RoomLevel = r.RoomLevel,
                    RoomExp = r.RoomExp,
                    SeatCount = r.SeatCount,
                    IsLocked = r.IsLocked,
                    BoxPoints = r.BoxPoints,
                    CurrentBoxLevel = r.CurrentBoxLevel,
                    ActiveFrame = r.ActiveFrame != null ? new FrameDto
                    {
                        Id = r.ActiveFrame.Id,
                        Name = r.ActiveFrame.Name,
                        BorderColor = r.ActiveFrame.BorderColor,
                        GlowEffect = r.ActiveFrame.GlowEffect
                    } : null,
                    Seats = r.Seats.OrderBy(s => s.SeatIndex).Select(s => new SeatDto
                    {
                        SeatIndex = s.SeatIndex,
                        OccupantUserId = s.OccupantUserId,
                        IsMuted = s.IsMuted,
                        IsLocked = s.IsLocked,
                        OccupiedAt = s.OccupiedAt,
                        Occupant = s.OccupantUser != null ? new UserDto
                        {
                            Id = s.OccupantUser.Id,
                            Username = s.OccupantUser.Username,
                            DisplayName = s.OccupantUser.DisplayName,
                            AvatarUrl = s.OccupantUser.AvatarUrl,
                            UserLevel = s.OccupantUser.UserLevel,
                            ActiveFrame = s.OccupantUser.ActiveFrame != null ? new FrameDto
                            {
                                Id = s.OccupantUser.ActiveFrame.Id,
                                Name = s.OccupantUser.ActiveFrame.Name,
                                BorderColor = s.OccupantUser.ActiveFrame.BorderColor,
                                GlowEffect = s.OccupantUser.ActiveFrame.GlowEffect
                            } : null
                        } : null
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (room == null)
            {
                return NotFound("Room nahi mila.");
            }

            room.BoxThreshold = GetBoxThreshold(room.CurrentBoxLevel);
            room.BoxCanClaim = room.BoxPoints >= room.BoxThreshold;

            return Ok(room);
        }

        private static long GetBoxThreshold(int level) => level switch
        {
            1 => 12000,
            2 => 60000,
            3 => 200000,
            4 => 400000,
            _ => 800000
        };

        [Authorize]
        [HttpPost("{id}/claim-box")]
        public async Task<IActionResult> ClaimRoomBox(int id)
        {
            var userId = GetCurrentUserId();
            var user = await _db.Users.FindAsync(userId);
            var room = await _db.Rooms.FindAsync(id);
            if (user == null || room == null) return NotFound("User ya Room nahi mila.");

            long threshold = GetBoxThreshold(room.CurrentBoxLevel);
            if (room.BoxPoints < threshold)
            {
                return BadRequest($"Box open karne ke liye {threshold:N0} points zaroori hain. Current points: {room.BoxPoints:N0}.");
            }

            int claimedLevel = room.CurrentBoxLevel;
            long rewardCoins = claimedLevel switch
            {
                1 => 10000,
                2 => 50000,
                3 => 150000,
                4 => 350000,
                _ => 1000000
            };

            string frameName = claimedLevel switch
            {
                1 => "Amethyst Crystal Frame",
                2 => "Cyan Laser Cyber Frame",
                3 => "Galaxy Sovereign Frame",
                4 => "Golden Fire Dragon Frame",
                _ => "Solar God Radiant Crown Frame"
            };

            string animationName = claimedLevel switch
            {
                1 => "VIP Hi~ Greeting Bubble",
                2 => "🏎️ Cyber Supercar Racing Crest",
                3 => "👑 Royal Phoenix VIP Emblem",
                4 => "🐉 Golden Dragon King Medallion",
                _ => "🏰 Celestial Sun Palace Room Theme"
            };

            // Credit Coins to claimer
            user.Coins += rewardCoins;

            // Reset box points & advance level
            room.BoxPoints = Math.Max(0, room.BoxPoints - threshold);
            int nextLevel = room.CurrentBoxLevel < 5 ? room.CurrentBoxLevel + 1 : 5;
            room.CurrentBoxLevel = nextLevel;

            await _db.SaveChangesAsync();

            var reward = new ClaimBoxRewardDto
            {
                Success = true,
                Message = $"Mubarak ho! Aapne Level {claimedLevel} Box open kiya aur aapko {rewardCoins:N0} Coins, {frameName} aur {animationName} mile!",
                ClaimedBoxLevel = claimedLevel,
                CoinsEarned = rewardCoins,
                FrameUnlocked = frameName,
                AnimationUnlocked = animationName,
                NextBoxLevel = nextLevel,
                NextThreshold = GetBoxThreshold(nextLevel)
            };

            // Broadcast to room
            var groupName = $"room_{room.Id}";
            await _hubContext.Clients.Group(groupName).SendAsync("RoomBoxClaimed", new
            {
                RoomId = room.Id,
                ClaimerName = user.DisplayName,
                ClaimedBoxLevel = claimedLevel,
                RewardCoins = rewardCoins,
                FrameUnlocked = frameName,
                NextBoxLevel = nextLevel,
                NextThreshold = GetBoxThreshold(nextLevel)
            });

            return Ok(reward);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateRoom([FromBody] CreateRoomRequest req)
        {
            var userId = GetCurrentUserId();
            var roomNumber = $"YOYO-{Random.Shared.Next(100, 999)}";

            var room = new Room
            {
                RoomNumber = roomNumber,
                Title = string.IsNullOrWhiteSpace(req.Title) ? "My Voice Room" : req.Title,
                Description = req.Description,
                CoverUrl = req.CoverUrl ?? "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400",
                OwnerId = userId,
                Category = req.Category ?? "Chat",
                RoomLevel = 1,
                RoomExp = 0,
                SeatCount = 8, // Initial seats: 8
                IsLocked = req.IsLocked,
                PasswordHash = req.IsLocked ? req.Password : null,
                CreatedAt = DateTime.UtcNow
            };

            _db.Rooms.Add(room);
            await _db.SaveChangesAsync();

            // Populate initial 8 seats
            await _seatManager.EnsureInitialSeatsAsync(room.Id, room.RoomLevel, _db);

            return CreatedAtAction(nameof(GetRoomById), new { id = room.Id }, new { RoomId = room.Id, RoomNumber = room.RoomNumber });
        }

        [Authorize]
        [HttpPost("{id}/lock")]
        public async Task<IActionResult> LockRoom(int id, [FromBody] LockRoomRequest req)
        {
            var userId = GetCurrentUserId();
            var room = await _db.Rooms.FindAsync(id);
            if (room == null) return NotFound("Room nahi mila.");
            if (room.OwnerId != userId) return Forbid("Sirf room owner room lock kar sakta hai.");

            if (string.IsNullOrWhiteSpace(req.Password))
            {
                return BadRequest("Lock karne ke liye password zaroori hai.");
            }

            room.IsLocked = true;
            room.PasswordHash = req.Password.Trim();
            await _db.SaveChangesAsync();

            return Ok(new { Message = "Room locked successfully.", IsLocked = true });
        }

        [Authorize]
        [HttpPost("{id}/unlock")]
        public async Task<IActionResult> UnlockRoom(int id)
        {
            var userId = GetCurrentUserId();
            var room = await _db.Rooms.FindAsync(id);
            if (room == null) return NotFound("Room nahi mila.");
            if (room.OwnerId != userId) return Forbid("Sirf room owner room unlock kar sakta hai.");

            room.IsLocked = false;
            room.PasswordHash = null;
            await _db.SaveChangesAsync();

            return Ok(new { Message = "Room unlocked successfully.", IsLocked = false });
        }

        [HttpPost("{id}/verify-password")]
        public async Task<IActionResult> VerifyPassword(int id, [FromBody] JoinRoomRequest req)
        {
            var room = await _db.Rooms.FindAsync(id);
            if (room == null) return NotFound("Room nahi mila.");

            if (!room.IsLocked) return Ok(new { Authorized = true });

            if (room.PasswordHash == req.Password?.Trim())
            {
                return Ok(new { Authorized = true });
            }

            return BadRequest("Galat password. Kripya sahi password enter karein.");
        }

        [Authorize]
        [HttpGet("{id}/kicks")]
        public async Task<IActionResult> GetRoomKickedUsers(int id)
        {
            var userId = GetCurrentUserId();
            var room = await _db.Rooms.FindAsync(id);
            if (room == null || room.OwnerId != userId)
            {
                return Forbid("Sirf room owner kicked users list dekh sakta hai.");
            }

            var kicks = await _db.RoomKicks
                .Include(k => k.User)
                .Where(k => k.RoomId == id && k.IsActive)
                .OrderByDescending(k => k.CreatedAt)
                .Select(k => new RoomKickDto
                {
                    Id = k.Id,
                    RoomId = k.RoomId,
                    UserId = k.UserId,
                    Username = k.User != null ? k.User.Username : "Unknown",
                    DisplayName = k.User != null ? k.User.DisplayName : "Unknown",
                    AvatarUrl = k.User != null ? k.User.AvatarUrl : null,
                    KickType = k.KickType,
                    KickedUntil = k.KickedUntil,
                    CreatedAt = k.CreatedAt
                })
                .ToListAsync();

            return Ok(kicks);
        }

        [Authorize]
        [HttpDelete("{id}/kicks/{kickId}")]
        public async Task<IActionResult> PardonKickedUser(int id, int kickId)
        {
            var userId = GetCurrentUserId();
            var room = await _db.Rooms.FindAsync(id);
            if (room == null || room.OwnerId != userId)
            {
                return Forbid("Sirf room owner user ko un-kick kar sakta hai.");
            }

            var kick = await _db.RoomKicks.FirstOrDefaultAsync(k => k.Id == kickId && k.RoomId == id);
            if (kick == null) return NotFound("Kick record nahi mila.");

            kick.IsActive = false;
            await _db.SaveChangesAsync();

            return Ok(new { Message = "User ko successfully un-kick kar diya gaya hai." });
        }

        [Authorize]
        [HttpPost("{id}/upload-photo")]
        public async Task<IActionResult> UploadRoomPhoto(int id, [FromBody] UploadRoomPhotoRequest req)
        {
            var userId = GetCurrentUserId();
            var user = await _db.Users.FindAsync(userId);
            if (user == null) return Unauthorized(new { message = "User not found" });
            if (string.IsNullOrWhiteSpace(req.Base64Data)) return BadRequest(new { message = "Photo data is required" });

            try
            {
                var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "room_photos");
                if (!Directory.Exists(uploadsDir))
                {
                    Directory.CreateDirectory(uploadsDir);
                }

                var rawBase64 = req.Base64Data;
                var commaIdx = rawBase64.IndexOf(',');
                if (commaIdx >= 0)
                {
                    rawBase64 = rawBase64.Substring(commaIdx + 1);
                }

                var bytes = Convert.FromBase64String(rawBase64);
                var fileName = $"room_{id}_user_{userId}_{DateTime.UtcNow.Ticks}.jpg";
                var filePath = Path.Combine(uploadsDir, fileName);
                await System.IO.File.WriteAllBytesAsync(filePath, bytes);

                var relativeUrl = $"/uploads/room_photos/{fileName}";

                var msg = new RoomMessage
                {
                    RoomId = id,
                    SenderUserId = userId,
                    Content = string.IsNullOrWhiteSpace(req.Caption) ? "📷 Photo" : req.Caption,
                    MessageType = "Image",
                    SentAt = DateTime.UtcNow
                };
                _db.RoomMessages.Add(msg);
                await _db.SaveChangesAsync();

                var groupName = $"room_{id}";
                await _hubContext.Clients.Group(groupName).SendAsync("ReceiveChatMessage", new
                {
                    Id = msg.Id,
                    RoomId = id,
                    SenderId = userId,
                    SenderName = user.DisplayName,
                    SenderAvatar = user.AvatarUrl,
                    UserLevel = user.UserLevel,
                    Content = msg.Content,
                    ImageUrl = relativeUrl,
                    MessageType = "Image",
                    SentAt = msg.SentAt
                });

                return Ok(new { success = true, imageUrl = relativeUrl, messageId = msg.Id });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}
