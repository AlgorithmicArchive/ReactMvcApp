using System;
using System.Collections.Generic;

namespace ReactMvcApp.Models.Entities;

public partial class ApplicationsHistory
{
    public int Uuid { get; set; }

    public string ApplicationId { get; set; } = null!;

    public string History { get; set; } = null!;

    public virtual Application Application { get; set; } = null!;
}
