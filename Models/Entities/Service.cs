using System;
using System.Collections.Generic;

namespace ReactMvcApp.Models.Entities;

public partial class Service
{
    public int ServiceId { get; set; }

    public string ServiceName { get; set; } = null!;

    public string NameShort { get; set; } = null!;

    public string Department { get; set; } = null!;

    public string FormElement { get; set; } = null!;

    public string BankDetails { get; set; } = null!;

    public string OfficerEditableField { get; set; } = null!;

    public string? WebService { get; set; }

    public string? CreatedAt { get; set; }

    public bool Active { get; set; }

    public virtual ICollection<ApplicationStatus> ApplicationStatuses { get; set; } = new List<ApplicationStatus>();

    public virtual ICollection<Application> Applications { get; set; } = new List<Application>();

    public virtual ICollection<ApplicationsCount> ApplicationsCounts { get; set; } = new List<ApplicationsCount>();

    public virtual ICollection<ApplicationsHistory> ApplicationsHistories { get; set; } = new List<ApplicationsHistory>();

    public virtual ICollection<BankFile> BankFiles { get; set; } = new List<BankFile>();

    public virtual ICollection<WorkFlow> WorkFlows { get; set; } = new List<WorkFlow>();
}
