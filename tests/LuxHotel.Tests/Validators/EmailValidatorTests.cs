using LuxHotel.Application.Dtos;
using LuxHotel.Application.Validators;

namespace LuxHotel.Tests.Validators;

public class EmailValidatorTests
{
    private readonly EmailValidator _sut = new();

    [Theory]
    [InlineData("user@lux.com")]
    [InlineData("user.name+tag@subdomain.example.co")]
    public void Valid_email_passes(string email)
    {
        var result = _sut.Validate(new EmailSubscriptionDto { Email = email });
        Assert.True(result.IsValid);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("not-an-email")]
    [InlineData("@missing-local.com")]
    [InlineData("missing-domain@")]
    [InlineData("missing-at-sign.com")]
    public void Invalid_email_fails(string email)
    {
        var result = _sut.Validate(new EmailSubscriptionDto { Email = email });
        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(EmailSubscriptionDto.Email));
    }

    [Fact]
    public void Email_over_max_length_fails()
    {
        var local = new string('a', 250);
        var email = $"{local}@x.co";
        var result = _sut.Validate(new EmailSubscriptionDto { Email = email });
        Assert.False(result.IsValid);
    }
}
