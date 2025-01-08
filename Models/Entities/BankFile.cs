using System;
using System.Collections.Generic;

namespace ReactMvcApp.Models.Entities;

public partial class BankFile
{
    public int FileId { get; set; }

    public int DistrictId { get; set; }

    public int ServiceId { get; set; }

    public string FileName { get; set; } = null!;

    public string GeneratedDate { get; set; } = null!;

    public int TotalRecords { get; set; }

    public bool FileSent { get; set; }

    public string SentOn { get; set; } = null!;

    public string ResponseFile { get; set; } = null!;

    public string RecievedOn { get; set; } = null!;

    public bool DbUpdate { get; set; }

    public string UpdatedOn { get; set; } = null!;

    public virtual District District { get; set; } = null!;

    public virtual Service Service { get; set; } = null!;
}
