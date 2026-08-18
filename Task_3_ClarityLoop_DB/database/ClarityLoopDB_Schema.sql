IF DB_ID('ClarityLoopDB') IS NULL
BEGIN
    CREATE DATABASE ClarityLoopDB;
END;
GO

USE ClarityLoopDB;
GO

IF OBJECT_ID('dbo.Decisions', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Decisions (
        DecisionId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        Title NVARCHAR(120) NOT NULL,
        Context NVARCHAR(500) NOT NULL,
        Reasoning NVARCHAR(1000) NOT NULL,
        Confidence TINYINT NOT NULL,
        ReviewDate DATE NULL,
        Status NVARCHAR(20) NOT NULL DEFAULT 'pending-review',
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT CK_Decisions_Confidence CHECK (Confidence BETWEEN 1 AND 100),
        CONSTRAINT CK_Decisions_Status CHECK (Status IN ('pending-review', 'reviewed'))
    );
END;
GO

IF OBJECT_ID('dbo.DecisionOptions', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.DecisionOptions (
        OptionId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        DecisionId UNIQUEIDENTIFIER NOT NULL,
        OptionText NVARCHAR(250) NOT NULL,
        IsSelected BIT NOT NULL DEFAULT 0,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_DecisionOptions_Decisions
            FOREIGN KEY (DecisionId) REFERENCES dbo.Decisions(DecisionId) ON DELETE CASCADE,
        CONSTRAINT UQ_DecisionOptions_Decision_Option UNIQUE (DecisionId, OptionText)
    );
END;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'UX_DecisionOptions_OneSelected'
      AND object_id = OBJECT_ID('dbo.DecisionOptions')
)
BEGIN
    CREATE UNIQUE INDEX UX_DecisionOptions_OneSelected
    ON dbo.DecisionOptions(DecisionId)
    WHERE IsSelected = 1;
END;
GO

IF OBJECT_ID('dbo.Reviews', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Reviews (
        ReviewId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        DecisionId UNIQUEIDENTIFIER NOT NULL UNIQUE,
        Outcome NVARCHAR(20) NOT NULL,
        ActualOutcome NVARCHAR(1000) NOT NULL,
        LessonLearned NVARCHAR(1000) NOT NULL,
        OutcomeScore TINYINT NOT NULL,
        ReviewedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT CK_Reviews_Outcome CHECK (Outcome IN ('positive', 'mixed', 'negative')),
        CONSTRAINT CK_Reviews_OutcomeScore CHECK (OutcomeScore BETWEEN 1 AND 10),
        CONSTRAINT FK_Reviews_Decisions
            FOREIGN KEY (DecisionId) REFERENCES dbo.Decisions(DecisionId) ON DELETE CASCADE
    );
END;
GO

IF OBJECT_ID('dbo.Tags', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Tags (
        TagId INT IDENTITY(1,1) PRIMARY KEY,
        TagName NVARCHAR(50) NOT NULL UNIQUE,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT CK_Tags_TagName CHECK (LEN(TagName) BETWEEN 1 AND 50)
    );
END;
GO

IF OBJECT_ID('dbo.DecisionTags', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.DecisionTags (
        DecisionId UNIQUEIDENTIFIER NOT NULL,
        TagId INT NOT NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT PK_DecisionTags PRIMARY KEY (DecisionId, TagId),
        CONSTRAINT FK_DecisionTags_Decisions
            FOREIGN KEY (DecisionId) REFERENCES dbo.Decisions(DecisionId) ON DELETE CASCADE,
        CONSTRAINT FK_DecisionTags_Tags
            FOREIGN KEY (TagId) REFERENCES dbo.Tags(TagId) ON DELETE CASCADE
    );
END;
GO

SELECT TABLE_SCHEMA, TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;
GO
