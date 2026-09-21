using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Identity.Web;

var builder = WebApplication.CreateBuilder(args);

// 1. Configure Microsoft JWT Bearer Authentication & Roles
JwtSecurityTokenHandler.DefaultMapInboundClaims = false;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApi(options =>
    {
        builder.Configuration.Bind("AzureAd", options);
        var tenantId = builder.Configuration["AzureAd:TenantId"];
        var clientId = builder.Configuration["AzureAd:ClientId"];

        // Ensure .NET reads user roles from the 'roles' claim issued by Microsoft Entra
        options.TokenValidationParameters.RoleClaimType = "roles";

        // Accept both URI format and Client ID as valid audiences
        options.TokenValidationParameters.ValidAudiences = new[]
        {
            $"api://{clientId}",
            clientId
        };

        // Accept both v1.0 and v2.0 token issuers
        options.TokenValidationParameters.ValidIssuers = new[]
        {
            $"https://login.microsoftonline.com/{tenantId}/v2.0",
            $"https://sts.windows.net/{tenantId}/"
        };
    },
    options =>
    {
        builder.Configuration.Bind("AzureAd", options);
    });

// 2. Add Authorization services
builder.Services.AddAuthorization();

// 3. Configure CORS to allow our React frontend (http://localhost:5173) to call this API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Enable CORS
app.UseCors("AllowReactApp");

// Enable Authentication (identifies WHO the caller is from the token)
app.UseAuthentication();

// Enable Authorization (checks WHAT the caller is allowed to do)
app.UseAuthorization();

// ==================== ENDPOINTS ====================

// Public endpoint: Anyone can access without a token
app.MapGet("/api/public", () =>
{
    return Results.Ok(new
    {
        status = "Success",
        message = "Public endpoint reached! No token was needed."
    });
});

// User endpoint: Accessible by users with either 'User' or 'Admin' role
app.MapGet("/api/user-data", (ClaimsPrincipal user) =>
{
    var name = user.Identity?.Name ?? user.FindFirst("preferred_username")?.Value ?? "User";
    var roles = user.Claims.Where(c => c.Type == "roles" || c.Type == ClaimTypes.Role).Select(c => c.Value);

    return Results.Ok(new
    {
        status = "Success",
        message = $"Welcome, {name}! You have authorized access to standard customer data.",
        roles = roles
    });
}).RequireAuthorization(new AuthorizeAttribute { Roles = "User,Admin" });

// Admin-only endpoint: Accessible ONLY by users with the 'Admin' role
app.MapGet("/api/admin-data", (ClaimsPrincipal user) =>
{
    var name = user.Identity?.Name ?? user.FindFirst("preferred_username")?.Value ?? "Admin";

    return Results.Ok(new
    {
        status = "Success",
        message = $"CONFIDENTIAL: Welcome Admin {name}! You have administrative access to user management.",
        timestamp = DateTime.UtcNow
    });
}).RequireAuthorization(new AuthorizeAttribute { Roles = "Admin" });

// Root health check: lets you verify the server is running in the browser
app.MapGet("/", () => Results.Ok(new
{
    status = "Healthy",
    service = "HiViz .NET Web API is running smoothly!"
}));


// Diagnostic endpoint: Returns all claims in the token for testing
app.MapGet("/api/me", (ClaimsPrincipal user) =>
{
    return Results.Ok(new
    {
        name = user.Identity?.Name,
        claims = user.Claims.Select(c => new { c.Type, c.Value })
    });
}).RequireAuthorization();

app.Run();  