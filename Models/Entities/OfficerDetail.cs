using System;
using System.Collections.Generic;

namespace SahayataNidhi.Models.Entities;

public partial class OfficerDetail
{
    public int DetailId { get; set; }

    public int OfficerId { get; set; }

    public string? Role { get; set; }

    public string? AccessLevel { get; set; }

    public int AccessCode { get; set; }
}
