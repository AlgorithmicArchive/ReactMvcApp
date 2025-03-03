﻿using System;
using System.Collections.Generic;

namespace ReactMvcApp.Models.Entities;

public partial class Feedback
{
    public int Uuid { get; set; }

    public int UserId { get; set; }

    public string ServiceRelated { get; set; } = null!;

    public string Message { get; set; } = null!;

    public decimal SubmittedAt { get; set; }
}
