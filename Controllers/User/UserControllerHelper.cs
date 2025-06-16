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
            string fileName = ApplicationId.Replace("/", "_") + "Acknowledgement.pdf";
            string path = $"files/{fileName}";

            string fullPath = path;

            return Json(new { fullPath });
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
            dynamic? sanctionSection = parsed!.TryGetValue("Sanction", out var sanction) ? sanction : null;
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

        private string FetchAcknowledgementDetails(string applicationId)
        {
            // 1) Load the application record
            var details = dbcontext.CitizenApplications
                .FirstOrDefault(ca => ca.ReferenceNumber == applicationId)
                ?? throw new InvalidOperationException("Application not found.");

            // 2) Load and parse the Letters JSON from the related service
            var lettersJson = (dbcontext.Services
                .FirstOrDefault(s => s.ServiceId == Convert.ToInt32(details.ServiceId))?.Letters) ?? throw new InvalidOperationException("No letters JSON configured for this service.");
            var parsedLetters = JsonConvert.DeserializeObject<Dictionary<string, dynamic>>(lettersJson!)
                ?? throw new InvalidOperationException("Letters JSON parsing failed.");

            // 3) Get the Acknowledgement section
            if (!parsedLetters.TryGetValue("Acknowledgement", out var ackSection))
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

            string fullPath = Path.Combine(_webHostEnvironment.ContentRootPath, "wwwroot", path);


            return fullPath;
        }

        private JObject MapServiceFieldsFromForm(JObject formDetailsObj, JObject fieldMapping)
        {
            var formValues = new Dictionary<string, string>();

            // Step 1: Extract form field values
            foreach (var section in formDetailsObj.Properties())
            {
                if (section.Value is JArray fieldsArray)
                {
                    foreach (JObject field in fieldsArray)
                    {
                        var name = field["name"]?.ToString();
                        var value = field["value"]?.ToString()
                                    ?? field["File"]?.ToString()
                                    ?? field["Enclosure"]?.ToString();

                        if (!string.IsNullOrEmpty(name) && value != null)
                        {
                            formValues[name] = value;
                        }
                    }
                }
            }

            // Step 2: Replace with values, and convert District/Tehsil IDs
            JObject ReplaceKeys(JObject mapping)
            {
                var result = new JObject();

                foreach (var prop in mapping.Properties())
                {
                    if (prop.Value.Type == JTokenType.Object)
                    {
                        result[prop.Name] = ReplaceKeys((JObject)prop.Value);
                    }
                    else if (prop.Value.Type == JTokenType.String)
                    {
                        string lookupKey = prop.Value.ToString();
                        string? actualValue = null;

                        if (formValues.TryGetValue(lookupKey, out var rawValue))
                        {
                            if (lookupKey.Contains("District", StringComparison.OrdinalIgnoreCase) && int.TryParse(rawValue, out int districtId))
                            {
                                actualValue = dbcontext.Districts.FirstOrDefault(d => d.DistrictId == districtId)?.DistrictName;
                            }
                            else if (lookupKey.Contains("Tehsil", StringComparison.OrdinalIgnoreCase) && int.TryParse(rawValue, out int tehsilId))
                            {
                                actualValue = dbcontext.Tehsils.FirstOrDefault(t => t.TehsilId == tehsilId)?.TehsilName;
                            }
                            else
                            {
                                actualValue = rawValue;
                            }
                        }

                        result[prop.Name] = actualValue ?? "";
                    }
                    else
                    {
                        result[prop.Name] = prop.Value;
                    }
                }

                return result;
            }

            return ReplaceKeys(fieldMapping);
        }

        // Inside your controller or a service
        private static async Task<string> SendApiRequestAsync(string url, object payload)
        {
            using (var client = new HttpClient())
            {

                var json = JsonConvert.SerializeObject(payload);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await client.PostAsync(url, content);
                response.EnsureSuccessStatusCode(); // throws if not 2xx

                return await response.Content.ReadAsStringAsync();
            }
        }

        public static bool HasProperty<T>(string propertyName)
        {
            return typeof(T).GetProperty(propertyName) != null;
        }

        private static string? GetFormFieldValue(JObject formDetailsObj, string fieldName)
        {
            foreach (var section in formDetailsObj.Properties())
            {
                if (section.Value is JArray fieldsArray)
                {
                    foreach (JObject field in fieldsArray)
                    {
                        var name = field["name"]?.ToString();
                        if (name == fieldName)
                        {
                            // Prefer value, then File, then Enclosure
                            return field["value"]?.ToString()
                                ?? field["File"]?.ToString()
                                ?? field["Enclosure"]?.ToString();
                        }
                    }
                }
            }

            return null; // not found
        }

    }
}
