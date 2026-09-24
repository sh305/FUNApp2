using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using YoYoVoiceChatApi.Data;
using YoYoVoiceChatApi.Models.DTOs;
using YoYoVoiceChatApi.Models.Entities;

namespace YoYoVoiceChatApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ModerationController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public ModerationController(ApplicationDbContext db)
        {
            _db = db;
        }

        private int GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(claim, out var id) ? id : 0;
        }

        /// <summary>
        /// User Reporting with 3 options:
        /// 1. ThreeDays
        /// 2. SevenDays
        /// 3. Permanent
        /// "agar permanent kar diya kisi ko to wo user dubra kabhi application per apni us id sa nhi a paya ga"
        /// </summary>
        [HttpPost("report")]
        public async Task<IActionResult> ReportUser([FromBody] ReportUserRequest req)
        {
            var reporterId = GetCurrentUserId();

            if (reporterId == req.ReportedUserId)
            {
                return BadRequest("Aap khud ko report nahi kar sakte.");
            }

            var reportedUser = await _db.Users.FindAsync(req.ReportedUserId);
            if (reportedUser == null)
            {
                return NotFound("Reported user nahi mila.");
            }

            DateTime? banUntil = null;
            if (req.DurationType == "ThreeDays")
            {
                banUntil = DateTime.UtcNow.AddDays(3);
                reportedUser.BannedUntil = banUntil;
                reportedUser.BanReason = $"Reported: {req.Reason} (3 Days Ban)";
            }
            else if (req.DurationType == "SevenDays")
            {
                banUntil = DateTime.UtcNow.AddDays(7);
                reportedUser.BannedUntil = banUntil;
                reportedUser.BanReason = $"Reported: {req.Reason} (7 Days Ban)";
            }
            else if (req.DurationType == "Permanent")
            {
                reportedUser.IsPermanentBan = true;
                reportedUser.BanReason = $"Permanent Ban: {req.Reason}";
            }
            else
            {
                return BadRequest("Invalid duration type. Sirf 'ThreeDays', 'SevenDays' ya 'Permanent' allowed hai.");
            }

            var report = new UserReport
            {
                ReporterUserId = reporterId,
                ReportedUserId = req.ReportedUserId,
                Reason = req.Reason,
                DurationType = req.DurationType,
                Status = "Applied",
                AppliedBanUntil = banUntil,
                CreatedAt = DateTime.UtcNow,
                ResolvedAt = DateTime.UtcNow
            };

            _db.UserReports.Add(report);
            await _db.SaveChangesAsync();

            return Ok(new
            {
                Message = $"Report submit ho gaya hai aur user per {req.DurationType} ban successfully apply kar diya gaya hai.",
                DurationType = req.DurationType,
                BannedUntil = banUntil,
                IsPermanent = reportedUser.IsPermanentBan
            });
        }

        [HttpGet("reports-history")]
        public async Task<IActionResult> GetReportsHistory()
        {
            var reporterId = GetCurrentUserId();
            var reports = await _db.UserReports
                .Where(r => r.ReporterUserId == reporterId)
                .Include(r => r.ReportedUser)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new
                {
                    r.Id,
                    ReportedUserName = r.ReportedUser != null ? r.ReportedUser.DisplayName : "Unknown",
                    r.Reason,
                    r.DurationType,
                    r.Status,
                    r.CreatedAt
                })
                .ToListAsync();

            return Ok(reports);
        }
    }
}
