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

        public class Document
        {
            public string? Label { get; set; }
            public string? Enclosure { get; set; }
            public string? File { get; set; }
        }


        [HttpPost]
        public async Task<IActionResult> InsertFormDetails([FromForm] IFormCollection form)
        {

            // Retrieve userId from JWT token
            int userId = Convert.ToInt32(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            int serviceId = Convert.ToInt32(form["serviceId"].ToString());
            string formDetailsJson = form["formDetails"].ToString();

            // Parse the JSON into a JObject (flat structure)
            var formDetailsObj = JObject.Parse(formDetailsJson);

            // Process file uploads: iterate through all uploaded files
            foreach (var file in form.Files)
            {
                // Save the file and get its storage location
                string filePath = await helper.GetFilePath(file);


                // Update the flat JSON: if a property key matches the file's name, replace its value with the file path.
                if (formDetailsObj.TryGetValue(file.Name, out JToken token))
                {
                    formDetailsObj[file.Name] = filePath;
                }
            }

            // Example: Extract district id from the flat JSON if needed.
            // Here we look for any key that contains "District" (case-insensitive) and try to parse its value as an integer.
            int districtId = 0;
            foreach (var property in formDetailsObj.Properties())
            {
                if (property.Name.Contains("District", StringComparison.OrdinalIgnoreCase))
                {
                    if (int.TryParse(property.Value.ToString(), out int parsedId))
                    {
                        districtId = parsedId;
                        break; // End loop as soon as we find a valid district id
                    }
                }
            }

            int count = GetCountPerDistrict(districtId, serviceId);
            var service = dbcontext.Services.FirstOrDefault(s => s.ServiceId == serviceId);

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
            var referenceNumber = "JK-" + service.NameShort + "/" + finYear + "/" + count;
            var createdAt = DateTime.Now.ToString("dd MMM yyyy hh:mm:ss tt");

            // Store the updated JSON (with file paths) in the database.
            var newFormDetails = new CitizenApplication
            {
                ReferenceNumber = referenceNumber,
                CitizenId = userId,
                ServiceId = serviceId,
                FormDetails = formDetailsObj.ToString(),
                WorkFlow = workFlow!,
                CreatedAt = createdAt
            };

            dbcontext.CitizenApplications.Add(newFormDetails);
            dbcontext.SaveChanges();

            return Json(new { status = true });
        }



        [HttpPost]
        public async Task<IActionResult> InsertGeneralDetails([FromForm] IFormCollection form)
        {
            var ServiceSpecific = JsonConvert.DeserializeObject<Dictionary<string, string>>(form["ServiceSpecific"].ToString());

            int.TryParse(ServiceSpecific!["District"], out int districtId);
            int.TryParse(form["ServiceId"].ToString(), out int serviceId);
            string ApplicationId = helper.GenerateApplicationId(districtId, dbcontext);
            IFormFile? photographFile = form.Files["ApplicantImage"];
            _logger.LogInformation($"===============Received file: {photographFile?.FileName} with size: {photographFile?.Length}===========");
            string? photographPath = await helper.GetFilePath(photographFile);

            // Retrieve userId from JWT token
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var ApplicationIdParam = new SqlParameter("@ApplicationId", ApplicationId);
            var ServiceIdParam = new SqlParameter("@ServiceId", serviceId);
            var ApplicantNameParam = new SqlParameter("@ApplicantName", form["ApplicantName"].ToString());
            var ApplicantImageParam = new SqlParameter("@ApplicantImage", photographPath);
            var RelationParam = new SqlParameter("@Relation", form["Relation"].ToString());
            var RelationNameParam = new SqlParameter("@RelationName", form["RelationName"].ToString());
            var DateOfBirthParam = new SqlParameter("@DateOfBirth", form["DateOfBirth"].ToString());
            var CateogryParam = new SqlParameter("@Category", form["Category"].ToString());
            var ServiceSpecificParam = new SqlParameter("@ServiceSpecific", form["ServiceSpecific"].ToString());
            var CitizenIdParam = new SqlParameter("@CitizenId", userId);
            var EmailParam = new SqlParameter("@Email", form["Email"].ToString());
            var MobileNumberParam = new SqlParameter("@MobileNumber", form["MobileNumber"].ToString());
            var BankDetailsParam = new SqlParameter("@BankDetails", "{}");
            var DocumentsParam = new SqlParameter("@Documents", "[]");
            var ApplicationStatusParam = new SqlParameter("@ApplicationStatus", "Incomplete");

            dbcontext.Database.ExecuteSqlRaw("EXEC InsertGeneralApplicationDetails @ApplicationId,@CitizenId,@ServiceId,@ApplicantName,@ApplicantImage,@Email,@MobileNumber,@Relation,@RelationName,@DateOfBirth,@Category,@ServiceSpecific,@BankDetails,@Documents,@ApplicationStatus",
                ApplicationIdParam, CitizenIdParam, ServiceIdParam, ApplicantNameParam, ApplicantImageParam, EmailParam, MobileNumberParam, RelationParam, RelationNameParam, DateOfBirthParam, CateogryParam, ServiceSpecificParam, BankDetailsParam, DocumentsParam, ApplicationStatusParam);


            return Json(new
            {
                status = true,
                ApplicationId
            });
        }

        public IActionResult InsertPresentAddressDetails([FromForm] IFormCollection form)
        {
            try
            {
                var applicationId = new SqlParameter("@ApplicationId", form["ApplicationId"].ToString());

                // Extract Present Address Parameters
                var presentAddressParams = helper.GetAddressParameters(form, "Present");

                List<Address>? presentAddress = null;
                int? presentAddressId = null;

                if (presentAddressParams != null)
                {
                    presentAddress = dbcontext.Addresses.FromSqlRaw("EXEC CheckAndInsertAddress @DistrictId, @TehsilId, @BlockId, @HalqaPanchayatName, @VillageName, @WardName, @Pincode, @AddressDetails", presentAddressParams).ToList();

                    if (presentAddress != null && presentAddress.Count > 0)
                    {
                        presentAddressId = presentAddress[0].AddressId;
                        helper.UpdateApplication("PresentAddressId", presentAddressId.ToString()!, applicationId);
                    }
                }

                return Json(new
                {
                    status = true,
                    ApplicationId = form["ApplicationId"].ToString(),
                    PresentAddressId = presentAddressId
                });
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }

        public IActionResult InsertPermanentAddressDetails([FromForm] IFormCollection form)
        {
            try
            {
                var applicationId = new SqlParameter("@ApplicationId", form["ApplicationId"].ToString());
                string? sameAsPresent = form["SameAsPresent"];

                // Extract Permanent Address Parameters
                var permanentAddressParams = helper.GetAddressParameters(form, "Permanent");

                List<Address>? permanentAddress = null;
                int? permanentAddressId = null;

                if (permanentAddressParams != null)
                {
                    if (string.IsNullOrEmpty(sameAsPresent))
                    {
                        // Insert Permanent Address Separately
                        permanentAddress = dbcontext.Addresses.FromSqlRaw("EXEC CheckAndInsertAddress @DistrictId, @TehsilId, @BlockId, @HalqaPanchayatName, @VillageName, @WardName, @Pincode, @AddressDetails", permanentAddressParams).ToList();

                        if (permanentAddress != null && permanentAddress.Count > 0)
                        {
                            permanentAddressId = permanentAddress[0].AddressId;
                            helper.UpdateApplication("PermanentAddressId", permanentAddressId.ToString()!, applicationId);
                        }
                    }
                    else
                    {
                        // If "Same As Present" is checked, fetch PresentAddressId
                        var presentAddressIdStr = form["PresentAddressId"].ToString();
                        if (!string.IsNullOrEmpty(presentAddressIdStr))
                        {
                            permanentAddressId = Convert.ToInt32(presentAddressIdStr);
                            helper.UpdateApplication("PermanentAddressId", Convert.ToInt32(presentAddressIdStr).ToString()!, applicationId);
                        }
                        else
                        {
                            return Json(new { status = false, message = "Invalid PresentAddressId." });
                        }
                    }
                }

                return Json(new
                {
                    status = true,
                    ApplicationId = form["ApplicationId"].ToString(),
                    PermanentAddressId = permanentAddressId
                });
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }

        public IActionResult InsertBankDetails([FromForm] IFormCollection form)
        {
            var ApplicationId = new SqlParameter("@ApplicationId", form["ApplicationId"].ToString());

            var bankDetails = new
            {
                BankName = form["BankName"].ToString(),
                BranchName = form["BranchName"].ToString(),
                AccountNumber = form["AccountNumber"].ToString(),
                IfscCode = form["IfscCode"].ToString(),
            };


            helper.UpdateApplication("BankDetails", JsonConvert.SerializeObject(bankDetails), ApplicationId);

            return Json(new { status = true, ApplicationId = form["ApplicationId"].ToString(), bankDetails });
        }

        public async Task<IActionResult> InsertDocuments([FromForm] IFormCollection form)
        {
            var applicationId = form["ApplicationId"].ToString();
            int serviceId = Convert.ToInt32(form["ServiceId"].ToString());
            int accessCode = Convert.ToInt32(form["AccessCode"].ToString());

            var labels = JsonConvert.DeserializeObject<string[]>(form["labels"].ToString()) ?? [];
            var docs = new List<Document>();
            var addedLabels = new HashSet<string>();

            foreach (var label in labels)
            {
                if (addedLabels.Add(label))
                {
                    var file = form.Files[$"{label}File"];
                    if (file == null)
                    {
                        return Json(new { message = $"{label}File is missing" });
                    }

                    var doc = new Document
                    {
                        Label = label,
                        Enclosure = form[$"{label}Enclosure"].ToString(),
                        File = await helper.GetFilePath(file)
                    };
                    docs.Add(doc);
                }
            }

            var documents = JsonConvert.SerializeObject(docs);

            helper.UpdateApplication("Documents", documents, new SqlParameter("@ApplicationId", applicationId));
            helper.UpdateApplication("ApplicationStatus", "Initiated", new SqlParameter("@ApplicationId", applicationId));
            helper.UpdateApplication("SubmissionDate", DateTime.Now.ToString("dd MMM yyyy hh:mm:ss tt"), new SqlParameter("@ApplicationId", applicationId));

            var ServiceSpecific = JsonConvert.DeserializeObject<Dictionary<string, string>>(dbcontext.Applications.FirstOrDefault(a => a.ApplicationId == applicationId)!.ServiceSpecific);
            string AccessLevel = "";
            int AccessCode = 0;
            if (ServiceSpecific!.ContainsKey("District"))
            {
                AccessLevel = "District";
                AccessCode = Convert.ToInt32(ServiceSpecific["District"]);
            }
            var workFlow = dbcontext.WorkFlows.FirstOrDefault(w => w.ServiceId == serviceId && w.SequenceOrder == 1);


            // Get the officerId based on serviceId and workflow
            int? officerId = 0;
            var officer = dbcontext.OfficerDetails.FirstOrDefault(od => od.AccessLevel == AccessLevel && od.AccessCode == AccessCode && od.Role == workFlow!.Role);
            if (officer != null) officerId = officer.OfficerId;
            else officerId = null;

            if (!form.ContainsKey("returnToEdit"))
            {
                var (userDetails, preAddressDetails, perAddressDetails, serviceSpecific, bankDetails, Documents) = helper.GetUserDetailsAndRelatedData(applicationId);
                int districtCode = Convert.ToInt32(serviceSpecific["District"]);
                string appliedDistrict = dbcontext.Districts.FirstOrDefault(d => d.DistrictId == districtCode)?.DistrictName.ToUpper()!;

                var details = new Dictionary<string, string>
                {
                    ["REFERENCE NUMBER"] = userDetails.ApplicationId,
                    ["APPLICANT NAME"] = userDetails.ApplicantName,
                    ["PARENTAGE"] = $"{userDetails.RelationName} ({userDetails.Relation.ToUpper()})",
                    ["MOTHER NAME"] = serviceSpecific["MotherName"],
                    ["APPLIED DISTRICT"] = appliedDistrict,
                    ["BANK NAME"] = bankDetails["BankName"],
                    ["ACCOUNT NUMBER"] = bankDetails["AccountNumber"],
                    ["IFSC CODE"] = bankDetails["IfscCode"],
                    ["DATE OF MARRIAGE"] = serviceSpecific["DateOfMarriage"],
                    ["DATE OF SUBMISSION"] = userDetails.SubmissionDate,
                    ["PRESENT ADDRESS"] = $"{preAddressDetails.Address}, TEHSIL: {preAddressDetails.Tehsil}, DISTRICT: {preAddressDetails.District}, PIN CODE: {preAddressDetails.Pincode}",
                    ["PERMANENT ADDRESS"] = $"{perAddressDetails.Address}, TEHSIL: {perAddressDetails.Tehsil}, DISTRICT: {perAddressDetails.District}, PIN CODE: {perAddressDetails.Pincode}"
                };
                _pdfService.CreateAcknowledgement(details, userDetails.ApplicationId);
            }
            else
            {
                helper.UpdateApplication("EditList", "[]", new SqlParameter("@ApplicationId", applicationId));
            }

            var email = dbcontext.Applications.FirstOrDefault(u => u.ApplicationId == applicationId)?.Email;

            if (!string.IsNullOrWhiteSpace(email))
            {
                await emailSender.SendEmail(email, "Acknowledgement", $"Your Application with Reference Number {applicationId} has been sent to {workFlow!.Role} at {DateTime.Now.ToString("dd MMM yyyy hh:mm tt")}");
            }
            // Define the parameters
            var ServiceIdParam = new SqlParameter("@ServiceId", serviceId);
            var AccessLevelParam = new SqlParameter("@AccessLevel", AccessLevel);
            var AccessCodeParam = new SqlParameter("@AccessCode", AccessCode);
            var RoleParam = new SqlParameter("@Role", workFlow!.Role);
            var ApplicationIdParam = new SqlParameter("@ApplicationId", applicationId);
            var StatusActionParam = new SqlParameter("@StatusAction", "Pending");
            var OfficerIdParam = new SqlParameter("@OfficerId", officerId.HasValue ? officerId : (object)DBNull.Value); // Handle NULL
            var RemarksParam = new SqlParameter("@Remarks", "");
            var FileParam = new SqlParameter("@File", "");
            var TimestampParam = new SqlParameter("@Timestamp", DateTime.Now.ToString("dd MMM yyyy hh:mm:ss tt"));
            var CanPullParam = new SqlParameter("@canPull", SqlDbType.Bit)
            {
                Value = 0 // Default value for optional parameter
            };

            // Execute the stored procedure
            var result = await dbcontext.Database.ExecuteSqlRawAsync(
                "EXEC [dbo].[InsertApplicationStatusAndHistoryWithCount] @ServiceId, @AccessLevel, @AccessCode, @Role, @ApplicationId, @StatusAction, @OfficerId, @Remarks, @File, @Timestamp, @canPull",
                ServiceIdParam,
                AccessLevelParam,
                AccessCodeParam,
                RoleParam,
                ApplicationIdParam,
                StatusActionParam,
                OfficerIdParam,
                RemarksParam,
                FileParam,
                TimestampParam,
                CanPullParam
            );

            helper.WebService("onsubmit", serviceId, applicationId);

            return Json(new { status = true, ApplicationId = applicationId, complete = true });
        }

        public async Task<IActionResult> UpdateGeneralDetails([FromForm] IFormCollection form)
        {
            string ApplicationId = form["ApplicationId"].ToString();
            var parameters = new List<SqlParameter>();
            var applicationIdParameter = new SqlParameter("@ApplicationId", ApplicationId);
            parameters.Add(applicationIdParameter);

            foreach (var key in form.Keys)
            {
                if (key == "ApplicationId") continue;

                var parameter = new SqlParameter($"@{key}", form[key].ToString());
                parameters.Add(parameter);
            }

            foreach (var file in form.Files)
            {
                string path = await helper.GetFilePath(file);
                var parameter = new SqlParameter($"@{file.Name}", path);
                parameters.Add(parameter);
            }

            var sqlParams = string.Join(", ", parameters.Select(p => p.ParameterName + "=" + p.ParameterName));
            var sqlQuery = $"EXEC UpdateApplicationColumns {sqlParams}";
            dbcontext.Database.ExecuteSqlRaw(sqlQuery, parameters.ToArray());

            return Json(new { status = true, ApplicationId });
        }

        public IActionResult UpdateAddressDetails([FromForm] IFormCollection form)
        {
            string ApplicationId = form["ApplicationId"].ToString();
            var presentAddressParams = new List<SqlParameter>();
            var permanentAddressParams = new List<SqlParameter>();

            presentAddressParams.Add(new SqlParameter("@AddressId", Convert.ToInt32(form["PresentAddressId"])));
            permanentAddressParams.Add(new SqlParameter("@AddressId", Convert.ToInt32(form["PermanentAddressId"])));

            foreach (var key in form.Keys)
            {
                if (key == "ApplicationId" || key == "PresentAddressId" || key == "PermanentAddressId") continue;

                if (!key.StartsWith("Permanent"))
                {
                    presentAddressParams.Add(new SqlParameter($"@{key.Replace("Present", "")}", form[key].ToString()));
                }
                else
                {
                    permanentAddressParams.Add(new SqlParameter($"@{key.Replace("Permanent", "")}", form[key].ToString()));
                }
            }

            var presentSqlParams = string.Join(", ", presentAddressParams.Select(p => p.ParameterName + "=" + p.ParameterName));
            var presentSqlQuery = $"EXEC CheckAndUpdateAddress {presentSqlParams}";
            dbcontext.Database.ExecuteSqlRaw(presentSqlQuery, presentAddressParams.ToArray());

            if (form["PresentAddressId"].ToString() != form["PermanentAddressId"].ToString())
            {
                var permSqlParams = string.Join(", ", permanentAddressParams.Select(p => p.ParameterName + "=" + p.ParameterName));
                var permSqlQuery = $"EXEC CheckAndUpdateAddress {permSqlParams}";
                dbcontext.Database.ExecuteSqlRaw(permSqlQuery, permanentAddressParams.ToArray());
            }

            return Json(new { status = true, ApplicationId });
        }

        public IActionResult UpdateBankDetails([FromForm] IFormCollection form)
        {
            var ApplicationId = new SqlParameter("@ApplicationId", form["ApplicationId"].ToString());

            var bankDetails = new
            {
                BankName = form["BankName"].ToString(),
                BranchName = form["BranchName"].ToString(),
                AccountNumber = form["AccountNumber"].ToString(),
                IfscCode = form["IfscCode"].ToString(),
            };

            helper.UpdateApplication("BankDetails", JsonConvert.SerializeObject(bankDetails), ApplicationId);

            return Json(new { status = true, ApplicationId = form["ApplicationId"].ToString() });
        }
    }
}
