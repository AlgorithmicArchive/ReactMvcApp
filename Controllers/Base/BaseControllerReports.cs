using System.Dynamic;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using SahayataNidhi.Models.Entities;

namespace SahayataNidhi.Controllers
{
    public partial class BaseController
    {
        public string GetOfficerAreaForHistory(string accessLevel, int? accessCode)
        {


            switch (accessLevel)
            {
                case "Tehsil":
                    var tehsil = dbcontext.Tswotehsils.FirstOrDefault(t => t.TehsilId == accessCode);
                    return tehsil?.TehsilName ?? string.Empty;

                case "District":
                    var district = dbcontext.Districts.FirstOrDefault(d => d.DistrictId == accessCode);
                    return district?.DistrictName ?? string.Empty;

                case "Division":
                    var districtForDivision = dbcontext.Districts.FirstOrDefault(d => d.DistrictId == accessCode);
                    if (districtForDivision == null)
                        return string.Empty;
                    return districtForDivision.Division == 1 ? "Jammu" : "Kashmir";
                case "State":
                    return "J&K";
                default:
                    return string.Empty;
            }
        }

        public string GetOfficerArea(string designation, dynamic formDetails)
        {
            var officerDesignation = dbcontext.OfficersDesignations
                .FirstOrDefault(od => od.Designation == designation);

            if (officerDesignation == null)
                return string.Empty;

            string accessLevel = officerDesignation.AccessLevel ?? string.Empty;
            int accessCode;

            switch (accessLevel)
            {
                case "Tehsil":
                    accessCode = Convert.ToInt32(GetFieldValue("Tehsil", formDetails));
                    var tehsil = dbcontext.Tswotehsils.FirstOrDefault(t => t.TehsilId == accessCode);
                    return tehsil?.TehsilName ?? string.Empty;

                case "District":
                    accessCode = Convert.ToInt32(GetFieldValue("District", formDetails));
                    var district = dbcontext.Districts.FirstOrDefault(d => d.DistrictId == accessCode);
                    return district?.DistrictName ?? string.Empty;

                case "Division":
                    accessCode = Convert.ToInt32(GetFieldValue("District", formDetails));
                    var districtForDivision = dbcontext.Districts.FirstOrDefault(d => d.DistrictId == accessCode);
                    if (districtForDivision == null)
                        return string.Empty;
                    return districtForDivision.Division == 1 ? "Jammu" : "Kashmir";
                case "State":
                    return "J&K";
                default:
                    return string.Empty;
            }
        }

        public string GetApplications(string? scope, string? columnOrder, string? columnVisibility, int ServiceId, string? type, int pageIndex = 0, int pageSize = 10)
        {
            var officerDetails = GetOfficerDetails();
            var role = new SqlParameter("@Role", officerDetails!.Role);
            var accessLevel = new SqlParameter("@AccessLevel", officerDetails.AccessLevel);
            var accessCode = new SqlParameter("@AccessCode", officerDetails.AccessCode);
            var applicationStatus = new SqlParameter("@ApplicationStatus", (object)type?.ToLower()! ?? DBNull.Value);
            var serviceId = new SqlParameter("@ServiceId", ServiceId);
            List<CitizenApplication> response;

            List<string> orderedColumns;
            Dictionary<string, bool> visibility;
            orderedColumns = JsonConvert.DeserializeObject<List<string>>(columnOrder!)!;
            visibility = JsonConvert.DeserializeObject<Dictionary<string, bool>>(columnVisibility!)!;

            var service = dbcontext.Services.FirstOrDefault(s => s.ServiceId == ServiceId);

            var workflow = JsonConvert.DeserializeObject<List<dynamic>>(service!.OfficerEditableField!);
            // The JSON field names must match those in your stored JSON.
            dynamic authorities = workflow!.FirstOrDefault(p => p.designation == officerDetails.Role)!;

            if (type == "shifted")
            {
                response = dbcontext.CitizenApplications
                   .FromSqlRaw("EXEC GetShiftedApplications @Role, @AccessLevel, @AccessCode, @ServiceId",
                       role, accessLevel, accessCode, serviceId)
                   .ToList();
            }
            else
            {
                response = dbcontext.CitizenApplications
                .FromSqlRaw("EXEC GetApplicationsForOfficer @Role, @AccessLevel, @AccessCode, @ApplicationStatus, @ServiceId",
                    role, accessLevel, accessCode, applicationStatus, serviceId)
                .ToList();
            }

            // Sorting for consistent pagination based on ReferenceNumber
            var sortedResponse = response.OrderBy(a =>
            {
                var parts = a.ReferenceNumber.Split('/');
                var numberPart = parts.Last();
                return int.TryParse(numberPart, out int num) ? num : 0;
            }).ToList();

            var totalRecords = sortedResponse.Count;
            var pagedResponse = new List<CitizenApplication>();
            if (scope == "InView")
            {
                pagedResponse = sortedResponse
                   .Skip(pageIndex * pageSize)
                   .Take(pageSize)
                   .ToList();
            }
            else pagedResponse = sortedResponse;

            List<dynamic> columns =
            [
                new { accessorKey = "referenceNumber", header = "Reference Number" },
                new { accessorKey = "applicantName", header = "Applicant Name" },
                new { accessorKey = "submissionDate", header = "Submission Date" }
            ];

            var filteredColumns = orderedColumns
            .Where(key => visibility.TryGetValue(key, out var isVisible) && isVisible)
            .Select(key =>
                columns.FirstOrDefault(col =>
                    col.GetType().GetProperty("accessorKey")?.GetValue(col)?.ToString() == key
                )
            )
            .Where(col => col != null)
            .ToList();

            List<dynamic> data = [];
            List<dynamic> poolData = [];

            var poolList = dbcontext.Pools.FirstOrDefault(p =>
                p.ServiceId == ServiceId &&
                p.AccessLevel == officerDetails.AccessLevel &&
                p.AccessCode == officerDetails.AccessCode
            );

            var pool = poolList != null && !string.IsNullOrWhiteSpace(poolList.List)
                ? JsonConvert.DeserializeObject<List<string>>(poolList.List)
                : new List<string>();

            int index = 0;

            foreach (var details in pagedResponse)
            {
                var formDetails = JsonConvert.DeserializeObject<dynamic>(details.FormDetails!);
                var officers = JsonConvert.DeserializeObject<JArray>(details.WorkFlow!);

                dynamic item = new ExpandoObject();
                var itemDict = (IDictionary<string, object?>)item;

                var columnKeys = filteredColumns
                    .Select(col => col!.GetType().GetProperty("accessorKey")?.GetValue(col)?.ToString())
                    .Where(key => !string.IsNullOrEmpty(key))
                    .ToHashSet();

                // Conditionally add only those fields present in filteredColumns
                if (columnKeys.Contains("referenceNumber"))
                    itemDict["referenceNumber"] = details.ReferenceNumber;

                if (columnKeys.Contains("applicantName"))
                    itemDict["applicantName"] = GetFieldValue("ApplicantName", formDetails);

                if (columnKeys.Contains("submissionDate"))
                    itemDict["submissionDate"] = details.CreatedAt;

                if (type == "shifted")
                {
                    data.Add(item);
                }
                else
                {
                    if (pool!.Contains(details.ReferenceNumber) && type == "pending")
                    {
                        poolData.Add(item);
                    }
                    else
                    {
                        data.Add(item);
                    }
                }

                index++;
            }

            var result = Json(new
            {
                data,
                columns = filteredColumns,
                poolData,
                totalRecords,
            });


            return JsonConvert.SerializeObject(result);
        }

        public async Task<string> GetApplicationHistory(string? scope, string? columnOrder, string? columnVisibility, string ApplicationId, int page, int size)
        {
            var application = await dbcontext.CitizenApplications.FirstOrDefaultAsync(ca => ca.ReferenceNumber == ApplicationId);

            var players = JsonConvert.DeserializeObject<JArray>(application!.WorkFlow!);
            var formDetails = JsonConvert.DeserializeObject<dynamic>(application.FormDetails!);
            int currentPlayerIndex = (int)application.CurrentPlayer!;
            var currentPlayer = players?.FirstOrDefault(o => (int)o["playerId"]! == currentPlayerIndex);

            var fullHistory = await dbcontext.ActionHistories
                .Where(ah => ah.ReferenceNumber == ApplicationId)
                .ToListAsync();

            // Apply scope-based filtering
            var history = (scope == "InView")
                ? fullHistory.Skip(page * size).Take(size).ToList()
                : fullHistory;

            // Define full columns
            List<dynamic> columns =
            [
                new { accessorKey = "sno", header = "S.No" },
                new { accessorKey = "actionTaker", header = "Action Taker" },
                new { accessorKey = "actionTaken", header = "Action Taken" },
                new { accessorKey = "remarks", header = "Remarks" },
                new { accessorKey = "actionTakenOn", header = "Action Taken On" },
            ];

            List<string> orderedColumns = JsonConvert.DeserializeObject<List<string>>(columnOrder!)!;
            Dictionary<string, bool> visibility = JsonConvert.DeserializeObject<Dictionary<string, bool>>(columnVisibility!)!;

            var filteredColumns = orderedColumns
                .Where(key => visibility.TryGetValue(key, out var isVisible) && isVisible)
                .Select(key =>
                    columns.FirstOrDefault(col =>
                        col.GetType().GetProperty("accessorKey")?.GetValue(col)?.ToString() == key
                    )
                )
                .Where(col => col != null)
                .ToList();

            List<dynamic> data = [];
            int index = 1;

            foreach (var his in history)
            {
                var officerArea = GetOfficerAreaForHistory(his.LocationLevel!, his.LocationValue);

                dynamic item = new ExpandoObject();
                var itemDict = (IDictionary<string, object?>)item;

                itemDict["sno"] = index;
                itemDict["actionTaker"] = his.ActionTaker != "Citizen"
                    ? $"{his.ActionTaker} {officerArea}"
                    : his.ActionTaker;
                itemDict["actionTaken"] = his.ActionTaken == "ReturnToCitizen"
                    ? "Returned to citizen for correction"
                    : his.ActionTaken;
                itemDict["remarks"] = his.Remarks;
                itemDict["actionTakenOn"] = his.ActionTakenDate;

                data.Add(item);
                index++;
            }

            if ((string)currentPlayer!["status"]! == "pending")
            {
                string designation = (string)currentPlayer["designation"]!;
                string officerArea = GetOfficerArea(designation, formDetails);

                dynamic pendingItem = new ExpandoObject();
                var pendingDict = (IDictionary<string, object?>)pendingItem;

                pendingDict["sno"] = index;
                pendingDict["actionTaker"] = $"{designation} {officerArea}";
                pendingDict["actionTaken"] = "pending";
                pendingDict["remarks"] = "";
                pendingDict["actionTakenOn"] = "";

                data.Add(pendingItem);
            }

            var result = Json(new
            {
                data,
                columns = filteredColumns,
            });

            return JsonConvert.SerializeObject(result);
        }
        public string GetInitiatedApplications(string? scope, string? columnOrder, string? columnVisibility, int pageIndex = 0, int pageSize = 10)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var UserId = new SqlParameter("@UserId", Convert.ToInt32(userIdClaim));
            var PageIndex = new SqlParameter("@PageIndex", pageIndex);
            var PageSize = new SqlParameter("@PageSize", pageSize);
            var IsPaginated = new SqlParameter("@IsPaginated", 1);

            // Ensure that you filter by the correct "Initiated" status
            var applications = dbcontext.CitizenApplications.FromSqlRaw("EXEC GetInitiatedApplications @UserId, @PageIndex, @PageSize, @IsPaginated", UserId, PageIndex, PageSize, IsPaginated).ToList();

            var totalRecords = applications.Count;

            var sortedApplications = applications
                .OrderBy(a =>
                {
                    var parts = a.ReferenceNumber.Split('/');
                    var numberPart = parts.Last();
                    return int.TryParse(numberPart, out int num) ? num : 0;
                })
                .ThenBy(a => a.ReferenceNumber)
                .ToList();

            var pagedApplications = (scope == "InView")
                ? sortedApplications.Skip(pageIndex * pageSize).Take(pageSize).ToList()
                : sortedApplications;

            var columns = new List<dynamic>
            {
                new { accessorKey = "sno", header = "S.No" },
                new { accessorKey = "serviceName", header = "Service Name" },
                new { accessorKey = "referenceNumber", header = "Reference Number" },
                new { accessorKey = "applicantName", header = "Applicant Name" },
                new { accessorKey = "currentlyWith", header = "Currently With" },
                new { accessorKey = "submissionDate", header = "Submission Date" },
                new { accessorKey = "status", header = "Status" }
            };

            List<string> orderedColumns = JsonConvert.DeserializeObject<List<string>>(columnOrder!)!;
            Dictionary<string, bool> visibility = JsonConvert.DeserializeObject<Dictionary<string, bool>>(columnVisibility!)!;

            var filteredColumns = orderedColumns
                .Where(key => visibility.TryGetValue(key, out var isVisible) && isVisible)
                .Select(key =>
                    columns.FirstOrDefault(col =>
                        col.GetType().GetProperty("accessorKey")?.GetValue(col)?.ToString() == key
                    )
                )
                .Where(col => col != null)
                .ToList();

            var actionMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                { "pending", "Pending" },
                { "forwarded", "Forwarded" },
                { "sanctioned", "Sanctioned" },
                { "returned", "Returned" },
                { "rejected", "Rejected" },
                { "returntoedit", "Returned to citizen for correction" },
                { "Deposited", "Inserted to Bank File" },
                { "Dispatched", "Payment Under Process" },
                { "Disbursed", "Payment Disbursed" },
                { "Failure", "Payment Failed" }
            };

            var data = new List<dynamic>();
            int index = 0;

            foreach (var application in pagedApplications)
            {
                var formDetails = JsonConvert.DeserializeObject<dynamic>(application.FormDetails!);
                var officers = JsonConvert.DeserializeObject<JArray>(application.WorkFlow!);
                var currentPlayer = application.CurrentPlayer;
                string officerDesignation = (string)officers![currentPlayer!]!["designation"]!;
                string officerStatus = (string)officers![currentPlayer!]!["status"]!;
                string officerArea = GetOfficerArea(officerDesignation, formDetails);

                string serviceName = dbcontext.Services
                    .FirstOrDefault(s => s.ServiceId == application.ServiceId)?
                    .ServiceName ?? "Unknown";

                dynamic row = new ExpandoObject();
                var rowDict = (IDictionary<string, object?>)row;

                var visibleKeys = filteredColumns
                    .Select(col => col!.GetType().GetProperty("accessorKey")?.GetValue(col)?.ToString())
                    .Where(key => !string.IsNullOrEmpty(key))
                    .ToHashSet();

                if (visibleKeys.Contains("sno"))
                    rowDict["sno"] = (pageIndex * pageSize) + index + 1;

                if (visibleKeys.Contains("serviceName"))
                    rowDict["serviceName"] = serviceName;

                if (visibleKeys.Contains("referenceNumber"))
                    rowDict["referenceNumber"] = application.ReferenceNumber;

                if (visibleKeys.Contains("applicantName"))
                    rowDict["applicantName"] = GetFieldValue("ApplicantName", formDetails);

                if (visibleKeys.Contains("currentlyWith"))
                    rowDict["currentlyWith"] = $"{officerDesignation} {officerArea}";

                if (visibleKeys.Contains("submissionDate"))
                    rowDict["submissionDate"] = application.CreatedAt;

                if (visibleKeys.Contains("status"))
                    rowDict["status"] = actionMap.TryGetValue(officerStatus!, out var label) ? label : officerStatus;

                data.Add(row);
                index++;
            }

            var result = Json(new
            {
                data,
                columns = filteredColumns,
                totalRecords,
            });

            return JsonConvert.SerializeObject(result);
        }


    }
}