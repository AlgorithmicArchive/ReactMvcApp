-- DROP SCHEMA dbo;

CREATE SCHEMA dbo;
-- Address definition

-- Drop table

-- DROP TABLE Address;

CREATE TABLE Address (
	AddressId int IDENTITY(1,1) NOT NULL,
	DistrictId int NOT NULL,
	TehsilId int NOT NULL,
	BlockId int NOT NULL,
	HalqaPanchayatId int NOT NULL,
	VillageId int NOT NULL,
	WardId int NOT NULL,
	PincodeId int NOT NULL,
	AddressDetails varchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CONSTRAINT PK_Address PRIMARY KEY (AddressId)
);


-- ApplicationList definition

-- Drop table

-- DROP TABLE ApplicationList;

CREATE TABLE ApplicationList (
	UUID int IDENTITY(1,1) NOT NULL,
	ServiceId int NOT NULL,
	Officer varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	AccessLevel varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	AccessCode int NOT NULL,
	ApprovalList varchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	PoolList varchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CONSTRAINT PK_ApplicationList PRIMARY KEY (UUID)
);


-- Contact definition

-- Drop table

-- DROP TABLE Contact;

CREATE TABLE Contact (
	UUID int IDENTITY(1,1) NOT NULL,
	fullName varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	email varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	message text COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	submissionDate varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CONSTRAINT PK_NewTable PRIMARY KEY (UUID)
);


-- District definition

-- Drop table

-- DROP TABLE District;

CREATE TABLE District (
	DistrictID int NOT NULL,
	DistrictName varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	DistrictShort varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Division int NOT NULL,
	CONSTRAINT PK_District PRIMARY KEY (DistrictID)
);


-- Feedback definition

-- Drop table

-- DROP TABLE Feedback;

CREATE TABLE Feedback (
	UUID int IDENTITY(1,1) NOT NULL,
	UserId int NOT NULL,
	ServiceRelated varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Message varchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	SubmittedAt decimal(23,3) NOT NULL,
	CONSTRAINT PK_Feedback PRIMARY KEY (UUID)
);


-- OfficersDesignations definition

-- Drop table

-- DROP TABLE OfficersDesignations;

CREATE TABLE OfficersDesignations (
	UUID int IDENTITY(1,1) NOT NULL,
	Designation varchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	DesignationShort varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	AccessLevel varchar(40) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CONSTRAINT PK_OfficersDesignations PRIMARY KEY (UUID)
);


-- Pincode definition

-- Drop table

-- DROP TABLE Pincode;

CREATE TABLE Pincode (
	pincode_id int IDENTITY(1,1) NOT NULL,
	Pincode int NOT NULL,
	CONSTRAINT PK_Pincode PRIMARY KEY (pincode_id)
);


-- Services definition

-- Drop table

-- DROP TABLE Services;

CREATE TABLE Services (
	ServiceId int IDENTITY(1,1) NOT NULL,
	ServiceName varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	NameShort varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Department varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	FormElement varchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	BankDetails varchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS DEFAULT '{}' NOT NULL,
	OfficerEditableField varchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	webService nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CreatedAt varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Active bit DEFAULT 0 NOT NULL,
	CONSTRAINT PK_Services PRIMARY KEY (ServiceId)
);


-- UniqueId definition

-- Drop table

-- DROP TABLE UniqueId;

CREATE TABLE UniqueId (
	UUID int IDENTITY(1,1) NOT NULL,
	District varchar(5) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Month] varchar(5) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Counter int NOT NULL,
	CONSTRAINT PK_UniqueId PRIMARY KEY (UUID)
);


-- Users definition

-- Drop table

-- DROP TABLE Users;

CREATE TABLE Users (
	UserId int IDENTITY(1,1) NOT NULL,
	Name varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Username varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Email varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Password varbinary(MAX) NOT NULL,
	MobileNumber varchar(20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Profile varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	UserType varchar(30) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	BackupCodes varchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	IsEmailValid bit DEFAULT 0 NOT NULL,
	RegisteredDate nvarchar(120) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CONSTRAINT PK_Users PRIMARY KEY (UserId)
);


-- WebServices definition

-- Drop table

-- DROP TABLE WebServices;

CREATE TABLE WebServices (
	webserviceID int IDENTITY(1,1) NOT NULL,
	serviceName varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	serverUrl varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[method] varchar(10) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	responseType varchar(10) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	successCode int NOT NULL,
	fields nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	createdAt datetime DEFAULT getdate() NOT NULL,
	CONSTRAINT PK_WebServices PRIMARY KEY (webserviceID)
);


-- ApplicationPerDistrict definition

-- Drop table

-- DROP TABLE ApplicationPerDistrict;

CREATE TABLE ApplicationPerDistrict (
	UUID int IDENTITY(1,1) NOT NULL,
	DistrictId int NOT NULL,
	FinancialYear varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CountValue int NOT NULL,
	CONSTRAINT PK_ApplicationPerDistrict PRIMARY KEY (UUID),
	CONSTRAINT FK_ApplicationPerDistrict_District FOREIGN KEY (DistrictId) REFERENCES District(DistrictID)
);


-- Applications definition

-- Drop table

-- DROP TABLE Applications;

CREATE TABLE Applications (
	ApplicationId varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CitizenId int NOT NULL,
	ServiceId int NOT NULL,
	ApplicantName varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	ApplicantImage varchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Email varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	MobileNumber varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Relation varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	RelationName varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	DateOfBirth varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Category varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	ServiceSpecific varchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	PresentAddressId varchar(20) COLLATE SQL_Latin1_General_CP1_CI_AS DEFAULT '0' NOT NULL,
	PermanentAddressId varchar(20) COLLATE SQL_Latin1_General_CP1_CI_AS DEFAULT '0' NOT NULL,
	BankDetails varchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Documents varchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	EditList varchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS DEFAULT '[]' NOT NULL,
	ApplicationStatus varchar(15) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	SubmissionDate nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS DEFAULT getdate() NOT NULL,
	CONSTRAINT PK_Applications PRIMARY KEY (ApplicationId),
	CONSTRAINT FK_Applications_Citizen FOREIGN KEY (CitizenId) REFERENCES Users(UserId),
	CONSTRAINT FK_Applications_Services FOREIGN KEY (ServiceId) REFERENCES Services(ServiceId)
);


-- ApplicationsCount definition

-- Drop table

-- DROP TABLE ApplicationsCount;

CREATE TABLE ApplicationsCount (
	CountId int IDENTITY(1,1) NOT NULL,
	ServiceId int NOT NULL,
	AccessLevel varchar(10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	AccessCode int NULL,
	[Role] varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	OfficerId int NULL,
	Status varchar(20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Count int NOT NULL,
	LastUpdated varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CONSTRAINT PK_ApplicationsCount PRIMARY KEY (CountId),
	CONSTRAINT FK_ApplicationsCount_Services FOREIGN KEY (ServiceId) REFERENCES Services(ServiceId),
	CONSTRAINT FK_ApplicationsCount_Users FOREIGN KEY (OfficerId) REFERENCES Users(UserId)
);


-- ApplicationsHistory definition

-- Drop table

-- DROP TABLE ApplicationsHistory;

CREATE TABLE ApplicationsHistory (
	HistoryId int IDENTITY(1,1) NOT NULL,
	ServiceId int NOT NULL,
	AccessLevel varchar(10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	AccessCode int NULL,
	[Role] varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ApplicationId varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	ActionTaken varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	TakenBy int NULL,
	Remarks text COLLATE SQL_Latin1_General_CP1_CI_AS DEFAULT '' NOT NULL,
	[File] varchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS DEFAULT '' NOT NULL,
	TakenAt varchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CONSTRAINT PK_ApplicationsHistory PRIMARY KEY (HistoryId),
	CONSTRAINT FK_ApplicationsHistory_Applications FOREIGN KEY (ApplicationId) REFERENCES Applications(ApplicationId),
	CONSTRAINT FK_ApplicationsHistory_Officer FOREIGN KEY (TakenBy) REFERENCES Users(UserId),
	CONSTRAINT FK_ApplicationsHistory_Services FOREIGN KEY (ServiceId) REFERENCES Services(ServiceId)
);


-- BankFiles definition

-- Drop table

-- DROP TABLE BankFiles;

CREATE TABLE BankFiles (
	FileId int IDENTITY(1,1) NOT NULL,
	DistrictId int NOT NULL,
	ServiceId int NOT NULL,
	FileName varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	GeneratedDate varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	TotalRecords int NOT NULL,
	FileSent bit NOT NULL,
	SentOn varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS DEFAULT '' NOT NULL,
	ResponseFile varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS DEFAULT '' NOT NULL,
	RecievedOn varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS DEFAULT '' NOT NULL,
	dbUpdate bit DEFAULT 0 NOT NULL,
	UpdatedOn varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS DEFAULT '' NOT NULL,
	CONSTRAINT PK_BankFiles PRIMARY KEY (FileId),
	CONSTRAINT FK_BankFiles_District FOREIGN KEY (DistrictId) REFERENCES District(DistrictID),
	CONSTRAINT FK_BankFiles_Services FOREIGN KEY (ServiceId) REFERENCES Services(ServiceId)
);


-- Block definition

-- Drop table

-- DROP TABLE Block;

CREATE TABLE Block (
	DistrictID int NOT NULL,
	BlockId int NOT NULL,
	BlockName varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CONSTRAINT PK_Block PRIMARY KEY (BlockId),
	CONSTRAINT FK_Block_District FOREIGN KEY (DistrictID) REFERENCES District(DistrictID)
);


-- Certificates definition

-- Drop table

-- DROP TABLE Certificates;

CREATE TABLE Certificates (
	UUID int IDENTITY(1,1) NOT NULL,
	OfficerId int NOT NULL,
	EncryptedCertificateData varbinary(MAX) NOT NULL,
	EncryptedPassword varbinary(MAX) NOT NULL,
	encryptionKey varbinary(MAX) NOT NULL,
	encryptionIV varbinary(MAX) NOT NULL,
	RegisteredDate nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS DEFAULT getdate() NOT NULL,
	CONSTRAINT PK_Certificates PRIMARY KEY (UUID),
	CONSTRAINT FK_Certificates_Officer FOREIGN KEY (OfficerId) REFERENCES Users(UserId)
);


-- HalqaPanchayat definition

-- Drop table

-- DROP TABLE HalqaPanchayat;

CREATE TABLE HalqaPanchayat (
	UUID int IDENTITY(1,1) NOT NULL,
	BlockId int NOT NULL,
	PanchayatName varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CONSTRAINT PK_HalqaPanchayat PRIMARY KEY (UUID),
	CONSTRAINT FK_HalqaPanchayat_Block FOREIGN KEY (BlockId) REFERENCES Block(BlockId)
);


-- OfficerDetails definition

-- Drop table

-- DROP TABLE OfficerDetails;

CREATE TABLE OfficerDetails (
	DetailId int IDENTITY(1,1) NOT NULL,
	OfficerId int NOT NULL,
	[Role] varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	AccessLevel varchar(20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	AccessCode int NOT NULL,
	CONSTRAINT PK_OfficerDetails PRIMARY KEY (DetailId),
	CONSTRAINT FK_OfficerDetails_Users FOREIGN KEY (OfficerId) REFERENCES Users(UserId)
);


-- PaymentDetails definition

-- Drop table

-- DROP TABLE PaymentDetails;

CREATE TABLE PaymentDetails (
	PaymentId int IDENTITY(1,1) NOT NULL,
	ApplicationId varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	ApplicantName varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Status varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	TransactionId varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	DateOfDistribution varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	TransactionStatus varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CONSTRAINT PK_PaymentDetails PRIMARY KEY (PaymentId),
	CONSTRAINT FK_PaymentDetails_Applications FOREIGN KEY (ApplicationId) REFERENCES Applications(ApplicationId)
);


-- Tehsil definition

-- Drop table

-- DROP TABLE Tehsil;

CREATE TABLE Tehsil (
	DistrictID int NOT NULL,
	TehsilId int NOT NULL,
	TehsilName varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CONSTRAINT PK_Tehsil PRIMARY KEY (TehsilId),
	CONSTRAINT FK_Tehsil_District FOREIGN KEY (DistrictID) REFERENCES District(DistrictID)
);


-- Village definition

-- Drop table

-- DROP TABLE Village;

CREATE TABLE Village (
	UUID int IDENTITY(1,1) NOT NULL,
	HalqaPanchayatId int NOT NULL,
	TehsilId int NOT NULL,
	VillageName varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CONSTRAINT PK_Village PRIMARY KEY (UUID),
	CONSTRAINT FK_Village_HalqaPanchayat FOREIGN KEY (HalqaPanchayatId) REFERENCES HalqaPanchayat(UUID),
	CONSTRAINT FK_Village_Tehsil FOREIGN KEY (TehsilId) REFERENCES Tehsil(TehsilId)
);


-- Ward definition

-- Drop table

-- DROP TABLE Ward;

CREATE TABLE Ward (
	UUID int IDENTITY(1,1) NOT NULL,
	VillageId int NOT NULL,
	WardName varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CONSTRAINT PK_Ward PRIMARY KEY (UUID),
	CONSTRAINT FK_Ward_Village FOREIGN KEY (VillageId) REFERENCES Village(UUID)
);


-- WorkFlow definition

-- Drop table

-- DROP TABLE WorkFlow;

CREATE TABLE WorkFlow (
	WorkFlowId int IDENTITY(1,1) NOT NULL,
	ServiceId int NOT NULL,
	[Role] varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	SequenceOrder int NOT NULL,
	canForward bit DEFAULT 0 NOT NULL,
	canReturn bit DEFAULT 0 NOT NULL,
	canReturnToEdit bit DEFAULT 0 NOT NULL,
	canUpdate bit DEFAULT 0 NOT NULL,
	canSanction bit DEFAULT 0 NOT NULL,
	canReject bit DEFAULT 1 NOT NULL,
	CONSTRAINT PK_WorkFlow PRIMARY KEY (WorkFlowId),
	CONSTRAINT FK_WorkFlow_Services FOREIGN KEY (ServiceId) REFERENCES Services(ServiceId)
);


-- ApplicationStatus definition

-- Drop table

-- DROP TABLE ApplicationStatus;

CREATE TABLE ApplicationStatus (
	StatusId int IDENTITY(1,1) NOT NULL,
	ServiceId int NOT NULL,
	AccessLevel varchar(10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	AccessCode int NULL,
	[Role] varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ApplicationId varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Status varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CurrentlyWith int NULL,
	canPull bit DEFAULT 0 NOT NULL,
	LastUpdated varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CONSTRAINT PK_ApplicationStatus PRIMARY KEY (StatusId),
	CONSTRAINT FK_ApplicationStatus_Applications FOREIGN KEY (ApplicationId) REFERENCES Applications(ApplicationId),
	CONSTRAINT FK_ApplicationStatus_Officer FOREIGN KEY (CurrentlyWith) REFERENCES Users(UserId),
	CONSTRAINT FK_ApplicationStatus_Services FOREIGN KEY (ServiceId) REFERENCES Services(ServiceId)
);




INSERT INTO District (DistrictID, DistrictName, DistrictShort, Division) 
VALUES
    (1, N'Anantnag', N'ANT', 2),
    (2, N'Budgam', N'BDG', 2),
    (3, N'Baramulla', N'BRM', 2),
    (4, N'Doda', N'DOD', 1),
    (5, N'Jammu', N'JMU', 1),
    (7, N'Kathua', N'KTH', 1),
    (8, N'Kupwara', N'KPW', 2),
    (10, N'Poonch', N'PNC', 1),
    (11, N'Pulwama', N'PLW', 2),
    (12, N'Rajouri', N'RJR', 1),
    (13, N'Srinagar', N'SRN', 2),
    (14, N'Udhampur', N'UDM', 1),
    (620, N'Kishtwar', N'KHT', 1),
    (621, N'Ramban', N'RMB', 1),
    (622, N'Kulgam', N'KLG', 2),
    (623, N'Bandipora', N'BDP', 2),
    (624, N'Samba', N'SAM', 1),
    (625, N'Shopian', N'SPN', 2),
    (626, N'Ganderbal', N'GDR', 2),
    (627, N'Reasi', N'REA', 1);

INSERT INTO Block (DistrictID, BlockId, BlockName) 
VALUES
    (1, 1, N'Achabal'),
    (1, 2, N'Breng'),
    (1, 3, N'Dachnipora'),
    (622, 4, N'Devsar'),
    (622, 5, N'D.H. Pora'),
    (1, 6, N'Khoveripora'),
    (622, 7, N'Kulgam'),
    (622, 8, N'Pahloo'),
    (622, 9, N'Qaimoh'),
    (1, 11, N'Shahabad'),
    (1, 12, N'Shangus'),
    (2, 13, N'B.K.Pora'),
    (2, 14, N'Badgam'),
    (2, 15, N'Beerwah'),
    (2, 16, N'Chadoora'),
    (2, 17, N'Khag'),
    (2, 18, N'Khan-Sahib'),
    (2, 19, N'Nagam'),
    (2, 20, N'Narbal'),
    (623, 21, N'Bandipora'),
    (3, 22, N'Baramulla'),
    (3, 23, N'Boniyar'),
    (623, 24, N'Gurez'),
    (623, 25, N'Hajin'),
    (3, 26, N'Kunzer'),
    (3, 27, N'Pattan'),
    (3, 28, N'Rafiabad'),
    (3, 29, N'Rohama'),
    (3, 30, N'Singhpora'),
    (3, 31, N'Sopore'),
    (623, 32, N'Sumbal'),
    (3, 33, N'Tangmarag'),
    (3, 34, N'Uri'),
    (3, 35, N'Wagoora'),
    (3, 36, N'Zaingeer'),
    (4, 37, N'Assar'),
    (621, 38, N'Banihal'),
    (4, 39, N'Bhaderwah'),
    (4, 40, N'Bhagwah'),
    (4, 41, N'Bhalessa(Gandoh)'),
    (620, 42, N'Dachhan'),
    (4, 43, N'Doda'),
    (620, 44, N'Drabshalla'),
    (4, 45, N'Gundana'),
    (620, 46, N'Inderwal'),
    (620, 47, N'Kishtwar'),
    (4, 48, N'Marmat'),
    (620, 49, N'Marwah'),
    (620, 50, N'Nagseni'),
    (620, 51, N'Padder'),
    (621, 52, N'Ramban'),
    (621, 53, N'Ramsoo'),
    (4, 54, N'Thathri'),
    (620, 55, N'Warwan'),
    (5, 56, N'Akhnoor'),
    (5, 57, N'Bhalwal'),
    (5, 58, N'Bishnah'),
    (5, 59, N'Dansal'),
    (5, 60, N'Khour'),
    (5, 61, N'Marh'),
    (624, 62, N'Purmandal'),
    (5, 63, N'R.S.Pura'),
    (624, 64, N'Samba'),
    (5, 65, N'Satwari'),
    (624, 66, N'Vijaypur'),
    (7, 74, N'Bani'),
    (7, 75, N'Barnoti'),
    (7, 76, N'Basohli'),
    (7, 77, N'Billawar'),
    (7, 78, N'Duggan'),
    (624, 79, N'Ghagwal'),
    (7, 80, N'Hiranagar'),
    (7, 81, N'Kathua'),
    (7, 82, N'Lohai-Malhar'),
    (8, 83, N'Kalarooch'),
    (8, 84, N'Kralpora'),
    (8, 85, N'Kupwara'),
    (8, 86, N'Langate'),
    (8, 87, N'Rajwar'),
    (8, 88, N'Ramhal'),
    (8, 89, N'Sogam'),
    (8, 90, N'Tangdar'),
    (8, 91, N'Teetwal'),
    (8, 92, N'Trehgam'),
    (8, 93, N'Wavoora'),
    (10, 100, N'Balakote'),
    (10, 101, N'Bufliaz'),
    (10, 102, N'Mandi'),
    (10, 103, N'Mendhar'),
    (10, 104, N'Poonch'),
    (10, 105, N'Surankote'),
    (11, 106, N'Kakapora'),
    (11, 108, N'Pampore'),
    (11, 109, N'Pulwama'),
    (625, 110, N'Shopian'),
    (11, 111, N'Tral'),
    (12, 112, N'Budhal'),
    (12, 113, N'Darhal'),
    (12, 114, N'Kalakote'),
    (12, 115, N'Manjakote'),
    (12, 116, N'Nowshera'),
    (12, 117, N'Rajouri'),
    (12, 118, N'Sunderbani'),
    (626, 119, N'Ganderbal'),
    (626, 120, N'Kangan'),
    (626, 121, N'Lar'),
    (13, 122, N'Srinagar'),
    (627, 123, N'Arnas'),
    (14, 124, N'Chenani'),
    (14, 125, N'Dudu'),
    (14, 126, N'Ghordi'),
    (621, 127, N'Gool'),
    (627, 128, N'Mahore'),
    (14, 129, N'Majalta'),
    (14, 130, N'Panchari'),
    (627, 131, N'Pouni'),
    (14, 132, N'Ramnagar'),
    (627, 133, N'Reasi'),
    (14, 134, N'Udhampur'),
    (12, 6539, N'Thana Mandi'),
    (623, 6545, N'Tulail'),
    (626, 6546, N'Wakoora'),
    (12, 6701, N'Doongi'),
    (1, 6712, N'Qazigund (Partly)'),
    (1, 6861, N'Anantnag'),
    (5, 6862, N'Arnia'),
    (5, 6863, N'Bhalwal Brahmana'),
    (5, 6864, N'Maira Mandrian'),
    (5, 6865, N'Chowki Choura'),
    (5, 6866, N'Samwan'),
    (5, 6867, N'Nagrota'),
    (5, 6868, N'Mandal Phallain'),
    (13, 6875, N'Harwan Rural Area Dara'),
    (13, 6876, N'Khanmoh'),
    (625, 6877, N'Keller'),
    (625, 6878, N'Kanji Ullar'),
    (625, 6879, N'Ramnagri'),
    (625, 6880, N'Imamsahib'),
    (625, 6881, N'Kaprin'),
    (625, 6882, N'Chitragam'),
    (625, 6883, N'Zainpora'),
    (625, 6884, N'Harman'),
    (626, 6885, N'Sherpathri'),
    (626, 6886, N'Safapora'),
    (626, 6887, N'Gund'),
    (622, 6889, N'Kund'),
    (622, 6890, N'Manzgam'),
    (622, 6891, N'Frisal'),
    (622, 6892, N'Pombay'),
    (622, 6893, N'Behibag'),
    (622, 6894, N'D K Marg'),
    (11, 6895, N'Awantipora'),
    (11, 6896, N'Newa'),
    (11, 6897, N'Litter'),
    (11, 6898, N'Aripal'),
    (11, 6899, N'Dadsara'),
    (11, 6900, N'Shadimarg'),
    (620, 6901, N'Palmar'),
    (620, 6902, N'Trigam'),
    (620, 6903, N'Thakraie'),
    (620, 6904, N'Bunjwah'),
    (620, 6905, N'Mughalmaidan'),
    (623, 6908, N'Aloosa'),
    (623, 6909, N'Bonkoot'),
    (623, 6910, N'Arin'),
    (623, 6911, N'Naidkhay'),
    (623, 6912, N'Ganstan'),
    (623, 6913, N'Nowgam'),
    (623, 6914, N'Baktoor'),
    (2, 6915, N'Parnewa'),
    (2, 6916, N'Sukhnag Hard Panzoo'),
    (2, 6917, N'Waterhail'),
    (2, 6918, N'Pakherpora'),
    (2, 6919, N'Charisharief'),
    (2, 6920, N'Surasyar'),
    (2, 6921, N'Soibugh'),
    (2, 6922, N'Rathsun'),
    (2, 6923, N'S K Pora'),
    (14, 6924, N'Jaganoo'),
    (14, 6925, N'Khoon'),
    (14, 6926, N'Kulwanta'),
    (14, 6927, N'Latti'),
    (14, 6928, N'Moungri'),
    (14, 6929, N'Narsoo'),
    (14, 6930, N'Chanunta Dalsar'),
    (14, 6931, N'Parli Dhar'),
    (14, 6932, N'Sewna'),
    (14, 6933, N'Tikri'),
    (624, 6934, N'Nud'),
    (624, 6935, N'Sumb'),
    (624, 6936, N'Rajpura'),
    (624, 6937, N'Ramgarh'),
    (627, 6938, N'Bamagh'),
    (627, 6939, N'Katra'),
    (627, 6940, N'Panthal'),
    (627, 6941, N'Thuroo'),
    (627, 6942, N'Jig Bagli'),
    (627, 6943, N'Thakrakote'),
    (627, 6944, N'Gulab Garh'),
    (627, 6945, N'Chassana'),
    (621, 6946, N'Batote'),
    (621, 6947, N'Rajgarh'),
    (621, 6948, N'Ukhral'),
    (621, 6949, N'Sangaldan'),
    (621, 6950, N'Gundi Dharam'),
    (621, 6951, N'Gandhri'),
    (621, 6952, N'Khari'),
    (12, 6953, N'Budhal New'),
    (12, 6954, N'Khawas'),
    (12, 6955, N'Panjgrian'),
    (12, 6956, N'Qila Darhal'),
    (12, 6957, N'Moughla'),
    (12, 6958, N'Seri'),
    (12, 6959, N'Dhangri'),
    (12, 6960, N'Siot'),
    (12, 6961, N'Lamberi'),
    (12, 6962, N'Planger'),
    (10, 6963, N'Nangali Sahib Sain Baba'),
    (10, 6964, N'Sathra'),
    (10, 6965, N'Loran'),
    (10, 6966, N'Mankote'),
    (10, 6967, N'Lassana'),
    (7, 6968, N'Duggain'),
    (7, 6969, N'Baggan'),
    (7, 6970, N'Bhoond'),
    (7, 6971, N'Mahanpur'),
    (7, 6972, N'Dhar Mahanpur'),
    (7, 6973, N'Mandli'),
    (7, 6974, N'Nagrota Gujroo'),
    (7, 6975, N'Keerian Gangyal'),
    (7, 6976, N'Nagri'),
    (7, 6977, N'Dinga Amb'),
    (7, 6978, N'Marheen'),
    (5, 6979, N'Kharah Balli'),
    (5, 6980, N'Pragwal'),
    (5, 6981, N'Mathwar'),
    (5, 6982, N'Suchetgarh'),
    (4, 6983, N'Kastigarh'),
    (4, 6984, N'Khellani'),
    (4, 6985, N'Chiralla'),
    (4, 6986, N'Kahara'),
    (4, 6987, N'Bhalla'),
    (4, 6988, N'Dali Udhyanpur'),
    (4, 6989, N'Changa'),
    (4, 6990, N'Jakyas'),
    (4, 6991, N'Chilli Pingal'),
    (8, 6992, N'Keran'),
    (8, 6993, N'Meliyal'),
    (8, 6994, N'Reddi Chowkibal'),
    (8, 6995, N'Qadirabad'),
    (8, 6996, N'Drugmulla'),
    (8, 6997, N'Nutnoosa'),
    (8, 6998, N'Hayhama'),
    (8, 6999, N'Machil'),
    (8, 7000, N'Tarathpora'),
    (8, 7001, N'Magam'),
    (8, 7002, N'Handwara'),
    (8, 7003, N'Mawar Kalamabad'),
    (8, 7004, N'Qaziabad Supernagama'),
    (3, 7006, N'Bijhama'),
    (3, 7007, N'Chandil Wangam'),
    (3, 7008, N'Hardaboora'),
    (3, 7009, N'Kandi Rafiabad'),
    (3, 7010, N'Khaipora'),
    (3, 7011, N'Lalpora'),
    (3, 7012, N'Nadihal'),
    (3, 7013, N'Narwah'),
    (3, 7014, N'Noorkah'),
    (3, 7015, N'Paranpeela'),
    (3, 7016, N'Sangrama'),
    (3, 7017, N'Sherabad Khore'),
    (3, 7018, N'Tujjar Sharief'),
    (3, 7019, N'Wailoo'),
    (1, 7020, N'Bijibehara'),
    (1, 7021, N'Chathergul'),
    (1, 7022, N'Hiller Shahabad'),
    (1, 7031, N'Quimoh Anantnag District Part'),
    (1, 7032, N'Vessu'),
    (1, 7033, N'Verinag'),
    (1, 7034, N'Pahalgam'),
    (1, 7035, N'Larnoo'),
    (1, 7036, N'Sagam'),
    (5, 7037, N'Miran Sahib'),
    (624, 7051, N'Bari Brahmana'),
    (13, 7086, N'Eidgah'),
    (13, 7087, N'Qamarwari'),
    (11, 7088, N'Ichegoza');

INSERT INTO Tehsil (DistrictID, TehsilId, TehsilName) 
VALUES
    (8, 1, N'Kupwara'),
    (8, 2, N'Handwara'),
    (8, 3, N'Karnah'),
    (2, 4, N'Khag'),
    (2, 5, N'Beerwah'),
    (2, 6, N'Khansahib'),
    (2, 7, N'Budgam'),
    (2, 8, N'Chadoora'),
    (2, 9, N'Charar- E- Shrief'),
    (10, 16, N'Haveli'),
    (10, 17, N'Mandi'),
    (10, 18, N'Mendhar'),
    (12, 21, N'Darhal'),
    (12, 22, N'Rajouri'),
    (12, 23, N'Thanamandi'),
    (12, 24, N'Kalakote'),
    (12, 25, N'Nowshera'),
    (7, 26, N'Sunderbani'),
    (7, 27, N'Billawar'),
    (7, 28, N'Basohli'),
    (7, 29, N'Bani'),
    (7, 30, N'Kathua'),
    (7, 31, N'Hiranagar'),
    (7, 32, N'Sukrala'),
    (3, 33, N'Rafiabad'),
    (3, 34, N'Pattan'),
    (3, 35, N'Baramulla'),
    (3, 36, N'Kreeri'),
    (3, 37, N'Wagoora'),
    (3, 38, N'Boniyar'),
    (3, 39, N'Sopore'),
    (623, 40, N'Gurez'),
    (623, 41, N'Bandipora'),
    (626, 45, N'Lar'),
    (626, 46, N'Kangan'),
    (626, 47, N'Ganderbal'),
    (11, 48, N'Pampore'),
    (11, 49, N'Awantipora'),
    (11, 50, N'Wachi'),
    (11, 51, N'Pulwama'),
    (11, 52, N'Zakura'),
    (1, 53, N'Pahalgam'),
    (1, 54, N'Bijbehara'),
    (1, 55, N'Anantnag'),
    (1, 56, N'Shangus'),
    (1, 57, N'Kokernag'),
    (1, 58, N'Dooru'),
    (622, 59, N'Kulgam'),
    (622, 60, N'Devsar'),
    (622, 61, N'D H Pora'),
    (4, 62, N'Doda'),
    (4, 63, N'Thuroo  (Tehsil)'),
    (4, 64, N'Thathri'),
    (4, 65, N'Bhaderwah'),
    (621, 66, N'Banihal'),
    (621, 67, N'Ramban'),
    (620, 68, N'Kishtwar'),
    (620, 69, N'Marwah'),
    (620, 70, N'Chhatroo'),
    (620, 71, N'Atholi (Paddar)'),
    (14, 73, N'Chenani'),
    (14, 74, N'Ramnagar'),
    (14, 75, N'Majalta'),
    (627, 77, N'Reasi'),
    (5, 78, N'Akhnoor'),
    (5, 79, N'Jammu'),
    (5, 80, N'Ranbir Singh Pura'),
    (5, 81, N'Bishnah'),
    (624, 82, N'Samba'),
    (625, 6091, N'Keller'),
    (625, 6092, N'Keegam'),
    (622, 6193, N'Qaimoh'),
    (622, 6194, N'Pahloo'),
    (5, 6700, N'Thuroo'),
    (5, 6701, N'Jourian'),
    (5, 6702, N'Maira Mandrian'),
    (5, 6703, N'Chowki Choura'),
    (5, 6704, N'Kharah Balli'),
    (5, 6705, N'Pargwal'),
    (5, 6706, N'Jammu South'),
    (5, 6707, N'Bahu'),
    (5, 6708, N'Jammu North'),
    (5, 6709, N'Bhalwal'),
    (5, 6710, N'Tirind'),
    (5, 6711, N'Nagrota'),
    (5, 6712, N'Dansal'),
    (5, 6713, N'Mandal'),
    (5, 6714, N'Khour'),
    (5, 6715, N'Marh'),
    (5, 6717, N'Arnia'),
    (5, 6718, N'Jammu West'),
    (624, 6719, N'Rajpura'),
    (624, 6720, N'Bari Brahamana'),
    (624, 6721, N'Ghagwal'),
    (14, 6723, N'Udhampur'),
    (624, 6724, N'Ramgarh'),
    (7, 6725, N'Mahanpur'),
    (7, 6726, N'Dinga Amb'),
    (7, 6727, N'Nagri'),
    (7, 6728, N'Ramkote'),
    (7, 6729, N'Lohai Malhar'),
    (7, 6731, N'Marheen'),
    (14, 6733, N'Tikri'),
    (14, 6734, N'Moungri'),
    (14, 6735, N'Panchari'),
    (14, 6736, N'Basantgarh'),
    (14, 6737, N'Latti'),
    (627, 6738, N'Chassana'),
    (627, 6739, N'Shri Mata Vaishno Devi Shrine Board (SMVDSB)'),
    (627, 6740, N'Arnas'),
    (627, 6741, N'Katra'),
    (627, 6742, N'Pouni'),
    (627, 6743, N'Sool'),
    (627, 6744, N'Bhomag'),
    (4, 6746, N'Bharath Bagla'),
    (4, 6747, N'Bhagwah'),
    (4, 6748, N'Kashtigarh'),
    (4, 6749, N'Gundna'),
    (4, 6750, N'Mohalla'),
    (4, 6751, N'Marmat'),
    (4, 6752, N'Assar'),
    (4, 6753, N'Bhalessa'),
    (4, 6754, N'Chilly Pingal'),
    (4, 6755, N'Bhalla'),
    (4, 6756, N'Kahara'),
    (4, 6757, N'Phigsoo'),
    (4, 6758, N'Chiralla'),
    (621, 6759, N'Khari'),
    (621, 6760, N'Pogal Paristan'),
    (621, 6761, N'Batote'),
    (621, 6762, N'Rajgarh'),
    (621, 6763, N'Gool'),
    (620, 6764, N'Mughalmaidan'),
    (620, 6765, N'Dachhan'),
    (620, 6766, N'Warwan'),
    (620, 6767, N'Machail'),
    (620, 6768, N'Nagseni'),
    (620, 6769, N'Drabshalla'),
    (620, 6770, N'Bounjwah'),
    (12, 6771, N'Khawas'),
    (12, 6772, N'Manjakote'),
    (12, 6773, N'Qila Darhal'),
    (12, 6774, N'Laroka'),
    (12, 6776, N'Beri Pattan'),
    (620, 6777, N'Washer'),
    (10, 6778, N'Balakote'),
    (10, 6779, N'Mankote'),
    (622, 6780, N'Frisal'),
    (8, 6782, N'Keran'),
    (8, 6783, N'Kralpora'),
    (8, 6784, N'Sogam'),
    (8, 6785, N'Machil'),
    (8, 6786, N'Drugmulla'),
    (8, 6787, N'Ramhal'),
    (8, 6788, N'Qaziabad'),
    (8, 6789, N'Langate'),
    (13, 6790, N'Shopian'),
    (8, 6791, N'Lolab'),
    (8, 6792, N'Lalpora'),
    (11, 6793, N'Kakapora'),
    (11, 6794, N'Shahoora'),
    (11, 6795, N'Aripal'),
    (11, 6796, N'Rajpora'),
    (11, 6797, N'Zainapora'),
    (625, 6798, N'Barbugh'),
    (625, 6799, N'Chitragam'),
    (625, 6800, N'Hermain'),
    (13, 6801, N'Khanyar'),
    (13, 6802, N'Channapora'),
    (13, 6803, N'Eidgah'),
    (13, 6804, N'Panthachowk'),
    (13, 6805, N'Sholipora'),
    (626, 6806, N'Gund'),
    (623, 6809, N'Aloosa'),
    (623, 6810, N'Ajas'),
    (623, 6811, N'Hajin'),
    (2, 6813, N'Narbal'),
    (2, 6814, N'Magam'),
    (2, 6815, N'Bk Pora'),
    (1, 6816, N'Shahbad Bala'),
    (1, 6817, N'Qazigund'),
    (1, 6818, N'Sallar'),
    (1, 6820, N'Larnoo'),
    (1, 6821, N'Shangus East'),
    (1, 6822, N'Anantnag East'),
    (1, 6823, N'Shirat'),
    (3, 6824, N'Danghiwacha'),
    (3, 6827, N'Dangarpora'),
    (3, 6828, N'Khoie'),
    (3, 6829, N'Kawarhama'),
    (3, 6830, N'Kunzar'),
    (627, 6850, N'Mahore'),
    (12, 6851, N'Koteranka'),
    (621, 7201, N'Ramsoo'),
    (3, 7202, N'Narvaw'),
    (4, 7203, N'Bhella'),
    (4, 7204, N'Sundar Doda'),
    (8, 7205, N'Qalamabad');

INSERT INTO Users (UserId,Name,Username,Email,Password,MobileNumber,Profile,UserType,BackupCodes,IsEmailValid,RegisteredDate) VALUES
	 (1,N'dswo officer',N'dswoJMU',N'dswojmu@gmail.com',0x09A458B9C2A43317A67C4088703393DC4522ABADB055FD651C184CAD5186E24A,N'9876543210',N'/profile/c521fe58.jpg',N'Officer',N'{"unused":["37356567","93082747","40376111","98519413","98194300","41082374","45180083","71423301","05989387","76134362"],"used":[]}',1,N'27 Oct 2024 01:14:28 PM'),
	 (2,N'Momin Rather',N'momin',N'momin.rather@gmail.com',0x09A458B9C2A43317A67C4088703393DC4522ABADB055FD651C184CAD5186E24A,N'9149653661',N'/profile/f91431f4.jpg',N'Citizen',N'{"unused":["51946340","27681698","27498722","86473892","59468100","85146986","48325172","63487207","23832061","75617109"],"used":[]}',1,N'27 Oct 2024 02:47:35 PM'),
	 (3,N'ddc Officer',N'ddcJMU',N'ddc@gmail.com',0x09A458B9C2A43317A67C4088703393DC4522ABADB055FD651C184CAD5186E24A,N'9876543210',N'/assets/images/profile.jpg',N'Officer',N'{"unused":["30009523","19625635","24945370","53097204","30762210","06389762","74817003","71966449","81710584","98760225"],"used":[]}',1,N'02 Nov 2024 06:11:07 PM'),
	 (4,N'Director Finance',N'dirFinance',N'dirFin@gmail.com',0x09A458B9C2A43317A67C4088703393DC4522ABADB055FD651C184CAD5186E24A,N'9876541230',N'/assets/images/profile.jpg',N'Officer',N'{"unused":["56010125","62921547","72929893","82829519","48299712","10236037","45925656","39479483","29319068","78503152"],"used":[]}',1,N'02 Nov 2024 06:25:40 PM'),
	 (5,N'State Admin',N'jkAdmin',N'jkadmin@gmail.com',0x09A458B9C2A43317A67C4088703393DC4522ABADB055FD651C184CAD5186E24A,N'9876543211',N'/assets/images/profile.jpg',N'Admin',N'{"unused":["13293040","17540164","21139295","50467022","07639286","49112968","07201134","30029775","56108311","19642960"],"used":[]}',1,N'03 Nov 2024 04:51:50 PM'),
	 (6,N'DSWO ANT',N'dswoANT',N'dswoant@gmail.com',0x09A458B9C2A43317A67C4088703393DC4522ABADB055FD651C184CAD5186E24A,N'9876543210',N'/assets/images/profile.jpg',N'Officer',N'{"unused":["00820241","76936368","70860403","82004719","12482265","21100160","64026120","89478511","74838079","19348691"],"used":[]}',1,N'22 Nov 2024 11:03:16 AM'),
	 (7,N'DDC ANT',N'ddcANT',N'ddcant@gmail.com',0x09A458B9C2A43317A67C4088703393DC4522ABADB055FD651C184CAD5186E24A,N'9876543218',N'/assets/images/profile.jpg',N'Officer',N'{"unused":["79723753","48957629","38568396","91637311","37750097","91573661","43174111","45736058","67470026","08858124"],"used":[]}',0,N'22 Nov 2024 03:24:33 PM');

INSERT INTO OfficerDetails (OfficerId,[Role],AccessLevel,AccessCode) VALUES
	 (1,N'District Social Welfare Officer',N'District',5),
	 (3,N'Deputy Development Commissioner',N'District',5),
	 (4,N'Director Finance',N'State',0),
	 (5,N'State Level Admin',N'State',0),
	 (6,N'District Social Welfare Officer',N'District',1),
	 (7,N'Deputy Development Commissioner',N'District',1);

INSERT INTO OfficersDesignations (Designation,DesignationShort,AccessLevel) VALUES
	 (N'District Social Welfare Officer',N'DSWO',N'District'),
	 (N'Deputy Development Commissioner',N'DDC',N'District'),
	 (N'Director Finance',N'DirFin',N'State'),
	 (N'State Level Admin',N'SA',N'State');

INSERT INTO Services (ServiceName,NameShort,Department,FormElement,BankDetails,OfficerEditableField,webService,CreatedAt,Active) VALUES
	 (N'Application for obtaining assistance under Marriage Assistance Scheme',N'MAS',N'Social Welfare',N'[{"section":"Applicant Details","fields":[{"type":"select","label":"Select District Social Welfare Officer","name":"District","isFormSpecific":true,"validationFunctions":["notEmpty"]},{"type":"text","label":"Full Name","name":"ApplicantName","validationFunctions":["notEmpty","onlyAlphabets"],"transformationFunctions":["CapitalizeAlphabets"]},{"type":"file","label":"Applicant Photo","name":"ApplicantImage","validationFunctions":["notEmpty","validateFile"],"accept":".jpg,.jpeg,.png"},{"type":"date","label":"Date Of Birth","name":"DateOfBirth","validationFunctions":["notEmpty","isAgeGreaterThan"],"maxLength":18,"transformationFunctions":["CapitalizeAlphabets"]},{"type":"text","label":"Mobile Number","name":"MobileNumber","validationFunctions":["notEmpty","onlyDigits","specificLength"],"maxLength":10},{"type":"email","label":"Email","name":"Email","validationFunctions":["notEmpty","isEmailValid"]},{"type":"select","label":"Category","name":"Category","options":["PRIORITY HOUSEHOLD (PHH)","ANTYODAYA ANNA YOJANA (AAY)"],"validationFunctions":["notEmpty"],"transformationFunctions":["CapitalizeAlphabets"]},{"type":"date","name":"DateOfMarriage","label":"Date Of Marriage","isFormSpecific":true,"validationFunctions":["notEmpty","isDateWithinRange"],"minLength":"1","maxLength":"6"},{"type":"radio","label":"Relation","name":"Relation","options":["Father","Guardian"],"validationFunctions":["notEmpty","onlyAlphabets"],"transformationFunctions":["CapitalizeAlphabets"]},{"type":"text","label":"Relation Name","name":"RelationName","options":["Father","Guardian"],"validationFunctions":["notEmpty","onlyAlphabets"],"transformationFunctions":["CapitalizeAlphabets"]},{"type":"text","name":"MotherName","label":"Mother''s Name","isFormSpecific":true,"validationFunctions":["notEmpty","onlyAlphabets"],"transformationFunctions":["CapitalizeAlphabets"]}]},{"section":"Present Address Details","fields":[{"type":"text","label":"Address","name":"PresentAddress","validationFunctions":["notEmpty"],"transformationFunctions":["CapitalizeAlphabets"]},{"type":"select","label":"District","name":"PresentDistrict","validationFunctions":["notEmpty"],"transformationFunctions":["CapitalizeAlphabets"]},{"type":"select","label":"Tehsil","name":"PresentTehsil","validationFunctions":["notEmpty"],"transformationFunctions":["CapitalizeAlphabets"]},{"type":"select","label":"Block","name":"PresentBlock","validationFunctions":["notEmpty"],"transformationFunctions":["CapitalizeAlphabets"]},{"type":"text","label":"Halqa Panchayat/ Muncipality Name","name":"PresentPanchayatMuncipality","validationFunctions":["notEmpty"],"transformationFunctions":["CapitalizeAlphabets"]},{"type":"text","label":"Village Name","name":"PresentVillage","validationFunctions":["notEmpty"],"transformationFunctions":["CapitalizeAlphabets"]},{"type":"text","label":"Ward Name","name":"PresentWard","validationFunctions":["notEmpty"],"transformationFunctions":["CapitalizeAlphabets"]},{"type":"text","label":"Pincode","name":"PresentPincode","validationFunctions":["notEmpty","onlyDigits","specificLength"],"maxLength":6,"transformationFunctions":["CapitalizeAlphabets"]}]},{"section":"Permanent Address Details","fields":[{"type":"checkbox","label":"Same As Present","name":"SameAsPresent","validationFunctions":[]},{"type":"text","label":"Address","name":"PermanentAddress","validationFunctions":["notEmpty"],"transformationFunctions":["CapitalizeAlphabets"]},{"type":"select","label":"District","name":"PermanentDistrict","validationFunctions":["notEmpty"],"transformationFunctions":["CapitalizeAlphabets"]},{"type":"select","label":"Tehsil","name":"PermanentTehsil","validationFunctions":["notEmpty"],"transformationFunctions":["CapitalizeAlphabets"]},{"type":"select","label":"Block","name":"PermanentBlock","validationFunctions":["notEmpty"],"transformationFunctions":["CapitalizeAlphabets"]},{"type":"text","label":"Halqa Panchayat/ Muncipality Name","name":"PermanentPanchayatMuncipality","validationFunctions":["notEmpty"],"transformationFunctions":["CapitalizeAlphabets"]},{"type":"text","label":"Village Name","name":"PermanentVillage","validationFunctions":["notEmpty"],"transformationFunctions":["CapitalizeAlphabets"]},{"type":"text","label":"Ward Name","name":"PermanentWard","validationFunctions":["notEmpty"],"transformationFunctions":["CapitalizeAlphabets"]},{"type":"text","label":"Pincode","name":"PermanentPincode","validationFunctions":["notEmpty","onlyDigits","specificLength"],"maxLength":6,"transformationFunctions":["CapitalizeAlphabets"]}]},{"section":"Bank Details","fields":[{"type":"select","label":"Bank Name","name":"BankName","options":["THE JAMMU AND KASHMIR BANK LTD.","J & K GRAMEEN BANK","ELLAQUAI DEHTI BANK","INDIA POST PAYMENTS BANK"],"validationFunctions":["notEmpty"],"transformationFunctions":["CapitalizeAlphabets"]},{"type":"text","label":"Branch Name","name":"BranchName","validationFunctions":["notEmpty"],"transformationFunctions":["CapitalizeAlphabets"]},{"type":"text","label":"IFSC Code","name":"IfscCode","validationFunctions":["notEmpty","specificLength"],"maxLength":11,"transformationFunctions":["CapitalizeAlphabets"]},{"type":"text","label":"Account Number","name":"AccountNumber","validationFunctions":["notEmpty","onlyDigits","specificLength","duplicateAccountNumber"],"maxLength":16,"transformationFunctions":["CapitalizeAlphabets"]}]},{"section":"Documents","fields":[{"type":"select","name":"IdentityProofEnclosure","label":"Identity Proof","options":["Driving Licence","Voter Card (Both Sides)","Ration Card (Inner & Outter Both)","Aadhar Card (Both Sides)","Domicile Certificate"],"validationFunctions":["notEmpty"]},{"type":"file","name":"IdentityProofFile","label":"Identity Proof","validationFunctions":["notEmpty","validateFile"],"accept":".pdf"},{"type":"select","name":"AddressProofEnclosure","label":"Address Proof","options":["Voter Card (Both Sides)","Ration Card (Inner & Outter Both)","Aadhar Card (Both Sides)","Domicile Certificate","Passport (With Address Side)"],"validationFunctions":["notEmpty"]},{"type":"file","name":"AddressProofFile","label":"Address Proof","validationFunctions":["notEmpty","validateFile"],"accept":".pdf"},{"type":"select","name":"RationCardEnclosure","label":"Ration Card","options":["Ration Card (Inner & Outter Both)"],"validationFunctions":["notEmpty"]},{"type":"file","name":"RationCardFile","label":"Ration Card","validationFunctions":["notEmpty","validateFile"],"accept":".pdf"},{"type":"select","name":"EducationQualificationCertificateEnclosure","label":"Education Qualification Certificate","options":["Education Qualification Certificate"],"validationFunctions":["notEmpty"]},{"type":"file","name":"EducationQualificationCertificateFile","label":"Education Qualification Certificate","validationFunctions":["notEmpty","validateFile"],"accept":".pdf"},{"type":"select","name":"ProofofDateofBirthEnclosure","label":"Proof of Date of Birth","options":["Birth Certificate issued by School","Birth Certificate from Registrar of Birth and Death","Matriculation Certificate"],"validationFunctions":["notEmpty"]},{"type":"file","name":"ProofofDateofBirthFile","label":"Proof of Date of Birth","validationFunctions":["notEmpty","validateFile"],"accept":".pdf"},{"type":"select","name":"AadharCardEnclosure","label":"Aadhar Card","options":["Aadhar Card (Both Sides)"],"validationFunctions":["notEmpty"]},{"type":"file","name":"AadharCardFile","label":"Aadhar Card","validationFunctions":["notEmpty","validateFile"],"accept":".pdf"},{"type":"select","name":"DomicileCertificateEnclosure","label":"Domicile Certificate","options":["Domicile Certificate"],"validationFunctions":["notEmpty"]},{"type":"file","name":"DomicileCertificateFile","label":"Domicile Certificate","validationFunctions":["notEmpty","validateFile"],"accept":".pdf"},{"type":"select","name":"BankPassbookEnclosure","label":"Bank Passbook","options":["Bank Passbook"],"validationFunctions":["notEmpty"]},{"type":"file","name":"BankPassbookFile","label":"Bank Passbook","validationFunctions":["notEmpty","validateFile"],"accept":".pdf"},{"type":"select","name":"MarriageCardEnclosure","label":"Marriage Card","options":["Marriage Card"],"validationFunctions":["notEmpty"]},{"type":"file","name":"MarriageCardFile","label":"Marriage Card","validationFunctions":["notEmpty","validateFile"],"accept":".pdf"},{"type":"select","name":"AffidavitdulyattestedbytheJudicialMagistrateFirstClassEnclosure","label":"Affidavit duly attested by the Judicial Magistrate First Class","options":["Affidavit duly attested by the Judicial Magistrate First Class"],"validationFunctions":["notEmpty"]},{"type":"file","name":"AffidavitdulyattestedbytheJudicialMagistrateFirstClassFile","label":"Affidavit duly attested by the Judicial Magistrate First Class","validationFunctions":["notEmpty","validateFile"],"accept":".pdf"},{"type":"select","name":"ConsentFormforAadharSeedingoftheBankAccountEnclosure","label":"Consent Form for Aadhar Seeding of the Bank Account","options":["Consent Form for Aadhar Seeding of the Bank Account"],"validationFunctions":["notEmpty"]},{"type":"file","name":"ConsentFormforAadharSeedingoftheBankAccountFile","label":"Consent Form for Aadhar Seeding of the Bank Account","validationFunctions":["notEmpty","validateFile"],"accept":".pdf"},{"type":"select","name":"OtherEnclosure","label":"Other","options":["Other"],"validationFunctions":["notEmpty"]},{"type":"file","name":"OtherFile","label":"Other","validationFunctions":["notEmpty","validateFile"],"accept":".pdf"}]}]',N'{"1": {"Bank Name": "The Jammu Kashmir Bank", "IFSC Code": "SOME247JAMU", "Account Number": "1928473828192002","Amount":"500000"}, "2": {"Bank Name": "The Jammu Kashmir Bank", "IFSC Code": "SOME247KASH", "Account Number": "1928473828192001","Amount":"500000"}}',N'{ "type": "date", "name": "DateOfMarriage", "label": "Date Of Marriage", "isFormSpecific": true, "validationFunctions": ["notEmpty", "isDateWithinRange"], "minLength": "1", "maxLength": "6" }',N'{"onsubmit":[1],"onsanction":[],"onreject":[]}',N'23 OCT 2024 10:23',1);


INSERT INTO WorkFlow (ServiceId,[Role],SequenceOrder,canForward,canReturn,canReturnToEdit,canUpdate,canSanction,canReject) VALUES
	 (1,N'District Social Welfare Officer',1,1,0,1,1,0,1),
	 (1,N'Deputy Development Commissioner',2,1,1,0,0,0,1),
	 (1,N'Director Finance',3,0,0,0,0,1,1);

