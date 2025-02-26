using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ReactMvcApp.Controllers.Designer
{
    [Authorize(Roles = "Designer")]
    public class DesignerController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

    }
}
