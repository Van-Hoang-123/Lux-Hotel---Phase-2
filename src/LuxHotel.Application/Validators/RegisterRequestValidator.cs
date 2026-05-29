using FluentValidation;
using LuxHotel.Application.Dtos.Auth;

namespace LuxHotel.Application.Validators;

public class RegisterRequestValidator : AbstractValidator<RegisterRequestDto>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("fullName is required.")
            .MaximumLength(150).WithMessage("fullName must be at most 150 characters.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("email is required.")
            .EmailAddress().WithMessage("email must be valid.")
            .MaximumLength(256).WithMessage("email must be at most 256 characters.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("password is required.")
            .MinimumLength(8).WithMessage("password must be at least 8 characters.")
            .Matches("[A-Z]").WithMessage("password must contain an uppercase letter.")
            .Matches("[a-z]").WithMessage("password must contain a lowercase letter.")
            .Matches("[0-9]").WithMessage("password must contain a digit.");

        RuleFor(x => x.ConfirmPassword)
            .Equal(x => x.Password).WithMessage("confirmPassword must match password.");

        RuleFor(x => x.PhoneNumber)
            .MaximumLength(20).When(x => !string.IsNullOrWhiteSpace(x.PhoneNumber))
            .WithMessage("phoneNumber must be at most 20 characters.");
    }
}
