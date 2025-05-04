using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using ReactMvcApp.Models.Entities;

namespace ReactMvcApp.Controllers
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

        // public int GetCount(string type, Dictionary<string, string> conditions)
        // {
        //     StringBuilder Condition1 = new StringBuilder();
        //     StringBuilder Condition2 = new StringBuilder();

        //     if (type == "Pending")
        //         Condition1.Append("AND application.ApplicationStatus='Initiated'");
        //     else if (type == "Sanction")
        //         Condition1.Append("AND application.ApplicationStatus='Sanctioned'");
        //     else if (type == "Reject")
        //         Condition1.Append("AND application.ApplicationStatus='Rejected'");
        //     else if (type == "PendingWithCitizen")
        //         Condition1.Append("AND Application.ApplicationStatus='Initiated' AND JSON_VALUE(app.value, '$.ActionTaken')='ReturnToEdit'");

        //     int conditionCount = 0;
        //     int splitPoint = conditions != null ? conditions.Count / 2 : 0;

        //     if (conditions != null && conditions.Count != 0)
        //     {
        //         foreach (var condition in conditions)
        //         {
        //             if (conditionCount < splitPoint)
        //                 Condition1.Append($" AND {condition.Key}='{condition.Value}'");
        //             else
        //                 Condition2.Append($" AND {condition.Key}='{condition.Value}'");

        //             conditionCount++;
        //         }

        //     }

        //     if (conditions != null && conditions.ContainsKey("JSON_VALUE(app.value, '$.Officer')") && type != "Total")
        //     {
        //         Condition2.Append($" AND JSON_VALUE(app.value, '$.ActionTaken') = '{type}'");
        //     }
        //     else if (type == "Total")
        //     {
        //         Condition2.Append($" AND JSON_VALUE(app.value, '$.ActionTaken') != ''");
        //     }

        //     int count = dbcontext.Applications.FromSqlRaw("EXEC GetApplications @Condition1, @Condition2",
        // new SqlParameter("@Condition1", Condition1.ToString()),
        // new SqlParameter("@Condition2", Condition2.ToString())).ToList().Count;

        //     return count;
        // }

        // public IActionResult GetFilteredCount(string? conditions)
        // {
        //     var Conditions = JsonConvert.DeserializeObject<Dictionary<string, string>>(conditions!);
        //     int TotalCount = GetCount("Total", Conditions!);
        //     int PendingCount = GetCount("Pending", Conditions!);
        //     int RejectCount = GetCount("Reject", Conditions!);
        //     int SanctionCount = GetCount("Sanction", Conditions!);

        //     return Json(new { status = true, TotalCount, PendingCount, RejectCount, SanctionCount });
        // }

        // [HttpGet]
        // public IActionResult GetApplicationsCount(int? ServiceId = null, int? DistrictId = null)
        // {
        //     var officerDetails = GetOfficerDetails();

        //     var authorities = dbcontext.WorkFlows.FirstOrDefault(wf => wf.ServiceId == ServiceId && wf.Role == officerDetails!.Role);
        //     _logger.LogInformation($"------Access Level: {officerDetails.AccessLevel}--------");

        //     var officer = dbcontext.OfficerDetails.FirstOrDefault(od => od.OfficerId == officerDetails.UserId);
        //     var districts = dbcontext.Districts
        //     .Where(d =>
        //         (officer!.AccessLevel == "District" && officer.AccessCode == d.DistrictId) || // Match single district
        //         (officer.AccessLevel == "Division" && officer.AccessCode == d.Division) ||  // Match all districts in division
        //         (officer.AccessLevel == "State")) // Match all districts for state-level access
        //     .Select(d => new
        //     {
        //         label = d.DistrictName,
        //         value = d.DistrictId
        //     })
        //     .ToList();



        //     var services = dbcontext.Services
        //         .Select(s => new
        //         {
        //             label = s.ServiceName,
        //             value = s.ServiceId
        //         })
        //         .ToList();

        //     // Populate lists directly
        //     List<dynamic> Districts = districts.Cast<dynamic>().ToList();
        //     List<dynamic> Services = services.Cast<dynamic>().ToList();


        //     var serviceIdParam = new SqlParameter("@ServiceId", (object)ServiceId! ?? DBNull.Value);
        //     var districtIdParam = new SqlParameter("@DistrictId", (object)DistrictId! ?? DBNull.Value);
        //     var accessLevelParam = new SqlParameter("@AccessLevel", officerDetails.AccessLevel);
        //     var accessCodeParam = new SqlParameter("@AccessCode", officerDetails.AccessCode);

        //     // Execute the stored procedure with parameters
        //     var counts = dbcontext.Database
        //         .SqlQueryRaw<StatusCountsSA>(
        //             "EXEC GetStatusCount_SA @ServiceId, @DistrictId, @AccessLevel, @AccessCode",
        //              serviceIdParam, districtIdParam, accessLevelParam, accessCodeParam)
        //         .AsEnumerable()
        //         .FirstOrDefault();

        //     List<dynamic> countList = [];
        //     countList.Add(new { label = "Total", count = counts!.TotalApplications, bgColor = "#F0C38E", textColor = "#312C51" });
        //     countList.Add(new { label = "Pending", count = counts!.PendingCount, bgColor = "#FFC107", textColor = "#000000" });
        //     countList.Add(new { label = "Citizen Pending", count = counts!.ReturnToEditCount, bgColor = "#CE93D8", textColor = "#4A148C" });
        //     countList.Add(new { label = "Sanctioned", count = counts!.SanctionCount, bgColor = "#81C784", textColor = "#1B5E20" });
        //     countList.Add(new { label = "Disbursed", count = counts!.DisbursedCount, bgColor = "#4CAF50", textColor = "#FFFFFF" });
        //     countList.Add(new { label = "Failed Payment", count = counts!.FailureCount, bgColor = "#FF7043", textColor = "#B71C1C" });
        //     countList.Add(new { label = "Rejected", count = counts!.RejectCount, bgColor = "#FF7043", textColor = "#B71C1C" });

        //     return Json(new { countList, Districts, Services });
        // }

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

            // Create SQL parameters for a parameterized stored procedure call.
            var paramTakenBy = new SqlParameter("@TakenBy", officer.Role);
            var paramAccessLevel = new SqlParameter("@AccessLevel", officer.AccessLevel);
            var paramAccessCode = new SqlParameter("@AccessCode", DistrictId);
            var paramServiceId = new SqlParameter("@ServiceId", ServiceId);

            // Execute the stored procedure and retrieve counts.
            var counts = dbcontext.Database
                .SqlQueryRaw<StatusCounts>(
                    "EXEC GetStatusCount @TakenBy, @AccessLevel, @AccessCode, @ServiceId",
                    paramTakenBy, paramAccessLevel, paramAccessCode, paramServiceId)
                .AsEnumerable()
                .FirstOrDefault() ?? new StatusCounts();

            // Build the count list based on the available authority permissions.
            var countList = new List<dynamic>();

            countList.Add(new
            {
                label = "Total Applications",
                count = counts.TotalApplications,
                bgColor = "#000000",
                textColor = "#FFFFFF"
            });

            // Pending is always included.
            countList.Add(new
            {
                label = "Pending",
                count = counts.PendingCount,
                bgColor = "#FFC107",
                textColor = "#212121"
            });

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

        // public IActionResult GetApplicationDetails(int? ServiceId = null, int? DistrictId = null, string? ApplicationStatus = null, int page = 0, int size = 10)
        // {
        //     var officerDetails = GetOfficerDetails();
        //     var serviceIdParam = new SqlParameter("@ServiceId", ServiceId ?? (object)DBNull.Value);
        //     var districtIdParam = new SqlParameter("@DistrictId", DistrictId ?? (object)DBNull.Value);
        //     var accessLevelParam = new SqlParameter("@AccessLevel", officerDetails.AccessLevel ?? (object)DBNull.Value);
        //     var accessCodeParam = new SqlParameter("@AccessCode", officerDetails.AccessCode);
        //     var appStatusParam = new SqlParameter("@ApplicationStatus", ApplicationStatus ?? (object)DBNull.Value);

        //     var applications = dbcontext.Database
        //         .SqlQueryRaw<ApplicationDetailsSA>(
        //             "EXEC GetApplications_SA @ServiceId, @DistrictId, @AccessLevel, @AccessCode, @ApplicationStatus",
        //              serviceIdParam, districtIdParam, accessLevelParam, accessCodeParam, appStatusParam)
        //         .ToList();

        //     var columns = new List<dynamic>
        //     {
        //         new { label = "S.No", value = "sno" },
        //         new { label = "Reference Number", value = "referenceNumber" },
        //         new { label = "Applicant Name", value = "applicantName" },
        //         new { label = "Submission Date", value = "submissionDate" },
        //         new { label = "Applied District", value = "appliedDistrict" },
        //         new { label = "Applied Service", value = "appliedService" },
        //         new { label = "Currently With", value = "currentlyWith" },
        //         new { label = "Status", value = "status" }
        //     };

        //     List<dynamic> data = [];
        //     int index = 1;

        //     foreach (var item in applications)
        //     {
        //         var cell = new
        //         {
        //             sno = index,
        //             referenceNumber = item.ReferenceNumber,
        //             applicantName = item.ApplicantName,
        //             submissionDate = item.SubmissionDate,
        //             appliedDistrict = item.AppliedDistrict,
        //             appliedService = item.AppliedService,
        //             currentlyWith = item.CurrentlyWith,
        //             status = item.Status
        //         };
        //         data.Add(cell);
        //         index++;
        //     }


        //     var paginatedData = data.AsEnumerable()
        //         .Skip(page * size)
        //         .Take(size).ToList();
        //     return Json(new { columns, data = paginatedData, totalCount = data.Count });
        // }

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
            

            if(officer!.Role =="Designer"){
                var Services = dbcontext.Services.ToList();
                return Json(new{status=true,services = Services});
            }

            // Fetch the service list for the given role
            var roleParameter = new SqlParameter("@Role", officer!.Role);
            var services = dbcontext.Database
                                       .SqlQuery<OfficerServiceListModal>($"EXEC GetServicesByRole @Role = {roleParameter}")
                                       .AsEnumerable() // To avoid composability errors
                                       .ToList();

            return Json(new { status = true, services });
        }

        [HttpPost]
        public IActionResult FormElement([FromForm] IFormCollection form)
        {
            string serviceIdString = form["serviceId"].ToString();
            var formElement = form["formElement"].ToString();

            _logger.LogInformation($"--------------SERVICE ID: {serviceIdString}---------------------");
            if (!string.IsNullOrEmpty(serviceIdString))
            {
                int serviceId = Convert.ToInt32(serviceIdString);
                var service = dbcontext.Services.FirstOrDefault(s => s.ServiceId == serviceId);

                if (service != null)
                {
                    service.FormElement = formElement;
                }
            }
            else
            {
                var newService = new Service
                {
                    FormElement = formElement
                };
                dbcontext.Services.Add(newService);
            }

            dbcontext.SaveChanges();

            return Json(new { status = true });
        }

        [HttpPost]
        public IActionResult WorkFlowPlayers([FromForm] IFormCollection form)
        {
            string serviceIdString = form["serviceId"].ToString();
            var workFlowPlayers = form["workflowplayers"].ToString();

            if (!string.IsNullOrEmpty(serviceIdString))
            {
                int serviceId = Convert.ToInt32(serviceIdString);
                var service = dbcontext.Services.FirstOrDefault(s => s.ServiceId == serviceId);
                if (service != null)
                {
                    _logger.LogInformation("-----------INSIDE IF----------------");
                    service.OfficerEditableField = workFlowPlayers;
                    dbcontext.Services.Update(service);
                }
            }
            else
            {
                var newService = new Service
                {
                    OfficerEditableField = workFlowPlayers
                };
                dbcontext.Services.Add(newService);
            }

            dbcontext.SaveChanges();

            return Json(new { status = true });
        }



        [HttpGet]
        public IActionResult GetService()
        {
            var service = dbcontext.Services.Where(ser => ser.ServiceId == 4).FirstOrDefault();
            return Json(new { status = true, formElement = service!.FormElement });
        }

        [HttpGet]
        public IActionResult GetDistricts()
        {
            var officer = GetOfficerDetails();
            if(officer == null){
                var Districts = dbcontext.Districts.ToList();
                return Json(new { status = true, districts = Districts });
            }
            if (officer!.AccessLevel == "Tehsil")
            {
                var tehsils = dbcontext.Tehsils.Where(t => t.TehsilId == officer.AccessCode).ToList();
                return Json(new { status = true, tehsils });
            }
            var districts = dbcontext.Districts.Where(d => (officer.AccessLevel == "State") || (officer!.AccessLevel == "Division" && d.Division == officer.AccessCode) || (officer.AccessLevel == "District" && d.DistrictId == officer.AccessCode)).ToList();
            return Json(new { status = true, districts });
        }


        [HttpGet]
        public IActionResult GetTeshilForDistrict(string districtId)
        {
            int DistrictId = Convert.ToInt32(districtId);
            var tehsils = dbcontext.Tehsils.Where(u => u.DistrictId == DistrictId).ToList();
            return Json(new { status = true, tehsils });
        }

        // [HttpGet]
        // public IActionResult GetBlockForDistrict(string districtId)
        // {
        //     int DistrictId = Convert.ToInt32(districtId);
        //     var blocks = dbcontext.Blocks.Where(u => u.DistrictId == DistrictId).ToList();
        //     return Json(new { status = true, blocks });
        // }

        [HttpGet]
        public IActionResult IsDuplicateAccNo(string accNo, string applicationId)
        {
            var application = dbcontext.CitizenApplications.FromSqlRaw("EXEC GetDuplicateAccNo @AccountNo", new SqlParameter("@AccountNo", accNo)).ToList();

            if (application.Count == 0)
                return Json(new { status = false });
            else if (application[0].ReferenceNumber == applicationId)
                return Json(new { status = false });
            else
            {
                if (application[0].Status == "Rejected") return Json(new { status = false });
                else return Json(new { status = true });
            }
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

        private bool IsValidImage(byte[] header, string fileExtension)
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

        private bool IsValidPdf(byte[] header, string fileExtension)
        {
            // PDF files start with: 25 50 44 46 (hex)
            return fileExtension == ".pdf" && header[0] == 0x25 && header[1] == 0x50 &&
                header[2] == 0x44 && header[3] == 0x46;
        }

    }
}