using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.Differencing;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using ReactMvcApp.Models.Entities;
using System.Collections.Specialized;
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

            int initiated = dbcontext.CitizenApplications
                .Where(u => u.CitizenId.ToString() == userId && u.Status == "pending")
                .Count();
            int incomplete = dbcontext.CitizenApplications
                .Where(u => u.CitizenId.ToString() == userId && u.Status == "Incomplete")
                .Count();
            int sanctioned = dbcontext.CitizenApplications
                .Where(u => u.CitizenId.ToString() == userId &&
                           (u.Status == "Sanctioned" || u.Status == "Dispatched" || u.Status == "Deposited" || u.Status == "Disbursed" || u.Status == "Failure"))
                .Count();
            int paymentDisbursed = dbcontext.CitizenApplications.Where(u => u.CitizenId.ToString() == userId && u.Status == "Disbursed").Count();
            int paymentFailed = dbcontext.CitizenApplications.Where(u => u.CitizenId.ToString() == userId && u.Status == "Failure").Count();

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



        // public IActionResult GetApplicationDetails(string applicationId)
        // {
        //     var (userDetails, preAddressDetails, perAddressDetails, serviceSpecific, bankDetails, documents) = helper.GetUserDetailsAndRelatedData(applicationId);

        //     var generalDetails = new List<KeyValuePair<string, object>>
        //     {
        //         new("Reference Number", userDetails.ApplicationId),
        //         new("Applicant Name", userDetails.ApplicantName),
        //         new("Applicant Image", userDetails.ApplicantImage),
        //         new("Email", userDetails.Email),
        //         new("Mobile Number", userDetails.MobileNumber),
        //         new("Parentage", userDetails.RelationName + $"({userDetails.Relation})"),
        //         new("Date Of Birth", userDetails.DateOfBirth),
        //         new("Category", userDetails.Category),
        //         new("Submission Date", userDetails.SubmissionDate)
        //     };

        //     foreach (var kvp in serviceSpecific!)
        //     {
        //         string key = kvp.Key;
        //         string value = kvp.Value;
        //         bool isDigitOnly = value.All(char.IsDigit);
        //         if (!isDigitOnly)
        //         {
        //             generalDetails.Insert(8, new KeyValuePair<string, object>(FormatKey(key), value));
        //         }
        //     }

        //     var presentAddressDetails = new List<KeyValuePair<string, object>>{
        //         new("Address",preAddressDetails.Address!),
        //         new("District",preAddressDetails.District!),
        //         new("Tehsil",preAddressDetails.Tehsil!),
        //         new("Block",preAddressDetails.Block!),
        //         new("Panchayat/Muncipality",preAddressDetails.PanchayatMuncipality!),
        //         new("Village",preAddressDetails.Village!),
        //         new("Ward",preAddressDetails.Ward!),
        //         new("Pincode",preAddressDetails.Pincode!),
        //     };

        //     var permanentAddressDetails = new List<KeyValuePair<string, object>>{
        //         new("Address",perAddressDetails.Address!),
        //         new("District",perAddressDetails.District!),
        //         new("Tehsil",perAddressDetails.Tehsil!),
        //         new("Block",perAddressDetails.Block!),
        //         new("Panchayat/Muncipality",perAddressDetails.PanchayatMuncipality!),
        //         new("Village",perAddressDetails.Village!),
        //         new("Ward",perAddressDetails.Ward!),
        //         new("Pincode",perAddressDetails.Pincode!),
        //     };

        //     var BankDetails = new List<KeyValuePair<string, object>>{
        //         new("Bank Name",bankDetails.BankName),
        //         new("Branch Name",bankDetails.BranchName),
        //         new("IFSC Code",bankDetails.IfscCode),
        //         new("Account Number",bankDetails.AccountNumber),
        //     };


        //     return Json(new { generalDetails, presentAddressDetails, permanentAddressDetails, BankDetails, documents });
        // }

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

        // [HttpGet]
        // public IActionResult GetBlocks(string districtId)
        // {
        //     int DistrictId = Convert.ToInt32(districtId);
        //     var blocks = dbcontext.Blocks.Where(u => u.DistrictId == DistrictId).ToList();
        //     return Json(new { status = true, blocks });
        // }

        [HttpGet]
        public async Task<IActionResult> GetApplicationHistory(string ApplicationId, int page, int size)
        {
            if (string.IsNullOrEmpty(ApplicationId))
            {
                return BadRequest("ApplicationId is required.");
            }

            var parameter = new SqlParameter("@ApplicationId", ApplicationId);
            var application = await dbcontext.CitizenApplications.FirstOrDefaultAsync(ca => ca.ReferenceNumber == ApplicationId);
            var players = JsonConvert.DeserializeObject<dynamic>(application!.WorkFlow!) as JArray;
            int currentPlayerIndex = application.CurrentPlayer;
            var currentPlayer = players!.FirstOrDefault(o => (int)o["playerId"]! == currentPlayerIndex);
            var history = await dbcontext.ActionHistories.Where(ah => ah.ReferenceNumber == ApplicationId).ToListAsync();

            var columns = new List<dynamic>
            {
                new { header = "S.No", accessorKey="sno" },
                new { header = "Action Taker", accessorKey="actionTaker" },
                new { header = "Action Taken",accessorKey="actionTaken" },
                new { header = "Action Taken On",accessorKey="actionTakenOn" },
            };
            int index = 1;
            List<dynamic> data = [];
            foreach (var item in history)
            {
                data.Add(new
                {
                    sno = index,
                    actionTaker = item.ActionTaker,
                    actionTaken = item.ActionTaken!,
                    actionTakenOn = item.ActionTakenDate,
                });
                index++;
            }

            if ((string)currentPlayer!["status"]! == "pending")
            {
                data.Add(new
                {
                    sno = index,
                    actionTaker = currentPlayer["designation"],
                    actionTaken = currentPlayer["status"],
                    actionTakenOn = "",
                });
            }

            return Json(new { data, columns, customActions = new { } });
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

        public dynamic GetFormattedValue(dynamic item, dynamic data)
        {
            var values = new List<object>();
            foreach (var key in item.Fields)
            {
                // If GetValue is true and the key requires a lookup (e.g. District or Tehsil), get the looked‑up value.
                // Otherwise, simply grab the raw value from data.
                string fieldValue = (item.GetValue != null && item.GetValue == true &&
                                     (key.Contains("District") || key.Contains("Tehsil")))
                    ? GetStringValue(key, data)
                    : data[key];
                values.Add(fieldValue);
            }

            // If a TransformString template is provided, format it with all values;
            // otherwise, return the first value's string representation.
            string formattedValue = item.TransformString != null
                   ? string.Format(item.TransformString, values.ToArray())
                   : (values.FirstOrDefault()?.ToString() ?? "");

            // Note: fix the typo here: use item.Label, not item.Lable.
            return new { Label = item.Label, Value = formattedValue };
        }

        public string GetStringValue(string fieldName, dynamic data)
        {
            int value = Convert.ToInt32(data[fieldName]);
            if (fieldName.Contains("District"))
                return dbcontext.Districts.FirstOrDefault(d => d.DistrictId == value)!.DistrictName!;
            else if (fieldName.Contains("Tehsil"))
                return dbcontext.Tehsils.FirstOrDefault(t => t.TehsilId == value)!.TehsilName!;
            else
                return "Unknown Value";
        }


        private dynamic FetchAcknowledgementDetails(string applicationId)
        {


            var acknowledgement = new dynamic[]
            {
                    new
                    {
                        Fields = new List<string> { "RelationName", "Relation" },
                        Label = "PARENTAGE",
                        TransformString = "{0} ({1})",
                        GetValue = (bool?)null
                    },
                    new
                    {
                        Fields = new List<string> { "PensionType" },
                        Label = "PENSION TYPE",
                        TransformString = (string)null!,
                        GetValue = (bool?)null
                    },
                    new
                    {
                        Fields = new List<string> { "District" },
                        Label = "APPLIED DISTRICT",
                        TransformString = (string)null!,
                        GetValue = true
                    },
                    new
                    {
                        Fields = new List<string> { "BankName" },
                        Label = "BANK NAME",
                        TransformString = (string)null!,
                        GetValue = (bool?)null
                    },
                    new
                    {
                        Fields = new List<string> { "AccountNumber" },
                        Label = "ACCOUNT NUMBER",
                        TransformString = (string)null!,
                        GetValue = (bool?)null
                    },
                    new
                    {
                        Fields = new List<string> { "IfscCode" },
                        Label = "IFSC CODE",
                        TransformString = (string)null!,
                        GetValue = (bool?)null
                    },
                    new
                    {
                        Fields = new List<string> { "PresentAddress", "PresentTehsil", "PresentDistrict", "PresentPincode" },
                        Label = "Present Address",
                        TransformString = "{0}  TEHSIL:{2} DISTRICT:{1} PINCODE:{3}",
                        GetValue = true
                    },
                    new
                    {
                        Fields = new List<string> { "PermanentAddress","PermanentTehsil", "PermanentDistrict",  "PermanentPincode" },
                        Label = "Permanent Address",
                        TransformString = "{0}  TEHSIL:{2} DISTRICT:{1} PINCODE:{3}",
                        GetValue = true
                    }
            };

            var details = dbcontext.CitizenApplications
                            .FirstOrDefault(ca => ca.ReferenceNumber == applicationId);
            var data = JsonConvert.DeserializeObject<dynamic>(details!.FormDetails!);

            var acknowledgementDetails = new OrderedDictionary()
            {
                { "REFERENCE NUMBER", details.ReferenceNumber}
            }
            ;

            foreach (var item in acknowledgement)
            {
                dynamic obj = GetFormattedValue(item, data);
                acknowledgementDetails.Add(obj.Label, obj.Value);
            }

            acknowledgementDetails.Insert(7, "DATE OF SUBMISSION", details.CreatedAt!);

            _pdfService.CreateAcknowledgement(acknowledgementDetails, applicationId);

            string path = "files/" + applicationId.Replace("/", "_") + "Acknowledgement.pdf";

            return new { path };
        }

        // public IActionResult GetEditForm(string applicationId)
        // {
        //     var application = dbcontext.Applications.FirstOrDefault(app => app.ApplicationId == applicationId);
        //     var editList = JsonConvert.DeserializeObject<string[]>(application!.EditList);
        //     var serviceSpecific = JsonConvert.DeserializeObject<dynamic>(application.ServiceSpecific);
        //     var service = dbcontext.Services.FirstOrDefault(s => s.ServiceId == application.ServiceId);
        //     var formElements = JsonConvert.DeserializeObject<dynamic>(service!.FormElement!);
        //     List<dynamic> EditFields = [];
        //     foreach (var element in formElements!)
        //     {
        //         var fields = element.fields;
        //         foreach (var field in fields)
        //         {
        //             string fieldName = field.name.ToString();
        //             string value = "";
        //             if (editList!.Contains(fieldName))
        //             {
        //                 if (application.GetType().GetProperty(fieldName) != null)
        //                     value = application.GetType().GetProperty(fieldName)!.GetValue(application)!.ToString()!;
        //                 else
        //                     value = serviceSpecific![fieldName];

        //                 field["value"] = value;
        //                 EditFields.Add(field);
        //             }
        //         }
        //     }



        //     return Json(new { EditFields });
        // }

        public static bool HasProperty<T>(string propertyName)
        {
            return typeof(T).GetProperty(propertyName) != null;
        }
    }
}
