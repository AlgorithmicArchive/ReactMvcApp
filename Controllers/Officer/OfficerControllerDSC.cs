using Microsoft.AspNetCore.Mvc;
using iText.Kernel.Pdf;
using iText.Signatures;
using Org.BouncyCastle.Pkcs;
using Org.BouncyCastle.Crypto;
using iText.Bouncycastle.Crypto;
using iText.Commons.Bouncycastle.Cert;
using iText.Bouncycastle.X509;
using System.Security.Cryptography.X509Certificates;
using System.Security.Cryptography;
using iText.Forms.Form.Element;
using iText.Forms.Fields.Properties;
using iText.Kernel.Font;
using iText.IO.Font.Constants;
using iText.Kernel.Colors;
using System.Text;

namespace ReactMvcApp.Controllers.Officer
{
    public partial class OfficerController : Controller
    {
        [HttpPost]
        public IActionResult RegisterDSC([FromForm] IFormCollection form)
        {
            try
            {
                var officer = GetOfficerDetails();

                // Validate user exists
                bool officerExists = dbcontext.Users.Any(u => u.UserId == officer.UserId);
                if (!officerExists)
                {
                    return BadRequest("The officer/user ID does not exist.");
                }


                _logger.LogInformation($"------------USER ID: {officer.UserId}-----------------");

                var serialString = form["serial_number"].ToString();
                var ca = form["certifying_authority"].ToString();
                var expirationString = form["expiration_date"].ToString();

                // Parse serial number
                byte[] serialBytes = Convert.FromHexString(serialString); // or use BigInteger if decimal

                // Parse expiration date
                DateTime? expirationDate = DateTime.TryParse(expirationString, out var parsedDate)
                    ? parsedDate
                    : (DateTime?)null;

                var cert = new Models.Entities.Certificate
                {
                    OfficerId = Convert.ToInt32(officer.UserId),
                    SerialNumber = serialBytes,
                    CertifiyingAuthority = ca,
                    ExpirationDate = expirationDate,
                    RegisteredDate = DateTime.Now.ToString("dd MMM yyyy hh:mm:ss tt")
                };

                dbcontext.Certificates.Add(cert);
                dbcontext.SaveChanges();

                return Json(new { success = true });
            }
            catch (Exception ex)
            {
                // Log exception if needed
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }




    }
}