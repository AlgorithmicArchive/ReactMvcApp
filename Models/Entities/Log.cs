﻿using System;
using System.Collections.Generic;

namespace ReactMvcApp.Models.Entities;

public partial class Log
{
    public int LogId { get; set; }

    public int UserId { get; set; }

    public string UserType { get; set; } = null!;

    public string IpAddress { get; set; } = null!;

    public string Action { get; set; } = null!;

    public string DateOfAction { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
