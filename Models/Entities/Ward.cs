using System;
using System.Collections.Generic;

namespace ReactMvcApp.Models.Entities;

public partial class Ward
{
    public int Uuid { get; set; }

    public int VillageId { get; set; }

    public string WardName { get; set; } = null!;

    public virtual Village Village { get; set; } = null!;
}
