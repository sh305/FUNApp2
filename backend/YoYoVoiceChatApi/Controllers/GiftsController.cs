using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using YoYoVoiceChatApi.Data;
using YoYoVoiceChatApi.Models.DTOs;
using YoYoVoiceChatApi.Services;

namespace YoYoVoiceChatApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class GiftsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly IGiftService _giftService;

        public GiftsController(ApplicationDbContext db, IGiftService giftService)
        {
            _db = db;
            _giftService = giftService;
        }

        private int GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(claim, out var id) ? id : 0;
        }

        [HttpGet]
        public async Task<IActionResult> GetGifts()
        {
            var gifts = await _db.Gifts
                .OrderBy(g => g.CoinPrice)
                .Select(g => new GiftDto
                {
                    Id = g.Id,
                    Name = g.Name,
                    Code = g.Code,
                    IconUrl = g.IconUrl,
                    AnimationType = g.AnimationType,
                    CoinPrice = g.CoinPrice,
                    ExpValue = g.ExpValue,
                    Category = g.Category
                })
                .ToListAsync();

            return Ok(gifts);
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendGift([FromBody] SendGiftRequest req)
        {
            var senderId = GetCurrentUserId();
            var result = await _giftService.SendGiftAsync(senderId, req);

            if (!result.Success)
            {
                return BadRequest(new { Message = result.Message });
            }

            return Ok(new
            {
                Message = result.Message,
                EventData = result.EventData
            });
        }
    }
}
