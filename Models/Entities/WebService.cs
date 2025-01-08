using System;
using System.Collections.Generic;

namespace ReactMvcApp.Models.Entities;

public partial class WebService
{
    public int WebserviceId { get; set; }

    public string ServiceName { get; set; } = null!;

    public string ServerUrl { get; set; } = null!;

    public string Method { get; set; } = null!;

    public string ResponseType { get; set; } = null!;

    public int SuccessCode { get; set; }

    public string Fields { get; set; } = null!;

    public DateTime CreatedAt { get; set; }
}
