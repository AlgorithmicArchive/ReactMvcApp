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

            var formDetails = JsonConvert.DeserializeObject<dynamic>(details!.FormDetails!);

            return Json(new { formDetails });
        }


    }
}