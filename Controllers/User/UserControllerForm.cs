using System.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using ReactMvcApp.Models.Entities;

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
        public async Task<IActionResult> InsertGeneralDetails([FromForm] IFormCollection form)
        {
            var ServiceSpecific = JsonConvert.DeserializeObject<Dictionary<string, string>>(form["ServiceSpecific"].ToString());

            int.TryParse(ServiceSpecific!["District"], out int districtId);
            int.TryParse(form["ServiceId"].ToString(), out int serviceId);
            string ApplicationId = helper.GenerateApplicationId(districtId, dbcontext);
            IFormFile? photographFile = form.Files["ApplicantImage"];
            _logger.LogInformation($"===============Received file: {photographFile?.FileName} with size: {photographFile?.Length}===========");
            string? photographPath = await helper.GetFilePath(photographFile);
            int? userId = HttpContext.Session.GetInt32("UserId");


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

            helper.UpdateApplication("Documents",documents,new SqlParameter("@ApplicationId",applicationId));
            helper.UpdateApplication("ApplicationStatus","Inititated",new SqlParameter("@ApplicationId",applicationId));

            var workFlow = dbcontext.WorkFlows.FirstOrDefault(w => w.ServiceId == serviceId && w.SequenceOrder == 1);
            int officerId = dbcontext.Users
            .Join(
                dbcontext.OfficerDetails,
                u => u.UserId,
                od => od.OfficerId,
                (u, od) => new { u, od }
            )
            .Join(
                dbcontext.WorkFlows,
                combined => combined.od.Role,
                wf => wf.Role,
                (combined, wf) => new { combined.u, wf }
            )
            .Where(x => x.wf.ServiceId == serviceId)
            .ToList()[0].u.UserId;



            if (!form.ContainsKey("returnToEdit"))
            {
                var (userDetails, preAddressDetails, perAddressDetails, serviceSpecific, bankDetails,Documents) = helper.GetUserDetailsAndRelatedData(applicationId);
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



            _ = dbcontext.Database.ExecuteSqlRaw("EXEC InsertApplicationHistory @ServiceId,@ApplicationId,@ActionTaken,@TakenBy,@File,@TakenAt", new SqlParameter("@ServiceId", serviceId), new SqlParameter("@ApplicationId", applicationId), new SqlParameter("@ActionTaken", "Pending"), new SqlParameter("@TakenBy",officerId), new SqlParameter("@File", ""), new SqlParameter("@TakenAt", DateTime.Now.ToString("dd MMM yyyy hh:mm tt")));
            _ = dbcontext.Database.ExecuteSqlRaw("EXEC InsertApplicationStatus @ServiceId,@ApplicationId,@Status,@CurrentlyWith,@LastUpdated", new SqlParameter("@ServiceId", serviceId), new SqlParameter("@ApplicationId", applicationId), new SqlParameter("@Status", "Pending"), new SqlParameter("@CurrentlyWith",officerId), new SqlParameter("@LastUpdated", DateTime.Now.ToString("dd MMM yyyy hh:mm tt")));


            HttpContext.Session.SetString("ApplicationId", applicationId);
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
                SqlParameter parameter;
                if (key == "ApplicationId")
                    continue;

                parameter = new SqlParameter($"@{key}", form[key].ToString());
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
            // Execute SQL command
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
                // Skip keys that are not relevant to address update
                if (key == "ApplicationId" || key == "PresentAddressId" || key == "PermanentAddressId")
                    continue;

                // Create SqlParameter for present address
                if (!key.StartsWith("Permanent"))
                {
                    presentAddressParams.Add(new SqlParameter($"@{key.Replace("Present", "")}", form[key].ToString()));
                }
                // Create SqlParameter for permanent address
                else
                {
                    permanentAddressParams.Add(new SqlParameter($"@{key.Replace("Permanent", "")}", form[key].ToString()));
                }
            }

            // Execute SQL command for present address update
            var presentSqlParams = string.Join(", ", presentAddressParams.Select(p => p.ParameterName + "=" + p.ParameterName));
            var presentSqlQuery = $"EXEC CheckAndUpdateAddress {presentSqlParams}";
            dbcontext.Database.ExecuteSqlRaw(presentSqlQuery, presentAddressParams.ToArray());

            // Execute SQL command for permanent address update if different
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
        // public IActionResult UpdateEditList([FromForm] IFormCollection form)
        // {

        //     var workForceOfficers = JsonConvert.DeserializeObject<List<dynamic>>(form["workForceOfficers"].ToString());
        //     int serviceId = Convert.ToInt32(form["serviceId"].ToString());
        //     int accessCode = Convert.ToInt32(form["District"]);
        //     string officerDesignation = workForceOfficers![0].Designation;

        //     var recordsCount = dbcontext.RecordCounts
        //       .FirstOrDefault(rc => rc.ServiceId == serviceId && rc.Officer == officerDesignation && rc.AccessCode == accessCode);

        //     UpdateRecordCounts(recordsCount!, pendingCount: 1, pendingWithCitizenCount: -1);

        //     string Officer = workForceOfficers[0].Designation;

        //     var CurrentPhase = dbcontext.CurrentPhases.FirstOrDefault(cur => cur.ApplicationId == form["ApplicationId"] && cur.Officer == Officer);
        //     CurrentPhase!.ReceivedOn = DateTime.Now.ToString("dd MMM yyyy hh:mm tt");
        //     CurrentPhase.ActionTaken = "Pending";
        //     CurrentPhase.Remarks = string.Empty;
        //     CurrentPhase.CanPull = false;

        //     dbcontext.SaveChanges();

        //     helper.UpdateApplication("EditList", "[]", new SqlParameter("@ApplicationId", form["ApplicationId"].ToString()));
        //     helper.UpdateApplicationHistory(form["ApplicationId"].ToString(), "Citizen", "Edited and returned to " + workForceOfficers[0].Designation, "NULL");


        //     return Json(new { status = true });
        // }


        // private static void UpdateRecordCounts(RecordCount recordsCount, int pendingCount = 0, int pendingWithCitizenCount = 0, int forwardCount = 0, int returnCount = 0, int sanctionCount = 0, int rejectCount = 0)
        // {
        //     if (recordsCount == null) return;
        //     recordsCount.Pending += pendingCount;
        //     recordsCount.PendingWithCitizen += pendingWithCitizenCount;
        //     recordsCount.Forward += forwardCount;
        //     recordsCount.Return += returnCount;
        //     recordsCount.Sanction += sanctionCount;
        //     recordsCount.Reject += rejectCount;
        // }

        // public IActionResult IncompleteApplication(string ApplicationId, string DistrictId)
        // {
        //     var ApplicationIdParam = new SqlParameter("@ApplicationId", ApplicationId);
        //     int? serviceId = dbcontext.Applications.FirstOrDefault(app => app.ApplicationId == ApplicationId)!.ServiceId;
        //     int accessCode = Convert.ToInt32(DistrictId);
        //     var workForceOfficer = JsonConvert.DeserializeObject<List<dynamic>>(dbcontext.Services.FirstOrDefault(s => s.ServiceId == serviceId)!.WorkForceOfficers!);
        //     string officerDesignation = workForceOfficer![0]["Designation"];
        //     var recordsCount = dbcontext.RecordCounts
        //       .FirstOrDefault(rc => rc.ServiceId == serviceId && rc.Officer == officerDesignation && rc.AccessCode == accessCode);
        //     UpdateRecordCounts(recordsCount!, pendingCount: 1);
        //     helper.UpdateApplication("ApplicationStatus", "Initiated", ApplicationIdParam);
        //     helper.UpdateApplicationHistory(ApplicationId, "Citizen", "Application Submitted.", "NULL");
        //     return Json(new { status = true });
        // }

    }
}