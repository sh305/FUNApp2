using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using YoYoVoiceChatApi.Models.Entities;

namespace YoYoVoiceChatApi.Data
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext db)
        {
            try
            {
                // 1. Create tables if they do not exist
                try
                {
                    var databaseCreator = db.Database.GetService<IDatabaseCreator>() as RelationalDatabaseCreator;
                    if (databaseCreator != null && !databaseCreator.HasTables())
                    {
                        databaseCreator.CreateTables();
                        Console.WriteLine("[DbInitializer] Tables created successfully.");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[DbInitializer] Table Check Info: {ex.Message}");
                }

                // 2. Seed Default Frames
                try
                {
                    if (!db.Frames.Any())
                    {
                        var frames = new List<Frame>
                        {
                            new Frame { Name = "Bronze Explorer", Code = "FRAME_BRONZE", ImageUrl = "https://api.dicebear.com/7.x/identicon/svg?seed=bronze", BorderColor = "#CD7F32", GlowEffect = "0 0 10px #CD7F32", FrameType = "UserLevel", RequiredLevel = 1, MinVip = 0 },
                            new Frame { Name = "Silver Knight", Code = "FRAME_SILVER", ImageUrl = "https://api.dicebear.com/7.x/identicon/svg?seed=silver", BorderColor = "#C0C0C0", GlowEffect = "0 0 14px #E0E0E0", FrameType = "UserLevel", RequiredLevel = 5, MinVip = 0 },
                            new Frame { Name = "Gold Sovereign", Code = "FRAME_GOLD", ImageUrl = "https://api.dicebear.com/7.x/identicon/svg?seed=gold", BorderColor = "#FFD700", GlowEffect = "0 0 18px #FFD700", FrameType = "UserLevel", RequiredLevel = 12, MinVip = 0 },
                            new Frame { Name = "Diamond Royalty", Code = "FRAME_DIAMOND", ImageUrl = "https://api.dicebear.com/7.x/identicon/svg?seed=diamond", BorderColor = "#00FFFF", GlowEffect = "0 0 22px #00E5FF", FrameType = "UserLevel", RequiredLevel = 24, MinVip = 1 },
                            new Frame { Name = "Royal Dragon Emperor", Code = "FRAME_DRAGON", ImageUrl = "https://api.dicebear.com/7.x/identicon/svg?seed=dragon", BorderColor = "#FF1493", GlowEffect = "0 0 25px #FF0055", FrameType = "UserLevel", RequiredLevel = 36, MinVip = 2 },
                            new Frame { Name = "Neon Cyber Room", Code = "ROOM_FRAME_CYBER", ImageUrl = "https://api.dicebear.com/7.x/identicon/svg?seed=cyber", BorderColor = "#00FF88", GlowEffect = "0 0 15px #00FF88", FrameType = "RoomLevel", RequiredLevel = 1, MinVip = 0 },
                            new Frame { Name = "Golden Palace Room", Code = "ROOM_FRAME_PALACE", ImageUrl = "https://api.dicebear.com/7.x/identicon/svg?seed=palace", BorderColor = "#FFA500", GlowEffect = "0 0 20px #FFA500", FrameType = "RoomLevel", RequiredLevel = 12, MinVip = 0 },
                            new Frame { Name = "Galaxy Star Room", Code = "ROOM_FRAME_GALAXY", ImageUrl = "https://api.dicebear.com/7.x/identicon/svg?seed=galaxy", BorderColor = "#9400D3", GlowEffect = "0 0 25px #8A2BE2", FrameType = "RoomLevel", RequiredLevel = 24, MinVip = 0 }
                        };
                        db.Frames.AddRange(frames);
                        db.SaveChanges();
                        Console.WriteLine("[DbInitializer] Default Frames seeded.");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[DbInitializer] Frames seed info: {ex.Message}");
                }

                // 3. Seed Default Gifts
                try
                {
                    if (!db.Gifts.Any())
                    {
                        var gifts = new List<Gift>
                        {
                            new Gift { Name = "Red Rose", Code = "GIFT_ROSE", IconUrl = "🌹", AnimationType = "Pop", CoinPrice = 10, ExpValue = 10, Category = "Popular" },
                            new Gift { Name = "Love Heart", Code = "GIFT_HEART", IconUrl = "💖", AnimationType = "Float", CoinPrice = 50, ExpValue = 50, Category = "Popular" },
                            new Gift { Name = "Teddy Bear", Code = "GIFT_BEAR", IconUrl = "🧸", AnimationType = "Pop", CoinPrice = 100, ExpValue = 100, Category = "Cute" },
                            new Gift { Name = "Sports Car", Code = "GIFT_CAR", IconUrl = "🏎️", AnimationType = "FullscreenBanner", CoinPrice = 500, ExpValue = 500, Category = "Luxury" },
                            new Gift { Name = "Super Rocket", Code = "GIFT_ROCKET", IconUrl = "🚀", AnimationType = "FullscreenBanner", CoinPrice = 2000, ExpValue = 2000, Category = "VIP" },
                            new Gift { Name = "Royal Palace", Code = "GIFT_CASTLE", IconUrl = "🏰", AnimationType = "Fireworks", CoinPrice = 10000, ExpValue = 10000, Category = "Royal" }
                        };
                        db.Gifts.AddRange(gifts);
                        db.SaveChanges();
                        Console.WriteLine("[DbInitializer] Default Gifts seeded.");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[DbInitializer] Gifts seed info: {ex.Message}");
                }

                // 4. Seed Demo Users
                try
                {
                    if (!db.Users.Any())
                    {
                        var users = new List<User>
                        {
                            new User
                            {
                                Username = "admin_shivam",
                                DisplayName = "Shivam Rai (Owner)",
                                AvatarUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
                                PhoneNumber = "9876543210",
                                Email = "shivam@yoyoapp.com",
                                AuthProvider = "Phone",
                                Coins = 500000,
                                Diamonds = 10000,
                                UserLevel = 25,
                                UserExp = 25000,
                                ActiveFrameId = db.Frames.FirstOrDefault(f => f.Code == "FRAME_GOLD")?.Id
                            },
                            new User
                            {
                                Username = "priya_voice",
                                DisplayName = "Priya Sharma 🎵",
                                AvatarUrl = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
                                PhoneNumber = "9876543211",
                                Email = "priya@gmail.com",
                                AuthProvider = "Google",
                                Coins = 150000,
                                Diamonds = 2500,
                                UserLevel = 14,
                                UserExp = 14200,
                                ActiveFrameId = db.Frames.FirstOrDefault(f => f.Code == "FRAME_SILVER")?.Id
                            }
                        };
                        db.Users.AddRange(users);
                        db.SaveChanges();
                        Console.WriteLine("[DbInitializer] Default Users seeded.");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[DbInitializer] Users seed info: {ex.Message}");
                }

                // 5. Seed Default Room
                try
                {
                    if (!db.Rooms.Any())
                    {
                        var owner = db.Users.FirstOrDefault(u => u.Username == "admin_shivam");
                        if (owner != null)
                        {
                            var roomFrame = db.Frames.FirstOrDefault(f => f.Code == "ROOM_FRAME_PALACE");
                            var room = new Room
                            {
                                RoomNumber = "YOYO-777",
                                Title = "🎙️ YoYo Global Musical Lounge",
                                Description = "Welcome to the top voice room! Chat, sing & send gifts!",
                                CoverUrl = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400",
                                OwnerId = owner.Id,
                                Category = "Music",
                                RoomLevel = 14,
                                RoomExp = 15000,
                                SeatCount = 12,
                                IsLocked = false,
                                ActiveFrameId = roomFrame?.Id
                            };
                            db.Rooms.Add(room);
                            db.SaveChanges();

                            // Seed initial seats
                            var seats = new List<RoomSeat>();
                            for (int i = 0; i < 12; i++)
                            {
                                seats.Add(new RoomSeat
                                {
                                    RoomId = room.Id,
                                    SeatIndex = i,
                                    OccupantUserId = (i == 0) ? owner.Id : null,
                                    IsMuted = false,
                                    IsLocked = false
                                });
                            }
                            db.RoomSeats.AddRange(seats);
                            db.SaveChanges();
                            Console.WriteLine("[DbInitializer] Default Room and Seats seeded.");
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[DbInitializer] Room seed info: {ex.Message}");
                }
            }
            catch (Exception globalEx)
            {
                Console.WriteLine($"[DbInitializer] Unexpected error during initialization: {globalEx.Message}");
            }
        }
    }
}
