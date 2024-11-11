using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Renci.SshNet;
using ReactMvcApp.Models.Entities;
using Microsoft.AspNetCore.SignalR;
using CsvHelper;
using CsvHelper.Configuration;
using System.Globalization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;
using System.Security.Claims;

namespace ReactMvcApp.Controllers.Officer
{
    public partial class OfficerController : Controller
    {
        [HttpPost]
        public IActionResult UploadCsv([FromForm] IFormCollection form)
        {
            int? userId = HttpContext.Session.GetInt32("UserId");
            Models.Entities.User Officer = dbcontext.Users.Find(userId)!;
            var officer = GetOfficerDetails();
            string officerDesignation = officer.Role!;
            string accessLevel = officer.AccessLevel!;

            string ftpHost = form["ftpHost"].ToString();
            string ftpUser = form["ftpUser"].ToString();
            string ftpPassword = form["ftpPassword"].ToString();
            int serviceId = Convert.ToInt32(form["serviceId"].ToString());
            int districtId = Convert.ToInt32(form["districtId"].ToString());

            var bankFile = dbcontext.BankFiles.FirstOrDefault(bf => bf.ServiceId == serviceId && bf.DistrictId == districtId && bf.FileSent == false);
            var filePath = Path.Combine(_webHostEnvironment.WebRootPath, "exports", bankFile!.FileName);
            var ftpClient = new SftpClient(ftpHost, 22, ftpUser, ftpPassword);
            ftpClient.Connect();

            if (!ftpClient.IsConnected) return Json(new { status = false, message = "Unable to connect to the SFTP server." });

            using (var stream = new FileStream(filePath, FileMode.Open))
            {
                ftpClient.UploadFile(stream, Path.GetFileName(filePath));
            }
            ftpClient.Disconnect();

            bankFile.FileSent = true;
            dbcontext.SaveChanges();

            return Json(new { status = true, message = "File Uploaded Successfully." });
        }

        public IActionResult GetResponseBankFile([FromForm] IFormCollection form)
        {
            int? userId = HttpContext.Session.GetInt32("UserId");
            Models.Entities.User Officer = dbcontext.Users.Find(userId)!;
            var officer = GetOfficerDetails();
            string officerDesignation = officer.Role!;
            string accessLevel = officer.AccessLevel!;

            string ftpHost = form["ftpHost"].ToString();
            string ftpUser = form["ftpUser"].ToString();
            string ftpPassword = form["ftpPassword"].ToString();
            int serviceId = Convert.ToInt32(form["serviceId"].ToString());
            int districtId = Convert.ToInt32(form["districtId"].ToString());

            var bankFile = dbcontext.BankFiles.FirstOrDefault(bf => bf.ServiceId == serviceId && bf.DistrictId == districtId);

            if (bankFile == null)
            {
                return Json(new { status = false, message = "No Bank File for this district." });
            }
            else if (bankFile != null && bankFile.FileSent == false)
            {
                return Json(new { status = false, message = "Bank File not sent." });
            }

            if (!string.IsNullOrEmpty(bankFile!.ResponseFile))
            {
                return Json(new { status = true, file = bankFile.ResponseFile });
            }


            string originalFileName = Path.GetFileNameWithoutExtension(bankFile!.FileName);
            string responseFile = $"{originalFileName}_response.csv";

            var ftpClient = new SftpClient(ftpHost, 22, ftpUser, ftpPassword);
            ftpClient.Connect();



            if (!ftpClient.IsConnected)
            {
                return Json(new { status = false, message = "Unable to connect to the SFTP server." });
            }

            if (!ftpClient.Exists(responseFile))
            {
                return Json(new { status = false, message = "No response file received yet." });
            }

            string filePath = Path.Combine(_webHostEnvironment.WebRootPath, "exports", responseFile);
            Directory.CreateDirectory(Path.GetDirectoryName(filePath)!);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                ftpClient.DownloadFile(responseFile, stream);
            }

            bankFile.ResponseFile = responseFile;
            dbcontext.SaveChanges();

            return Json(new { status = true, file = bankFile.ResponseFile });

        }


        // private async Task UpdateApplicationHistoryAsync(IEnumerable<BankFileModel> bankFileData, string officer, string fileName)
        // {
        //     // Get all the ApplicationIds from the bankFileData
        //     var applicationIds = bankFileData.Select(data => data.ApplicationId).ToList();

        //     // Fetch all relevant application histories in a single query
        //     var applicationHistories = await dbcontext.ApplicationsHistories
        //         .Where(app => applicationIds.Contains(app.ApplicationId))
        //         .ToListAsync();

        //     foreach (var data in bankFileData)
        //     {
        //         // Find the corresponding history record
        //         var applicationHistory = applicationHistories.FirstOrDefault(app => app.ApplicationId == data.ApplicationId);
        //         if (applicationHistory != null)
        //         {
        //             // Deserialize history
        //             var history = JsonConvert.DeserializeObject<List<dynamic>>(applicationHistory.History) ?? new List<dynamic>();

        //             // Create the new history object
        //             var newHistoryEntry = new
        //             {
        //                 ActionTaker = officer,
        //                 ActionTaken = "Appended To Bank File",
        //                 Remarks = "NIL",
        //                 DateTime = DateTime.Now.ToString("dd MMM yyyy hh:mm tt"),
        //                 UpdateObject = (dynamic)null!,
        //                 File = fileName
        //             };

        //             // Add the new history entry
        //             history.Add(newHistoryEntry);

        //             // Serialize the history back to the string and update the database entity
        //             applicationHistory.History = JsonConvert.SerializeObject(history);
        //         }
        //     }

        //     // Save all changes in a single call
        //     await dbcontext.SaveChangesAsync();
        // }
        public async Task<IActionResult> BankCsvFile(string serviceId, string districtId)
        {
            int serviceIdInt = Convert.ToInt32(serviceId);
            int districtIdInt = Convert.ToInt32(districtId);
            var service = dbcontext.Services.FirstOrDefault(s => s.ServiceId == serviceIdInt);
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userId == null) return Unauthorized();

            var officer = await dbcontext.Users.FindAsync(Convert.ToInt32(userId));
            if (officer == null) return NotFound();

            var details = GetOfficerDetails();
            string officerDesignation = details?.Role!;
            int accessCode = Convert.ToInt32(details?.AccessCode);

            var applicationsCount = await dbcontext.ApplicationsCounts
                .FirstOrDefaultAsync(rc => rc.ServiceId == serviceIdInt && rc.OfficerId == details!.UserId && rc.Status == "Sanctioned");

            var bankFile = await dbcontext.BankFiles
                .FirstOrDefaultAsync(bf => bf.ServiceId == serviceIdInt && bf.DistrictId == districtIdInt && bf.FileSent == false);

            var district = await dbcontext.Districts
                .FirstOrDefaultAsync(d => d.DistrictId == districtIdInt);


            // Ensure the exports directory exists
            string webRootPath = _webHostEnvironment.WebRootPath;
            string exportsFolder = Path.Combine(webRootPath, "exports");

            Directory.CreateDirectory(exportsFolder);

            string fileName = bankFile?.FileName ?? $"{district!.DistrictShort}_BankFile_{DateTime.Now:ddMMMyyyyhhmm}.csv";
            string filePath = Path.Combine(exportsFolder, fileName);

            // Notify the start of the process
            await hubContext.Clients.All.SendAsync("ReceiveProgress", 0);


            // Fetch data using the stored procedure

            var bankFileData = dbcontext.Database.SqlQuery<BankFileData>($"EXEC GetBankFileData @ServiceId = {new SqlParameter("@ServiceId", serviceIdInt)}, @FileCreationDate = {new SqlParameter("@FileCreationDate", DateTime.Now.ToString("dd MMM yyyy hh:mm:ss tt"))}, @DistrictId = {new SqlParameter("@DistrictId", districtId)}").AsEnumerable().ToList();

            int totalRecords = bankFileData.Count;
            int batchSize = 1000; // Adjust the batch size as needed
            int processedRecords = 0;

            using (var streamWriter = new StreamWriter(filePath, append: true))
            using (var csvWriter = new CsvWriter(streamWriter, new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                HasHeaderRecord = false // Do not include headers
            }))
            {
                while (processedRecords < totalRecords)
                {
                    var batch = bankFileData.Skip(processedRecords).Take(batchSize);
                    await csvWriter.WriteRecordsAsync(batch);

                    processedRecords += batch.Count();
                    int progress = (int)(processedRecords / (double)totalRecords * 100);
                    await hubContext.Clients.All.SendAsync("ReceiveProgress", progress);
                }
            }


            // Notify completion
            await hubContext.Clients.All.SendAsync("ReceiveProgress", 100);

            var sanctionCount = dbcontext.ApplicationsCounts.FirstOrDefault(ac => ac.ServiceId == serviceIdInt && ac.OfficerId.ToString() == userId && ac.Status == "Sanctioned");
            sanctionCount!.Count -= totalRecords;

            if (bankFile == null)
            {
                var newBankFile = new BankFile
                {
                    ServiceId = serviceIdInt,
                    DistrictId = districtIdInt,
                    FileName = fileName,
                    GeneratedDate = DateTime.Now.ToString("dd MMM yyyy hh:mm tt"),
                    TotalRecords = totalRecords,
                    FileSent = false,
                    ResponseFile = ""
                };
                dbcontext.BankFiles.Add(newBankFile);
            }
            else
            {
                bankFile.TotalRecords += totalRecords;
                bankFile.GeneratedDate = DateTime.Now.ToString("dd MMM yyyy hh:mm tt");
            }

            await dbcontext.SaveChangesAsync();

            return Json(new { filePath = $"/exports/{fileName}" });
        }

        public IActionResult GetApplicationsForBank(string ServiceId, string DistrictId)
        {
            int serviceId = Convert.ToInt32(ServiceId);
            int districtId = Convert.ToInt32(DistrictId);
            _logger.LogInformation($"District Id: {districtId.GetType()} Service ID: {serviceId.GetType()}");

            // Fetch applications with pagination applied directly
            var applications = dbcontext.Applications
                .FromSqlRaw("EXEC GetApplicationsForBank @DistrictId, @ServiceId",
                            new SqlParameter("@DistrictId", districtId),
                            new SqlParameter("@ServiceId", serviceId))
                .ToList();

            // Total count of applications
            int totalCount = applications.Count;

            // Apply pagination to the list
            applications = applications.Skip(0).Take(10).ToList();

            // Check if bank file is sent
            var bankFile = dbcontext.BankFiles.FirstOrDefault(bf => bf.ServiceId == serviceId && bf.DistrictId == districtId);
            var isBankFileSent = bankFile?.FileSent;

            // Define columns
            var columns = new List<dynamic>
            {
                new { label = "S.No", value = "sno" },
                new { label = "Reference Number", value = "referenceNumber" },
                new { label = "Applicant Name", value = "applicantName" },
                new { label = "Submission Date", value = "submissionDate" },
            };

            // Track added columns to avoid duplicates
            var addedColumns = new HashSet<string>();

            // Initialize data list
            List<dynamic> data = [];
            int index = 1;

            foreach (var item in applications)
            {
                // Deserialize ServiceSpecific JSON
                var serviceSpecific = JsonConvert.DeserializeObject<Dictionary<string, string>>(item.ServiceSpecific);

                // Initialize cell with predefined columns
                var cell = new List<KeyValuePair<string, object>>
                {
                    new("sno", index),
                    new("referenceNumber", item.ApplicationId),
                    new("applicantName", item.ApplicantName),
                    new("submissionDate", item.SubmissionDate),
                };

                // Add dynamic columns based on ServiceSpecific data
                foreach (var kvp in serviceSpecific!)
                {
                    string key = kvp.Key;
                    string value = kvp.Value;
                    bool isDigitOnly = value.All(char.IsDigit);

                    if (!isDigitOnly && addedColumns.Add(key.ToLower())) // Add column only if it's not already added
                    {
                        columns.Insert(3, new { label = key, value = key.ToLower() });
                    }

                    // Add cell data
                    cell.Insert(3, new KeyValuePair<string, object>(key.ToLower(), value));
                }

                // Convert cell list to dictionary and add to data
                var cellDictionary = cell.ToDictionary(kvp => kvp.Key, kvp => kvp.Value);
                data.Add(cellDictionary);
                index++;
            }

            // Return the JSON result
            return Json(new { data, columns, totalCount, isBankFileSent });
        }


        public IActionResult IsBankFile(string serviceId, string districtId)
        {
            int ServiceId = Convert.ToInt32(serviceId);
            int DistrictId = Convert.ToInt32(districtId);
            var bankFile = dbcontext.BankFiles.FirstOrDefault(bf => bf.ServiceId == ServiceId && bf.DistrictId == DistrictId && bf.FileSent == false);
            var newRecords = dbcontext.Applications
            .FromSqlRaw("SELECT * FROM Applications WHERE ApplicationStatus = 'Sanctioned' AND JSON_VALUE(ServiceSpecific, '$.District') = {0}", districtId)
             .ToList();

            return Json(new { bankFile, newRecords = newRecords.Count });
        }


    }
}