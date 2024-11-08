using System;
using System.Collections.Generic;

namespace ReactMvcApp.Models.Entities;

public partial class ApplicationsCount
{
    public int CountId { get; set; }

    public int ServiceId { get; set; }

    public int OfficerId { get; set; }

    public string? Status { get; set; }

    public int Count { get; set; }

    public string LastUpdated { get; set; } = null!;

    public virtual User Officer { get; set; } = null!;

    public virtual Service Service { get; set; } = null!;
}
