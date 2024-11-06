using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using SendEmails;
using ReactMvcApp.Models.Entities;
using System.Security.Claims;

namespace ReactMvcApp.Controllers.User
{
    [Authorize(Roles = "Citizen")]
    public partial class UserController(SocialWelfareDepartmentContext dbcontext, ILogger<UserController> logger, UserHelperFunctions helper, EmailSender emailSender, PdfService pdfService, IWebHostEnvironment webHostEnvironment) : Controller
    {
        protected readonly SocialWelfareDepartmentContext dbcontext = dbcontext;
        protected readonly ILogger<UserController> _logger = logger;
        protected readonly UserHelperFunctions helper = helper;
        protected readonly EmailSender emailSender = emailSender;
        protected readonly PdfService _pdfService = pdfService;
        private readonly IWebHostEnvironment _webHostEnvironment = webHostEnvironment;

        public override void OnActionExecuted(ActionExecutedContext context)
        {
            base.OnActionExecuted(context);
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var citizen = dbcontext.Users.FirstOrDefault(u => u.UserId.ToString() == userIdClaim);

            ViewData["UserType"] = "Citizen";
            ViewData["UserName"] = citizen?.Username;
            ViewData["Profile"] = citizen?.Profile;
        }

        public IActionResult Index()
        {
            var details = GetUserDetails();
            return View(details);
        }

        public IActionResult GetServices(int page, int size)
        {
            // Fetch services from the database
            var services = dbcontext.Services.FromSqlRaw("SELECT * FROM Services WHERE Active=1;");

            // Define the columns for the frontend
            var columns = new List<dynamic>
            {
                new { label = "S.No", value="sno" },
                new { label = "Service Name",value="servicename" },
                new { label = "Department", value="department" },
                new { label = "Action",value="button" }
            };

            // Prepare the data list
            var data = new List<dynamic>();
            int index = 1;

            foreach (var item in services)
            {
                var button = new
                {
                    function = "OpenForm",
                    parameters = new[] { item.ServiceId },
                    buttonText = "View"
                };
                var cell = new
                {
                    sno = index,
                    servicename = item.ServiceName,
                    department = item.Department,
                    button
                };
                data.Add(cell);
                index++;
            }

            // Pagination logic
            var pagedData = data.Skip(page * size).Take(size).ToList();

            return Json(new { status = true, data = pagedData, columns, totalCount = data.Count });
        }

        public IActionResult ServiceForm(string? ApplicationId, bool? returnToEdit)
        {
            object? ApplicationDetails = null;
            var serviceIdClaim = User.FindFirst("ServiceId")?.Value;

            if (ApplicationId == null && serviceIdClaim != null)
            {
                var serviceId = int.Parse(serviceIdClaim);
                var serviceContent = dbcontext.Services.FirstOrDefault(u => u.ServiceId == serviceId);
                ApplicationDetails = new { serviceContent };
            }
            else
            {
                var generalDetails = dbcontext.Applications.FirstOrDefault(u => u.ApplicationId == ApplicationId);
                var PresentAddressId = generalDetails?.PresentAddressId ?? "";
                var PermanentAddressId = generalDetails?.PermanentAddressId ?? "";
                var preAddressDetails = dbcontext.Set<AddressJoin>().FromSqlRaw("EXEC GetAddressDetails @AddressId", new SqlParameter("@AddressId", PresentAddressId)).ToList();
                var perAddressDetails = dbcontext.Set<AddressJoin>().FromSqlRaw("EXEC GetAddressDetails @AddressId", new SqlParameter("@AddressId", PermanentAddressId)).ToList();
                var serviceContent = dbcontext.Services.FirstOrDefault(u => u.ServiceId == generalDetails!.ServiceId);

                ApplicationDetails = new
                {
                    returnToEdit,
                    serviceContent,
                    generalDetails,
                    preAddressDetails,
                    perAddressDetails
                };
            }
            return View(ApplicationDetails);
        }

        public IActionResult GetInitiatedApplications(int page, int size)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // Ensure that you filter by the correct "Initiated" status
            var applications = dbcontext.Applications
                                        .Where(u => u.CitizenId.ToString() == userIdClaim && u.ApplicationStatus == "Initiated")
                                        .ToList();

            // Initialize columns
            var columns = new List<dynamic>
            {
                new { label = "S.No", value = "sno" },
                new { label = "Reference Number", value = "referenceNumber" },
                new { label = "Applicant Name", value = "applicantName" },
                new { label = "Currently With Officer", value = "withOfficer" },
                new { label = "Status", value = "status" },
                new { label = "Action", value = "button" }
            };

            // Correctly initialize data list
            List<dynamic> data = new List<dynamic>();
            int index = 1;

            foreach (var application in applications)
            {
                var applicationStatus = dbcontext.ApplicationStatuses
                                                .FirstOrDefault(status => status.ApplicationId == application.ApplicationId);

                if (applicationStatus != null)
                {
                    // Fetch officerRole safely and handle if no officer is found
                    var officer = dbcontext.OfficerDetails
                                           .FirstOrDefault(od => od.OfficerId == applicationStatus.CurrentlyWith);
                    string officerRole = officer?.Role ?? "Unknown";

                    // Add extra button if status is "ReturnToEdit"
                    if (applicationStatus.Status == "ReturnToEdit")
                    {
                        if (!columns.Any(c => c.value == "buttonExtra"))
                        {
                            columns.Add(new { label = "Extra Actions", value = "buttonExtra" });
                        }
                    }

                    var button = new { function = "CreateTimeLine", parameters = new[] { application.ApplicationId }, buttonText = "View" };
                    var button2 = new { function = "EditForm", parameters = new[] { application.ApplicationId }, buttonText = "Edit Form" };
                    dynamic buttonExtra = applicationStatus.Status == "ReturnToEdit" ? button2 : (object)"NO Action";

                    var cell = new
                    {
                        sno = index,
                        referenceNumber = application.ApplicationId,
                        applicantName = application.ApplicantName,
                        withOfficer = officerRole,
                        status = applicationStatus.Status == "ReturnToEdit" ? "Returned For Edition" : applicationStatus.Status,
                        button,
                        buttonExtra
                    };

                    data.Add(cell); // Add the cell to the data list
                    index++;
                }
            }

            // Ensure size is positive for pagination
            var pagedData = data.Skip(page * Math.Max(size, 1)).Take(size).ToList();

            return Json(new { status = true, data = pagedData, columns, totalCount = data.Count });
        }

        public IActionResult IncompleteApplications()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var applications = dbcontext.Applications.Where(u => u.CitizenId.ToString() == userIdClaim && u.ApplicationStatus == "Incomplete").ToList();

            return View(applications);
        }

        public IActionResult EditForm([FromForm] IFormCollection form)
        {
            string applicationId = form["ApplicationId"].ToString();
            foreach (var key in form.Keys)
            {
                bool hasProperty = HasProperty<Application>(key);
                if (hasProperty && key != "ApplicationId") { 
                    
                }
                var value = form[key];
            }
            return Json(new { });
        }

        public IActionResult UpdateRequest([FromForm] IFormCollection form)
        {
            var ApplicationId = new SqlParameter("@ApplicationId", form["ApplicationId"].ToString());
            var updateRequest = form["updateRequest"].ToString();
            helper.UpdateApplication("UpdateRequest", updateRequest, ApplicationId);
            return Json(new { status = true });
        }

        [HttpGet]
        public IActionResult Acknowledgement()
        {
            var details = FetchAcknowledgementDetails();
            return View(details);
        }

        public IActionResult GetApplications(string serviceId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int ServiceId = Convert.ToInt32(serviceId);
            var applications = dbcontext.Applications.Where(u => u.CitizenId.ToString() == userIdClaim && u.ServiceId == ServiceId).ToList();

            var Ids = applications.Select(application => application.ApplicationId).ToList();

            return Json(new { status = true, Ids });
        }

        public IActionResult GetServiceNames()
        {
            var services = dbcontext.Services.ToList();

            var ServiceList = services.Select(service => new
            {
                service.ServiceId,
                service.ServiceName
            }).ToList();

            return Json(new { status = true, ServiceList });
        }
        [HttpPost]
        public IActionResult Feedback([FromForm] IFormCollection form)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            string? message = form["message"].ToString();

            var UserId = new SqlParameter("@UserId", userIdClaim);
            var Message = new SqlParameter("@Message", message);
            SqlParameter ServiceRelated;
            string serviceValue = form["service"].ToString();

            if (!string.IsNullOrEmpty(serviceValue))
            {
                var obj = new
                {
                    ServiceId = Convert.ToInt32(serviceValue),
                    ApplicationId = form["ApplicationId"].ToString()
                };
                ServiceRelated = new SqlParameter("@ServiceRelated", JsonConvert.SerializeObject(obj));
            }
            else
            {
                ServiceRelated = new SqlParameter("@ServiceRelated", "{}");
            }

            dbcontext.Database.ExecuteSqlRaw("EXEC SubmitFeedback @UserId,@Message,@ServiceRelated", UserId, Message, ServiceRelated);

            return RedirectToAction("Index");
        }
        [HttpGet]
        public IActionResult GetFile(string? filePath)
        {
            var fullPath = _webHostEnvironment.WebRootPath + filePath!;
            _logger.LogInformation($"-----------WEB HOST Path : {_webHostEnvironment.WebRootPath}----------------");
            _logger.LogInformation($"-----------Full Path : {fullPath}----------------");
            if (!System.IO.File.Exists(fullPath))
            {
                return NotFound();
            }

            var fileBytes = System.IO.File.ReadAllBytes(fullPath);
            var contentType = GetContentType(fullPath);

            return File(fileBytes, contentType, Path.GetFileName(fullPath));
        }

        private static string GetContentType(string path)
        {
            var types = new Dictionary<string, string>
            {
                { ".txt", "text/plain" },
                { ".pdf", "application/pdf" },
                { ".jpg", "image/jpeg" },
                { ".jpeg", "image/jpeg" },
                { ".png", "image/png" },
                { ".gif", "image/gif" },
                { ".bmp", "image/bmp" }
            };

            var ext = Path.GetExtension(path).ToLowerInvariant();
            return types.TryGetValue(ext, out string? value) ? value : "application/octet-stream";
        }
    }
}
