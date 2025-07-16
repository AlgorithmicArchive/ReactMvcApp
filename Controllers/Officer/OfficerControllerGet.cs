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
using iText.Kernel.Colors;
using iText.Layout.Borders;
using iText.Kernel.Pdf.Canvas;

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

            var shiftedCount = dbcontext.Database.SqlQueryRaw<ShiftedCountModal>(
                        "EXEC GetShiftedCount @AccessLevel, @AccessCode, @ServiceId, @TakenBy, @DivisionCode",
                        sqlParams.ToArray()
                    )
                    .AsEnumerable()
                    .FirstOrDefault() ?? new ShiftedCountModal();

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

            if (shiftedCount != null && shiftedCount.ShiftedCount != 0)
            {
                countList.Add(new
                {
                    label = "Shifted To Another Location",
                    count = shiftedCount.ShiftedCount,
                    bgColor = "#ABCDEF",
                    textColor = "#123456"
                });
            }

            // countList.Add(new
            // {
            //     label = "Disbursed",
            //     count = counts.DisbursedCount,
            //     bgColor = "#ABCDEF",
            //     textColor = "#123456"
            // });

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
            List<CitizenApplication> response;

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
            dynamic authorities = workflow.FirstOrDefault(p => p.designation == officerDetails.Role)!;
            if (authorities == null)
            {
                return Json(new { countList = new List<dynamic>(), canSanction = false });
            }


            if (type == "shifted")
            {

                response = dbcontext.CitizenApplications
                   .FromSqlRaw("EXEC GetShiftedApplications @Role, @AccessLevel, @AccessCode, @ServiceId",
                       role, accessLevel, accessCode, serviceId)
                   .ToList();
            }
            else
            {
                response = dbcontext.CitizenApplications
                .FromSqlRaw("EXEC GetApplicationsForOfficer @Role, @AccessLevel, @AccessCode, @ApplicationStatus, @ServiceId",
                    role, accessLevel, accessCode, applicationStatus, serviceId)
                .ToList();
            }


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

                if (type == "shifted")
                {
                    customActions.Add(new
                    {
                        type = "View",
                        tooltip = "View",
                        color = "#F0C38E",
                        actionFunction = "handleViewApplication"
                    });

                    data.Add(new
                    {
                        referenceNumber = details.ReferenceNumber,
                        applicantName = GetFieldValue("ApplicantName", formDetails),
                        submissionDate = details.CreatedAt,
                        customActions
                    });
                }
                else
                {
                    if (pool!.Contains(details.ReferenceNumber) && type == "pending")
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
                        if (type == "pending")
                        {
                            customActions.Add(new
                            {
                                type = "Open",
                                tooltip = "View",
                                color = "#F0C38E",
                                actionFunction = "handleOpenApplication"
                            });
                        }
                        else if (type == "forwarded" || type == "returned" || type == "sanctioned")
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
                }
                index++;
            }


            return Json(new
            {
                data,
                columns,
                poolData,
                totalRecords,
                canSanction = (bool)authorities.canSanction
            });
        }
        [HttpGet]
        public IActionResult GetApplicationsForReports(int AccessCode, int ServiceId, string? StatusType = null, int pageIndex = 0, int pageSize = 10)
        {
            try
            {
                var officer = GetOfficerDetails();
                // Validate input parameters
                if (pageIndex < 0 || pageSize <= 0)
                {
                    _logger.LogWarning($"Invalid pagination parameters: pageIndex={pageIndex}, pageSize={pageSize}");
                    return BadRequest(new { error = "Invalid pageIndex or pageSize" });
                }

                // Log officer details for debugging
                var officerDetails = GetOfficerDetails();
                _logger.LogInformation($"Officer Role: {officerDetails?.Role}, AccessLevel: {officerDetails?.AccessLevel}");

                // Define SQL parameters for the stored procedure
                var accessCode = new SqlParameter("@AccessCode", AccessCode);
                var serviceId = new SqlParameter("@ServiceId", ServiceId);
                var accessLevel = new SqlParameter("@AccessLevel", officer.AccessLevel == "Tehsil" ? "Tehsil" : "District");

                // Execute the stored procedure
                var response = dbcontext.Database
                    .SqlQueryRaw<SummaryReports>("EXEC GetApplicationsForReport @AccessCode, @ServiceId, @AccessLevel", accessCode, serviceId, accessLevel)
                    .ToList();

                _logger.LogInformation($"Fetched {response.Count} records for AccessCode: {AccessCode}, ServiceId: {ServiceId}, Response: {JsonConvert.SerializeObject(response)}");

                // Handle empty result set
                if (!response.Any())
                {
                    _logger.LogWarning($"No data returned for AccessCode: {AccessCode}, ServiceId: {ServiceId}");
                }

                // Sorting by TehsilName (optional, as stored procedure already orders by TehsilName)
                var sortedResponse = response.OrderBy(a => a.TehsilName).ToList();

                // Pagination
                var totalRecords = sortedResponse.Count;
                var pagedResponse = sortedResponse
                    .Skip(pageIndex * pageSize)
                    .Take(pageSize)
                    .ToList();

                // Define columns for the frontend
                List<dynamic> columns = new List<dynamic>
                {
                    new { accessorKey = "tehsilName", header = "Tehsil Name" },
                    new { accessorKey = "totalApplicationsSubmitted", header = "Total Applications Submitted" },
                    new { accessorKey = "totalApplicationsRejected", header = "Total Applications Rejected" },
                    new { accessorKey = "totalApplicationsSanctioned", header = "Total Applications Sanctioned" }
                };

                // Map the paged response to dynamic data for the frontend
                List<dynamic> data = pagedResponse.Select(item => new
                {
                    tehsilName = item.TehsilName,
                    totalApplicationsSubmitted = item.TotalApplicationsSubmitted,
                    totalApplicationsRejected = item.TotalApplicationsRejected,
                    totalApplicationsSanctioned = item.TotalApplicationsSanctioned
                }).Cast<dynamic>().ToList();

                // Return JSON response
                return Json(new
                {
                    data,
                    columns,
                    totalRecords
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error executing GetApplicationsForReport for AccessCode: {AccessCode}, ServiceId: {ServiceId}");
                return StatusCode(500, new { error = "An error occurred while fetching the report" });
            }
        }

        [HttpGet]
        public IActionResult GetUserDetails(string applicationId)
        {
            var details = dbcontext.CitizenApplications.FirstOrDefault(ca => ca.ReferenceNumber == applicationId);
            if (details == null)
                return Json(new { error = "Application not found" });

            var serviceDetails = dbcontext.Services.FirstOrDefault(s => s.ServiceId == details.ServiceId);

            // Deserialize
            var formDetailsToken = JToken.Parse(details.FormDetails!);
            formDetailsToken = ReorderFormDetails(formDetailsToken);
            var formDetails = JsonConvert.DeserializeObject<dynamic>(details.FormDetails!);

            var officerArray = JsonConvert.DeserializeObject<JArray>(details.WorkFlow!);
            int currentPlayer = details.CurrentPlayer;

            // Update workflow "canPull"
            UpdateWorkflowFlags(officerArray!, currentPlayer);
            details.WorkFlow = JsonConvert.SerializeObject(officerArray);
            dbcontext.SaveChanges();

            // Clone current officer
            var currentOfficer = officerArray!.FirstOrDefault(o => (int)o["playerId"]! == currentPlayer);
            var currentOfficerClone = currentOfficer != null ? (JObject)currentOfficer.DeepClone() : new JObject();

            InjectEditableActionForm(currentOfficerClone, serviceDetails, currentPlayer);
            UpdateOfficerActionFormLabels(currentOfficerClone, formDetails);

            ReplaceCodeFieldsWithNames(formDetailsToken);
            FormatDateFields(formDetailsToken);

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
            var formDetails = JsonConvert.DeserializeObject<dynamic>(application.FormDetails!);


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
                string officerArea = GetOfficerAreaForHistory(item.LocationLevel!, item.LocationValue);
                data.Add(new
                {
                    sno = index,
                    actionTaker = item.ActionTaker != "Citizen" ? item.ActionTaker + " " + officerArea : item.ActionTaker,
                    actionTaken = item.ActionTaken! == "ReturnToCitizen" ? "Returned to citizen for correction" : item.ActionTaken,
                    remarks = item.Remarks,
                    actionTakenOn = item.ActionTakenDate,
                });
                index++;
            }
            if ((string)currentPlayer!["status"]! == "pending")
            {
                string designation = (string)currentPlayer["designation"]!;
                string officerArea = GetOfficerArea(designation, formDetails);
                data.Add(new
                {
                    sno = index,
                    actionTaker = currentPlayer["designation"] + " " + officerArea,
                    actionTaken = currentPlayer["status"],
                    actionTakenOn = "",
                });
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

                // Create a header table for title and avatar
                var headerTable = new Table(UnitValue.CreatePercentArray(new float[] { 70, 30 })); // 70% for title, 30% for avatar
                headerTable.SetWidth(UnitValue.CreatePercentValue(100));

                // Title cell
                var titleCell = new Cell(1, 1)
                    .Add(new Paragraph("Citizen Applications Details")
                        .SetFontSize(16)
                        .SetBold()
                        .SetTextAlignment(TextAlignment.CENTER)
                        .SetFontColor(new DeviceRgb(25, 118, 210)) // Blue accent
                        .SetMarginBottom(15))
                    .SetBorder(Border.NO_BORDER);
                headerTable.AddCell(titleCell);

                // Avatar cell

                document.Add(headerTable);

                // Parse FormDetails JSON
                var formDetails = JObject.Parse(application.FormDetails!);

                // Create a table for better structure (2 columns for label-value pairs)
                var detailsTable = new Table(2);
                detailsTable.SetWidth(UnitValue.CreatePercentValue(100));
                detailsTable.SetMarginBottom(20);

                // Add section headers and details
                foreach (var section in formDetails)
                {
                    if (section.Key == "Documents") continue; // Handle Documents separately

                    // Add section header spanning both columns
                    var sectionHeader = new Cell(1, 2)
                        .Add(new Paragraph(FormatSectionKey(section.Key))
                            .SetFontSize(14)
                            .SetBold()
                            .SetFontColor(new DeviceRgb(242, 140, 56)) // Orange from image
                            .SetMarginTop(15)
                            .SetMarginBottom(10))
                        .SetBorder(Border.NO_BORDER)
                        .SetBackgroundColor(new DeviceRgb(245, 245, 245)) // Light gray background
                        .SetBorderRadius(new BorderRadius(5));
                    detailsTable.AddCell(sectionHeader);

                    if (section.Value is JArray sectionArray)
                    {
                        foreach (var item in sectionArray)
                        {
                            var label = item["label"]?.ToString();
                            var value = item["value"]?.ToString();

                            if (!string.IsNullOrEmpty(label) && !string.IsNullOrEmpty(value))
                            {
                                // Convert integer values for District and Tehsil fields
                                string displayValue = ConvertValueForDisplay(label, value);

                                // Add label cell with input-like styling
                                var labelCell = new Cell()
                                    .Add(new Paragraph(FormatFieldLabel(label))
                                        .SetFontSize(11)
                                        .SetBold()
                                        .SetFontColor(new DeviceRgb(51, 51, 51))) // Dark gray
                                    .SetBorder(Border.NO_BORDER)
                                    .SetPadding(8)
                                    .SetBackgroundColor(new DeviceRgb(245, 245, 245)) // Light gray
                                    .SetBorderRadius(new BorderRadius(4));
                                detailsTable.AddCell(labelCell);

                                // Add value cell with input-like styling
                                var valueCell = new Cell()
                                    .Add(new Paragraph(displayValue)
                                        .SetFontSize(12)
                                        .SetFontColor(new DeviceRgb(0, 0, 0))) // Black
                                    .SetBorder(Border.NO_BORDER)
                                    .SetPadding(8)
                                    .SetBackgroundColor(new DeviceRgb(245, 245, 245)) // Light gray
                                    .SetBorderRadius(new BorderRadius(4));
                                detailsTable.AddCell(valueCell);

                                // Handle additional fields (e.g., in Pension Type)
                                if (item["additionalFields"] is JArray additionalFields)
                                {
                                    foreach (var additionalField in additionalFields)
                                    {
                                        var addLabel = additionalField["label"]?.ToString();
                                        var addValue = additionalField["value"]?.ToString();
                                        if (!string.IsNullOrEmpty(addLabel) && !string.IsNullOrEmpty(addValue))
                                        {
                                            string addDisplayValue = ConvertValueForDisplay(addLabel, addValue);

                                            var addLabelCell = new Cell()
                                                .Add(new Paragraph(FormatFieldLabel(addLabel))
                                                    .SetFontSize(10)
                                                    .SetBold()
                                                    .SetFontColor(new DeviceRgb(51, 51, 51)))
                                                .SetBorder(Border.NO_BORDER)
                                                .SetPadding(6)
                                                .SetBackgroundColor(new DeviceRgb(245, 245, 245))
                                                .SetBorderRadius(new BorderRadius(4))
                                                .SetPaddingLeft(20);
                                            detailsTable.AddCell(addLabelCell);

                                            var addValueCell = new Cell()
                                                .Add(new Paragraph(addDisplayValue)
                                                    .SetFontSize(10)
                                                    .SetFontColor(new DeviceRgb(0, 0, 0)))
                                                .SetBorder(Border.NO_BORDER)
                                                .SetPadding(6)
                                                .SetBackgroundColor(new DeviceRgb(245, 245, 245))
                                                .SetBorderRadius(new BorderRadius(4));
                                            detailsTable.AddCell(addValueCell);

                                            // Handle nested additional fields
                                            if (additionalField["additionalFields"] is JArray nestedFields)
                                            {
                                                foreach (var nestedField in nestedFields)
                                                {
                                                    var nestedLabel = nestedField["label"]?.ToString();
                                                    var nestedValue = nestedField["value"]?.ToString();
                                                    if (!string.IsNullOrEmpty(nestedLabel) && !string.IsNullOrEmpty(nestedValue))
                                                    {
                                                        string nestedDisplayValue = ConvertValueForDisplay(nestedLabel, nestedValue);

                                                        var nestedLabelCell = new Cell()
                                                            .Add(new Paragraph(FormatFieldLabel(nestedLabel))
                                                                .SetFontSize(10)
                                                                .SetBold()
                                                                .SetFontColor(new DeviceRgb(51, 51, 51)))
                                                            .SetBorder(Border.NO_BORDER)
                                                            .SetPadding(6)
                                                            .SetBackgroundColor(new DeviceRgb(245, 245, 245))
                                                            .SetBorderRadius(new BorderRadius(4))
                                                            .SetPaddingLeft(30);
                                                        detailsTable.AddCell(nestedLabelCell);

                                                        var nestedValueCell = new Cell()
                                                            .Add(new Paragraph(nestedDisplayValue)
                                                                .SetFontSize(10)
                                                                .SetFontColor(new DeviceRgb(0, 0, 0)))
                                                            .SetBorder(Border.NO_BORDER)
                                                            .SetPadding(6)
                                                            .SetBackgroundColor(new DeviceRgb(245, 245, 245))
                                                            .SetBorderRadius(new BorderRadius(4));
                                                        detailsTable.AddCell(nestedValueCell);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                document.Add(detailsTable);

                // Add attached documents from Documents section
                var documents = formDetails["Documents"] as JArray;
                if (documents != null && documents.Any())
                {
                    // Start a new page and add the header ("Attached Documents") centered on the page
                    document.Add(new AreaBreak(AreaBreakType.NEXT_PAGE));

                    // Vertically and horizontally center the header using manual positioning
                    float pageWidth = pdf.GetDefaultPageSize().GetWidth();
                    float pageHeight = pdf.GetDefaultPageSize().GetHeight();
                    float headerWidth = 400;
                    float headerHeight = 40;

                    float left = (pageWidth - headerWidth) / 2;
                    float bottom = (pageHeight - headerHeight) / 2;

                    Div div = new Div()
                        .Add(new Paragraph("Attached Documents")
                            .SetFontSize(14)
                            .SetBold()
                            .SetFontColor(new DeviceRgb(242, 140, 56))
                            .SetBackgroundColor(new DeviceRgb(245, 245, 245))
                            .SetPadding(8)
                            .SetTextAlignment(TextAlignment.CENTER))
                        .SetFixedPosition(left, bottom, headerWidth);

                    document.Add(div);


                    foreach (var doc in documents)
                    {
                        var filePath = doc["File"]?.ToString();
                        var enclosure = doc["label"]?.ToString();

                        if (!string.IsNullOrEmpty(filePath) && !string.IsNullOrEmpty(enclosure))
                        {
                            var fullPath = System.IO.Path.Combine(_webHostEnvironment.WebRootPath, filePath.TrimStart('/'));

                            if (System.IO.File.Exists(fullPath))
                            {
                                try
                                {
                                    using var reader = new PdfReader(fullPath);
                                    using var tempMs = new MemoryStream(); // temporary in-memory stream

                                    // Load the source PDF
                                    var srcPdf = new PdfDocument(reader, new PdfWriter(tempMs));
                                    var firstPage = srcPdf.GetPage(1);

                                    // Get canvas of the first page to draw the header
                                    var canvas = new PdfCanvas(firstPage.NewContentStreamBefore(), firstPage.GetResources(), srcPdf);

                                    // Add header (manually draw text)
                                    var canvasDoc = new Document(srcPdf);
                                    canvasDoc.ShowTextAligned(
                                        new Paragraph($"Document: {enclosure}")
                                            .SetFontSize(14)
                                            .SetBold()
                                            .SetFontColor(new DeviceRgb(242, 140, 56))
                                            .SetBackgroundColor(new DeviceRgb(245, 245, 245))
                                            .SetPadding(5),
                                        x: 36, y: firstPage.GetPageSize().GetTop() - 50, // position near top
                                        TextAlignment.LEFT
                                    );
                                    canvasDoc.Close(); // flush all content

                                    // Reopen temp PDF with stamped header to copy pages
                                    srcPdf = new PdfDocument(new PdfReader(new MemoryStream(tempMs.ToArray())));
                                    srcPdf.CopyPagesTo(1, srcPdf.GetNumberOfPages(), pdf);
                                    srcPdf.Close();

                                }
                                catch (Exception ex)
                                {
                                    document.Add(new Paragraph($"Error loading document {enclosure}: {ex.Message}")
                                        .SetFontSize(12)
                                        .SetFontColor(ColorConstants.RED)
                                        .SetMarginBottom(5));
                                }
                            }
                            else
                            {
                                document.Add(new Paragraph($"Document {enclosure}: File not found")
                                    .SetFontSize(12)
                                    .SetFontColor(ColorConstants.RED)
                                    .SetMarginBottom(5));
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