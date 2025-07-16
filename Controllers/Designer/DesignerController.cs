using EncryptionHelper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SahayataNidhi.Models.Entities;

namespace SahayataNidhi.Controllers
{
    [Authorize(Roles = "Designer")]
    public partial class DesignerController(SocialWelfareDepartmentContext dbcontext, ILogger<DesignerController> logger, IEncryptionService encryptionService, IConfiguration configuration) : Controller
    {
        protected readonly SocialWelfareDepartmentContext dbcontext = dbcontext;
        protected readonly ILogger<DesignerController> _logger = logger;
        private readonly IEncryptionService _encryptionService = encryptionService;
        private readonly IConfiguration _configuration = configuration;

        public IActionResult Index()
        {
            return View();
        }
    }
}
