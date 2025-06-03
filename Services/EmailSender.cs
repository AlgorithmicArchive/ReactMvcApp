using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Options;

namespace SendEmails
{
    public class EmailSender(IOptions<EmailSettings> emailSettings, ILogger<EmailSender> logger) : IEmailSender
    {
        private readonly EmailSettings _emailSettings = emailSettings.Value;
        private readonly ILogger<EmailSender> _logger = logger;

        public async Task SendEmail(string email, string subject, string message)
        {
            try
            {
                string? senderEmail = _emailSettings.SenderEmail;
                string? password = _emailSettings.Password;

                using (var client = new SmtpClient(_emailSettings.SmtpServer, _emailSettings.SmtpPort)
                {
                    EnableSsl = true,
                    Credentials = new NetworkCredential(senderEmail, password),
                    Timeout = 30000
                })
                {
                    var mailMessage = new MailMessage
                    {
                        From = new MailAddress(senderEmail!),
                        Subject = subject,
                        Body = message,
                        IsBodyHtml = true
                    };
                    mailMessage.To.Add(email);

                    await client.SendMailAsync(mailMessage);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error sending email: {ex}");
                throw;
            }
        }
    }
}
