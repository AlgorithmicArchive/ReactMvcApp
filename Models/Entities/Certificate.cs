using System;
using System.Collections.Generic;

namespace ReactMvcApp.Models.Entities;

public partial class Certificate
{
    public int Uuid { get; set; }

    public int OfficerId { get; set; }

    public byte[]? EncryptedCertificateData { get; set; }

    public byte[]? EncryptedPassword { get; set; }

    public byte[]? EncryptionKey { get; set; }

    public byte[]? EncryptionIv { get; set; }

    public string? RegisteredDate { get; set; }
}
