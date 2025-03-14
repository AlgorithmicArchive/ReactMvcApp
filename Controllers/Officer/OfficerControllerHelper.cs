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

        // // Applications List
        // public dynamic GetPendingApplications(List<Application> applications, int serviceId)
        // {
        //     var officer = GetOfficerDetails();
        //     var lists = dbcontext.ApplicationLists
        //        .FirstOrDefault(al => al.ServiceId == serviceId && al.Officer == officer.Role && al.AccessLevel == officer.AccessLevel && al.AccessCode == officer.AccessCode);

        //     // Initialize lists to avoid null reference issues
        //     List<string> pendingList = [];
        //     List<string> approveList = [];
        //     List<string> poolList = [];

        //     // If lists is not null, deserialize ApprovalList and PoolList
        //     if (lists != null)
        //     {
        //         approveList = JsonConvert.DeserializeObject<List<string>>(lists.ApprovalList) ?? [];
        //         poolList = JsonConvert.DeserializeObject<List<string>>(lists.PoolList) ?? [];
        //     }
        //     var columns = new List<dynamic>
        //     {
        //         new { label = "S.No", value = "sno" },
        //         new { label = "Reference Number", value = "referenceNumber" },
        //         new { label = "Applicant Name", value = "applicantName" },
        //         new { label = "Submission Date", value = "submissionDate" },
        //         new { label = "Action", value = "button" }
        //     };

        //     var addedColumns = new HashSet<string>(); // Track the keys already added to columns

        //     List<dynamic> data = [];
        //     int index = 1;

        //     foreach (var item in applications)
        //     {
        //         var button = new
        //         {
        //             function = "UserDetails",
        //             parameters = new[] { item.ApplicationId },
        //             buttonText = "View"
        //         };

        //         var serviceSpecific = JsonConvert.DeserializeObject<Dictionary<string, string>>(item.ServiceSpecific);

        //         // Initialize cell as a list of key-value pairs
        //         var cell = new List<KeyValuePair<string, object>>
        //         {
        //             new("sno", index),
        //             new("referenceNumber", item.ApplicationId),
        //             new("applicantName", item.ApplicantName),
        //             new("submissionDate", item.SubmissionDate),
        //             new("button", button)
        //         };

        //         foreach (var kvp in serviceSpecific!)
        //         {
        //             string key = kvp.Key;
        //             string value = kvp.Value;
        //             bool isDigitOnly = value.All(char.IsDigit);

        //             if (!isDigitOnly && !addedColumns.Contains(key.ToLower()))
        //             {
        //                 // Optionally, insert the new label into columns if needed, only if not already added
        //                 columns.Insert(3, new { label = key, value = key.ToLower() });
        //                 addedColumns.Add(key.ToLower()); // Add key to the set to prevent duplicates
        //             }
        //             // Insert the new key-value pair at a specific index, e.g., at index 3
        //             cell.Insert(3, new KeyValuePair<string, object>(key.ToLower(), value));
        //         }

        //         // Convert cell back to a dictionary if you need it as a dictionary
        //         var cellDictionary = cell.ToDictionary(kvp => kvp.Key, kvp => kvp.Value);
        //         if (!approveList.Contains(item.ApplicationId) && !poolList.Contains(item.ApplicationId))
        //         {
        //             data.Add(cellDictionary);
        //         }


        //         index++;
        //     }

        //     return new { columns, data, totalCount = data.Count };
        // }
        // public dynamic GetApproveApplications(List<Application> applications, int serviceId)
        // {
        //     var officer = GetOfficerDetails();
        //     var lists = dbcontext.ApplicationLists
        //      .FirstOrDefault(al => al.ServiceId == serviceId && al.Officer == officer.Role && al.AccessLevel == officer.AccessLevel && al.AccessCode == officer.AccessCode);
        //     List<string> approveList = JsonConvert.DeserializeObject<List<string>>(lists!.ApprovalList) ?? [];

        //     var columns = new List<dynamic>
        //     {
        //         new { label = "S.No", value = "sno" },
        //         new { label = "Reference Number", value = "referenceNumber" },
        //         new { label = "Applicant Name", value = "applicantName" },
        //         new { label = "Submission Location", value = "submissionLocation" },
        //         new { label = "Parentage", value = "parentage" },
        //         new { label = "Date Of Birth", value = "dateOfBirth" },
        //         new { label = "Bank Details", value = "bankDetails" },
        //         new { label = "Address", value = "address" },
        //         new { label = "Submission Date", value = "submissionDate" }
        //     };

        //     var addedColumns = new HashSet<string>(); // Track the keys already added to columns

        //     List<dynamic> data = [];
        //     int index = 1;

        //     foreach (var item in applications)
        //     {
        //         _logger.LogInformation($"--------Application Id: {item.ApplicationId}--------------");
        //         var (userDetails, preAddressDetails, perAddressDetails, serviceSpecific, bankDetails, documents) = helper.GetUserDetailsAndRelatedData(item.ApplicationId);
        //         int DistrictCode = Convert.ToInt32(serviceSpecific["District"]);
        //         string appliedDistrict = dbcontext.Districts.FirstOrDefault(d => d.DistrictId == DistrictCode)!.DistrictName.ToUpper();


        //         // Initialize cell as a list of key-value pairs
        //         var cell = new List<KeyValuePair<string, object>>
        //         {
        //             new("sno", index),
        //             new("referenceNumber", item.ApplicationId),
        //             new("applicantName", item.ApplicantName),
        //             new("submissionLocation", appliedDistrict),
        //             new("parentage", item.RelationName + $" ({item.Relation.ToUpper()})"),
        //             new("dateOfBirth", item.DateOfBirth),
        //             new("bankDetails", $"{bankDetails["BankName"]}/{bankDetails["IfscCode"]}/{bankDetails["AccountNumber"]}"),
        //             new("address",  $"{preAddressDetails.Address!.ToUpper()}, TEHSIL:{preAddressDetails.Tehsil!.ToUpper()}, DISTRICT:{preAddressDetails.District!.ToUpper()}, PINCODE:{preAddressDetails.Pincode}"),
        //             new("submissionDate", item.SubmissionDate),
        //         };

        //         foreach (var kvp in serviceSpecific!)
        //         {
        //             string key = kvp.Key;
        //             string value = kvp.Value;
        //             bool isDigitOnly = value.All(char.IsDigit);

        //             if (!isDigitOnly && !addedColumns.Contains(key.ToLower()))
        //             {
        //                 // Insert the new key-value pair at a specific index, e.g., at index 3
        //                 // Optionally, insert the new label into columns if needed, only if not already added
        //                 columns.Insert(6, new { label = key, value = key.ToLower() });
        //                 addedColumns.Add(key.ToLower()); // Add key to the set to prevent duplicates
        //             }
        //             cell.Insert(6, new KeyValuePair<string, object>(key.ToLower(), value));
        //         }

        //         // Convert cell back to a dictionary if you need it as a dictionary
        //         var cellDictionary = cell.ToDictionary(kvp => kvp.Key, kvp => kvp.Value);
        //         if (approveList.Contains(item.ApplicationId))
        //             data.Add(cellDictionary);

        //         index++;
        //     }
        //     return new { columns, data, totalCount = data.Count };
        // }
        // public dynamic GetPoolApplications(List<Application> applications, int serviceId)
        // {
        //     var officer = GetOfficerDetails();
        //     var lists = dbcontext.ApplicationLists
        //        .FirstOrDefault(al => al.ServiceId == serviceId && al.Officer == officer.Role && al.AccessLevel == officer.AccessLevel && al.AccessCode == officer.AccessCode);

        //     // Initialize lists to avoid null reference issues
        //     List<string> poolList = JsonConvert.DeserializeObject<List<string>>(lists?.PoolList ?? "[]") ?? [];

        //     // Define pool-specific columns
        //     var poolColumns = new List<dynamic>
        //     {
        //         new { label = "S.No", value = "sno" },
        //         new { label = "Reference Number", value = "referenceNumber" },
        //         new { label = "Applicant Name", value = "applicantName" },
        //         new { label = "Submission Date", value = "submissionDate" },
        //         new { label = "Action", value = "button" }
        //     };

        //     var addedColumns = new HashSet<string>(); // Track dynamically added columns to avoid duplicates

        //     List<dynamic> data = [];
        //     int index = 1;

        //     foreach (var item in applications)
        //     {
        //         var button = new
        //         {
        //             function = "UserDetails",
        //             parameters = new[] { item.ApplicationId },
        //             buttonText = "View"
        //         };

        //         var serviceSpecific = JsonConvert.DeserializeObject<Dictionary<string, string>>(item.ServiceSpecific);

        //         // Initialize cell as a list of key-value pairs
        //         var cell = new List<KeyValuePair<string, object>>
        //         {
        //             new("sno", index),
        //             new("referenceNumber", item.ApplicationId),
        //             new("applicantName", item.ApplicantName),
        //             new("submissionDate", item.SubmissionDate),
        //             new("button", button)
        //         };

        //         foreach (var kvp in serviceSpecific!)
        //         {
        //             string key = kvp.Key;
        //             string value = kvp.Value;
        //             bool isDigitOnly = value.All(char.IsDigit);

        //             if (!isDigitOnly && !addedColumns.Contains(key.ToLower()))
        //             {
        //                 // Insert the new key-value pair into cell data

        //                 // Add the dynamic column to poolColumns only if not already added
        //                 poolColumns.Insert(3, new { label = key, value = key.ToLower() });
        //                 addedColumns.Add(key.ToLower()); // Add key to set to prevent duplicates
        //             }
        //             cell.Insert(3, new KeyValuePair<string, object>(key.ToLower(), value));
        //         }

        //         // Convert cell to dictionary for adding to data list
        //         var cellDictionary = cell.ToDictionary(kvp => kvp.Key, kvp => kvp.Value);

        //         // Only add applications in the poolList
        //         if (poolList.Contains(item.ApplicationId))
        //             data.Add(cellDictionary);

        //         index++;
        //     }

        //     return new { columns = poolColumns, data, totalCount = data.Count };
        // }

        // public dynamic GetForwardReturnApplications(List<Application> applications)
        // {
        //     var officerDetails = GetOfficerDetails();
        //     var columns = new List<dynamic>
        //     {
        //         new { label = "S.No", value = "sno" },
        //         new { label = "Reference Number", value = "referenceNumber" },
        //         new { label = "Applicant Name", value = "applicantName" },
        //         new { label = "Submission Date", value = "submissionDate" },
        //         new { label = "Action", value = "button" }
        //     };

        //     List<dynamic> data = [];
        //     int index = 1;
        //     var addedColumns = new HashSet<string>(); // Track the keys already added to columns

        //     foreach (var item in applications)
        //     {
        //         var button = new
        //         {
        //             function = "PullApplication",
        //             parameters = new[] { item.ApplicationId },
        //             buttonText = "Call Back"
        //         };
        //         var currentStatus = dbcontext.ApplicationStatuses
        //             .Where(stat => stat.ApplicationId == item.ApplicationId)
        //             .Select(stat => new
        //             {
        //                 ServiceId = (int?)stat.ServiceId ?? 0,              // Default for NULL
        //                 CurrentlyWith = (int?)stat.CurrentlyWith ?? 0,          // Allow nullable
        //                 Status = stat.Status ?? "Unknown",           // Default for NULL
        //                 stat.CanPull,
        //                 LastUpdated = stat.LastUpdated               // Allow nullable if possible
        //             }).FirstOrDefault();

        //         var workFlow = dbcontext.WorkFlows
        //             .Where(wf => wf.ServiceId == item.ServiceId)
        //             .ToList();

        //         var permissions = workFlow.FirstOrDefault(wf => wf.Role == officerDetails.Role);
        //         if (permissions == null || currentStatus == null)
        //         {
        //             // Handle cases where permissions or currentStatus is not found
        //             throw new Exception("Permissions or current application status not found.");
        //         }

        //         string nextOfficer = "";
        //         int nextOfficerId = 0;

        //         // Determine the next officer role and ID
        //         if (permissions.SequenceOrder < workFlow.Max(wf => wf.SequenceOrder))
        //         {
        //             nextOfficer = workFlow.FirstOrDefault(wf => wf.SequenceOrder == permissions.SequenceOrder + 1)?.Role ?? "";
        //             nextOfficerId = dbcontext.OfficerDetails
        //                 .FirstOrDefault(od => (od.AccessCode == officerDetails.AccessCode || od.AccessCode == 0) && od.Role == nextOfficer)?.OfficerId ?? 0;
        //         }

        //         string previousOfficer = "";
        //         int previousOfficerId = 0;

        //         // Determine the previous officer role and ID
        //         if (permissions.SequenceOrder > 1)
        //         {
        //             previousOfficer = workFlow.FirstOrDefault(wf => wf.SequenceOrder == permissions.SequenceOrder - 1)?.Role ?? "";
        //             previousOfficerId = dbcontext.OfficerDetails
        //                 .FirstOrDefault(od => od.AccessCode == officerDetails.AccessCode && od.Role == previousOfficer)?.OfficerId ?? 0;
        //         }
        //         _logger.LogInformation($"---------------NEXT OFFICER: {nextOfficerId} CAN PULL :{currentStatus.CanPull}----------------");

        //         bool canPull = false;
        //         if (nextOfficerId != 0 && currentStatus.CurrentlyWith == nextOfficerId && currentStatus.CanPull)
        //         {
        //             canPull = true;
        //         }
        //         else if (previousOfficerId != 0 && currentStatus.CurrentlyWith == previousOfficerId && currentStatus.CanPull)
        //         {
        //             canPull = true;
        //         }

        //         var serviceSpecific = JsonConvert.DeserializeObject<Dictionary<string, string>>(item.ServiceSpecific);

        //         // Initialize cell as a list of key-value pairs
        //         var cell = new List<KeyValuePair<string, object>>
        //         {
        //             new("sno", index),
        //             new("referenceNumber", item.ApplicationId),
        //             new("applicantName", item.ApplicantName),
        //             new("submissionDate", item.SubmissionDate),
        //             new("button", canPull?button:"Cannot Pull")
        //         };

        //         foreach (var kvp in serviceSpecific!)
        //         {
        //             string key = kvp.Key;
        //             string value = kvp.Value;
        //             bool isDigitOnly = value.All(char.IsDigit);

        //             if (!isDigitOnly)
        //             {
        //                 if (!addedColumns.Contains(key.ToLower()))
        //                     columns.Insert(3, new { label = key, value = key.ToLower() });

        //                 cell.Insert(3, new KeyValuePair<string, object>(key.ToLower(), value));
        //                 addedColumns.Add(key.ToLower()); // Add key to the set to prevent duplicates
        //             }
        //         }
        //         // Convert cell back to a dictionary if you need it as a dictionary
        //         var cellDictionary = cell.ToDictionary(kvp => kvp.Key, kvp => kvp.Value);
        //         data.Add(cellDictionary);
        //         // Do something with cellDictionary (e.g., add it to a list or process it further)

        //         index++;
        //     }



        //     return new { columns, data, totalCount = data.Count };
        // }

        // public dynamic GetRejectReturnToEdit(List<Application> applications)
        // {
        //     var columns = new List<dynamic>
        //     {
        //         new { label = "S.No", value = "sno" },
        //         new { label = "Reference Number", value = "referenceNumber" },
        //         new { label = "Applicant Name", value = "applicantName" },
        //         new { label = "Submission Date", value = "submissionDate" }
        //     };

        //     var data = new List<dynamic>();
        //     int index = 1;
        //     var addedColumns = new HashSet<string>(); // Track the keys already added to columns

        //     foreach (var item in applications)
        //     {
        //         var serviceSpecific = JsonConvert.DeserializeObject<Dictionary<string, string>>(item.ServiceSpecific);
        //         // Initialize cell as a list of key-value pairs
        //         var cell = new List<KeyValuePair<string, object>>
        //         {
        //             new("sno", index),
        //             new("referenceNumber", item.ApplicationId),
        //             new("applicantName", item.ApplicantName),
        //             new("submissionDate", item.SubmissionDate)
        //         };
        //         // Add service-specific fields dynamically to the columns and cell
        //         foreach (var kvp in serviceSpecific!)
        //         {
        //             string key = kvp.Key;
        //             string value = kvp.Value;
        //             bool isDigitOnly = value.All(char.IsDigit);

        //             if (!isDigitOnly)
        //             {
        //                 if (!addedColumns.Contains(key.ToLower()))
        //                 {
        //                     columns.Insert(3, new { label = key, value = key.ToLower() });
        //                     addedColumns.Add(key.ToLower()); // Add key to the set to prevent duplicates
        //                 }
        //                 cell.Insert(3, new KeyValuePair<string, object>(key.ToLower(), value));
        //             }
        //         }

        //         // Convert cell back to a dictionary if you need it as a dictionary
        //         var cellDictionary = cell.ToDictionary(kvp => kvp.Key, kvp => kvp.Value);
        //         data.Add(cellDictionary);

        //         index++;
        //     }

        //     return new { columns, data, totalCount = data.Count };
        // }



        // // Application History
        // public IActionResult GetApplicationHistory(string applicationId, int page, int size)
        // {
        //     var applicationHistory = dbcontext.Database.SqlQuery<ApplicationsHistoryModal>($"EXEC GetApplicationsHistory @ApplicationId = {new SqlParameter("@ApplicationId", applicationId)}").ToList();
        //     var columns = new List<dynamic>{
        //         new {label="S.No.",value="sno"},
        //         new {label="Designation",value="designation"},
        //         new {label="Action Taken",value="actionTaken"},
        //         new {label="Remarks",value="remarks"},
        //         new {label="Taken On/Received On",value="takenOn"},
        //     };
        //     List<dynamic> data = [];
        //     int index = 1;
        //     foreach (var item in applicationHistory)
        //     {
        //         var cell = new
        //         {
        //             sno = index,
        //             designation = item.Designation,
        //             actionTaken = item.ActionTaken,
        //             remarks = item.Remarks,
        //             takenOn = item.TakenAt
        //         };
        //         data.Add(cell);
        //         index++;
        //     }
        //     var paginatedData = data.AsEnumerable().Skip(page * size).Take(size);
        //     return Json(new { columns, data = paginatedData, totalCount = data.Count });
        // }

        // // Payment Details
        // public IActionResult GetPaymentDetails(int page, int size, int? districtId = null)
        // {
        //     var officerDetails = GetOfficerDetails();

        //     // Create SQL parameters
        //     var accessLevelParam = new SqlParameter("@AccessLevel", officerDetails.AccessLevel);
        //     var accessCodeParam = new SqlParameter("@AccessCode", officerDetails.AccessCode);
        //     var districtIdParam = new SqlParameter("@DistrictId",
        //         districtId.HasValue ? (object)districtId.Value : DBNull.Value);

        //     // Execute the stored procedure
        //     var paymentDetails = dbcontext.PaymentDetails
        //         .FromSqlRaw("EXEC GetPaymentDetailsForOfficer @AccessLevel, @AccessCode, @DistrictId",
        //                     accessLevelParam, accessCodeParam, districtIdParam)
        //         .ToList();

        //     // Define columns for the frontend
        //     var columns = new List<dynamic>
        //     {
        //         new { label = "S.No.", value = "sno" },
        //         new { label = "ApplicationId", value = "applicationId" },
        //         new { label = "Applicant Name", value = "applicantName" },
        //         new { label = "Status", value = "status" },
        //         new { label = "Transaction Id", value = "transactionId" },
        //         new { label = "Transaction Status", value = "transactionStatus" },
        //         new { label = "Date Of Disbursion", value = "dateOfDisbursion" },
        //     };

        //     // Process data and paginate results
        //     var data = paymentDetails.Select((item, index) => new
        //     {
        //         sno = index + 1,
        //         applicationId = item.ApplicationId,
        //         applicantName = item.ApplicantName,
        //         status = item.Status,
        //         transactionId = item.TransactionId,
        //         transactionStatus = item.TransactionStatus,
        //         dateOfDisbursion = item.DateOfDistribution,
        //     }).ToList();

        //     var paginatedData = data.Skip(page * size).Take(size);
        //     return Json(new { columns, data = paginatedData, totalCount = data.Count });
        // }


        public string GetDistrictName(int districtId)
        {
            return dbcontext.Districts.FirstOrDefault(d => d.DistrictId == districtId)!.DistrictName;
        }
  
  
        public string GetTehsilName(int tehsilId)
        {
            return dbcontext.Tehsils.FirstOrDefault(d => d.TehsilId == tehsilId)!.TehsilName;
        }


        // Officer Actions
        // public void ActionForward(int serviceId, string applicationId, int officerId, string officerDesignation, string remarks, string filePath, string accessLevel, int accessCode)
        // {
        //     // Retrieve the next officer's role using the GetAdjacentRole stored procedure
        //     var nextOfficer = dbcontext.WorkFlows
        //                                .FromSqlRaw("EXEC GetAdjacentRole @ServiceId, @Role, @Direction",
        //                                            new SqlParameter("@ServiceId", serviceId),
        //                                            new SqlParameter("@Role", officerDesignation),
        //                                            new SqlParameter("@Direction", "NEXT"))
        //                                .AsEnumerable() // Bring the result into memory to avoid composition issues
        //                                .FirstOrDefault();

        //     // Find the next officer's ID based on their role and access levels (LINQ applied after data is in memory)
        //     var nextOfficerDetails = dbcontext.OfficerDetails
        //                                 .Where(of => of.Role == nextOfficer!.Role &&
        //                                              ((of.AccessLevel == accessLevel && of.AccessCode == accessCode) ||
        //                                              of.AccessLevel == "State"))
        //                                 .FirstOrDefault();

        //     int? nextAccessCode = null;
        //     var nextOfficerId = nextOfficerDetails != null ? nextOfficerDetails!.OfficerId : (object)DBNull.Value;
        //     string nextAccessLevel = dbcontext.OfficersDesignations.FirstOrDefault(od => od.Designation == nextOfficer!.Role)!.AccessLevel;
        //     if (accessLevel == nextAccessLevel)
        //         nextAccessCode = accessCode;
        //     else if (accessLevel == "Tehsil" && nextAccessLevel == "District")
        //         nextAccessCode = dbcontext.Tehsils.FirstOrDefault(t => t.TehsilId == accessCode)!.DistrictId;
        //     else if (nextAccessLevel == "State")
        //         nextAccessCode = 0;

        //     // Get the current date in the desired format
        //     string currentDate = DateTime.Now.ToString("dd MMM yyyy hh:mm:ss tt");

        //     // Execute the stored procedure to update the status and history
        //     dbcontext.Database.ExecuteSqlRaw("EXEC Status_History_Count_Forward @ServiceId, @AccessLevel, @AccessCode,@CurrentOfficerRole, @Role, @ApplicationId, @OfficerId, @NextOfficerId, @Remarks, @FilePath, @Date",
        //                                       new SqlParameter("@ServiceId", serviceId),
        //                                       new SqlParameter("@AccessLevel", nextAccessLevel),
        //                                       new SqlParameter("@AccessCode", nextAccessCode),
        //                                       new SqlParameter("@CurrentOfficerRole", officerDesignation),
        //                                       new SqlParameter("@Role", nextOfficer!.Role),
        //                                       new SqlParameter("@ApplicationId", applicationId),
        //                                       new SqlParameter("@OfficerId", officerId),
        //                                       new SqlParameter("@NextOfficerId", nextOfficerId),
        //                                       new SqlParameter("@Remarks", remarks),
        //                                       new SqlParameter("@FilePath", filePath ?? (object)DBNull.Value), // Handle null FilePath
        //                                       new SqlParameter("@Date", currentDate));
        // }
        // public void ActionReturn(int serviceId, string applicationId, int officerId, string officerDesignation, string remarks, string filePath, string accessLevel, int accessCode)
        // {
        //     // Retrieve the next officer's role using the GetAdjacentRole stored procedure
        //     var previousOfficer = dbcontext.WorkFlows
        //                                    .FromSqlRaw("EXEC GetAdjacentRole @ServiceId, @Role, @Direction",
        //                                                new SqlParameter("@ServiceId", serviceId),
        //                                                new SqlParameter("@Role", officerDesignation),
        //                                                new SqlParameter("@Direction", "PREVIOUS"))
        //                                    .AsEnumerable() // Bring the result into memory to avoid composition issues
        //                                    .FirstOrDefault();

        //     // Find the previous officer's ID based on their role and access levels (LINQ applied after data is in memory)
        //     int previousOfficerId = dbcontext.OfficerDetails
        //                                 .Where(of => of.Role == previousOfficer!.Role &&
        //                                              ((of.AccessLevel == accessLevel && of.AccessCode == accessCode) ||
        //                                              of.AccessLevel == "State"))
        //                                 .Select(of => of.OfficerId)
        //                                 .FirstOrDefault();

        //     // Get the current date in the desired format
        //     string currentDate = DateTime.Now.ToString("dd MMM yyyy hh:mm:ss tt");

        //     // Execute the stored procedure to update the status and history for returning the application
        //     dbcontext.Database.ExecuteSqlRaw("EXEC Status_History_Count_Return @ServiceId, @AccessLevel, @AccessCode, @CurrentOfficerRole, @Role, @ApplicationId, @OfficerId, @PreviousOfficerId, @Remarks, @FilePath, @Date",
        //                                       new SqlParameter("@ServiceId", serviceId),
        //                                       new SqlParameter("@AccessLevel", accessLevel),
        //                                       new SqlParameter("@AccessCode", accessCode),
        //                                       new SqlParameter("@CurrentOfficerRole", officerDesignation),
        //                                       new SqlParameter("@Role", previousOfficer!.Role),
        //                                       new SqlParameter("@ApplicationId", applicationId),
        //                                       new SqlParameter("@OfficerId", officerId),
        //                                       new SqlParameter("@PreviousOfficerId", previousOfficerId),
        //                                       new SqlParameter("@Remarks", remarks),
        //                                       new SqlParameter("@FilePath", filePath ?? (object)DBNull.Value), // Handle null FilePath
        //                                       new SqlParameter("@Date", currentDate));
        // }
        // public void ActionReject(int serviceId, string applicationId, int officerId, string officerDesignation, string accessLevel, int accessCode, string remarks, string filePath)
        // {
        //     // Get the current date in the desired format
        //     string currentDate = DateTime.Now.ToString("dd MMM yyyy hh:mm:ss tt");

        //     // Execute the stored procedure to update the status and history for rejection
        //     dbcontext.Database.ExecuteSqlRaw("EXEC Status_History_Count_Reject @ServiceId, @AccessLevel, @AccessCode, @CurrentOfficerRole, @ApplicationId, @OfficerId, @Remarks, @FilePath, @Date",
        //                                       new SqlParameter("@ServiceId", serviceId),
        //                                       new SqlParameter("@AccessLevel", accessLevel),
        //                                       new SqlParameter("@AccessCode", accessCode),
        //                                       new SqlParameter("@CurrentOfficerRole", officerDesignation),
        //                                       new SqlParameter("@ApplicationId", applicationId),
        //                                       new SqlParameter("@OfficerId", officerId),
        //                                       new SqlParameter("@Remarks", remarks),
        //                                       new SqlParameter("@FilePath", filePath ?? (object)DBNull.Value), // Handle null FilePath
        //                                       new SqlParameter("@Date", currentDate));

        //     helper.UpdateApplication("ApplicationStatus", "Rejected", new SqlParameter("@ApplicationId", applicationId));
        // }
        // public void ActionSanction(int serviceId, string applicationId, int officerId, string officerDesignation, string accessLevel, int accessCode, string remarks, string filePath)
        // {
        //     // Get the current date in the desired format
        //     string currentDate = DateTime.Now.ToString("dd MMM yyyy hh:mm:ss tt");

        //     // Execute the stored procedure to update the status and history for sanctioning
        //     dbcontext.Database.ExecuteSqlRaw("EXEC Status_History_Count_Sanction @ServiceId, @AccessLevel, @AccessCode, @CurrentOfficerRole, @ApplicationId, @OfficerId, @Remarks, @FilePath, @Date",
        //                                       new SqlParameter("@ServiceId", serviceId),
        //                                       new SqlParameter("@AccessLevel", accessLevel),
        //                                       new SqlParameter("@AccessCode", accessCode),
        //                                       new SqlParameter("@CurrentOfficerRole", officerDesignation),
        //                                       new SqlParameter("@ApplicationId", applicationId),
        //                                       new SqlParameter("@OfficerId", officerId),
        //                                       new SqlParameter("@Remarks", remarks),
        //                                       new SqlParameter("@FilePath", filePath ?? (object)DBNull.Value), // Handle null FilePath
        //                                       new SqlParameter("@Date", currentDate));
        //     Sanction(applicationId, officerDesignation);
        //     helper.UpdateApplication("ApplicationStatus", "Sanctioned", new SqlParameter("@ApplicationId", applicationId));
        // }
        // public void ActionReturnToEdit(int serviceId, string applicationId, int officerId, string officerDesignation, string accessLevel, int accessCode, string remarks, string filePath)
        // {
        //     // Get the current date in the desired format
        //     string currentDate = DateTime.Now.ToString("dd MMM yyyy hh:mm:ss tt");

        //     // Execute the stored procedure to update the status and history for returning the application to the citizen for editing
        //     dbcontext.Database.ExecuteSqlRaw("EXEC Status_History_Count_ReturnToEdit @ServiceId, @AccessLevel, @AccessCode, @CurrentOfficerRole, @ApplicationId, @OfficerId, @Remarks, @FilePath, @Date",
        //                                       new SqlParameter("@ServiceId", serviceId),
        //                                       new SqlParameter("@AccessLevel", accessLevel),
        //                                       new SqlParameter("@AccessCode", accessCode),
        //                                       new SqlParameter("@CurrentOfficerRole", officerDesignation),
        //                                       new SqlParameter("@ApplicationId", applicationId),
        //                                       new SqlParameter("@OfficerId", officerId),
        //                                       new SqlParameter("@Remarks", remarks),
        //                                       new SqlParameter("@FilePath", filePath ?? (object)DBNull.Value), // Handle null FilePath
        //                                       new SqlParameter("@Date", currentDate));
        // }





        // // Get Approve and Pool List 
        // public IActionResult GetApprovePoolList(int serviceId)
        // {
        //     var officer = GetOfficerDetails();

        //     // Set up SQL parameters
        //     var OfficerId = new SqlParameter("@OfficerId", officer.UserId);
        //     var ActionTaken = new SqlParameter("@ActionTaken", "Pending");
        //     var ServiceId = new SqlParameter("@ServiceId", serviceId);

        //     // Execute stored procedure to get filtered applications
        //     var applications = dbcontext.Applications
        //         .FromSqlRaw("EXEC GetFilteredApplications @OfficerId, @ActionTaken, @ServiceId", OfficerId, ActionTaken, ServiceId)
        //         .ToList();

        //     // Fetch application lists for the officer and serviceId
        //     var lists = dbcontext.ApplicationLists
        //         .FirstOrDefault(al => al.ServiceId == serviceId && al.Officer == officer.Role && al.AccessLevel == officer.AccessLevel && al.AccessCode == officer.AccessCode);

        //     // Initialize lists to avoid null reference issues
        //     List<string> pendingList = [];
        //     List<string> approveList = [];
        //     List<string> poolList = [];

        //     // If lists is not null, deserialize ApprovalList and PoolList
        //     if (lists != null)
        //     {
        //         approveList = JsonConvert.DeserializeObject<List<string>>(lists.ApprovalList) ?? [];
        //         poolList = JsonConvert.DeserializeObject<List<string>>(lists.PoolList) ?? [];
        //     }

        //     // Populate pendingList with applications not in approveList or poolList
        //     foreach (var item in applications)
        //     {
        //         if (!approveList.Contains(item.ApplicationId) && !poolList.Contains(item.ApplicationId))
        //         {
        //             pendingList.Add(item.ApplicationId);
        //         }
        //     }
        //     List<dynamic> transferOptions =
        //     [
        //         new
        //         {
        //             Pending = new[]
        //             {
        //                 new { label = "Transfer to Approve List", value = "PendingToApprove" }
        //             },
        //             Approve = new[]
        //             {
        //                 new { label = "Transfer to Pool", value = "ApproveToPool" },
        //                 new { label = "Transfer to Inbox", value = "ApproveToInbox" }
        //             },
        //             Pool = new[]
        //             {
        //                 new { label = "Transfer to Approve", value = "PoolToApprove" },
        //                 new { label = "Transfer to Inbox", value = "PoolToInbox" },
        //                 new { label = "Sanction Application(s)", value = "SanctionAll" }
        //             }
        //         }
        //     ];

        //     // Return JSON result with all three lists
        //     return Json(new { pendingList, approveList, poolList, transferOptions });
        // }

        // public IActionResult UpdateApprovePoolList([FromForm] IFormCollection form)
        // {
        //     var officer = GetOfficerDetails();
        //     int serviceId = Convert.ToInt32(form["ServiceId"]);
        //     string listType = form["listType"].ToString();
        //     List<string> list = JsonConvert.DeserializeObject<List<string>>(form["list"].ToString())!;

        //     _logger.LogInformation($"----------Service Id: {serviceId} list type: {listType} list : {form["list"]}-------------");
        //     var lists = dbcontext.ApplicationLists
        //         .FirstOrDefault(al => al.ServiceId == serviceId && al.Officer == officer.Role && al.AccessLevel == officer.AccessLevel && al.AccessCode == officer.AccessCode);

        //     // Initialize lists to avoid null reference issues
        //     List<string> approveList = [];
        //     List<string> poolList = [];

        //     // If lists is not null, deserialize ApprovalList and PoolList
        //     if (lists != null)
        //     {
        //         approveList = JsonConvert.DeserializeObject<List<string>>(lists.ApprovalList) ?? [];
        //         poolList = JsonConvert.DeserializeObject<List<string>>(lists.PoolList) ?? [];
        //     }

        //     foreach (var item in list)
        //     {
        //         _logger.LogInformation($"-------Application Id ITEM: {item}----------------");
        //         switch (listType)
        //         {
        //             case "PendingToApprove":
        //                 if (!approveList.Contains(item))
        //                 {
        //                     approveList.Add(item);
        //                 }
        //                 break;

        //             case "ApproveToPool":
        //                 if (!poolList.Contains(item))
        //                 {
        //                     poolList.Add(item);
        //                 }
        //                 approveList.Remove(item);
        //                 break;

        //             case "ApproveToInbox":
        //                 approveList.Remove(item);
        //                 break;

        //             case "PoolToApprove":
        //                 if (!approveList.Contains(item))
        //                 {
        //                     approveList.Add(item);
        //                 }
        //                 poolList.Remove(item);
        //                 break;

        //             case "PoolToInbox":
        //                 poolList.Remove(item);
        //                 break;

        //             default:
        //                 return BadRequest("Invalid transfer type.");
        //         }
        //     }

        //     // Serialize lists back to strings and update the database
        //     if (lists != null)
        //     {
        //         lists.ApprovalList = JsonConvert.SerializeObject(approveList);
        //         lists.PoolList = JsonConvert.SerializeObject(poolList);
        //     }
        //     else
        //     {
        //         // Create new ApplicationLists if lists is null
        //         lists = new ApplicationList
        //         {
        //             ServiceId = serviceId,
        //             Officer = officer.Role!,
        //             AccessLevel = officer.AccessLevel!,
        //             AccessCode = Convert.ToInt32(officer.AccessCode),
        //             ApprovalList = JsonConvert.SerializeObject(approveList),
        //             PoolList = JsonConvert.SerializeObject(poolList)
        //         };

        //         dbcontext.ApplicationLists.Add(lists);
        //     }
        //     dbcontext.SaveChanges();

        //     return Json(new { success = true, message = "List updated successfully." });
        // }

        // public void UpdatePool(string applicationId, int serviceId)
        // {
        //     _logger.LogInformation($"--------Application ID: {applicationId}  Service ID: {serviceId}------------");
        //     var officer = GetOfficerDetails();

        //     var lists = dbcontext.ApplicationLists
        //         .FirstOrDefault(al => al.ServiceId == serviceId && al.Officer == officer.Role && al.AccessLevel == officer.AccessLevel && al.AccessCode == officer.AccessCode);

        //     List<string> poolList = [];

        //     // If lists is not null, deserialize ApprovalList and PoolList
        //     if (lists != null)
        //     {
        //         poolList = JsonConvert.DeserializeObject<List<string>>(lists.PoolList) ?? [];
        //     }
        //     else return;

        //     if (poolList.Contains(applicationId))
        //     {
        //         poolList.Remove(applicationId);
        //     }

        //     lists!.PoolList = JsonConvert.SerializeObject(poolList);
        //     dbcontext.Entry(lists).State = EntityState.Modified;
        //     dbcontext.SaveChanges();

        // }

        // public void Sanction(string ApplicationId, string Officer)
        // {
        //     var (userDetails, preAddressDetails, perAddressDetails, serviceSpecific, bankDetails, documents) = helper.GetUserDetailsAndRelatedData(ApplicationId);

        //     var sanctionObject = new Dictionary<string, string>
        //     {
        //         ["NAME OF APPLICANT"] = userDetails.ApplicantName.ToUpper(),
        //         ["DATE OF BIRTH"] = userDetails.DateOfBirth.ToString(),
        //         ["FATHER/GUARDIAN NAME"] = userDetails.RelationName.ToUpper(),
        //         ["MOTHER NAME"] = serviceSpecific!["MotherName"],
        //         ["MOBILE/EMAIL"] = userDetails.MobileNumber.ToUpper() + "/" + userDetails.Email.ToUpper(),
        //         ["DATE OF MARRIAGE"] = serviceSpecific["DateOfMarriage"],
        //         ["BANK NAME/ BRANCH NAME"] = bankDetails!["BankName"] + "/" + bankDetails["BranchName"],
        //         ["IFSC CODE/ ACCOUNT NUMBER"] = bankDetails["IfscCode"] + "/" + bankDetails["AccountNumber"],
        //         ["AMOUNT SANCTIONED"] = "50000",
        //         ["PRESENT ADDRESS"] = preAddressDetails.Address!.ToUpper() + ", TEHSIL: " + preAddressDetails.Tehsil + ", DISTRICT: " + preAddressDetails.District + ", PIN CODE: " + preAddressDetails.Pincode,
        //         ["PERMANENT ADDRESS"] = perAddressDetails.Address!.ToUpper() + ", TEHSIL: " + perAddressDetails.Tehsil + ", DISTRICT: " + perAddressDetails.District + ", PIN CODE: " + perAddressDetails.Pincode,
        //     };
        //     UpdatePool(ApplicationId, userDetails.ServiceId);
        //     _pdfService.CreateSanctionPdf(sanctionObject, Officer, ApplicationId);
        // }


    }
}