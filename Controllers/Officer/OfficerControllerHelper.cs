using System.Text;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using ReactMvcApp.Models.Entities;

namespace ReactMvcApp.Controllers.Officer
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


    }
}