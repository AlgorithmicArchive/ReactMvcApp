using System.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using ReactMvcApp.Models.Entities;
using System.Security.Claims;
using Newtonsoft.Json.Linq;

namespace ReactMvcApp.Controllers.User
{
    public partial class UserController
    {
        [HttpPost]
        public async Task<IActionResult> InsertFormDetails([FromForm] IFormCollection form)
        {

            // Retrieve userId from JWT token
            int userId = Convert.ToInt32(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            int serviceId = Convert.ToInt32(form["serviceId"].ToString());
            string formDetailsJson = form["formDetails"].ToString();
            string status = form["status"].ToString();
            string referenceNumber = form["referenceNumber"].ToString();


            var formDetailsObj = JObject.Parse(formDetailsJson);

            // Flatten all sections into a single collection of fields.
            var allFields = formDetailsObj.Properties()
                .Where(prop => prop.Value is JArray)
                .SelectMany(prop => (JArray)prop.Value)
                .OfType<JObject>();

            // Process each file.
            foreach (var file in form.Files)
            {
                string filePath = await helper.GetFilePath(file)!;
                foreach (var field in allFields.Where(f => f["name"]?.ToString() == file.Name))
                {
                    field["File"] = filePath;
                }
            }


            // Here we look for any key that contains "District" (case-insensitive) and try to parse its value as an integer.
            int districtId = 0;
            districtId = formDetailsObj.Properties()
            .SelectMany(section => section.Value is JArray fields
                ? fields.OfType<JObject>()
                : [])
            .Where(field => field["name"]?.ToString() == "District")
            .Select(field => Convert.ToInt32(field["value"]))
            .FirstOrDefault();


            if (string.IsNullOrEmpty(referenceNumber))
            {
                int count = GetCountPerDistrict(districtId, serviceId);
                var service = dbcontext.Services.FirstOrDefault(s => s.ServiceId == serviceId);
                string? districtShort = dbcontext.Districts.FirstOrDefault(s => s.DistrictId == districtId)!.DistrictShort;
                var workFlow = service!.OfficerEditableField;

                // Update the first player's status to "pending" if workflow is not null/empty.
                if (!string.IsNullOrEmpty(workFlow))
                {
                    var players = JArray.Parse(workFlow);
                    if (players.Count > 0)
                    {
                        players[0]["status"] = "pending";
                    }
                    workFlow = players.ToString(Formatting.None);
                }

                var finYear = helper.GetCurrentFinancialYear();
                referenceNumber = "JK-" + service.NameShort + "-" + districtShort + "/" + finYear + "/" + count;
                var createdAt = DateTime.Now.ToString("dd MMM yyyy hh:mm:ss tt");

                // Store the updated JSON (with file paths) in the database.
                var newFormDetails = new CitizenApplication
                {
                    ReferenceNumber = referenceNumber,
                    CitizenId = userId,
                    ServiceId = serviceId,
                    FormDetails = formDetailsObj.ToString(),
                    WorkFlow = workFlow!,
                    Status = status,
                    CreatedAt = createdAt
                };

                dbcontext.CitizenApplications.Add(newFormDetails);
            }
            else
            {
                var application = dbcontext.CitizenApplications.FirstOrDefault(a => a.ReferenceNumber == referenceNumber);
                application!.FormDetails = formDetailsObj.ToString();

                if (application.Status != status)
                {
                    application.Status = status;
                }
                application.CreatedAt = DateTime.Now.ToString("dd MMM yyyy hh:mm:ss tt");
            }

            dbcontext.SaveChanges();

            if (status == "Initiated")
            {
                var getServices = dbcontext.WebServices.FirstOrDefault(ws => ws.ServiceId == serviceId && ws.IsActive);
                if (getServices != null)
                {
                    var onAction = JsonConvert.DeserializeObject<List<string>>(getServices.OnAction);
                    if (onAction != null && onAction.Contains("Submission"))
                    {
                        var fieldMapObj = JObject.Parse(getServices.FieldMappings);
                        var fieldMap = MapServiceFieldsFromForm(formDetailsObj, fieldMapObj);
                        await SendApiRequestAsync(getServices.ApiEndPoint, fieldMap);
                    }
                }
                string fullPath = FetchAcknowledgementDetails(referenceNumber);
                _logger.LogInformation($"--------- Full Path :{fullPath} ------------------");
                string? fullName = GetFormFieldValue(formDetailsObj, "ApplicantName");
                string? serviceName = dbcontext.Services.FirstOrDefault(s => s.ServiceId == serviceId)!.ServiceName;
                string? email = GetFormFieldValue(formDetailsObj, "Email");
                string htmlMessage = $@"
                    <div style='font-family: Arial, sans-serif;'>
                        <h2 style='color: #2e6c80;'>Form Submission Received</h2>
                        <p>Dear {fullName},</p>
                        <p>Thank you for submitting your form. We have successfully received your submission. Below are the details:</p>
                        <ul style='line-height: 1.6;'>
                            <li><strong>Form Type:</strong> {serviceName}</li>
                            <li><strong>Submission Date:</strong> {DateTime.Now.ToString("dd MMM yyyy hh:mm:ss tt")}</li>
                            <li><strong>Reference ID:</strong> {referenceNumber}</li>
                        </ul>
                        <p>Please find the acknowledgment of your submission attached below. Kindly review it for your records.</p>
                        <p>If you have any questions or did not submit this form, please contact our support team immediately.</p>
                        <br />
                        <p style='font-size: 12px; color: #888;'>Thank you,<br />Your Application Team</p>
                    </div>";
                var attachments = new List<string> { fullPath };
                await emailSender.SendEmailWithAttachments(email!, "Form Submission", htmlMessage, attachments);
                helper.InsertHistory(referenceNumber, "Application Submission", "Citizen");
                return Json(new { status = true, referenceNumber, type = "Submit" });
            }
            else
                return Json(new { status = true, referenceNumber, type = "Save" });
        }

        [HttpPost]
        public async Task<IActionResult> UpdateApplicationDetails([FromForm] IFormCollection form)
        {
            string referenceNumber = form["referenceNumber"].ToString();
            string returnFieldsJson = form["returnFields"].ToString();

            var returnFields = JsonConvert.DeserializeObject<List<string>>(returnFieldsJson);

            // Fetch existing application
            var application = dbcontext.CitizenApplications.FirstOrDefault(a => a.ReferenceNumber == referenceNumber);
            if (application == null)
            {
                return Json(new { status = false, message = "Application not found" });
            }

            var formDetailsObj = JObject.Parse(application.FormDetails!);

            // Iterate over sections
            foreach (var section in formDetailsObj.Properties())
            {
                if (section.Value is not JArray fields) continue;

                foreach (var field in fields.OfType<JObject>())
                {
                    string fieldName = field["name"]?.ToString() ?? "";

                    if (returnFields != null && returnFields!.Contains(fieldName)) // Only update if present in returnFields
                    {
                        // Check for file fields
                        if (field.ContainsKey("File"))
                        {
                            // Delete old file if exists
                            var oldFilePath = field["File"]?.ToString();
                            if (!string.IsNullOrEmpty(oldFilePath))
                            {
                                helper.DeleteFile(oldFilePath);
                            }

                            // Add new file if uploaded
                            var file = form.Files.FirstOrDefault(f => f.Name == fieldName);
                            if (file != null)
                            {
                                string filePath = await helper.GetFilePath(file)!;
                                field["File"] = filePath;
                            }
                            else
                            {
                                field["File"] = ""; // No new file
                            }
                        }
                        else
                        {
                            // Non-file fields: update "value"
                            string newValue = form[fieldName].ToString();
                            if (field.ContainsKey("value"))
                            {
                                field["value"] = newValue;
                            }
                            if (field.ContainsKey("Enclosure"))
                            {
                                field["Enclosure"] = form[$"{fieldName}_Enclosure"].ToString(); // Assuming enclosure field naming
                            }
                        }
                    }
                }
            }

            // Save updated formDetails
            application.FormDetails = formDetailsObj.ToString();
            var workFlow = JsonConvert.DeserializeObject<dynamic>(application.WorkFlow!) as JArray;
            var currentOfficer = workFlow!.FirstOrDefault(o => (int)o["playerId"]! == application.CurrentPlayer);
            currentOfficer!["status"] = "pending";
            application.WorkFlow = JsonConvert.SerializeObject(workFlow);
            application.CreatedAt = DateTime.Now.ToString("dd MMM yyyy hh:mm:ss tt");

            dbcontext.SaveChanges();

            return Json(new { status = true, message = "Application updated successfully" });
        }


    }
}
