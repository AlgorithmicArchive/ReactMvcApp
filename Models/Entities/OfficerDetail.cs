using System;
using System.Collections.Generic;

namespace ReactMvcApp.Models.Entities;

public partial class OfficerDetail
{
    public int DetailId { get; set; }

    public int OfficerId { get; set; }

    public string Role { get; set; } = null!;

    public string AccessLevel { get; set; } = null!;

    public int AccessCode { get; set; }

    public virtual User Officer { get; set; } = null!;
}
