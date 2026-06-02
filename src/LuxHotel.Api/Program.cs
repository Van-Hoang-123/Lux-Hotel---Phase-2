using FluentValidation;
using FluentValidation.AspNetCore;
using LuxHotel.Api.Middleware;
using LuxHotel.Application.Security.Interfaces;
using LuxHotel.Application.Security.Services;
using LuxHotel.Application.Security.Settings;
using LuxHotel.Application.Validators;
using LuxHotel.Domain.Entities;
using LuxHotel.Domain.Interfaces;
using LuxHotel.Infrastructure.Persistence;
using LuxHotel.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);
var databaseProvider = builder.Configuration["DatabaseProvider"] ?? "SqlServer";
var defaultConnection = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("DefaultConnection is missing in configuration.");

builder.Services.AddDbContext<LuxHotelDbContext>(options =>
{
    if (databaseProvider.Equals("Sqlite", StringComparison.OrdinalIgnoreCase))
    {
        options.UseSqlite(defaultConnection);
        return;
    }

    options.UseSqlServer(defaultConnection);
});

// Repositories
builder.Services.AddScoped<IRoomRepository, RoomRepository>();

builder.Services
    .AddIdentityCore<User>(options =>
    {
        options.User.RequireUniqueEmail = true;
        options.Password.RequiredLength = 8;
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireNonAlphanumeric = false;
    })
    .AddRoles<IdentityRole<Guid>>()
    .AddEntityFrameworkStores<LuxHotelDbContext>()
    .AddDefaultTokenProviders();

builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
builder.Services.AddSingleton<IJwtService, JwtService>();

var jwt = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>()
    ?? throw new InvalidOperationException("JwtSettings section is missing in configuration.");

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwt.Issuer,
            ValidAudience = jwt.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.SecretKey)),
            ClockSkew = TimeSpan.FromSeconds(30)
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", p => p.RequireRole("Admin"));
    options.AddPolicy("UserOnly", p => p.RequireRole("User"));
});

//builder.Services.AddValidatorsFromAssemblyContaining<BookingValidator>(); * REMOVED BY QuangTu
builder.Services.AddValidatorsFromAssemblyContaining<RoomValidator>();
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddFluentValidationClientsideAdapters();


builder.Services.AddAntiforgery(options =>
{
    options.HeaderName = "X-XSRF-TOKEN";
    options.Cookie.Name = "XSRF-TOKEN";
    options.Cookie.HttpOnly = false;
    options.Cookie.SecurePolicy = Microsoft.AspNetCore.Http.CookieSecurePolicy.SameAsRequest;
    options.Cookie.SameSite = SameSiteMode.Strict;
});

builder.Services.AddOpenApi();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Lux Hotel API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter the JWT token only — Swagger adds the 'Bearer ' prefix automatically."
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});


var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<LuxHotelDbContext>();
    if (databaseProvider.Equals("Sqlite", StringComparison.OrdinalIgnoreCase))
    {
        await dbContext.Database.EnsureCreatedAsync();
    }
    else
    {
        await dbContext.Database.MigrateAsync();
    }

    await SeedIdentityAsync(scope.ServiceProvider, app.Configuration);
}

app.UseMiddleware<AntiXssMiddleware>();

app.MapOpenApi();
app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("AllowFrontend");

var frontendRoot = Path.Combine(app.Environment.ContentRootPath, "Lux Hotel 1");
if (Directory.Exists(frontendRoot))
{
    var fileProvider = new PhysicalFileProvider(frontendRoot);
    app.UseDefaultFiles(new DefaultFilesOptions { FileProvider = fileProvider });
    app.UseStaticFiles(new StaticFileOptions { FileProvider = fileProvider });
}

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.MapFallback(async context =>
{
    if (context.Request.Path.StartsWithSegments("/api"))
    {
        context.Response.StatusCode = StatusCodes.Status404NotFound;
        return;
    }

    var indexPath = Path.Combine(frontendRoot, "index.html");
    if (!File.Exists(indexPath))
    {
        context.Response.StatusCode = StatusCodes.Status404NotFound;
        return;
    }

    context.Response.ContentType = "text/html";
    await context.Response.SendFileAsync(indexPath);
});

app.Run();

static async Task SeedIdentityAsync(IServiceProvider services, IConfiguration configuration)
{
    var roleManager = services.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
    var userManager = services.GetRequiredService<UserManager<User>>();

    foreach (var role in new[] { "Admin", "User" })
    {
        if (!await roleManager.RoleExistsAsync(role))
        {
            await roleManager.CreateAsync(new IdentityRole<Guid>(role));
        }
    }

    var adminEmail = configuration["SeedAdmin:Email"];
    var adminPassword = configuration["SeedAdmin:Password"];
    var adminName = configuration["SeedAdmin:FullName"] ?? "Lux Admin Test";

    if (string.IsNullOrWhiteSpace(adminEmail) || string.IsNullOrWhiteSpace(adminPassword))
    {
        return;
    }

    var admin = await userManager.FindByEmailAsync(adminEmail);
    if (admin is null)
    {
        admin = new User
        {
            Id = Guid.NewGuid(),
            FullName = adminName,
            Email = adminEmail,
            UserName = adminEmail,
            EmailConfirmed = true,
            Role = "Admin"
        };

        var result = await userManager.CreateAsync(admin, adminPassword);
        if (!result.Succeeded)
        {
            throw new InvalidOperationException(string.Join("; ", result.Errors.Select(error => error.Description)));
        }
    }

    if (admin.Role != "Admin")
    {
        admin.Role = "Admin";
        await userManager.UpdateAsync(admin);
    }

    if (!await userManager.IsInRoleAsync(admin, "Admin"))
    {
        await userManager.AddToRoleAsync(admin, "Admin");
    }
}
