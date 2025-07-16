using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using SahayataNidhi.Models.Entities;

namespace SahayataNidhi.Controllers
{
    public class BaseController(SocialWelfareDepartmentContext dbcontext, ILogger<BaseController> logger) : Controller
    {
        protected readonly SocialWelfareDepartmentContext dbcontext = dbcontext;
        protected readonly ILogger<BaseController> _logger = logger;

        private const long MinImageFile = 20 * 1024;  // 20KB
        private const long MaxImageFile = 50 * 1024;  // 50KB
        private const long MinPdfFile = 100 * 1024; // 100KB
        private const long MaxPdfFile = 200 * 1024; // 200KB



        public OfficerDetailsModal? GetOfficerDetails()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                // Log the issue for debugging
                _logger.LogWarning("GetOfficerDetails: UserId is null. User is not authenticated or NameIdentifier claim is missing.");
                return null;
            }

            _logger.LogInformation($"------- User ID: {userId} --------");

            var parameter = new SqlParameter("@UserId", userId);
            var officer = dbcontext.Database
                .SqlQuery<OfficerDetailsModal>($"EXEC GetOfficerDetails @UserId = {parameter}")
                .AsEnumerable()
                .FirstOrDefault();

            return officer;
        }

        public IActionResult UsernameAlreadyExist(string Username)
        {
            var isUsernameInUsers = dbcontext.Users.FirstOrDefault(u => u.Username == Username);

            if (isUsernameInUsers == null)
                return Json(new { status = false });
            else
                return Json(new { status = true });
        }

        public IActionResult EmailAlreadyExist(string email)
        {
            var isEmailInUsers = dbcontext.Users.FirstOrDefault(u => u.Email == email);

            if (isEmailInUsers == null)
                return Json(new { status = false });
            else
                return Json(new { status = true });
        }

        public IActionResult MobileNumberAlreadyExist(string MobileNumber)
        {
            var isMobileNumberInUsers = dbcontext.Users.FirstOrDefault(u => u.MobileNumber == MobileNumber);

            if (isMobileNumberInUsers == null)
                return Json(new { status = false });
            else
                return Json(new { status = true });
        }

        public IActionResult IsOldPasswordValid(string Password)
        {
            int? userId = HttpContext.Session.GetInt32("UserId");

            var isPasswordInUsers = dbcontext.Users.FromSqlRaw("EXEC IsOldPasswordValid @UserId,@Password,@TableName", new SqlParameter("@UserId", userId), new SqlParameter("@Password", Password), new SqlParameter("@TableName", "Users")).ToList();

            if (isPasswordInUsers!.Count == 0)
            {
                return Json(new { status = false });
            }

            return Json(new { status = true });
        }

        public IActionResult GetApplicationsCount(int? ServiceId = null, int? DistrictId = null)
        {
            // Get the current officer's details.
            var officer = GetOfficerDetails();
            if (officer == null)
            {
                return Unauthorized();
            }

            // Retrieve the service record.
            var service = dbcontext.Services.FirstOrDefault(s => s.ServiceId == ServiceId);
            if (service == null)
            {
                return NotFound();
            }

            // Deserialize the OfficerEditableField JSON.
            // Assuming the JSON is an array of objects.
            var workflow = JsonConvert.DeserializeObject<List<dynamic>>(service.OfficerEditableField!);
            if (workflow == null || workflow.Count == 0)
            {
                return Json(new { countList = new List<dynamic>(), canSanction = false });
            }

            // Find the authority record for the officer's role.
            // The JSON field names must match those in your stored JSON.
            dynamic authorities = workflow.FirstOrDefault(p => p.designation == officer.Role)!;
            if (authorities == null)
            {
                return Json(new { countList = new List<dynamic>(), canSanction = false });
            }


            var sqlParams = new List<SqlParameter>
            {
                new SqlParameter("@AccessLevel", officer.AccessLevel),
                new SqlParameter("@AccessCode", DistrictId ?? 0),  // or TehsilId
                new SqlParameter("@ServiceId", ServiceId ?? 0),
                new SqlParameter("@TakenBy", officer.Role)
            };

            // Add DivisionCode only when required
            if (officer.AccessLevel == "Division")
            {
                sqlParams.Add(new SqlParameter("@DivisionCode", officer.AccessCode));
            }
            else
            {
                sqlParams.Add(new SqlParameter("@DivisionCode", DBNull.Value));
            }

            var counts = dbcontext.Database
                .SqlQueryRaw<StatusCounts>(
                    "EXEC GetStatusCount @AccessLevel, @AccessCode, @ServiceId, @TakenBy, @DivisionCode",
                    sqlParams.ToArray()
                )
                .AsEnumerable()
                .FirstOrDefault() ?? new StatusCounts();



            _logger.LogInformation($"-------------COUNTS: {JsonConvert.SerializeObject(counts)}-----------------------");


            // Build the count list based on the available authority permissions.
            var countList = new List<dynamic>
            {
                new
                {
                    label = "Total Applications",
                    count = counts.TotalApplications,
                    bgColor = "#000000",
                    textColor = "#FFFFFF"
                },

                // Pending is always included.
                new
                {
                    label = "Pending",
                    count = counts.PendingCount,
                    bgColor = "#FFC107",
                    textColor = "#212121"
                }
            };

            // Forwarded (if allowed)
            if ((bool)authorities.canForwardToPlayer)
            {
                countList.Add(new
                {
                    label = "Forwarded",
                    count = counts.ForwardedCount,
                    bgColor = "#64B5F6",
                    textColor = "#0D47A1"
                });
            }

            // Returned (if allowed)
            if ((bool)authorities.canReturnToPlayer)
            {
                countList.Add(new
                {
                    label = "Returned",
                    count = counts.ReturnedCount,
                    bgColor = "#E0E0E0",
                    textColor = "#212121"
                });
            }

            // Citizen Pending (if allowed)
            if ((bool)authorities.canReturnToCitizen)
            {
                countList.Add(new
                {
                    label = "Citizen Pending",
                    count = counts.ReturnToEditCount,
                    bgColor = "#CE93D8",
                    textColor = "#4A148C"
                });
            }

            // Rejected (if allowed)
            if ((bool)authorities.canReject)
            {
                countList.Add(new
                {
                    label = "Rejected",
                    count = counts.RejectCount,
                    bgColor = "#FF7043",
                    textColor = "#B71C1C"
                });
            }

            // Sanctioned (if allowed)
            if ((bool)authorities.canSanction)
            {
                countList.Add(new
                {
                    label = "Sanctioned",
                    count = counts.SanctionedCount,
                    bgColor = "#81C784",
                    textColor = "#1B5E20"
                });
            }

            countList.Add(new
            {
                label = "Disbursed",
                count = counts.DisbursedCount,
                bgColor = "#ABCDEF",
                textColor = "#123456"
            });

            // Return the count list and whether the officer can sanction.
            return Json(new { countList, canSanction = (bool)authorities.canSanction });
        }


        public string GetFieldValue(string fieldName, dynamic data)
        {
            foreach (var section in data)
            {
                if (section.First is JArray fields)
                {
                    foreach (var field in fields)
                    {
                        if (field["name"] != null && field["name"]?.ToString() == fieldName)
                        {
                            return field["value"]?.ToString() ?? "";
                        }
                    }
                }
            }
            return "";
        }



        [HttpGet]
        public IActionResult GetDesignations()
        {
            // JsonConvert.DeserializeObject
            var designations = dbcontext.OfficersDesignations.Where(des => !des.Designation!.Contains("Admin")).ToList();
            return Json(new { status = true, designations });
        }

        [HttpGet]
        public IActionResult GetServices()
        {
            var officer = GetOfficerDetails();

            if (officer!.Role == "Designer" || officer.UserType == "Admin")
            {
                var Services = dbcontext.Services.ToList();
                return Json(new { status = true, services = Services });
            }

            // Fetch the service list for the given role
            var roleParameter = new SqlParameter("@Role", officer!.Role);
            var services = dbcontext.Database
                                       .SqlQuery<OfficerServiceListModal>($"EXEC GetServicesByRole @Role = {roleParameter}")
                                       .AsEnumerable() // To avoid composability errors
                                       .ToList();

            return Json(new { status = true, services });
        }



        [HttpGet]
        public IActionResult GetService()
        {
            var service = dbcontext.Services.Where(ser => ser.ServiceId == 4).FirstOrDefault();
            return Json(new { status = true, formElement = service!.FormElement });
        }

        [HttpGet]
        public IActionResult GetAccessAreas()
        {
            var officer = GetOfficerDetails();
            if (officer == null)
            {
                var Districts = dbcontext.Districts.ToList();
                return Json(new { status = true, districts = Districts });
            }
            if (officer!.AccessLevel == "Tehsil")
            {
                var tehsils = dbcontext.Tswotehsils.Where(t => t.TehsilId == officer.AccessCode).ToList();
                return Json(new { status = true, tehsils });
            }
            var districts = dbcontext.Districts.Where(d => (officer.AccessLevel == "State") || (officer!.AccessLevel == "Division" && d.Division == officer.AccessCode) || (officer.AccessLevel == "District" && d.DistrictId == officer.AccessCode)).ToList();
            return Json(new { status = true, districts });
        }

        [HttpGet]
        public IActionResult GetDistricts()
        {
            var districts = dbcontext.Districts.ToList();
            return Json(new { status = true, districts });
        }


        [HttpGet]
        public IActionResult GetTeshilForDistrict(string districtId)
        {
            int DistrictId = Convert.ToInt32(districtId);
            var tehsils = dbcontext.Tswotehsils.Where(u => u.DistrictId == DistrictId).ToList();
            return Json(new { status = true, tehsils });
        }


        [HttpGet]
        public IActionResult IsDuplicateAccNo(string bankName, string ifscCode, string accNo, string applicationId)
        {
            // Input validation
            if (string.IsNullOrEmpty(bankName) || string.IsNullOrEmpty(ifscCode) || string.IsNullOrEmpty(accNo))
            {
                return Json(new { status = false });
            }

            var parameters = new[]
            {
                new SqlParameter("@AccountNumber", accNo),
                new SqlParameter("@BankName", bankName),
                new SqlParameter("@IfscCode", ifscCode)
            };

            var applications = dbcontext.CitizenApplications
                .FromSqlRaw("EXEC GetDuplicateAccNo @AccountNumber, @BankName, @IfscCode", parameters)
                .ToList();

            if (applications.Count == 0)
            {
                return Json(new { status = false });
            }

            // Exclude current application from the duplicates
            var otherApplications = applications
                .Where(app => string.IsNullOrWhiteSpace(applicationId) || app.ReferenceNumber != applicationId)
                .ToList();

            // If no other applications, then not a duplicate
            if (otherApplications.Count == 0)
            {
                return Json(new { status = false });
            }

            // If any of the other applications are NOT rejected, it's a duplicate
            if (otherApplications.Any(app => app.Status != "Rejected"))
            {
                return Json(new { status = true });
            }

            // All are rejected → not considered duplicate
            return Json(new { status = false });
        }


        [HttpPost]
        public IActionResult Validate([FromForm] IFormCollection file)
        {
            // Ensure a file is provided
            if (file.Files.Count == 0)
            {
                return Json(new { isValid = false, errorMessage = "No file uploaded." });
            }

            var uploadedFile = file.Files[0];
            string fileType = file["fileType"].ToString();

            using (var fileStream = uploadedFile.OpenReadStream())
            {
                byte[] fileHeader = new byte[4];
                fileStream.ReadExactly(fileHeader, 0, 4); // Read first 4 bytes of the file

                string fileExtension = Path.GetExtension(uploadedFile.FileName)?.ToLower()!;

                // Check if the file type is an image
                if (fileType == "image")
                {
                    if (!IsValidImage(fileHeader, fileExtension))
                    {
                        return Json(new { isValid = false, errorMessage = "The uploaded file is not a valid image." });
                    }

                    // If it's a valid image, check the file size
                    if (uploadedFile.Length < MinImageFile || uploadedFile.Length > MaxImageFile)
                    {
                        return Json(new { isValid = false, errorMessage = "Image file size must be between 20KB and 50KB." });
                    }
                }
                // Check if the file type is a PDF
                else if (fileType == "pdf")
                {
                    if (!IsValidPdf(fileHeader, fileExtension))
                    {
                        return Json(new { isValid = false, errorMessage = "The uploaded file is not a valid PDF." });
                    }

                    // If it's a valid PDF, check the file size
                    if (uploadedFile.Length < MinPdfFile || uploadedFile.Length > MaxPdfFile)
                    {
                        return Json(new { isValid = false, errorMessage = "PDF file size must be between 100KB and 200KB." });
                    }
                }
                else
                {
                    return Json(new { isValid = false, errorMessage = "Unsupported file type." });
                }
            }

            // If all checks pass, return success
            return Json(new { isValid = true, message = "" });
        }

        private static bool IsValidImage(byte[] header, string fileExtension)
        {
            // PNG: 89 50 4E 47 (hex) / JPG: FF D8 FF E0 or FF D8 FF E1
            if (fileExtension == ".png" && header[0] == 0x89 && header[1] == 0x50 &&
                header[2] == 0x4E && header[3] == 0x47)
            {
                return true;
            }

            if (fileExtension == ".jpg" || fileExtension == ".jpeg")
            {
                return header[0] == 0xFF && header[1] == 0xD8 && (header[2] == 0xFF);
            }

            return false;
        }

        private static bool IsValidPdf(byte[] header, string fileExtension)
        {
            // PDF files start with: 25 50 44 46 (hex)
            return fileExtension == ".pdf" && header[0] == 0x25 && header[1] == 0x50 &&
                header[2] == 0x44 && header[3] == 0x46;
        }


        [HttpGet]
        public IActionResult GetIFSCCode(string bankName, string branchName)
        {
            // Validate input parameters
            if (string.IsNullOrWhiteSpace(bankName) || string.IsNullOrWhiteSpace(branchName))
            {
                return BadRequest(new { status = false, message = "BankName and BranchName are required." });
            }

            try
            {
                if (bankName == "JK GRAMEEN BANK")
                {
                    return Ok(new { status = true, ifscCode = "JAKA0GRAMEN" });
                }
                string cleanedBankName = bankName;
                if (cleanedBankName.StartsWith("THE ", StringComparison.OrdinalIgnoreCase))
                {
                    cleanedBankName = cleanedBankName.Substring(4).TrimStart();
                }
                // Execute the stored procedure
                var ifscCode = dbcontext.Database
                .SqlQueryRaw<string>(
                    "EXEC GetIfscCode @BankName, @BranchName",
                    new SqlParameter("@BankName", cleanedBankName),
                    new SqlParameter("@BranchName", branchName))
                .AsNoTracking()
                .AsEnumerable()
                .FirstOrDefault();

                if (!string.IsNullOrEmpty(ifscCode))
                {
                    return Ok(new { status = true, ifscCode });
                }
                else
                {
                    return NotFound(new { status = false, message = "No IFSC code found for the provided bank and branch." });
                }
            }
            catch (Exception ex)
            {
                // Log the exception (use a logging framework like Serilog in production)
                return StatusCode(500, new { status = false, message = "An error occurred while fetching the IFSC code.", error = ex.Message });
            }
        }



        [HttpGet]
        public IActionResult GetAreaList(string table, int parentId)
        {
            object? data = null;

            switch (table)
            {
                case "Tehsil":
                    data = dbcontext.Tswotehsils
                        .Where(t => t.DistrictId == parentId)
                        .Select(t => new { value = t.TehsilId, label = t.TehsilName }) // Optional: project only needed fields
                        .ToList();
                    break;

                case "Muncipality":
                    data = dbcontext.Muncipalities.Where(m => m.DistrictId == parentId)
                    .Select(m => new { value = m.MuncipalityId, label = m.MuncipalityName })
                    .ToList();
                    break;

                case "Block":
                    data = dbcontext.Blocks.Where(m => m.DistrictId == parentId)
                    .Select(m => new { value = m.BlockId, label = m.BlockName })
                    .ToList();
                    break;

                case "Ward":
                    data = dbcontext.Wards
                    .Where(m => m.MuncipalityId == parentId)
                    .OrderBy(m => m.WardCode) // 👈 Sorts by WardCode
                    .Select(m => new
                    {
                        value = m.WardCode,
                        label = "Ward No " + m.WardNo
                    })
                    .ToList();

                    break;

                case "HalqaPanchayat":
                    data = dbcontext.HalqaPanchayats.Where(m => m.BlockId == parentId)
                            .Select(m => new { value = m.HalqaPanchayatId, label = m.HalqaPanchayatName })
                            .ToList();
                    break;
                case "Village":
                    data = dbcontext.Villages.Where(m => m.HalqaPanchayatId == parentId)
                          .Select(m => new { value = m.VillageId, label = m.VillageName })
                          .ToList();
                    break;
                // Add other cases as needed

                default:
                    return BadRequest("Invalid table name.");
            }

            return Json(new { data });
        }


        [HttpGet]
        public IActionResult ValidateIfscCode(string bankName, string ifscCode)
        {
            var result = dbcontext.BankDetails
                .FromSqlRaw("EXEC ValidateIFSC @bankName, @ifscCode",
                    new SqlParameter("@bankName", bankName),
                    new SqlParameter("@ifscCode", ifscCode))
                .AsEnumerable()
                .ToList();

            if (result.Count == 0)
            {
                return Json(new { status = true });
            }

            return Json(new { status = false });
        }


    }
}