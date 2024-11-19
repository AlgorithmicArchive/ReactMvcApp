using System;
using System.Collections.Generic;

namespace ReactMvcApp.Models.Entities;

public partial class PaymentDetail
{
    public int PaymentId { get; set; }

    public string ApplicationId { get; set; } = null!;

    public string ApplicantName { get; set; } = null!;

    public string Status { get; set; } = null!;

    public string TransactionId { get; set; } = null!;

    public string DateOfDistribution { get; set; } = null!;

    public string TransactionStatus { get; set; } = null!;

    public virtual Application Application { get; set; } = null!;
}
