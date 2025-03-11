using System;
using System.Collections.Generic;

namespace ReactMvcApp.Models.Entities;

public partial class ApplicationPerDistrict
{
    public int Uuid { get; set; }

    public int DistrictId { get; set; }

    public int? ServiceId { get; set; }

    public string? FinancialYear { get; set; }

    public int CountValue { get; set; }
}
