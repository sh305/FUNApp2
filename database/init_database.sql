-- =====================================================================
-- YoYo Voice Chat Database Initialization Script
-- Target: Microsoft SQL Server (SSMS / .\MSSQLSERVER01)
-- Database Name: YoYoVoiceChatDb
-- =====================================================================

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'YoYoVoiceChatDb')
BEGIN
    CREATE DATABASE YoYoVoiceChatDb;
    PRINT 'Database YoYoVoiceChatDb created successfully.';
END
GO

USE YoYoVoiceChatDb;
GO

-- 1. Users Table
IF OBJECT_ID('dbo.Users', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Users (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Username NVARCHAR(100) NOT NULL UNIQUE,
        DisplayName NVARCHAR(150) NOT NULL,
        AvatarUrl NVARCHAR(500) NULL,
        PhoneNumber NVARCHAR(20) NULL,
        Email NVARCHAR(200) NULL,
        FacebookId NVARCHAR(100) NULL,
        AuthProvider NVARCHAR(50) NOT NULL DEFAULT 'Guest', -- 'Phone', 'Google', 'Facebook', 'Guest'
        Coins BIGINT NOT NULL DEFAULT 5000, -- Free welcome coins
        Diamonds BIGINT NOT NULL DEFAULT 100,
        UserLevel INT NOT NULL DEFAULT 1,
        UserExp BIGINT NOT NULL DEFAULT 0,
        ActiveFrameId INT NULL,
        IsPermanentBan BIT NOT NULL DEFAULT 0,
        BannedUntil DATETIME2 NULL,
        BanReason NVARCHAR(500) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX IX_Users_Phone ON dbo.Users(PhoneNumber);
    CREATE INDEX IX_Users_Email ON dbo.Users(Email);
    CREATE INDEX IX_Users_FacebookId ON dbo.Users(FacebookId);
    PRINT 'Table Users created.';
END
GO

-- 2. Frames Table (User Avatar Frames & Room Level Frames)
IF OBJECT_ID('dbo.Frames', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Frames (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(100) NOT NULL,
        Code NVARCHAR(50) NOT NULL UNIQUE,
        ImageUrl NVARCHAR(500) NOT NULL,
        BorderColor NVARCHAR(50) NOT NULL DEFAULT '#FFD700',
        GlowEffect NVARCHAR(100) NOT NULL DEFAULT 'box-shadow: 0 0 10px #FFD700',
        FrameType NVARCHAR(30) NOT NULL, -- 'UserLevel', 'RoomLevel', 'VIP'
        RequiredLevel INT NOT NULL DEFAULT 1,
        MinVip INT NOT NULL DEFAULT 0,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
    PRINT 'Table Frames created.';
END
GO

-- 3. Rooms Table
IF OBJECT_ID('dbo.Rooms', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Rooms (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        RoomNumber NVARCHAR(20) NOT NULL UNIQUE,
        Title NVARCHAR(200) NOT NULL,
        Description NVARCHAR(500) NULL,
        CoverUrl NVARCHAR(500) NULL,
        OwnerId INT NOT NULL FOREIGN KEY REFERENCES dbo.Users(Id),
        Category NVARCHAR(50) NOT NULL DEFAULT 'Chat', -- 'Chat', 'Music', 'Gaming', 'Dating'
        RoomLevel INT NOT NULL DEFAULT 1,
        RoomExp BIGINT NOT NULL DEFAULT 0,
        SeatCount INT NOT NULL DEFAULT 8, -- Starting seats 8
        IsLocked BIT NOT NULL DEFAULT 0, -- Lock/Unlock toggle
        PasswordHash NVARCHAR(256) NULL, -- Optional room PIN / Password
        ActiveFrameId INT NULL FOREIGN KEY REFERENCES dbo.Frames(Id),
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX IX_Rooms_OwnerId ON dbo.Rooms(OwnerId);
    PRINT 'Table Rooms created.';
END
GO

-- 4. Room Seats Table
IF OBJECT_ID('dbo.RoomSeats', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.RoomSeats (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        RoomId INT NOT NULL FOREIGN KEY REFERENCES dbo.Rooms(Id) ON DELETE CASCADE,
        SeatIndex INT NOT NULL, -- 0 to (SeatCount - 1)
        OccupantUserId INT NULL FOREIGN KEY REFERENCES dbo.Users(Id),
        IsMuted BIT NOT NULL DEFAULT 0,
        IsLocked BIT NOT NULL DEFAULT 0,
        OccupiedAt DATETIME2 NULL,
        CONSTRAINT UQ_Room_SeatIndex UNIQUE (RoomId, SeatIndex)
    );
    CREATE INDEX IX_RoomSeats_RoomId ON dbo.RoomSeats(RoomId);
    PRINT 'Table RoomSeats created.';
END
GO

-- 5. Gifts Catalog Table
IF OBJECT_ID('dbo.Gifts', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Gifts (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(100) NOT NULL,
        Code NVARCHAR(50) NOT NULL UNIQUE,
        IconUrl NVARCHAR(500) NOT NULL,
        AnimationType NVARCHAR(50) NOT NULL DEFAULT 'Pop', -- 'Pop', 'Float', 'FullscreenBanner', 'Fireworks'
        CoinPrice BIGINT NOT NULL,
        ExpValue BIGINT NOT NULL,
        Category NVARCHAR(50) NOT NULL DEFAULT 'Classic',
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
    PRINT 'Table Gifts created.';
END
GO

-- 6. Gift Transactions History
IF OBJECT_ID('dbo.GiftTransactions', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.GiftTransactions (
        Id BIGINT IDENTITY(1,1) PRIMARY KEY,
        SenderUserId INT NOT NULL FOREIGN KEY REFERENCES dbo.Users(Id),
        ReceiverUserId INT NOT NULL FOREIGN KEY REFERENCES dbo.Users(Id),
        RoomId INT NOT NULL FOREIGN KEY REFERENCES dbo.Rooms(Id),
        GiftId INT NOT NULL FOREIGN KEY REFERENCES dbo.Gifts(Id),
        Quantity INT NOT NULL DEFAULT 1,
        TotalCoins BIGINT NOT NULL,
        SentAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX IX_GiftTx_Sender ON dbo.GiftTransactions(SenderUserId);
    CREATE INDEX IX_GiftTx_Room ON dbo.GiftTransactions(RoomId);
    PRINT 'Table GiftTransactions created.';
END
GO

-- 7. User Reports (3 Days, 7 Days, Permanent ban support)
IF OBJECT_ID('dbo.UserReports', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.UserReports (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        ReporterUserId INT NOT NULL FOREIGN KEY REFERENCES dbo.Users(Id),
        ReportedUserId INT NOT NULL FOREIGN KEY REFERENCES dbo.Users(Id),
        Reason NVARCHAR(500) NOT NULL,
        DurationType NVARCHAR(30) NOT NULL, -- 'ThreeDays', 'SevenDays', 'Permanent'
        Status NVARCHAR(30) NOT NULL DEFAULT 'Pending', -- 'Pending', 'Applied', 'Dismissed'
        AppliedBanUntil DATETIME2 NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        ResolvedAt DATETIME2 NULL
    );
    CREATE INDEX IX_UserReports_ReportedUser ON dbo.UserReports(ReportedUserId);
    PRINT 'Table UserReports created.';
END
GO

-- 8. Room Kicks (3 Days vs Permanent kick from room)
IF OBJECT_ID('dbo.RoomKicks', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.RoomKicks (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        RoomId INT NOT NULL FOREIGN KEY REFERENCES dbo.Rooms(Id) ON DELETE CASCADE,
        UserId INT NOT NULL FOREIGN KEY REFERENCES dbo.Users(Id),
        KickedByUserId INT NOT NULL FOREIGN KEY REFERENCES dbo.Users(Id),
        KickType NVARCHAR(30) NOT NULL, -- 'ThreeDays', 'Permanent'
        KickedUntil DATETIME2 NULL, -- Calculated for ThreeDays: SYSUTCDATETIME() + 3 days; NULL for Permanent
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX IX_RoomKicks_Room_User ON dbo.RoomKicks(RoomId, UserId, IsActive);
    PRINT 'Table RoomKicks created.';
END
GO

-- 9. User Profile Block / Unblock Table
IF OBJECT_ID('dbo.UserBlocks', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.UserBlocks (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        BlockerUserId INT NOT NULL FOREIGN KEY REFERENCES dbo.Users(Id),
        BlockedUserId INT NOT NULL FOREIGN KEY REFERENCES dbo.Users(Id),
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT UQ_Block_Pair UNIQUE (BlockerUserId, BlockedUserId)
    );
    CREATE INDEX IX_UserBlocks_Blocker ON dbo.UserBlocks(BlockerUserId);
    CREATE INDEX IX_UserBlocks_Blocked ON dbo.UserBlocks(BlockedUserId);
    PRINT 'Table UserBlocks created.';
END
GO

-- 10. Room Chat Messages Table
IF OBJECT_ID('dbo.RoomMessages', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.RoomMessages (
        Id BIGINT IDENTITY(1,1) PRIMARY KEY,
        RoomId INT NOT NULL FOREIGN KEY REFERENCES dbo.Rooms(Id) ON DELETE CASCADE,
        SenderUserId INT NOT NULL FOREIGN KEY REFERENCES dbo.Users(Id),
        Content NVARCHAR(1000) NOT NULL,
        MessageType NVARCHAR(30) NOT NULL DEFAULT 'Text', -- 'Text', 'GiftAlert', 'SystemNotice'
        SentAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX IX_RoomMessages_RoomId ON dbo.RoomMessages(RoomId, SentAt DESC);
    PRINT 'Table RoomMessages created.';
END
GO

-- =====================================================================
-- Seed Data: Frames, Gifts & Demo Accounts
-- =====================================================================

-- Seed Frames
IF NOT EXISTS (SELECT 1 FROM dbo.Frames WHERE Code = 'FRAME_BRONZE')
BEGIN
    INSERT INTO dbo.Frames (Name, Code, ImageUrl, BorderColor, GlowEffect, FrameType, RequiredLevel, MinVip)
    VALUES 
    (N'Bronze Explorer', 'FRAME_BRONZE', 'https://api.dicebear.com/7.x/identicon/svg?seed=bronze', '#CD7F32', '0 0 10px #CD7F32', 'UserLevel', 1, 0),
    (N'Silver Knight', 'FRAME_SILVER', 'https://api.dicebear.com/7.x/identicon/svg?seed=silver', '#C0C0C0', '0 0 14px #E0E0E0', 'UserLevel', 5, 0),
    (N'Gold Sovereign', 'FRAME_GOLD', 'https://api.dicebear.com/7.x/identicon/svg?seed=gold', '#FFD700', '0 0 18px #FFD700', 'UserLevel', 12, 0),
    (N'Diamond Royalty', 'FRAME_DIAMOND', 'https://api.dicebear.com/7.x/identicon/svg?seed=diamond', '#00FFFF', '0 0 22px #00E5FF', 'UserLevel', 24, 1),
    (N'Royal Dragon Emperor', 'FRAME_DRAGON', 'https://api.dicebear.com/7.x/identicon/svg?seed=dragon', '#FF1493', '0 0 25px #FF0055', 'UserLevel', 36, 2),
    -- Room Level Frames
    (N'Neon Cyber Room', 'ROOM_FRAME_CYBER', 'https://api.dicebear.com/7.x/identicon/svg?seed=cyber', '#00FF88', '0 0 15px #00FF88', 'RoomLevel', 1, 0),
    (N'Golden Palace Room', 'ROOM_FRAME_PALACE', 'https://api.dicebear.com/7.x/identicon/svg?seed=palace', '#FFA500', '0 0 20px #FFA500', 'RoomLevel', 12, 0),
    (N'Galaxy Star Room', 'ROOM_FRAME_GALAXY', 'https://api.dicebear.com/7.x/identicon/svg?seed=galaxy', '#9400D3', '0 0 25px #8A2BE2', 'RoomLevel', 24, 0);
    PRINT 'Default Frames seeded.';
END
GO

-- Seed Gifts
IF NOT EXISTS (SELECT 1 FROM dbo.Gifts WHERE Code = 'GIFT_ROSE')
BEGIN
    INSERT INTO dbo.Gifts (Name, Code, IconUrl, AnimationType, CoinPrice, ExpValue, Category)
    VALUES 
    (N'Red Rose', 'GIFT_ROSE', '🌹', 'Pop', 10, 10, 'Popular'),
    (N'Love Heart', 'GIFT_HEART', '💖', 'Float', 50, 50, 'Popular'),
    (N'Teddy Bear', 'GIFT_BEAR', '🧸', 'Pop', 100, 100, 'Cute'),
    (N'Sports Car', 'GIFT_CAR', '🏎️', 'FullscreenBanner', 500, 500, 'Luxury'),
    (N'Super Rocket', 'GIFT_ROCKET', '🚀', 'FullscreenBanner', 2000, 2000, 'VIP'),
    (N'Royal Palace', 'GIFT_CASTLE', '🏰', 'Fireworks', 10000, 10000, 'Royal');
    PRINT 'Default Gifts seeded.';
END
GO

-- Seed Demo Users
IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE Username = 'admin_shivam')
BEGIN
    INSERT INTO dbo.Users (Username, DisplayName, AvatarUrl, PhoneNumber, Email, AuthProvider, Coins, Diamonds, UserLevel, UserExp, ActiveFrameId)
    VALUES 
    (N'admin_shivam', N'Shivam Rai (Owner)', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', '9876543210', 'shivam@yoyoapp.com', 'Phone', 500000, 10000, 25, 25000, 3),
    (N'priya_voice', N'Priya Sharma 🎵', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', '9876543211', 'priya@gmail.com', 'Google', 150000, 2500, 14, 14200, 2),
    (N'rahul_beats', N'Rahul DJ 🔥', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', '9876543212', 'rahul@facebook.com', 'Facebook', 80000, 1200, 8, 7500, 1),
    (N'guest_user_1', N'Royal King 👑', 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150', NULL, NULL, 'Guest', 50000, 500, 4, 3200, 1);
    PRINT 'Demo Users seeded.';
END
GO

-- Seed Default YoYo Room with 8 Seats
IF NOT EXISTS (SELECT 1 FROM dbo.Rooms WHERE RoomNumber = 'YOYO-777')
BEGIN
    DECLARE @OwnerId INT = (SELECT TOP 1 Id FROM dbo.Users WHERE Username = 'admin_shivam');
    DECLARE @RoomFrameId INT = (SELECT TOP 1 Id FROM dbo.Frames WHERE Code = 'ROOM_FRAME_PALACE');

    INSERT INTO dbo.Rooms (RoomNumber, Title, Description, CoverUrl, OwnerId, Category, RoomLevel, RoomExp, SeatCount, IsLocked, PasswordHash, ActiveFrameId)
    VALUES ('YOYO-777', N'🎙️ YoYo Global Musical Lounge', N'Welcome to the top voice room! Chat, sing & send gifts!', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400', @OwnerId, 'Music', 14, 15000, 10, 0, NULL, @RoomFrameId);

    DECLARE @RoomId INT = SCOPE_IDENTITY();

    -- Populate initial 10 seats for Level 14 (Level >= 12 gets 8 + (1*2) = 10 seats)
    DECLARE @SeatIdx INT = 0;
    WHILE @SeatIdx < 10
    BEGIN
        INSERT INTO dbo.RoomSeats (RoomId, SeatIndex, OccupantUserId, IsMuted, IsLocked)
        VALUES (@RoomId, @SeatIdx, CASE WHEN @SeatIdx = 0 THEN @OwnerId ELSE NULL END, 0, 0);
        SET @SeatIdx = @SeatIdx + 1;
    END

    PRINT 'Default YoYo Room YOYO-777 created with seats.';
END
GO

PRINT 'YoYoVoiceChatDb schema & seed script executed successfully.';
