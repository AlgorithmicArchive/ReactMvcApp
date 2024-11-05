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
            int? userId = HttpContext.Session.GetInt32("UserId");
            var Admin = dbcontext.Users.FirstOrDefault(u => u.UserId == userId);
            string AdminDesignation = dbcontext.OfficerDetails.FirstOrDefault(od=>od.OfficerId==userId)!.Role;
            string Profile = Admin!.Profile;
            ViewData["AdminType"] = AdminDesignation;
            ViewData["UserName"] = Admin!.Username;
            ViewData["Profile"] = Profile == "" ? "/resources/dummyDocs/formImage.jpg" : Profile;
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
        public IActionResult GetApplicationsCount(int? ServiceId = null, int? OfficerId = null, int? DistrictId = null)
        {
            var officer = GetOfficerDetails();

            var authorities = dbcontext.WorkFlows.FirstOrDefault(wf => wf.ServiceId == ServiceId && wf.Role == officer!.Role);

            var TakenBy = new SqlParameter("@TakenBy", officer!.UserId);
            var serviceId = new SqlParameter("@ServiceId", ServiceId);
            var districtId = new SqlParameter("@DistrictId",DistrictId);

            var counts = dbcontext.Database
                .SqlQuery<StatusCounts>($"EXEC GetStatusCount_SA")
                .AsEnumerable()
                .FirstOrDefault();

            List<dynamic> countList = [];
            countList.Add(new { label = "Total", count = counts!.TotalApplications, bgColor = "#F0C38E", textColor = "#312C51" });
            countList.Add(new { label = "Pending", count = counts!.PendingCount, bgColor = "#FFC107", textColor = "#000000" });
            countList.Add(new { label = "Sanctioned", count = counts!.SanctionCount,bgColor = "#81C784", textColor = "#1B5E20"  });
            countList.Add(new { label = "Disbursed", count = counts!.DisbursedCount, bgColor = "#4CAF50", textColor = "#FFFFFF" });
            countList.Add(new { label = "Pending With Citizen", count = counts!.ReturnToEditCount,  bgColor = "#CE93D8", textColor = "#4A148C" });
            countList.Add(new { label = "Rejected", count = counts!.RejectCount, bgColor = "#E0E0E0", textColor = "#212121"  });

            return Json(new { countList });
        }

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