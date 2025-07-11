using System.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using SahayataNidhi.Models.Entities;
using System.Security.Claims;
using Newtonsoft.Json.Linq;

namespace SahayataNidhi.Controllers.User
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
            string startingPlayer = "";
            string districtName = "";

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
                string bankUid = count.ToString("D6");
                var service = dbcontext.Services.FirstOrDefault(s => s.ServiceId == serviceId);
                var districtDetails = dbcontext.Districts.FirstOrDefault(s => s.DistrictId == districtId);
                string districtShort = districtDetails!.DistrictShort!;
                districtName = districtDetails.DistrictName!;
                var officerEditableField = service!.OfficerEditableField;

                if (string.IsNullOrEmpty(officerEditableField))
                {
                    return Json(new { status = false });
                }

                // Parse the OfficerEditableField JSON
                var players = JArray.Parse(officerEditableField);
                if (players.Count == 0)
                {
                    return Json(new { status = false });
                }

                // Create a new JArray to store filtered workflow
                var filteredWorkflow = new JArray();

                foreach (var player in players)
                {
                    // Create a new JObject with only the required fields
                    var filteredPlayer = new JObject
                    {
                        ["designation"] = player["designation"],
                        ["status"] = player["status"],
                        ["completedAt"] = player["completedAt"],
                        ["remarks"] = player["remarks"],
                        ["playerId"] = player["playerId"],
                        ["prevPlayerId"] = player["prevPlayerId"],
                        ["nextPlayerId"] = player["nextPlayerId"],
                        ["canPUll"] = player["canPull"]
                    };

                    filteredWorkflow.Add(filteredPlayer);
                }

                // Set the status of the first player to "pending"
                if (filteredWorkflow.Count > 0)
                {
                    filteredWorkflow[0]["status"] = "pending";
                    startingPlayer = filteredWorkflow[0]["designation"]?.ToString() ?? string.Empty;
                }

                var workFlow = filteredWorkflow.ToString(Formatting.None);
                var finYear = helper.GetCurrentFinancialYear();
                referenceNumber = "JK-" + service.NameShort + "-" + districtShort + "/" + finYear + "/" + count;
                var createdAt = DateTime.Now.ToString("dd MMM yyyy hh:mm:ss tt");

                // Store the updated JSON (with file paths) in the database.
                var newFormDetails = new CitizenApplication
                {
                    ReferenceNumber = referenceNumber,
                    CitizenId = userId,
                    ServiceId = serviceId,
                    DistrictUidForBank = bankUid,
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
                        try
                        {
                            var fieldMapObj = JObject.Parse(getServices.FieldMappings);
                            var fieldMap = MapServiceFieldsFromForm(formDetailsObj, fieldMapObj);
                            await SendApiRequestAsync(getServices.ApiEndPoint, fieldMap);
                        }
                        catch (Exception ex)
                        {
                            // Log the error but continue execution
                            _logger.LogError(ex, $"Failed to send API request to {getServices.ApiEndPoint} for Reference: {referenceNumber}");
                        }
                    }
                }

                string fullPath = FetchAcknowledgementDetails(referenceNumber);
                string? fullName = GetFormFieldValue(formDetailsObj, "ApplicantName");
                string? serviceName = dbcontext.Services.FirstOrDefault(s => s.ServiceId == serviceId)!.ServiceName;
                string? email = GetFormFieldValue(formDetailsObj, "Email");
                string htmlMessage = $@"
            <div style='font-family: Arial, sans-serif;'>
                <h2 style='color: #2e6c80;'>Application Submission</h2>
                <p>{fullName},</p>
                <p>Your Application has been sent succesfully in the Office of {startingPlayer} {districtName}. Below are the details:</p>
                <ul style='line-height: 1.6;'>
                    <li><strong>Service:</strong> {serviceName}</li>
                    <li><strong>Submission Date:</strong> {DateTime.Now.ToString("dd MMM yyyy hh:mm:ss tt")}</li>
                    <li><strong>Reference ID:</strong> {referenceNumber}</li>
                </ul>
                <p>Please find the acknowledgment of your submission attached below. Kindly review it for your records.</p>
                <p>If you have any questions or did not submit this form, please contact our support team immediately.</p>
                <br />
                <p style='font-size: 12px; color: #888;'>Thank you,<br />Your Application Team</p>
            </div>";
                var attachments = new List<string> { fullPath };

                try
                {
                    await emailSender.SendEmailWithAttachments(email!, "Form Submission", htmlMessage, attachments);
                }
                catch (Exception ex)
                {
                    // Log the email sending error but continue execution
                    _logger.LogError(ex, $"Failed to send email for Reference: {referenceNumber}, Email: {email}");
                }

                helper.InsertHistory(referenceNumber, "Application Submission", "Citizen", "Submitted");
                return Json(new { status = true, referenceNumber, type = "Submit" });
            }
            else
            {
                return Json(new { status = true, referenceNumber, type = "Save" });
            }
        }

        public int GetShiftedFromTo(string location)
        {
            try
            {
                var locationList = JsonConvert.DeserializeObject<List<JObject>>(location);

                int? districtValue = null;

                foreach (var item in locationList!)
                {
                    var name = item["name"]?.ToString();
                    var valueStr = item["value"]?.ToString();

                    if (string.IsNullOrEmpty(name) || string.IsNullOrEmpty(valueStr))
                        continue;

                    if (name == "Tehsil" && int.TryParse(valueStr, out int tehsil))
                    {
                        return tehsil; // Return immediately if Tehsil found
                    }

                    if (name == "District" && int.TryParse(valueStr, out int district))
                    {
                        districtValue = district; // Store District in case Tehsil not found
                    }
                }

                return districtValue ?? 0; // Return District if Tehsil wasn't found
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Failed to deserialize location JSON.");
                return -1;
            }
        }


        [HttpPost]
        public async Task<IActionResult> UpdateApplicationDetails([FromForm] IFormCollection form)
        {
            string referenceNumber = form["referenceNumber"].ToString();
            string returnFieldsJson = form["returnFields"].ToString();
            string formDetailsJson = form["formDetails"].ToString();


            var returnFields = JsonConvert.DeserializeObject<List<string>>(returnFieldsJson) ?? new List<string>();
            var submittedFormDetails = JObject.Parse(formDetailsJson);

            // Fetch existing application
            var application = dbcontext.CitizenApplications.FirstOrDefault(a => a.ReferenceNumber == referenceNumber);
            if (application == null)
            {
                return Json(new { status = false, message = "Application not found" });
            }

            var existingFormDetails = JObject.Parse(application.FormDetails ?? "{}");

            var existingLocation = existingFormDetails["Location"];
            var submittedLocation = submittedFormDetails["Location"];

            int shiftedFrom = GetShiftedFromTo(JsonConvert.SerializeObject(existingLocation!));
            int shiftedTo = GetShiftedFromTo(JsonConvert.SerializeObject(submittedLocation!));

            _logger.LogInformation($"------------ Shifted From: {shiftedFrom}  Shifted To: {shiftedTo} --------------------------");

            // Helper function to get all file fields from a JObject (including nested additionalFields)
            static HashSet<string> GetFileFields(JObject formDetails)
            {
                var fileFields = new HashSet<string>();
                foreach (var section in formDetails.Properties())
                {
                    if (section.Value is JArray fields)
                    {
                        foreach (var field in fields.OfType<JObject>())
                        {
                            if (field.ContainsKey("File") && !string.IsNullOrEmpty(field["File"]?.ToString()))
                            {
                                fileFields.Add(field["name"]?.ToString() ?? "");
                            }
                            if (field["additionalFields"] is JArray additionalFields)
                            {
                                foreach (var nestedField in additionalFields.OfType<JObject>())
                                {
                                    if (nestedField.ContainsKey("File") && !string.IsNullOrEmpty(nestedField["File"]?.ToString()))
                                    {
                                        fileFields.Add(nestedField["name"]?.ToString() ?? "");
                                    }
                                }
                            }
                        }
                    }
                }
                return fileFields;
            }

            // Get file fields from existing and submitted formDetails
            var existingFileFields = GetFileFields(existingFormDetails);
            var submittedFileFields = GetFileFields(submittedFormDetails);

            // Delete files present in existingFormDetails but not in submittedFormDetails
            foreach (var fieldName in existingFileFields.Except(submittedFileFields))
            {
                var section = existingFormDetails.Properties()
                    .Select(p => new { Name = p.Name, Fields = p.Value as JArray })
                    .FirstOrDefault(s => s.Fields?.OfType<JObject>().Any(f => f["name"]?.ToString() == fieldName) == true);
                if (section != null)
                {
                    var field = section.Fields?.OfType<JObject>().FirstOrDefault(f => f["name"]?.ToString() == fieldName);
                    var filePath = field?["File"]?.ToString();
                    if (!string.IsNullOrEmpty(filePath))
                    {
                        _logger.LogInformation($"Deleting file for removed field {fieldName}: {filePath}");
                        helper.DeleteFile(filePath);
                    }
                }
            }

            // Process new files in form.Files and update submittedFormDetails
            foreach (var section in submittedFormDetails.Properties())
            {
                if (section.Value is not JArray fields) continue;
                foreach (var field in fields.OfType<JObject>())
                {
                    string fieldName = field["name"]?.ToString() ?? "";
                    if (string.IsNullOrEmpty(fieldName)) continue;

                    if (field.ContainsKey("File") || field.ContainsKey("Enclosure"))
                    {
                        var file = form.Files.FirstOrDefault(f => f.Name == fieldName);
                        if (file != null)
                        {
                            string filePath = await helper.GetFilePath(file);
                            field["File"] = filePath;
                            _logger.LogInformation($"Updated file path for {fieldName}: {filePath}");
                        }
                        else if (field["File"]?.Type == JTokenType.Object)
                        {
                            // If File is an empty object or invalid, set to empty string
                            field["File"] = "";
                        }
                    }

                    // Process additionalFields for nested files
                    if (field["additionalFields"] is JArray additionalFields)
                    {
                        foreach (var nestedField in additionalFields.OfType<JObject>())
                        {
                            string nestedFieldName = nestedField["name"]?.ToString() ?? "";
                            if (string.IsNullOrEmpty(nestedFieldName)) continue;

                            if (nestedField.ContainsKey("File") || nestedField.ContainsKey("Enclosure"))
                            {
                                var file = form.Files.FirstOrDefault(f => f.Name == nestedFieldName);
                                if (file != null)
                                {
                                    string filePath = await helper.GetFilePath(file);
                                    nestedField["File"] = filePath;
                                    _logger.LogInformation($"Updated file path for nested field {nestedFieldName}: {filePath}");
                                }
                                else if (nestedField["File"]?.Type == JTokenType.Object)
                                {
                                    nestedField["File"] = "";
                                }
                            }
                        }
                    }
                }
            }

            // // Update application.FormDetails with the new formDetails
            application.FormDetails = submittedFormDetails.ToString();
            application.AdditionalDetails = null;
            var workFlow = JsonConvert.DeserializeObject<JArray>(application.WorkFlow ?? "[]");
            var currentOfficer = workFlow!.FirstOrDefault(o => (int)o["playerId"]! == application.CurrentPlayer);
            if (currentOfficer != null)
            {
                currentOfficer["status"] = "pending";
                currentOfficer["shifted"] = true;
                currentOfficer["shiftedFrom"] = shiftedFrom;
                currentOfficer["shiftedTo"] = shiftedTo;
            }
            application.WorkFlow = JsonConvert.SerializeObject(workFlow);
            application.CreatedAt = DateTime.Now.ToString("dd MMM yyyy hh:mm:ss tt");

            dbcontext.SaveChanges();
            helper.InsertHistory(referenceNumber, "Corrected and Sent Back to Officer", "Citizen", "Corrected");

            return Json(new { status = true, message = "Application updated successfully", type = "Edit", referenceNumber });
        }
    }
}
