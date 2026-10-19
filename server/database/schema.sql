IF OBJECT_ID(N'dbo.Opportunities', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Opportunities
    (
        OpportunityId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Opportunities PRIMARY KEY,
        ExternalId NVARCHAR(100) NULL,
        OpportunityType NVARCHAR(20) NOT NULL,
        Title NVARCHAR(200) NOT NULL,
        CompanyName NVARCHAR(200) NOT NULL,
        Location NVARCHAR(200) NOT NULL,
        WorkMode NVARCHAR(50) NULL,
        Openings INT NOT NULL CONSTRAINT DF_Opportunities_Openings DEFAULT 1,
        Salary NVARCHAR(100) NULL,
        Duration NVARCHAR(100) NULL,
        Description NVARCHAR(MAX) NULL,
        Eligibility NVARCHAR(MAX) NULL,
        SkillsJson NVARCHAR(MAX) NULL,
        ExpiryDate DATE NULL,
        Status NVARCHAR(30) NOT NULL CONSTRAINT DF_Opportunities_Status DEFAULT N'pending',
        IsVerified BIT NOT NULL CONSTRAINT DF_Opportunities_IsVerified DEFAULT 0,
        CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Opportunities_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Opportunities_UpdatedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT CK_Opportunities_Type CHECK (OpportunityType IN (N'Job', N'Internship')),
        CONSTRAINT CK_Opportunities_Status CHECK (Status IN (N'pending', N'verified', N'rejected', N'closed')),
        CONSTRAINT CK_Opportunities_Openings CHECK (Openings > 0)
    );
END;

IF OBJECT_ID(N'dbo.DriveRequests', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.DriveRequests
    (
        DriveRequestId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_DriveRequests PRIMARY KEY,
        CompanyName NVARCHAR(200) NOT NULL,
        CollegeName NVARCHAR(200) NOT NULL,
        DriveDate DATE NOT NULL,
        ExpectedStudents INT NOT NULL,
        Message NVARCHAR(2000) NULL,
        AdminStatus NVARCHAR(30) NOT NULL CONSTRAINT DF_DriveRequests_AdminStatus DEFAULT N'pending',
        RequestStatus NVARCHAR(30) NOT NULL CONSTRAINT DF_DriveRequests_RequestStatus DEFAULT N'pending',
        CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_DriveRequests_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_DriveRequests_UpdatedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT CK_DriveRequests_AdminStatus CHECK (AdminStatus IN (N'pending', N'approved', N'rejected')),
        CONSTRAINT CK_DriveRequests_RequestStatus CHECK (RequestStatus IN (N'pending', N'accepted', N'rejected'))
    );
END;

IF OBJECT_ID(N'dbo.VerificationRequests', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.VerificationRequests
    (
        VerificationRequestId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_VerificationRequests PRIMARY KEY,
        AccountType NVARCHAR(20) NOT NULL,
        OrganizationName NVARCHAR(200) NOT NULL,
        ContactEmail NVARCHAR(320) NOT NULL,
        Location NVARCHAR(200) NULL,
        RegistrationNumber NVARCHAR(100) NOT NULL,
        Website NVARCHAR(500) NULL,
        Note NVARCHAR(2000) NULL,
        Status NVARCHAR(30) NOT NULL CONSTRAINT DF_VerificationRequests_Status DEFAULT N'pending',
        SubmittedAt DATETIME2(0) NOT NULL CONSTRAINT DF_VerificationRequests_SubmittedAt DEFAULT SYSUTCDATETIME(),
        ReviewedAt DATETIME2(0) NULL,
        CONSTRAINT CK_VerificationRequests_AccountType CHECK (AccountType IN (N'college', N'company')),
        CONSTRAINT CK_VerificationRequests_Status CHECK (Status IN (N'pending', N'approved', N'rejected'))
    );
END;

IF OBJECT_ID(N'dbo.VerificationDocuments', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.VerificationDocuments
    (
        VerificationDocumentId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_VerificationDocuments PRIMARY KEY,
        VerificationRequestId INT NOT NULL,
        FileName NVARCHAR(260) NOT NULL,
        ContentType NVARCHAR(100) NOT NULL,
        FileSizeBytes INT NOT NULL,
        DataUrl NVARCHAR(MAX) NOT NULL,
        CONSTRAINT FK_VerificationDocuments_Requests
            FOREIGN KEY (VerificationRequestId)
            REFERENCES dbo.VerificationRequests (VerificationRequestId)
            ON DELETE CASCADE
    );
END;

IF OBJECT_ID(N'dbo.OpportunityReports', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.OpportunityReports
    (
        OpportunityReportId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_OpportunityReports PRIMARY KEY,
        OpportunityId INT NOT NULL,
        OpportunityTitle NVARCHAR(200) NOT NULL,
        CompanyName NVARCHAR(200) NOT NULL,
        OpportunityType NVARCHAR(20) NOT NULL,
        ReportedBy NVARCHAR(200) NOT NULL,
        ReporterEmail NVARCHAR(320) NULL,
        Reason NVARCHAR(100) NOT NULL,
        Details NVARCHAR(2000) NULL,
        Status NVARCHAR(30) NOT NULL CONSTRAINT DF_OpportunityReports_Status DEFAULT N'pending',
        ReportedAt DATETIME2(0) NOT NULL CONSTRAINT DF_OpportunityReports_ReportedAt DEFAULT SYSUTCDATETIME(),
        ReviewedAt DATETIME2(0) NULL,
        CONSTRAINT CK_OpportunityReports_Status CHECK (Status IN (N'pending', N'reviewed', N'removed', N'dismissed'))
    );
END;

IF OBJECT_ID(N'dbo.OrganizationReports', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.OrganizationReports
    (
        OrganizationReportId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_OrganizationReports PRIMARY KEY,
        AccountType NVARCHAR(20) NOT NULL,
        OrganizationName NVARCHAR(200) NOT NULL,
        ReportedBy NVARCHAR(200) NOT NULL,
        ReporterEmail NVARCHAR(320) NULL,
        Reason NVARCHAR(100) NOT NULL,
        Details NVARCHAR(2000) NULL,
        Status NVARCHAR(30) NOT NULL CONSTRAINT DF_OrganizationReports_Status DEFAULT N'pending',
        ReportedAt DATETIME2(0) NOT NULL CONSTRAINT DF_OrganizationReports_ReportedAt DEFAULT SYSUTCDATETIME(),
        ReviewedAt DATETIME2(0) NULL,
        CONSTRAINT CK_OrganizationReports_AccountType CHECK (AccountType IN (N'college', N'company')),
        CONSTRAINT CK_OrganizationReports_Status CHECK (Status IN (N'pending', N'reviewed', N'dismissed'))
    );
END;

IF OBJECT_ID(N'dbo.SavedOpportunities', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.SavedOpportunities
    (
        SavedOpportunityId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_SavedOpportunities PRIMARY KEY,
        CollegeEmail NVARCHAR(320) NOT NULL,
        OpportunityId INT NOT NULL,
        SavedAt DATETIME2(0) NOT NULL CONSTRAINT DF_SavedOpportunities_SavedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT UQ_SavedOpportunities_CollegeOpportunity UNIQUE (CollegeEmail, OpportunityId)
    );
END;

IF OBJECT_ID(N'dbo.NotificationPreferences', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.NotificationPreferences
    (
        NotificationPreferenceId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_NotificationPreferences PRIMARY KEY,
        AccountScope NVARCHAR(30) NOT NULL,
        AccountEmail NVARCHAR(320) NULL,
        ReadNotificationIdsJson NVARCHAR(MAX) NOT NULL CONSTRAINT DF_NotificationPreferences_Read DEFAULT N'[]',
        DismissedNotificationIdsJson NVARCHAR(MAX) NOT NULL CONSTRAINT DF_NotificationPreferences_Dismissed DEFAULT N'[]',
        UpdatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_NotificationPreferences_UpdatedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT UQ_NotificationPreferences_ScopeEmail UNIQUE (AccountScope, AccountEmail)
    );
END;

IF COL_LENGTH(N'dbo.DriveRequests', N'ExternalId') IS NULL
    ALTER TABLE dbo.DriveRequests ADD ExternalId NVARCHAR(100) NULL;
IF COL_LENGTH(N'dbo.VerificationRequests', N'ExternalId') IS NULL
    ALTER TABLE dbo.VerificationRequests ADD ExternalId NVARCHAR(100) NULL;
IF COL_LENGTH(N'dbo.VerificationRequests', N'DocumentsJson') IS NULL
    ALTER TABLE dbo.VerificationRequests ADD DocumentsJson NVARCHAR(MAX) NULL;
IF COL_LENGTH(N'dbo.OpportunityReports', N'ExternalId') IS NULL
    ALTER TABLE dbo.OpportunityReports ADD ExternalId NVARCHAR(100) NULL;
IF COL_LENGTH(N'dbo.OrganizationReports', N'ExternalId') IS NULL
    ALTER TABLE dbo.OrganizationReports ADD ExternalId NVARCHAR(100) NULL;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Opportunities_CompanyStatus' AND object_id = OBJECT_ID(N'dbo.Opportunities'))
    CREATE INDEX IX_Opportunities_CompanyStatus ON dbo.Opportunities (CompanyName, Status);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Opportunities_TypeExpiry' AND object_id = OBJECT_ID(N'dbo.Opportunities'))
    CREATE INDEX IX_Opportunities_TypeExpiry ON dbo.Opportunities (OpportunityType, ExpiryDate);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_DriveRequests_CompanyAdminStatus' AND object_id = OBJECT_ID(N'dbo.DriveRequests'))
    CREATE INDEX IX_DriveRequests_CompanyAdminStatus ON dbo.DriveRequests (CompanyName, AdminStatus);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_VerificationRequests_Status' AND object_id = OBJECT_ID(N'dbo.VerificationRequests'))
    CREATE INDEX IX_VerificationRequests_Status ON dbo.VerificationRequests (Status, AccountType);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_OpportunityReports_Status' AND object_id = OBJECT_ID(N'dbo.OpportunityReports'))
    CREATE INDEX IX_OpportunityReports_Status ON dbo.OpportunityReports (Status);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_OrganizationReports_Status' AND object_id = OBJECT_ID(N'dbo.OrganizationReports'))
    CREATE INDEX IX_OrganizationReports_Status ON dbo.OrganizationReports (Status);
