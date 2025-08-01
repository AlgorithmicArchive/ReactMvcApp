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
        public async Task<IActionResult> SubmitCorrigendum([FromForm] IFormCollection form)
        {
            try
            {
                // Get officer details
                var officer = GetOfficerDetails();
                if (officer == null)
                {
                    return Unauthorized("Officer details not found.");
                }

                List<string> Files = [];
                if (form.Files != null && form.Files.Count > 0)
                {
                    foreach (var formFile in form.Files)
                    {
                        if (formFile.Length > 0)
                        {
                            string filePath = await helper.GetFilePath(formFile);
                            Files.Add(filePath);
                        }
                    }

                }



                // Get form fields
                string referenceNumber = form["referenceNumber"].ToString();
                if (string.IsNullOrWhiteSpace(referenceNumber))
                {
                    return BadRequest("Reference number is required.");
                }

                if (!int.TryParse(form["serviceId"].ToString(), out int serviceId))
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
                string? applicationId = form["applicationId"].ToString() ?? "";

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
                    formDetailsJObject = JObject.Parse(application.FormDetails)!;
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

                if (form.ContainsKey("applicationId"))
                {
                    // Update existing corrigendum
                    var corrigendum = dbcontext.Corrigenda.FirstOrDefault(c => c.CorrigendumId == applicationId);
                    if (corrigendum == null)
                    {
                        return BadRequest($"Corrigendum with ID {applicationId} not found.");
                    }
                    var corrigendumFields = JObject.Parse(corrigendum.CorrigendumFields ?? "{}");

                    // Ensure the 'Files' section exists
                    if (corrigendumFields["Files"] is not JObject corrigendumFiles)
                    {
                        corrigendumFiles = new JObject();
                        corrigendumFields["Files"] = corrigendumFiles;
                    }

                    // Get or create the array for the officer role
                    if (!corrigendumFiles.TryGetValue(officer.RoleShort!, out var roleFileToken) || roleFileToken.Type != JTokenType.Array)
                    {
                        corrigendumFiles[officer.RoleShort!] = new JArray();
                    }

                    var roleFileArray = (JArray)corrigendumFiles[officer.RoleShort!]!;

                    // Append each new file (ensure duplicates aren't added if you want)
                    foreach (var file in Files)
                    {
                        if (!roleFileArray.Contains(file))
                        {
                            roleFileArray.Add(file);
                        }
                    }

                    // Finally update the corrigendum
                    corrigendum.CorrigendumFields = corrigendumFields.ToString(Formatting.None);

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

                    workFlow[currentPlayerIndex]["status"] = "forwarded";
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
                        status = "forwarded",
                        remarks = remarks,
                        actionTakenOn = DateTime.Now.ToString("dd MMM yyyy hh:mm:ss tt")
                    };

                    history.Add(newHistoryEntry);
                    corrigendum.History = JsonConvert.SerializeObject(history);

                    dbcontext.Corrigenda.Update(corrigendum);
                }
                else
                {
                    var Location = formDetailsJObject["Location"];
                    _logger.LogInformation($"--------- Location {Location} ----------------");
                    int DistrictId = Convert.ToInt32(Location!.FirstOrDefault(l => l["name"]!.ToString() == "District")!["value"]);
                    var finYear = helper.GetCurrentFinancialYear();
                    var districtDetails = dbcontext.Districts.FirstOrDefault(s => s.DistrictId == DistrictId);
                    string districtShort = districtDetails!.DistrictShort!;
                    int count = GetCountPerDistrict(DistrictId, serviceId);

                    var CorrigendumNumber = "JK-" + service.NameShort + "-" + districtShort + "-CRG" + "/" + finYear + "/" + count;
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
                        filteredWorkflow[0]["status"] = "forwarded";
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
                        status = "Forwarded",
                        remarks = remarks,
                        actionTakenOn = DateTime.Now.ToString("dd MMM yyyy hh:mm:ss tt")
                    };

                    List<dynamic> History = [history];
                    var corrigendumFields = JObject.Parse(corrigendumFieldsJson);
                    corrigendumFields["Files"] = new JObject
                    {
                        [officer.RoleShort!] = new JArray(Files.Select(Path.GetFileName))
                    };


                    var corrigendum = new Corrigendum
                    {
                        CorrigendumId = CorrigendumNumber,
                        ReferenceNumber = referenceNumber,
                        Location = location,
                        CorrigendumFields = JsonConvert.SerializeObject(corrigendumFields),
                        WorkFlow = workFlow,
                        CurrentPlayer = filteredWorkflow.Count > 1 ? 1 : 0, // 0-based index
                        History = JsonConvert.SerializeObject(History),
                        Status = "Initiated"
                    };

                    dbcontext.Corrigenda.Add(corrigendum);
                }

                dbcontext.SaveChanges();

                return Json(new
                {
                    status = true,
                    message = applicationId != null ? "Corrigendum updated successfully." : "Corrigendum Forwarded successfully."
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
        public async Task<IActionResult> UpdatePdf([FromForm] IFormCollection form)
        {
            _logger.LogInformation($"Form: {form} ApplicationID: {form["applicationId"]}");

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

            try
            {
                // Construct the file name based on applicationId
                string fileName = applicationId.Replace("/", "_") + "_SanctionLetter.pdf";

                // Read the file into a byte array
                using var memoryStream = new MemoryStream();
                await signedPdf.CopyToAsync(memoryStream);
                var fileData = memoryStream.ToArray();

                // Check if the file exists in UserDocuments
                var existingFile = await dbcontext.UserDocuments
                    .FirstOrDefaultAsync(f => f.FileName == fileName);

                if (existingFile != null)
                {
                    // Update existing record
                    existingFile.FileData = fileData;
                    existingFile.FileType = "application/pdf";
                    existingFile.UpdatedAt = DateTime.UtcNow;
                }
                else
                {
                    // Create new record
                    dbcontext.UserDocuments.Add(new UserDocument
                    {
                        FileName = fileName,
                        FileData = fileData,
                        FileType = "application/pdf",
                        UpdatedAt = DateTime.UtcNow
                    });
                }

                await dbcontext.SaveChangesAsync();

                return Json(new { status = true, path = fileName });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { status = false, response = $"An error occurred while updating the sanction letter: {ex.Message}" });
            }
        }
        [HttpPost]
        public async Task<IActionResult> HandleCorrigendumAction([FromForm] IFormCollection form)
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
                List<string> Files = [];
                if (form.Files != null && form.Files.Count > 0)
                {
                    foreach (var formFile in form.Files)
                    {
                        if (formFile.Length > 0)
                        {
                            string filePath = await helper.GetFilePath(formFile);
                            Files.Add(filePath);
                        }
                    }

                }



                var corrigendum = dbcontext.Corrigenda
                    .FirstOrDefault(c => c.ReferenceNumber == referenceNumber && c.CorrigendumId == corrigendumId);

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
                        corrigendum.Status = "Sanctioned";
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
                    else if (action == "Reject")
                    {
                        workFlow[currentPlayer]["status"] = "rejected";
                        corrigendum.Status = "Rejected";
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

                var corrigendumFields = JObject.Parse(corrigendum.CorrigendumFields);

                // Ensure 'Files' is a JObject
                if (corrigendumFields["Files"] is not JObject filesObj)
                {
                    filesObj = [];
                    corrigendumFields["Files"] = filesObj;
                }

                var roleKey = officer.RoleShort!; // Assumes not null
                var newFiles = new JArray(Files); // Files is already an array of filenames

                if (filesObj[roleKey] is JArray existingFiles)
                {
                    foreach (var file in Files)
                    {
                        existingFiles.Add(file);
                    }
                }
                else
                {
                    filesObj[roleKey] = newFiles;
                }

                corrigendum.CorrigendumFields = corrigendumFields.ToString(Formatting.None);



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
                    .FirstOrDefaultAsync(c => c.ReferenceNumber == applicationId && c.CorrigendumId == corrigendumId);
                if (corrigendum == null)
                {
                    _logger.LogWarning("Corrigendum not found for applicationId: {ApplicationId}, corrigendumId: {CorrigendumId}", applicationId, corrigendumId);
                    return NotFound(new { status = false, response = "Corrigendum not found." });
                }

                // Save the signed PDF to UserDocuments
                var fileName = corrigendumId.Replace("/", "_") + "_CorrigendumSanctionLetter.pdf";
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