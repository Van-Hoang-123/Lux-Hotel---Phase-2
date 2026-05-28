using FluentValidation;
using LuxHotel.Application.Dtos.Auth;

namespace LuxHotel.Application.Validators;

public class UpdateProfileRequestValidator : AbstractValidator<UpdateProfileRequestDto>
{
    public UpdateProfileRequestValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("fullName is required.")
            .MaximumLength(150).WithMessage("fullName must be at most 150 characters.");

        RuleFor(x => x.PhoneNumber)
            .MaximumLength(20).When(x => !string.IsNullOrWhiteSpace(x.PhoneNumber))
            .WithMessage("phoneNumber must be at most 20 characters.");
    }
}
