public class ApplicationsHistoryModal
{
    public string? Designation { get; set; }      // Maps to Role in OfficerDetails
    public string? ActionTaken { get; set; }      // Maps to ActionTaken in ApplicationsHistory
    public string? Remarks { get; set; }          // Maps to Remarks in ApplicationsHistory
    public string? File { get; set; }
    public string? TakenAt { get; set; }    // Maps to TakenAt in ApplicationsHistory
}
