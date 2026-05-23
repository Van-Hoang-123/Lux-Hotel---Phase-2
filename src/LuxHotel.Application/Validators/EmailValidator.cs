using FluentValidation;
using LuxHotel.Application.Dtos;

namespace LuxHotel.Application.Validators;

public class EmailValidator : AbstractValidator<EmailSubscriptionDto>
{
    public EmailValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("email is required.")
            .EmailAddress().WithMessage("email must be a valid email address.")
            .MaximumLength(254).WithMessage("email must be at most 254 characters.");
    }
}
