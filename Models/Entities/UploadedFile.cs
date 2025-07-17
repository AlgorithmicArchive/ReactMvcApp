using System;
using System.Collections.Generic;

namespace SahayataNidhi.Models.Entities;

public partial class UploadedFile
{
    public int FileId { get; set; }

    public string FileName { get; set; } = null!;

    public string FileType { get; set; } = null!;

    public long FileSize { get; set; }

    public byte[] FileData { get; set; } = null!;

    public DateTime UploadDate { get; set; }
}
