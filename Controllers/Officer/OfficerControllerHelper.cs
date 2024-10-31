using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using ReactMvcApp.Models.Entities;

namespace ReactMvcApp.Controllers.Officer
{
    public partial class OfficerController : Controller
    {
        public dynamic GetPendingApplications(List<Application> applications)
        {
            var columns = new List<dynamic>
            {
                new { label = "S.No", value = "sno" },
                new { label = "Reference Number", value = "referenceNumber" },
                new { label = "Applicant Name", value = "applicantName" },
                // new { label = "Date Of Marriage", value = "dateOfMarriage" },
                new { label = "Submission Date", value = "submissionDate" },
                new { label = "Action", value = "button" }
            };

            List<dynamic> data = [];
            int index = 1;

            foreach (var item in applications)
            {
                var button = new
                {
                    function = "UserDetails",
                    parameters = new[] { item.ApplicationId },
                    buttonText = "View"
                };

                var serviceSpecific = JsonConvert.DeserializeObject<Dictionary<string, string>>(item.ServiceSpecific);

                // Initialize cell as a list of key-value pairs
                var cell = new List<KeyValuePair<string, object>>
                {
                    new("sno", index),
                    new("referenceNumber", item.ApplicationId),
                    new("applicantName", item.ApplicantName),
                    new("submissionDate", item.SubmissionDate),
                    new("button", button)
                };

                foreach (var kvp in serviceSpecific!)
                {
                    string key = kvp.Key;
                    string value = kvp.Value;
                    bool isDigitOnly = value.All(char.IsDigit);

                    if (!isDigitOnly)
                    {
                        // Insert the new key-value pair at a specific index, e.g., at index 3
                        cell.Insert(3, new KeyValuePair<string, object>(key.ToLower(), value));
                        // Optionally, insert the new label into columns if needed
                        columns.Insert(3, new { label = key, value = key.ToLower() });
                    }
                }

                // Convert cell back to a dictionary if you need it as a dictionary
                var cellDictionary = cell.ToDictionary(kvp => kvp.Key, kvp => kvp.Value);
                data.Add(cellDictionary);
                // Do something with cellDictionary (e.g., add it to a list or process it further)

                index++;
            }



            return new {columns,data,totalCount = data.Count};
        }
    
        
    }
}