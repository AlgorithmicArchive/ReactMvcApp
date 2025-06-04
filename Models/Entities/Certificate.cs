using System;
using System.Collections.Generic;

namespace ReactMvcApp.Models.Entities;

public partial class Certificate
{
    public int Uuid { get; set; }

    public int OfficerId { get; set; }

    public byte[]? SerialNumber { get; set; }

    public string? CertifiyingAuthority { get; set; }

    public DateTime? ExpirationDate { get; set; }

    public string? RegisteredDate { get; set; }

    public virtual User Uu { get; set; } = null!;
}
