using Encryption;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using SendEmails;
using ReactMvcApp.Models.Entities;
using System.Security.Claims;
using System.Dynamic;

namespace ReactMvcApp.Controllers.Officer
{
    [Authorize(Roles = "Officer")]
    public partial class OfficerController(
        SocialWelfareDepartmentContext dbcontext,
        ILogger<OfficerController> logger,
        UserHelperFunctions helper,
        EmailSender emailSender,
        PdfService pdfService,
        IWebHostEnvironment webHostEnvironment,
        IHubContext<ProgressHub> hubContext,
        IEncryptionService encryptionService
    ) : Controller
    {
        protected readonly SocialWelfareDepartmentContext dbcontext = dbcontext;
        protected readonly ILogger<OfficerController> _logger = logger;
        protected readonly EmailSender emailSender = emailSender;
        protected readonly UserHelperFunctions helper = helper;
        protected readonly PdfService _pdfService = pdfService;
        private readonly IWebHostEnvironment _webHostEnvironment = webHostEnvironment;
        private readonly IHubContext<ProgressHub> hubContext = hubContext;
        protected readonly IEncryptionService encryptionService = encryptionService;

        public override void OnActionExecuted(ActionExecutedContext context)
        {
            base.OnActionExecuted(context);

            // Replace session handling with JWT claims
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var officer = dbcontext.Users.FirstOrDefault(u => u.UserId.ToString() == userId);
            string profile = officer?.Profile ?? "/resources/dummyDocs/formImage.jpg";

            ViewData["UserType"] = "Officer";
            ViewData["UserName"] = officer?.Username;
            ViewData["Profile"] = string.IsNullOrEmpty(profile) ? "/resources/dummyDocs/formImage.jpg" : profile;
        }

        public OfficerDetailsModal GetOfficerDetails()
        {
            // Retrieve officer details from the JWT token
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            // Fetch the officer details
            var parameter = new SqlParameter("@UserId", userId);
            var officer = dbcontext.Database
                                    .SqlQuery<OfficerDetailsModal>($"EXEC GetOfficerDetails @UserId = {parameter}")
                                    .AsEnumerable()
                                    .FirstOrDefault();

            return officer!;
        }

        [HttpGet]
        public IActionResult GetServiceList()
        {
            var officer = GetOfficerDetails();

            // Fetch the service list for the given role
            var roleParameter = new SqlParameter("@Role", officer.Role);
            var serviceList = dbcontext.Database
                                       .SqlQuery<OfficerServiceListModal>($"EXEC GetServicesByRole @Role = {roleParameter}")
                                       .AsEnumerable() // To avoid composability errors
                                       .ToList();

            return Json(new { serviceList });
        }

        [HttpGet]
        public IActionResult GetApplicationsCount(int ServiceId)
        {
            // Get the current officer's details.
            var officer = GetOfficerDetails();
            if (officer == null)
            {
                return Unauthorized();
            }

            // Retrieve the service record.
            var service = dbcontext.Services.FirstOrDefault(s => s.ServiceId == ServiceId);
            if (service == null)
            {
                return NotFound();
            }

            // Deserialize the OfficerEditableField JSON.
            // Assuming the JSON is an array of objects.
            var workflow = JsonConvert.DeserializeObject<List<dynamic>>(service.OfficerEditableField!);
            if (workflow == null || workflow.Count == 0)
            {
                return Json(new { countList = new List<dynamic>(), canSanction = false });
            }

            // Find the authority record for the officer's role.
            // The JSON field names must match those in your stored JSON.
            dynamic authorities = workflow.FirstOrDefault(p => p.designation == officer.Role)!;
            if (authorities == null)
            {
                return Json(new { countList = new List<dynamic>(), canSanction = false });
            }

            // Create SQL parameters for a parameterized stored procedure call.
            var paramTakenBy = new SqlParameter("@TakenBy", officer.Role);
            var paramAccessLevel = new SqlParameter("@AccessLevel", officer.AccessLevel);
            var paramAccessCode = new SqlParameter("@AccessCode", officer.AccessCode);
            var paramServiceId = new SqlParameter("@ServiceId", ServiceId);

            // Execute the stored procedure and retrieve counts.
            var counts = dbcontext.Database
                .SqlQueryRaw<StatusCounts>(
                    "EXEC GetStatusCount @TakenBy, @AccessLevel, @AccessCode, @ServiceId",
                    paramTakenBy, paramAccessLevel, paramAccessCode, paramServiceId)
                .AsEnumerable()
                .FirstOrDefault() ?? new StatusCounts();

            // Build the count list based on the available authority permissions.
            var countList = new List<dynamic>();

            countList.Add(new
            {
                label = "Total Applications",
                count = counts.TotalApplications,
                bgColor = "#000000",
                textColor = "#FFFFFF"
            });

            // Pending is always included.
            countList.Add(new
            {
                label = "Pending",
                count = counts.PendingCount,
                bgColor = "#FFC107",
                textColor = "#212121"
            });

            // Forwarded (if allowed)
            if ((bool)authorities.canForwardToPlayer)
            {
                countList.Add(new
                {
                    label = "Forwarded",
                    count = counts.ForwardedCount,
                    bgColor = "#64B5F6",
                    textColor = "#0D47A1"
                });
            }

            // Returned (if allowed)
            if ((bool)authorities.canReturnToPlayer)
            {
                countList.Add(new
                {
                    label = "Returned",
                    count = counts.ReturnedCount,
                    bgColor = "#E0E0E0",
                    textColor = "#212121"
                });
            }

            // Citizen Pending (if allowed)
            if ((bool)authorities.canReturnToCitizen)
            {
                countList.Add(new
                {
                    label = "Citizen Pending",
                    count = counts.ReturnToEditCount,
                    bgColor = "#CE93D8",
                    textColor = "#4A148C"
                });
            }

            // Rejected (if allowed)
            if ((bool)authorities.canReject)
            {
                countList.Add(new
                {
                    label = "Rejected",
                    count = counts.RejectCount,
                    bgColor = "#FF7043",
                    textColor = "#B71C1C"
                });
            }

            // Sanctioned (if allowed)
            if ((bool)authorities.canSanction)
            {
                countList.Add(new
                {
                    label = "Sanctioned",
                    count = counts.SanctionedCount,
                    bgColor = "#81C784",
                    textColor = "#1B5E20"
                });
            }

            countList.Add(new
            {
                label = "Disbursed",
                count = counts.DisbursedCount,
                bgColor = "#ABCDEF",
                textColor = "#123456"
            });

            // Return the count list and whether the officer can sanction.
            return Json(new { countList, canSanction = (bool)authorities.canSanction });
        }

        [HttpGet]
        public IActionResult GetApplications(int ServiceId, string type)
        {
            _logger.LogInformation($"----TYPE:{type}  ServiceId: {ServiceId}-----------");
            var officerDetails = GetOfficerDetails();
            var role = new SqlParameter("@Role", officerDetails.Role);
            var accessLevel = new SqlParameter("@AccessLevel", officerDetails.AccessLevel);
            var accessCode = new SqlParameter("@AccessCode", officerDetails.AccessCode);
            // If 'type' is null, supply DBNull.Value (or you could supply a default string)
            var applicationStatus = new SqlParameter("@ApplicationStatus", (object)type ?? DBNull.Value);
            var serviceId = new SqlParameter("@ServiceId", ServiceId);

            var response = dbcontext.CitizenApplications
                .FromSqlRaw("EXEC GetApplicationsForOfficer @Role, @AccessLevel, @AccessCode, @ApplicationStatus, @ServiceId",
                    role, accessLevel, accessCode, applicationStatus, serviceId)
                .ToList();

            List<dynamic> columns =
            [
                new { accessorKey = "referenceNumber", header ="Refernece Number" },
                new { accessorKey = "applicantName", header ="Applicant Name" },
                new { accessorKey = "submissionDate", header ="Submission Date" },
            ];

            List<dynamic> data = [];
            List<dynamic> customActions = [
                new {type = "Open",tooltip="View",color="#F0C38E",actionFunction = "handleOpenApplication"}
            ];

            foreach (var details in response)
            {
                var formDetails = JsonConvert.DeserializeObject<dynamic>(details.FormDetails);
                data.Add(new
                {
                    referenceNumber = details.ReferenceNumber,
                    applicantName = formDetails!["ApplicantName"],
                    submissionDate = details.CreatedAt,
                });
            }



            return Json(new
            {
                data,
                columns,
                customActions
            });
        }

        [HttpGet]
        public IActionResult GetUserDetails(string applicationId)
        {
            var details = dbcontext.CitizenApplications
                          .FirstOrDefault(ca => ca.ReferenceNumber == applicationId);
            var formDetails = JsonConvert.DeserializeObject<dynamic>(details!.FormDetails);

            List<dynamic> list = new List<dynamic>();

            // Initialize dictionary for accumulating key/value pairs.
            var obj = new Dictionary<string, string>();

            foreach (var detail in formDetails!)
            {
                // If the current detail is AccountNumber, process it, then split out this group.
                if (detail.Name == "AccountNumber")
                {
                    obj[detail.Name] = detail.Value.ToString();
                    list.Add(obj);
                    obj = new Dictionary<string, string>();  // New object after AccountNumber.
                    continue; // Skip further processing in this iteration.
                }

                // Other keys that trigger a new object before processing:
                if (detail.Name == "ApplicantName" ||
                    detail.Name == "PresentAddress" ||
                    detail.Name == "PermanentAddress" ||
                    detail.Name == "BankName")
                {
                    list.Add(obj);
                    obj = new Dictionary<string, string>();
                }

                // Process keys with special handling.
                if (detail.Name == "District" ||
                    detail.Name == "PresentDistrict" ||
                    detail.Name == "PermanentDistrict")
                {
                    obj[detail.Name] = GetDistrictName(Convert.ToInt32(detail.Value));
                }
                else if (detail.Name.Contains("Tehsil"))
                {
                    obj[detail.Name] = GetTehsilName(Convert.ToInt32(detail.Value));
                }
                else
                {
                    obj[detail.Name] = detail.Value.ToString();
                }

            }

            // Add any remaining data as the final group.
            if (obj.Count > 0)
            {
                list.Add(obj);
            }

            return Json(new { list });
        }


        // public IActionResult GetApplications(int ServiceId, string type, int page, int size)
        // {
        //     // Get officer details
        //     var officer = GetOfficerDetails();

        //     // Define SQL parameters
        //     var OfficerId = new SqlParameter("@OfficerId", officer.UserId);
        //     var ActionTaken = new SqlParameter("@ActionTaken", (type == "Approve" || type == "Pool") ? "Pending" : type);
        //     var serviceId = new SqlParameter("@ServiceId", ServiceId);

        //     // Logging for debugging purposes
        //     _logger.LogInformation($"-------------Service ID: {ServiceId}---------");

        //     // Execute stored procedure
        //     var applications = dbcontext.Applications
        //         .FromSqlRaw("EXEC GetFilteredApplications @OfficerId, @ActionTaken, @ServiceId", OfficerId, ActionTaken, serviceId)
        //         .ToList();

        //     // Declare dynamic variable for processed applications data
        //     dynamic? Applications;

        //     // Process applications based on the type
        //     switch (type)
        //     {
        //         case "Pending":
        //             Applications = GetPendingApplications(applications, ServiceId);
        //             break;
        //         case "Approve":
        //             Applications = GetApproveApplications(applications, ServiceId);
        //             break;
        //         case "Pool":
        //             Applications = GetPoolApplications(applications, ServiceId);
        //             break;
        //         case "Forwarded":
        //         case "Returned":
        //             Applications = GetForwardReturnApplications(applications);
        //             break;
        //         case "ReturnToEdit":
        //         case "Rejected":
        //         case "Sanctioned":
        //             Applications = GetRejectReturnToEdit(applications);
        //             break;
        //         default:
        //             return BadRequest($"Unknown application type: {type}");
        //     }

        //     // Apply pagination only after retrieving relevant data
        //     List<dynamic> paginatedData = Applications!.data;

        //     // Return paginated data along with columns and total count
        //     return Json(new
        //     {
        //         data = paginatedData.Skip(page * size).Take(size).ToList(),
        //         columns = Applications.columns,
        //         totalCount = Applications.totalCount
        //     });
        // }

        // public IActionResult GetUserDetails(string applicationId)
        // {
        //     var officerDetails = GetOfficerDetails();
        //     var (userDetails, preAddressDetails, perAddressDetails, serviceSpecific, bankDetails, documents) = helper.GetUserDetailsAndRelatedData(applicationId);

        //     var applicationStatus = dbcontext.ApplicationStatuses.FirstOrDefault(stat => stat.ApplicationId == applicationId);
        //     applicationStatus!.CanPull = false;
        //     dbcontext.SaveChanges();

        //     var generalDetails = new List<KeyValuePair<string, object>>
        //     {
        //         new("Reference Number", userDetails.ApplicationId),
        //         new("Applicant Name", userDetails.ApplicantName),
        //         new("Applicant Image", userDetails.ApplicantImage),
        //         new("Email", userDetails.Email),
        //         new("Mobile Number", userDetails.MobileNumber),
        //         new("Parentage", userDetails.RelationName + $"({userDetails.Relation})"),
        //         new("Date Of Birth", userDetails.DateOfBirth),
        //         new("Category", userDetails.Category),
        //         new("Submission Date", userDetails.SubmissionDate)
        //     };

        //     foreach (var kvp in serviceSpecific!)
        //     {
        //         string key = kvp.Key;
        //         string value = kvp.Value;
        //         bool isDigitOnly = value.All(char.IsDigit);
        //         if (!isDigitOnly)
        //         {
        //             generalDetails.Insert(8, new KeyValuePair<string, object>(FormatKey(key), value));
        //         }
        //     }

        //     var presentAddressDetails = new List<KeyValuePair<string, object>>{
        //         new("Address",preAddressDetails.Address!),
        //         new("District",preAddressDetails.District!),
        //         new("Tehsil",preAddressDetails.Tehsil!),
        //         new("Block",preAddressDetails.Block!),
        //         new("Panchayat/Muncipality",preAddressDetails.PanchayatMuncipality!),
        //         new("Village",preAddressDetails.Village!),
        //         new("Ward",preAddressDetails.Ward!),
        //         new("Pincode",preAddressDetails.Pincode!),
        //     };

        //     var permanentAddressDetails = new List<KeyValuePair<string, object>>{
        //         new("Address",perAddressDetails.Address!),
        //         new("District",perAddressDetails.District!),
        //         new("Tehsil",perAddressDetails.Tehsil!),
        //         new("Block",perAddressDetails.Block!),
        //         new("Panchayat/Muncipality",perAddressDetails.PanchayatMuncipality!),
        //         new("Village",perAddressDetails.Village!),
        //         new("Ward",perAddressDetails.Ward!),
        //         new("Pincode",perAddressDetails.Pincode!),
        //     };

        //     var BankDetails = new List<KeyValuePair<string, object>>{
        //         new("Bank Name",bankDetails.BankName),
        //         new("Branch Name",bankDetails.BranchName),
        //         new("IFSC Code",bankDetails.IfscCode),
        //         new("Account Number",bankDetails.AccountNumber),
        //     };

        //     int serviceId = userDetails.ServiceId;
        //     var permissions = dbcontext.WorkFlows.FirstOrDefault(wf => wf.ServiceId == userDetails.ServiceId && wf.Role == officerDetails.Role);
        //     var workFlow = dbcontext.WorkFlows.Where(wf => wf.ServiceId == userDetails.ServiceId).ToList();

        //     string nextOfficer = workFlow.FirstOrDefault(wf => wf.SequenceOrder == permissions!.SequenceOrder + 1)?.Role ?? "";
        //     string previousOfficer = permissions!.SequenceOrder > 1
        //         ? workFlow.FirstOrDefault(wf => wf.SequenceOrder == permissions!.SequenceOrder - 1)!.Role ?? ""
        //         : "";

        //     List<dynamic> actionOptions = [];
        //     if (permissions!.CanForward) actionOptions.Add(new { label = $"Forward to {nextOfficer}", value = "forward" });
        //     if (permissions.CanReturn) actionOptions.Add(new { label = $"Return to {previousOfficer}", value = "return" });
        //     if (permissions.CanReturnToEdit) actionOptions.Add(new { label = $"Return to Citizen", value = "returnToEdit" });
        //     if (permissions.CanUpdate) actionOptions.Add(new { label = $"Update and Forward to {nextOfficer}", value = "updateAndForward" });
        //     if (permissions.CanSanction) actionOptions.Add(new { label = $"Issue Sanction Letter", value = "sanction" });
        //     if (permissions.CanReject) actionOptions.Add(new { label = $"Rejected", value = "reject" });

        //     List<dynamic> editList = [];
        //     HashSet<string> uniqueLabels = [];
        //     var serviceContent = dbcontext.Services.FirstOrDefault(s => s.ServiceId == userDetails.ServiceId);
        //     var formElements = JsonConvert.DeserializeObject<dynamic>(serviceContent!.FormElement!);
        //     var officerEditableField = JsonConvert.DeserializeObject<dynamic>(serviceContent.OfficerEditableField!);
        //     string property = officerEditableField!["name"];
        //     string EditableValue = "";

        //     if (userDetails.GetType().GetProperty(property) != null)
        //     {
        //         EditableValue = userDetails.GetType().GetProperty(property)!.GetValue(userDetails)!.ToString()!;
        //     }
        //     else
        //     {
        //         EditableValue = serviceSpecific[property];
        //     }

        //     officerEditableField["value"] = EditableValue;

        //     foreach (var section in formElements!)
        //     {
        //         foreach (var element in section.fields)
        //         {
        //             if (element.name != "District" && uniqueLabels.Add((string)element.label))
        //             {
        //                 editList.Add(new { label = element.label, value = element.name });
        //             }
        //         }
        //     }

        //     return Json(new { serviceId, generalDetails, presentAddressDetails, permanentAddressDetails, BankDetails, documents, actionOptions, editList, officerEditableField, currentOfficer = permissions.Role, canSanction = permissions.CanSanction });
        // }

        [HttpPost]
        public async Task<IActionResult> HandleAction([FromForm] IFormCollection form)
        {
            var officer = GetOfficerDetails();
            int officerId = officer.UserId;
            string officerDesignation = officer.Role!;

            // Parsing form data
            int serviceId = Convert.ToInt32(form["serviceId"]);
            string applicationId = form["applicationId"].ToString();
            string action = form["action"].ToString();
            string remarks = form["remarks"].ToString();
            IFormFile? file = null;
            string filePath = "";
            string actionTaken = "";
            string accessLevel = "";
            int accessCode = 0;

            var details = dbcontext.Applications
                .Where(app => app.ApplicationId == applicationId)
                .Select(app => app.ServiceSpecific)
                .FirstOrDefault();

            if (details != null)
            {
                var serviceSpecific = JsonConvert.DeserializeObject<Dictionary<string, string>>(details);
                if (serviceSpecific != null && serviceSpecific.TryGetValue("District", out var districtCode))
                {
                    accessLevel = "District";
                    accessCode = Convert.ToInt32(districtCode);
                }
            }

            switch (action)
            {
                case "returnToEdit":
                    _logger.LogInformation($"-------------Officer ID: {officerId}-----------------");
                    string editList = form["editList"].ToString();
                    helper.UpdateApplication("EditList", editList, new SqlParameter("@ApplicationId", applicationId));
                    ActionReturnToEdit(serviceId, applicationId, officerId, officerDesignation, accessLevel, accessCode, remarks, filePath);
                    break;

                case "updateAndForward":
                    var editableField = JsonConvert.DeserializeObject<dynamic>(form["editableField"].ToString());
                    if (editableField!.serviceSpecific)
                    {
                        var serviceSpecific = JsonConvert.DeserializeObject<dynamic>(dbcontext.Applications.FirstOrDefault(app => app.ApplicationId == applicationId)!.ServiceSpecific);
                        serviceSpecific![editableField.name] = editableField.value;
                        helper.UpdateApplication("ServiceSpecific", serviceSpecific, new SqlParameter("@ApplicationId", applicationId));
                    }
                    else
                    {
                        helper.UpdateApplication(editableField.name, editableField.value, new SqlParameter("@ApplicationId", applicationId));
                    }
                    ActionForward(serviceId, applicationId, officer.UserId, officer.Role!, remarks, filePath, accessLevel, accessCode);
                    break;

                case "forward":
                    file = form.Files["forwardFile"];
                    filePath = file != null ? await helper.GetFilePath(file) : "";
                    ActionForward(serviceId, applicationId, officer.UserId, officer.Role!, remarks, filePath, accessLevel, accessCode);
                    break;

                case "return":
                    ActionReturn(serviceId, applicationId, officer.UserId, officerDesignation, remarks, filePath, accessLevel, accessCode);
                    break;
                case "reject":
                    ActionReject(serviceId, applicationId, officer.UserId, officerDesignation, accessLevel, accessCode, remarks, filePath);
                    break;
                case "sanction":
                    ActionSanction(serviceId, applicationId, officer.UserId, officerDesignation, accessLevel, accessCode, remarks, filePath);
                    break;

                default:
                    return BadRequest("Invalid action specified.");
            }

            return Json(new { status = true, message = $"{actionTaken} action processed successfully.", applicationId, action });
        }
    }
}
