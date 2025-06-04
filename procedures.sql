CREATE PROCEDURE [dbo].[GetApplicationsForOfficer]
    @Role VARCHAR(255),
    @AccessLevel VARCHAR(20),
    @AccessCode INT,
    @ApplicationStatus VARCHAR(50) = NULL,
    @ServiceId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        ca.ReferenceNumber,
        MAX(ca.Citizen_id) AS Citizen_id,
        MAX(ca.ServiceId) AS ServiceId,
        MAX(ca.FormDetails) AS FormDetails,
        MAX(ca.WorkFlow) AS WorkFlow,
        MAX(ca.AdditionalDetails) AS AdditionalDetails,
        MAX(ca.CurrentPlayer) AS CurrentPlayer,
        MAX(ca.[Status]) AS [Status],
        MAX(ca.Created_at) AS Created_at
    FROM
        [dbo].[Citizen_Applications] ca
    CROSS APPLY
        OPENJSON(ca.WorkFlow) AS wf
    OUTER APPLY
        OPENJSON(ca.FormDetails, '$.Location') WITH (
            name NVARCHAR(50) '$.name',
            value INT '$.value'
        ) AS jsonLocation
    LEFT JOIN
        [dbo].[District] d ON jsonLocation.name = 'District' AND jsonLocation.value = d.DistrictID
    WHERE
        ca.ServiceId = @ServiceId
        AND JSON_VALUE(wf.value, '$.designation') = @Role
        AND (
            @AccessLevel = 'State'
            OR (@AccessLevel = 'District' AND jsonLocation.name = 'District' AND jsonLocation.value = @AccessCode)
            OR (@AccessLevel = 'Tehsil' AND jsonLocation.name = 'Tehsil' AND jsonLocation.value = @AccessCode)
            OR (@AccessLevel = 'Division' AND jsonLocation.name = 'District' AND d.Division = @AccessCode)
        )
        AND (
            @ApplicationStatus = 'Total Applications' 
            OR JSON_VALUE(wf.value, '$.status') = @ApplicationStatus
        )
        AND JSON_VALUE(wf.value, '$.status') <> ''
    GROUP BY
        ca.ReferenceNumber
END;

CREATE PROCEDURE [dbo].[GetDuplicateAccNo]
    @AccountNumber VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        ca.*
    FROM 
        [dbo].[Citizen_Applications] ca
    CROSS APPLY
        OPENJSON(ca.FormDetails, '$."Bank Details"') WITH (
            name NVARCHAR(50) '$.name',
            value NVARCHAR(50) '$.value'
        ) AS bankDetails
    WHERE 
        bankDetails.name = 'AccountNumber'
        AND bankDetails.value = @AccountNumber;

END;

CREATE PROCEDURE GetIfscCode
    @BankName VARCHAR(255),
    @BranchName VARCHAR(255)
AS
BEGIN
    SELECT IFSC FROM AllBankDetails WHERE BANK LIKE @BankName+'%' AND BRANCH LIKE @BranchName+'%';
END;

CREATE PROCEDURE [dbo].[GetOfficerDetails]
    @UserId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        u.UserId,
        u.Name,
        u.Username,
        u.Email,
        u.MobileNumber,
        u.Profile,
        u.UserType,
        u.IsEmailValid,
        u.RegisteredDate,
        o.DetailId,
        o.Role,
        o.AccessLevel,
        o.AccessCode
    FROM 
        [dbo].[Users] u
    LEFT JOIN 
        [dbo].[OfficerDetails] o ON u.UserId = o.OfficerId
    WHERE 
        (@UserId IS NULL OR u.UserId = @UserId);
END;

CREATE PROCEDURE [dbo].[GetServicesByRole]
    @Role VARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        s.ServiceId,
        s.ServiceName
    FROM 
        [dbo].[Services] s
    CROSS APPLY 
        OPENJSON(s.OfficerEditableField) WITH (
            designation NVARCHAR(255) '$.designation'
        ) AS jsonValues
    WHERE 
        jsonValues.designation = @Role
        AND s.Active = 1;
END;

CREATE PROCEDURE [dbo].[GetStatusCount]
    @AccessLevel VARCHAR(20),
    @AccessCode INT,
    @ServiceId INT,
    @TakenBy VARCHAR(50),
    @DivisionCode INT = NULL  -- <- optional parameter
AS
BEGIN
    SET NOCOUNT ON;

    WITH RankedStatus AS (
        SELECT 
            ca.ReferenceNumber,
            ca.ServiceId,
            ca.FormDetails,
            jsonWorkFlow.status,
            jsonWorkFlow.designation,
            ROW_NUMBER() OVER (
                PARTITION BY ca.ReferenceNumber 
                ORDER BY COALESCE(jsonWorkFlow.timestamp, '9999-12-31') DESC, jsonWorkFlow.seq DESC
            ) AS rn
        FROM 
            [dbo].[Citizen_Applications] ca
        CROSS APPLY
            OPENJSON(ca.WorkFlow) WITH (
                status NVARCHAR(50) '$.status',
                timestamp DATETIME '$.timestamp',
                seq INT '$.seq',
                designation NVARCHAR(50) '$.designation'
            ) AS jsonWorkFlow
        WHERE
            jsonWorkFlow.status IS NOT NULL
            AND jsonWorkFlow.status <> ''
            AND jsonWorkFlow.designation = @TakenBy
            AND ca.ServiceId = @ServiceId
            AND ISJSON(ca.WorkFlow) = 1
    ),
    LatestStatus AS (
        SELECT 
            ReferenceNumber,
            ServiceId,
            FormDetails,
            status
        FROM 
            RankedStatus
        WHERE 
            rn = 1
    ),
    FilteredApplications AS (
        SELECT 
            ls.ReferenceNumber,
            ls.ServiceId,
            ls.status
        FROM 
            LatestStatus ls
        CROSS APPLY
            OPENJSON(ls.FormDetails, '$.Location') WITH (
                name NVARCHAR(50) '$.name',
                value INT '$.value'
            ) AS jsonLocation
        LEFT JOIN
            [dbo].[District] d ON jsonLocation.name = 'District' AND jsonLocation.value = d.DistrictID
        WHERE
            ls.ServiceId = @ServiceId
            AND (
            @AccessLevel = 'State'
            OR (@AccessLevel = 'District' AND jsonLocation.name = 'District' AND jsonLocation.value = @AccessCode)
            OR (@AccessLevel = 'Tehsil' AND jsonLocation.name = 'Tehsil' AND jsonLocation.value = @AccessCode)
            OR (
                @AccessLevel = 'Division' AND (
                    -- For District filter
                    (jsonLocation.name = 'District' AND jsonLocation.value = @AccessCode AND d.Division = @DivisionCode)
                    -- For Tehsil filter
                    OR
                    (jsonLocation.name = 'Tehsil' AND EXISTS (
                        SELECT 1 FROM Tehsil t
                        INNER JOIN District d2 ON t.DistrictID = d2.DistrictID
                        WHERE t.TehsilID = jsonLocation.value AND d2.Division = @DivisionCode
                    ))
                )
            )
        )
        GROUP BY ls.ReferenceNumber, ls.ServiceId, ls.status
    )
    SELECT
        ISNULL(SUM(CASE WHEN fa.status = 'pending' THEN 1 ELSE 0 END), 0) AS PendingCount,
        ISNULL(SUM(CASE WHEN fa.status = 'forwarded' THEN 1 ELSE 0 END), 0) AS ForwardedCount,
        ISNULL(SUM(CASE WHEN fa.status = 'returned' THEN 1 ELSE 0 END), 0) AS ReturnedCount,
        ISNULL(SUM(CASE WHEN fa.status = 'returnToEdit' THEN 1 ELSE 0 END), 0) AS ReturnToEditCount,
        ISNULL(SUM(CASE WHEN fa.status = 'sanctioned' THEN 1 ELSE 0 END), 0) AS SanctionedCount,
        ISNULL(SUM(CASE WHEN fa.status = 'rejected' THEN 1 ELSE 0 END), 0) AS RejectCount,
        ISNULL(SUM(CASE WHEN fa.status = 'disbursed' THEN 1 ELSE 0 END), 0) AS DisbursedCount,
        COUNT(DISTINCT fa.ReferenceNumber) AS TotalApplications
    FROM
        FilteredApplications fa;
END;

CREATE PROCEDURE [dbo].[InsertOfficerDetail]
    @OfficerId INT,
    @Role VARCHAR(50),
    @AccessLevel VARCHAR(20),
    @AccessCode INT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO OfficerDetails (OfficerId, [Role], AccessLevel, AccessCode)
    VALUES (@OfficerId, @Role, @AccessLevel, @AccessCode);

    -- Return the ID of the newly inserted record
    SELECT SCOPE_IDENTITY() AS NewDetailId;
END;

CREATE PROCEDURE [dbo].[RegisterUser]
    @Name VARCHAR(100),
    @Username NVARCHAR(100),
    @Password NVARCHAR(100),
    @Email NVARCHAR(100),
    @MobileNumber NVARCHAR(20),
    @Profile VARCHAR(100),
    @UserType NVARCHAR(50),
    @BackupCodes NVARCHAR(MAX),
    @RegisteredDate NVARCHAR(120)
AS
BEGIN
    SET NOCOUNT ON;

    -- Hash the password (example using a simple SHA-256 hash; adjust as needed)
    DECLARE @HashedPassword VARBINARY(64); -- Adjust size as needed for SHA-256
    SET @HashedPassword = HASHBYTES('SHA2_256', @Password);

    -- Insert the user record into the Users table
    INSERT INTO Users ([Name],Username, [Password], Email, MobileNumber, [Profile], UserType, BackupCodes,RegisteredDate)
    VALUES (@Name,@Username, @HashedPassword, @Email, @MobileNumber, @Profile, @UserType, @BackupCodes,@RegisteredDate);

        -- Return a success result with the new UserId (assuming UserId is auto-incremented)
    SELECT * FROM Users WHERE UserId = SCOPE_IDENTITY();
   
END;

CREATE PROCEDURE UpdateNullOfficer
    @NewOfficerId INT,
    @AccessLevel VARCHAR(10),
    @AccessCode INT,
    @Role VARCHAR(50)
AS
BEGIN
    -- Update ApplicationsHistory to assign a value to NULL OfficerId
UPDATE ApplicationsHistory
SET TakenBy = @NewOfficerId
WHERE TakenBy IS NULL
  AND AccessLevel = @AccessLevel
  AND AccessCode = @AccessCode
  AND Role = @Role;

-- Update ApplicationsStatus to assign a value to NULL OfficerId
UPDATE ApplicationStatus
SET CurrentlyWith = @NewOfficerId
WHERE CurrentlyWith IS NULL
  AND AccessLevel = @AccessLevel
  AND AccessCode = @AccessCode
  AND Role = @Role;

-- Update ApplicationsCount to assign a value to NULL OfficerId
UPDATE ApplicationsCount
SET OfficerId = @NewOfficerId
WHERE OfficerId IS NULL
  AND AccessLevel = @AccessLevel
  AND AccessCode = @AccessCode
  AND Role = @Role;

END;

CREATE PROCEDURE [dbo].[UserLogin]
    @Username NVARCHAR(50),
    @Password NVARCHAR(50)
AS
BEGIN
    -- Declare a variable to hold the hashed password
    DECLARE @PasswordHash VARBINARY(64);
    
    -- Hash the input password using SHA2_256 (or SHA2_512)
    SET @PasswordHash = HASHBYTES('SHA2_256', @Password);

    -- Retrieve user details where the username matches and the hashed password matches
    SELECT *
    FROM Users
    WHERE Username = @Username AND [Password] = @PasswordHash;
END;