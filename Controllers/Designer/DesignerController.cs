using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReactMvcApp.Models.Entities;

namespace ReactMvcApp.Controllers
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
