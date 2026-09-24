using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using YoYoVoiceChatApi.Services;

namespace YoYoVoiceChatApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AgoraController : ControllerBase
    {
        private readonly IAgoraTokenService _agoraService;

        public AgoraController(IAgoraTokenService agoraService)
        {
            _agoraService = agoraService;
        }

        [HttpGet("config")]
        public IActionResult GetConfig()
        {
            var appId = _agoraService.GetAppId();
            return Ok(new
            {
                appId,
                isConfigured = !string.IsNullOrWhiteSpace(appId) && appId != "YOUR_AGORA_APP_ID"
            });
        }

        [Authorize]
        [HttpGet("token")]
        public IActionResult GetToken([FromQuery] int roomId, [FromQuery] int role = 1)
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!uint.TryParse(claim, out var uid))
            {
                return Unauthorized(new { message = "Invalid user identification" });
            }

            var channelName = $"room_{roomId}";
            var token = _agoraService.GenerateRtcToken(channelName, uid, role);
            var appId = _agoraService.GetAppId();

            return Ok(new
            {
                appId,
                channelName,
                uid,
                token
            });
        }
    }
}
