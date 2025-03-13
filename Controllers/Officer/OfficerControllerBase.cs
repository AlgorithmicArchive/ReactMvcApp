using Encryption;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using SendEmails;
using ReactMvcApp.Models.Entities;
using System.Security.Claims;
using System.Dynamic;
using Newtonsoft.Json.Linq;

namespace ReactMvcApp.Controllers.Officer
{
    [Authorize(Roles = "Officer")]
    public partial class OfficerController(
        SocialWelfareDepartmentContext dbcontext,
        ILogger<OfficerController> logger,
        UserHelperFunctions helper,
        EmailSender emailSender,
        PdfService pdfService,
        IWebHostEnvironment webHostEnvironment,
        IHubContext<ProgressHub> hubContext,
        IEncryptionService encryptionService) : Controller
    {
        protected readonly SocialWelfareDepartmentContext dbcontext = dbcontext;
        protected readonly ILogger<OfficerController> _logger = logger;
        protected readonly UserHelperFunctions helper = helper;
        protected readonly EmailSender emailSender = emailSender;
        protected readonly PdfService _pdfService = pdfService;
        private readonly IWebHostEnvironment _webHostEnvironment = webHostEnvironment;
        private readonly IHubContext<ProgressHub> hubContext = hubContext;
        protected readonly IEncryptionService encryptionService = encryptionService;

        public override void OnActionExecuted(ActionExecutedContext context)
        {
            base.OnActionExecuted(context);

            // Replace session handling with JWT claims
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var officer = dbcontext.Users.FirstOrDefault(u => u.UserId.ToString() == userId);
            string profile = officer?.Profile ?? "/resources/dummyDocs/formImage.jpg";

            ViewData["UserType"] = "Officer";
            ViewData["UserName"] = officer?.Username;
            ViewData["Profile"] = string.IsNullOrEmpty(profile) ? "/resources/dummyDocs/formImage.jpg" : profile;
        }

        public OfficerDetailsModal GetOfficerDetails()
        {
            // Retrieve officer details from the JWT token
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            // Fetch the officer details
            var parameter = new SqlParameter("@UserId", userId);
            var officer = dbcontext.Database
                                    .SqlQuery<OfficerDetailsModal>($"EXEC GetOfficerDetails @UserId = {parameter}")
                                    .AsEnumerable()
                                    .FirstOrDefault();

            return officer!;
        }

        [HttpGet]
        public IActionResult GetServiceList()
        {
            var officer = GetOfficerDetails();

            // Fetch the service list for the given role
            var roleParameter = new SqlParameter("@Role", officer.Role);
            var serviceList = dbcontext.Database
                                       .SqlQuery<OfficerServiceListModal>($"EXEC GetServicesByRole @Role = {roleParameter}")
                                       .AsEnumerable() // To avoid composability errors
                                       .ToList();

            return Json(new { serviceList });
        }

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

            // Find the authority record for the officer's role.
            // The JSON field names must match those in your stored JSON.
            dynamic authorities = workflow.FirstOrDefault(p => p.designation == officer.Role)!;
            if (authorities == null)
            {
                return Json(new { countList = new List<dynamic>(), canSanction = false });
            }

            // Create SQL parameters for a parameterized stored procedure call.
            var paramTakenBy = new SqlParameter("@TakenBy", officer.Role);
            var paramAccessLevel = new SqlParameter("@AccessLevel", officer.AccessLevel);
            var paramAccessCode = new SqlParameter("@AccessCode", officer.AccessCode);
            var paramServiceId = new SqlParameter("@ServiceId", ServiceId);

            // Execute the stored procedure and retrieve counts.
            var counts = dbcontext.Database
                .SqlQueryRaw<StatusCounts>(
                    "EXEC GetStatusCount @TakenBy, @AccessLevel, @AccessCode, @ServiceId",
                    paramTakenBy, paramAccessLevel, paramAccessCode, paramServiceId)
                .AsEnumerable()
                .FirstOrDefault() ?? new StatusCounts();

            // Build the count list based on the available authority permissions.
            var countList = new List<dynamic>();

            countList.Add(new
            {
                label = "Total Applications",
                count = counts.TotalApplications,
                bgColor = "#000000",
                textColor = "#FFFFFF"
            });

            // Pending is always included.
            countList.Add(new
            {
                label = "Pending",
                count = counts.PendingCount,
                bgColor = "#FFC107",
                textColor = "#212121"
            });

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
                    textColor = "#4A148C"
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
            return Json(new { countList, canSanction = (bool)authorities.canSanction });
        }

        [HttpGet]
        public IActionResult GetApplications(int ServiceId, string type)
        {
            var officerDetails = GetOfficerDetails();
            var role = new SqlParameter("@Role", officerDetails.Role);
            var accessLevel = new SqlParameter("@AccessLevel", officerDetails.AccessLevel);
            var accessCode = new SqlParameter("@AccessCode", officerDetails.AccessCode);
            // If 'type' is null, supply DBNull.Value (or you could supply a default string)
            var applicationStatus = new SqlParameter("@ApplicationStatus", (object)type ?? DBNull.Value);
            var serviceId = new SqlParameter("@ServiceId", ServiceId);

            var response = dbcontext.CitizenApplications
                .FromSqlRaw("EXEC GetApplicationsForOfficer @Role, @AccessLevel, @AccessCode, @ApplicationStatus, @ServiceId",
                    role, accessLevel, accessCode, applicationStatus, serviceId)
                .ToList();

            List<dynamic> columns =
            [
                new { accessorKey = "referenceNumber", header = "Refernece Number" },
                new { accessorKey = "applicantName", header = "Applicant Name" },
                new { accessorKey = "submissionDate", header = "Submission Date" }
            ];

            List<dynamic> data = [];
            List<dynamic> customActions = [];


            if (type == "Pending")
                customActions.Add(new { type = "Open", tooltip = "View", color = "#F0C38E", actionFunction = "handleOpenApplication" });
            else customActions.Add(new { type = "View", tooltip = "View", color = "#F0C38E", actionFunction = "handleViewApplication" });

            foreach (var details in response)
            {
                var formDetails = JsonConvert.DeserializeObject<dynamic>(details.FormDetails!);
                var officers = JsonConvert.DeserializeObject<dynamic>(details.WorkFlow!) as JArray;
                if (type == "Forwarded" || type == "Returned")
                {
                    var currentOfficer = officers!.FirstOrDefault(o => (string)o["designation"]! == officerDetails.Role);
                    _logger.LogInformation($"----------- CAN PULL: {currentOfficer!["canPull"]}-----");
                    if ((bool)currentOfficer!["canPull"]!)
                    {
                        customActions.Clear();
                        customActions.Add(new { type = "Pull", tooltip = "Pull", color = "#F0C38E", actionFunction = "pullApplication" });
                    }
                }
                data.Add(new
                {
                    referenceNumber = details.ReferenceNumber,
                    applicantName = formDetails!["ApplicantName"],
                    submissionDate = details.CreatedAt,
                });
            }

            return Json(new
            {
                data,
                columns,
                customActions
            });
        }

        [HttpGet]
        public IActionResult GetUserDetails(string applicationId)
        {
            var details = dbcontext.CitizenApplications
                          .FirstOrDefault(ca => ca.ReferenceNumber == applicationId);

            var formDetails = JsonConvert.DeserializeObject<dynamic>(details!.FormDetails!);
            var officerDetails = JsonConvert.DeserializeObject<dynamic>(details.WorkFlow!);
            int currentPlayer = details.CurrentPlayer;

            // Convert officerDetails to a JArray so we can filter it.
            JArray? officerArray = officerDetails as JArray;
            // Get the officer details for the current player.
            var currentOfficer = officerArray?.FirstOrDefault(o => (int)o["playerId"]! == currentPlayer);

            var previousOfficer = officerArray?.FirstOrDefault(o => (int)o["playerId"]! == (currentPlayer - 1));
            if (previousOfficer != null) previousOfficer["canPull"] = false;
            var nextOfficer = officerArray?.FirstOrDefault(o => (int)o["playerId"]! == (currentPlayer + 1));
            if (nextOfficer != null) nextOfficer["canPull"] = false;

            details.WorkFlow = JsonConvert.SerializeObject(officerArray);
            dbcontext.SaveChanges();

            List<dynamic> list = [];

            // Initialize dictionary for accumulating key/value pairs.
            var obj = new Dictionary<string, string>();

            foreach (var detail in formDetails!)
            {
                // If the current detail is AccountNumber, process it, then split out this group.
                if (detail.Name == "AccountNumber")
                {
                    obj[detail.Name] = detail.Value.ToString();
                    list.Add(obj);
                    obj = new Dictionary<string, string>();  // New object after AccountNumber.
                    continue; // Skip further processing in this iteration.
                }

                // Other keys that trigger a new object before processing:
                if (detail.Name == "ApplicantName" ||
                    detail.Name == "PresentAddress" ||
                    detail.Name == "PermanentAddress" ||
                    detail.Name == "BankName")
                {
                    list.Add(obj);
                    obj = new Dictionary<string, string>();
                }

                // Process keys with special handling.
                if (detail.Name == "District" ||
                    detail.Name == "PresentDistrict" ||
                    detail.Name == "PermanentDistrict")
                {
                    obj[detail.Name] = GetDistrictName(Convert.ToInt32(detail.Value));
                }
                else if (detail.Name.Contains("Tehsil"))
                {
                    obj[detail.Name] = GetTehsilName(Convert.ToInt32(detail.Value));
                }
                else
                {
                    obj[detail.Name] = detail.Value.ToString();
                }
            }

            // Add any remaining data as the final group.
            if (obj.Count > 0)
            {
                list.Add(obj);
            }

            // Return the list along with the officer details for the current player.
            return Json(new { list, currentOfficerDetails = currentOfficer });
        }


        [HttpGet]
        public IActionResult PullApplication(string applicationId)
        {
            var officer = GetOfficerDetails();
            var details = dbcontext.CitizenApplications.FirstOrDefault(ca => ca.ReferenceNumber == applicationId);
            var players = JsonConvert.DeserializeObject<dynamic>(details?.WorkFlow!) as JArray;
            var currentPlayer = players?.FirstOrDefault(p => (string)p["designation"]! == officer.Role);
            string status = (string)currentPlayer?["status"]!;

            dynamic otherPlayer = new { };
            if (status == "forwarded")
            {
                otherPlayer = players?.FirstOrDefault(p => (int)p["playerId"]! == ((int)currentPlayer?["playerId"]! + 1))!;
            }
            else if (status == "returned")
            {
                otherPlayer = players?.FirstOrDefault(p => (int)p["playerId"]! == ((int)currentPlayer?["playerId"]! - 1))!;
            }
            otherPlayer["status"] = status == "forwarded" ? "" : "forwarded";
            currentPlayer!["status"] = "pending";

            details!.WorkFlow = JsonConvert.SerializeObject(players);
            details.CurrentPlayer = (int)currentPlayer["playerId"]!;
            dbcontext.SaveChanges();
            helper.InsertHistory(applicationId, "Pulled Application", (string)currentPlayer["designation"]!);
            return Json(new { status = true });
        }
        [HttpPost]
        public IActionResult HandleAction([FromForm] IFormCollection form)
        {
            var officer = GetOfficerDetails();
            string applicationId = form["applicationId"].ToString();
            string action = form["defaultAction"].ToString();
            string remarks = form["Remarks"].ToString();

            _logger.LogInformation($"----------- ACTION: {action} ------------------");
            try
            {
                var formdetails = dbcontext.CitizenApplications.FirstOrDefault(fd => fd.ReferenceNumber == applicationId);
                var workFlow = formdetails!.WorkFlow;
                int currentPlayer = formdetails.CurrentPlayer;
                if (!string.IsNullOrEmpty(workFlow))
                {
                    var players = JArray.Parse(workFlow);
                    if (players.Count > 0)
                    {
                        if (action == "Forward")
                        {
                            players[currentPlayer]["status"] = "forwarded";
                            players[currentPlayer]["canPull"] = true;
                            players[currentPlayer + 1]["status"] = "pending";
                            formdetails.CurrentPlayer = currentPlayer + 1;
                        }
                        else if (action == "ReturnToPlayer")
                        {
                            players[currentPlayer]["status"] = "returned";
                            players[currentPlayer]["canPull"] = true;
                            players[currentPlayer - 1]["status"] = "pending";
                            formdetails.CurrentPlayer = currentPlayer - 1;
                        }
                        else if (action == "ReturnToCitizen")
                        {
                            players[currentPlayer]["status"] = "returntoedit";
                        }
                        else if (action == "Sanction")
                        {
                            players[currentPlayer]["status"] = "sanctioned";
                        }
                        else if (action == "Reject")
                        {
                            players[currentPlayer]["status"] = "rejected";
                        }
                        players[currentPlayer]["remarks"] = remarks;
                        players[currentPlayer]["completedAt"] = DateTime.Now.ToString("dd MMMM yyyy hh:mm:ss tt");
                    }
                    workFlow = players.ToString(Formatting.None);
                }
                formdetails.WorkFlow = workFlow;
                dbcontext.SaveChanges();
                helper.InsertHistory(applicationId, action, officer.Role!);
                return Json(new { status = true });

            }
            catch (System.Exception)
            {

                return Json(new { status = false, response = "Something went wrong, Please try again later." });

            }

        }
    }
}
