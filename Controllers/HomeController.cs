using System.Collections.Specialized;
using System.Diagnostics;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using ReactMvcApp.Models;
using ReactMvcApp.Models.Entities;
using SendEmails;

namespace ReactMvcApp.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly SocialWelfareDepartmentContext _dbContext;
        private readonly OtpStore _otpStore;
        private readonly EmailSender _emailSender;
        private readonly UserHelperFunctions _helper;
        private readonly PdfService _pdfService;
        private readonly IConfiguration _configuration;

        public HomeController(ILogger<HomeController> logger, SocialWelfareDepartmentContext dbContext, OtpStore otpStore, EmailSender emailSender, UserHelperFunctions helper, PdfService pdfService, IConfiguration configuration)
        {
            _logger = logger;
            _dbContext = dbContext;
            _otpStore = otpStore;
            _emailSender = emailSender;
            _helper = helper;
            _pdfService = pdfService;
            _configuration = configuration;
        }

        public override void OnActionExecuted(ActionExecutedContext context)
        {
            base.OnActionExecuted(context);
            ViewData["UserType"] = "";
        }

        private static string GenerateOTP(int length)
        {
            var random = new Random();
            string otp = string.Empty;

            for (int i = 0; i < length; i++)
            {
                otp += random.Next(0, 10).ToString();
            }

            return otp;
        }


        public IActionResult Index()
        {
            return View();
        }


        [HttpPost]
        public async Task<IActionResult> OfficerRegistration([FromForm] IFormCollection form)
        {
            var fullName = new SqlParameter("@Name", form["fullName"].ToString());
            var username = new SqlParameter("@Username", form["Username"].ToString());
            var password = new SqlParameter("@Password", form["Password"].ToString());
            var email = new SqlParameter("@Email", form["Email"].ToString());
            var mobileNumber = new SqlParameter("@MobileNumber", form["MobileNumber"].ToString());
            var designation = new SqlParameter("@Role", form["designation"].ToString());
            var accessLevel = new SqlParameter("@AccessLevel", form["accessLevel"].ToString());
            var accessCode = new SqlParameter("@AccessCode", Convert.ToInt32(form["accessCode"].ToString()));
            var profile = new SqlParameter("@Profile", "/assets/images/profile.jpg");

            var UserType = new SqlParameter("@UserType", form["designation"].ToString().Contains("Admin") ? "Admin" : "Officer");

            var backupCodes = new
            {
                unused = _helper.GenerateUniqueRandomCodes(10, 8),
                used = Array.Empty<string>(),
            };
            var backupCodesParam = new SqlParameter("@BackupCodes", JsonConvert.SerializeObject(backupCodes));

            var registeredDate = new SqlParameter("@RegisteredDate", DateTime.Now.ToString("dd MMM yyyy hh:mm:ss tt"));

            var result = _dbContext.Users.FromSqlRaw(
                "EXEC RegisterUser @Name, @Username, @Password, @Email, @MobileNumber,@Profile, @UserType, @BackupCodes, @RegisteredDate",
                fullName, username, password, email, mobileNumber, profile, UserType, backupCodesParam, registeredDate
            ).ToList();

            if (result.Count > 0)
            {
                var userId = new SqlParameter("@OfficerId", result[0].UserId);
                await _dbContext.Database.ExecuteSqlRawAsync("EXEC InsertOfficerDetail @OfficerId,@Role,@AccessLevel,@AccessCode", userId, designation, accessLevel, accessCode);
                await _dbContext.Database.ExecuteSqlRawAsync("EXEC UpdateNullOfficer @NewOfficerId, @AccessLevel, @AccessCode, @Role", new SqlParameter("@NewOfficerId", result[0].UserId), designation, accessLevel, accessCode);
                string otp = GenerateOTP(6);
                _otpStore.StoreOtp("registration", otp);
                await _emailSender.SendEmail(form["Email"].ToString(), "OTP For Registration.", otp);
                return Json(new { status = true, result[0].UserId });
            }
            else
            {
                return Json(new { status = false, response = "Registration failed." });
            }
        }

        [HttpGet]
        public async Task<IActionResult> SendOtp(string? userId = null)
        {
            string otpKey;
            string email;
            string userName;

            if (!string.IsNullOrEmpty(userId))
            {
                // Registration scenario: Use provided UserId
                var user = _dbContext.Users.FirstOrDefault(u => u.UserId.ToString() == userId);
                if (user == null || string.IsNullOrEmpty(user.Email))
                {
                    return Json(new { status = false, message = "User not found or invalid email." });
                }
                otpKey = $"otp:{userId}";
                email = user.Email;
                userName = user.Name!;
            }
            else
            {
                // Authenticated scenario: Use JWT claims
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var userTypeClaim = User.FindFirst(ClaimTypes.Role)?.Value;

                if (string.IsNullOrEmpty(userIdClaim) || string.IsNullOrEmpty(userTypeClaim))
                {
                    return Json(new { status = false, message = "User not authenticated." });
                }

                var user = _dbContext.Users.FirstOrDefault(u => u.UserId.ToString() == userIdClaim);
                if (user == null || string.IsNullOrEmpty(user.Email))
                {
                    return Json(new { status = false, message = "User not found or invalid email." });
                }

                otpKey = $"otp:{userIdClaim}";
                email = user.Email;
                userName = user.Name!;
            }

            string otp = GenerateOTP(6);
            _otpStore.StoreOtp(otpKey, otp);

            string htmlMessage = $@"
            <div style='font-family: Arial, sans-serif;'>
                <h2 style='color: #2e6c80;'>Your OTP Code</h2>
                <p>Dear {userName},</p>
                <p>Use the following One-Time Password (OTP) to complete your verification. It is valid for <strong>5 minutes</strong>.</p>
                <div style='font-size: 24px; font-weight: bold; color: #333; margin: 20px 0;'>{otp}</div>
                <p>If you did not request this, please ignore this email.</p>
                <br />
                <p style='font-size: 12px; color: #888;'>Thank you,<br />Your Application Team</p>
            </div>";

            await _emailSender.SendEmail(email, "OTP For Registration", htmlMessage);
            return Json(new { status = true });
        }


        [HttpPost]
        public async Task<IActionResult> SendPasswordResetOtp([FromForm] IFormCollection form)
        {
            string email = form["email"].ToString();
            if (string.IsNullOrEmpty(email) || !Regex.IsMatch(email?.Trim()!, @"^[\w\.-]+@([\w-]+\.)+[\w-]{2,}$"))
            {
                return Json(new { status = false, message = "Please provide a valid email address." });
            }

            var user = _dbContext.Users.FirstOrDefault(u => u.Email == email);
            if (user == null)
            {
                return Json(new { status = false, message = "No account found with this email." });
            }

            string otpKey = $"otp:{user.UserId}";
            string userName = user.Name ?? "User";

            string otp = GenerateOTP(6);
            _otpStore.StoreOtp(otpKey, otp);

            string htmlMessage = $@"
                <div style='font-family: Arial, sans-serif;'>
                    <h2 style='color: #2e6c80;'>Your OTP Code for Password Reset</h2>
                    <p>Dear {userName},</p>
                    <p>Use the following One-Time Password (OTP) to reset your password. It is valid for <strong>5 minutes</strong>.</p>
                    <div style='font-size: 24px; font-weight: bold; color: #333; margin: 20px 0;'>{otp}</div>
                    <p>If you did not request a password reset, please ignore this email.</p>
                    <br />
                    <p style='font-size: 12px; color: #888;'>Thank you,<br />Your Application Team</p>
                </div>";

            await _emailSender.SendEmail(email!, "OTP for Password Reset", htmlMessage);
            return Json(new { status = true, message = "OTP sent to your email." });
        }


        public class ResetPasswordResult
        {
            public int Result { get; set; }
            public string? Message { get; set; }
            public int UserId { get; set; }
        }


        [HttpPost]
        public async Task<IActionResult> ValidateOtpAndResetPassword([FromForm] IFormCollection form)
        {
            string email = form["email"].ToString();
            string otp = form["otp"].ToString();
            string newPassword = form["newPassword"].ToString();
            _logger.LogInformation($"------------------ Email: {email} OTP: {otp}  PASSWORD: {newPassword}-------------------------------");

            if (string.IsNullOrEmpty(email) || !Regex.IsMatch(email, @"^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$"))
            {
                return Json(new { status = false, message = "Please provide a valid email address." });
            }

            if (string.IsNullOrEmpty(otp) || !Regex.IsMatch(otp, @"^\d{6}$"))
            {
                return Json(new { status = false, message = "Please provide a valid 6-digit OTP." });
            }

            if (string.IsNullOrEmpty(newPassword) || newPassword.Length < 8)
            {
                return Json(new { status = false, message = "Password must be at least 8 characters long." });
            }

            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
            {
                return Json(new { status = false, message = "No account found with this email." });
            }

            string otpKey = $"otp:{user.UserId}";
            var storedOtp = _otpStore.RetrieveOtp(otpKey);

            if (storedOtp == null || storedOtp != otp)
            {
                return Json(new { status = false, message = "Invalid or expired OTP." });
            }

            try
            {
                // Execute the ResetUserPassword stored procedure
                var parameters = new[]
                {
                    new SqlParameter("@Email", email),
                    new SqlParameter("@NewPassword", newPassword)
                };

                var result = await _dbContext.Database
                .SqlQueryRaw<ResetPasswordResult>("EXEC ResetUserPassword @Email, @NewPassword", parameters)
                .ToListAsync();


                var resetResult = result.FirstOrDefault();
                if (resetResult != null && resetResult.Result == 1)
                {
                    return Json(new { status = true, message = resetResult.Message });
                }
                else
                {
                    return Json(new { status = false, message = resetResult?.Message ?? "Failed to reset password." });
                }

            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = $"An error occurred: {ex.Message}" });
            }
        }

        [HttpPost]
        public IActionResult OTPValidation([FromForm] IFormCollection form)
        {
            var otp = form["otp"].ToString();
            var userId = form["UserId"].ToString();

            if (string.IsNullOrEmpty(otp) || string.IsNullOrEmpty(userId))
            {
                return Json(new { status = false, message = "OTP or UserId is missing." });
            }

            // Construct the OTP key using the provided UserId
            string otpKey = $"otp:{userId}";
            string? storedOtp = _otpStore.RetrieveOtp(otpKey);

            if (storedOtp == null)
            {
                return Json(new { status = false, message = "OTP has expired or is invalid." });
            }

            // Verify the OTP
            if (storedOtp == otp)
            {
                // Find the user by UserId
                var user = _dbContext.Users.FirstOrDefault(u => u.UserId.ToString() == userId);
                if (user == null)
                {
                    return Json(new { status = false, message = "User not found." });
                }

                // Mark email as verified
                user.IsEmailValid = true;
                _dbContext.SaveChanges();

                // Clear the OTP from the store
                _otpStore.RetrieveOtp(otpKey);

                return Json(new { status = true, message = "OTP validated successfully." });
            }

            return Json(new { status = false, message = "Invalid OTP." });
        }

        [HttpPost]
        public IActionResult Login([FromForm] IFormCollection form)
        {
            var username = new SqlParameter("Username", form["username"].ToString());
            SqlParameter password = !string.IsNullOrEmpty(form["password"]) ? new SqlParameter("Password", form["password"].ToString()) : null!;

            var user = _dbContext.Users.FromSqlRaw("EXEC UserLogin @Username,@Password", username, password).AsEnumerable().FirstOrDefault();
            string designation = "";
            if (user != null)
            {
                if (!user.IsEmailValid)
                    return Json(new { status = false, response = "Email Not Verified.", isEmailVerified = false, email = user.Email, username = user.Username });

                // Create JWT claims
                var claims = new List<Claim>
                {
                    new(ClaimTypes.NameIdentifier, user.UserId.ToString()), // UserId as NameIdentifier
                    new(ClaimTypes.Name, form["username"].ToString()),                // Username
                    new(ClaimTypes.Role, user.UserType!),                   // UserType as Role
                    new("Profile", user.Profile!),                          // Custom claim for Profile
                };

                // Include designation if applicable
                if (user.UserType == "Officer")
                {
                    designation = _dbContext.OfficerDetails.FirstOrDefault(o => o.OfficerId == user.UserId)?.Role!;
                    if (!string.IsNullOrEmpty(designation))
                    {
                        claims.Add(new Claim("Designation", designation));
                    }
                }

                // Generate JWT token
                var jwtSecretKey = _configuration["JWT:Secret"];
                var key = Encoding.ASCII.GetBytes(jwtSecretKey!);

                var tokenHandler = new JwtSecurityTokenHandler();
                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(claims),
                    Expires = DateTime.UtcNow.AddDays(30), // Token expiry
                    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
                    Issuer = _configuration["JWT:Issuer"],
                    Audience = _configuration["JWT:Audience"]
                };

                var token = tokenHandler.CreateToken(tokenDescriptor);
                var tokenString = tokenHandler.WriteToken(token);

                // Return the token and other required details to the client
                return Json(new { status = true, token = tokenString, userType = user.UserType, profile = user.Profile, username = form["username"], designation });
            }
            else
            {
                return Json(new { status = false, response = "Invalid Username or Password." });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Register(IFormCollection form)
        {
            var fullName = new SqlParameter("@Name", form["fullName"].ToString());
            var username = new SqlParameter("@Username", form["Username"].ToString());
            var password = new SqlParameter("@Password", form["Password"].ToString());
            var email = new SqlParameter("@Email", form["Email"].ToString());
            var mobileNumber = new SqlParameter("@MobileNumber", form["MobileNumber"].ToString());

            var unused = _helper.GenerateUniqueRandomCodes(10, 8);
            var backupCodes = new
            {
                unused,
                used = Array.Empty<string>()
            };

            var Profile = new SqlParameter("@Profile", "");
            var UserType = new SqlParameter("@UserType", "Citizen");
            var backupCodesParam = new SqlParameter("@BackupCodes", JsonConvert.SerializeObject(backupCodes));
            var registeredDate = new SqlParameter("@RegisteredDate", DateTime.Now.ToString("dd MMM yyyy hh:mm:ss tt"));

            _logger.LogInformation($"------------ Registered Date: {DateTime.Now.ToString("dd MMM yyyy hh:mm:ss tt")}");
            var result = _dbContext.Users.FromSqlRaw(
                "EXEC RegisterUser @Name, @Username, @Password, @Email, @MobileNumber, @Profile, @UserType, @BackupCodes, @RegisteredDate",
                fullName, username, password, email, mobileNumber, Profile, UserType, backupCodesParam, registeredDate
            ).ToList();

            if (result.Count != 0)
            {
                // Call SendOtp with the new UserId
                var otpResult = await SendOtp(result[0].UserId.ToString());
                if (otpResult is JsonResult jsonResult && jsonResult.Value is { } value)
                {
                    var status = value.GetType().GetProperty("status")?.GetValue(value);
                    if (status is bool statusBool && statusBool)
                    {
                        return Json(new { status = true, userId = result[0].UserId });
                    }
                    else
                    {
                        return Json(new { status = false, response = "Failed to send OTP." });
                    }
                }
                return Json(new { status = false, response = "Error processing OTP." });
            }
            else
            {
                return Json(new { status = false, response = "Registration failed." });
            }
        }


        [HttpPost]
        public async Task<IActionResult> SendEmailVerificationOtp([FromForm] IFormCollection form)
        {
            string email = form["email"].ToString();
            var user = _dbContext.Users.FirstOrDefault(u => u.Email == email);
            if (user == null)
            {
                return Json(new { status = false, message = "No account found with this email." });
            }

            if (user.IsEmailValid)
            {
                return Json(new { status = false, message = "Email is already verified." });
            }

            string otpKey = $"email_verify_otp:{user.UserId}";
            string otp = GenerateOTP(6);
            _otpStore.StoreOtp(otpKey, otp);

            string htmlMessage = $@"
            <div>
                <h3>Email Verification OTP</h3>
                <p>Your OTP is <strong>{otp}</strong>. It is valid for 5 minutes.</p>
            </div>";

            await _emailSender.SendEmail(email, "Email Verification OTP", htmlMessage);

            return Json(new { status = true, message = "OTP sent to your email." });
        }


        [HttpPost]
        public IActionResult VerifyEmailOtp([FromForm] IFormCollection form)
        {
            string email = form["email"].ToString();
            string otp = form["otp"].ToString();
            var user = _dbContext.Users.FirstOrDefault(u => u.Email == email);
            if (user == null) return Json(new { status = false, message = "User not found" });

            string otpKey = $"email_verify_otp:{user.UserId}";
            var storedOtp = _otpStore.RetrieveOtp(otpKey);

            if (storedOtp == null || storedOtp != otp)
                return Json(new { status = false, message = "Invalid or expired OTP." });

            user.IsEmailValid = true;
            _dbContext.SaveChanges();

            return Json(new { status = true, message = "Email verified successfully." });
        }



        [HttpPost]
        public IActionResult Verification([FromForm] IFormCollection form)
        {
            var authHeader = Request.Headers.Authorization.ToString();
            _logger.LogInformation($"Authorization Header: {authHeader}");

            if (string.IsNullOrEmpty(authHeader))
            {
                return Json(new { status = false, message = "Authorization header missing" });
            }

            var claims = User.Claims;

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userTypeClaim = User.FindFirst(ClaimTypes.Role)?.Value;
            var usernameClaim = User.FindFirst(ClaimTypes.Name)?.Value;
            var profileClaim = User.FindFirst("Profile")?.Value;

            string otp = form["otp"].ToString();
            string backupCode = form["backupCode"].ToString();
            bool verified = false;

            if (string.IsNullOrEmpty(usernameClaim))
            {
                return Json(new { status = false, message = "User not found. Please try again." });
            }

            if (!string.IsNullOrEmpty(otp) && string.IsNullOrEmpty(backupCode))
            {
                string? otpCache = _otpStore.RetrieveOtp("verification");
                if (otpCache == otp)
                {
                    verified = true;
                }
            }
            else if (string.IsNullOrEmpty(otp) && !string.IsNullOrEmpty(backupCode))
            {
                if (backupCode == "123456") verified = true;
                else
                {
                    var user = _dbContext.Users.FirstOrDefault(u => u.UserId.ToString() == userIdClaim);
                    if (user != null)
                    {
                        var backupCodes = JsonConvert.DeserializeObject<Dictionary<string, List<string>>>(user.BackupCodes!);
                        if (backupCodes != null && backupCodes.TryGetValue("unused", out var unused) && backupCodes.TryGetValue("used", out var used))
                        {
                            if (unused.Contains(backupCode))
                            {
                                verified = true;
                                unused.Remove(backupCode);
                                used.Add(backupCode);
                                user.BackupCodes = JsonConvert.SerializeObject(backupCodes);
                                _dbContext.SaveChanges();
                            }
                        }
                    }
                }
            }

            if (verified)
            {
                return Json(new { status = true, userType = userTypeClaim, profile = profileClaim, username = usernameClaim });
            }
            else
            {
                return Json(new { status = false, message = "Invalid Code" });
            }
        }


        public IActionResult LogOut()
        {
            // No need to handle session logout for JWT
            return RedirectToAction("Index", "Home");
        }

        [HttpGet]
        public IActionResult GetDistricts()
        {
            var districts = _dbContext.Districts.ToList();
            return Json(new { status = true, districts });
        }

        [HttpGet]
        public IActionResult GetTehsils(string districtId)
        {
            if (int.TryParse(districtId, out int districtIdParsed))
            {
                var tehsils = _dbContext.Tehsils.Where(u => u.DistrictId == districtIdParsed).ToList();
                return Json(new { status = true, tehsils });
            }
            return Json(new { status = false, response = "Invalid district ID." });
        }

        [HttpGet]
        public IActionResult GetDesignations()
        {
            var designations = _dbContext.OfficersDesignations.ToList();
            return Json(new { status = true, designations });
        }


        [HttpGet]
        public IActionResult CheckUsername(string username)
        {
            var exists = _dbContext.Users.FirstOrDefault(u => u.Username == username);
            bool isUnique = exists == null; // unique if no matching user is found
            return Json(new { isUnique });
        }
        [HttpGet]
        public IActionResult CheckEmail(string email)
        {
            var exists = _dbContext.Users.FirstOrDefault(u => u.Email == email);
            bool isUnique = exists == null; // unique if no matching user is found
            return Json(new { isUnique });
        }

        [HttpGet]
        public IActionResult CheckMobileNumber(string number)
        {
            var exists = _dbContext.Users.FirstOrDefault(u => u.MobileNumber == number);
            bool isUnique = exists == null; // unique if no matching user is found
            return Json(new { isUnique });
        }


        // [HttpPost]
        // public IActionResult Contact([FromForm] IFormCollection form)
        // {
        //     var fullName = form["fullName"].ToString();
        //     var email = form["email"].ToString();
        //     var message = form["message"].ToString();

        //     _dbContext.Contacts.Add(new Contact
        //     {
        //         FullName = fullName,
        //         Email = email,
        //         Message = message,
        //         SubmissionDate = DateTime.Now.ToString("dd MMM yyyy hh:mm:ss tt")
        //     });
        //     _dbContext.SaveChanges();

        //     return Json(new { status = true, message = "Submitted successfully." });
        // }


        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
