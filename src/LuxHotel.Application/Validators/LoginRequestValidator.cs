using FluentValidation;
using LuxHotel.Application.Dtos.Auth;

namespace LuxHotel.Application.Validators;

public class LoginRequestValidator : AbstractValidator<LoginRequestDto>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("email is required.")
            .EmailAddress().WithMessage("email must be valid.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("password is required.");
    }
}
