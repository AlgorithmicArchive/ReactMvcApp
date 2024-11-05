using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using ReactMvcApp.Models.Entities;

namespace ReactMvcApp.Controllers.Officer
{
    public partial class OfficerController : Controller
    {

        public static string FormatKey(string input)
        {
            if (string.IsNullOrEmpty(input))
                return input;

            // Use Regex to insert space before each capital letter, except for the first one
            string result = Regex.Replace(input, "(?<!^)([A-Z])", " $1");

            return result;
        }

        // Applications List
        public dynamic GetPendingApplications(List<Application> applications)
        {
            var columns = new List<dynamic>
            {
                new { label = "S.No", value = "sno" },
                new { label = "Reference Number", value = "referenceNumber" },
                new { label = "Applicant Name", value = "applicantName" },
                new { label = "Submission Date", value = "submissionDate" },
                new { label = "Action", value = "button" }
            };

            var addedColumns = new HashSet<string>(); // Track the keys already added to columns

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

                    if (!isDigitOnly && !addedColumns.Contains(key.ToLower()))
                    {
                        // Insert the new key-value pair at a specific index, e.g., at index 3
                        cell.Insert(3, new KeyValuePair<string, object>(key.ToLower(), value));
                        // Optionally, insert the new label into columns if needed, only if not already added
                        columns.Insert(3, new { label = key, value = key.ToLower() });
                        addedColumns.Add(key.ToLower()); // Add key to the set to prevent duplicates
                    }
                }

                // Convert cell back to a dictionary if you need it as a dictionary
                var cellDictionary = cell.ToDictionary(kvp => kvp.Key, kvp => kvp.Value);
                data.Add(cellDictionary);

                index++;
            }

            return new { columns, data, totalCount = data.Count };
        }
        public dynamic GetForwardApplications(List<Application> applications)
        {
            var columns = new List<dynamic>
            {
                new { label = "S.No", value = "sno" },
                new { label = "Reference Number", value = "referenceNumber" },
                new { label = "Applicant Name", value = "applicantName" },
                new { label = "Submission Date", value = "submissionDate" },
                new { label = "Action", value = "button" }
            };

            List<dynamic> data = [];
            int index = 1;
            var addedColumns = new HashSet<string>(); // Track the keys already added to columns

            foreach (var item in applications)
            {
                var button = new
                {
                    function = "PullApplication",
                    parameters = new[] { item.ApplicationId },
                    buttonText = "Pull"
                };

                bool canPull = dbcontext.ApplicationStatuses.FirstOrDefault(stat => stat.ApplicationId == item.ApplicationId)!.CanPull;

                var serviceSpecific = JsonConvert.DeserializeObject<Dictionary<string, string>>(item.ServiceSpecific);

                // Initialize cell as a list of key-value pairs
                var cell = new List<KeyValuePair<string, object>>
                {
                    new("sno", index),
                    new("referenceNumber", item.ApplicationId),
                    new("applicantName", item.ApplicantName),
                    new("submissionDate", item.SubmissionDate),
                    new("button", canPull?button:"Cannot Pull")
                };

                foreach (var kvp in serviceSpecific!)
                {
                    string key = kvp.Key;
                    string value = kvp.Value;
                    bool isDigitOnly = value.All(char.IsDigit);

                    if (!isDigitOnly)
                    {
                        if (!addedColumns.Contains(key.ToLower()))
                            columns.Insert(3, new { label = key, value = key.ToLower() });

                        cell.Insert(3, new KeyValuePair<string, object>(key.ToLower(), value));
                        addedColumns.Add(key.ToLower()); // Add key to the set to prevent duplicates
                    }
                }
                // Convert cell back to a dictionary if you need it as a dictionary
                var cellDictionary = cell.ToDictionary(kvp => kvp.Key, kvp => kvp.Value);
                data.Add(cellDictionary);
                // Do something with cellDictionary (e.g., add it to a list or process it further)

                index++;
            }



            return new { columns, data, totalCount = data.Count };
        }


        // Application History
        public IActionResult GetApplicationHistory(string applicationId, int page, int size)
        {
            var applicationHistory = dbcontext.Database.SqlQuery<ApplicationsHistoryModal>($"EXEC GetApplicationsHistory @ApplicationId = {new SqlParameter("@ApplicationId", applicationId)}").AsEnumerable().Skip(page * size).Take(size).ToList();
            var columns = new List<dynamic>{
                new {label="S.No.",value="sno"},
                new {label="Designation",value="designation"},
                new {label="Action Taken",value="actionTaken"},
                new {label="Remarks",value="remarks"},
                new {label="Taken On/Received On",value="takenOn"},
            };
            List<dynamic> data = [];
            int index = 1;
            foreach (var item in applicationHistory)
            {
                var cell = new
                {
                    sno = index,
                    designation = item.Designation,
                    actionTaken = item.ActionTaken,
                    remarks = item.Remarks,
                    takenOn = item.TakenAt
                };
                data.Add(cell);
                index++;
            }
            return Json(new { columns, data, totalCount = data.Count });
        }


        // Officer Actions
        public void ActionForward(int serviceId, string applicationId, int officerId, string officerDesignation, string remarks, string filePath, string accessLevel, int accessCode)
        {
            // Retrieve the next officer's role using the GetAdjacentRole stored procedure
            var nextOfficer = dbcontext.WorkFlows
                                       .FromSqlRaw("EXEC GetAdjacentRole @ServiceId, @Role, @Direction",
                                                   new SqlParameter("@ServiceId", serviceId),
                                                   new SqlParameter("@Role", officerDesignation),
                                                   new SqlParameter("@Direction", "NEXT"))
                                       .AsEnumerable() // Bring the result into memory to avoid composition issues
                                       .FirstOrDefault();

            // Find the next officer's ID based on their role and access levels (LINQ applied after data is in memory)
            int nextOfficerId = dbcontext.OfficerDetails
                                        .Where(of => of.Role == nextOfficer!.Role &&
                                                     ((of.AccessLevel == accessLevel && of.AccessCode == accessCode) ||
                                                     of.AccessLevel == "State"))
                                        .Select(of => of.OfficerId)
                                        .FirstOrDefault();

            // Get the current date in the desired format
            string currentDate = DateTime.Now.ToString("dd MMM yyyy hh:mm:ss tt");

            // Execute the stored procedure to update the status and history
            dbcontext.Database.ExecuteSqlRaw("EXEC Status_History_Count_Forward @ServiceId, @ApplicationId, @OfficerId, @NextOfficerId, @Remarks, @FilePath, @Date",
                                              new SqlParameter("@ServiceId", serviceId),
                                              new SqlParameter("@ApplicationId", applicationId),
                                              new SqlParameter("@OfficerId", officerId),
                                              new SqlParameter("@NextOfficerId", nextOfficerId),
                                              new SqlParameter("@Remarks", remarks),
                                              new SqlParameter("@FilePath", filePath ?? (object)DBNull.Value), // Handle null FilePath
                                              new SqlParameter("@Date", currentDate));
        }
        public void ActionReturn(int serviceId, string applicationId, int officerId, string officerDesignation, string remarks, string filePath, string accessLevel, int accessCode)
        {
            // Retrieve the next officer's role using the GetAdjacentRole stored procedure
            var previousOfficer = dbcontext.WorkFlows
                                       .FromSqlRaw("EXEC GetAdjacentRole @ServiceId, @Role, @Direction",
                                                   new SqlParameter("@ServiceId", serviceId),
                                                   new SqlParameter("@Role", officerDesignation),
                                                   new SqlParameter("@Direction", "PREVIOUS"))
                                       .AsEnumerable() // Bring the result into memory to avoid composition issues
                                       .FirstOrDefault();

            // Find the previous officer's ID based on their role and access levels (LINQ applied after data is in memory)
            int previousOfficerId = dbcontext.OfficerDetails
                                        .Where(of => of.Role == previousOfficer!.Role &&
                                                     ((of.AccessLevel == accessLevel && of.AccessCode == accessCode) ||
                                                     of.AccessLevel == "State"))
                                        .Select(of => of.OfficerId)
                                        .FirstOrDefault();

            // Get the current date in the desired format
            string currentDate = DateTime.Now.ToString("dd MMM yyyy hh:mm:ss tt");

            // Execute the stored procedure to update the status and history for returning the application
            dbcontext.Database.ExecuteSqlRaw("EXEC Status_History_Count_Return @ServiceId, @ApplicationId, @OfficerId, @PreviousOfficerId, @Remarks, @FilePath, @Date",
                                              new SqlParameter("@ServiceId", serviceId),
                                              new SqlParameter("@ApplicationId", applicationId),
                                              new SqlParameter("@OfficerId", officerId),
                                              new SqlParameter("@PreviousOfficerId", previousOfficerId),
                                              new SqlParameter("@Remarks", remarks),
                                              new SqlParameter("@FilePath", filePath ?? (object)DBNull.Value), // Handle null FilePath
                                              new SqlParameter("@Date", currentDate));
        }
        public void ActionReject(int serviceId, string applicationId, int officerId, string remarks, string filePath)
        {
            // Get the current date in the desired format
            string currentDate = DateTime.Now.ToString("dd MMM yyyy hh:mm:ss tt");

            // Execute the stored procedure to update the status and history for rejection
            dbcontext.Database.ExecuteSqlRaw("EXEC Status_History_Count_Reject @ServiceId, @ApplicationId, @OfficerId, @Remarks, @FilePath, @Date",
                                              new SqlParameter("@ServiceId", serviceId),
                                              new SqlParameter("@ApplicationId", applicationId),
                                              new SqlParameter("@OfficerId", officerId),
                                              new SqlParameter("@Remarks", remarks),
                                              new SqlParameter("@FilePath", filePath ?? (object)DBNull.Value), // Handle null FilePath
                                              new SqlParameter("@Date", currentDate));
        }
        public void ActionSanction(int serviceId, string applicationId, int officerId, string remarks, string filePath)
        {
            // Get the current date in the desired format
            string currentDate = DateTime.Now.ToString("dd MMM yyyy hh:mm:ss tt");

            // Execute the stored procedure to update the status and history for sanctioning
            dbcontext.Database.ExecuteSqlRaw("EXEC Status_History_Count_Sanction @ServiceId, @ApplicationId, @OfficerId, @Remarks, @FilePath, @Date",
                                              new SqlParameter("@ServiceId", serviceId),
                                              new SqlParameter("@ApplicationId", applicationId),
                                              new SqlParameter("@OfficerId", officerId),
                                              new SqlParameter("@Remarks", remarks),
                                              new SqlParameter("@FilePath", filePath ?? (object)DBNull.Value), // Handle null FilePath
                                              new SqlParameter("@Date", currentDate));
        }
        public void ActionReturnToEdit(int serviceId, string applicationId, int officerId, string remarks, string filePath)
        {
            // Get the current date in the desired format
            string currentDate = DateTime.Now.ToString("dd MMM yyyy hh:mm:ss tt");

            // Execute the stored procedure to update the status and history for returning the application to the citizen for editing
            dbcontext.Database.ExecuteSqlRaw("EXEC Status_History_Count_ReturnToEdit @ServiceId, @ApplicationId, @OfficerId, @Remarks, @FilePath, @Date",
                                              new SqlParameter("@ServiceId", serviceId),
                                              new SqlParameter("@ApplicationId", applicationId),
                                              new SqlParameter("@OfficerId", officerId),
                                              new SqlParameter("@Remarks", remarks),
                                              new SqlParameter("@FilePath", filePath ?? (object)DBNull.Value), // Handle null FilePath
                                              new SqlParameter("@Date", currentDate));
        }



    }
}