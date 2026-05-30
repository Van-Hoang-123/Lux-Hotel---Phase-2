using FluentValidation;
using LuxHotel.Application.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LuxHotel.Application.Validators
{
    public class RoomValidator : AbstractValidator<CreateRoomDto>
    {
        public RoomValidator()
        {
            RuleFor(x => x.RoomType)
                .NotEmpty().WithMessage("roomType is required.")
                .MaximumLength(100).WithMessage("roomType must not exceed 100 characters.");

            RuleFor(x => x.PricePerNight)
                .GreaterThan(0).WithMessage("pricePerNight must be greater than 0.");

            RuleFor(x => x.Capacity)
                .GreaterThan(0).WithMessage("capacity must be greater than 0.");

            RuleFor(x => x.ImageUrl)
                .NotEmpty().WithMessage("imageUrl is required.")
                .MaximumLength(255).WithMessage("imageUrl must not exceed 255 characters.");
        }
    }
}
