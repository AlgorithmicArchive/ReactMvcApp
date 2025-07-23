using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using SahayataNidhi.Models.Entities;

namespace SahayataNidhi.Controllers.Officer
{
    [Authorize(Roles = "Viewer")]
    public partial class ViewerController(SocialWelfareDepartmentContext dbcontext, ILogger<ViewerController> logger,
        UserHelperFunctions helper) : Controller
    {
        protected readonly SocialWelfareDepartmentContext dbcontext = dbcontext;
        protected readonly ILogger<ViewerController> _logger = logger;
        protected readonly UserHelperFunctions helper = helper;

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
    }
}