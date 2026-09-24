using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YoYoVoiceChatApi.Models.Entities
{
    [Table("Users")]
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(100)]
        public string Username { get; set; } = string.Empty;

        [Required, MaxLength(150)]
        public string DisplayName { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? AvatarUrl { get; set; }

        [MaxLength(20)]
        public string? PhoneNumber { get; set; }

        [MaxLength(200)]
        public string? Email { get; set; }

        [MaxLength(100)]
        public string? FacebookId { get; set; }

        [MaxLength(50)]
        public string AuthProvider { get; set; } = "Guest";

        public long Coins { get; set; } = 5000;
        public long Diamonds { get; set; } = 100;

        public int UserLevel { get; set; } = 1;
        public long UserExp { get; set; } = 0;

        public int? ActiveFrameId { get; set; }

        public bool IsPermanentBan { get; set; } = false;
        public DateTime? BannedUntil { get; set; }

        [MaxLength(500)]
        public string? BanReason { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("ActiveFrameId")]
        public virtual Frame? ActiveFrame { get; set; }
    }

    [Table("Frames")]
    public class Frame
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required, MaxLength(50)]
        public string Code { get; set; } = string.Empty;

        [Required, MaxLength(500)]
        public string ImageUrl { get; set; } = string.Empty;

        [MaxLength(50)]
        public string BorderColor { get; set; } = "#FFD700";

        [MaxLength(100)]
        public string GlowEffect { get; set; } = "0 0 10px #FFD700";

        [Required, MaxLength(30)]
        public string FrameType { get; set; } = "UserLevel"; // UserLevel, RoomLevel, VIP

        public int RequiredLevel { get; set; } = 1;
        public int MinVip { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    [Table("Rooms")]
    public class Room
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(20)]
        public string RoomNumber { get; set; } = string.Empty;

        [Required, MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        [MaxLength(500)]
        public string? CoverUrl { get; set; }

        public int OwnerId { get; set; }

        [MaxLength(50)]
        public string Category { get; set; } = "Chat";

        public int RoomLevel { get; set; } = 1;
        public long RoomExp { get; set; } = 0;

        public int SeatCount { get; set; } = 8; // Starting seats 8
        public bool IsLocked { get; set; } = false;

        public long BoxPoints { get; set; } = 0; // Current points towards opening Lucky Room Box
        public int CurrentBoxLevel { get; set; } = 1; // 1 to 5 (12K, 60K, 200K, 400K, 800K)

        [MaxLength(256)]
        public string? PasswordHash { get; set; }

        public int? ActiveFrameId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("OwnerId")]
        public virtual User? Owner { get; set; }

        [ForeignKey("ActiveFrameId")]
        public virtual Frame? ActiveFrame { get; set; }

        public virtual ICollection<RoomSeat> Seats { get; set; } = new List<RoomSeat>();
    }

    [Table("RoomSeats")]
    public class RoomSeat
    {
        [Key]
        public int Id { get; set; }

        public int RoomId { get; set; }
        public int SeatIndex { get; set; } // 0 to SeatCount-1

        public int? OccupantUserId { get; set; }
        public bool IsMuted { get; set; } = false;
        public bool IsLocked { get; set; } = false;

        public DateTime? OccupiedAt { get; set; }

        [ForeignKey("RoomId")]
        public virtual Room? Room { get; set; }

        [ForeignKey("OccupantUserId")]
        public virtual User? OccupantUser { get; set; }
    }

    [Table("Gifts")]
    public class Gift
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required, MaxLength(50)]
        public string Code { get; set; } = string.Empty;

        [Required, MaxLength(500)]
        public string IconUrl { get; set; } = string.Empty;

        [MaxLength(50)]
        public string AnimationType { get; set; } = "Pop";

        public long CoinPrice { get; set; }
        public long ExpValue { get; set; }

        [MaxLength(50)]
        public string Category { get; set; } = "Classic";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    [Table("GiftTransactions")]
    public class GiftTransaction
    {
        [Key]
        public long Id { get; set; }

        public int SenderUserId { get; set; }
        public int ReceiverUserId { get; set; }
        public int RoomId { get; set; }
        public int GiftId { get; set; }

        public int Quantity { get; set; } = 1;
        public long TotalCoins { get; set; }

        public DateTime SentAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("SenderUserId")]
        public virtual User? Sender { get; set; }

        [ForeignKey("ReceiverUserId")]
        public virtual User? Receiver { get; set; }

        [ForeignKey("RoomId")]
        public virtual Room? Room { get; set; }

        [ForeignKey("GiftId")]
        public virtual Gift? Gift { get; set; }
    }

    [Table("UserReports")]
    public class UserReport
    {
        [Key]
        public int Id { get; set; }

        public int ReporterUserId { get; set; }
        public int ReportedUserId { get; set; }

        [Required, MaxLength(500)]
        public string Reason { get; set; } = string.Empty;

        [Required, MaxLength(30)]
        public string DurationType { get; set; } = "ThreeDays"; // ThreeDays, SevenDays, Permanent

        [MaxLength(30)]
        public string Status { get; set; } = "Pending";

        public DateTime? AppliedBanUntil { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ResolvedAt { get; set; }

        [ForeignKey("ReporterUserId")]
        public virtual User? Reporter { get; set; }

        [ForeignKey("ReportedUserId")]
        public virtual User? ReportedUser { get; set; }
    }

    [Table("RoomKicks")]
    public class RoomKick
    {
        [Key]
        public int Id { get; set; }

        public int RoomId { get; set; }
        public int UserId { get; set; }
        public int KickedByUserId { get; set; }

        [Required, MaxLength(30)]
        public string KickType { get; set; } = "ThreeDays"; // ThreeDays, Permanent

        public DateTime? KickedUntil { get; set; } // Null for permanent
        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("RoomId")]
        public virtual Room? Room { get; set; }

        [ForeignKey("UserId")]
        public virtual User? User { get; set; }

        [ForeignKey("KickedByUserId")]
        public virtual User? KickedByUser { get; set; }
    }

    [Table("UserBlocks")]
    public class UserBlock
    {
        [Key]
        public int Id { get; set; }

        public int BlockerUserId { get; set; }
        public int BlockedUserId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("BlockerUserId")]
        public virtual User? Blocker { get; set; }

        [ForeignKey("BlockedUserId")]
        public virtual User? Blocked { get; set; }
    }

    [Table("RoomMessages")]
    public class RoomMessage
    {
        [Key]
        public long Id { get; set; }

        public int RoomId { get; set; }
        public int SenderUserId { get; set; }

        [Required, MaxLength(1000)]
        public string Content { get; set; } = string.Empty;

        [MaxLength(30)]
        public string MessageType { get; set; } = "Text";

        public DateTime SentAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("RoomId")]
        public virtual Room? Room { get; set; }

        [ForeignKey("SenderUserId")]
        public virtual User? Sender { get; set; }
    }
}
