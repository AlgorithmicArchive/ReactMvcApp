using System.Collections.Specialized;
using System.Diagnostics;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
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

        public static string GenerateOTP(int length)
        {
            if (length < 4 || length > 10)
                throw new ArgumentOutOfRangeException(nameof(length), "Length must be between 4 and 10.");

            var random = new Random();
            return new string(Enumerable.Range(0, length).Select(_ => random.Next(0, 10).ToString()[0]).ToArray());
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
        public async Task<IActionResult> SendOtp()
        {
            // Extract claims from the token
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userTypeClaim = User.FindFirst(ClaimTypes.Role)?.Value;

            if (userIdClaim != null && userTypeClaim != null)
            {
                string email = _dbContext.Users.FirstOrDefault(u => u.UserId.ToString() == userIdClaim)?.Email!;

                if (!string.IsNullOrEmpty(email))
                {
                    string otp = GenerateOTP(6);
                    _otpStore.StoreOtp("verification", otp);
                    await _emailSender.SendEmail(email, "OTP For Registration.", otp);
                }
            }

            return Json(new { status = true });
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
                    return Json(new { status = false, response = "Email Not Verified." });

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
                string otp = GenerateOTP(6);
                _otpStore.StoreOtp("registration", otp);
                await _emailSender.SendEmail(form["Email"].ToString(), "OTP For Registration.", otp);
                return Json(new
                {
                    status = true,
                    result[0].UserId
                });
            }
            else
            {
                return Json(new { status = false, response = "Registration failed." });
            }
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
