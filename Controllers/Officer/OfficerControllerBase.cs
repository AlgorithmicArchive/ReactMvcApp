using System.Text;
using ClosedXML.Excel;
using Encryption;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using SendEmails;
using ReactMvcApp.Models.Entities;
using Azure;
using System.Text.RegularExpressions;
using System.Globalization;

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
        IEncryptionService encryptionService
            ) : Controller
    {
        protected readonly SocialWelfareDepartmentContext dbcontext = dbcontext;
        protected readonly ILogger<OfficerController> _logger = logger;
        protected readonly EmailSender emailSender = emailSender;
        protected readonly UserHelperFunctions helper = helper;
        protected readonly PdfService _pdfService = pdfService;
        private readonly IWebHostEnvironment _webHostEnvironment = webHostEnvironment;
        private readonly IHubContext<ProgressHub> hubContext = hubContext;

        protected readonly IEncryptionService encryptionService = encryptionService;

        public override void OnActionExecuted(ActionExecutedContext context)
        {
            base.OnActionExecuted(context);
            int? userId = HttpContext.Session.GetInt32("UserId");
            var Officer = dbcontext.Users.FirstOrDefault(u => u.UserId == userId);
            string Profile = Officer!.Profile;
            ViewData["UserType"] = "Officer";
            ViewData["UserName"] = Officer!.Username;
            ViewData["Profile"] = Profile == "" ? "/resources/dummyDocs/formImage.jpg" : Profile;
        }
        public IActionResult Index()
        {

            return View();
        }

        public OfficerDetailsModal GetOfficerDetails()
        {
            int? userId = HttpContext.Session.GetInt32("UserId");


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
            var officer = GetOfficerDetails();

            var authorities = dbcontext.WorkFlows.FirstOrDefault(wf => wf.ServiceId == ServiceId && wf.Role == officer!.Role);

            var TakenBy = new SqlParameter("@TakenBy", officer!.UserId);
            var serviceId = new SqlParameter("@ServiceId", ServiceId);

            var counts = dbcontext.Database
                .SqlQuery<StatusCounts>(
                    $"EXEC GetStatusCount @TakenBy = {TakenBy}, @ServiceId = {serviceId}"
                )
                .AsEnumerable()
                .FirstOrDefault();


            List<dynamic> countList = [];
            countList.Add(new { label = "Pending", count = counts!.PendingCount, bgColor = "#FFF9C4", textColor = "#F57C00" });
            if (authorities!.CanForward)
                countList.Add(new { label = "Fowarded", count = counts!.ForwardCount, bgColor = "#BBDEFB", textColor = "#0D47A1" });
            if (authorities!.CanReturn)
                countList.Add(new { label = "Returned", count = counts!.ReturnCount, bgColor = "#FFCDD2", textColor = "#B71C1C" });
            if (authorities!.CanReturnToEdit)
                countList.Add(new { label = "Pending With Citizen", count = counts!.ReturnToEditCount, bgColor = "#E1BEE7", textColor = "#4A148C" });
            if (authorities!.CanReject)
                countList.Add(new { label = "Rejected", count = counts!.RejectCount, bgColor = "#E0E0E0", textColor = "#212121" });
            if (authorities!.CanSanction)
                countList.Add(new { label = "Sanctioned", count = counts!.SanctionCount, bgColor = "#C8E6C9", textColor = "#1B5E20" });



            return Json(new { countList });
        }

        public IActionResult GetApplications(int ServiceId, string type, int page, int size)
        {
            var officer = GetOfficerDetails();

            var OfficerId = new SqlParameter("@OfficerId", officer.UserId);
            var ActionTaken = new SqlParameter("@ActionTaken", type);
            var serviceId = new SqlParameter("@ServiceId", ServiceId);

            var applications = dbcontext.Applications
                .FromSqlRaw("EXEC GetFilteredApplications @OfficerId, @ActionTaken, @ServiceId", OfficerId, ActionTaken, serviceId)
                .AsEnumerable().Skip(page * size).Take(size).ToList();

            dynamic? Applications = null;

            switch (type)
            {
                case "Pending":
                    Applications = GetPendingApplications(applications);
                    break;
            }

            return Json(new { data = Applications!.data, columns = Applications.columns, totalCount = Applications.totalCount });
        }

        private static string FormatKey(string key)
        {
            // Insert spaces before uppercase letters, then capitalize each word
            string result = Regex.Replace(key, "([a-z])([A-Z])", "$1 $2");
            return CultureInfo.CurrentCulture.TextInfo.ToTitleCase(result);
        }

        public IActionResult GetUserDetails(string applicationId)
        {
            var officerDetails = GetOfficerDetails();
            var (userDetails, preAddressDetails, perAddressDetails, serviceSpecific, bankDetails, documents) = helper.GetUserDetailsAndRelatedData(applicationId);

            var generalDetails = new List<KeyValuePair<string, object>>
            {
                new("Reference Number", userDetails.ApplicationId),
                new("Applicant Name", userDetails.ApplicantName),
                new("Applicant Image", userDetails.ApplicantImage),
                new("Email", userDetails.Email),
                new("Mobile Number", userDetails.MobileNumber),
                new("Parentage", userDetails.RelationName + $"({userDetails.Relation})"),
                new("Date Of Birth", userDetails.DateOfBirth),
                new("Category", userDetails.Category),
                new("Submission Date", userDetails.SubmissionDate)
            };

            foreach (var kvp in serviceSpecific!)
            {
                string key = kvp.Key;
                string value = kvp.Value;
                bool isDigitOnly = value.All(char.IsDigit);
                if (!isDigitOnly)
                {
                    generalDetails.Insert(8, new KeyValuePair<string, object>(FormatKey(key), value));
                }
            }

            var presentAddressDetails = new List<KeyValuePair<string, object>>{
                new("Address",preAddressDetails.Address!),
                new("District",preAddressDetails.District!),
                new("Tehsil",preAddressDetails.Tehsil!),
                new("Block",preAddressDetails.Block!),
                new("Panchayat/Muncipality",preAddressDetails.PanchayatMuncipality!),
                new("Village",preAddressDetails.Village!),
                new("Ward",preAddressDetails.Ward!),
                new("Pincode",preAddressDetails.Pincode!),
            };

            var permanentAddressDetails = new List<KeyValuePair<string, object>>{
                new("Address",perAddressDetails.Address!),
                new("District",perAddressDetails.District!),
                new("Tehsil",perAddressDetails.Tehsil!),
                new("Block",perAddressDetails.Block!),
                new("Panchayat/Muncipality",perAddressDetails.PanchayatMuncipality!),
                new("Village",perAddressDetails.Village!),
                new("Ward",perAddressDetails.Ward!),
                new("Pincode",perAddressDetails.Pincode!),
            };

            var BankDetails = new List<KeyValuePair<string, object>>{
                new("Bank Name",bankDetails.BankName),
                new("Branch Name",bankDetails.BranchName),
                new("IFSC Code",bankDetails.IfscCode),
                new("Account Number",bankDetails.AccountNumber),
            };

            int serviceId = userDetails.ServiceId;
            var permissions = dbcontext.WorkFlows.FirstOrDefault(wf => wf.ServiceId == userDetails.ServiceId && wf.Role == officerDetails.Role);
            var workFlow = dbcontext.WorkFlows.Where(wf => wf.ServiceId == userDetails.ServiceId).ToList();
            
            string nextOfficer = workFlow.FirstOrDefault(wf => wf.SequenceOrder == permissions!.SequenceOrder + 1)?.Role ?? "";
            string previousOfficer = "";
            if (permissions!.SequenceOrder > 1)
                previousOfficer = workFlow.FirstOrDefault(wf => wf.SequenceOrder == permissions!.SequenceOrder - 1)!.Role ?? "";

            List<dynamic> actionOptions = [];
            if (permissions!.CanForward) actionOptions.Add(new { label = $"Forward to {nextOfficer}", value = "forward" });
            if (permissions.CanReturn) actionOptions.Add(new { label = $"Return to {previousOfficer}", value = "return" });
            if (permissions.CanReturnToEdit) actionOptions.Add(new { label = $"Return to Citizen", value = "returnToEdit" });
            if (permissions.CanUpdate) actionOptions.Add(new { label = $"Update and Forward to {nextOfficer}", value = "updateAndForward" });
            if (permissions.CanSanction) actionOptions.Add(new { label = $"Issue Sanction Letter", value = "sanction" });
            if(permissions.CanReject)
                actionOptions.Add(new { label = $"Rejected", value = "reject" });

            List<dynamic> editList = [];
            HashSet<string> uniqueLabels = [];
            var serviceContent = dbcontext.Services.FirstOrDefault(s => s.ServiceId == userDetails.ServiceId);
            var formElements = JsonConvert.DeserializeObject<dynamic>(serviceContent!.FormElement!);
            var officerEditableField = JsonConvert.DeserializeObject<dynamic>(serviceContent.OfficerEditableField!);

            foreach (var section in formElements!)
            {
                foreach (var element in section.fields)
                {
                    if (element.name != "District" && uniqueLabels.Add((string)element.label))
                    {
                        // Only add to editList if label was successfully added to uniqueLabels
                        editList.Add(new { label = element.label, value = element.name });
                    }
                }
            }



            return Json(new { serviceId,generalDetails, presentAddressDetails, permanentAddressDetails, BankDetails, documents, actionOptions, editList, officerEditableField,currentOfficer = permissions.Role });
        }

        [HttpPost]
        public async Task<IActionResult> HandleAction([FromForm] IFormCollection form)
        {
            // Extracting officer details
            var officer = GetOfficerDetails();
            int officerId = officer.UserId;
            string officerDesignation = officer.Role!;

            // Parsing form data
            int serviceId = Convert.ToInt32(form["serviceId"]);
            string applicationId = form["applicationId"].ToString();
            string action = form["action"].ToString();
            string remarks = form["remarks"].ToString();
            IFormFile? file = null;
            string filePath = "";
            string actionTaken = "";
            string accessLevel = "";
            int accessCode = 0;

            // Deserialize ServiceSpecific JSON to extract access level and code
            var details = dbcontext.Applications
                .Where(app => app.ApplicationId == applicationId)
                .Select(app => app.ServiceSpecific)
                .FirstOrDefault();

            if (details != null)
            {
                var serviceSpecific = JsonConvert.DeserializeObject<Dictionary<string, string>>(details);
                if (serviceSpecific != null && serviceSpecific.TryGetValue("District", out var districtCode))
                {
                    accessLevel = "District";
                    accessCode = Convert.ToInt32(districtCode);
                }
            }

            // Action-based logic for handling file upload and setting actionTaken
            switch (action)
            {
                case "returnToEdit":
                    string editList = form["editList"].ToString();
                    ActionReturnToEdit(serviceId,applicationId,officer.UserId,remarks,filePath);
                    break;

                case "updateAndForward":
                    string editableField = form["editableField"].ToString();
                    actionTaken = "Forwarded";
                    break;

                case "forward":
                    file = form.Files["forwardFile"];
                    filePath = file != null ? await helper.GetFilePath(file) : "";
                    ActionForward(serviceId,applicationId,officer.UserId,officer.Role!,remarks,filePath,accessLevel,accessCode);
                    break;

                case "reject":
                    ActionReturn(serviceId,applicationId,officer.UserId,officerDesignation,remarks,filePath,accessLevel,accessCode);
                    break;

                case "sanction":
                    ActionSanction(serviceId,applicationId,officer.UserId,remarks,filePath);
                    break;

                default:
                    return BadRequest("Invalid action specified.");
            }

           
            return Json(new { status = true, message = $"{actionTaken} action processed successfully." });
        }




        // public async Task<IActionResult> GetApplicationsList(string ServiceId)
        // {
        //     int? userId = HttpContext.Session.GetInt32("UserId");
        //     var Officer = dbcontext.Users.FirstOrDefault(u => u.UserId == userId);


        //     if (Officer == null)
        //     {
        //         return Json(new { status = false, message = "Officer not found." });
        //     }

        //     var UserSpecificDetails = JsonConvert.DeserializeObject<dynamic>(Officer.UserSpecificDetails);
        //     int serviceId = Convert.ToInt32(ServiceId);
        //     string officerDesignation = UserSpecificDetails?["Designation"]?.ToString() ?? string.Empty;
        //     string accessLevel = UserSpecificDetails?["AccessLevel"]?.ToString() ?? string.Empty;
        //     int accessCode = Convert.ToInt32(UserSpecificDetails?["AccessCode"]?.ToString());


        //     var counts = await dbcontext.RecordCounts.FirstOrDefaultAsync(rc => rc.ServiceId == serviceId && rc.Officer == officerDesignation && rc.AccessCode == accessCode);
        //     if (counts == null)
        //     {
        //         dbcontext.RecordCounts.Add(new RecordCount
        //         {
        //             ServiceId = serviceId,
        //             Officer = officerDesignation,
        //             AccessCode = accessCode,
        //         });
        //     }

        //     await dbcontext.SaveChangesAsync();


        //     var WorkForceOfficers = JsonConvert.DeserializeObject<dynamic>(
        //         dbcontext.Services.FirstOrDefault(service => service.ServiceId == serviceId)?.WorkForceOfficers ?? "[]"
        //     );
        //     var officersList = ((IEnumerable<dynamic>)WorkForceOfficers!).ToList();

        //     bool canSanction = officersList.Any(officer => officer["Designation"] == officerDesignation && (bool)officer["canSanction"]);
        //     bool canForward = officersList.Any(officer => officer["Designation"] == officerDesignation && (bool)officer["canForward"]);

        //     var countList = new
        //     {
        //         Pending = counts?.Pending ?? 0,
        //         PendingWithCitizen = counts?.PendingWithCitizen ?? 0,
        //         Forward = counts?.Forward ?? 0,
        //         Sanction = counts?.Sanction ?? 0, 
        //         Reject = counts?.Reject ?? 0,
        //         Return = counts?.Return ?? 0,
        //         CanSanction = canSanction,
        //         CanForward = canForward,
        //         ServiceId = serviceId
        //     };

        //     return Json(new { status = true, countList });
        // }
        // public IActionResult Applications(string? type, int start = 0, int length = 1, int serviceId = 0)
        // {

        //     int? userId = HttpContext.Session.GetInt32("UserId");
        //     Models.Entities.User Officer = dbcontext.Users.Find(userId)!;
        //     dynamic? ApplicationList = null;


        //     if (type!.ToString() == "Pending")
        //         ApplicationList = PendingApplications(Officer!, start, length, type, serviceId);
        //     else if (type.ToString() == "Pool")
        //         ApplicationList = PoolApplications(Officer!, start, length, type, serviceId);
        //     else if (type.ToString() == "Approve")
        //         ApplicationList = ApproveApplications(Officer!, start, length, type, serviceId);
        //     else if (type!.ToString() == "Sent")
        //         ApplicationList = SentApplications(Officer!, start, length, type, serviceId);
        //     else if (type.ToString() == "Sanction")
        //         ApplicationList = SanctionApplications(Officer!, start, length, type, serviceId);
        //     else if (type.ToString() == "Reject")
        //         ApplicationList = RejectApplications(Officer!, start, length, type, serviceId);

        //     return Json(new { status = true, ApplicationList });
        // }

        // public IActionResult UserDetails(string? ApplicationId)
        // {
        //     var applicationDetails = GetApplicationDetails(ApplicationId);
        //     return View(applicationDetails);
        // }
        // public IActionResult SendBankFile()
        // {
        //     int? userId = HttpContext.Session.GetInt32("UserId");
        //     var Officer = dbcontext.Users.FirstOrDefault(u => u.UserId == userId);
        //     var UserSpecificDetails = JsonConvert.DeserializeObject<dynamic>(Officer!.UserSpecificDetails);
        //     string officerDesignation = UserSpecificDetails!["Designation"];
        //     var Services = dbcontext.Services.Where(s => s.Active == true).ToList();
        //     var ServiceList = new List<dynamic>();
        //     var Districts = dbcontext.Districts.ToList();
        //     foreach (var service in Services)
        //     {
        //         var WorkForceOfficers = JsonConvert.DeserializeObject<dynamic>(service.WorkForceOfficers!);
        //         foreach (var officer in WorkForceOfficers!)
        //         {
        //             if (officer["Designation"] == officerDesignation)
        //             {
        //                 ServiceList.Add(new { service.ServiceId, service.ServiceName });
        //             }
        //         }
        //     }


        //     return View(new { ServiceList, Districts });
        // }

        // public IActionResult GetResponseFile()
        // {
        //     int? userId = HttpContext.Session.GetInt32("UserId");
        //     var Officer = dbcontext.Users.FirstOrDefault(u => u.UserId == userId);
        //     var UserSpecificDetails = JsonConvert.DeserializeObject<dynamic>(Officer!.UserSpecificDetails);
        //     string officerDesignation = UserSpecificDetails!["Designation"];
        //     var Services = dbcontext.Services.Where(s => s.Active == true).ToList();
        //     var ServiceList = new List<dynamic>();
        //     var Districts = dbcontext.Districts.ToList();
        //     foreach (var service in Services)
        //     {
        //         var WorkForceOfficers = JsonConvert.DeserializeObject<dynamic>(service.WorkForceOfficers!);
        //         foreach (var officer in WorkForceOfficers!)
        //         {
        //             if (officer["Designation"] == officerDesignation)
        //             {
        //                 ServiceList.Add(new { service.ServiceId, service.ServiceName });
        //             }
        //         }
        //     }


        //     return View(new { ServiceList, Districts });
        // }
        // public IActionResult Reports()
        // {
        //     int? UserId = HttpContext.Session.GetInt32("UserId");
        //     string Officer = JsonConvert.DeserializeObject<dynamic>(dbcontext.Users.FirstOrDefault(u => u.UserId == UserId)!.UserSpecificDetails)!["Designation"];
        //     var officerDetails = JsonConvert.DeserializeObject<dynamic>(dbcontext.Users.FirstOrDefault(u => u.UserId == UserId)!.UserSpecificDetails);
        //     string designation = officerDetails!["Designation"];
        //     int districtCode = Convert.ToInt32(officerDetails["AccessCode"]);

        //     var AllDistrictCount = GetCount();
        //     var countList = GetCount(designation, districtCode);
        //     return View(new { countList, AllDistrictCount, districtCode, designation });
        // }

        // public IActionResult UpdateRequests()
        // {
        //     int? userId = HttpContext.Session.GetInt32("UserId");
        //     var Officer = dbcontext.Users.FirstOrDefault(u => u.UserId == userId);
        //     var UserSpecificDetails = JsonConvert.DeserializeObject<dynamic>(Officer!.UserSpecificDetails);
        //     string officerDesignation = UserSpecificDetails!["Designation"];
        //     string districtCode = UserSpecificDetails["DistrictCode"];

        //     var list = dbcontext.Applications.FromSqlRaw("EXEC GetApplicationUpdateRequestForOfficer @OfficerDesignation,@District", new SqlParameter("@OfficerDesignation", officerDesignation), new SqlParameter("@District", districtCode.ToString())).ToList();

        //     return View(list);
        // }
        // [HttpPost]
        // public IActionResult UpdateRequests([FromForm] IFormCollection form)
        // {
        //     string? ApplicationId = form["ApplicationId"].ToString();
        //     var updateRequest = JsonConvert.DeserializeObject<dynamic>(form["updateRequest"].ToString());
        //     var application = dbcontext.Applications.FirstOrDefault(u => u.ApplicationId == ApplicationId);
        //     string column = updateRequest!["column"].ToString();
        //     string newValue = "";
        //     var isFormSpecific = updateRequest!["formElement"]["isFormSpecific"];
        //     if (isFormSpecific == "True")
        //     {
        //         string name = updateRequest["formElement"]["name"];
        //         string value = updateRequest["newValue"];
        //         var serviceSpecific = JObject.Parse(application!.ServiceSpecific);
        //         serviceSpecific[name] = value;
        //         newValue = JsonConvert.SerializeObject(serviceSpecific);
        //     }
        //     else
        //     {
        //         newValue = updateRequest["newValue"];
        //     }

        //     helper.UpdateApplication(column, newValue, new SqlParameter("@ApplicationId", ApplicationId));
        //     updateRequest["updated"] = 1;
        //     helper.UpdateApplication("UpdateRequest", JsonConvert.SerializeObject(updateRequest), new SqlParameter("@ApplicationId", ApplicationId));

        //     return Json(new { status = true });
        // }
        // [HttpGet]
        // public IActionResult RegisterDSC()
        // {
        //     int? userId = HttpContext.Session.GetInt32("UserId");
        //     var alreadyCertificate = dbcontext.Certificates.FirstOrDefault(cer => cer.OfficerId == userId);
        //     return View(alreadyCertificate);
        // }

    }
}