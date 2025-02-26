using System;
using System.Collections.Generic;

namespace ReactMvcApp.Models.Entities;

public partial class User
{
    public int UserId { get; set; }

    public string Name { get; set; } = null!;

    public string Username { get; set; } = null!;

    public string Email { get; set; } = null!;

    public byte[] Password { get; set; } = null!;

    public string MobileNumber { get; set; } = null!;

    public string Profile { get; set; } = null!;

    public string UserType { get; set; } = null!;

    public string BackupCodes { get; set; } = null!;

    public bool IsEmailValid { get; set; }

    public string RegisteredDate { get; set; } = null!;

    public virtual ICollection<ApplicationStatus> ApplicationStatuses { get; set; } = new List<ApplicationStatus>();

    public virtual ICollection<Application> Applications { get; set; } = new List<Application>();

    public virtual ICollection<ApplicationsCount> ApplicationsCounts { get; set; } = new List<ApplicationsCount>();

    public virtual ICollection<ApplicationsHistory> ApplicationsHistories { get; set; } = new List<ApplicationsHistory>();

    public virtual ICollection<Certificate> Certificates { get; set; } = new List<Certificate>();

    public virtual ICollection<CitizenApplication> CitizenApplications { get; set; } = new List<CitizenApplication>();

    public virtual ICollection<OfficerDetail> OfficerDetails { get; set; } = new List<OfficerDetail>();
}
