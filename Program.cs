using System.Text;
using System.Text.Json.Serialization;
using Encryption;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ReactMvcApp.Models.Entities;
using SendEmails;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews().AddRazorRuntimeCompilation();
builder.Services.AddSignalR(); // Add SignalR service
builder.Services.Configure<Microsoft.AspNetCore.Http.Json.JsonOptions>(options => options.SerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);

builder.Services.AddDbContext<SocialWelfareDepartmentContext>(options =>
{
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")
    );
});

builder.Services.AddControllers().AddNewtonsoftJson(options =>
{
    options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalhost",
        builder =>
        {
            builder.AllowAnyHeader()
                   .AllowAnyMethod()
                   .AllowCredentials()
                   .WithOrigins("http://localhost:8081"); // Change to your frontend URL if necessary
        });
});

// JWT Authentication Setup
var jwtSecretKey = builder.Configuration.GetValue<string>("JWT:Secret");
var key = Encoding.ASCII.GetBytes(jwtSecretKey!);
builder.Services.AddAuthentication(options =>
{
    // Default authentication schemes
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["JWT:Issuer"],
        ValidAudience = builder.Configuration["JWT:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
});

// Authorization policies for different roles
builder.Services.AddAuthorizationBuilder()
    .AddPolicy("CitizenPolicy", policy => policy.RequireRole("Citizen"))
    .AddPolicy("OfficerPolicy", policy => policy.RequireRole("Officer"));

builder.Services.AddSession(option =>
{
    option.IdleTimeout = TimeSpan.FromMinutes(30);
});

builder.Services.AddTransient<IEmailSender, EmailSender>();
builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));
builder.Services.AddScoped<OtpStore>();
builder.Services.AddScoped<EmailSender>();
builder.Services.AddScoped<UserHelperFunctions>();
builder.Services.AddTransient<PdfService>();
builder.Services.AddSingleton<IEncryptionService, EncryptionHelper>();
builder.Services.AddCors();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}
app.UseHttpsRedirection();
app.UseStaticFiles(new StaticFileOptions{
    OnPrepareResponse = ctx=>{
        if(ctx.File.Name.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase)){
            ctx.Context.Response.Headers.Append("Content-Disposition", "inline");
        }
    }
});

app.UseRouting();
app.UseCors("AllowLocalhost");

// Ensure both JWT and Cookie Authentication are used
app.UseAuthentication();
app.UseAuthorization();

app.UseSession();

// Map SignalR hub route
app.MapHub<ProgressHub>("/progressHub");

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

// Add this line to handle fallback routing for React
app.MapFallbackToController("Index", "Home");

app.Run();
