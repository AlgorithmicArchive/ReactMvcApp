using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using ReactMvcApp.Models.Entities;

namespace ReactMvcApp.Controllers.Admin
{
    [Authorize(Roles = "Admin")]
    public partial class AdminController(SocialWelfareDepartmentContext dbcontext, ILogger<AdminController> logger, UserHelperFunctions helper) : Controller
    {
        protected readonly SocialWelfareDepartmentContext dbcontext = dbcontext;
        protected readonly ILogger<AdminController> _logger = logger;
        protected readonly UserHelperFunctions helper = helper;


        public override void OnActionExecuted(ActionExecutedContext context)
        {
            base.OnActionExecuted(context);
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var Admin = dbcontext.Users.FirstOrDefault(u => u.UserId.ToString() == userId);
            string AdminDesignation = dbcontext.OfficerDetails.FirstOrDefault(od => od.OfficerId.ToString() == userId)!.Role;
            string Profile = Admin!.Profile;
            ViewData["AdminType"] = AdminDesignation;
            ViewData["UserName"] = Admin!.Username;
            ViewData["Profile"] = Profile == "" ? "/resources/dummyDocs/formImage.jpg" : Profile;
        }

        public OfficerDetailsModal GetOfficerDetails()
        {
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

        // [HttpGet]
        // public IActionResult GetApplicationsCount(int? ServiceId = null, int? DistrictId = null)
        // {
        //     var officerDetails = GetOfficerDetails();

        //     var authorities = dbcontext.WorkFlows.FirstOrDefault(wf => wf.ServiceId == ServiceId && wf.Role == officerDetails!.Role);

        //     var districts = dbcontext.Districts
        //     .Where(d => dbcontext.OfficerDetails
        //         .Any(od => (od.AccessLevel == "Division" && od.AccessCode == d.Division) ||
        //                     od.AccessLevel == "State"))
        //     .Select(d => new
        //     {
        //         label = d.DistrictName,
        //         value = d.DistrictId
        //     })
        //     .ToList();


        //     var services = dbcontext.Services
        //         .Select(s => new
        //         {
        //             label = s.ServiceName,
        //             value = s.ServiceId
        //         })
        //         .ToList();

        //     // Populate lists directly
        //     List<dynamic> Districts = districts.Cast<dynamic>().ToList();
        //     List<dynamic> Services = services.Cast<dynamic>().ToList();


        //     var serviceIdParam = new SqlParameter("@ServiceId", (object)ServiceId! ?? DBNull.Value);
        //     var districtIdParam = new SqlParameter("@DistrictId", (object)DistrictId! ?? DBNull.Value);
        //     var accessLevelParam = new SqlParameter("@AccessLevel", officerDetails.AccessLevel);
        //     var accessCodeParam = new SqlParameter("@AccessCode", officerDetails.AccessCode);

        //     // Execute the stored procedure with parameters
        //     var counts = dbcontext.Database
        //         .SqlQueryRaw<StatusCountsSA>(
        //             "EXEC GetStatusCount_SA @ServiceId, @DistrictId, @AccessLevel, @AccessCode",
        //              serviceIdParam, districtIdParam, accessLevelParam, accessCodeParam)
        //         .AsEnumerable()
        //         .FirstOrDefault();

        //     List<dynamic> countList = [];
        //     countList.Add(new { label = "Total", count = counts!.TotalApplications, bgColor = "#F0C38E", textColor = "#312C51" });
        //     countList.Add(new { label = "Pending", count = counts!.PendingCount, bgColor = "#FFC107", textColor = "#000000" });
        //     countList.Add(new { label = "Sanctioned", count = counts!.SanctionCount, bgColor = "#81C784", textColor = "#1B5E20" });
        //     countList.Add(new { label = "Disbursed", count = counts!.DisbursedCount, bgColor = "#4CAF50", textColor = "#FFFFFF" });
        //     countList.Add(new { label = "Citizen Pending", count = counts!.ReturnToEditCount, bgColor = "#CE93D8", textColor = "#4A148C" });
        //     countList.Add(new { label = "Rejected", count = counts!.RejectCount, bgColor = "#FF7043", textColor = "#B71C1C" });

        //     return Json(new { countList, Districts, Services });
        // }

        // public IActionResult GetApplicationDetails(int? ServiceId = null, int? DistrictId = null, string? ApplicationStatus = null, int page = 0, int size = 10)
        // {
        //     var officerDetails = GetOfficerDetails();
        //     var serviceIdParam = new SqlParameter("@ServiceId", ServiceId ?? (object)DBNull.Value);
        //     var districtIdParam = new SqlParameter("@DistrictId", DistrictId ?? (object)DBNull.Value);
        //     var accessLevelParam = new SqlParameter("@AccessLevel", officerDetails.AccessLevel ?? (object)DBNull.Value);
        //     var accessCodeParam = new SqlParameter("@AccessCode", officerDetails.AccessCode);
        //     var appStatusParam = new SqlParameter("@ApplicationStatus", ApplicationStatus ?? (object)DBNull.Value);

        //     var applications = dbcontext.Database
        //         .SqlQueryRaw<ApplicationDetailsSA>(
        //             "EXEC GetApplications_SA @ServiceId, @DistrictId, @AccessLevel, @AccessCode, @ApplicationStatus",
        //              serviceIdParam, districtIdParam, accessLevelParam, accessCodeParam, appStatusParam)
        //         .ToList();

        //     var columns = new List<dynamic>
        //     {
        //         new { label = "S.No", value = "sno" },
        //         new { label = "Reference Number", value = "referenceNumber" },
        //         new { label = "Applicant Name", value = "applicantName" },
        //         new { label = "Submission Date", value = "submissionDate" },
        //         new { label = "Applied District", value = "appliedDistrict" },
        //         new { label = "Applied Service", value = "appliedService" },
        //         new { label = "Currently With", value = "currentlyWith" },
        //         new { label = "Status", value = "status" }
        //     };

        //     List<dynamic> data = [];
        //     int index = 1;

        //     foreach (var item in applications)
        //     {
        //         var cell = new
        //         {
        //             sno = index,
        //             referenceNumber = item.ReferenceNumber,
        //             applicantName = item.ApplicantName,
        //             submissionDate = item.SubmissionDate,
        //             appliedDistrict = item.AppliedDistrict,
        //             appliedService = item.AppliedService,
        //             currentlyWith = item.CurrentlyWith,
        //             status = item.Status
        //         };
        //         data.Add(cell);
        //         index++;
        //     }


        //     var paginatedData = data.AsEnumerable()
        //         .Skip(page * size)
        //         .Take(size).ToList();
        //     return Json(new { columns, data = paginatedData, totalCount = data.Count });
        // }


        // public IActionResult Dashboard()
        // {
        //     int? UserId = HttpContext.Session.GetInt32("UserId");
        //     var user = dbcontext.Users.FirstOrDefault(u => u.UserId == UserId);
        //     var userSpecificDetails = JsonConvert.DeserializeObject<dynamic>(user!.UserSpecificDetails);
        //     int accessCode = Convert.ToInt32(userSpecificDetails!["AccessCode"]);


        //     var countList = GetCount();


        //     var AllDistrictCount = GetCount();



        //     return View(new { countList, AllDistrictCount });
        // }

        // [HttpGet("Admin/Reports/History")]
        // public IActionResult History()
        // {
        //     return View();
        // }
        // [HttpGet("Admin/Reports/Individual")]
        // public IActionResult Individual()
        // {
        //     return View();
        // }

        // [HttpGet("Admin/Services/Create")]
        // public IActionResult Create()
        // {
        //     return View();
        // }

        // [HttpGet("Admin/Services/Modify")]
        // public IActionResult Modify()
        // {
        //     return View();
        // }

        // [HttpPost]
        // public IActionResult CreateService([FromForm] IFormCollection form)
        // {

        //     var service = new Service
        //     {
        //         ServiceName = form["serviceName"].ToString(),
        //         Department = form["departmentName"].ToString(),
        //     };

        //     dbcontext.Add(service);
        //     dbcontext.SaveChanges();

        //     return Json(new { status = true, serviceId = service.ServiceId });
        // }

        // [HttpPost]
        // public IActionResult UpdateService([FromForm] IFormCollection form)
        // {
        //     int serviceId = Convert.ToInt32(form["serviceId"].ToString());
        //     var service = dbcontext.Services.Find(serviceId);

        //     if (form.ContainsKey("formElements") && !string.IsNullOrEmpty(form["formElements"]))
        //     {
        //         service!.FormElement = form["formElements"].ToString();
        //     }
        //     if (form.ContainsKey("workForceOfficers") && !string.IsNullOrEmpty(form["workForceOfficers"]))
        //     {
        //         service!.WorkForceOfficers = form["workForceOfficers"].ToString();
        //     }

        //     dbcontext.SaveChanges();
        //     return Json(new { status = true });
        // }
    }
}