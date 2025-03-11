using System;
using System.Collections.Generic;

namespace ReactMvcApp.Models.Entities;

public partial class CitizenApplication
{
    public string ReferenceNumber { get; set; } = null!;

    public int CitizenId { get; set; }

    public int ServiceId { get; set; }

    public string? FormDetails { get; set; }

    public string? WorkFlow { get; set; }

    public string? AdditionalDetails { get; set; }

    public int CurrentPlayer { get; set; }

    public string? Status { get; set; }

    public string? CreatedAt { get; set; }
}
