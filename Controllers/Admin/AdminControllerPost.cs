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

        [HttpPost]
        public IActionResult ValidateOfficer(string username)
        {

            var officer = dbcontext.Users.FirstOrDefault(u => u.Username == username);
            var AdditionalDetails = JsonConvert.DeserializeObject<Dictionary<string, dynamic>>(officer!.AdditionalDetails!);
            AdditionalDetails!["Validate"] = true;
            officer.AdditionalDetails = JsonConvert.SerializeObject(AdditionalDetails);
            dbcontext.SaveChanges();
            return Json(new { status = true });
        }

        [HttpPost]
        public IActionResult AddAdmin([FromForm] IFormCollection form)
        {
            var fullName = new SqlParameter("@Name", form["name"].ToString());
            var username = new SqlParameter("@Username", form["username"].ToString());
            var password = new SqlParameter("@Password", form["passowrd"].ToString());
            var email = new SqlParameter("@Email", form["Email"].ToString());
            var mobileNumber = new SqlParameter("@MobileNumber", form["mobileNumber"].ToString());
            var profile = new SqlParameter("@Profile", "/assets/images/profile.jpg");

            var UserType = new SqlParameter("@UserType", form["role"].ToString().Contains("Admin") ? "Admin" : "Officer");

            var backupCodes = new
            {
                unused = helper.GenerateUniqueRandomCodes(10, 8),
                used = Array.Empty<string>(),
            };

            var AddtionalDetails = new SqlParameter("@AdditionalDetails", form["AdditionalDetails"].ToString());

            var backupCodesParam = new SqlParameter("@BackupCodes", JsonConvert.SerializeObject(backupCodes));

            var registeredDate = new SqlParameter("@RegisteredDate", DateTime.Now.ToString("dd MMM yyyy hh:mm:ss tt"));

            var result = dbcontext.Users.FromSqlRaw(
                "EXEC RegisterUser @Name, @Username, @Password, @Email, @MobileNumber,@Profile, @UserType, @BackupCodes,@AdditionalDetails, @RegisteredDate",
                fullName, username, password, email, mobileNumber, profile, UserType, backupCodesParam, AddtionalDetails, registeredDate
            ).ToList();

            if (result.Count > 0)
            {
                var userId = new SqlParameter("@OfficerId", result[0].UserId);

                return Json(new { status = true, userId });
            }
            else
            {
                return Json(new { status = false, response = "Registration failed." });
            }
        }


    }
}