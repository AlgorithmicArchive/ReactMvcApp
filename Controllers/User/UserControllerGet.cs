using System.Data;
using System.Security.Claims;
using DocumentFormat.OpenXml.Office.CustomUI;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace SahayataNidhi.Controllers.User
{
    public partial class UserController
    {

        public string? GetSanctionedCorrigendum(dynamic WorkFlow, string id)
        {
            foreach (var item in WorkFlow)
            {
                if ((string)item.status == "sanctioned")
                {
                    return id;
                }
            }

            return null; // Return 0 only if no "sanctioned" status was found
        }

        [HttpGet]
        public IActionResult GetFormDetails(string applicationId)
        {
            var details = dbcontext.CitizenApplications
                          .FirstOrDefault(ca => ca.ReferenceNumber == applicationId);

            if (details == null)
                return NotFound($"Application ID {applicationId} not found.");

            if (string.IsNullOrWhiteSpace(details.FormDetails))
                return BadRequest("FormDetails is empty.");

            dynamic formDetails;
            try
            {
                formDetails = JsonConvert.DeserializeObject<dynamic>(details.FormDetails)!;
            }
            catch (JsonException)
            {
                return BadRequest("Malformed JSON in FormDetails.");
            }

            if (!string.IsNullOrWhiteSpace(details.AdditionalDetails))
            {
                dynamic additionalDetails;
                try
                {
                    additionalDetails = JsonConvert.DeserializeObject<dynamic>(details.AdditionalDetails)!;
                }
                catch (JsonException)
                {
                    return BadRequest("Malformed JSON in AdditionalDetails.");
                }

                return Json(new { formDetails, additionalDetails });
            }

            return Json(new { formDetails, AdditionalDetails = "" });
        }
        public IActionResult GetInitiatedApplications(int pageIndex = 0, int pageSize = 10)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
            {
                return BadRequest("Invalid user ID.");
            }

            // Define SQL parameters
            var UserId = new SqlParameter("@UserId", userId);
            var PageIndex = new SqlParameter("@PageIndex", pageIndex);
            var PageSize = new SqlParameter("@PageSize", pageSize);
            var IsPaginated = new SqlParameter("@IsPaginated", 1);
            var TotalRecords = new SqlParameter("@TotalRecords", SqlDbType.Int) { Direction = ParameterDirection.Output };

            // Execute stored procedure
            var applications = dbcontext.CitizenApplications
                .FromSqlRaw("EXEC GetInitiatedApplications @UserId, @PageIndex, @PageSize, @IsPaginated, @TotalRecords OUTPUT",
                    UserId, PageIndex, PageSize, IsPaginated, TotalRecords)
                .ToList();

            // Retrieve the total record count from the output parameter
            int totalRecords = TotalRecords.Value != DBNull.Value ? Convert.ToInt32(TotalRecords.Value) : 0;

            // Define columns (exclude customActions)
            var columns = new List<dynamic>
                {
                    new { header = "S.No", accessorKey = "sno" },
                    new { header = "Service Name", accessorKey = "serviceName" },
                    new { header = "Reference Number", accessorKey = "referenceNumber" },
                    new { header = "Applicant Name", accessorKey = "applicantName" },
                    new { header = "Currently With", accessorKey = "currentlyWith" },
                    new { header = "Submission Date", accessorKey = "submissionDate" },
                    new { header = "Status", accessorKey = "status" }
                };

            // Initialize data list with embedded actions
            List<dynamic> data = new List<dynamic>();
            int index = 0;
            Dictionary<string, string> actionMap = new()
            {
                {"pending", "Pending"},
                {"forwarded", "Forwarded"},
                {"sanctioned", "Sanctioned"},
                {"returned", "Returned"},
                {"rejected", "Rejected"},
                {"returntoedit", "Returned to citizen for correction"},
                {"Deposited", "Inserted to Bank File"},
                {"Dispatched", "Payment Under Process"},
                {"Disbursed", "Payment Disbursed"},
                {"Failure", "Payment Failed"},
            };

            foreach (var application in applications)
            {
                var formDetails = JsonConvert.DeserializeObject<dynamic>(application.FormDetails!);
                var officers = JsonConvert.DeserializeObject<JArray>(application.WorkFlow!);
                var currentPlayer = application.CurrentPlayer;
                string officerDesignation = (string)officers![currentPlayer!]!["designation"]!;
                string serviceName = dbcontext.Services.FirstOrDefault(s => s.ServiceId == application.ServiceId)!.ServiceName!;
                var Corrigendum = dbcontext.Corrigenda.Where(co => co.ReferenceNumber == application.ReferenceNumber).ToList();
                List<string> corrigendumIds = [];
                foreach (var item in Corrigendum)
                {
                    string value = GetSanctionedCorrigendum(JsonConvert.DeserializeObject<dynamic>(item.WorkFlow), item.CorrigendumId);
                    if (value != null)
                    {
                        corrigendumIds.Add(value);
                    }

                }


                string officerArea = GetOfficerArea(officerDesignation, formDetails);

                // Define actions for this row
                var actions = new List<dynamic>();
                if ((string)officers![currentPlayer!]!["status"]! != "returntoedit" && (string)officers[currentPlayer!]!["status"]! != "sanctioned")
                {
                    actions.Add(new { tooltip = "View", color = "#F0C38E", actionFunction = "CreateTimeLine" });
                }
                else if ((string)officers[currentPlayer!]!["status"]! == "sanctioned")
                {
                    actions.Add(new { tooltip = "View", color = "#F0C38E", actionFunction = "CreateTimeLine" });
                    actions.Add(new { tooltip = "Download SL", color = "#F0C38E", actionFunction = "DownloadSanctionLetter" });
                    foreach (string id in corrigendumIds)
                    {
                        actions.Add(new { tooltip = "Download Corrigendum " + id.TrimEnd('/').Split('/').Last(), corrigendumId = id, color = "#F0C38E", actionFunction = "DownloadCorrigendum" });
                    }
                }
                else
                {
                    actions.Add(new { tooltip = "Edit Form", color = "#F0C38E", actionFunction = "EditForm" });
                }

                // Add data object with embedded actions
                data.Add(new
                {
                    sno = (pageIndex * pageSize) + index + 1,
                    serviceName,
                    referenceNumber = application.ReferenceNumber,
                    applicantName = GetFieldValue("ApplicantName", formDetails),
                    currentlyWith = officerDesignation + " " + officerArea,
                    status = actionMap[(string)officers[currentPlayer!]!["status"]!],
                    submissionDate = application.CreatedAt,
                    serviceId = application.ServiceId,
                    customActions = actions // Embed actions here
                });

                index++;
            }

            return Json(new { data, columns, totalRecords });
        }
        public IActionResult IncompleteApplications(int pageIndex = 0, int pageSize = 10)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // Ensure that you filter by the correct "Initiated" status
            var applications = dbcontext.CitizenApplications
                                        .Where(u => u.CitizenId.ToString() == userIdClaim && u.Status == "Incomplete")
                                        .ToList();

            var totalRecords = applications.Count;

            var pagedApplications = applications
                .OrderBy(a =>
                {
                    var parts = a.ReferenceNumber.Split('/');
                    var numberPart = parts.Last(); // Get the last part (e.g., "1", "10")
                    return int.Parse(numberPart); // Convert to integer for numerical sorting
                })
                .ThenBy(a => a.ReferenceNumber)
                .Skip(pageIndex * pageSize)
                .Take(pageSize)
                .ToList();

            // Initialize columns
            var columns = new List<dynamic>
            {
                new { header = "S.No", accessorKey = "sno" },
                new { header = "Reference Number", accessorKey = "referenceNumber" },
                new { header = "Save Date", accessorKey = "saveDate" },
            };

            // Correctly initialize data list
            List<dynamic> data = [];
            List<dynamic> actions = [];
            int index = 0;


            foreach (var application in pagedApplications)
            {
                var formDetails = JsonConvert.DeserializeObject<dynamic>(application.FormDetails!);
                actions.Add(new { id = (pageIndex * pageSize) + index + 1, tooltip = "Edit", color = "#F0C38E", actionFunction = "IncompleteForm" });
                data.Add(new
                {
                    sno = (pageIndex * pageSize) + index + 1,
                    referenceNumber = application.ReferenceNumber,
                    serviceId = application.ServiceId,
                    saveDate = application.CreatedAt,
                    customActions = actions
                });
                index++;
            }

            // Ensure size is positive for pagination
            return Json(new { data, columns, totalRecords });
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
            int currentPlayerIndex = (int)application.CurrentPlayer!;
            var currentPlayer = players!.FirstOrDefault(o => (int)o["playerId"]! == currentPlayerIndex);
            var history = await dbcontext.ActionHistories.Where(ah => ah.ReferenceNumber == ApplicationId).ToListAsync();
            var formDetails = JsonConvert.DeserializeObject<dynamic>(application.FormDetails!);

            var columns = new List<dynamic>
            {
                new { header = "S.No", accessorKey="sno" },
                new { header = "Action Taker", accessorKey="actionTaker" },
                new { header = "Action Taken",accessorKey="actionTaken" },
                new { header = "Action Taken On",accessorKey="actionTakenOn" },
            };
            int index = 1;
            List<dynamic> data = [];
            foreach (var item in history)
            {
                string officerArea = GetOfficerAreaForHistory(item.LocationLevel!, item.LocationValue);
                _logger.LogInformation($"------ OFFICER AREA: {officerArea} ---------------------");

                data.Add(new
                {
                    sno = index,
                    actionTaker = item.ActionTaker != "Citizen" ? item.ActionTaker + " " + officerArea : item.ActionTaker,
                    actionTaken = item.ActionTaken! == "ReturnToCitizen" ? "Returned to citizen for correction" : item.ActionTaken,
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
        public IActionResult GetServices(int pageIndex = 0, int pageSize = 10)
        {
            // Fetch and materialize all active services
            var services = dbcontext.Services
                .FromSqlRaw("SELECT * FROM Services WHERE Active=1")
                .ToList();

            var totalCount = services.Count;

            // Apply pagination
            var pagedServices = services
                .Skip(pageIndex * pageSize)
                .Take(pageSize)
                .ToList();

            _logger.LogInformation($"----------SERVICES COUNT: {totalCount}---------------------------");

            // Define table columns
            var columns = new List<dynamic>
            {
                new { header = "S.No", accessorKey = "sno" },
                new { header = "Service Name", accessorKey = "servicename" },
                new { header = "Department", accessorKey = "department" }
            };

            // Prepare paginated data with embedded customActions
            List<dynamic> data = [];
            int index = 0;

            foreach (var item in pagedServices)
            {
                int serialNo = (pageIndex * pageSize) + index + 1;

                var row = new
                {
                    sno = serialNo,
                    servicename = item.ServiceName,
                    department = item.Department,
                    serviceId = item.ServiceId,
                    customActions = new List<dynamic>
            {
                new
                {
                    tooltip = "Apply",
                    color = "#F0C38E",
                    actionFunction = "OpenForm",
                    parameters = new[] { item.ServiceId }
                }
            }
                };

                data.Add(row);
                index++;
            }

            return Json(new
            {
                status = true,
                data,
                columns,
                totalCount
            });
        }
        [HttpGet]
        public dynamic? GetUserDetails()
        {
            // Retrieve userId from JWT token
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userId == null)
            {
                return null; // Handle case where userId is not available
            }

            int initiated = dbcontext.CitizenApplications
                .Where(u => u.CitizenId.ToString() == userId && u.Status != "Incomplete")
                .Count();
            int incomplete = dbcontext.CitizenApplications
                .Where(u => u.CitizenId.ToString() == userId && u.Status == "Incomplete")
                .Count();

            var userDetails = dbcontext.Users.FirstOrDefault(u => u.UserId.ToString() == userId);

            var details = new
            {
                userDetails!.Name,
                userDetails.Username,
                userDetails.Profile,
                userDetails.Email,
                userDetails.MobileNumber,
                userDetails.BackupCodes,
                initiated,
                incomplete,
            };

            return details;
        }

        [HttpGet]
        public async Task<IActionResult> DownloadSanctionLetter(string fileName)
        {
            var userId = Convert.ToInt32(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            try
            {
                var sanctionLetter = await dbcontext.UserDocuments
                    .FirstOrDefaultAsync(sl => sl.FileName == fileName);
                if (sanctionLetter == null)
                    return NotFound($"Sanction letter for FileName {fileName} not found.");

                // Log the download action
                _auditService.InsertLog(HttpContext, "Download File", "Sanction Letter downloaded successfully.", userId, "Success");

                // Return the file
                return File(sanctionLetter.FileData, "application/pdf", sanctionLetter.FileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while downloading the sanction letter. {ex}");
            }
        }

        [HttpGet]
        public IActionResult GetAcknowledgement(string ApplicationId)
        {
            string fileName = ApplicationId.Replace("/", "_") + "Acknowledgement.pdf";

            string fullPath = "Base/DisplayFile?filename=" + fileName;

            return Json(new { fullPath });
        }
    }
}