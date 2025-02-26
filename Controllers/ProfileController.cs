using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using ReactMvcApp.Models.Entities;

namespace ReactMvcApp.Controllers.Profile
{
    [Authorize(Roles = "Citizen,Officer,Admin")]
    public class ProfileController : Controller
    {
        private readonly SocialWelfareDepartmentContext _dbcontext;
        private readonly ILogger<ProfileController> _logger;
        private readonly UserHelperFunctions _helper;
        private readonly IWebHostEnvironment _webHostEnvironment;

        // Constructor
        public ProfileController(SocialWelfareDepartmentContext dbcontext, ILogger<ProfileController> logger, UserHelperFunctions helper, IWebHostEnvironment webHostEnvironment)
        {
            _dbcontext = dbcontext;
            _logger = logger;
            _helper = helper;
            _webHostEnvironment = webHostEnvironment;
        }

        public override void OnActionExecuted(ActionExecutedContext context)
        {
            base.OnActionExecuted(context);
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            string? userType = User.FindFirst(ClaimTypes.Role)!.Value;
            var user = _dbcontext.Users.FirstOrDefault(u => u.UserId.ToString() == userId);
            string Profile = user!.Profile;
            ViewData["UserType"] = userType;
            ViewData["UserName"] = user!.Username;
            ViewData["Profile"] = Profile;
        }

        [HttpGet]
        public IActionResult Index()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            string? userType = User.FindFirst(ClaimTypes.Role)!.Value;

            if (userId != null && !string.IsNullOrEmpty(userType))
            {
                var userDetails = _dbcontext.Users.FirstOrDefault(u => u.UserId.ToString() == userId);
                return View(userDetails);
            }
            return RedirectToAction("Error", "Home");
        }


        [HttpGet]
        public dynamic? GetUserDetails()
        {
            // Retrieve userId from JWT token
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return null; // Handle case where userId is not available
            }
            var userDetails = _dbcontext.Users.FirstOrDefault(u => u.UserId.ToString() == userId);
            var details = new
            {
                userDetails!.Name,
                userDetails.Username,
                userDetails.Profile,
                userDetails.Email,
                userDetails.MobileNumber,
                userDetails.BackupCodes,
            };

            return details;
        }

        [HttpPost]
        public IActionResult UpdateColumn([FromForm] IFormCollection form)
        {
            string? columnName = form["columnName"].ToString();
            string? columnValue = form["columnValue"].ToString();
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            string? userType = HttpContext.Session.GetString("UserType");
            string? TableName = "";

            if (userType == "Citizen")
                TableName = "Citizens";
            else if (userType == "Officer")
                TableName = "Officers";

            _dbcontext.Database.ExecuteSqlRaw("EXEC UpdateCitizenDetail @ColumnName,@ColumnValue,@TableName,@CitizenId", new SqlParameter("@ColumnName", columnName), new SqlParameter("@ColumnValue", columnValue), new SqlParameter("@TableName", TableName), new SqlParameter("@CitizenId", userId));

            return Json(new { status = true, url = "/Profile/Index" });
        }

        [HttpGet]
        public IActionResult GenerateBackupCodes()
        {
            var userId = Convert.ToInt32(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            string? TableName = "Users";

            var unused = _helper.GenerateUniqueRandomCodes(10, 8);
            var backupCodes = new
            {
                unused,
                used = Array.Empty<string>(),
            };

            var backupCodesParam = new SqlParameter("@ColumnValue", JsonConvert.SerializeObject(backupCodes));

            _dbcontext.Database.ExecuteSqlRaw("EXEC UpdateCitizenDetail @ColumnName,@ColumnValue,@TableName,@UserId", new SqlParameter("@ColumnName", "BackupCodes"), backupCodesParam, new SqlParameter("@TableName", TableName), new SqlParameter("@UserId", userId));

            return Json(new { status = true, url = "/settings" });
        }

        [HttpGet]
        public IActionResult Settings()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            string? userType = HttpContext.Session.GetString("UserType");

            if (userId != null && !string.IsNullOrEmpty(userType))
            {
                var userDetails = _dbcontext.Users.FirstOrDefault(u => u.UserId.ToString() == userId);
                if (userType == "Admin") ViewData["Layout"] = "_AdminLayout";

                if (userDetails != null) return View(userDetails);
            }
            return RedirectToAction("Error", "Home");
        }

        [HttpPost]
        public async Task<IActionResult> ChangeImage([FromForm] IFormCollection image)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var user = _dbcontext.Users.FirstOrDefault(u => u.UserId.ToString() == userId);

            if (user == null)
            {
                _logger.LogInformation("User not found.");
                return Json(new { isValid = false, errorMessage = "User not found." });
            }

            // Check if a file was uploaded
            if (image.Files.Count == 0)
            {
                return Json(new { isValid = false, errorMessage = "No file uploaded." });
            }

            var uploadedFile = image.Files[0];
            var profile = user.Profile;

            // Delete existing file if it's a custom profile picture
            if (!string.IsNullOrEmpty(profile) && profile != "/assets/images/profile.jpg")
            {
                string existingFilePath = Path.Combine(_webHostEnvironment.WebRootPath, profile.TrimStart('/'));
                if (System.IO.File.Exists(existingFilePath))
                {
                    try
                    {
                        System.IO.File.Delete(existingFilePath);
                        _logger.LogInformation($"Existing file {existingFilePath} deleted.");
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError($"Error deleting file {existingFilePath}: {ex.Message}");
                    }
                }
            }

            // Save the new file and update the user's profile picture path
            var filePath = await _helper.GetFilePath(uploadedFile, "profile");
            user.Profile = filePath; // Set the new path to user.Profile property
            _dbcontext.SaveChanges(); // Save changes to the database

            return Json(new { isValid = true, filePath });
        }

    }
}
