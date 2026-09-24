using System.Security.Claims;
using YoYoVoiceChatApi.Data;

namespace YoYoVoiceChatApi.Middleware
{
    public class BanEnforcementMiddleware
    {
        private readonly RequestDelegate _next;

        public BanEnforcementMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, ApplicationDbContext db)
        {
            var path = context.Request.Path.Value?.ToLower() ?? string.Empty;

            // Allow auth endpoints and static assets without blocking
            if (path.StartsWith("/api/auth") || path.StartsWith("/swagger") || path.StartsWith("/hubs"))
            {
                await _next(context);
                return;
            }

            if (context.User.Identity?.IsAuthenticated == true)
            {
                var claim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (int.TryParse(claim, out var userId))
                {
                    var user = await db.Users.FindAsync(userId);
                    if (user != null)
                    {
                        if (user.IsPermanentBan)
                        {
                            context.Response.StatusCode = StatusCodes.Status403Forbidden;
                            context.Response.ContentType = "application/json";
                            await context.Response.WriteAsJsonAsync(new
                            {
                                Error = "PermanentlyBanned",
                                Message = "Aapki ID permanent ban kar di gayi hai. Aap is ID se dubara application use nahi kar sakte."
                            });
                            return;
                        }

                        if (user.BannedUntil.HasValue && user.BannedUntil.Value > DateTime.UtcNow)
                        {
                            var remaining = user.BannedUntil.Value - DateTime.UtcNow;
                            context.Response.StatusCode = StatusCodes.Status403Forbidden;
                            context.Response.ContentType = "application/json";
                            await context.Response.WriteAsJsonAsync(new
                            {
                                Error = "TemporarilyBanned",
                                Message = $"Aapki ID ban hai. Remaining duration: {remaining.Days}d {remaining.Hours}h {remaining.Minutes}m. Reason: {user.BanReason}",
                                BannedUntil = user.BannedUntil.Value
                            });
                            return;
                        }
                    }
                }
            }

            await _next(context);
        }
    }
}
