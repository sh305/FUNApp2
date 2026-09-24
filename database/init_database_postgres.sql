CREATE TABLE IF NOT EXISTS "Frames" (
    "Id" SERIAL PRIMARY KEY,
    "Name" VARCHAR(100) NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "ImageUrl" VARCHAR(500) NOT NULL,
    "BorderColor" VARCHAR(50) DEFAULT '#FFD700',
    "GlowEffect" VARCHAR(100) DEFAULT '0 0 10px #FFD700',
    "FrameType" VARCHAR(30) NOT NULL DEFAULT 'UserLevel',
    "RequiredLevel" INTEGER NOT NULL DEFAULT 1,
    "MinVip" INTEGER NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Users" (
    "Id" SERIAL PRIMARY KEY,
    "Username" VARCHAR(100) NOT NULL,
    "DisplayName" VARCHAR(150) NOT NULL,
    "AvatarUrl" VARCHAR(500),
    "PhoneNumber" VARCHAR(20),
    "Email" VARCHAR(200),
    "FacebookId" VARCHAR(100),
    "AuthProvider" VARCHAR(50) NOT NULL DEFAULT 'Guest',
    "Coins" BIGINT NOT NULL DEFAULT 5000,
    "Diamonds" BIGINT NOT NULL DEFAULT 100,
    "UserLevel" INTEGER NOT NULL DEFAULT 1,
    "UserExp" BIGINT NOT NULL DEFAULT 0,
    "ActiveFrameId" INTEGER,
    "IsPermanentBan" BOOLEAN NOT NULL DEFAULT FALSE,
    "BannedUntil" TIMESTAMPTZ,
    "BanReason" VARCHAR(500),
    "CreatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "FK_Users_Frames" FOREIGN KEY ("ActiveFrameId") REFERENCES "Frames"("Id")
);

CREATE TABLE IF NOT EXISTS "Rooms" (
    "Id" SERIAL PRIMARY KEY,
    "RoomNumber" VARCHAR(20) NOT NULL,
    "Title" VARCHAR(200) NOT NULL,
    "Description" VARCHAR(500),
    "CoverUrl" VARCHAR(500),
    "OwnerId" INTEGER NOT NULL,
    "Category" VARCHAR(50) NOT NULL DEFAULT 'Chat',
    "RoomLevel" INTEGER NOT NULL DEFAULT 1,
    "RoomExp" BIGINT NOT NULL DEFAULT 0,
    "SeatCount" INTEGER NOT NULL DEFAULT 8,
    "IsLocked" BOOLEAN NOT NULL DEFAULT FALSE,
    "BoxPoints" BIGINT NOT NULL DEFAULT 0,
    "CurrentBoxLevel" INTEGER NOT NULL DEFAULT 1,
    "PasswordHash" VARCHAR(256),
    "ActiveFrameId" INTEGER,
    "CreatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "FK_Rooms_Users" FOREIGN KEY ("OwnerId") REFERENCES "Users"("Id"),
    CONSTRAINT "FK_Rooms_Frames" FOREIGN KEY ("ActiveFrameId") REFERENCES "Frames"("Id")
);

CREATE TABLE IF NOT EXISTS "RoomSeats" (
    "Id" SERIAL PRIMARY KEY,
    "RoomId" INTEGER NOT NULL,
    "SeatIndex" INTEGER NOT NULL,
    "OccupantUserId" INTEGER,
    "IsMuted" BOOLEAN NOT NULL DEFAULT FALSE,
    "IsLocked" BOOLEAN NOT NULL DEFAULT FALSE,
    "OccupiedAt" TIMESTAMPTZ,
    CONSTRAINT "FK_RoomSeats_Rooms" FOREIGN KEY ("RoomId") REFERENCES "Rooms"("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_RoomSeats_Users" FOREIGN KEY ("OccupantUserId") REFERENCES "Users"("Id") ON DELETE SET NULL,
    CONSTRAINT "UQ_RoomSeats_Room_Seat" UNIQUE ("RoomId", "SeatIndex")
);

CREATE TABLE IF NOT EXISTS "Gifts" (
    "Id" SERIAL PRIMARY KEY,
    "Name" VARCHAR(100) NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "IconUrl" VARCHAR(500) NOT NULL,
    "AnimationType" VARCHAR(50) NOT NULL DEFAULT 'Pop',
    "CoinPrice" BIGINT NOT NULL,
    "ExpValue" BIGINT NOT NULL,
    "Category" VARCHAR(50) NOT NULL DEFAULT 'Classic',
    "CreatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "GiftTransactions" (
    "Id" BIGSERIAL PRIMARY KEY,
    "SenderUserId" INTEGER NOT NULL,
    "ReceiverUserId" INTEGER NOT NULL,
    "RoomId" INTEGER NOT NULL,
    "GiftId" INTEGER NOT NULL,
    "Quantity" INTEGER NOT NULL DEFAULT 1,
    "TotalCoins" BIGINT NOT NULL,
    "SentAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "FK_GiftTransactions_Sender" FOREIGN KEY ("SenderUserId") REFERENCES "Users"("Id"),
    CONSTRAINT "FK_GiftTransactions_Receiver" FOREIGN KEY ("ReceiverUserId") REFERENCES "Users"("Id"),
    CONSTRAINT "FK_GiftTransactions_Room" FOREIGN KEY ("RoomId") REFERENCES "Rooms"("Id"),
    CONSTRAINT "FK_GiftTransactions_Gift" FOREIGN KEY ("GiftId") REFERENCES "Gifts"("Id")
);

CREATE TABLE IF NOT EXISTS "UserReports" (
    "Id" SERIAL PRIMARY KEY,
    "ReporterUserId" INTEGER NOT NULL,
    "ReportedUserId" INTEGER NOT NULL,
    "Reason" VARCHAR(500) NOT NULL,
    "DurationType" VARCHAR(30) NOT NULL DEFAULT 'ThreeDays',
    "Status" VARCHAR(30) NOT NULL DEFAULT 'Pending',
    "AppliedBanUntil" TIMESTAMPTZ,
    "CreatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "ResolvedAt" TIMESTAMPTZ,
    CONSTRAINT "FK_UserReports_Reporter" FOREIGN KEY ("ReporterUserId") REFERENCES "Users"("Id"),
    CONSTRAINT "FK_UserReports_Reported" FOREIGN KEY ("ReportedUserId") REFERENCES "Users"("Id")
);

CREATE TABLE IF NOT EXISTS "RoomKicks" (
    "Id" SERIAL PRIMARY KEY,
    "RoomId" INTEGER NOT NULL,
    "UserId" INTEGER NOT NULL,
    "KickedByUserId" INTEGER NOT NULL,
    "KickType" VARCHAR(30) NOT NULL DEFAULT 'ThreeDays',
    "KickedUntil" TIMESTAMPTZ,
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "CreatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "FK_RoomKicks_Room" FOREIGN KEY ("RoomId") REFERENCES "Rooms"("Id"),
    CONSTRAINT "FK_RoomKicks_User" FOREIGN KEY ("UserId") REFERENCES "Users"("Id"),
    CONSTRAINT "FK_RoomKicks_Kicker" FOREIGN KEY ("KickedByUserId") REFERENCES "Users"("Id")
);

CREATE TABLE IF NOT EXISTS "UserBlocks" (
    "Id" SERIAL PRIMARY KEY,
    "BlockerUserId" INTEGER NOT NULL,
    "BlockedUserId" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "FK_UserBlocks_Blocker" FOREIGN KEY ("BlockerUserId") REFERENCES "Users"("Id"),
    CONSTRAINT "FK_UserBlocks_Blocked" FOREIGN KEY ("BlockedUserId") REFERENCES "Users"("Id"),
    CONSTRAINT "UQ_UserBlocks_Blocker_Blocked" UNIQUE ("BlockerUserId", "BlockedUserId")
);

CREATE TABLE IF NOT EXISTS "RoomMessages" (
    "Id" BIGSERIAL PRIMARY KEY,
    "RoomId" INTEGER NOT NULL,
    "SenderUserId" INTEGER NOT NULL,
    "Content" VARCHAR(1000) NOT NULL,
    "MessageType" VARCHAR(30) NOT NULL DEFAULT 'Text',
    "SentAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "FK_RoomMessages_Room" FOREIGN KEY ("RoomId") REFERENCES "Rooms"("Id"),
    CONSTRAINT "FK_RoomMessages_Sender" FOREIGN KEY ("SenderUserId") REFERENCES "Users"("Id")
);
