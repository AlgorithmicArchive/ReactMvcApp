public class StatusCounts
{
    public int PendingCount { get; set; }
    public int ForwardedCount { get; set; }
    public int ReturnedCount { get; set; }
    public int ReturnToEditCount { get; set; }
    public int SanctionedCount { get; set; }
    public int RejectCount { get; set; }
    public int DisbursedCount { get; set; } // Added for the DisbursedCount
    public int TotalApplications { get; set; } // New property for total applications count
}
