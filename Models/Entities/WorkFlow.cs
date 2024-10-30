using System;
using System.Collections.Generic;

namespace ReactMvcApp.Models.Entities;

public partial class WorkFlow
{
    public int WorkFlowId { get; set; }

    public int ServiceId { get; set; }

    public string Role { get; set; } = null!;

    public int SequenceOrder { get; set; }

    public bool CanForward { get; set; }

    public bool CanReturn { get; set; }

    public bool CanReturnToEdit { get; set; }

    public bool CanUpdate { get; set; }

    public bool CanSanction { get; set; }

    public bool CanReject { get; set; }

    public virtual Service Service { get; set; } = null!;
}
