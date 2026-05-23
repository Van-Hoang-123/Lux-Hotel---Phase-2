using FluentValidation;
using LuxHotel.Application.Dtos;

namespace LuxHotel.Application.Validators;

public class BookingValidator : AbstractValidator<BookingRequestDto>
{
    private const int MaxAdults = 10;
    private const int MaxChildren = 10;

    public BookingValidator()
    {
        RuleFor(x => x.ArrivalDate)
            .NotEmpty().WithMessage("arrivalDate is required.")
            .Must(BeTodayOrLater).WithMessage("arrivalDate must be today or later.");

        RuleFor(x => x.DepartureDate)
            .NotEmpty().WithMessage("departureDate is required.")
            .GreaterThan(x => x.ArrivalDate)
                .WithMessage("departureDate must be after arrivalDate.");

        RuleFor(x => x.Adult)
            .NotEmpty().WithMessage("adult is required.")
            .Must(s => int.TryParse(s, out var n) && n >= 1 && n <= MaxAdults)
                .WithMessage($"adult must be an integer between 1 and {MaxAdults}.");

        RuleFor(x => x.Children)
            .NotEmpty().WithMessage("children is required.")
            .Must(s => int.TryParse(s, out var n) && n >= 0 && n <= MaxChildren)
                .WithMessage($"children must be an integer between 0 and {MaxChildren}.");
    }

    private static bool BeTodayOrLater(DateTime date) => date.Date >= DateTime.UtcNow.Date;
}
