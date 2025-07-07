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

    }
}