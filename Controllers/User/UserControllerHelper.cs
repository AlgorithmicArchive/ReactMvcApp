using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.Differencing;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using ReactMvcApp.Models.Entities;
using System.Security.Claims;
using System.Text.RegularExpressions;

namespace ReactMvcApp.Controllers.User
{
    public partial class UserController
    {
        [HttpPost]
        public IActionResult SetServiceForm([FromForm] IFormCollection form)
        {
            int serviceId = Convert.ToInt32(form["serviceId"].ToString());

            return Json(new { status = true, url = "/user/form" });
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

            int initiated = dbcontext.Applications
                .Where(u => u.CitizenId.ToString() == userId && u.ApplicationStatus == "Initiated")
                .Count();
            int incomplete = dbcontext.Applications
                .Where(u => u.CitizenId.ToString() == userId && u.ApplicationStatus == "Incomplete")
                .Count();
            int sanctioned = dbcontext.Applications
                .Where(u => u.CitizenId.ToString() == userId &&
                           (u.ApplicationStatus == "Sanctioned" || u.ApplicationStatus == "Dispatched" || u.ApplicationStatus == "Deposited" || u.ApplicationStatus == "Disbursed" || u.ApplicationStatus == "Failure"))
                .Count();
            int paymentDisbursed = dbcontext.Applications.Where(u => u.CitizenId.ToString() == userId && u.ApplicationStatus == "Disbursed").Count();
            int paymentFailed = dbcontext.Applications.Where(u => u.CitizenId.ToString() == userId && u.ApplicationStatus == "Failure").Count();

            var userDetails = dbcontext.Users.FirstOrDefault(u => u.UserId.ToString() == userId);

            var details = new
            {
                userDetails!.Name,
                userDetails.Username,
                userDetails.Profile,
                userDetails.Email,
                userDetails.MobileNumber,
                userDetails.BackupCodes,
                initiated,
                incomplete,
                sanctioned
            };

            return details;
        }

        public static string FormatKey(string input)
        {
            if (string.IsNullOrEmpty(input))
                return input;

            // Use Regex to insert space before each capital letter, except for the first one
            string result = Regex.Replace(input, "(?<!^)([A-Z])", " $1");

            return result;
        }



        public IActionResult GetApplicationDetails(string applicationId)
        {
            var (userDetails, preAddressDetails, perAddressDetails, serviceSpecific, bankDetails, documents) = helper.GetUserDetailsAndRelatedData(applicationId);

            var generalDetails = new List<KeyValuePair<string, object>>
            {
                new("Reference Number", userDetails.ApplicationId),
                new("Applicant Name", userDetails.ApplicantName),
                new("Applicant Image", userDetails.ApplicantImage),
                new("Email", userDetails.Email),
                new("Mobile Number", userDetails.MobileNumber),
                new("Parentage", userDetails.RelationName + $"({userDetails.Relation})"),
                new("Date Of Birth", userDetails.DateOfBirth),
                new("Category", userDetails.Category),
                new("Submission Date", userDetails.SubmissionDate)
            };

            foreach (var kvp in serviceSpecific!)
            {
                string key = kvp.Key;
                string value = kvp.Value;
                bool isDigitOnly = value.All(char.IsDigit);
                if (!isDigitOnly)
                {
                    generalDetails.Insert(8, new KeyValuePair<string, object>(FormatKey(key), value));
                }
            }

            var presentAddressDetails = new List<KeyValuePair<string, object>>{
                new("Address",preAddressDetails.Address!),
                new("District",preAddressDetails.District!),
                new("Tehsil",preAddressDetails.Tehsil!),
                new("Block",preAddressDetails.Block!),
                new("Panchayat/Muncipality",preAddressDetails.PanchayatMuncipality!),
                new("Village",preAddressDetails.Village!),
                new("Ward",preAddressDetails.Ward!),
                new("Pincode",preAddressDetails.Pincode!),
            };

            var permanentAddressDetails = new List<KeyValuePair<string, object>>{
                new("Address",perAddressDetails.Address!),
                new("District",perAddressDetails.District!),
                new("Tehsil",perAddressDetails.Tehsil!),
                new("Block",perAddressDetails.Block!),
                new("Panchayat/Muncipality",perAddressDetails.PanchayatMuncipality!),
                new("Village",perAddressDetails.Village!),
                new("Ward",perAddressDetails.Ward!),
                new("Pincode",perAddressDetails.Pincode!),
            };

            var BankDetails = new List<KeyValuePair<string, object>>{
                new("Bank Name",bankDetails.BankName),
                new("Branch Name",bankDetails.BranchName),
                new("IFSC Code",bankDetails.IfscCode),
                new("Account Number",bankDetails.AccountNumber),
            };


            return Json(new { generalDetails, presentAddressDetails, permanentAddressDetails, BankDetails, documents });
        }

        [HttpGet]
        public IActionResult GetDistricts()
        {
            var districts = dbcontext.Districts.ToList();
            return Json(new { status = true, districts });
        }

        [HttpGet]
        public IActionResult GetDistrictsForService()
        {
            var districts = dbcontext.Districts
            .Where(district =>
                dbcontext.OfficerDetails.Any(officer =>
                    officer.AccessLevel == "District" &&
                    officer.AccessCode == district.DistrictId)) // Subquery condition
            .ToList();

            return Json(new { status = true, districts });
        }

        [HttpGet]
        public IActionResult GetTehsils(string districtId)
        {
            int.TryParse(districtId, out int DistrictId);
            var tehsils = dbcontext.Tehsils.Where(u => u.DistrictId == DistrictId).ToList();
            return Json(new { status = true, tehsils });
        }

        [HttpGet]
        public IActionResult GetBlocks(string districtId)
        {
            int DistrictId = Convert.ToInt32(districtId);
            var blocks = dbcontext.Blocks.Where(u => u.DistrictId == DistrictId).ToList();
            return Json(new { status = true, blocks });
        }

        [HttpGet]
        public async Task<IActionResult> GetApplicationHistory(string ApplicationId, int page, int size)
        {
            if (string.IsNullOrEmpty(ApplicationId))
            {
                return BadRequest("ApplicationId is required.");
            }

            var parameter = new SqlParameter("@ApplicationId", ApplicationId);

            var history = await dbcontext.Database
                                         .SqlQuery<ApplicationsHistoryModal>($"EXEC GetApplicationsHistory @ApplicationId = {parameter}")
                                         .ToListAsync();

            Dictionary<string, string> actionMap = new()
            {
                {"Pending","Pending"},
                {"Forwarded","Forwarded"},
                {"Sanctioned","Sanctioned"},
                {"Returned","Returned"},
                {"Rejected","Rejected"},
                {"ReturnToEdit","Returned to citizen for edition"},
                {"Deposited","Inserted to Bank File"},
                {"Dispatched","Payment Under Process"},
                {"Disbursed","Payment Disbursed"},
                {"Failure","Payment Failed"},
            };

            var columns = new List<dynamic>
            {
                new { label = "S.No", value="sno" },
                new { label = "Receive On",value="receivedOn" },
                new { label = "Currently With", value="currentlyWith" },
                new { label = "Action Taken",value="actionTaken" },
                new { label = "Remarks",value="remarks" }
            };

            var data = history.Select((item, index) => new
            {
                sno = index + 1,
                receivedOn = item.TakenAt,
                currentlyWith = item.ActionTaken == "Dispatched" ? "Bank" : item.ActionTaken == "Disbursed" || item.ActionTaken == "Failure" ? "NULL" : item.Designation,
                actionTaken = actionMap[item.ActionTaken!],
                remarks = item.Remarks
            }).AsEnumerable().Skip(page * size).Take(size).ToList();

            return Json(new { status = true, data, columns, totalCount = data.Count });
        }

        public int GetCountPerDistrict(int districtId, int serviceId)
        {

            // Attempt to find an existing record for the district and service
            var applicationsPerDistrict = dbcontext.ApplicationPerDistricts
                .FirstOrDefault(apd => apd.DistrictId == districtId && apd.ServiceId == serviceId);

            if (applicationsPerDistrict != null)
            {
                // Record exists: increment the count
                applicationsPerDistrict.CountValue += 1;
                dbcontext.ApplicationPerDistricts.Update(applicationsPerDistrict);
            }
            else
            {
                // Record does not exist: create a new record with count 1
                applicationsPerDistrict = new ApplicationPerDistrict
                {
                    DistrictId = districtId,
                    ServiceId = serviceId,
                    FinancialYear = helper.GetCurrentFinancialYear(),
                    CountValue = 1
                };
                dbcontext.ApplicationPerDistricts.Add(applicationsPerDistrict);
            }

            // Save changes to the database
            dbcontext.SaveChanges();

            return applicationsPerDistrict.CountValue;
        }

        private static string SaveFile(IFormFile file)
        {
            // Define the folder to store files (e.g., wwwroot/uploads)
            string folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(folderPath))
            {
                Directory.CreateDirectory(folderPath);
            }

            // Generate a unique filename using a GUID and preserve the file extension
            string uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
            string filePath = Path.Combine(folderPath, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                file.CopyTo(stream);
            }

            // Return the relative path (or absolute, as needed) for storage in your JSON.
            return "/uploads/" + uniqueFileName;
        }

        [HttpGet]
        public IActionResult GetServiceContent(int serviceId)
        {
            // Retrieve the serviceId from the JWT claims or other mechanisms if necessary.
            var service = dbcontext.Services.FirstOrDefault(ser => ser.ServiceId == serviceId);

            if (service != null)
            {
                return Json(new { status = true, service.ServiceName, service.FormElement, service.ServiceId });
            }
            else
            {
                return Json(new { status = false, message = "No Service Found" });
            }
        }

        [HttpGet]
        public IActionResult GetAcknowledgement(string ApplicationId)
        {
            var result = FetchAcknowledgementDetails(ApplicationId);
            return Json(result);
        }

        private dynamic FetchAcknowledgementDetails(string applicationId)
        {
            // Retrieve ApplicationId from JWT claim

            if (string.IsNullOrEmpty(applicationId))
            {
                return new { }; // Return an empty dictionary
            }

            string path = "files/" + applicationId.Replace("/", "_") + "Acknowledgement.pdf";

            var (userDetails, preAddressDetails, perAddressDetails, serviceSpecific, bankDetails, docs) = helper.GetUserDetailsAndRelatedData(applicationId);
            int districtCode = Convert.ToInt32(serviceSpecific["District"]);
            string appliedDistrict = dbcontext.Districts.FirstOrDefault(d => d.DistrictId == districtCode)?.DistrictName ?? "Unknown District";

            var details = new Dictionary<string, string>
            {
                ["REFERENCE NUMBER"] = userDetails.ApplicationId,
                ["APPLICANT NAME"] = userDetails.ApplicantName,
                ["PARENTAGE"] = userDetails.RelationName + $" ({userDetails.Relation.ToUpper()})",
                ["MOTHER NAME"] = serviceSpecific["MotherName"],
                ["APPLIED DISTRICT"] = appliedDistrict.ToUpper(),
                ["BANK NAME"] = bankDetails["BankName"],
                ["ACCOUNT NUMBER"] = bankDetails["AccountNumber"],
                ["IFSC CODE"] = bankDetails["IfscCode"],
                ["DATE OF MARRIAGE"] = serviceSpecific["DateOfMarriage"],
                ["DATE OF SUBMISSION"] = userDetails.SubmissionDate!,
                ["PRESENT ADDRESS"] = $"{preAddressDetails.Address}, TEHSIL: {preAddressDetails.Tehsil}, DISTRICT: {preAddressDetails.District}, PIN CODE: {preAddressDetails.Pincode}",
                ["PERMANENT ADDRESS"] = $"{perAddressDetails.Address}, TEHSIL: {perAddressDetails.Tehsil}, DISTRICT: {perAddressDetails.District}, PIN CODE: {perAddressDetails.Pincode}"
            };

            return new { details, path };
        }

        public IActionResult GetEditForm(string applicationId)
        {
            var application = dbcontext.Applications.FirstOrDefault(app => app.ApplicationId == applicationId);
            var editList = JsonConvert.DeserializeObject<string[]>(application!.EditList);
            var serviceSpecific = JsonConvert.DeserializeObject<dynamic>(application.ServiceSpecific);
            var service = dbcontext.Services.FirstOrDefault(s => s.ServiceId == application.ServiceId);
            var formElements = JsonConvert.DeserializeObject<dynamic>(service!.FormElement!);
            List<dynamic> EditFields = [];
            foreach (var element in formElements!)
            {
                var fields = element.fields;
                foreach (var field in fields)
                {
                    string fieldName = field.name.ToString();
                    string value = "";
                    if (editList!.Contains(fieldName))
                    {
                        if (application.GetType().GetProperty(fieldName) != null)
                            value = application.GetType().GetProperty(fieldName)!.GetValue(application)!.ToString()!;
                        else
                            value = serviceSpecific![fieldName];

                        field["value"] = value;
                        EditFields.Add(field);
                    }
                }
            }



            return Json(new { EditFields });
        }

        public static bool HasProperty<T>(string propertyName)
        {
            return typeof(T).GetProperty(propertyName) != null;
        }
    }
}
