using Microsoft.AspNetCore.Mvc;

namespace LuxHotel.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookingsController : ControllerBase
    {
        [HttpPost("check-availability")]
        public IActionResult CheckAvailability([FromBody] BookingRequest request)
        {
            if (request.ArrivalDate >= request.DepartureDate)
            {
                return BadRequest(new
                {
                    message = "Departure date must be after arrival date."
                });
            }

            return Ok(new
            {
                success = true,
                message = "Booking created successfully.",
                arrivalDate = request.ArrivalDate,
                departureDate = request.DepartureDate,
                adults = request.Adults,
                children = request.Children
            });
        }
    }

    public class BookingRequest
    {
        public DateTime ArrivalDate { get; set; }

        public DateTime DepartureDate { get; set; }

        public int Adults { get; set; }

        public int Children { get; set; }
    }
}