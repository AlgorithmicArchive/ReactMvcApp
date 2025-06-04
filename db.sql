-- SocialWelfareDepartment.dbo.ActionHistory definition

-- Drop table

-- DROP TABLE SocialWelfareDepartment.dbo.ActionHistory;

CREATE TABLE ActionHistory (
	history_id int IDENTITY(1,1) NOT NULL,
	referenceNumber varchar(30) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	ActionTaker varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	ActionTaken varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	ActionTakenDate varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CONSTRAINT ActionHistory_PK PRIMARY KEY (history_id)
);


-- SocialWelfareDepartment.dbo.ApplicationPerDistrict definition

-- Drop table

-- DROP TABLE SocialWelfareDepartment.dbo.ApplicationPerDistrict;

CREATE TABLE ApplicationPerDistrict (
	UUID int IDENTITY(1,1) NOT NULL,
	DistrictId int NOT NULL,
	ServiceId int NULL,
	FinancialYear varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CountValue int NOT NULL,
	CONSTRAINT PK_ApplicationPerDistrict PRIMARY KEY (UUID)
);


-- SocialWelfareDepartment.dbo.Certificates definition

-- Drop table

-- DROP TABLE SocialWelfareDepartment.dbo.Certificates;

CREATE TABLE Certificates (
	UUID int IDENTITY(1,1) NOT NULL,
	OfficerId int NOT NULL,
	serialNumber varbinary(MAX) NULL,
	certifiyingAuthority varchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	expirationDate datetime NULL,
	registeredDate nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_Certificates PRIMARY KEY (UUID)
);


-- SocialWelfareDepartment.dbo.Citizen_Applications definition

-- Drop table

-- DROP TABLE SocialWelfareDepartment.dbo.Citizen_Applications;

CREATE TABLE Citizen_Applications (
	ReferenceNumber varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Citizen_id int NOT NULL,
	ServiceId int NOT NULL,
	FormDetails nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	WorkFlow nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	AdditionalDetails nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CurrentPlayer int NOT NULL,
	Status varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Created_at varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_Citizen_Applications PRIMARY KEY (ReferenceNumber)
);


-- SocialWelfareDepartment.dbo.District definition

-- Drop table

-- DROP TABLE SocialWelfareDepartment.dbo.District;

CREATE TABLE District (
	DistrictID int NOT NULL,
	DistrictName varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	DistrictShort varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Division int NOT NULL,
	UUID int NULL,
	CONSTRAINT District_PK PRIMARY KEY (DistrictID)
);


-- SocialWelfareDepartment.dbo.OfficerDetails definition

-- Drop table

-- DROP TABLE SocialWelfareDepartment.dbo.OfficerDetails;

CREATE TABLE OfficerDetails (
	DetailId int NOT NULL,
	OfficerId int NOT NULL,
	[Role] varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	AccessLevel varchar(20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	AccessCode int NOT NULL,
	CONSTRAINT PK_OfficerDetails PRIMARY KEY (DetailId)
);


-- SocialWelfareDepartment.dbo.OfficersDesignations definition

-- Drop table

-- DROP TABLE SocialWelfareDepartment.dbo.OfficersDesignations;

CREATE TABLE OfficersDesignations (
	UUID int IDENTITY(1,1) NOT NULL,
	Designation varchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	DesignationShort varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	AccessLevel varchar(40) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT OfficersDesignations_PK PRIMARY KEY (UUID)
);


-- SocialWelfareDepartment.dbo.Services definition

-- Drop table

-- DROP TABLE SocialWelfareDepartment.dbo.Services;

CREATE TABLE Services (
	ServiceId int IDENTITY(1,1) NOT NULL,
	ServiceName varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	NameShort varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Department varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	FormElement varchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	BankDetails varchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	OfficerEditableField nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	DocumentFields nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Letters nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Pool nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Approve nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ApprovalListEnabled bit NULL,
	webService nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CreatedAt varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Active bit NOT NULL,
	CONSTRAINT PK_Services PRIMARY KEY (ServiceId)
);


-- SocialWelfareDepartment.dbo.Tehsil definition

-- Drop table

-- DROP TABLE SocialWelfareDepartment.dbo.Tehsil;

CREATE TABLE Tehsil (
	DistrictID int NOT NULL,
	TehsilId int NOT NULL,
	TehsilName varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	UUID int NULL,
	CONSTRAINT Tehsil_PK PRIMARY KEY (TehsilId)
);


-- SocialWelfareDepartment.dbo.Users definition

-- Drop table

-- DROP TABLE SocialWelfareDepartment.dbo.Users;

CREATE TABLE Users (
	UserId int IDENTITY(1,1) NOT NULL,
	Name varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Username varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Email varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Password varbinary(64) NULL,
	MobileNumber varchar(20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Profile varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	UserType varchar(30) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	BackupCodes varchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	IsEmailValid bit DEFAULT 0 NOT NULL,
	RegisteredDate nvarchar(120) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_Users PRIMARY KEY (UserId)
);


-- SocialWelfareDepartment.dbo.Pool definition

-- Drop table

-- DROP TABLE SocialWelfareDepartment.dbo.Pool;

CREATE TABLE Pool (
	PoolId int IDENTITY(1,1) NOT NULL,
	ServiceId int NOT NULL,
	AccessLevel varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	AccessCode int NOT NULL,
	List nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_Pool PRIMARY KEY (PoolId),
	CONSTRAINT FK_Pool_Services FOREIGN KEY (ServiceId) REFERENCES Services(ServiceId)
);
 CREATE NONCLUSTERED INDEX IX_Pool_ServiceId ON SocialWelfareDepartment.dbo.Pool (  ServiceId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;