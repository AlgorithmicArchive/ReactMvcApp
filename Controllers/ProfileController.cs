using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using SahayataNidhi.Models.Entities;

namespace SahayataNidhi.Controllers.Profile
{
    [Authorize(Roles = "Citizen,Officer,Admin")]
    public class ProfileController : Controller
    {
        private readonly SocialWelfareDepartmentContext _dbcontext;
        private readonly ILogger<ProfileController> _logger;
        private readonly UserHelperFunctions _helper;
        private readonly IWebHostEnvironment _webHostEnvironment;

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
            string? userType = User.FindFirst(ClaimTypes.Role)?.Value;
            var user = _dbcontext.Users.FirstOrDefault(u => u.UserId.ToString() == userId);
            string Profile = user?.Profile ?? "/assets/images/profile.jpg";
            ViewData["UserType"] = userType;
            ViewData["UserName"] = user?.Username;
            ViewData["Profile"] = Profile;
        }

        [HttpGet]
        public IActionResult Index()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            string? userType = User.FindFirst(ClaimTypes.Role)?.Value;

            if (userId != null && !string.IsNullOrEmpty(userType))
            {
                var userDetails = _dbcontext.Users.FirstOrDefault(u => u.UserId.ToString() == userId);
                return View(userDetails);
            }
            return RedirectToAction("Error", "Home");
        }

        [HttpGet]
        public IActionResult GetUserDetails()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                _logger.LogWarning("User ID not found in claims.");
                return Json(null);
            }

            var userDetails = _dbcontext.Users.FirstOrDefault(u => u.UserId.ToString() == userId);
            if (userDetails == null)
            {
                _logger.LogWarning($"User not found for ID: {userId}");
                return Json(null);
            }

            var details = new
            {
                userDetails.Name,
                userDetails.Username,
                userDetails.Profile,
                userDetails.Email,
                userDetails.MobileNumber,
                userDetails.BackupCodes,
            };

            return Json(details);
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

            try
            {
                _dbcontext.Database.ExecuteSqlRaw(
                    "EXEC UpdateCitizenDetail @ColumnName, @ColumnValue, @TableName, @CitizenId",
                    new SqlParameter("@ColumnName", columnName),
                    new SqlParameter("@ColumnValue", columnValue),
                    new SqlParameter("@TableName", TableName),
                    new SqlParameter("@CitizenId", userId)
                );
                return Json(new { status = true, url = "/Profile/Index" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating column {columnName}: {ex.Message}");
                return Json(new { status = false, errorMessage = "Failed to update details." });
            }
        }

        [HttpGet]
        public IActionResult GenerateBackupCodes()
        {
            var userId = Convert.ToInt32(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            string TableName = "Users";

            try
            {
                var unused = _helper.GenerateUniqueRandomCodes(10, 8);
                var backupCodes = new
                {
                    unused,
                    used = Array.Empty<string>(),
                };

                var backupCodesParam = new SqlParameter("@ColumnValue", JsonConvert.SerializeObject(backupCodes));

                _dbcontext.Database.ExecuteSqlRaw(
                    "EXEC UpdateCitizenDetail @ColumnName, @ColumnValue, @TableName, @UserId",
                    new SqlParameter("@ColumnName", "BackupCodes"),
                    backupCodesParam,
                    new SqlParameter("@TableName", TableName),
                    new SqlParameter("@UserId", userId)
                );

                return Json(new { status = true, url = "/settings" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error generating backup codes: {ex.Message}");
                return Json(new { status = false, errorMessage = "Failed to generate backup codes." });
            }
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

            if (image.Files.Count == 0)
            {
                return Json(new { isValid = false, errorMessage = "No file uploaded." });
            }

            var uploadedFile = image.Files[0];
            var profile = user.Profile;

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

            var filePath = await _helper.GetFilePath(uploadedFile, "profile");
            _logger.LogInformation($"------File Path: {filePath}");
            user.Profile = filePath;
            _dbcontext.SaveChanges();

            return Json(new { isValid = true, filePath });
        }

        [HttpPost]
        public async Task<IActionResult> UpdateUserDetails([FromForm] IFormCollection form)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var user = await _dbcontext.Users.FirstOrDefaultAsync(u => u.UserId.ToString() == userId);

            if (user == null)
            {
                _logger.LogInformation("User not found.");
                return Json(new { isValid = false, errorMessage = "User not found." });
            }

            try
            {
                // Update allowed fields
                user.Name = form["name"].ToString();
                user.Username = form["username"].ToString();
                user.Email = form["email"].ToString();
                user.MobileNumber = form["mobileNumber"].ToString();

                // Handle profile image if uploaded
                if (form.Files.Any())
                {
                    var file = form.Files["profile"];
                    if (file != null && file.Length > 0)
                    {
                        var profile = user.Profile;
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

                        var filePath = await _helper.GetFilePath(file, "profile");
                        _logger.LogInformation($"------File Path: {filePath}");
                        user.Profile = filePath;
                    }
                }

                await _dbcontext.SaveChangesAsync();

                return Json(new
                {
                    isValid = true,
                    name = user.Name,
                    username = user.Username,
                    email = user.Email,
                    mobileNumber = user.MobileNumber,
                    profile = user.Profile
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating user details: {ex.Message}");
                return Json(new { isValid = false, errorMessage = "Failed to update user details." });
            }
        }
    }
}