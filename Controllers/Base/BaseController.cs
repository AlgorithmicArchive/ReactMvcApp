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
using Wangkanai.Detection.Services;

namespace SahayataNidhi.Controllers
{
    public partial class BaseController(SocialWelfareDepartmentContext dbcontext, ILogger<BaseController> logger, IDetectionService detection) : Controller
    {
        protected readonly SocialWelfareDepartmentContext dbcontext = dbcontext;
        protected readonly ILogger<BaseController> _logger = logger;
        private readonly IDetectionService _detection = detection;

        private const long MinImageFile = 20 * 1024;  // 20KB
        private const long MaxImageFile = 50 * 1024;  // 50KB
        private const long MinPdfFile = 100 * 1024; // 100KB
        private const long MaxPdfFile = 200 * 1024; // 200KB





        [HttpPost]
        public IActionResult SaveTableSettings([FromForm] IFormCollection form)
        {
            string storageKey = form["storageKey"].ToString(); // ✅ fixed typo
            string storageValue = form["storageValue"].ToString();

            var userId = Convert.ToInt32(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var userDetails = dbcontext.Users.FirstOrDefault(u => u.UserId == userId);

            if (userDetails == null || string.IsNullOrWhiteSpace(userDetails.AdditionalDetails))
            {
                return BadRequest("User not found or AdditionalDetails is empty.");
            }

            // Parse AdditionalDetails as JSON
            var additionalDetails = JObject.Parse(userDetails.AdditionalDetails);

            if (additionalDetails.TryGetValue("TableSettings", out JToken? tableSettingsToken) &&
                tableSettingsToken is JObject tableSettings)
            {
                // Update or add the key
                tableSettings[storageKey] = JsonConvert.DeserializeObject<dynamic>(storageValue);
            }
            else
            {
                // Create new TableSettings section
                additionalDetails["TableSettings"] = new JObject
                {
                    [storageKey] = storageValue
                };
            }

            // ✅ Important: Save updated JSON back to user object
            userDetails.AdditionalDetails = additionalDetails.ToString();

            // Persist changes
            dbcontext.SaveChanges();

            return Json(new { status = true });
        }

        [HttpPost]
        public IActionResult ExportData([FromForm] IFormCollection form)
        {
            try
            {
                string? columnOrder = form["columnOrder"];
                string? columnVisibility = form["columnVisibility"];
                string? scope = form["scope"];
                string? format = form["format"];
                int pageIndex = Convert.ToInt32(form["pageIndex"]);
                int pageSize = Convert.ToInt32(form["pageSize"]);
                int ServiceId = Convert.ToInt32(form["ServiceId"]);
                string? type = form["type"];
                string? function = form["function"];

                dynamic? result = null;
                if (function == "GetApplications")
                {
                    result = JsonConvert.DeserializeObject<dynamic>(GetApplications(scope, columnOrder, columnVisibility, ServiceId, type, pageIndex, pageSize));
                }
                else if (function == "GetInitiatedApplications")
                {
                    result = JsonConvert.DeserializeObject<dynamic>(GetInitiatedApplications(scope, columnOrder, columnVisibility, pageIndex, pageSize));
                }

                if (result == null)
                {
                    _logger.LogError("No data returned from GetApplications.");
                    return Json(new { status = false, error = "No data available." });
                }

                var obj = result!["Value"];
                var data = obj["data"];
                var columns = obj["columns"]; // Note: Changed from "column" to match typical JSON structure


                // Deserialize columns and columnOrder for processing
                var columnList = JsonConvert.DeserializeObject<List<Dictionary<string, string>>>(columns.ToString());
                var dataList = JsonConvert.DeserializeObject<List<Dictionary<string, object>>>(data.ToString());

                // Generate file based on format
                string fileName = $"Report_{scope}_{DateTime.Now:yyyyMMdd_HHmmss}";
                byte[] fileBytes;
                string contentType;

                switch (format?.ToLower())
                {
                    case "excel":
                        fileBytes = GenerateExcel(dataList, columnList);
                        contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                        fileName += ".xlsx";
                        break;
                    case "csv":
                        fileBytes = GenerateCsv(dataList, columnList);
                        contentType = "text/csv";
                        fileName += ".csv";
                        break;
                    case "pdf":
                        fileBytes = GeneratePdf(dataList, columnList);
                        contentType = "application/pdf";
                        fileName += ".pdf";
                        break;
                    default:
                        _logger.LogError($"Invalid format: {format}");
                        return Json(new { status = false, error = "Invalid format specified." });
                }

                return File(fileBytes, contentType, fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating export file.");
                return Json(new { status = false, error = $"Error generating file: {ex.Message}" });
            }
        }



    }
}