using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SahayataNidhi.Models.Entities;

namespace SahayataNidhi.Controllers
{
    [Authorize(Roles = "Designer")]
    public class DesignerController(SocialWelfareDepartmentContext dbcontext) : Controller
    {
        protected readonly SocialWelfareDepartmentContext dbcontext = dbcontext;
        public IActionResult Index()
        {
            return View();
        }
    }
}
