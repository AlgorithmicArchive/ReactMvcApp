public class StatusCounts
{
    public int PendingCount { get; set; }
    public int ForwardedCount { get; set; }
    public int ReturnedCount { get; set; }
    public int ReturnToEditCount { get; set; }
    public int SanctionedCount { get; set; }
    public int RejectCount { get; set; }
    public int DisbursedCount { get; set; }
    public int TotalApplications { get; set; }
    public int ForwardedSanctionedCount { get; set; }

    // Corrigendum-specific
    public int CorrigendumPendingCount { get; set; }
    public int CorrigendumForwardedCount { get; set; }
    public int CorrigendumReturnedCount { get; set; }
    public int CorrigendumRejectedCount { get; set; }
    public int CorrigendumSanctionedCount { get; set; }
    public int CorrigendumCount { get; set; }
}
