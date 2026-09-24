using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using YoYoVoiceChatApi.Data;
using YoYoVoiceChatApi.Models.DTOs;
using YoYoVoiceChatApi.Models.Entities;
using YoYoVoiceChatApi.Services;

namespace YoYoVoiceChatApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly ITokenService _tokenService;

        public AuthController(ApplicationDbContext db, ITokenService tokenService)
        {
            _db = db;
            _tokenService = tokenService;
        }

        private (bool IsBanned, string BanMessage) CheckBan(User user)
        {
            if (user.IsPermanentBan)
            {
                return (true, "Aapki ID permanently ban kar di gayi hai. Aap dubara login nahi kar sakte.");
            }
            if (user.BannedUntil.HasValue && user.BannedUntil.Value > DateTime.UtcNow)
            {
                var remaining = user.BannedUntil.Value - DateTime.UtcNow;
                return (true, $"Aapki ID ban hai. Bacha hua samay: {remaining.Days} din {remaining.Hours} ghante. Reason: {user.BanReason}");
            }
            return (false, string.Empty);
        }

        [HttpPost("phone-login")]
        public async Task<IActionResult> PhoneLogin([FromBody] PhoneLoginRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.PhoneNumber))
            {
                return BadRequest("Phone number zaroori hai.");
            }

            var cleanPhone = req.PhoneNumber.Trim();
            var user = await _db.Users.Include(u => u.ActiveFrame).FirstOrDefaultAsync(u => u.PhoneNumber == cleanPhone);

            if (user == null)
            {
                // Register new user with initial 5000 coins
                user = new User
                {
                    PhoneNumber = cleanPhone,
                    Username = $"user_{cleanPhone[^Math.Min(4, cleanPhone.Length)..]}_{Random.Shared.Next(100, 999)}",
                    DisplayName = req.DisplayName ?? $"YoYo Star {cleanPhone[^Math.Min(4, cleanPhone.Length)..]}",
                    AvatarUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
                    AuthProvider = "Phone",
                    Coins = 5000,
                    Diamonds = 100,
                    UserLevel = 1,
                    ActiveFrameId = 1
                };
                _db.Users.Add(user);
                await _db.SaveChangesAsync();
            }

            var banCheck = CheckBan(user);
            if (banCheck.IsBanned)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { Error = "UserBanned", Message = banCheck.BanMessage });
            }

            var token = _tokenService.GenerateJwtToken(user);
            return Ok(new AuthResponse
            {
                Token = token,
                User = MapUserDto(user)
            });
        }

        [HttpPost("google-login")]
        public async Task<IActionResult> GoogleLogin([FromBody] SocialLoginRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Email) && string.IsNullOrWhiteSpace(req.SocialId))
            {
                return BadRequest("Google account details zaroori hain.");
            }

            var user = await _db.Users.Include(u => u.ActiveFrame).FirstOrDefaultAsync(u => u.Email == req.Email);
            if (user == null)
            {
                user = new User
                {
                    Email = req.Email,
                    Username = $"g_{Random.Shared.Next(1000, 9999)}",
                    DisplayName = string.IsNullOrWhiteSpace(req.DisplayName) ? "Google User" : req.DisplayName,
                    AvatarUrl = req.AvatarUrl ?? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
                    AuthProvider = "Google",
                    Coins = 5000,
                    Diamonds = 100,
                    UserLevel = 1,
                    ActiveFrameId = 1
                };
                _db.Users.Add(user);
                await _db.SaveChangesAsync();
            }

            var banCheck = CheckBan(user);
            if (banCheck.IsBanned)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { Error = "UserBanned", Message = banCheck.BanMessage });
            }

            var token = _tokenService.GenerateJwtToken(user);
            return Ok(new AuthResponse
            {
                Token = token,
                User = MapUserDto(user)
            });
        }

        [HttpPost("facebook-login")]
        public async Task<IActionResult> FacebookLogin([FromBody] SocialLoginRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.SocialId))
            {
                return BadRequest("Facebook ID zaroori hai.");
            }

            var user = await _db.Users.Include(u => u.ActiveFrame).FirstOrDefaultAsync(u => u.FacebookId == req.SocialId);
            if (user == null)
            {
                user = new User
                {
                    FacebookId = req.SocialId,
                    Username = $"fb_{Random.Shared.Next(1000, 9999)}",
                    DisplayName = string.IsNullOrWhiteSpace(req.DisplayName) ? "Facebook Friend" : req.DisplayName,
                    AvatarUrl = req.AvatarUrl ?? "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150",
                    AuthProvider = "Facebook",
                    Coins = 5000,
                    Diamonds = 100,
                    UserLevel = 1,
                    ActiveFrameId = 1
                };
                _db.Users.Add(user);
                await _db.SaveChangesAsync();
            }

            var banCheck = CheckBan(user);
            if (banCheck.IsBanned)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { Error = "UserBanned", Message = banCheck.BanMessage });
            }

            var token = _tokenService.GenerateJwtToken(user);
            return Ok(new AuthResponse
            {
                Token = token,
                User = MapUserDto(user)
            });
        }

        [HttpPost("guest-login")]
        public async Task<IActionResult> GuestLogin([FromBody] GuestLoginRequest req)
        {
            var guestNumber = Random.Shared.Next(1000, 9999);
            var user = new User
            {
                Username = $"guest_{guestNumber}",
                DisplayName = req.PreferredName ?? $"Guest Explorer #{guestNumber}",
                AvatarUrl = "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150",
                AuthProvider = "Guest",
                Coins = 5000,
                Diamonds = 50,
                UserLevel = 1,
                ActiveFrameId = 1
            };
            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            var token = _tokenService.GenerateJwtToken(user);
            return Ok(new AuthResponse
            {
                Token = token,
                User = MapUserDto(user)
            });
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
