using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace ReactMvcApp.Controllers.User
{
    public partial class UserController : Controller
    {
        [HttpPost]
        public IActionResult SetServiceForm([FromForm] IFormCollection form)
        {
            int serviceId = Convert.ToInt32(form["serviceId"].ToString());
            HttpContext.Session.SetInt32("serviceId", serviceId);
            return Json(new { status = true, url = "/user/form" });
        }
        [HttpGet]
        public dynamic? GetUserDetails()
        {
            int? userId = HttpContext.Session.GetInt32("UserId");
            int initiated = dbcontext.Applications.Where(u => u.CitizenId == userId && u.ApplicationStatus == "Initiated").ToList().Count;
            int incomplete = dbcontext.Applications.Where(u => u.CitizenId == userId && u.ApplicationStatus == "Incomplete").ToList().Count;
            int sanctioned = dbcontext.Applications.Where(u => u.CitizenId == userId && u.ApplicationStatus == "Sanctioned" || u.ApplicationStatus == "Dispatched").ToList().Count;
            var userDetails = dbcontext.Users.FirstOrDefault(u => u.UserId == userId);



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

            // Create the SQL parameter
            var parameter = new SqlParameter("@ApplicationId", ApplicationId);

            // Use SqlQuery<T>() with the parameterized query
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

            List<dynamic> data = [];
            int index = 1;
            foreach (var item in history)
            {
                var cell = new
                {
                    sno = index,
                    receivedOn = item.TakenAt,
                    officer = item.Designation,
                    actionTaken = item.ActionTaken,
                    remarks = item.Remarks
                };
                data.Add(cell);
                index++;
            }

            return Json(new {status=true, data ,columns,totalCount=data.Count });
        }

        [HttpGet]
        public IActionResult GetServiceContent()
        {
            int? serviceId = HttpContext.Session.GetInt32("serviceId");
            var service = dbcontext.Services.FirstOrDefault(ser => ser.ServiceId == serviceId);
            if (service != null)
            {
                return Json(new { status = true, service.ServiceName, service.FormElement, service.ServiceId });
            }
            else return Json(new { status = false, message = "No Service Found" });
        }
        [HttpGet]
        public IActionResult GetAcknowledgement()
        {
            var result = FetchAcknowledgementDetails();
            return Json(result);
        }

        // Private helper method to get the acknowledgement details
        private dynamic FetchAcknowledgementDetails()
        {
            var ApplicationId = HttpContext.Session.GetString("ApplicationId");

            string path = "/files/" + ApplicationId!.Replace("/", "_") + "Acknowledgement.pdf";
            if (string.IsNullOrEmpty(ApplicationId))
            {
                return new { }; // Return an empty dictionary
            }

            var (userDetails, preAddressDetails, perAddressDetails, serviceSpecific, bankDetails,docs) = helper.GetUserDetailsAndRelatedData(ApplicationId!);
            int districtCode = Convert.ToInt32(serviceSpecific["District"]);
            string AppliedDistrict = dbcontext.Districts.FirstOrDefault(d => d.DistrictId == districtCode)?.DistrictName ?? "Unknown District";

            var details = new Dictionary<string, string>
            {
                ["REFERENCE NUMBER"] = userDetails.ApplicationId,
                ["APPLICANT NAME"] = userDetails.ApplicantName,
                ["PARENTAGE"] = userDetails.RelationName + $" ({userDetails.Relation.ToUpper()})",
                ["MOTHER NAME"] = serviceSpecific["MotherName"],
                ["APPLIED DISTRICT"] = AppliedDistrict.ToUpper(),
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

    }
}