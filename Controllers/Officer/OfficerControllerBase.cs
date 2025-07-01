using Encryption;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using SendEmails;
using SahayataNidhi.Models.Entities;
using System.Security.Claims;
using System.Dynamic;
using Newtonsoft.Json.Linq;

namespace SahayataNidhi.Controllers.Officer
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
            helper.InsertHistory(applicationId, "Pulled Application", (string)currentPlayer["designation"]!, "Call back Application");
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
                helper.InsertHistory(applicationId, action, officer.Role!, remarks);

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
                string appliedTehsilId = GetFieldValue("Tehsil", formDetailsObj);

                // Get district name safely
                string districtName = dbcontext.Districts
                    .FirstOrDefault(d => d.DistrictId == Convert.ToInt32(appliedDistrictId))?.DistrictName ?? "Unknown District";

                // Get tehsil name safely if provided
                string? tehsilName = null;
                if (!string.IsNullOrWhiteSpace(appliedTehsilId) && int.TryParse(appliedTehsilId, out int tehsilId))
                {
                    tehsilName = dbcontext.Tehsils
                        .FirstOrDefault(t => t.TehsilId == tehsilId)?.TehsilName;
                }

                // Determine officerArea based on access level
                string officerArea = officer.AccessLevel switch
                {
                    "Tehsil" => !string.IsNullOrWhiteSpace(tehsilName)
                        ? $"{tehsilName}, {districtName}"
                        : districtName,

                    "District" => districtName,

                    "Division" => officer.AccessCode == 1 ? "Jammu"
                                    : officer.AccessCode == 2 ? "Kashmir"
                                    : "Unknown Division",

                    "State" => "Jammu and Kashmir",

                    _ => "Unknown"
                };


                string userEmail = GetFieldValue("Email", formDetailsObj);
                string Action = action == "ReturnedToCitzen" ? "Returned for rivision" : action + "ed";
                string rejectionNote = Action == "Rejected"
                ? "<p>Kindly check the rejection reason by logging into your account.</p>"
                : "";

                string htmlMessage = $@"
                <div style='font-family: Arial, sans-serif;'>
                    <h2 style='color: #2e6c80;'>Application Status</h2>
                    <p>Dear {fullName},</p>
                    <p>Your application for the service <strong>{serviceName}</strong> has been <strong>{Action}</strong> by <strong>{officer.Role} {officerArea}</strong>.</p>
                    <ul style='line-height: 1.6;'>
                        <li><strong>Service:</strong> {serviceName}</li>
                        <li><strong>Status:</strong> {Action}</li>
                        <li><strong>Updated By:</strong> {officer.Role}</li>
                        <li><strong>Reference ID:</strong> {formdetails.ReferenceNumber}</li>
                        <li><strong>Update Date:</strong> {DateTime.Now:dd MMM yyyy hh:mm:ss tt}</li>
                    </ul>
                    {rejectionNote}
                    <p>If you have any questions regarding this update, feel free to contact our support team.</p>
                    <br />
                    <p style='font-size: 12px; color: #888;'>Thank you,<br />Your Application Team</p>
                </div>";



                if (action == "Sanction")
                {
                    string fileName = applicationId.Replace("/", "_") + "SanctionLetter.pdf";
                    string path = $"files/{fileName}";
                    string fullPath = Path.Combine(_webHostEnvironment.ContentRootPath, "wwwroot", path);
                    var attachments = new List<string> { fullPath };
                    await emailSender.SendEmailWithAttachments(userEmail!, "Form Submission", htmlMessage, attachments);
                }
                else if (action != "Forward" && action != "Returned")
                {
                    await emailSender.SendEmail(userEmail, "Application Status Update", htmlMessage);
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
