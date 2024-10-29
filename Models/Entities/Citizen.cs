using System;
using System.Collections.Generic;

namespace ReactMvcApp.Models.Entities;

public partial class Citizen
{
    public int CitizenId { get; set; }

    public string Name { get; set; } = null!;

    public string Username { get; set; } = null!;

    public string Email { get; set; } = null!;

    public byte[] Password { get; set; } = null!;

    public string MobileNumber { get; set; } = null!;

    public string Profile { get; set; } = null!;

    public string BackupCodes { get; set; } = null!;

    public bool IsEmailValid { get; set; }

    public string RegisteredDate { get; set; } = null!;

    public virtual ICollection<Application> Applications { get; set; } = new List<Application>();
}
