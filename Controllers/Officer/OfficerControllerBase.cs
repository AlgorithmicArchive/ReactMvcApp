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
            _logger.LogInformation($"------- Role: {officer.Role}----------------------");
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
            return Json(new { countList, canSanction = (bool)authorities.canSanction, canHavePool = (bool)authorities.canHavePool });
        }

        [HttpGet]
        public IActionResult GetApplications(int ServiceId, string type)
        {
            var officerDetails = GetOfficerDetails();
            var role = new SqlParameter("@Role", officerDetails.Role);
            var accessLevel = new SqlParameter("@AccessLevel", officerDetails.AccessLevel);
            var accessCode = new SqlParameter("@AccessCode", officerDetails.AccessCode);
            // If 'type' is null, supply DBNull.Value (or you could supply a default string)
            var applicationStatus = new SqlParameter("@ApplicationStatus", (object)type.ToLower() ?? DBNull.Value);
            var serviceId = new SqlParameter("@ServiceId", ServiceId);

            var response = dbcontext.CitizenApplications
                .FromSqlRaw("EXEC GetApplicationsForOfficer @Role, @AccessLevel, @AccessCode, @ApplicationStatus, @ServiceId",
                    role, accessLevel, accessCode, applicationStatus, serviceId)
                .ToList();

            _logger.LogInformation($"----------Type : {type}------------------");

            List<dynamic> columns =
            [
                new { accessorKey = "referenceNumber", header = "Refernece Number" },
                new { accessorKey = "applicantName", header = "Applicant Name" },
                new { accessorKey = "submissionDate", header = "Submission Date" }
            ];

            List<dynamic> data = [];
            List<dynamic> customActions = [];

            // var serviceDetails = dbcontext.Services.FirstOrDefault(s => s.ServiceId == ServiceId);
            // bool? ApproveListEnabled = serviceDetails!.ApprovalListEnabled;
            // var poolList = !string.IsNullOrWhiteSpace(serviceDetails.Pool) ? JsonConvert.DeserializeObject<List<string>>(serviceDetails.Pool!) : [];
            // var approveList = !string.IsNullOrWhiteSpace(serviceDetails.Pool) ? JsonConvert.DeserializeObject<List<string>>(serviceDetails.Approve!) : [];

            var officer = GetOfficerDetails();
            var PoolList = dbcontext.Pools.FirstOrDefault(p => p.ServiceId == ServiceId && p.AccessLevel == officer.AccessLevel && p.AccessCode == officer.AccessCode);
            var pool = PoolList != null && !string.IsNullOrWhiteSpace(PoolList!.List) ? JsonConvert.DeserializeObject<List<string>>(PoolList.List) : [];
            List<dynamic> poolData = [];
            if (type == "Pending")
                customActions.Add(new { type = "Open", tooltip = "View", color = "#F0C38E", actionFunction = "handleOpenApplication" });
            else customActions.Add(new { type = "View", tooltip = "View", color = "#F0C38E", actionFunction = "handleViewApplication" });

            foreach (var details in response)
            {
                var formDetails = JsonConvert.DeserializeObject<dynamic>(details.FormDetails!);
                var officers = JsonConvert.DeserializeObject<dynamic>(details.WorkFlow!) as JArray;
                if (pool!.Contains(details.ReferenceNumber) && type == "Pending")
                {
                    poolData.Add(new
                    {
                        referenceNumber = details.ReferenceNumber,
                        applicantName = GetFieldValue("ApplicantName", formDetails),
                        submissionDate = details.CreatedAt,

                    });
                    customActions.Clear();
                    customActions.Add(new { type = "View", tooltip = "View", color = "#F0C38E", actionFunction = "handleOpenApplication" });
                    continue;
                }


                if (type == "Forwarded" || type == "Returned")
                {
                    var currentOfficer = officers!.FirstOrDefault(o => (string)o["designation"]! == officerDetails.Role);
                    if ((bool)currentOfficer!["canPull"]!)
                    {
                        customActions.Clear();
                        customActions.Add(new { type = "Pull", tooltip = "Pull", color = "#F0C38E", actionFunction = "pullApplication" });
                    }
                }
                data.Add(new
                {
                    referenceNumber = details.ReferenceNumber,
                    applicantName = GetFieldValue("ApplicantName", formDetails),
                    submissionDate = details.CreatedAt,
                });
            }

            return Json(new
            {
                data,
                columns,
                customActions,
                poolData,
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

            // Deserialize form details into a JToken so we can traverse and update it.
            JToken formDetailsToken = JToken.Parse(details.FormDetails!);

            // Deserialize officer details.
            var officerDetails = JsonConvert.DeserializeObject<dynamic>(details.WorkFlow!);
            int currentPlayer = details.CurrentPlayer;

            // Convert officerDetails to a JArray and get current, previous, and next officer.
            JArray? officerArray = officerDetails as JArray;
            var currentOfficer = officerArray?.FirstOrDefault(o => (int)o["playerId"]! == currentPlayer);
            var previousOfficer = officerArray?.FirstOrDefault(o => (int)o["playerId"]! == (currentPlayer - 1));
            if (previousOfficer != null) previousOfficer["canPull"] = false;
            var nextOfficer = officerArray?.FirstOrDefault(o => (int)o["playerId"]! == (currentPlayer + 1));
            if (nextOfficer != null) nextOfficer["canPull"] = false;

            // Save the updated workflow details.
            details.WorkFlow = JsonConvert.SerializeObject(officerArray);
            dbcontext.SaveChanges();

            // Iterate through each section in the form details JSON.
            foreach (JProperty section in formDetailsToken.Children<JProperty>())
            {
                // Each section's value is expected to be an array of field objects.
                foreach (JObject field in section.Value.Children<JObject>())
                {
                    string fieldName = field["name"]?.ToString() ?? "";
                    // Check for District fields.
                    if (fieldName.Equals("District", StringComparison.OrdinalIgnoreCase) ||
                        fieldName.EndsWith("District", StringComparison.OrdinalIgnoreCase))
                    {
                        // Convert the numeric district code to a district name.
                        int districtCode = field["value"]!.Value<int>();
                        string districtName = GetDistrictName(districtCode);
                        field["value"] = districtName;
                    }
                    // Check for Tehsil fields.
                    else if (fieldName.Equals("Tehsil", StringComparison.OrdinalIgnoreCase) ||
                             fieldName.EndsWith("Tehsil", StringComparison.OrdinalIgnoreCase))
                    {
                        int tehsilCode = field["value"]!.Value<int>();
                        string tehsilName = GetTehsilName(tehsilCode);
                        field["value"] = tehsilName;
                    }
                }
            }

            // Return the updated form details along with current officer details.
            return Json(new
            {
                list = formDetailsToken,
                currentOfficerDetails = currentOfficer
            });
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
        public async Task<IActionResult> HandleAction([FromForm] IFormCollection form)
        {
            OfficerDetailsModal officer = GetOfficerDetails();
            string applicationId = form["applicationId"].ToString();
            string action = form["defaultAction"].ToString();
            string remarks = form["Remarks"].ToString();

            try
            {
                var formdetails = dbcontext.CitizenApplications.FirstOrDefault(fd => fd.ReferenceNumber == applicationId);
                var formDetailsObj = JObject.Parse(formdetails!.FormDetails!);
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
                            JObject jObject;
                            if (string.IsNullOrEmpty(formdetails.AdditionalDetails))
                            {
                                jObject = [];
                            }
                            else
                            {
                                jObject = JObject.Parse(formdetails.AdditionalDetails);
                            }

                            jObject["returnFields"] = form["returnFields"].ToString();
                            formdetails.AdditionalDetails = jObject.ToString();
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
                    if (action == "Reject" || action == "Sanction")
                    {
                        formdetails.Status = action + "ed";
                    }
                }
                formdetails.WorkFlow = workFlow;
                dbcontext.SaveChanges();
                helper.InsertHistory(applicationId, action, officer.Role!);

                var getServices = dbcontext.WebServices.FirstOrDefault(ws => ws.ServiceId == formdetails.ServiceId && ws.IsActive);
                if (getServices != null)
                {
                    var onAction = JsonConvert.DeserializeObject<List<string>>(getServices.OnAction);
                    if (onAction != null && onAction.Contains(action))
                    {
                        var fieldMapObj = JObject.Parse(getServices.FieldMappings);
                        var fieldMap = MapServiceFieldsFromForm(formDetailsObj, fieldMapObj);
                        await SendApiRequestAsync(getServices.ApiEndPoint, fieldMap);
                    }
                }
                string fullName = GetFieldValue("ApplicantName", formDetailsObj);
                string serviceName = dbcontext.Services.FirstOrDefault(s => s.ServiceId == formdetails.ServiceId)!.ServiceName!;
                string appliedDistrictId = GetFieldValue("District", formDetailsObj);
                string districtName = dbcontext.Districts.FirstOrDefault(d => d.DistrictId == Convert.ToInt32(appliedDistrictId))!.DistrictName!;
                string userEmail = GetFieldValue("Email", formDetailsObj);
                string htmlMessage = $@"
                <div style='font-family: Arial, sans-serif;'>
                    <h2 style='color: #2e6c80;'>Application Status Update</h2>
                    <p>Dear {fullName},</p>
                    <p>Your application for the service <strong>{serviceName}</strong> has been <strong>{action}</strong> by <strong>{officer.Role} {districtName}</strong>.</p>
                    <ul style='line-height: 1.6;'>
                        <li><strong>Form Type:</strong> {serviceName}</li>
                        <li><strong>Status:</strong> {action}</li>
                        <li><strong>Updated By:</strong> {officer.Role}</li>
                        <li><strong>Reference ID:</strong> {formdetails.ReferenceNumber}</li>
                        <li><strong>Update Date:</strong> {DateTime.Now.ToString("dd MMM yyyy hh:mm:ss tt")}</li>
                    </ul>
                    <p>If you have any questions regarding this update, feel free to contact our support team.</p>
                    <br />
                    <p style='font-size: 12px; color: #888;'>Thank you,<br />Your Application Team</p>
                </div>";


                await emailSender.SendEmail(userEmail, "Application Status Update", htmlMessage);

                if (action == "Sanction")
                {
                    var lettersJson = dbcontext.Services
                        .FirstOrDefault(s => s.ServiceId == Convert.ToInt32(formdetails.ServiceId))?.Letters;

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


                return Json(new { status = true });

            }
            catch (Exception ex)
            {
                return Json(new { status = false, response = ex.Message, stackTrace = ex.StackTrace });
            }


        }
    }
}
