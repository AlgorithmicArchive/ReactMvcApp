using System.Text;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using SahayataNidhi.Models.Entities;

namespace SahayataNidhi.Controllers.Officer
{
    public partial class OfficerController : Controller
    {

        public static string FormatKey(string input)
        {
            if (string.IsNullOrEmpty(input))
                return input;

            // Use Regex to insert space before each capital letter, except for the first one
            string result = Regex.Replace(input, "(?<!^)([A-Z])", " $1");

            return result;
        }
        public string GetDistrictName(int districtId)
        {
            return dbcontext.Districts.FirstOrDefault(d => d.DistrictId == districtId)!.DistrictName!;
        }
        public string GetTehsilName(int tehsilId)
        {
            return dbcontext.Tehsils.FirstOrDefault(d => d.TehsilId == tehsilId)!.TehsilName!;
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
        public IActionResult UpdatePool(int ServiceId, string list)
        {
            var officer = GetOfficerDetails();
            var PoolList = dbcontext.Pools.FirstOrDefault(p => p.ServiceId == Convert.ToInt32(ServiceId) && p.AccessLevel == officer.AccessLevel && p.AccessCode == officer.AccessCode);
            var pool = PoolList != null && !string.IsNullOrWhiteSpace(PoolList!.List) ? JsonConvert.DeserializeObject<List<string>>(PoolList.List) : [];
            var poolList = JsonConvert.DeserializeObject<List<string>>(list);
            foreach (var item in poolList!)
            {
                pool!.Add(item);
            }

            _logger.LogInformation($"----------------POOL After ADD: {JsonConvert.SerializeObject(pool)}---------------------------");
            if (PoolList == null)
            {
                var newPool = new Pool
                {
                    ServiceId = ServiceId,
                    AccessLevel = officer.AccessLevel!,
                    AccessCode = (int)officer.AccessCode!,
                    List = JsonConvert.SerializeObject(pool)
                };
                dbcontext.Pools.Add(newPool);
            }
            else
                PoolList!.List = JsonConvert.SerializeObject(pool);

            dbcontext.SaveChanges();
            return Json(new { status = true, ServiceId, list });
        }

        public IActionResult RemoveFromPool(int ServiceId, string itemToRemove)
        {
            var officer = GetOfficerDetails();

            // Find the existing pool for this officer and service
            var poolRecord = dbcontext.Pools.FirstOrDefault(p =>
                p.ServiceId == ServiceId &&
                p.AccessLevel == officer.AccessLevel &&
                p.AccessCode == officer.AccessCode);

            if (poolRecord == null || string.IsNullOrWhiteSpace(poolRecord.List))
            {
                return Json(new { status = false, message = "No existing pool found." });
            }

            // Deserialize the current pool list
            var poolList = JsonConvert.DeserializeObject<List<string>>(poolRecord.List) ?? new List<string>();

            // Remove the specified item (case-sensitive match)
            bool removed = poolList.Remove(itemToRemove);

            if (!removed)
            {
                return Json(new { status = false, message = "Item not found in the pool." });
            }

            // Serialize and update the pool list
            poolRecord.List = JsonConvert.SerializeObject(poolList);
            dbcontext.SaveChanges();

            _logger.LogInformation($"----------------POOL After REMOVE: {JsonConvert.SerializeObject(poolList)}---------------------------");

            return Json(new { status = true, ServiceId, removedItem = itemToRemove });
        }
        [HttpPost]
        public async Task<IActionResult> UpdatePdf([FromForm] IFormCollection form)
        {
            if (form == null || !form.Files.Any() || string.IsNullOrEmpty(form["applicationId"]))
            {
                return BadRequest(new { status = false, response = "Missing form data." });
            }

            var signedPdf = form.Files["signedPdf"];
            var applicationId = form["applicationId"].ToString();

            if (signedPdf == null || signedPdf.Length == 0)
            {
                return BadRequest(new { status = false, response = "No file uploaded." });
            }

            // Construct the file path based on applicationId
            string fileName = applicationId.Replace("/", "_") + "SanctionLetter.pdf";
            string path = Path.Combine(_webHostEnvironment.WebRootPath, "files", fileName);

            // Overwrite the original file
            using (var stream = new FileStream(path, FileMode.Create))
            {
                await signedPdf.CopyToAsync(stream);
            }

            return Json(new { status = true });
        }

        private dynamic GetFormattedValue(dynamic item, JObject data)
        {
            if (item == null)
                return new { Label = "[No Label]", Value = "[Item is null]" };

            string label = item.label?.ToString() ?? "[No Label]";
            string fmt = item.transformString?.ToString() ?? "{0}";

            // If there's no {n} placeholders, return static string
            if (!Regex.IsMatch(fmt, @"\{\d+\}"))
                return new { Label = label, Value = fmt };

            // Build rawValues (recursive lookup + District/Tehsil)
            var rawValues = (item.selectedFields as IEnumerable<object> ?? Enumerable.Empty<object>())
                .Select(sf =>
                {
                    var name = sf?.ToString() ?? "";
                    if (string.IsNullOrWhiteSpace(name)) return "";
                    var fieldObj = FindFieldRecursively(data, name);
                    return fieldObj == null ? "" : ExtractValueWithSpecials(fieldObj, name);
                })
                .ToList();

            // Tokenize transformString into placeholders and literals
            var tokens = Regex.Split(fmt, @"(\{\d+\})").ToList();

            // Build the output string, processing all tokens
            var sb = new StringBuilder();
            foreach (var tok in tokens)
            {
                var m = Regex.Match(tok, @"\{(\d+)\}");
                if (m.Success)
                {
                    int idx = int.Parse(m.Groups[1].Value);
                    // Include value if index is valid and value is non-empty; otherwise, skip with empty string
                    sb.Append(idx < rawValues.Count && !string.IsNullOrWhiteSpace(rawValues[idx]) ? rawValues[idx] : "");
                }
                else
                {
                    // Append literal text
                    sb.Append(tok);
                }
            }

            var result = sb.ToString().TrimEnd();
            return new { Label = label, Value = result };
        }
        // Recursive search for a JObject with ["name"] == fieldName
        private static JObject? FindFieldRecursively(JToken token, string fieldName)
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
        [HttpGet]
        public IActionResult GetCertificateDetails()
        {
            var officer = GetOfficerDetails();
            try
            {
                var certificateDetails = dbcontext.Certificates
                    .Where(ce => ce.OfficerId == officer.UserId)
                    .Select(c => new
                    {
                        serial_number = Convert.ToHexString(c.SerialNumber!), // Convert to hex string
                        certifying_authority = c.CertifiyingAuthority,
                        expiration_date = c.ExpirationDate
                    })
                    .FirstOrDefault();

                _logger.LogInformation($"-------Certificate Details: {JsonConvert.SerializeObject(certificateDetails)}-------------------------------");

                if (certificateDetails == null)
                {
                    return NotFound(new { success = false, message = "No certificate found for this officer." });
                }

                return Json(new
                {
                    success = true,
                    certificateDetails
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching certificate details for User ID: {UserId}", officer?.UserId);
                return StatusCode(500, new { success = false, message = ex.Message });
            }
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
                            if (lookupKey.Equals("District", StringComparison.OrdinalIgnoreCase) && int.TryParse(rawValue, out int districtId))
                            {
                                actualValue = dbcontext.Districts.FirstOrDefault(d => d.DistrictId == districtId)?.DistrictName;
                            }
                            else if (lookupKey.Equals("Tehsil", StringComparison.OrdinalIgnoreCase) && int.TryParse(rawValue, out int tehsilId))
                            {
                                actualValue = dbcontext.Tswotehsils.FirstOrDefault(t => t.TehsilId == tehsilId)?.TehsilName;
                            }
                            else if (lookupKey.EndsWith("Tehsil", StringComparison.OrdinalIgnoreCase) && int.TryParse(rawValue, out int otherTehsilId))
                            {
                                actualValue = dbcontext.Tehsils.FirstOrDefault(t => t.TehsilId == otherTehsilId)?.TehsilName;
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

        public JToken ReorderFormDetails(JToken formDetailsToken)
        {
            if (formDetailsToken is not JObject formDetailsObject)
                return formDetailsToken; // If not an object, return as is

            if (!formDetailsObject.ContainsKey("Location") || !formDetailsObject.ContainsKey("Applicant Details"))
                return formDetailsToken; // If required keys are missing, return as is

            // Extract and remove the desired sections
            var locationSection = formDetailsObject.Property("Location");
            var applicantSection = formDetailsObject.Property("Applicant Details");

            locationSection?.Remove();
            applicantSection?.Remove();

            // Create new JObject with reordered properties
            JObject reordered = new JObject
    {
        { "Location", locationSection!.Value },
        { "Applicant Details", applicantSection!.Value }
    };

            // Add the rest of the sections in their original order
            foreach (var prop in formDetailsObject.Properties())
            {
                if (prop.Name != "Location" && prop.Name != "Applicant Details")
                {
                    reordered.Add(prop.Name, prop.Value);
                }
            }

            return reordered;
        }

        private static string FormatSectionKey(string key)
        {
            if (string.IsNullOrEmpty(key)) return key;

            // Convert camelCase to Title Case with spaces
            var result = Regex.Replace(key, "([a-z])([A-Z])", "$1 $2");
            return System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(result);
        }

        // Helper method to format field labels
        private static string FormatFieldLabel(string label)
        {
            if (string.IsNullOrEmpty(label)) return label;

            // Ensure proper formatting for labels
            return label.EndsWith(":") ? label : $"{label}:";
        }

        // Helper method to convert values for display (similar to your existing logic)
        private string ConvertValueForDisplay(string label, string value)
        {
            if (string.IsNullOrEmpty(value)) return value;

            // Convert integer values for District and Tehsil fields
            if (label.Contains("District", StringComparison.OrdinalIgnoreCase) && int.TryParse(value, out int districtId))
            {
                return GetDistrictName(districtId);
            }
            else if (label.Contains("Tehsil", StringComparison.OrdinalIgnoreCase) && int.TryParse(value, out int tehsilId))
            {
                return GetTehsilName(tehsilId);
            }
            else if (label.Contains("Muncipality", StringComparison.OrdinalIgnoreCase) && int.TryParse(value, out int muncipalityId))
            {
                return dbcontext.Muncipalities.FirstOrDefault(m => m.MuncipalityId == muncipalityId)!.MuncipalityName!;
            }
            else if (label.Contains("Block", StringComparison.OrdinalIgnoreCase) && int.TryParse(value, out int BlockId))
            {
                return dbcontext.Blocks.FirstOrDefault(m => m.BlockId == BlockId)!.BlockName!;
            }
            else if (label.Contains("Ward", StringComparison.OrdinalIgnoreCase) && int.TryParse(value, out int WardId))
            {
                return dbcontext.Wards.FirstOrDefault(m => m.WardCode == WardId)!.WardNo.ToString()!;
            }
            else if (label.Contains("Village", StringComparison.OrdinalIgnoreCase) && int.TryParse(value, out int VillageId))
            {
                return dbcontext.Villages.FirstOrDefault(m => m.VillageId == VillageId)!.VillageName!;
            }

            return value;
        }

        public string GetOfficerArea(string designation, dynamic formDetails)
        {
            var officerDesignation = dbcontext.OfficersDesignations
                .FirstOrDefault(od => od.Designation == designation);

            if (officerDesignation == null)
                return string.Empty;

            string accessLevel = officerDesignation.AccessLevel ?? string.Empty;
            int accessCode;

            switch (accessLevel)
            {
                case "Tehsil":
                    accessCode = Convert.ToInt32(GetFieldValue("Tehsil", formDetails));
                    var tehsil = dbcontext.Tswotehsils.FirstOrDefault(t => t.TehsilId == accessCode);
                    return tehsil?.TehsilName ?? string.Empty;

                case "District":
                    accessCode = Convert.ToInt32(GetFieldValue("District", formDetails));
                    var district = dbcontext.Districts.FirstOrDefault(d => d.DistrictId == accessCode);
                    return district?.DistrictName ?? string.Empty;

                case "Division":
                    accessCode = Convert.ToInt32(GetFieldValue("District", formDetails));
                    var districtForDivision = dbcontext.Districts.FirstOrDefault(d => d.DistrictId == accessCode);
                    if (districtForDivision == null)
                        return string.Empty;
                    return districtForDivision.Division == 1 ? "Jammu" : "Kashmir";
                case "State":
                    return "J&K";
                default:
                    return string.Empty;
            }
        }


        private void UpdateOfficerActionFormLabels(JObject officerClone, dynamic formDetails)
        {
            // Extract officer roles (from Users table's JSON AdditionalDetails field)
            // Step 1: Pull data to memory (client-side)
            var officerRoles = dbcontext.Users
                .Where(u => u.UserType == "Officer" && u.AdditionalDetails != null)
                .AsEnumerable() // Forces evaluation on the client side
                .Select(u => JsonConvert.DeserializeObject<Dictionary<string, string>>(u.AdditionalDetails!))
                .Where(details => details != null && details.ContainsKey("Role"))
                .Select(details => details!["Role"])
                .Distinct()
                .ToList();


            if (officerClone.TryGetValue("actionForm", out var actionFormToken) && actionFormToken is JArray actionFormArray)
            {
                foreach (var field in actionFormArray.Children<JObject>())
                {
                    if (field.TryGetValue("options", out var optionsToken) && optionsToken is JArray optionsArray)
                    {
                        foreach (var option in optionsArray.Children<JObject>())
                        {
                            string? label = option["label"]?.ToString();
                            if (string.IsNullOrWhiteSpace(label)) continue;

                            foreach (var role in officerRoles)
                            {
                                if (label.Contains(role!, StringComparison.OrdinalIgnoreCase))
                                {
                                    string area = GetOfficerArea(role, formDetails);
                                    option["label"] = $"{label} {area}";
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }

        private void ReplaceCodeFieldsWithNames(JToken formDetails)
        {
            var lookupMap = new Dictionary<string, Func<int, string>>
            {
                { "District", GetDistrictName },
                { "Tehsil", id=>dbcontext.Tswotehsils.FirstOrDefault(t => t.TehsilId == id)?.TehsilName ?? "" },
                { "PresentTehsil", id => dbcontext.Tehsils.FirstOrDefault(t => t.TehsilId == id)?.TehsilName ?? "" },
                { "PermanentTehsil", id => dbcontext.Tehsils.FirstOrDefault(t => t.TehsilId == id)?.TehsilName ?? "" },
                { "Muncipality", id => dbcontext.Muncipalities.FirstOrDefault(m => m.MuncipalityId == id)?.MuncipalityName ?? "" },
                { "Block", id => dbcontext.Blocks.FirstOrDefault(m => m.BlockId == id)?.BlockName ?? "" },
                { "HalqaPanchayat", id => dbcontext.HalqaPanchayats.FirstOrDefault(m => m.HalqaPanchayatId == id)?.HalqaPanchayatName ?? "" },
                { "Village", id => dbcontext.Villages.FirstOrDefault(m => m.VillageId == id)?.VillageName ?? "" },
                { "WardNo", id => dbcontext.Wards.FirstOrDefault(w => w.WardCode == id)?.WardNo.ToString() ?? "" }
            };

            foreach (var section in formDetails.Children<JProperty>())
            {
                foreach (var fieldToken in section.Value.Children<JObject>())
                {
                    ProcessField(fieldToken, lookupMap);

                    if (fieldToken["additionalFields"] is JArray additionalFields)
                    {
                        foreach (var additional in additionalFields.OfType<JObject>())
                            ProcessField(additional, lookupMap);
                    }
                }
            }
        }

        private static void ProcessField(JObject field, Dictionary<string, Func<int, string>> lookupMap)
        {
            var name = field["name"]?.ToString() ?? "";
            var valueStr = field["value"]?.ToString();

            if (!int.TryParse(valueStr, out int code)) return;

            foreach (var key in lookupMap.Keys)
            {
                if (name.EndsWith(key, StringComparison.OrdinalIgnoreCase))
                {
                    field["value"] = lookupMap[key](code);
                    break;
                }
            }
        }

        public string GetOfficerAreaForHistory(string accessLevel, int? accessCode)
        {


            switch (accessLevel)
            {
                case "Tehsil":
                    var tehsil = dbcontext.Tswotehsils.FirstOrDefault(t => t.TehsilId == accessCode);
                    return tehsil?.TehsilName ?? string.Empty;

                case "District":
                    var district = dbcontext.Districts.FirstOrDefault(d => d.DistrictId == accessCode);
                    return district?.DistrictName ?? string.Empty;

                case "Division":
                    var districtForDivision = dbcontext.Districts.FirstOrDefault(d => d.DistrictId == accessCode);
                    if (districtForDivision == null)
                        return string.Empty;
                    return districtForDivision.Division == 1 ? "Jammu" : "Kashmir";
                case "State":
                    return "J&K";
                default:
                    return string.Empty;
            }
        }
        private void FormatDateFields(JToken formDetails)
        {
            foreach (var section in formDetails.Children<JProperty>())
            {
                foreach (var field in section.Value.Children<JObject>())
                {
                    TryFormatDate(field);

                    if (field["additionalFields"] is JArray additionalFields)
                    {
                        foreach (var additional in additionalFields.OfType<JObject>())
                            TryFormatDate(additional);
                    }
                }
            }
        }

        private static void TryFormatDate(JObject field)
        {
            if (DateTime.TryParse(field["value"]?.ToString(), out DateTime dt))
            {
                field["value"] = dt.ToString("dd MMM yyyy");
            }
        }

        private static void UpdateWorkflowFlags(JArray officerArray, int currentPlayerId)
        {
            var previousOfficer = officerArray
                .FirstOrDefault(o => (int)o["playerId"]! == (currentPlayerId - 1));

            var nextOfficer = officerArray
                .FirstOrDefault(o => (int)o["playerId"]! == (currentPlayerId + 1));

            if (previousOfficer != null)
                previousOfficer["canPull"] = false;

            if (nextOfficer != null)
                nextOfficer["canPull"] = false;
        }
        private void InjectEditableActionForm(JObject currentOfficerClone, Service? serviceDetails, int currentPlayer)
        {
            if (string.IsNullOrWhiteSpace(serviceDetails?.OfficerEditableField))
                return;

            var editableFields = JsonConvert.DeserializeObject<List<JObject>>(serviceDetails.OfficerEditableField);
            int playerId = (int)currentOfficerClone["playerId"]!;

            var match = editableFields?.FirstOrDefault(f => (int)f["playerId"]! == playerId);
            if (match != null && match["actionForm"] != null)
            {
                currentOfficerClone["actionForm"] = match["actionForm"];
            }
        }

    }
}