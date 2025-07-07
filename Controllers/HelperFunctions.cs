using System.Dynamic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using SahayataNidhi.Models.Entities;

public class UserHelperFunctions(IWebHostEnvironment webHostEnvironment, SocialWelfareDepartmentContext dbcontext, ILogger<UserHelperFunctions> logger)
{
    private readonly IWebHostEnvironment _webHostEnvironment = webHostEnvironment;
    private readonly SocialWelfareDepartmentContext dbcontext = dbcontext;

    private readonly ILogger<UserHelperFunctions> _logger = logger;

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

    // public void UpdateApplicationHistory(int serviceId, string applicationId, int takenBy, string actionTaken, string remarks, string file = "")
    // {
    //     // Create a new history record
    //     var newHistory = new ApplicationsHistory
    //     {
    //         ServiceId = serviceId,
    //         ApplicationId = applicationId,
    //         ActionTaken = actionTaken,
    //         TakenBy = takenBy,
    //         File = file,
    //         TakenAt = DateTime.Now.ToString("dd MMM yyyy hh:mm tt") // Format DateTime as per requirements
    //     };

    //     // Add the new history record to the database
    //     dbcontext.ApplicationsHistories.Add(newHistory);
    //     dbcontext.SaveChanges();
    // }



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


    // public async void WebService(string webAction, int serviceId, string applicationId)
    // {
    //     // Retrieve the service
    //     var service = dbcontext.Services.FirstOrDefault(s => s.ServiceId == serviceId);
    //     if (service == null || string.IsNullOrEmpty(service.WebService))
    //     {
    //         _logger.LogInformation("Service not found or WebService data is missing.");
    //     }

    //     // Deserialize the WebService JSON
    //     var webserviceList = JsonConvert.DeserializeObject<Dictionary<string, JArray>>(service!.WebService!);
    //     if (webserviceList == null || !webserviceList.ContainsKey(webAction))
    //     {
    //         _logger.LogInformation($"Action '{webAction}' not found in WebService data.");
    //     }

    //     // Get the action array
    //     var actionArray = webserviceList![webAction];
    //     if (actionArray == null || actionArray.Count == 0)
    //     {
    //         _logger.LogInformation("No web services found for the specified action.");
    //     }

    //     var httpClient = new HttpClient(); // Instantiate HttpClient for making the POST request

    //     foreach (int id in actionArray!)
    //     {
    //         // Create a dynamic object to store results
    //         var dynamicObject = new ExpandoObject() as IDictionary<string, object>;

    //         var webservice = dbcontext.WebServices.FirstOrDefault(ws => ws.WebserviceId == id);
    //         if (webservice == null)
    //         {
    //             _logger.LogInformation($"WebService with ID {id} not found.");
    //         }

    //         // Deserialize the response fields into a list of JObject
    //         var responseFields = JsonConvert.DeserializeObject<List<JObject>>(webservice!.Fields);
    //         if (responseFields == null || responseFields.Count == 0)
    //         {
    //             continue;
    //         }

    //         // Retrieve the application
    //         var application = dbcontext.Applications.FirstOrDefault(a => a.ApplicationId == applicationId);
    //         if (application == null)
    //         {
    //             _logger.LogInformation("Application not found.");
    //         }

    //         // Deserialize ServiceSpecific data
    //         var serviceSpecific = JsonConvert.DeserializeObject<dynamic>(application!.ServiceSpecific);

    //         foreach (var field in responseFields)
    //         {
    //             // Extract FieldName and NodeReference
    //             var fieldName = field["FieldName"]?.ToString();
    //             var nodeReference = field["NodeReference"]?.ToString();

    //             if (string.IsNullOrEmpty(fieldName))
    //             {
    //                 _logger.LogInformation("FieldName must be a non-null string.");
    //             }

    //             if (string.IsNullOrEmpty(nodeReference))
    //             {
    //                 _logger.LogInformation($"NodeReference for FieldName '{fieldName}' must be a non-null string.");
    //             }

    //             object value;

    //             // Check if key exists in ServiceSpecific
    //             if (serviceSpecific != null && ((JObject)serviceSpecific!).ContainsKey(nodeReference!))
    //             {
    //                 value = serviceSpecific![nodeReference]?.ToString() ?? "null";
    //             }
    //             else
    //             {
    //                 // Fallback to application property
    //                 var info = application.GetType().GetProperty(nodeReference!);
    //                 if (info == null)
    //                 {
    //                     _logger.LogInformation($"Property '{nodeReference}' not found on Application or ServiceSpecific object.");
    //                 }

    //                 value = info!.GetValue(application) ?? "null"; // Handle null values
    //             }

    //             // Add to dynamicObject
    //             dynamicObject[fieldName!] = value;
    //         }

    //         // Send the dynamicObject to the Node.js server
    //         var nodeServerUrl = webservice.ServerUrl; // Update with your Node.js server URL
    //         try
    //         {
    //             var response = await httpClient.PostAsJsonAsync(nodeServerUrl, dynamicObject);

    //             // Optionally read response from Node.js server
    //             var nodeResponse = await response.Content.ReadAsStringAsync();

    //             // Log or process the response if needed
    //             Console.WriteLine($"Response from Node.js server: {nodeResponse}");
    //         }
    //         catch (Exception ex)
    //         {
    //             _logger.LogInformation("Error occurred while sending data to Node.js server");
    //         }
    //     }

    // }

    public void InsertHistory(string referenceNumber, string ActionTaken, string ActionTaker, string Remarks)
    {
        var history = new ActionHistory
        {
            ReferenceNumber = referenceNumber,
            ActionTaken = ActionTaken,
            ActionTaker = ActionTaker,
            Remarks = Remarks,
            ActionTakenDate = DateTime.Now.ToString("dd MMM yyyy hh:mm:ss tt")
        };
        dbcontext.ActionHistories.Add(history);
        dbcontext.SaveChanges();
    }

    public bool DeleteFile(string filePath)
    {
        try
        {
            if (string.IsNullOrEmpty(filePath))
            {
                return false; // Nothing to delete
            }

            // Assuming the file path is relative, adjust base path as per your setup
            var fullPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", filePath.TrimStart('/'));

            if (System.IO.File.Exists(fullPath))
            {
                System.IO.File.Delete(fullPath);
                return true;
            }

            return false; // File not found
        }
        catch (Exception ex)
        {
            // Log exception if needed
            Console.WriteLine($"Error deleting file: {ex.Message}");
            return false;
        }
    }

}

