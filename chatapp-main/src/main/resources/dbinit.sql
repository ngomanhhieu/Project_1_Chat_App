-- DROP bảng nếu tồn tại (tùy chọn)
-- IF OBJECT_ID('sessions', 'U') IS NOT NULL DROP TABLE sessions;
-- ...

-- Tạo bảng [user]
IF OBJECT_ID('[user]', 'U') IS NULL
BEGIN
    CREATE TABLE [user] (
        user_id NVARCHAR(50) PRIMARY KEY,
        username NVARCHAR(50) NOT NULL,
        password NVARCHAR(100) NOT NULL,
        name NVARCHAR(100) NOT NULL
    );
END;

-- Chèn user mẫu
IF NOT EXISTS (SELECT 1 FROM [user] WHERE user_id = 'user123')
BEGIN
    INSERT INTO [user] (user_id, username, password, name)
    VALUES ('user123', 'newuser', 'password123', 'New User');
END;
GO

-- Tạo bảng friendship
IF OBJECT_ID('friendship', 'U') IS NULL
BEGIN
    CREATE TABLE friendship (
        user_id1 NVARCHAR(50),
        user_id2 NVARCHAR(50),
        status_id INT,
        PRIMARY KEY(user_id1, user_id2),
        FOREIGN KEY(user_id1) REFERENCES [user](user_id),
        FOREIGN KEY(user_id2) REFERENCES [user](user_id)
    );
END;
GO

-- Tạo bảng message
IF OBJECT_ID('message', 'U') IS NULL
BEGIN
    CREATE TABLE message (
        user_id NVARCHAR(50) REFERENCES [user](user_id),
        chat_id NVARCHAR(50),
        message NVARCHAR(MAX),
        [time] DATETIME DEFAULT GETDATE()
    );
END;
GO

-- Tạo bảng joinedchat
IF OBJECT_ID('joinedchat', 'U') IS NULL
BEGIN
    CREATE TABLE joinedchat (
        user_id NVARCHAR(50) REFERENCES [user](user_id),
        chat_id NVARCHAR(50)
    );
END;
GO

-- Tạo bảng chatroom
IF OBJECT_ID('chatroom', 'U') IS NULL
BEGIN
    CREATE TABLE chatroom (
        chat_id NVARCHAR(50) PRIMARY KEY,
        chat_name NVARCHAR(50)
    );
END;
GO

-- Tạo bảng sessions
IF OBJECT_ID('sessions', 'U') IS NULL
BEGIN
    CREATE TABLE sessions (
        user_id NVARCHAR(50),
        session_id NVARCHAR(50) PRIMARY KEY
    );
END;
GO

-- Tạo trigger nếu chưa tồn tại
IF OBJECT_ID('prevent_duplicate_friendships', 'TR') IS NULL
BEGIN
    EXEC('
    CREATE TRIGGER prevent_duplicate_friendships
    ON friendship
    INSTEAD OF INSERT
    AS
    BEGIN
        IF EXISTS (
            SELECT 1
            FROM friendship
                     JOIN inserted ON (friendship.user_id1 = inserted.user_id2 AND friendship.user_id2 = inserted.user_id1)
                AND friendship.status_id = 1
        )
        BEGIN
            RAISERROR (''Duplicate friendship detected with reversed user IDs'', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END;

        INSERT INTO friendship (user_id1, user_id2, status_id)
        SELECT user_id1, user_id2, status_id
        FROM inserted;
    END
    ');
END;
GO
