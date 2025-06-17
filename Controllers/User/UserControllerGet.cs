using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace ReactMvcApp.Controllers.User
{
    public partial class UserController
    {


        [HttpGet]
        public IActionResult GetFormDetails(string applicationId)
        {
            var details = dbcontext.CitizenApplications
                          .FirstOrDefault(ca => ca.ReferenceNumber == applicationId);

            if (details == null)
                return NotFound($"Application ID {applicationId} not found.");

            if (string.IsNullOrWhiteSpace(details.FormDetails))
                return BadRequest("FormDetails is empty.");

            dynamic formDetails;
            try
            {
                formDetails = JsonConvert.DeserializeObject<dynamic>(details.FormDetails)!;
            }
            catch (JsonException)
            {
                return BadRequest("Malformed JSON in FormDetails.");
            }

            if (!string.IsNullOrWhiteSpace(details.AdditionalDetails))
            {
                dynamic additionalDetails;
                try
                {
                    additionalDetails = JsonConvert.DeserializeObject<dynamic>(details.AdditionalDetails)!;
                }
                catch (JsonException)
                {
                    return BadRequest("Malformed JSON in AdditionalDetails.");
                }

                return Json(new { formDetails, additionalDetails });
            }

            return Json(new { formDetails, AdditionalDetails = "" });
        }
        public IActionResult GetInitiatedApplications()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // Ensure that you filter by the correct "Initiated" status
            var applications = dbcontext.CitizenApplications
                                        .Where(u => u.CitizenId.ToString() == userIdClaim && u.Status != "Incomplete")
                                        .ToList();

            // Initialize columns
            var columns = new List<dynamic>
            {
                new { header = "S.No", accessorKey = "sno" },
                new { header = "Reference Number", accessorKey = "referenceNumber" },
                new { header = "Applicant Name", accessorKey = "applicantName" },
                new { header = "Currently With", accessorKey = "currentlyWith" },
                new { header = "Status", accessorKey = "status" },
            };

            // Correctly initialize data list
            List<dynamic> data = [];
            List<dynamic> customActions = [];
            int index = 1;
            Dictionary<string, string> actionMap = new()
            {
                {"pending","Pending"},
                {"forwarded","Forwarded"},
                {"sanctioned","Sanctioned"},
                {"returned","Returned"},
                {"rejected","Rejected"},
                {"returntoedit","Returned to citizen for edition"},
                {"Deposited","Inserted to Bank File"},
                {"Dispatched","Payment Under Process"},
                {"Disbursed","Payment Disbursed"},
                {"Failure","Payment Failed"},
            };

            foreach (var application in applications)
            {
                var formDetails = JsonConvert.DeserializeObject<dynamic>(application.FormDetails!);
                var officers = JsonConvert.DeserializeObject<dynamic>(application.WorkFlow!) as JArray;
                var currentPlayer = application.CurrentPlayer;
                data.Add(new
                {
                    sno = index,
                    referenceNumber = application.ReferenceNumber,
                    applicantName = GetFieldValue("ApplicantName", formDetails),
                    currentlyWith = officers![currentPlayer]["designation"],
                    status = actionMap[(string)officers[currentPlayer]["status"]!],
                    serviceId = application.ServiceId
                });

                if ((string)officers[currentPlayer]["status"]! != "returntoedit" && (string)officers[currentPlayer]["status"]! != "sanctioned")
                {
                    customActions.Add(new { id = index, tooltip = "View", color = "#F0C38E", actionFunction = "CreateTimeLine" });
                }
                else if ((string)officers[currentPlayer]["status"]! == "sanctioned")
                {
                    customActions.Add(new { id = index, tooltip = "View", color = "#F0C38E", actionFunction = "CreateTimeLine" });
                    customActions.Add(new { id = index, tooltip = "Download", color = "#F0C38E", actionFunction = "DownloadSanctionLetter" });
                }
                else
                {
                    customActions.Add(new { id = index, tooltip = "Edit Form", color = "#F0C38E", actionFunction = "EditForm" });
                }
                index++;
            }

            // Ensure size is positive for pagination
            return Json(new { data, columns, customActions });
        }
        public IActionResult IncompleteApplications()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // Ensure that you filter by the correct "Initiated" status
            var applications = dbcontext.CitizenApplications
                                        .Where(u => u.CitizenId.ToString() == userIdClaim && u.Status == "Incomplete")
                                        .ToList();

            // Initialize columns
            var columns = new List<dynamic>
            {
                new { header = "S.No", accessorKey = "sno" },
                new { header = "Reference Number", accessorKey = "referenceNumber" },
            };

            // Correctly initialize data list
            List<dynamic> data = [];
            List<dynamic> customActions = [];
            int index = 1;


            foreach (var application in applications)
            {
                var formDetails = JsonConvert.DeserializeObject<dynamic>(application.FormDetails!);
                data.Add(new
                {
                    sno = index,
                    referenceNumber = application.ReferenceNumber,
                    serviceId = application.ServiceId,
                });
                customActions.Add(new { id = index, tooltip = "Edit", color = "#F0C38E", actionFunction = "IncompleteForm" });
                index++;
            }

            // Ensure size is positive for pagination
            return Json(new { data, columns, customActions });
        }




    }
}