using System;
using System.Collections.Generic;

namespace ReactMvcApp.Models.Entities;

public partial class ApplicationsCount
{
    public int CountId { get; set; }

    public int ServiceId { get; set; }

    public string? AccessLevel { get; set; }

    public int? AccessCode { get; set; }

    public string? Role { get; set; }

    public int? OfficerId { get; set; }

    public string Status { get; set; } = null!;

    public int Count { get; set; }

    public string LastUpdated { get; set; } = null!;

    public virtual User? Officer { get; set; }

    public virtual Service Service { get; set; } = null!;
}
