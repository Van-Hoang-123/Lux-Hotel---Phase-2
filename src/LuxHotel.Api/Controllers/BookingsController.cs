
using Microsoft.AspNetCore.Mvc;
using LuxHotel.Application.Dtos;
using LuxHotel.Domain.Entities;
using LuxHotel.Infrastructure.Persistence;

using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace LuxHotel.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookingsController : ControllerBase
    {
        private readonly LuxHotelDbContext _context;

        public BookingsController(LuxHotelDbContext context)
        {
            _context = context;
        }


        [HttpPost("/api/bookings/check-availability")]
        public IActionResult getAllAvailableRooms(CheckAvailableRooomsDTO request)
        {
            //  Kiểm tra ngày trống
            if (!request.DepartureDate.HasValue || !request.ArrivalDate.HasValue)
            {
                return BadRequest(new { message = "The Departure Date And The Arrival Date Is Required" });
            }

            //  Kiểm tra ngày hợp lệ
            if (request.DepartureDate <= request.ArrivalDate)
            {
                return BadRequest(new { message = "The Departure Date Must Be After The Arrival Date" });
            }

            //  Kiểm tra số lượng người lớn
            if (request.Adult < 1)
            {
                return BadRequest(new { message = "The Number Of Adults Must Be More Than Or Equal To 1" });
            }



            var arrival = request.ArrivalDate.Value;
            var departure = request.DepartureDate.Value;

            // Vì 2 trẻ em = 1 người lớn, ta quy về phép nhân số nguyên để tránh dùng số thập phân (double) trong SQL.
            // Sức chứa thực tế cần thiết: (Số người lớn * 2) + Số trẻ em
            var requiredDoubleCapacity = (request.Adult * 2) + request.Children;

            var availableRoomsList = _context.Rooms
                .Where(room => room.IsAvailable
                               && (room.Capacity * 2) >= requiredDoubleCapacity
                               && !_context.Bookings.Any(booking =>
                                    booking.RoomId == room.Id
                                    && arrival < booking.DepartureDate
                                    && departure > booking.ArrivalDate))
                .ToList();

            return Ok(availableRoomsList);
        }



        [Authorize(Roles = "User")]
        [HttpPost("/api/bookings")]
        public IActionResult BookRoom(BookingRequestDto request)
        {

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;



            //  Validate đầu vào cơ bản (Ngày và Số người)
            if (!request.DepartureDate.HasValue || !request.ArrivalDate.HasValue)
                return BadRequest(new { message = "The Departure Date and Arrival Date are required." });

            if (request.DepartureDate <= request.ArrivalDate)
                return BadRequest(new { message = "The Departure Date must be after the Arrival Date." });

            if (request.Adult < 1)
                return BadRequest(new { message = "The number of adults must be at least 1." });

            //  Tìm phòng mà khách muốn đặt
            var room = _context.Rooms.FirstOrDefault(x => x.Id == request.RoomId);
            if (room == null || !room.IsAvailable)
                return NotFound(new { message = "Room not found or currently unavailable for booking." });

            //  Kiểm tra sức chứa của phòng đó
            var requiredDoubleCapacity = (request.Adult * 2) + request.Children;
            if ((room.Capacity * 2) < requiredDoubleCapacity)
                return BadRequest(new { message = "This room does not have enough capacity for the requested number of guests." });

            var arrival = request.ArrivalDate.Value;
            var departure = request.DepartureDate.Value;

            //  Kiểm tra TRỰC TIẾP xem phòng NÀY có bị kẹt lịch không (Chỉ tốn 1 truy vấn siêu nhỏ)
            bool isRoomBooked = _context.Bookings.Any(booking =>
                booking.RoomId == room.Id &&
                arrival < booking.DepartureDate &&
                departure > booking.ArrivalDate);

            if (isRoomBooked)
                return BadRequest(new { message = "This room is already booked for the selected dates." });



            //  Tạo Booking
            var totalNights = (departure - arrival).Days;

            var newBooking = new Booking
            {
                UserId = Guid.Parse(userId),
                RoomId = room.Id,
                ArrivalDate = arrival,
                DepartureDate = departure,
                Adult = request.Adult,
                Children = request.Children,
                TotalPrice = totalNights * room.PricePerNight,
                BookingStatus = "Confirmed",
                CreatedAt = DateTime.Now 
            };



            _context.Bookings.Add(newBooking);
            room.IsAvailable = false;
            _context.SaveChanges();

            var newPayment = new Payment
            {
                BookingId = newBooking.Id,
                Amount = newBooking.TotalPrice,
                PaymentMethod = "Cash",
                PaymentStatus = "Pending",
                TransactionId = $"{newBooking.Id}_{DateTime.UtcNow:yyyyMMddHHmmss}",
                PaidAt = arrival,
                CreatedAt = DateTime.UtcNow
            };

            _context.Payments.Add(newPayment);
            _context.SaveChanges();

            var responseDto = new BookingResponseDTO
            {
                Id = newBooking.Id,
                RoomId = newBooking.RoomId,
                ArrivalDate = newBooking.ArrivalDate,
                DepartureDate = newBooking.DepartureDate,
                Adult = newBooking.Adult,
                Children = newBooking.Children,
                TotalPrice = newBooking.TotalPrice,
                BookingStatus = newBooking.BookingStatus
            };



            return Ok(responseDto);
        }

        [Authorize(Roles = "User")]
        [HttpGet("/api/bookings/my")]
        public IActionResult getAllMyBookings()
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            if (_context.User.FirstOrDefault(u => u.Id == userId) == null)
            {
                return NotFound(new { message = "User Not Found" });
            }

            var myBookings = _context.Bookings
        .Where(x => x.UserId == userId)
        .Select(b => new BookingResponseDTO
        {
            Id = b.Id,
            RoomId = b.RoomId,
            ArrivalDate = b.ArrivalDate,
            DepartureDate = b.DepartureDate,
            Adult = b.Adult,
            Children = b.Children,
            TotalPrice = b.TotalPrice,
            BookingStatus = b.BookingStatus,
        })
        .ToList();

            return Ok(myBookings);
        }

        [HttpPatch("/toogleRoomAvailableStatus/{id}")]
        public IActionResult toogleRoomAvailableStatus(int id)
        {
            var Room = _context.Rooms.FirstOrDefault(x => x.Id == id);

            if(Room == null)
            {
                return NotFound(new { message = "Room Not Found" });
            }

            if (Room.IsAvailable)
            {
                Room.IsAvailable = false;
            }
            else
            {
                Room.IsAvailable = true;
            }

            _context.SaveChanges();
            return NoContent();
        }

    }
}
