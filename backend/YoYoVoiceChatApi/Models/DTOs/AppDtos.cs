namespace YoYoVoiceChatApi.Models.DTOs
{
    // Auth DTOs
    public class PhoneLoginRequest
    {
        public string PhoneNumber { get; set; } = string.Empty;
        public string OtpCode { get; set; } = "123456"; // Default/Mock OTP for quick verification
        public string? DisplayName { get; set; }
    }

    public class SocialLoginRequest
    {
        public string Provider { get; set; } = "Google"; // 'Google' or 'Facebook'
        public string SocialId { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string DisplayName { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
    }

    public class GuestLoginRequest
    {
        public string? DeviceId { get; set; }
        public string? PreferredName { get; set; }
    }

    public class AuthResponse
    {
        public string Token { get; set; } = string.Empty;
        public UserDto User { get; set; } = new();
    }

    public class UserDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Email { get; set; }
        public string AuthProvider { get; set; } = "Guest";
        public long Coins { get; set; }
        public long Diamonds { get; set; }
        public int UserLevel { get; set; }
        public long UserExp { get; set; }
        public int? ActiveFrameId { get; set; }
        public FrameDto? ActiveFrame { get; set; }
        public bool IsPermanentBan { get; set; }
        public DateTime? BannedUntil { get; set; }
        public string? BanReason { get; set; }
    }

    // Room DTOs
    public class CreateRoomRequest
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? CoverUrl { get; set; }
        public string Category { get; set; } = "Chat";
        public bool IsLocked { get; set; } = false;
        public string? Password { get; set; }
    }

    public class LockRoomRequest
    {
        public string Password { get; set; } = string.Empty;
    }

    public class JoinRoomRequest
    {
        public string? Password { get; set; }
    }

    public class RoomSummaryDto
    {
        public int Id { get; set; }
        public string RoomNumber { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? CoverUrl { get; set; }
        public string Category { get; set; } = "Chat";
        public int RoomLevel { get; set; }
        public int SeatCount { get; set; }
        public int OccupiedSeatsCount { get; set; }
        public bool IsLocked { get; set; }
        public int OwnerId { get; set; }
        public string OwnerName { get; set; } = string.Empty;
        public string? OwnerAvatar { get; set; }
        public FrameDto? ActiveFrame { get; set; }
    }

    public class RoomDetailDto
    {
        public int Id { get; set; }
        public string RoomNumber { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? CoverUrl { get; set; }
        public int OwnerId { get; set; }
        public UserDto? Owner { get; set; }
        public string Category { get; set; } = "Chat";
        public int RoomLevel { get; set; }
        public long RoomExp { get; set; }
        public int SeatCount { get; set; }
        public bool IsLocked { get; set; }
        public long BoxPoints { get; set; }
        public int CurrentBoxLevel { get; set; } = 1;
        public long BoxThreshold { get; set; } = 12000;
        public bool BoxCanClaim { get; set; }
        public FrameDto? ActiveFrame { get; set; }
        public List<SeatDto> Seats { get; set; } = new();
    }

    public class ClaimBoxRewardDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public int ClaimedBoxLevel { get; set; }
        public long CoinsEarned { get; set; }
        public string FrameUnlocked { get; set; } = string.Empty;
        public string AnimationUnlocked { get; set; } = string.Empty;
        public int NextBoxLevel { get; set; }
        public long NextThreshold { get; set; }
    }

    public class SeatDto
    {
        public int SeatIndex { get; set; }
        public int? OccupantUserId { get; set; }
        public UserDto? Occupant { get; set; }
        public bool IsMuted { get; set; }
        public bool IsLocked { get; set; }
        public DateTime? OccupiedAt { get; set; }
    }

    public class SeatActionRequest
    {
        public int SeatIndex { get; set; }
    }

    // Gift DTOs
    public class SendGiftRequest
    {
        public int RoomId { get; set; }
        public int ReceiverUserId { get; set; }
        public int GiftId { get; set; }
        public int Quantity { get; set; } = 1;
    }

    public class GiftDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string IconUrl { get; set; } = string.Empty;
        public string AnimationType { get; set; } = "Pop";
        public long CoinPrice { get; set; }
        public long ExpValue { get; set; }
        public string Category { get; set; } = "Popular";
    }

    public class GiftBroadcastEvent
    {
        public int RoomId { get; set; }
        public int SenderId { get; set; }
        public string SenderName { get; set; } = string.Empty;
        public string? SenderAvatar { get; set; }
        public int ReceiverId { get; set; }
        public string ReceiverName { get; set; } = string.Empty;
        public GiftDto Gift { get; set; } = new();
        public int Quantity { get; set; }
        public long TotalCoins { get; set; }
        public DateTime SentAt { get; set; }
        public int NewRoomLevel { get; set; }
        public int NewSeatCount { get; set; }
    }

    // Moderation DTOs
    public class ReportUserRequest
    {
        public int ReportedUserId { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string DurationType { get; set; } = "ThreeDays"; // ThreeDays, SevenDays, Permanent
    }

    public class KickUserRequest
    {
        public int RoomId { get; set; }
        public int UserId { get; set; }
        public string KickType { get; set; } = "ThreeDays"; // ThreeDays, Permanent
    }

    public class RoomKickDto
    {
        public int Id { get; set; }
        public int RoomId { get; set; }
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public string KickType { get; set; } = string.Empty;
        public DateTime? KickedUntil { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class BlockUserRequest
    {
        public int TargetUserId { get; set; }
    }

    // Frame DTOs
    public class FrameDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public string BorderColor { get; set; } = "#FFD700";
        public string GlowEffect { get; set; } = "0 0 10px #FFD700";
        public string FrameType { get; set; } = "UserLevel";
        public int RequiredLevel { get; set; }
        public int MinVip { get; set; }
    }

    public class SetActiveFrameRequest
    {
        public int? FrameId { get; set; }
    }

    public class SendChatMessageRequest
    {
        public int RoomId { get; set; }
        public string Content { get; set; } = string.Empty;
    }

    public class UploadRoomPhotoRequest
    {
        public string? Base64Data { get; set; }
        public string? Caption { get; set; }
    }
}
