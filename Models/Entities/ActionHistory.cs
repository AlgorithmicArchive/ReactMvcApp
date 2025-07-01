using System;
using System.Collections.Generic;

namespace SahayataNidhi.Models.Entities;

public partial class ActionHistory
{
    public int HistoryId { get; set; }

    public string ReferenceNumber { get; set; } = null!;

    public string ActionTaker { get; set; } = null!;

    public string ActionTaken { get; set; } = null!;

    public string? Remarks { get; set; }

    public string ActionTakenDate { get; set; } = null!;
}
