using System.Collections;
using System.Collections.Specialized;
using System.Reflection;
using iText.Barcodes;
using iText.IO.Image;
using iText.Kernel.Colors;
using iText.Kernel.Geom;
using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas;
using iText.Kernel.Pdf.Xobject;
using iText.Layout;
using iText.Layout.Borders;
using iText.Layout.Element;
using iText.Layout.Properties;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using SahayataNidhi.Models.Entities;


public class PdfService(IWebHostEnvironment webHostEnvironment, SocialWelfareDepartmentContext dbcontext, UserHelperFunctions helper)
{
    private readonly IWebHostEnvironment _webHostEnvironment = webHostEnvironment;
    protected readonly SocialWelfareDepartmentContext dbcontext = dbcontext;
    protected readonly UserHelperFunctions helper = helper;


    public string GetArreaName(string? accessLevel, int? accessCode)
    {
        string areaName = "";

        if (accessLevel == "Tehsil")
        {
            areaName = dbcontext.Tswotehsils.FirstOrDefault(t => t.TehsilId == accessCode)!.TehsilName!;
        }
        else if (accessLevel == "District")
        {
            areaName = dbcontext.Districts.FirstOrDefault(t => t.DistrictId == accessCode)!.DistrictName!;
        }
        else if (accessLevel == "Division")
        {
            areaName = accessCode == 1 ? "Jammu" : "Kashmir";
        }
        return areaName;
    }

    public string GetBranchOffice(string applicationId)
    {
        var citizenDetails = dbcontext.CitizenApplications
     .FirstOrDefault(ca => ca.ReferenceNumber == applicationId);

        if (citizenDetails == null || string.IsNullOrEmpty(citizenDetails.FormDetails))
            throw new Exception("Application not found or form data missing.");

        int serviceId = citizenDetails.ServiceId;

        // Deserialize form data
        var formdata = JsonConvert.DeserializeObject<JObject>(citizenDetails.FormDetails!);

        // Extract District -> Division
        var locationArray = formdata!["Location"] as JArray;
        int? districtValue = (int?)locationArray?
            .FirstOrDefault(item => item["name"]?.ToString() == "District")?["value"];

        if (districtValue == null)
            throw new Exception("District not found in form data.");

        string division = dbcontext.Districts
            .FirstOrDefault(d => d.DistrictId == districtValue)!.Division == 1 ? "Jammu" : "Kashmir";

        // Get bank details JSON
        var bankDetailsJson = dbcontext.Services
            .FirstOrDefault(s => s.ServiceId == serviceId)?.BankDetails;

        if (string.IsNullOrEmpty(bankDetailsJson))
            throw new Exception("Bank details not found.");

        // Deserialize as JObject
        var bankDetailsObj = JsonConvert.DeserializeObject<JObject>(bankDetailsJson!);

        // Determine branch office
        string branchOffice = "";

        // Case 1: Contains division-specific structure
        if (bankDetailsObj!.ContainsKey("Jammu") || bankDetailsObj.ContainsKey("Kashmir"))
        {
            var divisionObj = bankDetailsObj[division] as JObject;
            branchOffice = divisionObj?["BranchOffice"]?.ToString() ?? "";
        }
        // Case 2: Flat structure
        else
        {
            branchOffice = bankDetailsObj["BranchOffice"]?.ToString() ?? "";
        }

        return branchOffice;

    }

    public async Task CreateSanctionPdf(Dictionary<string, string> details, string sanctionLetterFor, string information, OfficerDetailsModal Officer, string ApplicationId)
    {

        // Generate PDF into MemoryStream
        using var memoryStream = new MemoryStream();


        string emblem = System.IO.Path.Combine(_webHostEnvironment.WebRootPath, "assets", "images", "emblem.png");
        Image image = new Image(ImageDataFactory.Create(emblem))
                        .ScaleToFit(50, 50)
                        .SetHorizontalAlignment(HorizontalAlignment.CENTER);
        string? sanctionedFromWhere = Officer.AccessLevel != "State" ? $"Office of The {Officer.Role}, {GetArreaName(Officer.AccessLevel, Officer.AccessCode)}" : "SOCIAL WELFARE DEPARTMENT\nCIVIL SECRETARIAT, JAMMU / SRINAGAR";
        string? branchOffice = GetBranchOffice(ApplicationId);

        using PdfWriter writer = new(memoryStream);
        using PdfDocument pdf = new(writer);
        pdf.SetDefaultPageSize(PageSize.A4);
        using Document document = new(pdf);

        // Add content
        document.Add(image);
        document.Add(new Paragraph("Union Territory of Jammu and Kashmir")
            .SetBold()
            .SetTextAlignment(TextAlignment.CENTER)
            .SetFontSize(16));
        document.Add(new Paragraph(sanctionedFromWhere)
            .SetTextAlignment(TextAlignment.CENTER)
            .SetFontSize(16));
        document.Add(new Paragraph($"Sanction Letter for {sanctionLetterFor}")
            .SetTextAlignment(TextAlignment.CENTER)
            .SetFontSize(16));
        document.Add(new Paragraph($"To\n\nTHE MANAGER\nTHE JAMMU AND KASHMIR BANK LIMITED\nB/O {branchOffice}")
            .SetFontSize(14));
        document.Add(new Paragraph("\nPlease Find the Particulars of Beneficiary given below:")
            .SetFontSize(12));

        Table table = new Table(UnitValue.CreatePercentArray(2)).UseAllAvailableWidth();
        foreach (var item in details)
        {
            table.AddCell(new Cell().Add(new Paragraph(item.Key)));
            table.AddCell(new Cell().Add(new Paragraph(item.Value)));
        }
        document.Add(table);

        document.Add(new Paragraph($"{information}")
            .SetFontSize(10));

        // Create table for NO and ISSUING AUTHORITY
        Table idTable = new Table(UnitValue.CreatePercentArray([50, 50]))
            .UseAllAvailableWidth();
        idTable.AddCell(new Cell()
            .Add(new Paragraph($"NO: {ApplicationId}")
                .SetFontSize(8)
                .SetFontColor(ColorConstants.BLUE)
                .SetBold())
            .SetBorder(Border.NO_BORDER)
            .SetTextAlignment(TextAlignment.LEFT));
        idTable.AddCell(new Cell()
            .Add(new Paragraph("ISSUING AUTHORITY")
                .SetFontSize(10)
                .SetBold())
            .SetBorder(Border.NO_BORDER)
            .SetTextAlignment(TextAlignment.RIGHT));
        document.Add(idTable);

        // Create QR code
        Console.WriteLine("Details Keys: " + string.Join(", ", details.Keys));
        string qrContent = string.Join("\n", details
            .Where(kv => new[] { "NAME OF APPLICANT", "FATHER / HUSBAND / GUARDIAN", "ApplicationId" }.Contains(kv.Key))
            .Select(kv => $"{kv.Key}: {kv.Value}"));
        if (string.IsNullOrEmpty(qrContent))
        {
            Console.WriteLine("Warning: No matching details for QR code; using ApplicationId only");
            qrContent = $"ApplicationId: {ApplicationId}";
        }
        else
        {
            qrContent += $"\nApplicationId: {ApplicationId}";
        }
        Console.WriteLine("QR Content: " + qrContent);
        BarcodeQRCode qrCode = new BarcodeQRCode(qrContent);
        PdfFormXObject qrXObject = qrCode.CreateFormXObject(ColorConstants.BLACK, pdf);
        Image qrImage = new Image(qrXObject)
            .ScaleToFit(150, 150) // Set desired QR code size (200x200 points)
            .SetFixedPosition(30, 30); // Position at bottom-left (x=30, y=30)

        // Add QR code to the document
        document.Add(qrImage);

        // Create footer table for Date and Officer
        Table footerTable = new Table(UnitValue.CreatePercentArray([50, 50]))
            .UseAllAvailableWidth();
        footerTable.AddCell(new Cell()
            .Add(new Paragraph($"Date: {DateTime.Today:dd/MM/yyyy}")
                .SetFontSize(8)
                .SetFontColor(ColorConstants.BLUE)
                .SetBold())
            .SetBorder(Border.NO_BORDER)
            .SetTextAlignment(TextAlignment.LEFT));
        footerTable.AddCell(new Cell()
            .Add(new Paragraph($"{Officer.Role}, {GetArreaName(Officer.AccessLevel, Officer.AccessCode)}")
                .SetFontSize(10)
                .SetBold())
            .SetBorder(Border.NO_BORDER)
            .SetTextAlignment(TextAlignment.RIGHT));
        document.Add(footerTable);

        document.Close();
        await helper.GetFilePath(null, memoryStream.ToArray(), ApplicationId.Replace("/", "_") + "SanctionLetter.pdf");
    }

    public async Task CreateAcknowledgement(OrderedDictionary details, string applicationId, string serviceName)
    {
        // Generate PDF into MemoryStream
        using var memoryStream = new MemoryStream();
        using PdfWriter writer = new PdfWriter(memoryStream);
        using PdfDocument pdf = new PdfDocument(writer);
        using Document document = new Document(pdf);

        string emblem = System.IO.Path.Combine(_webHostEnvironment.WebRootPath, "assets", "images", "emblem.png");
        Image image = new Image(ImageDataFactory.Create(emblem))
                        .ScaleToFit(50, 50)
                        .SetHorizontalAlignment(HorizontalAlignment.CENTER);
        document.Add(image);

        document.Add(new Paragraph("Union Territory of Jammu and Kashmir")
            .SetBold()
            .SetTextAlignment(TextAlignment.CENTER)
            .SetFontSize(20));

        document.Add(new Paragraph(serviceName)
            .SetBold()
            .SetTextAlignment(TextAlignment.CENTER)
            .SetFontSize(16));

        document.Add(new Paragraph("Acknowledgement")
            .SetBold()
            .SetTextAlignment(TextAlignment.CENTER)
            .SetFontSize(16));

        Table table = new Table(UnitValue.CreatePercentArray(2)).UseAllAvailableWidth();
        foreach (DictionaryEntry item in details)
        {
            table.AddCell(new Cell().Add(new Paragraph(item.Key.ToString())));
            table.AddCell(new Cell().Add(new Paragraph(item.Value?.ToString() ?? string.Empty)));
        }
        document.Add(table);

        // Ensure the PDF is finalized
        document.Close();

        // Call GetFilePath to store in database
        await helper.GetFilePath(null, memoryStream.ToArray(), applicationId.Replace("/", "_") + DateTime.Now.ToString() + "Acknowledgement.pdf");
    }



}