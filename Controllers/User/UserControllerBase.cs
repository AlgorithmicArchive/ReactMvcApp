using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using SendEmails;
using ReactMvcApp.Models.Entities;
using System.Security.Claims;
using Newtonsoft.Json.Linq;

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
                    buttonText = "Apply"
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

        // public IActionResult ServiceForm(string? ApplicationId, bool? returnToEdit)
        // {
        //     object? ApplicationDetails = null;
        //     var serviceIdClaim = User.FindFirst("ServiceId")?.Value;

        //     if (ApplicationId == null && serviceIdClaim != null)
        //     {
        //         var serviceId = int.Parse(serviceIdClaim);
        //         var serviceContent = dbcontext.Services.FirstOrDefault(u => u.ServiceId == serviceId);
        //         ApplicationDetails = new { serviceContent };
        //     }
        //     else
        //     {
        //         var generalDetails = dbcontext.Applications.FirstOrDefault(u => u.ApplicationId == ApplicationId);
        //         var PresentAddressId = generalDetails?.PresentAddressId ?? "";
        //         var PermanentAddressId = generalDetails?.PermanentAddressId ?? "";
        //         var preAddressDetails = dbcontext.Set<AddressJoin>().FromSqlRaw("EXEC GetAddressDetails @AddressId", new SqlParameter("@AddressId", PresentAddressId)).ToList();
        //         var perAddressDetails = dbcontext.Set<AddressJoin>().FromSqlRaw("EXEC GetAddressDetails @AddressId", new SqlParameter("@AddressId", PermanentAddressId)).ToList();
        //         var serviceContent = dbcontext.Services.FirstOrDefault(u => u.ServiceId == generalDetails!.ServiceId);

        //         ApplicationDetails = new
        //         {
        //             returnToEdit,
        //             serviceContent,
        //             generalDetails,
        //             preAddressDetails,
        //             perAddressDetails
        //         };
        //     }
        //     return View(ApplicationDetails);
        // }

        public IActionResult GetInitiatedApplications()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // Ensure that you filter by the correct "Initiated" status
            var applications = dbcontext.CitizenApplications
                                        .Where(u => u.CitizenId.ToString() == userIdClaim && u.Status != "Incomplete")
                                        .ToList();

            // Initialize columns
            var columns = new List<dynamic>
            {
                new { header = "S.No", accessorKey = "sno" },
                new { header = "Reference Number", accessorKey = "referenceNumber" },
                new { header = "Applicant Name", accessorKey = "applicantName" },
                new { header = "Currently With", accessorKey = "currentlyWith" },
                new { header = "Status", accessorKey = "status" },
            };

            // Correctly initialize data list
            List<dynamic> data = [];
            List<dynamic> customActions = [];
            int index = 1;
            Dictionary<string, string> actionMap = new()
            {
                {"pending","Pending"},
                {"forwarded","Forwarded"},
                {"sanctioned","Sanctioned"},
                {"returned","Returned"},
                {"rejected","Rejected"},
                {"returntoedit","Returned to citizen for edition"},
                {"Deposited","Inserted to Bank File"},
                {"Dispatched","Payment Under Process"},
                {"Disbursed","Payment Disbursed"},
                {"Failure","Payment Failed"},
            };

            foreach (var application in applications)
            {
                var formDetails = JsonConvert.DeserializeObject<dynamic>(application.FormDetails!);
                var officers = JsonConvert.DeserializeObject<dynamic>(application.WorkFlow!) as JArray;
                var currentPlayer = application.CurrentPlayer;
                data.Add(new
                {
                    sno = index,
                    referenceNumber = application.ReferenceNumber,
                    applicantName = formDetails!["ApplicantName"].ToString(),
                    currentlyWith = officers![currentPlayer]["designation"],
                    status = actionMap[(string)officers[currentPlayer]["status"]!]
                });

                if ((string)officers[currentPlayer]["status"]! != "ReturnToCitizen")
                {
                    customActions.Add(new { id = index, tooltip = "View", color = "#F0C38E", actionFunction = "CreateTimeLine" });
                }
                else
                {
                    customActions.Add(new { id = index, tooltip = "Edit Form", color = "#F0C38E", actionFunction = "EditForm" });
                }
                index++;
            }

            // Ensure size is positive for pagination
            return Json(new { data, columns, customActions });
        }

        public IActionResult IncompleteApplications()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // Ensure that you filter by the correct "Initiated" status
            var applications = dbcontext.CitizenApplications
                                        .Where(u => u.CitizenId.ToString() == userIdClaim && u.Status == "Incomplete")
                                        .ToList();

            // Initialize columns
            var columns = new List<dynamic>
            {
                new { header = "S.No", accessorKey = "sno" },
                new { header = "Reference Number", accessorKey = "referenceNumber" },
            };

            // Correctly initialize data list
            List<dynamic> data = [];
            List<dynamic> customActions = [];
            int index = 1;


            foreach (var application in applications)
            {
                var formDetails = JsonConvert.DeserializeObject<dynamic>(application.FormDetails!);
                data.Add(new
                {
                    sno = index,
                    referenceNumber = application.ReferenceNumber,
                    serviceId = application.ServiceId,
                });
                customActions.Add(new { id = index, tooltip = "Edit", color = "#F0C38E", actionFunction = "IncompleteForm" });
                index++;
            }

            // Ensure size is positive for pagination
            return Json(new { data, columns, customActions });
        }

        // public IActionResult EditForm([FromForm] IFormCollection form)
        // {
        //     string applicationId = form["ApplicationId"].ToString();
        //     foreach (var key in form.Keys)
        //     {
        //         bool hasProperty = HasProperty<Application>(key);
        //         if (hasProperty && key != "ApplicationId")
        //         {

        //         }
        //         var value = form[key];
        //     }
        //     return Json(new { });
        // }

        public IActionResult UpdateRequest([FromForm] IFormCollection form)
        {
            var ApplicationId = new SqlParameter("@ApplicationId", form["ApplicationId"].ToString());
            var updateRequest = form["updateRequest"].ToString();
            helper.UpdateApplication("UpdateRequest", updateRequest, ApplicationId);
            return Json(new { status = true });
        }


        // public IActionResult GetApplications(string serviceId)
        // {
        //     var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        //     int ServiceId = Convert.ToInt32(serviceId);
        //     var applications = dbcontext.Applications.Where(u => u.CitizenId.ToString() == userIdClaim && u.ServiceId == ServiceId).ToList();

        //     var Ids = applications.Select(application => application.ApplicationId).ToList();

        //     return Json(new { status = true, Ids });
        // }

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
