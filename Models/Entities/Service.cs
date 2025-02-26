using System;
using System.Collections.Generic;

namespace ReactMvcApp.Models.Entities;

public partial class Service
{
    public int ServiceId { get; set; }

    public string? ServiceName { get; set; }

    public string? NameShort { get; set; }

    public string? Department { get; set; }

    public string? FormElement { get; set; }

    public string? BankDetails { get; set; }

    public string? OfficerEditableField { get; set; }

    public string? WebService { get; set; }

    public string? CreatedAt { get; set; }

    public bool Active { get; set; }

    public virtual ICollection<ApplicationPerDistrict> ApplicationPerDistricts { get; set; } = new List<ApplicationPerDistrict>();

    public virtual ICollection<ApplicationStatus> ApplicationStatuses { get; set; } = new List<ApplicationStatus>();

    public virtual ICollection<Application> Applications { get; set; } = new List<Application>();

    public virtual ICollection<ApplicationsCount> ApplicationsCounts { get; set; } = new List<ApplicationsCount>();

    public virtual ICollection<ApplicationsHistory> ApplicationsHistories { get; set; } = new List<ApplicationsHistory>();

    public virtual ICollection<BankFile> BankFiles { get; set; } = new List<BankFile>();

    public virtual ICollection<CitizenApplication> CitizenApplications { get; set; } = new List<CitizenApplication>();

    public virtual ICollection<WorkFlow> WorkFlows { get; set; } = new List<WorkFlow>();
}
