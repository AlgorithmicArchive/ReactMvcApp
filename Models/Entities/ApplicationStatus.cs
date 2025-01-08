using System;
using System.Collections.Generic;

namespace ReactMvcApp.Models.Entities;

public partial class ApplicationStatus
{
    public int StatusId { get; set; }

    public int ServiceId { get; set; }

    public string? AccessLevel { get; set; }

    public int? AccessCode { get; set; }

    public string? Role { get; set; }

    public string ApplicationId { get; set; } = null!;

    public string Status { get; set; } = null!;

    public int? CurrentlyWith { get; set; }

    public bool CanPull { get; set; }

    public string LastUpdated { get; set; } = null!;

    public virtual Application Application { get; set; } = null!;

    public virtual User? CurrentlyWithNavigation { get; set; }

    public virtual Service Service { get; set; } = null!;
}
