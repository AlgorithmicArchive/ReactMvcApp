using System;
using System.Collections.Generic;

namespace ReactMvcApp.Models.Entities;

public partial class CitizenApplication
{
    public string ReferenceNumber { get; set; } = null!;

    public int CitizenId { get; set; }

    public int ServiceId { get; set; }

    public string FormDetails { get; set; } = null!;

    public string WorkFlow { get; set; } = null!;

    public string? AdditionalDetails { get; set; }

    public int CurrentPlayer { get; set; }

    public string Status { get; set; } = null!;

    public string CreatedAt { get; set; } = null!;

    public virtual User Citizen { get; set; } = null!;

    public virtual Service Service { get; set; } = null!;
}
