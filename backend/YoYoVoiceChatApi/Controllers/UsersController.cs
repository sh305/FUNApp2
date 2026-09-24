using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using YoYoVoiceChatApi.Data;
using YoYoVoiceChatApi.Models.DTOs;
using YoYoVoiceChatApi.Models.Entities;
using YoYoVoiceChatApi.Services;

namespace YoYoVoiceChatApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly ICacheService _cache;

        public UsersController(ApplicationDbContext db, ICacheService cache)
        {
            _db = db;
            _cache = cache;
        }

        private int GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(claim, out var id) ? id : 0;
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = GetCurrentUserId();
            var user = await _db.Users
                .Include(u => u.ActiveFrame)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null) return NotFound("User nahi mila.");

            return Ok(MapUserDto(user));
        }

        /// <summary>
        /// User Profile Visit Check:
        /// "agar koi kisi user ki I'd ko block kra to wo jab tak us user ko unblock na kra
        /// tab tak jo block user ha wo us person ki I'd visit na kar paya"
        /// </summary>
        [HttpGet("{targetUserId}")]
        public async Task<IActionResult> GetUserProfile(int targetUserId)
        {
            var currentUserId = GetCurrentUserId();

            // Check if the target user has blocked current user
            var isBlocked = await _db.UserBlocks
                .AnyAsync(b => b.BlockerUserId == targetUserId && b.BlockedUserId == currentUserId);

            if (isBlocked)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new
                {
                    Error = "ProfileAccessBlocked",
                    Message = "Aap is user ki ID visit nahi kar sakte kyunki is user ne aapko block kar rakha hai."
                });
            }

            var target = await _db.Users
                .Include(u => u.ActiveFrame)
                .FirstOrDefaultAsync(u => u.Id == targetUserId);

            if (target == null) return NotFound("User nahi mila.");

            // Also check if current user has blocked target user
            var currentUserBlockedTarget = await _db.UserBlocks
                .AnyAsync(b => b.BlockerUserId == currentUserId && b.BlockedUserId == targetUserId);

            return Ok(new
            {
                User = MapUserDto(target),
                IsBlockedByYou = currentUserBlockedTarget
            });
        }

        [HttpPost("{targetUserId}/block")]
        public async Task<IActionResult> BlockUser(int targetUserId)
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId == targetUserId)
            {
                return BadRequest("Aap khud ko block nahi kar sakte.");
            }

            var exists = await _db.UserBlocks.AnyAsync(b => b.BlockerUserId == currentUserId && b.BlockedUserId == targetUserId);
            if (!exists)
            {
                _db.UserBlocks.Add(new UserBlock
                {
                    BlockerUserId = currentUserId,
                    BlockedUserId = targetUserId,
                    CreatedAt = DateTime.UtcNow
                });
                await _db.SaveChangesAsync();
                _cache.SetUserBlocked(currentUserId, targetUserId, true);
            }

            return Ok(new { Message = "User successfully block ho gaya hai." });
        }

        [HttpDelete("{targetUserId}/block")]
        public async Task<IActionResult> UnblockUser(int targetUserId)
        {
            var currentUserId = GetCurrentUserId();
            var blockRecord = await _db.UserBlocks
                .FirstOrDefaultAsync(b => b.BlockerUserId == currentUserId && b.BlockedUserId == targetUserId);

            if (blockRecord != null)
            {
                _db.UserBlocks.Remove(blockRecord);
                await _db.SaveChangesAsync();
                _cache.SetUserBlocked(currentUserId, targetUserId, false);
            }

            return Ok(new { Message = "User successfully unblock ho gaya hai." });
        }

        [HttpGet("blocked-list")]
        public async Task<IActionResult> GetBlockedList()
        {
            var currentUserId = GetCurrentUserId();
            var blockedUsers = await _db.UserBlocks
                .Where(b => b.BlockerUserId == currentUserId)
                .Include(b => b.Blocked)
                .OrderByDescending(b => b.CreatedAt)
                .Select(b => new UserDto
                {
                    Id = b.Blocked!.Id,
                    Username = b.Blocked.Username,
                    DisplayName = b.Blocked.DisplayName,
                    AvatarUrl = b.Blocked.AvatarUrl,
                    UserLevel = b.Blocked.UserLevel
                })
                .ToListAsync();

            return Ok(blockedUsers);
        }

        [HttpGet("frames")]
        public async Task<IActionResult> GetAvailableFrames()
        {
            var currentUserId = GetCurrentUserId();
            var user = await _db.Users.FindAsync(currentUserId);
            var userLevel = user?.UserLevel ?? 1;

            var frames = await _db.Frames
                .OrderBy(f => f.RequiredLevel)
                .Select(f => new
                {
                    f.Id,
                    f.Name,
                    f.Code,
                    f.ImageUrl,
                    f.BorderColor,
                    f.GlowEffect,
                    f.FrameType,
                    f.RequiredLevel,
                    IsUnlocked = userLevel >= f.RequiredLevel
                })
                .ToListAsync();

            return Ok(frames);
        }

        [HttpPost("frames/select")]
        public async Task<IActionResult> SelectActiveFrame([FromBody] SetActiveFrameRequest req)
        {
            var currentUserId = GetCurrentUserId();
            var user = await _db.Users.FindAsync(currentUserId);
            if (user == null) return NotFound();

            if (req.FrameId.HasValue)
            {
                var frame = await _db.Frames.FindAsync(req.FrameId.Value);
                if (frame == null) return NotFound("Frame nahi mila.");

                if (user.UserLevel < frame.RequiredLevel)
                {
                    return BadRequest($"Yeh frame unlock karne ke liye Level {frame.RequiredLevel} zaroori hai.");
                }

                user.ActiveFrameId = frame.Id;
            }
            else
            {
                user.ActiveFrameId = null;
            }

            await _db.SaveChangesAsync();
            return Ok(new { Message = "Frame successfully update ho gaya hai.", ActiveFrameId = user.ActiveFrameId });
        }

        private static UserDto MapUserDto(User user)
        {
            return new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                DisplayName = user.DisplayName,
                AvatarUrl = user.AvatarUrl,
                PhoneNumber = user.PhoneNumber,
                Email = user.Email,
                AuthProvider = user.AuthProvider,
                Coins = user.Coins,
                Diamonds = user.Diamonds,
                UserLevel = user.UserLevel,
                UserExp = user.UserExp,
                ActiveFrameId = user.ActiveFrameId,
                ActiveFrame = user.ActiveFrame != null ? new FrameDto
                {
                    Id = user.ActiveFrame.Id,
                    Name = user.ActiveFrame.Name,
                    Code = user.ActiveFrame.Code,
                    ImageUrl = user.ActiveFrame.ImageUrl,
                    BorderColor = user.ActiveFrame.BorderColor,
                    GlowEffect = user.ActiveFrame.GlowEffect,
                    FrameType = user.ActiveFrame.FrameType,
                    RequiredLevel = user.ActiveFrame.RequiredLevel
                } : null,
                IsPermanentBan = user.IsPermanentBan,
                BannedUntil = user.BannedUntil,
                BanReason = user.BanReason
            };
        }
    }
}
