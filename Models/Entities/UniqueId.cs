using System;
using System.Collections.Generic;

namespace ReactMvcApp.Models.Entities;

public partial class UniqueId
{
    public int Uuid { get; set; }

    public string District { get; set; } = null!;

    public string Month { get; set; } = null!;

    public int Counter { get; set; }
}
