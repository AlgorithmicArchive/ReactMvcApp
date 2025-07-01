using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using System.IO;
using iText.Kernel.Geom;
using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;
using iText.Layout.Properties;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using SahayataNidhi.Models.Entities;
using iText.IO.Image;

namespace SahayataNidhi.Controllers.Officer
{
    public partial class OfficerController : Controller
    {

        [HttpGet]
        public IActionResult GetApplicationsCount(int ServiceId)
        {
            // Get the current officer's details.
            var officer = GetOfficerDetails();
            if (officer == null)
            {
                return Unauthorized();
            }

            // Retrieve the service record.
            var service = dbcontext.Services.FirstOrDefault(s => s.ServiceId == ServiceId);
            if (service == null)
            {
                return NotFound();
            }

            // Deserialize the OfficerEditableField JSON.
            // Assuming the JSON is an array of objects.
            var workflow = JsonConvert.DeserializeObject<List<dynamic>>(service.OfficerEditableField!);
            if (workflow == null || workflow.Count == 0)
            {
                return Json(new { countList = new List<dynamic>(), canSanction = false });
            }

            // The JSON field names must match those in your stored JSON.
            dynamic authorities = workflow.FirstOrDefault(p => p.designation == officer.Role)!;
            if (authorities == null)
            {
                return Json(new { countList = new List<dynamic>(), canSanction = false });
            }

            var sqlParams = new List<SqlParameter>
            {
                new SqlParameter("@AccessLevel", officer.AccessLevel),
                new SqlParameter("@AccessCode", officer.AccessCode ?? 0),  // or TehsilId
                new SqlParameter("@ServiceId", ServiceId),
                new SqlParameter("@TakenBy", officer.Role)
            };

            // Add DivisionCode only when required
            if (officer.AccessLevel == "Division")
            {
                sqlParams.Add(new SqlParameter("@DivisionCode", officer.AccessCode));
            }
            else
            {
                sqlParams.Add(new SqlParameter("@DivisionCode", DBNull.Value));
            }

            var counts = dbcontext.Database
                .SqlQueryRaw<StatusCounts>(
                    "EXEC GetStatusCount @AccessLevel, @AccessCode, @ServiceId, @TakenBy, @DivisionCode",
                    sqlParams.ToArray()
                )
                .AsEnumerable()
                .FirstOrDefault() ?? new StatusCounts();

            // Build the count list based on the available authority permissions.
            var countList = new List<dynamic>
            {
                new
                {
                    label = "Total Applications",
                    count = counts.TotalApplications,
                    bgColor = "#000000",
                    textColor = "#FFFFFF"
                },

                // Pending is always included.
                new
                {
                    label = "Pending",
                    count = counts.PendingCount,
                    bgColor = "#FFC107",
                    textColor = "#212121"
                }
            };

            // Forwarded (if allowed)
            if ((bool)authorities.canForwardToPlayer)
            {
                countList.Add(new
                {
                    label = "Forwarded",
                    count = counts.ForwardedCount,
                    bgColor = "#64B5F6",
                    textColor = "#0D47A1"
                });
            }

            // Returned (if allowed)
            if ((bool)authorities.canReturnToPlayer)
            {
                countList.Add(new
                {
                    label = "Returned",
                    count = counts.ReturnedCount,
                    bgColor = "#E0E0E0",
                    textColor = "#212121"
                });
            }

            // Citizen Pending (if allowed)
            if ((bool)authorities.canReturnToCitizen)
            {
                countList.Add(new
                {
                    label = "Citizen Pending",
                    count = counts.ReturnToEditCount,
                    bgColor = "#CE93D8",
                    textColor = "#4A148C",
                    tooltipText = "Application is pending at Citizen level for correction."
                });
            }

            // Rejected (if allowed)
            if ((bool)authorities.canReject)
            {
                countList.Add(new
                {
                    label = "Rejected",
                    count = counts.RejectCount,
                    bgColor = "#FF7043",
                    textColor = "#B71C1C"
                });
            }

            // Sanctioned (if allowed)
            if ((bool)authorities.canSanction)
            {
                countList.Add(new
                {
                    label = "Sanctioned",
                    count = counts.SanctionedCount,
                    bgColor = "#81C784",
                    textColor = "#1B5E20"
                });
            }

            countList.Add(new
            {
                label = "Disbursed",
                count = counts.DisbursedCount,
                bgColor = "#ABCDEF",
                textColor = "#123456"
            });

            // Return the count list and whether the officer can sanction.
            return Json(new { countList, canSanction = (bool)authorities.canSanction, canHavePool = (bool)authorities.canHavePool });
        }
        [HttpGet]
        public IActionResult GetApplications(int ServiceId, string type, int pageIndex = 0, int pageSize = 10)
        {
            var officerDetails = GetOfficerDetails();
            var role = new SqlParameter("@Role", officerDetails.Role);
            var accessLevel = new SqlParameter("@AccessLevel", officerDetails.AccessLevel);
            var accessCode = new SqlParameter("@AccessCode", officerDetails.AccessCode);
            var applicationStatus = new SqlParameter("@ApplicationStatus", (object)type?.ToLower()! ?? DBNull.Value);
            var serviceId = new SqlParameter("@ServiceId", ServiceId);

            var response = dbcontext.CitizenApplications
                .FromSqlRaw("EXEC GetApplicationsForOfficer @Role, @AccessLevel, @AccessCode, @ApplicationStatus, @ServiceId",
                    role, accessLevel, accessCode, applicationStatus, serviceId)
                .ToList();

            _logger.LogInformation($"----------Type : {type}------------------");

            // Sorting for consistent pagination based on ReferenceNumber
            var sortedResponse = response.OrderBy(a =>
            {
                var parts = a.ReferenceNumber.Split('/');
                var numberPart = parts.Last();
                return int.TryParse(numberPart, out int num) ? num : 0;
            }).ToList();

            var totalRecords = sortedResponse.Count;

            var pagedResponse = sortedResponse
                .Skip(pageIndex * pageSize)
                .Take(pageSize)
                .ToList();

            List<dynamic> columns =
            [
                new { accessorKey = "referenceNumber", header = "Reference Number" },
                new { accessorKey = "applicantName", header = "Applicant Name" },
                new { accessorKey = "submissionDate", header = "Submission Date" }
            ];

            List<dynamic> data = [];
            List<dynamic> poolData = [];

            var poolList = dbcontext.Pools.FirstOrDefault(p =>
                p.ServiceId == ServiceId &&
                p.AccessLevel == officerDetails.AccessLevel &&
                p.AccessCode == officerDetails.AccessCode
            );

            var pool = poolList != null && !string.IsNullOrWhiteSpace(poolList.List)
                ? JsonConvert.DeserializeObject<List<string>>(poolList.List)
                : new List<string>();

            int index = 0;

            foreach (var details in pagedResponse)
            {
                var formDetails = JsonConvert.DeserializeObject<dynamic>(details.FormDetails!);
                var officers = JsonConvert.DeserializeObject<JArray>(details.WorkFlow!);

                var customActions = new List<dynamic>();

                if (pool!.Contains(details.ReferenceNumber) && type == "Pending")
                {
                    customActions.Add(new
                    {
                        type = "View",
                        tooltip = "View",
                        color = "#F0C38E",
                        actionFunction = "handleOpenApplication"
                    });

                    poolData.Add(new
                    {
                        referenceNumber = details.ReferenceNumber,
                        applicantName = GetFieldValue("ApplicantName", formDetails),
                        submissionDate = details.CreatedAt,
                        customActions
                    });
                }
                else
                {
                    if (type == "Pending")
                    {
                        customActions.Add(new
                        {
                            type = "Open",
                            tooltip = "View",
                            color = "#F0C38E",
                            actionFunction = "handleOpenApplication"
                        });
                    }
                    else if (type == "Forwarded" || type == "Returned" || type == "Sanctioned")
                    {
                        var currentOfficer = officers!.FirstOrDefault(o => (string)o["designation"]! == officerDetails.Role);
                        _logger.LogInformation($"---------- CAN OFFICER PULL: {currentOfficer!["canPull"]}-------------");
                        if (currentOfficer != null && (bool)currentOfficer["canPull"]!)
                        {
                            customActions.Add(new
                            {
                                type = "Pull",
                                tooltip = "Pull",
                                color = "#F0C38E",
                                actionFunction = "pullApplication"
                            });
                        }
                    }
                    else
                    {
                        customActions.Add(new
                        {
                            type = "View",
                            tooltip = "View",
                            color = "#F0C38E",
                            actionFunction = "handleViewApplication"
                        });
                    }

                    data.Add(new
                    {
                        referenceNumber = details.ReferenceNumber,
                        applicantName = GetFieldValue("ApplicantName", formDetails),
                        submissionDate = details.CreatedAt,
                        customActions
                    });
                }

                index++;
            }

            return Json(new
            {
                data,
                columns,
                poolData,
                totalRecords
            });
        }
        [HttpGet]
        public IActionResult GetApplicationsForReports(int AccessCode, int ServiceId, string StatusType, int pageIndex = 0, int pageSize = 10)
        {
            var officerDetails = GetOfficerDetails();
            string type = StatusType;
            var role = new SqlParameter("@Role", officerDetails!.Role);
            var accessLevel = new SqlParameter("@AccessLevel", officerDetails.AccessLevel);
            var accessCode = new SqlParameter("@AccessCode", AccessCode);
            var applicationStatus = new SqlParameter("@ApplicationStatus", (object)type?.ToLower()! ?? DBNull.Value);
            var serviceId = new SqlParameter("@ServiceId", ServiceId);

            var response = dbcontext.CitizenApplications
                .FromSqlRaw("EXEC GetApplicationsForReport  @AccessCode, @ApplicationStatus, @ServiceId",
                   accessCode, applicationStatus, serviceId)
                .ToList();

            _logger.LogInformation($"----------Type : {type}------------------");

            // Sorting for consistent pagination based on ReferenceNumber
            var sortedResponse = response.OrderBy(a =>
            {
                var parts = a.ReferenceNumber.Split('/');
                var numberPart = parts.Last();
                return int.TryParse(numberPart, out int num) ? num : 0;
            }).ToList();

            var totalRecords = sortedResponse.Count;

            var pagedResponse = sortedResponse
                .Skip(pageIndex * pageSize)
                .Take(pageSize)
                .ToList();

            List<dynamic> columns =
            [
                new { accessorKey = "referenceNumber", header = "Reference Number" },
                new { accessorKey = "applicantName", header = "Applicant Name" },
                new { accessorKey = "parentage", header = "Parentage" },
                new { accessorKey = "submissionDate", header = "Submission Date" }
            ];

            if (type == "pending")
            {
                columns.Insert(3, new { accessorKey = "currentlyWith", header = "Currently With" });
            }
            else if (type == "sanctioned")
            {
                columns.Insert(4, new { accessorKey = "sanctionedon", header = "Sanctioned Date" });
            }

            List<dynamic> data = [];

            foreach (var details in pagedResponse)
            {
                var formDetails = JsonConvert.DeserializeObject<dynamic>(details.FormDetails!);
                var currentPalyerIndex = details.CurrentPlayer;
                var workFlowSteps = JsonConvert.DeserializeObject<List<dynamic>>(details.WorkFlow!);

                var item = new Dictionary<string, object>
                {
                    { "referenceNumber", details.ReferenceNumber },
                    { "applicantName", GetFieldValue("ApplicantName", formDetails) },
                    { "parentage", $"{GetFieldValue("RelationName", formDetails)}({GetFieldValue("Relation", formDetails)})" },
                    { "submissionDate", details.CreatedAt! }
                };

                if (type == "pending")
                {

                    string officerRole = workFlowSteps![currentPalyerIndex].designation;
                    item["currentlyWith"] = officerRole;
                }
                else if (type == "sanctioned")
                {
                    string completedAt = workFlowSteps![currentPalyerIndex].completedAt;
                    item["sanctionedon"] = completedAt;
                }

                data.Add(item);
            }

            return Json(new
            {
                data,
                columns,
                totalRecords
            });
        }

        [HttpGet]
        public IActionResult GetUserDetails(string applicationId)
        {
            // Retrieve the application details.
            var details = dbcontext.CitizenApplications
                          .FirstOrDefault(ca => ca.ReferenceNumber == applicationId);

            if (details == null)
            {
                return Json(new { error = "Application not found" });
            }

            var serviceDetails = dbcontext.Services
                .FirstOrDefault(s => s.ServiceId == details.ServiceId);

            // Deserialize form details
            JToken formDetailsToken = JToken.Parse(details.FormDetails!);

            // Deserialize workflow
            var officerDetails = JsonConvert.DeserializeObject<dynamic>(details.WorkFlow!);
            int currentPlayer = details.CurrentPlayer;

            // Convert workflow to JArray
            JArray? officerArray = officerDetails as JArray;
            var currentOfficer = officerArray?.FirstOrDefault(o => (int)o["playerId"]! == currentPlayer);
            var previousOfficer = officerArray?.FirstOrDefault(o => (int)o["playerId"]! == (currentPlayer - 1));
            var nextOfficer = officerArray?.FirstOrDefault(o => (int)o["playerId"]! == (currentPlayer + 1));

            if (previousOfficer != null) previousOfficer["canPull"] = false;
            if (nextOfficer != null) nextOfficer["canPull"] = false;

            // Save updated workflow (only canPull changes)
            details.WorkFlow = JsonConvert.SerializeObject(officerArray);
            dbcontext.SaveChanges();

            // Clone currentOfficer and inject actionForm (without modifying DB)
            JObject currentOfficerClone = currentOfficer != null ? (JObject)currentOfficer.DeepClone() : new JObject();

            if (!string.IsNullOrWhiteSpace(serviceDetails!.OfficerEditableField) && currentOfficerClone != null)
            {
                var editableFields = JsonConvert.DeserializeObject<List<JObject>>(serviceDetails.OfficerEditableField);
                int playerId = (int)currentOfficerClone["playerId"]!;

                var match = editableFields!.FirstOrDefault(f => (int)f["playerId"]! == playerId);
                if (match != null && match["actionForm"] != null)
                {
                    currentOfficerClone["actionForm"] = match["actionForm"];
                }
            }

            // Replace district and tehsil codes with names
            foreach (JProperty section in formDetailsToken.Children<JProperty>())
            {
                foreach (var fieldToken in section.Value.Children())
                {
                    if (fieldToken is not JObject field)
                        continue;

                    string fieldName = field["name"]?.ToString() ?? "";

                    if (fieldName.Equals("District", StringComparison.OrdinalIgnoreCase) ||
                        fieldName.EndsWith("District", StringComparison.OrdinalIgnoreCase))
                    {
                        if (field["value"] != null && int.TryParse(field["value"]!.ToString(), out int districtCode))
                        {
                            field["value"] = GetDistrictName(districtCode);
                        }
                    }
                    else if (fieldName.Equals("Tehsil", StringComparison.OrdinalIgnoreCase) ||
                             fieldName.EndsWith("Tehsil", StringComparison.OrdinalIgnoreCase))
                    {
                        if (field["value"] != null && int.TryParse(field["value"]!.ToString(), out int tehsilCode))
                        {
                            field["value"] = GetTehsilName(tehsilCode);
                        }
                    }
                }
            }

            // Return the updated details
            return Json(new
            {
                list = formDetailsToken,
                currentOfficerDetails = currentOfficerClone
            });
        }

        [HttpGet]
        public IActionResult GetRecordsForBankFile(int AccessCode, int ServiceId, string type, int Month, int Year, int pageIndex = 0, int pageSize = 10)
        {
            var accessCode = new SqlParameter("@AccessCode", AccessCode);
            var applicationStatus = new SqlParameter("@ApplicationStatus", type);
            var serviceId = new SqlParameter("@ServiceId", ServiceId);
            var month = new SqlParameter("@Month", Month);
            var year = new SqlParameter("@Year", Year);

            // Call new stored procedure
            var rawResults = dbcontext.Database
            .SqlQueryRaw<BankFileRawResult>(
                "EXEC GetRecordsForBankFile_New @AccessCode, @ApplicationStatus, @ServiceId, @Month, @Year",
                new SqlParameter("@AccessCode", AccessCode),
                new SqlParameter("@ApplicationStatus", type),
                new SqlParameter("@ServiceId", ServiceId),
                new SqlParameter("@Month", Month),
                new SqlParameter("@Year", Year)
            )
            .ToList();

            // Optional: Sort by ReferenceNumber (last part)
            var sortedResults = rawResults.OrderBy(a =>
            {
                var parts = a.ReferenceNumber!.Split('/');
                var numberPart = parts.Last();
                return int.TryParse(numberPart, out int num) ? num : 0;
            }).ToList();

            var totalRecords = sortedResults.Count;

            // Paginate
            var pagedResults = sortedResults
                .Skip(pageIndex * pageSize)
                .Take(pageSize)
                .ToList();

            var columns = new List<dynamic>
            {
                new { accessorKey = "referenceNumber", header = "Reference Number" },
                new { accessorKey = "districtbankuid", header = "District Bank Uid" },
                new { accessorKey = "department", header = "Department" },
                new { accessorKey = "payingBankAccountNumber", header = "Paying Bank Account Number" },
                new { accessorKey = "payingBankIfscCode", header = "Paying IFSC Code" },
                new { accessorKey = "amount", header = "Pension Amount" },
                new { accessorKey = "fileGenerationDate", header = "File Generation Date" },
                new { accessorKey = "payingBankName", header = "Paying Bank Name" },
                new { accessorKey = "applicantName", header = "Applicant Name" },
                new { accessorKey = "receivingIfscCode", header = "Receiving IFSC Code" },
                new { accessorKey = "receivingAccountNumber", header = "Receiving Account Number" },
                new { accessorKey = "pensionType", header = "Pension Type" },
            };

            return Ok(new
            {
                data = pagedResults,
                columns,
                totalRecords,
                pageIndex,
                pageSize
            });
        }

        [HttpGet]
        public IActionResult ExportBankFileCsv(int AccessCode, int ServiceId, string type, int Month, int Year)
        {
            // Fetch district short name from DB based on AccessCode
            var districtShortName = dbcontext.Districts
                .Where(d => d.DistrictId == AccessCode)
                .Select(d => d.DistrictShort) // ensure this column exists
                .FirstOrDefault();

            if (string.IsNullOrEmpty(districtShortName))
                return BadRequest("District not found");

            // Prepare filename
            string monthShort = new DateTime(Year, Month, 1).ToString("MMM"); // e.g., "Jul"
            string fileName = $"BankFile_{districtShortName}_{monthShort}_{Year}.csv";

            // SQL parameters
            var accessCode = new SqlParameter("@AccessCode", AccessCode);
            var applicationStatus = new SqlParameter("@ApplicationStatus", type);
            var serviceId = new SqlParameter("@ServiceId", ServiceId);
            var month = new SqlParameter("@Month", Month);
            var year = new SqlParameter("@Year", Year);

            // Execute stored procedure
            var rawResults = dbcontext.Database
                .SqlQueryRaw<BankFileRawResult>(
                    "EXEC GetRecordsForBankFile_New @AccessCode, @ApplicationStatus, @ServiceId, @Month, @Year",
                    accessCode, applicationStatus, serviceId, month, year)
                .ToList();

            if (rawResults.Count == 0)
                return NotFound("No records found for the provided parameters.");

            // Build CSV
            var csvBuilder = new StringBuilder();
            foreach (var item in rawResults)
            {
                var line = string.Join(",",
                    EscapeCsv(item.ReferenceNumber),
                    EscapeCsv(item.Districtbankuid),
                    EscapeCsv(item.Department),
                    EscapeCsv(item.PayingBankAccountNumber),
                    EscapeCsv(item.PayingBankIfscCode),
                    EscapeCsv(item.PayingBankName),
                    EscapeCsv(item.FileGenerationDate.ToString("yyyy-MM-dd HH:mm:ss")),
                    item.Amount,
                    EscapeCsv(item.ApplicantName),
                    EscapeCsv(item.ReceivingIfscCode),
                    EscapeCsv(item.ReceivingAccountNumber),
                    EscapeCsv(item.PensionType)
                );

                csvBuilder.AppendLine(line);
            }

            // Define file path on the server
            string folderPath = System.IO.Path.Combine(_webHostEnvironment.WebRootPath, "BankFiles");
            if (!Directory.Exists(folderPath))
                Directory.CreateDirectory(folderPath);

            string filePath = System.IO.Path.Combine(folderPath, fileName);

            // Save file to disk
            System.IO.File.WriteAllText(filePath, csvBuilder.ToString(), Encoding.UTF8);

            // Return file to frontend
            var mimeType = "text/csv";
            return PhysicalFile(filePath, mimeType, fileName);
        }


        private static string EscapeCsv(string? input)
        {
            if (string.IsNullOrEmpty(input))
                return "";
            if (input.Contains(",") || input.Contains("\"") || input.Contains("\n"))
                return $"\"{input.Replace("\"", "\"\"")}\"";
            return input;
        }


        [HttpGet]
        public IActionResult GetSanctionLetter(string applicationId)
        {
            OfficerDetailsModal officer = GetOfficerDetails();
            var formdetails = dbcontext.CitizenApplications.FirstOrDefault(fd => fd.ReferenceNumber == applicationId);
            var lettersJson = dbcontext.Services
                       .FirstOrDefault(s => s.ServiceId == Convert.ToInt32(formdetails!.ServiceId))?.Letters;

            var parsed = JsonConvert.DeserializeObject<Dictionary<string, dynamic>>(lettersJson!);
            dynamic? sanctionSection = parsed!.TryGetValue("Sanction", out var sanction) ? sanction : null;
            var tableFields = sanctionSection!.tableFields;
            var sanctionLetterFor = sanctionSection.letterFor;
            var information = sanctionSection.information;

            var details = dbcontext.CitizenApplications
                .FirstOrDefault(ca => ca.ReferenceNumber == applicationId);



            var formData = JsonConvert.DeserializeObject<JObject>(details!.FormDetails!);

            // Final key-value pair list for the PDF
            var pdfFields = new Dictionary<string, string>();

            foreach (var item in tableFields)
            {
                var formatted = GetFormattedValue(item, formData);
                string label = formatted.Label ?? "[Label Missing]";
                string value = formatted.Value ?? "";

                pdfFields[label] = value;
            }

            // Call your PDF generator
            _pdfService.CreateSanctionPdf(pdfFields, sanctionLetterFor?.ToString() ?? "", information?.ToString() ?? "", officer, applicationId);
            string fileName = applicationId.Replace("/", "_") + "SanctionLetter.pdf";

            return Json(new
            {
                status = true,
                path = Url.Content($"~/files/{fileName}")
            });
        }

        [HttpGet]
        public async Task<IActionResult> GetApplicationHistory(string ApplicationId, int page, int size)
        {
            if (string.IsNullOrEmpty(ApplicationId))
            {
                return BadRequest("ApplicationId is required.");
            }

            var parameter = new SqlParameter("@ApplicationId", ApplicationId);
            var application = await dbcontext.CitizenApplications.FirstOrDefaultAsync(ca => ca.ReferenceNumber == ApplicationId);
            var players = JsonConvert.DeserializeObject<dynamic>(application!.WorkFlow!) as JArray;
            int currentPlayerIndex = application.CurrentPlayer;
            var currentPlayer = players!.FirstOrDefault(o => (int)o["playerId"]! == currentPlayerIndex);
            var history = await dbcontext.ActionHistories.Where(ah => ah.ReferenceNumber == ApplicationId).ToListAsync();

            var columns = new List<dynamic>
            {
                new { header = "S.No", accessorKey="sno" },
                new { header = "Action Taker", accessorKey="actionTaker" },
                new { header = "Action Taken",accessorKey="actionTaken" },
                new { header = "Remarks",accessorKey="remarks" },
                new { header = "Action Taken On",accessorKey="actionTakenOn" },
            };
            int index = 1;
            List<dynamic> data = [];
            foreach (var item in history)
            {
                data.Add(new
                {
                    sno = index,
                    actionTaker = item.ActionTaker,
                    actionTaken = item.ActionTaken! == "ReturnToCitizen" ? "Returned for correction" : item.ActionTaken,
                    remarks = item.Remarks,
                    actionTakenOn = item.ActionTakenDate,
                });
                index++;
            }

            return Json(new { data, columns, customActions = new { } });
        }

        [HttpGet]
        public async Task<IActionResult> GenerateUserDetailsPdf(string applicationId)
        {
            if (string.IsNullOrEmpty(applicationId))
            {
                return BadRequest("Application ID is required.");
            }

            // Retrieve application details
            var application = await dbcontext.CitizenApplications
                .Where(ca => ca.ReferenceNumber == applicationId)
                .FirstOrDefaultAsync();

            if (application == null)
            {
                return NotFound("Application not found.");
            }

            using (var memoryStream = new MemoryStream())
            {
                // Initialize PDF writer and document
                var writer = new PdfWriter(memoryStream);
                var pdf = new PdfDocument(writer);
                var document = new Document(pdf, PageSize.A4);
                document.SetMargins(20, 20, 20, 20);

                // Add title
                document.Add(new Paragraph("User Details")
                    .SetFontSize(16)
                    .SetBold()
                    .SetTextAlignment(TextAlignment.CENTER));

                // Parse FormDetails JSON
                var formDetails = JObject.Parse(application.FormDetails!);

                // Iterate through each section except Documents
                foreach (var section in formDetails)
                {
                    if (section.Key == "Documents") continue; // Skip Documents section for textual part

                    document.Add(new Paragraph(section.Key)
                        .SetFontSize(14)
                        .SetBold()
                        .SetMarginTop(10));

                    if (section.Value is JArray sectionArray)
                    {
                        foreach (var item in sectionArray)
                        {
                            var label = item["label"]?.ToString();
                            var value = item["value"]?.ToString();

                            if (!string.IsNullOrEmpty(label) && !string.IsNullOrEmpty(value))
                            {
                                // Convert integer values for District and Tehsil fields
                                string displayValue = value;
                                if (label.Contains("District", StringComparison.OrdinalIgnoreCase) && int.TryParse(value, out int districtId))
                                {
                                    displayValue = GetDistrictName(districtId);
                                }
                                else if (label.Contains("Tehsil", StringComparison.OrdinalIgnoreCase) && int.TryParse(value, out int tehsilId))
                                {
                                    displayValue = GetTehsilName(tehsilId);
                                }

                                document.Add(new Paragraph($"{label}: {displayValue}")
                                    .SetFontSize(12)
                                    .SetMarginLeft(10));
                            }

                            // Handle additional fields (e.g., in Pension Type)
                            if (item["additionalFields"] is JArray additionalFields)
                            {
                                foreach (var additionalField in additionalFields)
                                {
                                    var addLabel = additionalField["label"]?.ToString();
                                    var addValue = additionalField["value"]?.ToString();
                                    if (!string.IsNullOrEmpty(addLabel) && !string.IsNullOrEmpty(addValue))
                                    {
                                        // Convert integer values for District and Tehsil in additional fields
                                        string addDisplayValue = addValue;
                                        if (addLabel.Contains("District", StringComparison.OrdinalIgnoreCase) && int.TryParse(addValue, out int districtId))
                                        {
                                            addDisplayValue = GetDistrictName(districtId);
                                        }
                                        else if (addLabel.Contains("Tehsil", StringComparison.OrdinalIgnoreCase) && int.TryParse(addValue, out int tehsilId))
                                        {
                                            addDisplayValue = GetTehsilName(tehsilId);
                                        }

                                        document.Add(new Paragraph($"{addLabel}: {addDisplayValue}")
                                            .SetFontSize(12)
                                            .SetMarginLeft(20));
                                    }

                                    // Handle nested additional fields
                                    if (additionalField["additionalFields"] is JArray nestedFields)
                                    {
                                        foreach (var nestedField in nestedFields)
                                        {
                                            var nestedLabel = nestedField["label"]?.ToString();
                                            var nestedValue = nestedField["value"]?.ToString();
                                            if (!string.IsNullOrEmpty(nestedLabel) && !string.IsNullOrEmpty(nestedValue))
                                            {
                                                // Convert integer values for District and Tehsil in nested fields
                                                string nestedDisplayValue = nestedValue;
                                                if (nestedLabel.Contains("District", StringComparison.OrdinalIgnoreCase) && int.TryParse(nestedValue, out int districtId))
                                                {
                                                    nestedDisplayValue = GetDistrictName(districtId);
                                                }
                                                else if (nestedLabel.Contains("Tehsil", StringComparison.OrdinalIgnoreCase) && int.TryParse(nestedValue, out int tehsilId))
                                                {
                                                    nestedDisplayValue = GetTehsilName(tehsilId);
                                                }

                                                document.Add(new Paragraph($"{nestedLabel}: {nestedDisplayValue}")
                                                    .SetFontSize(12)
                                                    .SetMarginLeft(30));
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                // Add attached documents from Documents section
                var documents = formDetails["Documents"] as JArray;
                if (documents != null && documents.Any())
                {
                    document.Add(new Paragraph("Attached Documents")
                        .SetFontSize(14)
                        .SetBold()
                        .SetMarginTop(20));

                    foreach (var doc in documents)
                    {
                        var filePath = doc["File"]?.ToString();
                        var enclosure = doc["Enclosure"]?.ToString();
                        if (!string.IsNullOrEmpty(filePath) && !string.IsNullOrEmpty(enclosure))
                        {
                            // Convert relative path to absolute path
                            var fullPath = System.IO.Path.Combine(_webHostEnvironment.WebRootPath, filePath.TrimStart('/'));
                            if (System.IO.File.Exists(fullPath))
                            {
                                try
                                {
                                    document.Add(new Paragraph($"Document: {enclosure}")
                                        .SetFontSize(12)
                                        .SetMarginTop(10));

                                    // Handle image attachments
                                    if (filePath.EndsWith(".jpg", StringComparison.OrdinalIgnoreCase) ||
                                        filePath.EndsWith(".png", StringComparison.OrdinalIgnoreCase))
                                    {
                                        var imageData = ImageDataFactory.Create(System.IO.File.ReadAllBytes(fullPath));
                                        var image = new Image(imageData).ScaleToFit(500, 700);
                                        document.Add(image);
                                    }
                                    // Handle PDF attachments
                                    else if (filePath.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
                                    {
                                        using (var reader = new PdfReader(fullPath))
                                        {
                                            var srcPdf = new PdfDocument(reader);
                                            srcPdf.CopyPagesTo(1, srcPdf.GetNumberOfPages(), pdf);
                                        }
                                    }
                                }
                                catch (Exception ex)
                                {
                                    document.Add(new Paragraph($"Error loading document {enclosure}: {ex.Message}")
                                        .SetFontSize(12)
                                        .SetFontColor(iText.Kernel.Colors.ColorConstants.RED));
                                }
                            }
                            else
                            {
                                document.Add(new Paragraph($"Document {enclosure}: File not found")
                                    .SetFontSize(12)
                                    .SetFontColor(iText.Kernel.Colors.ColorConstants.RED));
                            }
                        }
                    }
                }

                document.Close();
                writer.Close();

                var pdfBytes = memoryStream.ToArray();
                return File(pdfBytes, "application/pdf", $"{applicationId}_UserDetails.pdf");
            }
        }
    }
}