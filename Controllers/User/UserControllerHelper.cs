using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.Differencing;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using ReactMvcApp.Models.Entities;
using System.Collections.Specialized;
using System.Security.Claims;
using System.Text;
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
                .Where(u => u.CitizenId.ToString() == userId && u.Status != "Incomplete")
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
        public string GetDistrictName(int districtId)
        {
            string? districtName = dbcontext.Districts.FirstOrDefault(d => d.DistrictId == districtId)!.DistrictName;
            return districtName!;
        }

        [HttpGet]
        public string GetTehsilName(int tehsilId)
        {
            string? tehsilName = dbcontext.Tehsils.FirstOrDefault(d => d.TehsilId == tehsilId)!.TehsilName;
            return tehsilName!;
        }

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
                    actionTaken = item.ActionTaken! == "ReturnToCitizen" ? "Returned for correction" : item.ActionTaken,
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
        // public dynamic GetFormattedValue(dynamic item, dynamic data)
        // {
        //     var values = new List<object>();
        //     foreach (var key in item.Fields)
        //     {
        //         // If GetValue is true and the key requires a lookup (e.g. District or Tehsil), get the looked‑up value.
        //         // Otherwise, simply grab the raw value from data.
        //         string fieldValue = (item.GetValue != null && item.GetValue == true &&
        //                              (key.Contains("District") || key.Contains("Tehsil")))
        //             ? GetStringValue(key, data)
        //             : GetFieldValue(key, data);
        //         values.Add(fieldValue);
        //     }

        //     // If a TransformString template is provided, format it with all values;
        //     // otherwise, return the first value's string representation.
        //     string formattedValue = item.TransformString != null
        //            ? string.Format(item.TransformString, values.ToArray())
        //            : (values.FirstOrDefault()?.ToString() ?? "");

        //     // Note: fix the typo here: use item.Label, not item.Lable.
        //     return new { Label = item.Label, Value = formattedValue };
        // }

        private dynamic GetFormattedValue(dynamic item, JObject data)
        {
            if (item == null)
                return new { Label = "[No Label]", Value = "[Item is null]" };

            string label = item.label?.ToString() ?? "[No Label]";
            string fmt = item.transformString?.ToString() ?? "{0}";

            // If there's no {n} at all, return static
            if (!Regex.IsMatch(fmt, @"\{\d+\}"))
                return new { Label = label, Value = fmt };

            // 1) Build rawValues (recursive lookup + District/Tehsil)
            var rawValues = (item.selectedFields as IEnumerable<object> ?? Enumerable.Empty<object>())
                .Select(sf =>
                {
                    var name = sf?.ToString() ?? "";
                    if (string.IsNullOrWhiteSpace(name)) return "";
                    var fieldObj = FindFieldRecursively(data, name);
                    return fieldObj == null ? ""
                           : ExtractValueWithSpecials(fieldObj, name);
                })
                .ToList();

            // 2) Find highest non-empty index
            int lastIndex = rawValues.FindLastIndex(v => !string.IsNullOrWhiteSpace(v));
            if (lastIndex < 0)
                return new { Label = label, Value = "" };

            // 3) Tokenize into placeholders and literals
            var tokens = Regex.Split(fmt, @"(\{\d+\})").ToList();

            // 4) Find the first placeholder whose index > lastIndex
            int badTokenIdx = tokens
                .Select((tok, idx) => new { tok, idx })
                .FirstOrDefault(x =>
                {
                    var m = Regex.Match(x.tok, @"\{(\d+)\}");
                    return m.Success && int.Parse(m.Groups[1].Value) > lastIndex;
                })
                ?.idx ?? tokens.Count;

            // 5) Collect tokens up to badTokenIdx
            var kept = tokens.Take(badTokenIdx).ToList();

            // 6) If the last kept token is a literal and contains ')', trim it at the first ')'
            if (kept.Count > 0 && !Regex.IsMatch(kept.Last(), @"\{\d+\}"))
            {
                var lit = kept.Last();
                int p = lit.IndexOf(')');
                if (p >= 0)
                    kept[kept.Count - 1] = lit.Substring(0, p + 1);
            }

            // 7) Now rebuild, replacing placeholders {i} <= lastIndex
            var sb = new StringBuilder();
            foreach (var tok in kept)
            {
                var m = Regex.Match(tok, @"\{(\d+)\}");
                if (m.Success)
                {
                    int idx = int.Parse(m.Groups[1].Value);
                    sb.Append(idx <= lastIndex ? rawValues[idx] : "");
                }
                else
                {
                    sb.Append(tok);
                }
            }

            var result = sb.ToString().TrimEnd();
            return new { Label = label, Value = result };
        }

        // Recursive search for a JObject with ["name"] == fieldName
        private JObject? FindFieldRecursively(JToken token, string fieldName)
        {
            if (token is JObject obj)
            {
                if (obj["name"]?.ToString() == fieldName) return obj;
                foreach (var prop in obj.Properties())
                    if (FindFieldRecursively(prop.Value, fieldName) is JObject found)
                        return found;
            }
            else if (token is JArray arr)
            {
                foreach (var el in arr)
                    if (FindFieldRecursively(el, fieldName) is JObject found)
                        return found;
            }
            return null;
        }

        // Extracts the string value (or does District/Tehsil lookups)
        private string ExtractValueWithSpecials(JObject fieldObj, string fieldName)
        {
            var tok = fieldObj["value"] ?? fieldObj["File"] ?? fieldObj["Enclosure"];
            if (tok == null) return "";

            var s = tok.ToString();
            if (fieldName.Contains("District", StringComparison.OrdinalIgnoreCase)
             && int.TryParse(s, out int did))
                return GetDistrictName(did);

            if (fieldName.Contains("Tehsil", StringComparison.OrdinalIgnoreCase)
             && int.TryParse(s, out int tid))
                return GetTehsilName(tid);

            return s;
        }



        public string GetStringValue(string fieldName, dynamic data)
        {
            foreach (var section in data)
            {
                if (section.First is JArray fields)
                {
                    foreach (var field in fields)
                    {
                        if (field["name"] != null && field["name"]?.ToString() == fieldName)
                        {
                            int value = Convert.ToInt32(field["value"]);

                            if (fieldName.Contains("District"))
                                return dbcontext.Districts.FirstOrDefault(d => d.DistrictId == value)?.DistrictName ?? "Unknown District";

                            else if (fieldName.Contains("Tehsil"))
                                return dbcontext.Tehsils.FirstOrDefault(t => t.TehsilId == value)?.TehsilName ?? "Unknown Tehsil";

                            else
                                return "Unknown Value";
                        }
                    }
                }
            }
            return "Unknown Value";
        }

        public dynamic GetSanctionDetails(string applicationId, string serviceId)
        {
            var formdetails = dbcontext.CitizenApplications.FirstOrDefault(fd => fd.ReferenceNumber == applicationId);
            // Get the Letters JSON string
            var lettersJson = dbcontext.Services
                         .FirstOrDefault(s => s.ServiceId == Convert.ToInt32(formdetails!.ServiceId))?.Letters;

            var parsed = JsonConvert.DeserializeObject<Dictionary<string, dynamic>>(lettersJson!);
            var sanctionSection = parsed!.TryGetValue("Sanction", out dynamic sanction) ? sanction : null;
            var tableFields = sanctionSection!.tableFields;
            var sanctionLetterFor = sanctionSection.sanctionLetterFor;

            var details = dbcontext.CitizenApplications
                .FirstOrDefault(ca => ca.ReferenceNumber == applicationId);


            var formData = JsonConvert.DeserializeObject<JObject>(details!.FormDetails!);

            // Final key-value pair list for the PDF
            var pdfFields = new Dictionary<string, string>();

            foreach (var item in tableFields)
            {
                var formatted = GetFormattedValue(item, formData);
                string label = formatted.Label ?? "[Label Missing]";
                string value = formatted.Value ?? "";

                pdfFields[label] = value;
            }
            return Json(new { success = true, sanctionDetails = pdfFields });
        }


        private dynamic FetchAcknowledgementDetails(string applicationId)
        {
            // 1) Load the application record
            var details = dbcontext.CitizenApplications
                .FirstOrDefault(ca => ca.ReferenceNumber == applicationId)
                ?? throw new InvalidOperationException("Application not found.");

            // 2) Load and parse the Letters JSON from the related service
            var lettersJson = dbcontext.Services
                .FirstOrDefault(s => s.ServiceId == Convert.ToInt32(details.ServiceId))?.Letters;

            if (lettersJson is null)
                throw new InvalidOperationException("No letters JSON configured for this service.");

            var parsedLetters = JsonConvert.DeserializeObject<Dictionary<string, dynamic>>(lettersJson!)
                ?? throw new InvalidOperationException("Letters JSON parsing failed.");

            // 3) Get the Acknowledgement section
            if (!parsedLetters.TryGetValue("Acknowledgement", out dynamic ackSection))
                throw new InvalidOperationException("Acknowledgement section missing in Letters JSON.");

            var tableFields = (IEnumerable<dynamic>)ackSection.tableFields;

            // 4) Deserialize the form data for field lookup
            var formData = JsonConvert.DeserializeObject<JObject>(details.FormDetails!)
                ?? throw new InvalidOperationException("Form details parsing failed.");

            // 5) Build the key-value list for the PDF
            var acknowledgementDetails = new OrderedDictionary();



            // Add all fields from tableFields config (replace if duplicate keys)
            foreach (var fieldConfig in tableFields)
            {
                var formatted = GetFormattedValue(fieldConfig, formData);
                acknowledgementDetails[formatted.Label] = formatted.Value;
            }

            // Add Reference Number explicitly
            acknowledgementDetails["REFERENCE NUMBER"] = details.ReferenceNumber;

            // Add Date of Submission explicitly (replace if duplicate key)
            acknowledgementDetails["DATE OF SUBMISSION"] = details.CreatedAt?.ToString() ?? string.Empty;

            // 6) Generate the PDF
            _pdfService.CreateAcknowledgement(acknowledgementDetails, applicationId);

            // 7) Return the file path
            string fileName = applicationId.Replace("/", "_") + "Acknowledgement.pdf";
            string path = $"files/{fileName}";

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
