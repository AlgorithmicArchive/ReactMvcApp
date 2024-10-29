using System;
using System.Collections.Generic;

namespace ReactMvcApp.Models.Entities;

public partial class Officer
{
    public int OfficerId { get; set; }

    public string Name { get; set; } = null!;

    public string Username { get; set; } = null!;

    public string Email { get; set; } = null!;

    public byte[] Password { get; set; } = null!;

    public string MobileNumber { get; set; } = null!;

    public string Profile { get; set; } = null!;

    public string Role { get; set; } = null!;

    public string AccessLevel { get; set; } = null!;

    public int AccessCode { get; set; }

    public string BackupCodes { get; set; } = null!;

    public bool IsEmailValid { get; set; }

    public string RegisteredDate { get; set; } = null!;

    public virtual ICollection<ApplicationStatus> ApplicationStatuses { get; set; } = new List<ApplicationStatus>();

    public virtual ICollection<ApplicationsCount> ApplicationsCounts { get; set; } = new List<ApplicationsCount>();

    public virtual ICollection<ApplicationsHistory> ApplicationsHistories { get; set; } = new List<ApplicationsHistory>();

    public virtual ICollection<Certificate> Certificates { get; set; } = new List<Certificate>();
}
