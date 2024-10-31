using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using ReactMvcApp.Models.Entities;

public class UserHelperFunctions
{
    private readonly IWebHostEnvironment _webHostEnvironment;
    private readonly SocialWelfareDepartmentContext dbcontext;

    private readonly ILogger<UserHelperFunctions> _logger;
    public UserHelperFunctions(IWebHostEnvironment webHostEnvironment, SocialWelfareDepartmentContext dbcontext, ILogger<UserHelperFunctions> logger)
    {
        this.dbcontext = dbcontext;
        _webHostEnvironment = webHostEnvironment;
        _logger = logger;
    }


    public async Task<string> GetFilePath(IFormFile? docFile, string folder = "uploads")
    {
        string docPath = "";
        string uploadsFolder = Path.Combine(_webHostEnvironment.WebRootPath, folder);
        string shortGuid = Guid.NewGuid().ToString("N")[..8];

        string fileExtension = Path.GetExtension(docFile?.FileName)!;
        string uniqueName = shortGuid + fileExtension;


        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        if (docFile != null && docFile.Length > 0)
        {
            _logger.LogInformation($"----File:{docFile?.FileName} Extension:{Path.GetExtension(docFile?.FileName)}-------");
            try
            {
                string filePath = Path.Combine(uploadsFolder, uniqueName);
                _logger.LogInformation($"-----Attempting to save file at: {filePath}----");
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await docFile!.CopyToAsync(stream);
                }

                docPath = "/" + folder + "/" + uniqueName;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error while uploading file: {ex.Message}");
                throw;
            }
        }


        return docPath;
    }

    public string GetCurrentFinancialYear()
    {
        var today = DateTime.Today;
        int startYear;

        if (today.Month < 4)
        {
            startYear = today.Year - 1;
        }
        else
        {
            startYear = today.Year;
        }

        int endYear = startYear + 1;
        return $"{startYear}-{endYear}";
    }

    public string GenerateApplicationId(int districtId, SocialWelfareDepartmentContext dbcontext)
    {
        string? districtShort = dbcontext.Districts.FirstOrDefault(u => u.DistrictId == districtId)?.DistrictShort;

        string financialYear = GetCurrentFinancialYear();

        var result = dbcontext.ApplicationPerDistricts.FirstOrDefault(a => a.DistrictId == districtId && a.FinancialYear == financialYear);

        int countPerDistrict = result?.CountValue ?? 0;

        string sql = "";

        if (countPerDistrict != 0)
            sql = "UPDATE ApplicationPerDistrict SET CountValue = @CountValue WHERE DistrictId = @districtId AND FinancialYear = @financialyear";
        else
            sql = "INSERT INTO ApplicationPerDistrict (DistrictId, FinancialYear, CountValue) VALUES (@districtId, @financialyear, @CountValue)";

        countPerDistrict++; // Increment before using in SqlParameter

        dbcontext.Database.ExecuteSqlRaw(sql,
            new SqlParameter("@districtId", districtId),
            new SqlParameter("@financialyear", financialYear),
            new SqlParameter("@CountValue", countPerDistrict));

        return $"{districtShort}/{financialYear}/{countPerDistrict}";
    }


    public SqlParameter[]? GetAddressParameters(IFormCollection form, string prefix)
    {
        try
        {
            return
            [
            new SqlParameter("@AddressDetails", form[$"{prefix}Address"].ToString()),
            new SqlParameter("@DistrictId", Convert.ToInt32(form[$"{prefix}District"])),
            new SqlParameter("@TehsilId", Convert.ToInt32(form[$"{prefix}Tehsil"])),
            new SqlParameter("@BlockId", Convert.ToInt32(form[$"{prefix}Block"])),
            new SqlParameter("@HalqaPanchayatName", form[$"{prefix}PanchayatMuncipality"].ToString()),
            new SqlParameter("@VillageName", form[$"{prefix}Village"].ToString()),
            new SqlParameter("@WardName", form[$"{prefix}Ward"].ToString()),
            new SqlParameter("@Pincode", form[$"{prefix}Pincode"].ToString())
            ];
        }
        catch (FormatException)
        {
            return null;
        }
    }

    public void UpdateApplication(string columnName, string columnValue, SqlParameter applicationId)
    {
        var columnNameParam = new SqlParameter("@ColumnName", columnName);
        var columnValueParam = new SqlParameter("@ColumnValue", columnValue);

        dbcontext.Database.ExecuteSqlRaw("EXEC UpdateApplication @ColumnName,@ColumnValue,@ApplicationId", columnNameParam, columnValueParam, applicationId);
    }

   public void UpdateApplicationHistory(int serviceId, string applicationId, int takenBy, string actionTaken, string remarks, string file = "")
    {
        // Create a new history record
        var newHistory = new ApplicationsHistory
        {
            ServiceId = serviceId,
            ApplicationId = applicationId,
            ActionTaken = actionTaken,
            TakenBy = takenBy,
            File = file,
            TakenAt = DateTime.Now.ToString("dd MMM yyyy hh:mm tt") // Format DateTime as per requirements
        };

        // Add the new history record to the database
        dbcontext.ApplicationsHistories.Add(newHistory);
        dbcontext.SaveChanges();
    }



    public User? GetOfficerDetails(string designation, string accessLevel, int accessCode)
    {
        var officer = dbcontext.Users
            .Join(
                dbcontext.OfficerDetails,
                u => u.UserId,
                o => o.OfficerId,
                (u, o) => new { User = u, OfficerDetail = o }
            )
            .Where(joined => joined.OfficerDetail.Role == designation
                          && joined.OfficerDetail.AccessLevel == accessLevel
                          && joined.OfficerDetail.AccessCode == accessCode)
            .Select(joined => joined.User) // Select only the User
            .FirstOrDefault(); // Get the first match or null if none found

        return officer; // Returns a User or null
    }
    public (Application UserDetails, AddressJoin PreAddressDetails, AddressJoin PerAddressDetails, dynamic ServiceSpecific, dynamic BankDetails,dynamic Documents) GetUserDetailsAndRelatedData(string applicationId)
    {
        var userDetails = dbcontext.Applications.FirstOrDefault(u => u.ApplicationId == applicationId);

        var PreAddressId = new SqlParameter("@AddressId", userDetails!.PresentAddressId);
        var preAddressDetails = dbcontext.Database.SqlQuery<AddressJoin>($"EXEC GetAddressDetails @AddressId = {PreAddressId}")
            .AsEnumerable()
            .FirstOrDefault();

        var PerAddressId = new SqlParameter("@AddressId", userDetails.PermanentAddressId);
        var perAddressDetails = dbcontext.Database.SqlQuery<AddressJoin>($"EXEC GetAddressDetails @AddressId = {PerAddressId}")
            .AsEnumerable()
            .FirstOrDefault();

        var serviceSpecific = JsonConvert.DeserializeObject<Dictionary<string, string>>(userDetails.ServiceSpecific);
        var bankDetails = JsonConvert.DeserializeObject<dynamic>(userDetails.BankDetails);
        var documents = JsonConvert.DeserializeObject<dynamic>(userDetails.Documents);
        return (userDetails, preAddressDetails, perAddressDetails, serviceSpecific, bankDetails,documents)!;
    }

    public string[] GenerateUniqueRandomCodes(int numberOfCodes, int codeLength)
    {
        HashSet<string> codesSet = new HashSet<string>();
        Random random = new();

        while (codesSet.Count < numberOfCodes)
        {
            const string chars = "0123456789";
            char[] codeChars = new char[codeLength];

            for (int i = 0; i < codeLength; i++)
            {
                codeChars[i] = chars[random.Next(chars.Length)];
            }

            string newCode = new(codeChars);
            codesSet.Add(newCode.ToString());
        }

        string[] codesArray = new string[numberOfCodes];
        codesSet.CopyTo(codesArray);
        return codesArray;
    }

}

