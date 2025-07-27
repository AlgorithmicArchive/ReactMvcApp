using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using SahayataNidhi.Models.Entities;

namespace SahayataNidhi.Controllers.Officer
{
    public partial class OfficerController : Controller
    {
        public IActionResult UpdatePool(int ServiceId, string list)
        {
            var officer = GetOfficerDetails();
            var PoolList = dbcontext.Pools.FirstOrDefault(p => p.ServiceId == Convert.ToInt32(ServiceId) && p.ListType == "Pool" && p.AccessLevel == officer.AccessLevel && p.AccessCode == officer.AccessCode);
            var pool = PoolList != null && !string.IsNullOrWhiteSpace(PoolList!.List) ? JsonConvert.DeserializeObject<List<string>>(PoolList.List) : [];
            var poolList = JsonConvert.DeserializeObject<List<string>>(list);
            foreach (var item in poolList!)
            {
                pool!.Add(item);
            }

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
        [HttpPost]
        public IActionResult SubmitCorrigendum([FromForm] IFormCollection form)
        {
            try
            {
                // Get officer details
                var officer = GetOfficerDetails();
                if (officer == null)
                {
                    return Unauthorized("Officer details not found.");
                }

                // Get form fields
                string referenceNumber = form["referenceNumber"].ToString();
                if (string.IsNullOrWhiteSpace(referenceNumber))
                {
                    return BadRequest("Reference number is required.");
                }

                int serviceId;
                if (!int.TryParse(form["serviceId"].ToString(), out serviceId))
                {
                    return BadRequest("Invalid service ID.");
                }

                string remarks = form["remarks"].ToString();
                string corrigendumFieldsJson = form["corrigendumFields"].ToString();
                if (string.IsNullOrWhiteSpace(corrigendumFieldsJson))
                {
                    return BadRequest("Corrigendum fields are required.");
                }

                // Try to parse applicationId (optional)
                int? applicationId = null;
                if (!string.IsNullOrWhiteSpace(form["applicationId"].ToString()) &&
                    int.TryParse(form["applicationId"].ToString(), out int parsedId))
                {
                    applicationId = parsedId;
                }

                // Validate corrigendumFieldsJson
                try
                {
                    JsonConvert.DeserializeObject<JObject>(corrigendumFieldsJson);
                }
                catch (JsonException)
                {
                    return BadRequest("Invalid corrigendum fields JSON format.");
                }

                // Fetch service and application
                var service = dbcontext.Services.FirstOrDefault(s => s.ServiceId == serviceId);
                if (service == null)
                {
                    return BadRequest($"Service with ID {serviceId} not found.");
                }

                var application = dbcontext.CitizenApplications.FirstOrDefault(a => a.ReferenceNumber == referenceNumber);
                if (application == null)
                {
                    return BadRequest($"Application with reference number '{referenceNumber}' not found.");
                }

                if (string.IsNullOrEmpty(application.FormDetails))
                {
                    return BadRequest($"Form details are missing for application with reference number '{referenceNumber}'.");
                }

                JObject formDetailsJObject;
                try
                {
                    formDetailsJObject = JsonConvert.DeserializeObject<JObject>(application.FormDetails)!;
                }
                catch (JsonException ex)
                {
                    return BadRequest($"Failed to deserialize form details for application with reference number '{referenceNumber}': {ex.Message}");
                }

                if (!formDetailsJObject.TryGetValue("Location", out JToken? locationToken) || locationToken.Type == JTokenType.Null)
                {
                    return BadRequest($"'Location' property is missing or null in form details for application with reference number '{referenceNumber}'.");
                }

                string location = locationToken.ToString();

                // Parse officerEditableField
                JArray players;
                try
                {
                    players = JArray.Parse(service.OfficerEditableField ?? "[]");
                }
                catch (JsonException ex)
                {
                    return BadRequest($"Failed to parse OfficerEditableField: {ex.Message}");
                }

                if (players.Count == 0)
                {
                    return Json(new { status = false, message = "No workflow players defined for this service." });
                }

                if (applicationId.HasValue)
                {
                    // Update existing corrigendum
                    var corrigendum = dbcontext.Corrigenda.FirstOrDefault(c => c.CorrigendumId == applicationId.Value);
                    if (corrigendum == null)
                    {
                        return BadRequest($"Corrigendum with ID {applicationId.Value} not found.");
                    }

                    // Update CorrigendumFields
                    corrigendum.CorrigendumFields = corrigendumFieldsJson;

                    // Parse existing workflow
                    JArray workFlow;
                    try
                    {
                        workFlow = JArray.Parse(corrigendum.WorkFlow ?? "[]");
                    }
                    catch (JsonException ex)
                    {
                        return BadRequest($"Failed to parse existing workflow: {ex.Message}");
                    }

                    if (workFlow.Count == 0)
                    {
                        return BadRequest("Existing workflow is empty.");
                    }

                    // Update workflow: set current player to "edited" and next player to "pending"
                    int currentPlayerIndex = corrigendum.CurrentPlayer; // Already 0-based
                    if (currentPlayerIndex < 0 || currentPlayerIndex >= workFlow.Count)
                    {
                        return BadRequest("Invalid current player index.");
                    }

                    workFlow[currentPlayerIndex]["status"] = "edited";
                    workFlow[currentPlayerIndex]["remarks"] = remarks;
                    workFlow[currentPlayerIndex]["completedAt"] = DateTime.Now.ToString("dd MMM yyyy hh:mm:ss tt");

                    // Set next player to "pending" if exists
                    if (currentPlayerIndex + 1 < workFlow.Count)
                    {
                        workFlow[currentPlayerIndex + 1]["status"] = "pending";
                        workFlow[currentPlayerIndex + 1]["remarks"] = "";
                        workFlow[currentPlayerIndex + 1]["completedAt"] = "";
                        corrigendum.CurrentPlayer = currentPlayerIndex + 1; // Move to next player
                    }
                    // else: No next player; CurrentPlayer remains unchanged

                    corrigendum.WorkFlow = JsonConvert.SerializeObject(workFlow);

                    // Update history
                    List<dynamic> history;
                    try
                    {
                        history = JsonConvert.DeserializeObject<List<dynamic>>(corrigendum.History ?? "[]") ?? new List<dynamic>();
                    }
                    catch (JsonException ex)
                    {
                        return BadRequest($"Failed to parse existing history: {ex.Message}");
                    }

                    var newHistoryEntry = new
                    {
                        officer = officer.Role + " " + GetOfficerArea(officer.Role!, formDetailsJObject),
                        status = "edited",
                        remarks = remarks,
                        actionTakenOn = DateTime.Now.ToString("dd MMM yyyy hh:mm:ss tt")
                    };

                    history.Add(newHistoryEntry);
                    corrigendum.History = JsonConvert.SerializeObject(history);

                    dbcontext.Corrigenda.Update(corrigendum);
                }
                else
                {
                    // Create new corrigendum
                    var filteredWorkflow = new JArray();
                    foreach (var player in players)
                    {
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

                    if (filteredWorkflow.Count > 0)
                    {
                        filteredWorkflow[0]["status"] = "created";
                        filteredWorkflow[0]["remarks"] = remarks;
                        filteredWorkflow[0]["completedAt"] = DateTime.Now.ToString("dd MMM yyyy hh:mm:ss tt");
                        if (filteredWorkflow.Count > 1)
                        {
                            filteredWorkflow[1]["status"] = "pending";
                        }
                    }

                    var workFlow = JsonConvert.SerializeObject(filteredWorkflow);
                    var history = new
                    {
                        officer = officer.Role + " " + GetOfficerArea(officer.Role!, formDetailsJObject),
                        status = "created",
                        remarks = remarks,
                        actionTakenOn = DateTime.Now.ToString("dd MMM yyyy hh:mm:ss tt")
                    };

                    List<dynamic> History = [history];

                    var corrigendum = new Corrigendum
                    {
                        ReferenceNumber = referenceNumber,
                        Location = location,
                        CorrigendumFields = corrigendumFieldsJson,
                        WorkFlow = workFlow,
                        CurrentPlayer = filteredWorkflow.Count > 1 ? 1 : 0, // 0-based index
                        History = JsonConvert.SerializeObject(History)
                    };

                    dbcontext.Corrigenda.Add(corrigendum);
                }

                dbcontext.SaveChanges();

                return Json(new
                {
                    status = true,
                    message = applicationId.HasValue ? "Corrigendum updated successfully." : "Corrigendum created successfully."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    status = false,
                    message = $"An error occurred: {ex.Message}"
                });
            }
        }


        [HttpPost]
        public IActionResult HandleCorrigendumAction([FromForm] IFormCollection form)
        {
            try
            {
                var officer = GetOfficerDetails();
                if (officer == null)
                {
                    return Unauthorized("Officer details not found.");
                }

                var referenceNumber = form["referenceNumber"].ToString();
                var action = form["action"].ToString();
                var remarks = form["remarks"].ToString();
                var corrigendumId = form["corrigendumId"].ToString();

                var corrigendum = dbcontext.Corrigenda
                    .FirstOrDefault(c => c.ReferenceNumber == referenceNumber && c.CorrigendumId == Convert.ToInt32(corrigendumId));

                if (corrigendum == null)
                {
                    return NotFound("Corrigendum not found.");
                }

                var citizenApplication = dbcontext.CitizenApplications
                    .FirstOrDefault(c => c.ReferenceNumber == referenceNumber);
                if (citizenApplication == null)
                {
                    return NotFound("Citizen application not found.");
                }

                var formDetails = JObject.Parse(citizenApplication.FormDetails!);

                int currentPlayer = corrigendum.CurrentPlayer;
                var workFlow = JArray.Parse(corrigendum.WorkFlow ?? "[]");
                if (workFlow.Count > 0)
                {
                    if (action == "forward")
                    {
                        workFlow[currentPlayer]["status"] = "forwarded";
                        workFlow[currentPlayer]["canPull"] = true;
                        workFlow[currentPlayer + 1]["status"] = "pending";
                        corrigendum.CurrentPlayer = currentPlayer + 1;
                    }
                    else if (action == "sanction")
                    {
                        workFlow[currentPlayer]["status"] = "sanctioned";
                    }
                    else if (action == "return")
                    {
                        workFlow[currentPlayer]["status"] = "returned";
                        workFlow[currentPlayer]["canPull"] = true;
                        workFlow[currentPlayer - 1]["status"] = "pending";
                        workFlow[currentPlayer - 1]["remarks"] = "";
                        workFlow[currentPlayer - 1]["completedAt"] = "";
                        corrigendum.CurrentPlayer = currentPlayer - 1;
                    }
                    workFlow[currentPlayer]["remarks"] = remarks;
                    workFlow[currentPlayer]["completedAt"] = DateTime.Now.ToString("dd MMMM yyyy hh:mm:ss tt");
                    corrigendum.WorkFlow = workFlow.ToString(Formatting.None);
                }

                var corrigendumHistory = JsonConvert.DeserializeObject<List<dynamic>>(corrigendum.History ?? "[]");
                var newCorrigendumHistory = new
                {
                    officer = officer.Role + " " + GetOfficerArea(officer.Role!, formDetails),
                    status = action,
                    remarks = remarks,
                    actionTakenOn = DateTime.Now.ToString("dd MMMM yyyy hh:mm:ss tt"),
                };
                corrigendumHistory!.Add(newCorrigendumHistory);
                corrigendum.History = JsonConvert.SerializeObject(corrigendumHistory);

                dbcontext.Corrigenda.Update(corrigendum);
                dbcontext.SaveChanges();

                return Json(new { status = true });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { status = false, response = ex.Message });
            }
        }

        public async Task<IActionResult> UpdateCorrigendumPdf([FromForm] IFormCollection form)
        {
            try
            {
                if (form == null || !form.Files.Any() || string.IsNullOrEmpty(form["applicationId"]) || string.IsNullOrEmpty(form["corrigendumId"]))
                {
                    _logger.LogWarning("Missing form data for UpdateCorrigendumPdf. Form: {Form}", form);
                    return BadRequest(new { status = false, response = "Missing form data or file." });
                }

                var signedPdf = form.Files["signedPdf"];
                var applicationId = form["applicationId"].ToString();
                var corrigendumId = form["corrigendumId"].ToString();

                if (signedPdf == null || signedPdf.Length == 0)
                {
                    _logger.LogWarning("No signed PDF uploaded for applicationId: {ApplicationId}, corrigendumId: {CorrigendumId}", applicationId, corrigendumId);
                    return BadRequest(new { status = false, response = "Signed PDF is required." });
                }

                if (signedPdf.ContentType != "application/pdf")
                {
                    _logger.LogWarning("Invalid file type uploaded for applicationId: {ApplicationId}, corrigendumId: {CorrigendumId}. Expected application/pdf, got {ContentType}", applicationId, corrigendumId, signedPdf.ContentType);
                    return BadRequest(new { status = false, response = "Invalid file type. Only PDF files are allowed." });
                }

                var officer = GetOfficerDetails();
                if (officer == null)
                {
                    _logger.LogWarning("Officer details not found for applicationId: {ApplicationId}, corrigendumId: {CorrigendumId}", applicationId, corrigendumId);
                    return Unauthorized(new { status = false, response = "Officer details not found." });
                }

                var corrigendum = await dbcontext.Corrigenda
                    .FirstOrDefaultAsync(c => c.ReferenceNumber == applicationId && c.CorrigendumId == Convert.ToInt32(corrigendumId));
                if (corrigendum == null)
                {
                    _logger.LogWarning("Corrigendum not found for applicationId: {ApplicationId}, corrigendumId: {CorrigendumId}", applicationId, corrigendumId);
                    return NotFound(new { status = false, response = "Corrigendum not found." });
                }

                // Save the signed PDF to UserDocuments
                var fileName = applicationId.Replace("/", "_") + "_" + corrigendumId + "CorrigendumSanctionLetter.pdf";
                using var memoryStream = new MemoryStream();
                await signedPdf.CopyToAsync(memoryStream);
                var fileData = memoryStream.ToArray();

                var existingFile = await dbcontext.UserDocuments
                    .FirstOrDefaultAsync(f => f.FileName == fileName);
                if (existingFile != null)
                {
                    existingFile.FileData = fileData;
                    existingFile.FileType = "application/pdf";
                    existingFile.UpdatedAt = DateTime.UtcNow;
                }
                else
                {
                    dbcontext.UserDocuments.Add(new UserDocument
                    {
                        FileName = fileName,
                        FileData = fileData,
                        FileType = "application/pdf",
                        UpdatedAt = DateTime.UtcNow
                    });
                }

                // Update corrigendum status
                var workFlow = JArray.Parse(corrigendum.WorkFlow ?? "[]");
                if (workFlow.Count > 0)
                {
                    workFlow[corrigendum.CurrentPlayer]["status"] = "sanctioned";
                    workFlow[corrigendum.CurrentPlayer]["completedAt"] = DateTime.UtcNow.ToString("dd MMMM yyyy hh:mm:ss tt");
                    corrigendum.WorkFlow = workFlow.ToString(Formatting.None);
                }

                dbcontext.Corrigenda.Update(corrigendum);
                await dbcontext.SaveChangesAsync();

                _logger.LogInformation("Corrigendum PDF updated and status set to sanctioned for applicationId: {ApplicationId}, corrigendumId: {CorrigendumId}", applicationId, corrigendumId);

                return Json(new { status = true, path = fileName });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating corrigendum PDF for applicationId: {ApplicationId}, corrigendumId: {CorrigendumId}", form["applicationId"], form["corrigendumId"]);
                return StatusCode(500, new { status = false, response = $"An error occurred while updating the corrigendum PDF: {ex.Message}" });
            }
        }

    }
}