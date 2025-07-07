using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace SahayataNidhi.Controllers.Admin
{
    public partial class AdminController : Controller
    {



        [HttpGet]
        public IActionResult GetApplicationsForReports(int AccessCode, int ServiceId, string? StatusType = null, int pageIndex = 0, int pageSize = 10)
        {
            try
            {
                // Validate input parameters
                if (pageIndex < 0 || pageSize <= 0)
                {
                    _logger.LogWarning($"Invalid pagination parameters: pageIndex={pageIndex}, pageSize={pageSize}");
                    return BadRequest(new { error = "Invalid pageIndex or pageSize" });
                }

                // Log officer details for debugging
                var officerDetails = GetOfficerDetails();
                _logger.LogInformation($"Officer Role: {officerDetails?.Role}, AccessLevel: {officerDetails?.AccessLevel}");

                // Define SQL parameters for the stored procedure
                var accessCode = new SqlParameter("@AccessCode", AccessCode);
                var serviceId = new SqlParameter("@ServiceId", ServiceId);
                var accessLevel = new SqlParameter("@AccessLevel", "District");

                // Execute the stored procedure
                var response = dbcontext.Database
                    .SqlQueryRaw<SummaryReports>("EXEC GetApplicationsForReport @AccessCode, @ServiceId, @AccessLevel", accessCode, serviceId, accessLevel)
                    .ToList();

                _logger.LogInformation($"Fetched {response.Count} records for AccessCode: {AccessCode}, ServiceId: {ServiceId}, Response: {JsonConvert.SerializeObject(response)}");

                // Handle empty result set
                if (!response.Any())
                {
                    _logger.LogWarning($"No data returned for AccessCode: {AccessCode}, ServiceId: {ServiceId}");
                }

                // Sorting by TehsilName (optional, as stored procedure already orders by TehsilName)
                var sortedResponse = response.OrderBy(a => a.TehsilName).ToList();

                // Pagination
                var totalRecords = sortedResponse.Count;
                var pagedResponse = sortedResponse
                    .Skip(pageIndex * pageSize)
                    .Take(pageSize)
                    .ToList();

                // Define columns for the frontend
                List<dynamic> columns = new List<dynamic>
                {
                    new { accessorKey = "tehsilName", header = "Tehsil Name" },
                    new { accessorKey = "totalApplicationsSubmitted", header = "Total Applications Submitted" },
                    new { accessorKey = "totalApplicationsRejected", header = "Total Applications Rejected" },
                    new { accessorKey = "totalApplicationsSanctioned", header = "Total Applications Sanctioned" }
                };

                // Map the paged response to dynamic data for the frontend
                List<dynamic> data = pagedResponse.Select(item => new
                {
                    tehsilName = item.TehsilName,
                    totalApplicationsSubmitted = item.TotalApplicationsSubmitted,
                    totalApplicationsRejected = item.TotalApplicationsRejected,
                    totalApplicationsSanctioned = item.TotalApplicationsSanctioned
                }).Cast<dynamic>().ToList();

                // Return JSON response
                return Json(new
                {
                    data,
                    columns,
                    totalRecords
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error executing GetApplicationsForReport for AccessCode: {AccessCode}, ServiceId: {ServiceId}");
                return StatusCode(500, new { error = "An error occurred while fetching the report" });
            }
        }

        [HttpGet]
        public IActionResult GetDetailsForDashboard()
        {
            try
            {
                var officer = GetOfficerDetails();
                if (officer == null)
                {
                    return BadRequest(new { error = "Officer details not found" });
                }

                var accessLevelParam = new SqlParameter("@AccessLevel", officer.AccessLevel ?? (object)DBNull.Value);
                var accessCodeParam = new SqlParameter("@AccessCode", officer.AccessCode);

                var result = dbcontext.Database
                .SqlQueryRaw<DashboardData>(
                    "EXEC GetCountForAdmin @AccessLevel, @AccessCode",
                    new SqlParameter("@AccessLevel", officer.AccessLevel ?? (object)DBNull.Value),
                    new SqlParameter("@AccessCode", officer.AccessCode)
                )
                .AsEnumerable() // 👈 Move execution to client-side
                .FirstOrDefault(); // Now safe to use

                if (result == null || result.TotalOfficers == -1)
                {
                    return BadRequest(new { error = "Invalid access level or code" });
                }

                return Json(new
                {
                    totalOfficers = result.TotalOfficers,
                    totalRegisteredUsers = result.TotalCitizens,
                    totalApplicationsSubmitted = result.TotalApplicationsSubmitted,
                    totalServices = result.TotalServices
                });
            }
            catch (Exception ex)
            {
                // TODO: log exception here
                return StatusCode(500, new
                {
                    error = "An error occurred while fetching dashboard data",
                    details = ex.Message
                });
            }
        }




        public IActionResult GetOfficerToValidate(int pageIndex = 0, int pageSize = 10)
        {
            try
            {
                // Validate pagination input
                if (pageIndex < 0 || pageSize <= 0)
                {
                    return BadRequest(new { error = "Invalid pageIndex or pageSize" });
                }

                // Get current officer's details
                var officer = GetOfficerDetails();
                if (officer == null)
                {
                    return Unauthorized(new { error = "Officer not found" });
                }

                string accessLevel = officer.AccessLevel!;
                int accessCode = Convert.ToInt32(officer.AccessCode);

                // Define stored procedure parameters
                var paramAccessLevel = new SqlParameter("@AccessLevel", accessLevel);
                var paramAccessCode = new SqlParameter("@AccessCode", accessCode);

                // Call stored procedure
                var response = dbcontext.Database // DTO mapped to result of stored procedure
                    .SqlQueryRaw<OfficersToValidateModal>("EXEC GetOfficersToValidate @AccessLevel, @AccessCode", paramAccessLevel, paramAccessCode)
                    .ToList();

                // Pagination
                var totalRecords = response.Count;
                var pagedData = response
                    .Skip(pageIndex * pageSize)
                    .Take(pageSize)
                    .ToList();

                // Columns (for frontend)
                var columns = new List<object>
                {
                    new { accessorKey = "name", header = "Name" },
                    new { accessorKey = "username", header = "Username" },
                    new { accessorKey = "email", header = "Email" },
                    new { accessorKey = "mobileNumber", header = "Mobile Number" },
                    new { accessorKey = "designation", header = "Designation" }
                };

                var customActions = new List<dynamic>
                {
                    new
                    {
                        type = "Validate",
                        tooltip = "Validate",
                        color = "#F0C38E",
                        actionFunction = "ValidateOfficer"
                    }
                };
                // Shape the data
                var data = pagedData.Select(item => new
                {
                    name = item.Name,
                    username = item.Username,
                    email = item.Email,
                    mobileNumber = item.MobileNumber,
                    designation = item.Designation,
                    customActions
                }).ToList();

                return Json(new
                {
                    data,
                    columns,
                    totalRecords
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching officers to validate");
                return StatusCode(500, new { error = "An error occurred while fetching data." });
            }
        }


    }
}