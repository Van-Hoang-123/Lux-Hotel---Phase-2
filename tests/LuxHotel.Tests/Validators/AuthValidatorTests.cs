using LuxHotel.Application.Dtos.Auth;
using LuxHotel.Application.Validators;

namespace LuxHotel.Tests.Validators;

public class AuthValidatorTests
{
    [Fact]
    public void Register_valid_payload_passes()
    {
        var sut = new RegisterRequestValidator();
        var result = sut.Validate(new RegisterRequestDto
        {
            FullName = "Test User",
            Email = "test@lux.com",
            Password = "Password1",
            ConfirmPassword = "Password1",
            PhoneNumber = "0123456789"
        });

        Assert.True(result.IsValid);
    }

    [Fact]
    public void Register_password_confirmation_must_match()
    {
        var sut = new RegisterRequestValidator();
        var result = sut.Validate(new RegisterRequestDto
        {
            FullName = "Test User",
            Email = "test@lux.com",
            Password = "Password1",
            ConfirmPassword = "Password2"
        });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.PropertyName == nameof(RegisterRequestDto.ConfirmPassword));
    }

    [Fact]
    public void Register_weak_password_fails()
    {
        var sut = new RegisterRequestValidator();
        var result = sut.Validate(new RegisterRequestDto
        {
            FullName = "Test User",
            Email = "test@lux.com",
            Password = "password",
            ConfirmPassword = "password"
        });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.PropertyName == nameof(RegisterRequestDto.Password));
    }

    [Fact]
    public void Login_requires_email_and_password()
    {
        var sut = new LoginRequestValidator();
        var result = sut.Validate(new LoginRequestDto());

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.PropertyName == nameof(LoginRequestDto.Email));
        Assert.Contains(result.Errors, error => error.PropertyName == nameof(LoginRequestDto.Password));
    }

    [Fact]
    public void Update_profile_requires_full_name()
    {
        var sut = new UpdateProfileRequestValidator();
        var result = sut.Validate(new UpdateProfileRequestDto { FullName = "" });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.PropertyName == nameof(UpdateProfileRequestDto.FullName));
    }
}
