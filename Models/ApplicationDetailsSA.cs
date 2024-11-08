public class ApplicationDetailsSA
{
    public string? ReferenceNumber { get; set; }         // Maps to A.ApplicationId as "Reference Number"
    public string? ApplicantName { get; set; }        // Maps to A.ApplicantName as "Applicant Name"
    public string? SubmissionDate { get; set; }     // Maps to A.SubmissionDate as "Submission Date"
    public string? AppliedDistrict { get; set; }      // Maps to D.DistrictName as "Applied District"
    public string? AppliedService { get; set; }       // Maps to S.ServiceName as "Applied Service"
    public string? CurrentlyWith { get; set; }        // Maps to OD.Role as "Currently With"
    public string? Status { get; set; }               // Maps to STAT.Status as "Status"
}
