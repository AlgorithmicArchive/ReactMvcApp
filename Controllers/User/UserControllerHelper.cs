using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.Differencing;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System.Security.Claims;

namespace ReactMvcApp.Controllers.User
{
    public partial class UserController : Controller
    {
        [HttpPost]
        public IActionResult SetServiceForm([FromForm] IFormCollection form)
        {
            int serviceId = Convert.ToInt32(form["serviceId"].ToString());

            return Json(new { status = true, url = "/user/form" });
        }

        [HttpGet]
        public dynamic? GetUserDetails()
        {
            // Retrieve userId from JWT token
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userId == null)
            {
                return null; // Handle case where userId is not available
            }

            int initiated = dbcontext.Applications
                .Where(u => u.CitizenId.ToString() == userId && u.ApplicationStatus == "Initiated")
                .Count();
            int incomplete = dbcontext.Applications
                .Where(u => u.CitizenId.ToString() == userId && u.ApplicationStatus == "Incomplete")
                .Count();
            int sanctioned = dbcontext.Applications
                .Where(u => u.CitizenId.ToString() == userId &&
                           (u.ApplicationStatus == "Sanctioned" || u.ApplicationStatus == "Dispatched"))
                .Count();

            var userDetails = dbcontext.Users.FirstOrDefault(u => u.UserId.ToString() == userId);

            var details = new
            {
                userDetails,
                initiated,
                incomplete,
                sanctioned
            };

            return details;
        }

        [HttpGet]
        public IActionResult GetDistricts()
        {
            var districts = dbcontext.Districts.ToList();
            return Json(new { status = true, districts });
        }

        [HttpGet]
        public IActionResult GetTehsils(string districtId)
        {
            int.TryParse(districtId, out int DistrictId);
            var tehsils = dbcontext.Tehsils.Where(u => u.DistrictId == DistrictId).ToList();
            return Json(new { status = true, tehsils });
        }

        [HttpGet]
        public IActionResult GetBlocks(string districtId)
        {
            int DistrictId = Convert.ToInt32(districtId);
            var blocks = dbcontext.Blocks.Where(u => u.DistrictId == DistrictId).ToList();
            return Json(new { status = true, blocks });
        }

        [HttpGet]
        public async Task<IActionResult> GetApplicationHistory(string ApplicationId)
        {
            if (string.IsNullOrEmpty(ApplicationId))
            {
                return BadRequest("ApplicationId is required.");
            }

            var parameter = new SqlParameter("@ApplicationId", ApplicationId);

            var history = await dbcontext.Database
                                         .SqlQuery<ApplicationsHistoryModal>($"EXEC GetApplicationsHistory @ApplicationId = {parameter}")
                                         .ToListAsync();

            var columns = new List<dynamic>
            {
                new { label = "S.No", value="sno" },
                new { label = "Receive On",value="receivedOn" },
                new { label = "Officer", value="officer" },
                new { label = "Action Taken",value="actionTaken" },
                new { label = "Remarks",value="remarks" }
            };

            var data = history.Select((item, index) => new
            {
                sno = index + 1,
                receivedOn = item.TakenAt,
                officer = item.Designation,
                actionTaken = item.ActionTaken == "ReturnToEdit" ? "Returned for Edition" : item.ActionTaken,
                remarks = item.Remarks
            }).ToList();

            return Json(new { status = true, data, columns, totalCount = data.Count });
        }

        [HttpGet]
        public IActionResult GetServiceContent(int serviceId)
        {
            // Retrieve the serviceId from the JWT claims or other mechanisms if necessary.
            var service = dbcontext.Services.FirstOrDefault(ser => ser.ServiceId == serviceId);

            if (service != null)
            {
                return Json(new { status = true, service.ServiceName, service.FormElement, service.ServiceId });
            }
            else
            {
                return Json(new { status = false, message = "No Service Found" });
            }
        }

        [HttpGet]
        public IActionResult GetAcknowledgement()
        {
            var result = FetchAcknowledgementDetails();
            return Json(result);
        }

        private dynamic FetchAcknowledgementDetails()
        {
            // Retrieve ApplicationId from JWT claim
            var applicationId = User.FindFirst("ApplicationId")?.Value;

            if (string.IsNullOrEmpty(applicationId))
            {
                return new { }; // Return an empty dictionary
            }

            string path = "/files/" + applicationId.Replace("/", "_") + "Acknowledgement.pdf";

            var (userDetails, preAddressDetails, perAddressDetails, serviceSpecific, bankDetails, docs) = helper.GetUserDetailsAndRelatedData(applicationId);
            int districtCode = Convert.ToInt32(serviceSpecific["District"]);
            string appliedDistrict = dbcontext.Districts.FirstOrDefault(d => d.DistrictId == districtCode)?.DistrictName ?? "Unknown District";

            var details = new Dictionary<string, string>
            {
                ["REFERENCE NUMBER"] = userDetails.ApplicationId,
                ["APPLICANT NAME"] = userDetails.ApplicantName,
                ["PARENTAGE"] = userDetails.RelationName + $" ({userDetails.Relation.ToUpper()})",
                ["MOTHER NAME"] = serviceSpecific["MotherName"],
                ["APPLIED DISTRICT"] = appliedDistrict.ToUpper(),
                ["BANK NAME"] = bankDetails["BankName"],
                ["ACCOUNT NUMBER"] = bankDetails["AccountNumber"],
                ["IFSC CODE"] = bankDetails["IfscCode"],
                ["DATE OF MARRIAGE"] = serviceSpecific["DateOfMarriage"],
                ["DATE OF SUBMISSION"] = userDetails.SubmissionDate!,
                ["PRESENT ADDRESS"] = $"{preAddressDetails.Address}, TEHSIL: {preAddressDetails.Tehsil}, DISTRICT: {preAddressDetails.District}, PIN CODE: {preAddressDetails.Pincode}",
                ["PERMANENT ADDRESS"] = $"{perAddressDetails.Address}, TEHSIL: {perAddressDetails.Tehsil}, DISTRICT: {perAddressDetails.District}, PIN CODE: {perAddressDetails.Pincode}"
            };

            return new { details, path };
        }

        public IActionResult GetEditForm(string applicationId)
        {
            var application = dbcontext.Applications.FirstOrDefault(app => app.ApplicationId == applicationId);
            var editList = JsonConvert.DeserializeObject<string[]>(application!.EditList);
            var serviceSpecific = JsonConvert.DeserializeObject<dynamic>(application.ServiceSpecific);
            var service = dbcontext.Services.FirstOrDefault(s => s.ServiceId == application.ServiceId);
            var formElements = JsonConvert.DeserializeObject<dynamic>(service!.FormElement!);
            List<dynamic> EditFields = [];
            foreach (var element in formElements!)
            {
                var fields = element.fields;
                foreach (var field in fields)
                {
                    string fieldName = field.name.ToString();
                    string value = "";
                    if (editList!.Contains(fieldName))
                    {
                        if (application.GetType().GetProperty(fieldName) != null)
                            value = application.GetType().GetProperty(fieldName)!.GetValue(application)!.ToString()!;
                        else
                            value = serviceSpecific![fieldName];

                        field["value"] = value;
                        EditFields.Add(field);
                    }
                }
            }



            return Json(new { EditFields });
        }

        public static bool HasProperty<T>(string propertyName)
        {
            return typeof(T).GetProperty(propertyName) != null;
        }
    }
}
