using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using LuxHotel.Application.Security.Interfaces;
using LuxHotel.Application.Security.Services;
using LuxHotel.Application.Security.Settings;
using Microsoft.Extensions.Options;

namespace LuxHotel.Tests.Security;

public class JwtServiceTests
{
    private const string ValidSecret = "this-is-a-valid-32-char-secret-key!!";
    private const string Issuer = "LuxHotel";
    private const string Audience = "LuxHotelUsers";

    private static IJwtService BuildService(JwtSettings? overrides = null)
    {
        var settings = overrides ?? new JwtSettings
        {
            SecretKey = ValidSecret,
            Issuer = Issuer,
            Audience = Audience,
            ExpiresInMinutes = 60
        };
        return new JwtService(Options.Create(settings));
    }

    [Fact]
    public void Constructor_throws_when_secret_key_is_too_short()
    {
        var settings = new JwtSettings
        {
            SecretKey = "short",
            Issuer = Issuer,
            Audience = Audience
        };
        Assert.Throws<InvalidOperationException>(() => new JwtService(Options.Create(settings)));
    }

    [Fact]
    public void Constructor_throws_when_issuer_is_missing()
    {
        var settings = new JwtSettings
        {
            SecretKey = ValidSecret,
            Issuer = "",
            Audience = Audience
        };
        Assert.Throws<InvalidOperationException>(() => new JwtService(Options.Create(settings)));
    }

    [Fact]
    public void Constructor_throws_when_audience_is_missing()
    {
        var settings = new JwtSettings
        {
            SecretKey = ValidSecret,
            Issuer = Issuer,
            Audience = ""
        };
        Assert.Throws<InvalidOperationException>(() => new JwtService(Options.Create(settings)));
    }

    [Fact]
    public void GenerateToken_throws_when_userId_is_empty()
    {
        var sut = BuildService();
        Assert.Throws<ArgumentException>(() => sut.GenerateToken(Guid.Empty, "a@b.com", "User"));
    }

    [Fact]
    public void GenerateToken_throws_when_email_is_blank()
    {
        var sut = BuildService();
        Assert.Throws<ArgumentException>(() => sut.GenerateToken(Guid.NewGuid(), "  ", "User"));
    }

    [Fact]
    public void GenerateToken_throws_when_role_is_blank()
    {
        var sut = BuildService();
        Assert.Throws<ArgumentException>(() => sut.GenerateToken(Guid.NewGuid(), "a@b.com", ""));
    }

    [Fact]
    public void GenerateToken_returns_signed_jwt_with_expected_claims()
    {
        var sut = BuildService();
        var userId = Guid.NewGuid();
        var token = sut.GenerateToken(userId, "user@lux.com", "Admin");

        Assert.False(string.IsNullOrWhiteSpace(token));

        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);

        Assert.Equal(Issuer, jwt.Issuer);
        Assert.Contains(Audience, jwt.Audiences);
        Assert.Equal(userId.ToString(), jwt.Claims.Single(c => c.Type == JwtRegisteredClaimNames.Sub).Value);
        Assert.Equal("user@lux.com", jwt.Claims.Single(c => c.Type == JwtRegisteredClaimNames.Email).Value);
        Assert.Equal("Admin", jwt.Claims.Single(c => c.Type == ClaimTypes.Role).Value);
        Assert.NotEmpty(jwt.Claims.Single(c => c.Type == JwtRegisteredClaimNames.Jti).Value);
    }

    [Fact]
    public void GenerateToken_sets_expiry_close_to_configured_minutes()
    {
        var sut = BuildService(new JwtSettings
        {
            SecretKey = ValidSecret,
            Issuer = Issuer,
            Audience = Audience,
            ExpiresInMinutes = 30
        });

        var before = DateTime.UtcNow;
        var token = sut.GenerateToken(Guid.NewGuid(), "user@lux.com", "User");
        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);

        var expected = before.AddMinutes(30);
        Assert.InRange(jwt.ValidTo, expected.AddSeconds(-5), expected.AddSeconds(5));
    }

    [Fact]
    public void GenerateToken_produces_unique_jti_per_call()
    {
        var sut = BuildService();
        var t1 = new JwtSecurityTokenHandler().ReadJwtToken(sut.GenerateToken(Guid.NewGuid(), "a@b.com", "User"));
        var t2 = new JwtSecurityTokenHandler().ReadJwtToken(sut.GenerateToken(Guid.NewGuid(), "a@b.com", "User"));

        var jti1 = t1.Claims.Single(c => c.Type == JwtRegisteredClaimNames.Jti).Value;
        var jti2 = t2.Claims.Single(c => c.Type == JwtRegisteredClaimNames.Jti).Value;

        Assert.NotEqual(jti1, jti2);
    }
}
