using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using LuxHotel.Application.Security.Interfaces;
using LuxHotel.Application.Security.Settings;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace LuxHotel.Application.Security.Services;

public class JwtService : IJwtService
{
    private readonly JwtSettings _settings;

    public JwtService(IOptions<JwtSettings> settings)
    {
        _settings = settings.Value;

        if (string.IsNullOrWhiteSpace(_settings.SecretKey) || _settings.SecretKey.Length < 32)
            throw new InvalidOperationException("JwtSettings:SecretKey must be configured and at least 32 characters (HS256 requires 256-bit key).");
        if (string.IsNullOrWhiteSpace(_settings.Issuer))
            throw new InvalidOperationException("JwtSettings:Issuer must be configured.");
        if (string.IsNullOrWhiteSpace(_settings.Audience))
            throw new InvalidOperationException("JwtSettings:Audience must be configured.");
    }

    public string GenerateToken(Guid userId, string email, string role)
    {
        if (userId == Guid.Empty) throw new ArgumentException("userId must not be empty.", nameof(userId));
        if (string.IsNullOrWhiteSpace(email)) throw new ArgumentException("email is required.", nameof(email));
        if (string.IsNullOrWhiteSpace(role)) throw new ArgumentException("role is required.", nameof(role));

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, email),
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Role, role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.SecretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _settings.Issuer,
            audience: _settings.Audience,
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: DateTime.UtcNow.AddMinutes(_settings.ExpiresInMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
