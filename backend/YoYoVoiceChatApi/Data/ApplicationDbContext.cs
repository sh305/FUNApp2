using Microsoft.EntityFrameworkCore;
using YoYoVoiceChatApi.Models.Entities;

namespace YoYoVoiceChatApi.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<Frame> Frames => Set<Frame>();
        public DbSet<Room> Rooms => Set<Room>();
        public DbSet<RoomSeat> RoomSeats => Set<RoomSeat>();
        public DbSet<Gift> Gifts => Set<Gift>();
        public DbSet<GiftTransaction> GiftTransactions => Set<GiftTransaction>();
        public DbSet<UserReport> UserReports => Set<UserReport>();
        public DbSet<RoomKick> RoomKicks => Set<RoomKick>();
        public DbSet<UserBlock> UserBlocks => Set<UserBlock>();
        public DbSet<RoomMessage> RoomMessages => Set<RoomMessage>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // RoomSeat Unique constraint on (RoomId, SeatIndex)
            modelBuilder.Entity<RoomSeat>()
                .HasIndex(s => new { s.RoomId, s.SeatIndex })
                .IsUnique();

            // UserBlock Unique constraint on (BlockerUserId, BlockedUserId)
            modelBuilder.Entity<UserBlock>()
                .HasIndex(b => new { b.BlockerUserId, b.BlockedUserId })
                .IsUnique();

            // Configure Delete Behaviours to avoid cycles in SQL Server
            modelBuilder.Entity<Room>()
                .HasOne(r => r.Owner)
                .WithMany()
                .HasForeignKey(r => r.OwnerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RoomSeat>()
                .HasOne(s => s.Room)
                .WithMany(r => r.Seats)
                .HasForeignKey(s => s.RoomId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<RoomSeat>()
                .HasOne(s => s.OccupantUser)
                .WithMany()
                .HasForeignKey(s => s.OccupantUserId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<GiftTransaction>()
                .HasOne(g => g.Sender)
                .WithMany()
                .HasForeignKey(g => g.SenderUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<GiftTransaction>()
                .HasOne(g => g.Receiver)
                .WithMany()
                .HasForeignKey(g => g.ReceiverUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<UserReport>()
                .HasOne(r => r.Reporter)
                .WithMany()
                .HasForeignKey(r => r.ReporterUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<UserReport>()
                .HasOne(r => r.ReportedUser)
                .WithMany()
                .HasForeignKey(r => r.ReportedUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RoomKick>()
                .HasOne(k => k.User)
                .WithMany()
                .HasForeignKey(k => k.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RoomKick>()
                .HasOne(k => k.KickedByUser)
                .WithMany()
                .HasForeignKey(k => k.KickedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<UserBlock>()
                .HasOne(b => b.Blocker)
                .WithMany()
                .HasForeignKey(b => b.BlockerUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<UserBlock>()
                .HasOne(b => b.Blocked)
                .WithMany()
                .HasForeignKey(b => b.BlockedUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RoomMessage>()
                .HasOne(m => m.Sender)
                .WithMany()
                .HasForeignKey(m => m.SenderUserId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
