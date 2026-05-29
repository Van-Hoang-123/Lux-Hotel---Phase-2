//using FluentValidation;
//using LuxHotel.Application.Dtos;

//namespace LuxHotel.Application.Validators;

//public class BookingValidator : AbstractValidator<BookingRequestDto>
//{
//    private const int MaxAdults = 10;
//    private const int MaxChildren = 10;

//    public BookingValidator()
//    {
//        RuleFor(x => x.RoomId)
//            .GreaterThan(0).WithMessage("roomId must be greater than 0.");

//        RuleFor(x => x.ArrivalDate)
//            .NotEmpty().WithMessage("arrivalDate is required.")
//            .Must(BeTodayOrLater).WithMessage("arrivalDate must be today or later.");

//        RuleFor(x => x.DepartureDate)
//            .NotEmpty().WithMessage("departureDate is required.")
//            .GreaterThan(x => x.ArrivalDate)
//                .WithMessage("departureDate must be after arrivalDate.");

//        RuleFor(x => x.Adult)
//            .InclusiveBetween(1, MaxAdults)
//                .WithMessage($"adult must be between 1 and {MaxAdults}.");

//        RuleFor(x => x.Children)
//            .InclusiveBetween(0, MaxChildren)
//                .WithMessage($"children must be between 0 and {MaxChildren}.");
//    }

//    private static bool BeTodayOrLater(DateTime date) => date.Date >= DateTime.UtcNow.Date;
//}
