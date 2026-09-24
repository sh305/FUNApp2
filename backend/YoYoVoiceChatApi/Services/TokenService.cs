using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using YoYoVoiceChatApi.Models.Entities;

namespace YoYoVoiceChatApi.Services
{
    public interface ITokenService
    {
        string GenerateJwtToken(User user);
    }

    public class TokenService : ITokenService
    {
        private readonly IConfiguration _config;

        public TokenService(IConfiguration config)
        {
            _config = config;
        }

        public string GenerateJwtToken(User user)
        {
            var secret = _config["JwtSettings:Secret"] ?? "YoYoVoiceChatSuperSecretSecurityKey_2026_EnterpriseGradeEncryptionKey!";
            var issuer = _config["JwtSettings:Issuer"] ?? "YoYoVoiceChatApi";
            var audience = _config["JwtSettings:Audience"] ?? "YoYoVoiceChatClient";
            var expiryDays = int.TryParse(_config["JwtSettings:ExpiryDays"], out var days) ? days : 30;

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim("displayName", user.DisplayName),
                new Claim("userLevel", user.UserLevel.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddDays(expiryDays),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
