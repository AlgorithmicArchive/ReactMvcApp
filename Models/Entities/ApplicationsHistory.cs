using System;
using System.Collections.Generic;

namespace ReactMvcApp.Models.Entities;

public partial class ApplicationsHistory
{
    public int HistoryId { get; set; }

    public int ServiceId { get; set; }

    public string ApplicationId { get; set; } = null!;

    public string ActionTaken { get; set; } = null!;

    public int TakenBy { get; set; }

    public string Remarks { get; set; } = null!;

    public string File { get; set; } = null!;

    public string TakenAt { get; set; } = null!;

    public virtual Application Application { get; set; } = null!;

    public virtual Service Service { get; set; } = null!;

    public virtual User TakenByNavigation { get; set; } = null!;
}
