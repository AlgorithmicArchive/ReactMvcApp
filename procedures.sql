-- Procedure to Check and Insert Address
CREATE PROCEDURE [dbo].[CheckAndInsertAddress]
    @DistrictId INT,
    @TehsilId INT,
    @BlockId INT,
    @HalqaPanchayatName VARCHAR(255),
    @VillageName VARCHAR(255),
    @WardName VARCHAR(255),
    @Pincode INT,
    @AddressDetails VARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @HalqaPanchayatId INT,
            @VillageId INT,
            @WardId INT,
            @PincodeId INT;

    -- Check if HalqaPanchayat exists, if not, insert
    SELECT @HalqaPanchayatId = UUID 
    FROM dbo.HalqaPanchayat 
    WHERE PanchayatName = @HalqaPanchayatName AND BlockId = @BlockId;

    IF @HalqaPanchayatId IS NULL
    BEGIN
        INSERT INTO dbo.HalqaPanchayat (BlockId, PanchayatName)
        VALUES (@BlockId, @HalqaPanchayatName);
        SET @HalqaPanchayatId = SCOPE_IDENTITY();
    END

    -- Check if Village exists, if not, insert
    SELECT @VillageId = UUID
    FROM dbo.Village
    WHERE VillageName = @VillageName AND HalqaPanchayatId = @HalqaPanchayatId AND TehsilId = @TehsilId;

    IF @VillageId IS NULL
    BEGIN
        INSERT INTO dbo.Village (HalqaPanchayatId, TehsilId, VillageName)
        VALUES (@HalqaPanchayatId, @TehsilId, @VillageName);
        SET @VillageId = SCOPE_IDENTITY();
    END

    -- Check if Ward exists, if not, insert
    SELECT @WardId = UUID
    FROM dbo.Ward
    WHERE WardName = @WardName AND VillageId = @VillageId;

    IF @WardId IS NULL
    BEGIN
        INSERT INTO dbo.Ward (VillageId, WardName)
        VALUES (@VillageId, @WardName);
        SET @WardId = SCOPE_IDENTITY();
    END

    -- Check if Pincode exists, if not, insert
    SELECT @PincodeId = pincode_id
    FROM dbo.Pincode
    WHERE Pincode = @Pincode;

    IF @PincodeId IS NULL
    BEGIN
        INSERT INTO dbo.Pincode (Pincode)
        VALUES (@Pincode);
        SET @PincodeId = SCOPE_IDENTITY();
    END

    -- Insert into Address table
    INSERT INTO dbo.Address (
        DistrictId, TehsilId, BlockId, HalqaPanchayatId, VillageId, WardId, PincodeId, AddressDetails
    )
    VALUES (
        @DistrictId, @TehsilId, @BlockId, @HalqaPanchayatId, @VillageId, @WardId, @PincodeId, @AddressDetails
    );

    SELECT * FROM Address WHERE AddressId = SCOPE_IDENTITY();
END;

-- Procedure to Check and Update Address
CREATE PROCEDURE [dbo].[CheckAndUpdateAddress]
    @AddressId INT,
    @DistrictId INT = NULL,
    @TehsilId INT = NULL,
    @BlockId INT = NULL,
    @HalqaPanchayatName VARCHAR(255) = NULL,
    @VillageName VARCHAR(255) = NULL,
    @WardName VARCHAR(255) = NULL,
    @Pincode INT = NULL,
    @AddressDetails VARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @HalqaPanchayatId INT,
            @VillageId INT,
            @WardId INT,
            @PincodeId INT;

    -- Check for HalqaPanchayatName if provided
    IF @HalqaPanchayatName IS NOT NULL
    BEGIN
        SELECT @HalqaPanchayatId = UUID 
        FROM dbo.HalqaPanchayat 
        WHERE PanchayatName = @HalqaPanchayatName AND BlockId = ISNULL(@BlockId, BlockId);

        IF @HalqaPanchayatId IS NULL
        BEGIN
            INSERT INTO dbo.HalqaPanchayat (BlockId, PanchayatName)
            VALUES (@BlockId, @HalqaPanchayatName);
            SET @HalqaPanchayatId = SCOPE_IDENTITY();
        END
    END

    -- Check for VillageName if provided
    IF @VillageName IS NOT NULL
    BEGIN
        SELECT @VillageId = UUID
        FROM dbo.Village
        WHERE VillageName = @VillageName AND HalqaPanchayatId = ISNULL(@HalqaPanchayatId, HalqaPanchayatId);

        IF @VillageId IS NULL
        BEGIN
            INSERT INTO dbo.Village (HalqaPanchayatId, TehsilId, VillageName)
            VALUES (@HalqaPanchayatId, @TehsilId, @VillageName);
            SET @VillageId = SCOPE_IDENTITY();
        END
    END

    -- Check for WardName if provided
    IF @WardName IS NOT NULL
    BEGIN
        SELECT @WardId = UUID
        FROM dbo.Ward
        WHERE WardName = @WardName AND VillageId = ISNULL(@VillageId, VillageId);

        IF @WardId IS NULL
        BEGIN
            INSERT INTO dbo.Ward (VillageId, WardName)
            VALUES (@VillageId, @WardName);
            SET @WardId = SCOPE_IDENTITY();
        END
    END

    -- Check for Pincode if provided
    IF @Pincode IS NOT NULL
    BEGIN
        SELECT @PincodeId = pincode_id
        FROM dbo.Pincode
        WHERE Pincode = @Pincode;

        IF @PincodeId IS NULL
        BEGIN
            INSERT INTO dbo.Pincode (Pincode)
            VALUES (@Pincode);
            SET @PincodeId = SCOPE_IDENTITY();
        END
    END

    -- Build dynamic SQL for updating only provided columns
    DECLARE @sql NVARCHAR(MAX) = N'UPDATE dbo.Address SET ';
    DECLARE @params NVARCHAR(MAX) = N'';

    IF @DistrictId IS NOT NULL
    BEGIN
        SET @sql = @sql + N'DistrictId = @DistrictId, ';
        SET @params = @params + N'@DistrictId INT, ';
    END

    IF @TehsilId IS NOT NULL
    BEGIN
        SET @sql = @sql + N'TehsilId = @TehsilId, ';
        SET @params = @params + N'@TehsilId INT, ';
    END

    IF @BlockId IS NOT NULL
    BEGIN
        SET @sql = @sql + N'BlockId = @BlockId, ';
        SET @params = @params + N'@BlockId INT, ';
    END

    IF @HalqaPanchayatId IS NOT NULL
    BEGIN
        SET @sql = @sql + N'HalqaPanchayatId = @HalqaPanchayatId, ';
        SET @params = @params + N'@HalqaPanchayatId INT, ';
    END

    IF @VillageId IS NOT NULL
    BEGIN
        SET @sql = @sql + N'VillageId = @VillageId, ';
        SET @params = @params + N'@VillageId INT, ';
    END

    IF @WardId IS NOT NULL
    BEGIN
        SET @sql = @sql + N'WardId = @WardId, ';
        SET @params = @params + N'@WardId INT, ';
    END

    IF @PincodeId IS NOT NULL
    BEGIN
        SET @sql = @sql + N'PincodeId = @PincodeId, ';
        SET @params = @params + N'@PincodeId INT, ';
    END

    IF @AddressDetails IS NOT NULL
    BEGIN
        SET @sql = @sql + N'AddressDetails = @AddressDetails, ';
        SET @params = @params + N'@AddressDetails VARCHAR(MAX), ';
    END

    -- Remove trailing comma and space
    SET @sql = LEFT(@sql, LEN(@sql) - 2);

    -- Complete the SQL statement
    SET @sql = @sql + N' WHERE AddressId = @AddressId';
    SET @params = @params + N'@AddressId INT';

    -- Execute the dynamic SQL
    EXEC sp_executesql @sql, @params,
        @DistrictId = @DistrictId,
        @TehsilId = @TehsilId,
        @BlockId = @BlockId,
        @HalqaPanchayatId = @HalqaPanchayatId,
        @VillageId = @VillageId,
        @WardId = @WardId,
        @PincodeId = @PincodeId,
        @AddressDetails = @AddressDetails,
        @AddressId = @AddressId;
END;

-- Procedure to Get Address Details
CREATE PROCEDURE [dbo].[GetAddressDetails]
    @AddressId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        a.AddressId,
        a.AddressDetails AS Address,
        d.DistrictName AS District,
        d.DistrictId,
        t.TehsilName AS Tehsil,
        t.TehsilId,
        b.BlockName AS Block,
        b.BlockId,
        hp.PanchayatName AS PanchayatMuncipality,
        v.VillageName AS Village,
        w.WardName AS Ward,
        p.Pincode
    FROM 
        dbo.Address a
    INNER JOIN 
        dbo.District d ON a.DistrictId = d.DistrictId
    LEFT JOIN 
        dbo.Tehsil t ON a.TehsilId = t.TehsilId
    LEFT JOIN 
        dbo.Block b ON a.BlockId = b.BlockId
    LEFT JOIN 
        dbo.HalqaPanchayat hp ON a.HalqaPanchayatId = hp.UUID
    LEFT JOIN 
        dbo.Village v ON a.VillageId = v.UUID
    LEFT JOIN 
        dbo.Ward w ON a.WardId = w.UUID
    LEFT JOIN 
        dbo.Pincode p ON a.PincodeId = p.pincode_id
    WHERE 
        (@AddressId IS NULL OR a.AddressId = @AddressId);
END;

CREATE PROCEDURE GetAdjacentRole
    @ServiceId INT,
    @Role VARCHAR(255),
    @Direction VARCHAR(10) -- 'NEXT' or 'PREVIOUS'
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CurrentSequenceOrder INT;

    -- Find the current SequenceOrder of the given role
    SELECT @CurrentSequenceOrder = SequenceOrder
    FROM dbo.WorkFlow
    WHERE ServiceId = @ServiceId AND Role = @Role;

    -- Check if the role was found
    IF @CurrentSequenceOrder IS NULL
    BEGIN
        PRINT 'Role not found for the provided ServiceId';
        RETURN;
    END

    -- Determine the next or previous SequenceOrder based on the Direction
    IF @Direction = 'NEXT'
    BEGIN
        -- Get the next role with all columns
        SELECT TOP 1 *
        FROM dbo.WorkFlow
        WHERE ServiceId = @ServiceId
          AND SequenceOrder > @CurrentSequenceOrder
        ORDER BY SequenceOrder ASC;
    END
    ELSE IF @Direction = 'PREVIOUS'
    BEGIN
        -- Get the previous role with all columns
        SELECT TOP 1 *
        FROM dbo.WorkFlow
        WHERE ServiceId = @ServiceId
          AND SequenceOrder < @CurrentSequenceOrder
        ORDER BY SequenceOrder DESC;
    END
    ELSE
    BEGIN
        PRINT 'Invalid direction. Use NEXT or PREVIOUS.';
    END
END;

CREATE PROCEDURE [dbo].[GetApplications_SA]
    @ServiceId INT = NULL,
    @DistrictId INT = NULL,
    @AccessLevel VARCHAR(10),
    @AccessCode INT,
    @ApplicationStatus VARCHAR(50) = NULL -- 'ReturnToEdit' can be passed as a value
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        A.ApplicationId AS ReferenceNumber,
        A.ApplicantName AS ApplicantName,
        A.SubmissionDate AS SubmissionDate,
        D.DistrictName AS AppliedDistrict,
        S.NameShort AS AppliedService,
        OD.Role AS CurrentlyWith,
        CASE 
            WHEN @ApplicationStatus = 'ReturnToEdit' AND A.ApplicationStatus = 'Initiated' AND A.EditList IS NOT NULL AND A.EditList <> '[]' 
                THEN 'Pending With Citizen'
            ELSE STAT.[Status]
        END AS [Status]
    FROM
        [dbo].[Applications] AS A
    INNER JOIN
        [dbo].[District] AS D ON TRY_CAST(JSON_VALUE(A.ServiceSpecific, '$.District') AS INT) = D.DistrictID
    INNER JOIN 
        [dbo].[ApplicationStatus] AS STAT ON A.ApplicationId = STAT.ApplicationId
    INNER JOIN 
        [dbo].[OfficerDetails] AS OD ON STAT.CurrentlyWith = OD.OfficerId
    INNER JOIN 
        [dbo].[Services] AS S ON A.ServiceId = S.ServiceId
    WHERE 
        (@ServiceId IS NULL OR A.ServiceId = @ServiceId)
        AND (@DistrictId IS NULL OR TRY_CAST(JSON_VALUE(A.ServiceSpecific, '$.District') AS INT) = @DistrictId)
        AND (
            (@AccessLevel = 'District' AND @AccessCode = D.DistrictID) -- District-level access
            OR (@AccessLevel = 'Division' AND @AccessCode = D.Division) -- Division-level access
            OR (@AccessLevel = 'State') -- State-level access
        )
        AND (
            -- Pending applications (Initiated and not ReturnToEdit)
            (@ApplicationStatus = 'Pending' AND A.ApplicationStatus = 'Initiated' AND (A.EditList IS NULL OR A.EditList = '[]'))
            -- ReturnToEdit applications (Initiated with non-empty EditList)
            OR (@ApplicationStatus = 'ReturnToEdit' AND A.ApplicationStatus = 'Initiated' AND A.EditList IS NOT NULL AND A.EditList <> '[]')
            -- Sanctioned applications (statuses indicating approval or completion)
            OR (@ApplicationStatus = 'Sanctioned' AND A.ApplicationStatus IN ('Sanctioned', 'Deposited', 'Dispatched', 'Disbursed','Failure'))
            -- Rejected applications
            OR (@ApplicationStatus = 'Rejected' AND A.ApplicationStatus = 'Rejected')
            -- Disbursed applications
            OR (@ApplicationStatus = 'Disbursed' AND A.ApplicationStatus = 'Disbursed')
            -- Failure applications
            OR (@ApplicationStatus = 'Failure' AND A.ApplicationStatus = 'Failure')
            -- If no specific ApplicationStatus is provided, include all applications
            OR (@ApplicationStatus IS NULL)
        )
        AND (
            -- Explicitly exclude rejected statuses when pending is specified
            (@ApplicationStatus <> 'Pending' OR A.ApplicationStatus NOT IN ('Rejected'))
        )
    ORDER BY
        A.SubmissionDate DESC;
END;

CREATE PROCEDURE [dbo].[GetApplicationsForBank]
    @DistrictId VARCHAR(5),
    @ServiceId INT,
    @Statuses VARCHAR(MAX) -- Comma-separated list of statuses
AS
BEGIN
    -- Ensure no trailing spaces and split the statuses into rows
    DECLARE @StatusTable TABLE (Status VARCHAR(20));
    
    INSERT INTO @StatusTable(Status)
    SELECT TRIM(value)
    FROM STRING_SPLIT(@Statuses, ',');
    
    -- Fetch matching applications
    SELECT *
    FROM Applications
    WHERE 
        JSON_VALUE(ServiceSpecific, '$.District') = @DistrictId
        AND ServiceId = @ServiceId
        AND ApplicationStatus IN (SELECT Status FROM @StatusTable);
END;

CREATE PROCEDURE [dbo].[GetApplicationsHistory]
    @ApplicationId VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    ;WITH LatestHistory AS (
        SELECT 
            OD.Role AS Designation,
            AH.ActionTaken,
            AH.Remarks AS Remarks,
            AH.[File],
            AH.TakenAt,
            AH.TakenBy,
            ROW_NUMBER() OVER (
                PARTITION BY AH.TakenBy 
                ORDER BY 
                    TRY_CONVERT(DATETIME2, AH.TakenAt) DESC  -- Change to DESC for latest timestamp
            ) AS RowNum
        FROM 
            [dbo].[ApplicationsHistory] AS AH
        INNER JOIN 
            [dbo].[OfficerDetails] AS OD ON AH.TakenBy = OD.OfficerId
        WHERE 
            AH.ApplicationId = @ApplicationId
    )
    SELECT 
        Designation,
        ActionTaken,
        Remarks,
        [File],
        TakenAt
    FROM 
        LatestHistory
    WHERE 
        RowNum = 1  -- Now this will be the latest row for each officer
        OR ActionTaken IN ('Sanctioned','Deposited', 'Dispatched', 'Disbursed', 'Failure')  -- Keep specific actions
    ORDER BY 
        TRY_CONVERT(DATETIME2, TakenAt) ASC;  -- Ordering results overall by time
END;

CREATE PROCEDURE [dbo].[GetBankFileData]
    @ServiceId INT,
    @FileCreationDate VARCHAR(50),
    @DistrictId INT
AS
BEGIN
    -- Prevent extra result sets from interfering with SELECT statements.
    SET NOCOUNT ON;

    DECLARE @DistrictShort VARCHAR(10);
    DECLARE @MonthShort VARCHAR(3); -- Updated length to accommodate 'MMM'
    DECLARE @StartingCounter INT;
    DECLARE @RecordCount INT;

    -- Retrieve DistrictShort directly based on the provided DistrictId
    SELECT TOP 1 @DistrictShort = d.DistrictShort
    FROM District d
    WHERE d.DistrictID = @DistrictId;

    -- Get current Month in "MMM" format
    SET @MonthShort = LEFT(UPPER(FORMAT(GETDATE(), 'MMM')), 3); -- Forces 3 characters like 'NOV'

    PRINT 'Month Short: ' + @MonthShort;

    BEGIN TRANSACTION;

    BEGIN TRY
        -- Retrieve and lock the UniqueId record
        SELECT @StartingCounter = Counter 
        FROM UniqueId WITH (UPDLOCK, ROWLOCK)
        WHERE District = @DistrictShort AND [Month] = @MonthShort;

        IF @StartingCounter IS NULL
        BEGIN
            -- Initialize Counter to 1 if record doesn't exist
            SET @StartingCounter = 1;
            INSERT INTO UniqueId (District, [Month], Counter)
            VALUES (@DistrictShort, @MonthShort, @StartingCounter);
        END

        -- Get the count of sanctioned applications for the specific ServiceId and DistrictId
        SELECT @RecordCount = COUNT(*)
        FROM Applications a
        WHERE a.ServiceId = @ServiceId 
            AND JSON_VALUE(a.ServiceSpecific, '$.District') = CAST(@DistrictId AS NVARCHAR) 
            AND a.ApplicationStatus = 'Sanctioned';

        -- Update the Counter in UniqueId to reserve the full range needed
        UPDATE UniqueId 
        SET Counter = @StartingCounter + @RecordCount
        WHERE District = @DistrictShort AND [Month] = @MonthShort;

        -- Select applications with incremented UniqueID for each record
        ;WITH NumberedApplications AS (
            SELECT 
                a.ApplicationId AS ReferenceNumber,
                s.Department AS DepartmentName,
                JSON_VALUE(b.value, '$."Bank Name"') AS DebitBankName,
                JSON_VALUE(b.value, '$."IFSC Code"') AS DebitIFSC,
                JSON_VALUE(b.value, '$."Account Number"') AS DebitAccountNumber,
                JSON_VALUE(b.value, '$."Amount"') AS Amount,
                a.ApplicantName,
                JSON_VALUE(a.BankDetails, '$.IfscCode') AS ApplicantIFSC,
                JSON_VALUE(a.BankDetails, '$.AccountNumber') AS ApplicantAccountNumber,
                @FileCreationDate AS FileCreationDate,
                ROW_NUMBER() OVER (ORDER BY a.ApplicationId) AS RowNum -- Row counter for incrementing unique ID
            FROM 
                Applications a
            INNER JOIN 
                Services s ON a.ServiceId = s.ServiceId
            INNER JOIN 
                District d ON d.DistrictID = @DistrictId
            OUTER APPLY 
                (
                    SELECT TOP 1 b.*
                    FROM OPENJSON(s.BankDetails) AS b
                    WHERE b.[key] = 
                        CASE 
                            WHEN d.Division = 1 THEN '1'  
                            WHEN d.Division = 2 THEN '2'
                            ELSE '1'  
                        END
                ) AS b
            WHERE 
                a.ServiceId = @ServiceId
                AND JSON_VALUE(a.ServiceSpecific, '$.District') = CAST(@DistrictId AS NVARCHAR)
                AND a.ApplicationStatus = 'Sanctioned'
                AND b.[key] IS NOT NULL
        )
        SELECT 
            ReferenceNumber,
            CONCAT(@DistrictShort, @MonthShort, RIGHT('000000000000' + CAST(@StartingCounter + RowNum - 1 AS VARCHAR(12)), 12)) AS UniqueId, -- Unique ID with incremented counter
            DepartmentName,
            DebitBankName,
         DebitIFSC,
            DebitAccountNumber,
            Amount,
            ApplicantName,
            ApplicantIFSC,
            ApplicantAccountNumber,
            FileCreationDate
        FROM NumberedApplications;

        -- Commit the transaction
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        -- Rollback the transaction in case of error
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        -- Retrieve error information
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();

        -- Raise the error
        RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;

CREATE PROCEDURE [dbo].[GetDesignationsAndAccessLevels]
AS
BEGIN
    SELECT Designation, AccessLevel
    FROM [dbo].[OfficersDesignations];
END;

-- Procedure to Check Duplicate Account Number
CREATE PROCEDURE [dbo].[GetDuplicateAccNo]
    @AccountNumber VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT *
    FROM [dbo].[Applications]
    WHERE JSON_VALUE(BankDetails, '$.AccountNumber') = @AccountNumber;
END;

CREATE PROCEDURE [dbo].[GetFilteredApplications]
    @OfficerId INT,
    @ActionTaken VARCHAR(50),
    @ServiceId INT
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Retrieve AccessCode and AccessLevel for the given OfficerId
    DECLARE @AccessCode INT, @AccessLevel VARCHAR(20);
    SELECT 
        @AccessCode = AccessCode, 
        @AccessLevel = AccessLevel
    FROM 
        [SocialWelfareDepartment].[dbo].[OfficerDetails]
    WHERE 
        OfficerId = @OfficerId;

    -- 2. Validate AccessCode
    IF @AccessCode IS NULL
    BEGIN
        SELECT 
            'No matching AccessCode found for the given OfficerId' AS Message;
        RETURN;
    END

    -- 3. Common Table Expression (CTE) to get the latest ApplicationsHistory entry per ApplicationId and TakenBy
    ;WITH LatestHistory AS (
        SELECT
            AH.*,
            ROW_NUMBER() OVER (
                PARTITION BY AH.ApplicationId, AH.TakenBy 
                ORDER BY AH.TakenAt DESC, AH.HistoryId DESC
            ) AS rn
        FROM
            [SocialWelfareDepartment].[dbo].[ApplicationsHistory] AH
        WHERE
            AH.ServiceId = @ServiceId AND AH.TakenBy = @OfficerId AND AH.ActionTaken=@ActionTaken
    )

    -- 4. Fetch Applications joined with the latest ApplicationsHistory
    SELECT 
        A.*
    FROM 
        [SocialWelfareDepartment].[dbo].[Applications] AS A
    INNER JOIN 
        LatestHistory AS LH
            ON A.ApplicationId = LH.ApplicationId
    WHERE 
        LH.TakenBy = @OfficerId
        AND LH.rn = 1 -- Ensure only the latest ApplicationsHistory record per ApplicationId and TakenBy
        AND (
            -- Check for matching AccessCode or access to all districts
            JSON_VALUE(A.ServiceSpecific, '$.District') = CAST(@AccessCode AS NVARCHAR)
            OR (@AccessLevel = 'State' AND @AccessCode = 0)
        )
        AND LH.ActionTaken = @ActionTaken
    ORDER BY
        A.ApplicationId; -- Optional: Order results as needed
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

CREATE PROCEDURE GetPaymentDetailsForOfficer
    @AccessLevel VARCHAR(10),
    @AccessCode INT,
    @DistrictId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        PD.PaymentId,
        PD.ApplicationId,
        PD.ApplicantName,
        PD.[Status],
        PD.TransactionId,
        PD.TransactionStatus,
        PD.DateOfDistribution
    FROM 
        PaymentDetails AS PD
    INNER JOIN 
        Applications AS A ON PD.ApplicationId = A.ApplicationId  -- Ensures Application and PaymentDetails are linked
    INNER JOIN 
        District AS D ON TRY_CAST(JSON_VALUE(A.ServiceSpecific, '$.District') AS INT) = D.DistrictID
    WHERE 
        (@AccessLevel = 'District' AND @AccessCode = TRY_CAST(JSON_VALUE(A.ServiceSpecific, '$.District') AS INT))
        OR (@AccessLevel = 'Division' AND @AccessCode = D.Division)
        OR (@AccessLevel = 'State')
        AND (@DistrictId IS NULL OR TRY_CAST(JSON_VALUE(A.ServiceSpecific, '$.District') AS INT) = @DistrictId);
END;

CREATE PROCEDURE [dbo].[GetPaymentHistory]
    @ReferenceNumbers NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    -- Temporary table to store split reference numbers
    DECLARE @ReferenceNumbersTable TABLE (ReferenceNumber NVARCHAR(MAX));

    -- Variables to handle string splitting
    DECLARE @Start INT = 1, @End INT;
    DECLARE @Value NVARCHAR(MAX);

    -- Split the string into individual values and insert them into the temporary table
    WHILE @Start <= LEN(@ReferenceNumbers)
    BEGIN
        SET @End = CHARINDEX(',', @ReferenceNumbers, @Start);
        IF @End = 0 
            SET @End = LEN(@ReferenceNumbers) + 1;

        SET @Value = SUBSTRING(@ReferenceNumbers, @Start, @End - @Start);
        INSERT INTO @ReferenceNumbersTable (ReferenceNumber)
        VALUES (LTRIM(RTRIM(@Value)));

        SET @Start = @End + 1;
    END;

    -- Get the latest record for each ApplicationId
    ;WITH LatestHistory AS (
        SELECT 
            OD.Role AS Designation,
            AH.ActionTaken,
            AH.Remarks AS Remarks,
            AH.[File],
            AH.TakenAt,
            ROW_NUMBER() OVER (PARTITION BY AH.ApplicationId ORDER BY TRY_CONVERT(DATETIME2, AH.TakenAt) DESC) AS RowNum
        FROM 
            ApplicationsHistory AH
        INNER JOIN 
            OfficerDetails OD ON AH.TakenBy = OD.OfficerId
        WHERE 
            AH.ApplicationId IN (SELECT ReferenceNumber FROM @ReferenceNumbersTable)
    )
    SELECT 
        Designation,
        ActionTaken,
        Remarks,
        [File],
        TakenAt
    FROM 
        LatestHistory
    WHERE 
        RowNum = 1  -- Select only the latest entry per ApplicationId
    ORDER BY 
        TRY_CONVERT(DATETIME2, TakenAt) DESC;  -- Order by most recent TakenAt
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
    INNER JOIN 
        [dbo].[WorkFlow] wf ON s.ServiceId = wf.ServiceId
    WHERE 
        wf.Role = @Role;
END;

CREATE PROCEDURE [dbo].[GetStatusCount]
    @TakenBy INT,
    @ServiceId INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Variables to hold AccessCode and AccessLevel (if required later)
    DECLARE @AccessCode INT, @AccessLevel VARCHAR(20);

    -- Retrieve AccessCode and AccessLevel for the given Officer (if AccessLevel filtering is needed in future)
    SELECT @AccessCode = AccessCode, @AccessLevel = AccessLevel
    FROM [SocialWelfareDepartment].[dbo].[OfficerDetails]
    WHERE OfficerId = @TakenBy;

    -- Retrieve counts from the ApplicationsCount table based on ServiceId and OfficerId or AccessLevel = 'State'
    SELECT
        ISNULL(SUM(CASE WHEN AC.[Status] = 'Pending' THEN AC.[Count] ELSE 0 END), 0) AS PendingCount,
        ISNULL(SUM(CASE WHEN AC.[Status] = 'Forwarded' THEN AC.[Count] ELSE 0 END), 0) AS ForwardCount,
        ISNULL(SUM(CASE WHEN AC.[Status] = 'Returned' THEN AC.[Count] ELSE 0 END), 0) AS ReturnCount,
        ISNULL(SUM(CASE WHEN AC.[Status] = 'ReturnToEdit' THEN AC.[Count] ELSE 0 END), 0) AS ReturnToEditCount,
        ISNULL(SUM(CASE WHEN AC.[Status] = 'Sanctioned' THEN AC.[Count] ELSE 0 END), 0) AS SanctionCount,
        ISNULL(SUM(CASE WHEN AC.[Status] = 'Rejected' THEN AC.[Count] ELSE 0 END), 0) AS RejectCount,
        ISNULL(SUM(CASE WHEN AC.[Status] = 'Disbursed' THEN AC.[Count] ELSE 0 END), 0) AS DisbursedCount,
        ISNULL(
            SUM(CASE 
                WHEN AC.[Status] != 'Forwarded' 
                AND AC.[Status] != 'Return' 
                THEN AC.[Count] ELSE 0 END), 0
        ) AS TotalApplications -- Adding TotalApplications
    FROM
        [SocialWelfareDepartment].[dbo].[ApplicationsCount] AS AC
    WHERE
        AC.ServiceId = @ServiceId
        AND AC.OfficerId = @TakenBy;
END;

CREATE PROCEDURE [dbo].[GetStatusCount_SA]
    @ServiceId INT = NULL,
    @DistrictId INT = NULL,
    @AccessLevel VARCHAR(10),
    @AccessCode INT
AS
BEGIN
    SELECT
        -- Pending applications (only 'Initiated' and not in 'ReturnToEdit')
        ISNULL(SUM(CASE WHEN A.ApplicationStatus = 'Initiated' AND (A.EditList IS NULL OR A.EditList = '[]') THEN 1 ELSE 0 END), 0) AS PendingCount,
        -- ReturnToEdit applications (subset of Pending, 'Initiated' with a non-empty EditList)
        ISNULL(SUM(CASE WHEN A.ApplicationStatus = 'Initiated' AND A.EditList IS NOT NULL AND A.EditList <> '[]' THEN 1 ELSE 0 END), 0) AS ReturnToEditCount,
        -- Sanctioned applications
        ISNULL(SUM(CASE WHEN A.ApplicationStatus IN ('Sanctioned', 'Deposited','Dispatched','Disbursed','Failure') THEN 1 ELSE 0 END), 0) AS SanctionCount,
        -- Rejected applications
        ISNULL(SUM(CASE WHEN A.ApplicationStatus = 'Rejected' THEN 1 ELSE 0 END), 0) AS RejectCount,
        -- Disbursed applications
        ISNULL(SUM(CASE WHEN A.ApplicationStatus = 'Disbursed' THEN 1 ELSE 0 END), 0) AS DisbursedCount,
         -- Failed applications
        ISNULL(SUM(CASE WHEN A.ApplicationStatus = 'Failure' THEN 1 ELSE 0 END), 0) AS FailureCount,
        -- Total applications (all statuses)
        ISNULL(COUNT(A.ApplicationId), 0) AS TotalApplications
    FROM
        [dbo].[Applications] AS A
    INNER JOIN
        [dbo].[District] AS D ON TRY_CAST(JSON_VALUE(A.ServiceSpecific, '$.District') AS INT) = D.DistrictID
    INNER JOIN 
        [dbo].[ApplicationStatus] AS STAT ON A.ApplicationId = STAT.ApplicationId
    WHERE (@ServiceId IS NULL OR A.ServiceId = @ServiceId)
      AND (@DistrictId IS NULL OR TRY_CAST(JSON_VALUE(A.ServiceSpecific, '$.District') AS INT) = @DistrictId)
      AND (
            (@AccessLevel = 'District' AND @AccessCode = D.DistrictID)  -- District-level access
            OR (@AccessLevel = 'Division' AND @AccessCode = D.Division)  -- Division-level access
            OR (@AccessLevel = 'State')  -- State-level access
          )
END;

CREATE PROCEDURE [dbo].[InsertApplicationStatusAndHistoryWithCount]
    @ServiceId INT,
    @AccessLevel VARCHAR(10),
    @AccessCode INT,
    @Role VARCHAR(50),
    @ApplicationId VARCHAR(50),
    @StatusAction VARCHAR(50),
    @OfficerId INT = NULL, -- Allows NULL value
    @Remarks TEXT = '', -- Optional, defaults to empty string
    @File VARCHAR(MAX) = '', -- Optional, defaults to empty string
    @Timestamp VARCHAR(255),
    @canPull BIT = 0 -- Optional, defaults to 0
AS
BEGIN
    BEGIN TRANSACTION;

    BEGIN TRY
        -- Insert into ApplicationStatus
        INSERT INTO ApplicationStatus (ServiceId, AccessLevel, AccessCode, [Role], ApplicationId, [Status], CurrentlyWith, canPull, LastUpdated)
        VALUES (@ServiceId, @AccessLevel, @AccessCode, @Role, @ApplicationId, @StatusAction, @OfficerId, @canPull, @Timestamp);

        -- Insert into ApplicationsHistory
        INSERT INTO ApplicationsHistory (ServiceId, AccessLevel, AccessCode, [Role], ApplicationId, ActionTaken, TakenBy, Remarks, [File], TakenAt)
        VALUES (@ServiceId, @AccessLevel, @AccessCode, @Role, @ApplicationId, @StatusAction, @OfficerId, @Remarks, @File, @Timestamp);

        -- Update or Insert into ApplicationsCount
        IF EXISTS (
            SELECT 1 
            FROM ApplicationsCount 
            WHERE ServiceId = @ServiceId 
              AND AccessLevel = @AccessLevel 
              AND AccessCode = @AccessCode 
              AND [Role] = @Role 
              AND [Status] = @StatusAction
        )
        BEGIN
            UPDATE ApplicationsCount
            SET [Count] = [Count] + 1,
                LastUpdated = @Timestamp
            WHERE ServiceId = @ServiceId 
              AND AccessLevel = @AccessLevel 
              AND AccessCode = @AccessCode 
              AND [Role] = @Role 
              AND [Status] = @StatusAction;
        END
        ELSE
        BEGIN
            INSERT INTO ApplicationsCount (ServiceId, AccessLevel, AccessCode, [Role], OfficerId, [Status], [Count], LastUpdated)
            VALUES (@ServiceId, @AccessLevel, @AccessCode, @Role, @OfficerId, @StatusAction, 1, @Timestamp);
        END;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        -- Rollback in case of an error
        ROLLBACK TRANSACTION;
        -- Rethrow the error to be handled by the caller
        THROW;
    END CATCH
END;

-- Procedure to Insert General Application Details
CREATE PROCEDURE [dbo].[InsertGeneralApplicationDetails]
    @ApplicationId NVARCHAR(50),
    @CitizenId INT,
    @ServiceId INT,
    @ApplicantName NVARCHAR(255),
    @ApplicantImage NVARCHAR(MAX),
    @Email NVARCHAR(255),
    @MobileNumber NVARCHAR(15),
    @Relation NVARCHAR(50),
    @RelationName NVARCHAR(255),
    @DateOfBirth DATE,
    @Category NVARCHAR(50),
    @ServiceSpecific NVARCHAR(MAX),
    @BankDetails NVARCHAR(MAX),
    @Documents NVARCHAR(MAX),
    @ApplicationStatus NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO Applications
    (
        ApplicationId,
        CitizenId,
        ServiceId,
        ApplicantName,
        ApplicantImage,
        Email,
        MobileNumber,
        Relation,
        RelationName,
        DateOfBirth,
        Category,
        ServiceSpecific,
        BankDetails,
        Documents,
        ApplicationStatus
    )
    VALUES
    (
        @ApplicationId,
        @CitizenId,
        @ServiceId,
        @ApplicantName,
        @ApplicantImage,
        @Email,
        @MobileNumber,
        @Relation,
        @RelationName,
        @DateOfBirth,
        @Category,
        @ServiceSpecific,
        @BankDetails,
        @Documents,
        @ApplicationStatus
    );
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

CREATE PROCEDURE [dbo].[Status_History_Count_Forward]
    @ServiceId INT,
    @AccessLevel VARCHAR(10),
    @AccessCode INT,
    @CurrentOfficerRole VARCHAR(50),
    @Role VARCHAR(50),
    @ApplicationId VARCHAR(50),
    @OfficerId INT,
    @NextOfficerId INT = NULL,
    @Remarks TEXT,
    @FilePath VARCHAR(MAX),
    @Date VARCHAR(100)
AS
BEGIN
     -- Start a transaction
    BEGIN TRY
        BEGIN TRANSACTION;

        -- Query 1: Update data in ApplicationStatus
        UPDATE ApplicationStatus SET AccessLevel = @AccessLevel, AccessCode = @AccessCode, [Role] = @Role, CurrentlyWith = @NextOfficerId,canPull=1,LastUpdated=@Date WHERE ServiceId=@ServiceId AND ApplicationId = @ApplicationId;

        -- Query 2: Insert Current and Next Officer Histroy in ApplicationsHistory
       INSERT INTO ApplicationsHistory (ServiceId, AccessLevel, AccessCode, [Role] ,ApplicationId, ActionTaken, TakenBy, Remarks, [File], TakenAt)
       VALUES
            (@ServiceId, @AccessLevel, @AccessCode, @CurrentOfficerRole, @ApplicationId, 'Forwarded', @OfficerId, @Remarks, @FilePath, @Date),
            (@ServiceId, @AccessLevel, @AccessCode, @Role, @ApplicationId, 'Pending', @NextOfficerId, '', '', @Date);

        -- Query 3: Update ApplicationsCount for Pending
        UPDATE ApplicationsCount SET [Count] = [Count]-1,LastUpdated=@Date WHERE ServiceId = @ServiceId AND OfficerId = @OfficerId AND [Status] = 'Pending'; 

        -- Query 4: Update AppplicationsCount for Forward
        IF EXISTS(SELECT 1 FROM ApplicationsCount WHERE ServiceId=@ServiceId AND OfficerId=@OfficerId AND [Status]='Forwarded')
        BEGIN
            UPDATE ApplicationsCount SET [Count] = [Count]+1,LastUpdated=@Date WHERE ServiceId = @ServiceId AND OfficerId = @OfficerId AND [Status] = 'Forwarded';
        END
        ELSE
        BEGIN
            INSERT INTO ApplicationsCount (ServiceId,AccessLevel,AccessCode,[Role],[OfficerId],[Status], [Count],LastUpdated) VALUES(@ServiceId,@AccessLevel,@AccessCode,@CurrentOfficerRole,@OfficerId,'Forwarded',1,@Date)
        END

        -- Query 5: Update Applications Count for Next Officer
        IF EXISTS(SELECT 1 FROM ApplicationsCount WHERE ServiceId=@ServiceId AND AccessLevel=@AccessLevel AND AccessCode=@AccessCode AND [Role]=@Role  AND ((OfficerId = @NextOfficerId) OR (OfficerId IS NULL AND @NextOfficerId IS NULL)) AND [Status]='Pending')
        BEGIN
            UPDATE ApplicationsCount SET [Count] = [Count]+1,LastUpdated=@Date WHERE ServiceId = @ServiceId AND OfficerId = @NextOfficerId AND [Status] = 'Pending';
        END
        ELSE
        BEGIN
            INSERT INTO ApplicationsCount (ServiceId, AccessLevel, AccessCode, [Role], OfficerId,[Status],[Count],LastUpdated) VALUES(@ServiceId, @AccessLevel, @AccessCode, @Role, @NextOfficerId,'Pending',1,@Date)
        END        


        -- If all queries succeed, commit the transaction
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        -- If an error occurs in any of the above queries, roll back the transaction
        IF @@TRANCOUNT > 0
        BEGIN
            ROLLBACK TRANSACTION;
        END;

        -- Optionally, capture and raise the error for further handling
        DECLARE @ErrorMessage NVARCHAR(4000);
        DECLARE @ErrorSeverity INT;
        DECLARE @ErrorState INT;

        -- Retrieve the details of the error
        SET @ErrorMessage = ERROR_MESSAGE();
        SET @ErrorSeverity = ERROR_SEVERITY();
        SET @ErrorState = ERROR_STATE();

        -- Re-raise the error with the original details
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;

CREATE PROCEDURE [dbo].[Status_History_Count_Reject]
    @ServiceId INT,
    @AccessLevel VARCHAR(10),
    @AccessCode INT,
    @CurrentOfficerRole VARCHAR(50),
    @ApplicationId VARCHAR(50),
    @OfficerId INT,
    @Remarks TEXT,
    @FilePath VARCHAR(MAX),
    @Date VARCHAR(100)
AS
BEGIN
    -- Start a transaction
    BEGIN TRY
        BEGIN TRANSACTION;

        -- Query 1: Update ApplicationStatus
        UPDATE ApplicationStatus 
        SET AccessLevel = @AccessLevel, AccessCode = @AccessCode, [Role] = @CurrentOfficerRole, CurrentlyWith = @OfficerId, Status = 'Rejected', canPull = 0, LastUpdated = @Date 
        WHERE ServiceId = @ServiceId AND ApplicationId = @ApplicationId;

        -- Query 2: Insert Rejection into ApplicationsHistory
        INSERT INTO ApplicationsHistory (ServiceId, AccessLevel, AccessCode, [Role], ApplicationId, ActionTaken, TakenBy, Remarks, [File], TakenAt)
        VALUES
            (@ServiceId, @AccessLevel, @AccessCode, @CurrentOfficerRole, @ApplicationId, 'Rejected', @OfficerId, @Remarks, @FilePath, @Date);

        -- Query 3: Update ApplicationsCount for Pending
        UPDATE ApplicationsCount 
        SET [Count] = [Count] - 1, LastUpdated = @Date 
        WHERE ServiceId = @ServiceId AND OfficerId = @OfficerId AND [Status] = 'Pending';

        -- Query 4: Update ApplicationsCount for Rejected
        IF EXISTS(SELECT 1 FROM ApplicationsCount WHERE ServiceId = @ServiceId AND OfficerId = @OfficerId AND [Status] = 'Rejected')
        BEGIN
            UPDATE ApplicationsCount 
            SET [Count] = [Count] + 1, LastUpdated = @Date 
            WHERE ServiceId = @ServiceId AND OfficerId = @OfficerId AND [Status] = 'Rejected';
        END
        ELSE
        BEGIN
            INSERT INTO ApplicationsCount (ServiceId, AccessLevel, AccessCode, [Role], OfficerId, [Status], [Count], LastUpdated) 
            VALUES (@ServiceId, @AccessLevel, @AccessCode, @CurrentOfficerRole, @OfficerId, 'Rejected', 1, @Date);
        END

        -- Commit transaction
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        -- Rollback in case of error
        IF @@TRANCOUNT > 0
        BEGIN
            ROLLBACK TRANSACTION;
        END;

        -- Re-raise the error
        DECLARE @ErrorMessage NVARCHAR(4000);
        DECLARE @ErrorSeverity INT;
        DECLARE @ErrorState INT;
        SET @ErrorMessage = ERROR_MESSAGE();
        SET @ErrorSeverity = ERROR_SEVERITY();
        SET @ErrorState = ERROR_STATE();
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;

CREATE PROCEDURE [dbo].[Status_History_Count_Return]
    @ServiceId INT,
    @AccessLevel VARCHAR(10),
    @AccessCode INT,
    @CurrentOfficerRole VARCHAR(50),
    @Role VARCHAR(50),
    @ApplicationId VARCHAR(50),
    @OfficerId INT,
    @PreviousOfficerId INT,
    @Remarks TEXT,
    @FilePath VARCHAR(MAX),
    @Date VARCHAR(100)
AS
BEGIN
    -- Start a transaction
    BEGIN TRY
        BEGIN TRANSACTION;

        -- Query 1: Update ApplicationStatus
        UPDATE ApplicationStatus 
        SET AccessLevel = @AccessLevel, AccessCode = @AccessCode, [Role] = @Role, CurrentlyWith = @PreviousOfficerId, canPull = 1, LastUpdated = @Date 
        WHERE ServiceId = @ServiceId AND ApplicationId = @ApplicationId;

        -- Query 2: Insert History in ApplicationsHistory
        INSERT INTO ApplicationsHistory (ServiceId, AccessLevel, AccessCode, [Role], ApplicationId, ActionTaken, TakenBy, Remarks, [File], TakenAt)
        VALUES
            (@ServiceId, @AccessLevel, @AccessCode, @CurrentOfficerRole, @ApplicationId, 'Returned', @OfficerId, @Remarks, @FilePath, @Date),
            (@ServiceId, @AccessLevel, @AccessCode, @Role, @ApplicationId, 'Pending', @PreviousOfficerId, '', '', @Date);

        -- Query 3: Update ApplicationsCount for Pending (Current Officer)
        UPDATE ApplicationsCount 
        SET [Count] = [Count] - 1, LastUpdated = @Date 
        WHERE ServiceId = @ServiceId AND OfficerId = @OfficerId AND [Status] = 'Pending';

        -- Query 4: Update ApplicationsCount for Returned
        IF EXISTS(SELECT 1 FROM ApplicationsCount WHERE ServiceId = @ServiceId AND OfficerId = @OfficerId AND [Status] = 'Returned')
        BEGIN
            UPDATE ApplicationsCount 
            SET [Count] = [Count] + 1, LastUpdated = @Date 
            WHERE ServiceId = @ServiceId AND OfficerId = @OfficerId AND [Status] = 'Returned';
        END
        ELSE
        BEGIN
            INSERT INTO ApplicationsCount (ServiceId, AccessLevel, AccessCode, [Role], OfficerId, [Status], [Count], LastUpdated) 
            VALUES (@ServiceId, @AccessLevel, @AccessCode, @CurrentOfficerRole, @OfficerId, 'Returned', 1, @Date);
        END

        -- Query 5: Update ApplicationsCount for Pending (Previous Officer)
        IF EXISTS(SELECT 1 FROM ApplicationsCount WHERE ServiceId = @ServiceId AND AccessLevel = @AccessLevel AND AccessCode = @AccessCode AND [Role] = @Role AND OfficerId = @PreviousOfficerId AND [Status] = 'Pending')
        BEGIN
            UPDATE ApplicationsCount 
            SET [Count] = [Count] + 1, LastUpdated = @Date 
            WHERE ServiceId = @ServiceId AND OfficerId = @PreviousOfficerId AND [Status] = 'Pending';
        END
        ELSE
        BEGIN
            INSERT INTO ApplicationsCount (ServiceId, AccessLevel, AccessCode, [Role], OfficerId, [Status], [Count], LastUpdated) 
            VALUES (@ServiceId, @AccessLevel, @AccessCode, @Role, @PreviousOfficerId, 'Pending', 1, @Date);
        END

        -- Commit transaction
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        -- Rollback in case of error
        IF @@TRANCOUNT > 0
        BEGIN
            ROLLBACK TRANSACTION;
        END;

        -- Re-raise the error
        DECLARE @ErrorMessage NVARCHAR(4000);
        DECLARE @ErrorSeverity INT;
        DECLARE @ErrorState INT;
        SET @ErrorMessage = ERROR_MESSAGE();
        SET @ErrorSeverity = ERROR_SEVERITY();
        SET @ErrorState = ERROR_STATE();
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;

CREATE PROCEDURE [dbo].[Status_History_Count_ReturnToEdit]
    @ServiceId INT,
    @AccessLevel VARCHAR(10),
    @AccessCode INT,
    @CurrentOfficerRole VARCHAR(50),
    @ApplicationId VARCHAR(50),
    @OfficerId INT,
    @Remarks TEXT,
    @FilePath VARCHAR(MAX),
    @Date VARCHAR(100)
AS
BEGIN
    -- Start a transaction
    BEGIN TRY
        BEGIN TRANSACTION;

        -- Query 1: Update ApplicationStatus
        UPDATE ApplicationStatus 
        SET AccessLevel = @AccessLevel, AccessCode = @AccessCode, [Role] = @CurrentOfficerRole, Status = 'ReturnToEdit', canPull = 0, LastUpdated = @Date 
        WHERE ServiceId = @ServiceId AND ApplicationId = @ApplicationId;

        -- Query 2: Insert ReturnToEdit into ApplicationsHistory
        INSERT INTO ApplicationsHistory (ServiceId, AccessLevel, AccessCode, [Role], ApplicationId, ActionTaken, TakenBy, Remarks, [File], TakenAt)
        VALUES
            (@ServiceId, @AccessLevel, @AccessCode, @CurrentOfficerRole, @ApplicationId, 'ReturnToEdit', @OfficerId, @Remarks, @FilePath, @Date);

        -- Query 3: Update ApplicationsCount for Pending
        UPDATE ApplicationsCount 
        SET [Count] = [Count] - 1, LastUpdated = @Date 
        WHERE ServiceId = @ServiceId AND OfficerId = @OfficerId AND [Status] = 'Pending';

        -- Query 4: Update ApplicationsCount for ReturnToEdit
        IF EXISTS(SELECT 1 FROM ApplicationsCount WHERE ServiceId = @ServiceId AND OfficerId = @OfficerId AND [Status] = 'ReturnToEdit')
        BEGIN
            UPDATE ApplicationsCount 
            SET [Count] = [Count] + 1, LastUpdated = @Date 
            WHERE ServiceId = @ServiceId AND OfficerId = @OfficerId AND [Status] = 'ReturnToEdit';
        END
        ELSE
        BEGIN
            INSERT INTO ApplicationsCount (ServiceId, AccessLevel, AccessCode, [Role], OfficerId, [Status], [Count], LastUpdated) 
            VALUES (@ServiceId, @AccessLevel, @AccessCode, @CurrentOfficerRole, @OfficerId, 'ReturnToEdit', 1, @Date);
        END

        -- Commit transaction
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        -- Rollback in case of error
        IF @@TRANCOUNT > 0
        BEGIN
            ROLLBACK TRANSACTION;
        END;

        -- Re-raise the error
        DECLARE @ErrorMessage NVARCHAR(4000);
        DECLARE @ErrorSeverity INT;
        DECLARE @ErrorState INT;
        SET @ErrorMessage = ERROR_MESSAGE();
        SET @ErrorSeverity = ERROR_SEVERITY();
        SET @ErrorState = ERROR_STATE();
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;

CREATE PROCEDURE [dbo].[Status_History_Count_Sanction]
    @ServiceId INT,
    @AccessLevel VARCHAR(10),
    @AccessCode INT,
    @CurrentOfficerRole VARCHAR(50),
    @ApplicationId VARCHAR(50),
    @OfficerId INT,
    @Remarks TEXT,
    @FilePath VARCHAR(MAX),
    @Date VARCHAR(100)
AS
BEGIN
    -- Start a transaction
    BEGIN TRY
        BEGIN TRANSACTION;

        -- Query 1: Update ApplicationStatus
        UPDATE ApplicationStatus 
        SET AccessLevel = @AccessLevel, AccessCode = @AccessCode, [Role] = @CurrentOfficerRole, CurrentlyWith = @OfficerId, Status = 'Sanctioned', canPull = 0, LastUpdated = @Date 
        WHERE ServiceId = @ServiceId AND ApplicationId = @ApplicationId;

        -- Query 2: Insert Sanction into ApplicationsHistory
        INSERT INTO ApplicationsHistory (ServiceId, AccessLevel, AccessCode, [Role], ApplicationId, ActionTaken, TakenBy, Remarks, [File], TakenAt)
        VALUES
            (@ServiceId, @AccessLevel, @AccessCode, @CurrentOfficerRole, @ApplicationId, 'Sanctioned', @OfficerId, @Remarks, @FilePath, @Date);

        -- Query 3: Update ApplicationsCount for Pending
        UPDATE ApplicationsCount 
        SET [Count] = [Count] - 1, LastUpdated = @Date 
        WHERE ServiceId = @ServiceId AND OfficerId = @OfficerId AND [Status] = 'Pending';

        -- Query 4: Update ApplicationsCount for Sanctioned
        IF EXISTS(SELECT 1 FROM ApplicationsCount WHERE ServiceId = @ServiceId AND OfficerId = @OfficerId AND [Status] = 'Sanctioned')
        BEGIN
            UPDATE ApplicationsCount 
            SET [Count] = [Count] + 1, LastUpdated = @Date 
            WHERE ServiceId = @ServiceId AND OfficerId = @OfficerId AND [Status] = 'Sanctioned';
        END
        ELSE
        BEGIN
            INSERT INTO ApplicationsCount (ServiceId, AccessLevel, AccessCode, [Role], OfficerId, [Status], [Count], LastUpdated) 
            VALUES (@ServiceId, @AccessLevel, @AccessCode, @CurrentOfficerRole, @OfficerId, 'Sanctioned', 1, @Date);
        END

        -- Commit transaction
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        -- Rollback in case of error
        IF @@TRANCOUNT > 0
        BEGIN
            ROLLBACK TRANSACTION;
        END;

        -- Re-raise the error
        DECLARE @ErrorMessage NVARCHAR(4000);
        DECLARE @ErrorSeverity INT;
        DECLARE @ErrorState INT;
        SET @ErrorMessage = ERROR_MESSAGE();
        SET @ErrorSeverity = ERROR_SEVERITY();
        SET @ErrorState = ERROR_STATE();
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;

-- Procedure to Update Application Column
CREATE PROCEDURE [dbo].[UpdateApplication]
    @ColumnName NVARCHAR(255),
    @ColumnValue NVARCHAR(MAX),
    @ApplicationId NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Sql NVARCHAR(MAX);

    IF @ColumnName IS NULL OR @ApplicationId IS NULL
    BEGIN
        RAISERROR('ColumnName and ApplicationId cannot be NULL', 16, 1);
        RETURN;
    END

    SET @Sql = N'UPDATE Applications SET ' + QUOTENAME(@ColumnName) + ' = @ColumnValue WHERE ApplicationId = @ApplicationId';

    EXEC sp_executesql @Sql, 
        N'@ColumnValue NVARCHAR(MAX), @ApplicationId NVARCHAR(255)',
        @ColumnValue, @ApplicationId;
END;

CREATE PROCEDURE UpdateApplication_Status_History_Count
    @ServiceId INT,
    @DistrictId VARCHAR(5),
    @OfficerId INT,
    @CurrentStatus VARCHAR(20),
    @NewStatus VARCHAR(20),
    @UpdateDate VARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ApplicationCount INT;
    DECLARE @CurrentTimestamp VARCHAR(100) = @UpdateDate;

    BEGIN TRANSACTION;

    BEGIN TRY
        -- Step 1: Count applications that meet the specified conditions
        SELECT @ApplicationCount = COUNT(*)
        FROM Applications a
        WHERE a.ServiceId = @ServiceId
            AND JSON_VALUE(a.ServiceSpecific, '$.District') = @DistrictId 
            AND a.ApplicationStatus = @CurrentStatus;

        -- Step 2: Update the ApplicationsCount table with the calculated count
        UPDATE ApplicationsCount
        SET Count = Count - @ApplicationCount,
            LastUpdated = @CurrentTimestamp
        WHERE ServiceId = @ServiceId
            AND OfficerId = @OfficerId
            AND [Status] = @CurrentStatus;

        -- Step 3: Insert or update the new status count in ApplicationsCount table
        IF EXISTS (SELECT 1 FROM ApplicationsCount WHERE ServiceId = @ServiceId AND OfficerId = @OfficerId AND [Status] = @NewStatus)
        BEGIN
            UPDATE ApplicationsCount 
            SET Count = Count + @ApplicationCount, 
                LastUpdated = @CurrentTimestamp 
            WHERE ServiceId = @ServiceId 
                AND OfficerId = @OfficerId 
                AND [Status] = @NewStatus;
        END
        ELSE
        BEGIN
            INSERT INTO ApplicationsCount (ServiceId, OfficerId, [Status], [Count], LastUpdated) 
            VALUES (@ServiceId, @OfficerId, @NewStatus, @ApplicationCount, @CurrentTimestamp);
        END;

        -- Step 4: Update the ApplicationStatus table
        UPDATE s
        SET s.[Status] = @NewStatus,               
            s.LastUpdated = @CurrentTimestamp
        FROM ApplicationStatus AS s
        INNER JOIN Applications AS a ON s.ApplicationId = a.ApplicationId
        WHERE a.ServiceId = @ServiceId
            AND JSON_VALUE(a.ServiceSpecific, '$.District') = @DistrictId
            AND a.ApplicationStatus = @CurrentStatus;

        -- Step 5: Insert into ApplicationsHistory table
        INSERT INTO ApplicationsHistory (ServiceId, ApplicationId, ActionTaken, TakenBy, Remarks, [File], TakenAt)
        SELECT 
            a.ServiceId,
            a.ApplicationId,
            @NewStatus AS ActionTaken,            
            @OfficerId AS TakenBy,                 
            '' AS Remarks,                         
            '' AS [File],                          
            @CurrentTimestamp AS TakenAt           
        FROM 
            Applications a
        WHERE 
            a.ServiceId = @ServiceId
            AND JSON_VALUE(a.ServiceSpecific, '$.District') = @DistrictId
            AND a.ApplicationStatus = @CurrentStatus;

        -- Step 6: Update the ApplicationStatus in Applications table
        UPDATE Applications 
        SET ApplicationStatus = @NewStatus
        WHERE ServiceId = @ServiceId
          AND JSON_VALUE(ServiceSpecific, '$.District') = @DistrictId
          AND ApplicationStatus = @CurrentStatus;

        -- Commit the transaction if all steps are successful
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        -- Rollback the transaction in case of any errors
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        -- Retrieve and raise the error message
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();

        RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;

-- Procedure to Update Application Columns
CREATE PROCEDURE [dbo].[UpdateApplicationColumns]
    @ApplicationId VARCHAR(50),
    @CitizenId INT = NULL,
    @ServiceId INT = NULL,
    @ApplicantName VARCHAR(255) = NULL,
    @ApplicantImage VARCHAR(MAX) = NULL,
    @Email VARCHAR(50) = NULL,
    @MobileNumber VARCHAR(50) = NULL,
    @Relation VARCHAR(50) = NULL,
    @RelationName VARCHAR(255) = NULL,
    @DateOfBirth VARCHAR(50) = NULL,
    @Category VARCHAR(100) = NULL,
    @ServiceSpecific VARCHAR(MAX) = NULL,
    @PresentAddressId VARCHAR(20) = NULL,
    @PermanentAddressId VARCHAR(20) = NULL,
    @BankDetails VARCHAR(MAX) = NULL,
    @Documents VARCHAR(MAX) = NULL,
    @EditList VARCHAR(MAX) = NULL,
    @Phase INT = NULL,
    @ApplicationStatus VARCHAR(15) = NULL,
    @SubmissionDate VARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Sql NVARCHAR(MAX);

    SET @Sql = 'UPDATE Applications SET ';

    IF @CitizenId IS NOT NULL SET @Sql = @Sql + 'CitizenId = @CitizenId, ';
    IF @ServiceId IS NOT NULL SET @Sql = @Sql + 'ServiceId = @ServiceId, ';
    IF @ApplicantName IS NOT NULL SET @Sql = @Sql + 'ApplicantName = @ApplicantName, ';
    IF @ApplicantImage IS NOT NULL SET @Sql = @Sql + 'ApplicantImage = @ApplicantImage, ';
    IF @Email IS NOT NULL SET @Sql = @Sql + 'Email = @Email, ';
    IF @MobileNumber IS NOT NULL SET @Sql = @Sql + 'MobileNumber = @MobileNumber, ';
    IF @Relation IS NOT NULL SET @Sql = @Sql + 'Relation = @Relation, ';
    IF @RelationName IS NOT NULL SET @Sql = @Sql + 'RelationName = @RelationName, ';
    IF @DateOfBirth IS NOT NULL SET @Sql = @Sql + 'DateOfBirth = @DateOfBirth, ';
    IF @Category IS NOT NULL SET @Sql = @Sql + 'Category = @Category, ';
    IF @ServiceSpecific IS NOT NULL SET @Sql = @Sql + 'ServiceSpecific = @ServiceSpecific, ';
    IF @PresentAddressId IS NOT NULL SET @Sql = @Sql + 'PresentAddressId = @PresentAddressId, ';
    IF @PermanentAddressId IS NOT NULL SET @Sql = @Sql + 'PermanentAddressId = @PermanentAddressId, ';
    IF @BankDetails IS NOT NULL SET @Sql = @Sql + 'BankDetails = @BankDetails, ';
    IF @Documents IS NOT NULL SET @Sql = @Sql + 'Documents = @Documents, ';
    IF @EditList IS NOT NULL SET @Sql = @Sql + 'EditList = @EditList, ';
    IF @Phase IS NOT NULL SET @Sql = @Sql + 'Phase = @Phase, ';
    IF @ApplicationStatus IS NOT NULL SET @Sql = @Sql + 'ApplicationStatus = @ApplicationStatus, ';
    IF @SubmissionDate IS NOT NULL SET @Sql = @Sql + 'SubmissionDate = @SubmissionDate, ';

    SET @Sql = LEFT(@Sql, LEN(@Sql) - 2); -- Remove trailing comma
    SET @Sql = @Sql + ' WHERE ApplicationId = @ApplicationId';

    EXEC sp_executesql @Sql, 
        N'@ApplicationId VARCHAR(50), @CitizenId INT, @ServiceId INT, @ApplicantName VARCHAR(255), @ApplicantImage VARCHAR(MAX), @Email VARCHAR(50), @MobileNumber VARCHAR(50), @Relation VARCHAR(50), @RelationName VARCHAR(255), @DateOfBirth VARCHAR(50), @Category VARCHAR(100), @ServiceSpecific VARCHAR(MAX), @PresentAddressId VARCHAR(20), @PermanentAddressId VARCHAR(20), @BankDetails VARCHAR(MAX), @Documents VARCHAR(MAX), @EditList VARCHAR(MAX), @Phase INT, @ApplicationStatus VARCHAR(15), @SubmissionDate VARCHAR(100)',
        @ApplicationId, @CitizenId, @ServiceId, @ApplicantName, @ApplicantImage, @Email, @MobileNumber, @Relation, @RelationName, @DateOfBirth, @Category, @ServiceSpecific, @PresentAddressId, @PermanentAddressId, @BankDetails, @Documents, @EditList, @Phase, @ApplicationStatus, @SubmissionDate;
END;

CREATE PROCEDURE [dbo].[UpdateCitizenDetail]
    @ColumnName NVARCHAR(255),      -- Name of the column to be updated
    @ColumnValue NVARCHAR(MAX),     -- JSON string for the column value
    @TableName NVARCHAR(255),       -- Table name (e.g., "Users")
    @UserId INT                     -- User ID for identifying the record to update
AS
BEGIN
    SET NOCOUNT ON;

    -- Declare a dynamic SQL variable to construct the update statement
    DECLARE @sql NVARCHAR(MAX);

    -- Construct the SQL query dynamically
    SET @sql = N'
        UPDATE ' + QUOTENAME(@TableName) + '
        SET ' + QUOTENAME(@ColumnName) + ' = @ColumnValue
        WHERE UserId = @UserId';

    -- Execute the dynamic SQL
    EXEC sp_executesql @sql,
                       N'@ColumnValue NVARCHAR(MAX), @UserId INT',
                       @ColumnValue = @ColumnValue,
                       @UserId = @UserId;
END;

CREATE PROCEDURE [dbo].[UpdateFromBankResponse]
    @ResponseRecords BankResponseTableType READONLY
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;

    BEGIN TRY
        -- Update ApplicationStatus based on the incoming records
        UPDATE ApplicationStatus
        SET [Status] = CASE WHEN r.Status = 'OK' THEN 'Disbursed' ELSE 'Failure' END,
            LastUpdated = FORMAT(GETDATE(), 'dd MMM yyyy hh:mm:ss tt')
        FROM ApplicationStatus AS a
        JOIN @ResponseRecords AS r
            ON a.ServiceId = r.ServiceId AND a.ApplicationId = r.ApplicationId;

        -- Update ApplicationsCount for Dispatched
        UPDATE ApplicationsCount
        SET [Count] = [Count] - 1, LastUpdated = FORMAT(GETDATE(), 'dd MMM yyyy hh:mm:ss tt')
        FROM ApplicationsCount AS ac
        JOIN @ResponseRecords AS r
            ON ac.ServiceId = r.ServiceId AND ac.OfficerId = r.OfficerId AND ac.[Status] = 'Dispatched';

        -- Update or Insert ApplicationsCount for Disbursed or Failure
        MERGE ApplicationsCount AS ac
        USING (
            SELECT ServiceId, OfficerId, 
                   CASE WHEN Status = 'OK' THEN 'Disbursed' ELSE 'Failure' END AS [Status], 
                   COUNT(*) AS RecordCount, MAX(DateOfDibursion) AS LastUpdated
            FROM @ResponseRecords
            GROUP BY ServiceId, OfficerId, Status
        ) AS r
        ON ac.ServiceId = r.ServiceId AND ac.OfficerId = r.OfficerId AND ac.[Status] = r.[Status]
        WHEN MATCHED THEN
            UPDATE SET [Count] = ac.[Count] + r.RecordCount, LastUpdated = FORMAT(GETDATE(), 'dd MMM yyyy hh:mm:ss tt')
        WHEN NOT MATCHED THEN
            INSERT (ServiceId, OfficerId, [Status], [Count], LastUpdated)
            VALUES (r.ServiceId, r.OfficerId, r.[Status], r.RecordCount, FORMAT(GETDATE(), 'dd MMM yyyy hh:mm:ss tt'));

        -- Insert into ApplicationsHistory
        INSERT INTO ApplicationsHistory (ServiceId, ApplicationId, ActionTaken, TakenBy, Remarks, [File], TakenAt)
        SELECT ServiceId, ApplicationId, 
               CASE WHEN [Status] = 'OK' THEN 'Disbursed' ELSE 'Failure' END AS ActionTaken, 
               OfficerId, TransactionStatus, [File], FORMAT(GETDATE(), 'dd MMM yyyy hh:mm:ss tt')
        FROM @ResponseRecords;

        -- Update Applications table
        UPDATE Applications
        SET ApplicationStatus = CASE WHEN r.Status = 'OK' THEN 'Disbursed' ELSE 'Failure' END
        FROM Applications AS a
        JOIN @ResponseRecords AS r
            ON a.ApplicationId = r.ApplicationId;

        -- Insert into PaymentDetails
        INSERT INTO PaymentDetails (ApplicationId, ApplicantName, [Status], TransactionId, DateOfDistribution, TransactionStatus)
        SELECT ApplicationId, ApplicantName, Status, TransactionId, DateOfDibursion, TransactionStatus
        FROM @ResponseRecords;

        -- Commit the transaction
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        -- Rollback the transaction in case of an error
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        -- Throw the error for debugging
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
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