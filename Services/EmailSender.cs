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
            await SendEmailWithAttachments(email, subject, message, null);
        }

        // New method to support attachments
        public async Task SendEmailWithAttachments(string email, string subject, string message, IList<string>? attachmentPaths = null)
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

                    // Add attachments if provided
                    if (attachmentPaths != null && attachmentPaths.Any())
                    {
                        foreach (var path in attachmentPaths)
                        {
                            _logger.LogInformation($"---------full Path:{path}------------------");
                            if (File.Exists(path))
                            {
                                var attachment = new Attachment(path);
                                mailMessage.Attachments.Add(attachment);
                            }
                            else
                            {
                                _logger.LogWarning($"Attachment file not found: {path}");
                            }
                        }
                    }

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
