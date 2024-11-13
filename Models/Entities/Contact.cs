using System;
using System.Collections.Generic;

namespace ReactMvcApp.Models.Entities;

public partial class Contact
{
    public int Uuid { get; set; }

    public string FullName { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string Message { get; set; } = null!;

    public string SubmissionDate { get; set; } = null!;
}
