﻿using System;
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

    public string? DocumentFields { get; set; }

    public string? Letters { get; set; }

    public string? Pool { get; set; }

    public string? Approve { get; set; }

    public bool? ApprovalListEnabled { get; set; }

    public string? WebService { get; set; }

    public string? CreatedAt { get; set; }

    public bool Active { get; set; }

    public virtual ICollection<Pool> Pools { get; set; } = new List<Pool>();

    public virtual ICollection<WebService> WebServices { get; set; } = new List<WebService>();
}
