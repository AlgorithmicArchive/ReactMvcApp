-- Test.dbo.ActionHistory definition

-- Drop table

-- DROP TABLE Test.dbo.ActionHistory;

CREATE TABLE Test.dbo.ActionHistory (
	history_id int IDENTITY(1,1) NOT NULL,
	referenceNumber varchar(30) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	ActionTaker varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	ActionTaken varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	ActionTakenDate varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CONSTRAINT ActionHistory_PK PRIMARY KEY (history_id)
);


-- Test.dbo.ApplicationPerDistrict definition

-- Drop table

-- DROP TABLE Test.dbo.ApplicationPerDistrict;

CREATE TABLE Test.dbo.ApplicationPerDistrict (
	UUID int IDENTITY(1,1) NOT NULL,
	DistrictId int NOT NULL,
	ServiceId int NULL,
	FinancialYear varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CountValue int NOT NULL,
	CONSTRAINT PK_ApplicationPerDistrict PRIMARY KEY (UUID)
);


-- Test.dbo.Certificates definition

-- Drop table

-- DROP TABLE Test.dbo.Certificates;

CREATE TABLE Test.dbo.Certificates (
	UUID int NOT NULL,
	OfficerId int NOT NULL,
	EncryptedCertificateData varbinary(MAX) NULL,
	EncryptedPassword varbinary(MAX) NULL,
	encryptionKey varbinary(MAX) NULL,
	encryptionIV varbinary(MAX) NULL,
	RegisteredDate nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL
);


-- Test.dbo.Citizen_Applications definition

-- Drop table

-- DROP TABLE Test.dbo.Citizen_Applications;

CREATE TABLE Test.dbo.Citizen_Applications (
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


-- Test.dbo.District definition

-- Drop table

-- DROP TABLE Test.dbo.District;

CREATE TABLE Test.dbo.District (
	DistrictID int NOT NULL,
	DistrictName varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	DistrictShort varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Division int NOT NULL
);


-- Test.dbo.OfficerDetails definition

-- Drop table

-- DROP TABLE Test.dbo.OfficerDetails;

CREATE TABLE Test.dbo.OfficerDetails (
	DetailId int NOT NULL,
	OfficerId int NOT NULL,
	[Role] varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	AccessLevel varchar(20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	AccessCode int NOT NULL
);


-- Test.dbo.OfficersDesignations definition

-- Drop table

-- DROP TABLE Test.dbo.OfficersDesignations;

CREATE TABLE Test.dbo.OfficersDesignations (
	UUID int NOT NULL,
	Designation varchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	DesignationShort varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	AccessLevel varchar(40) COLLATE SQL_Latin1_General_CP1_CI_AS NULL
);


-- Test.dbo.Services definition

-- Drop table

-- DROP TABLE Test.dbo.Services;

CREATE TABLE Test.dbo.Services (
	ServiceId int IDENTITY(1,1) NOT NULL,
	ServiceName varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	NameShort varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Department varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	FormElement varchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	BankDetails varchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	OfficerEditableField nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	DocumentFields nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Pool nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Approve nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ApprovalListEnabled bit NULL,
	webService nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CreatedAt varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Active bit NOT NULL,
	CONSTRAINT PK_Services PRIMARY KEY (ServiceId)
);


-- Test.dbo.Tehsil definition

-- Drop table

-- DROP TABLE Test.dbo.Tehsil;

CREATE TABLE Test.dbo.Tehsil (
	DistrictID int NOT NULL,
	TehsilId int NOT NULL,
	TehsilName varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL
);


-- Test.dbo.Users definition

-- Drop table

-- DROP TABLE Test.dbo.Users;

CREATE TABLE Test.dbo.Users (
	UserId int IDENTITY(1,1) NOT NULL,
	Name varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Username varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Email varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Password varbinary(MAX) NULL,
	MobileNumber varchar(20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Profile varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	UserType varchar(30) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	BackupCodes varchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	IsEmailValid bit NOT NULL,
	RegisteredDate nvarchar(120) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_Users PRIMARY KEY (UserId)
);


-- Test.dbo.Pool definition

-- Drop table

-- DROP TABLE Test.dbo.Pool;

CREATE TABLE Test.dbo.Pool (
	PoolId int IDENTITY(1,1) NOT NULL,
	ServiceId int NOT NULL,
	AccessLevel varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	AccessCode int NOT NULL,
	List nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_Pool PRIMARY KEY (PoolId),
	CONSTRAINT FK_Pool_Services FOREIGN KEY (ServiceId) REFERENCES Test.dbo.Services(ServiceId)
);
 CREATE NONCLUSTERED INDEX IX_Pool_ServiceId ON Test.dbo.Pool (  ServiceId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;