using LuxHotel.Application.Dtos;
using LuxHotel.Domain.Entities;
using LuxHotel.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
        public async Task<IActionResult> GetAllAvailableRooms(CheckAvailableRooomsDTO request) // Thêm async Task<>
        {
            if (!request.DepartureDate.HasValue || !request.ArrivalDate.HasValue)
                return BadRequest(new { message = "The Departure Date And The Arrival Date Is Required" });

            if (request.DepartureDate <= request.ArrivalDate)
                return BadRequest(new { message = "The Departure Date Must Be After The Arrival Date" });

            if (request.Adult < 1)
                return BadRequest(new { message = "The Number Of Adults Must Be More Than Or Equal To 1" });
            
            if(request.Children < 0)
            {
                return BadRequest(new { message = "The Number of Chilren Must Be More Than 0" });
            }

            var arrival = request.ArrivalDate.Value;
            var departure = request.DepartureDate.Value;
            var requiredDoubleCapacity = (request.Adult * 2) + request.Children;

            // Đổi sang ToListAsync()
            var availableRoomsList = await _context.Rooms
    .Where(room => room.IsAvailable
                   && (room.Capacity * 2) >= requiredDoubleCapacity
                   && !_context.Bookings.Any(booking =>
                        booking.RoomId == room.Id
                        && booking.BookingStatus != "Cancelled" // 
                        && booking.BookingStatus != "CheckedOut" //
                        && arrival < booking.DepartureDate
                        && departure > booking.ArrivalDate))
    .ToListAsync();

            return Ok(availableRoomsList);
        }

        [Authorize(Roles = "User")]
        [HttpPost("/api/bookings")]
        public async Task<IActionResult> BookRoom(BookingRequestDto request) // Thêm async Task<>
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr))
                return Unauthorized(new { message = "Invalid Token" });

            if (!request.DepartureDate.HasValue || !request.ArrivalDate.HasValue)
                return BadRequest(new { message = "The Departure Date and Arrival Date are required." });

            if (request.DepartureDate <= request.ArrivalDate)
                return BadRequest(new { message = "The Departure Date must be after the Arrival Date." });

            if (request.Adult < 1)
                return BadRequest(new { message = "The number of adults must be at least 1." });

            if (request.Children < 0)
            {
                return BadRequest(new { message = "The Number of Chilren Must Be More Than 0" });
            }

            // Đổi sang FirstOrDefaultAsync
            var room = await _context.Rooms.FirstOrDefaultAsync(x => x.Id == request.RoomId);
            if (room == null || !room.IsAvailable)
                return NotFound(new { message = "Room not found or currently under maintenance." });

            var requiredDoubleCapacity = (request.Adult * 2) + request.Children;
            if ((room.Capacity * 2) < requiredDoubleCapacity)
                return BadRequest(new { message = "This room does not have enough capacity for the requested number of guests." });

            var arrival = request.ArrivalDate.Value;
            var departure = request.DepartureDate.Value;

            // Đổi sang AnyAsync
            bool isRoomBooked = await _context.Bookings.AnyAsync(booking =>
             booking.RoomId == room.Id &&
             booking.BookingStatus != "Cancelled" && //
             booking.BookingStatus != "CheckedOut" && // 
             arrival < booking.DepartureDate &&
             departure > booking.ArrivalDate);

            if (isRoomBooked)
                return BadRequest(new { message = "This room is already booked for the selected dates." });

            // BẮT ĐẦU TRANSACTION BẢO VỆ DỮ LIỆU


            using var transaction = await _context.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);
            try
            {
                var totalNights = (departure - arrival).Days;
                var newBooking = new Booking
                {
                    UserId = Guid.Parse(userIdStr),
                    RoomId = room.Id,
                    ArrivalDate = arrival,
                    DepartureDate = departure,
                    Adult = request.Adult,
                    Children = request.Children,
                    TotalPrice = totalNights * room.PricePerNight,
                    BookingStatus = "Confirmed",
                    CreatedAt = DateTime.UtcNow
                };

                _context.Bookings.Add(newBooking);
                await _context.SaveChangesAsync();



                var newPayment = new Payment
                {
                    BookingId = newBooking.Id,
                    Amount = newBooking.TotalPrice,
                    PaymentMethod = "Cash",
                    PaymentStatus = "Pending",
                    TransactionId = $"{newBooking.Id}_{DateTime.UtcNow:yyyyMMddHHmmss}",
                    PaidAt = null,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Payments.Add(newPayment);
                await _context.SaveChangesAsync();

                // Lưu thành công cả 2 bảng mới Commit
                await transaction.CommitAsync();

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
            catch (Exception)
            {
                // Lỗi giữa chừng thì quay ngược lại, không lưu gì cả
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "An error occurred while booking. Please try again." });
            }
        }

        [Authorize(Roles = "User")]
        [HttpGet("/api/bookings/my")]
        public async Task<IActionResult> GetAllMyBookings() // Thêm async Task<>
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // Xử lý chống crash nếu Token không hợp lệ
            if (!Guid.TryParse(userIdStr, out var userId))
            {
                return Unauthorized(new { message = "Invalid User ID in token." });
            }

            // Tối ưu query, chỉ cần check Any() thay vì lấy toàn bộ object
            if (!await _context.User.AnyAsync(u => u.Id == userId))
            {
                return NotFound(new { message = "User Not Found" });
            }

            // Đổi sang ToListAsync
            var myBookings = await _context.Bookings
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
                .ToListAsync();

            return Ok(myBookings);
        }

        [Authorize(Roles = "Admin")]
        [HttpPatch("/api/toggle-room-status/{id}")]
        public async Task<IActionResult> ToggleRoomAvailableStatus(int id)
        {
            var room = await _context.Rooms.FirstOrDefaultAsync(x => x.Id == id);
            if (room == null)
            {
                return NotFound(new { message = "Room Not Found" });
            }

            // Lấy thời gian hiện tại để so sánh
            var now = DateTime.UtcNow;

            // Kiểm tra xem phòng có ĐANG CÓ KHÁCH Ở THỰC TẾ ngay lúc này không
            bool isRoomCurrentlyOccupied = await _context.Bookings.AnyAsync(booking =>
                booking.RoomId == room.Id &&
                booking.BookingStatus != "Cancelled" &&
                booking.BookingStatus != "CheckedOut" &&
                now >= booking.ArrivalDate &&            // Khách đã hoặc đang đến
                now < booking.DepartureDate);            // Và chưa đến giờ rời đi

            bool hasFutureBookings = await _context.Bookings.AnyAsync(booking =>
            booking.RoomId == room.Id &&
            booking.BookingStatus == "Confirmed" &&
            booking.ArrivalDate >= now);

            // Nếu đang có khách ở trong phòng mà Admin đòi khóa phòng thì mới chặn
            if ((isRoomCurrentlyOccupied || hasFutureBookings) && room.IsAvailable)
            {
                return BadRequest(new
                {
                    message = "Cannot disable this room because a guest is currently occupying it right now."
                });
            }

            // Toggle trạng thái hoạt động (Bảo trì <-> Sẵn sàng)
            room.IsAvailable = !room.IsAvailable;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [Authorize(Roles = "User")]
        [HttpPatch("/api/bookings/{id}/cancel")]
        public async Task<IActionResult> CancelBooking(Guid id)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // Kiểm tra token
            if (!Guid.TryParse(userIdStr, out var userId))
            {
                return Unauthorized(new { message = "Invalid User ID in token." });
            }

            // Tìm đơn phòng
            var booking = await _context.Bookings.FirstOrDefaultAsync(b => b.Id == id);
            if (booking == null)
            {
                return NotFound(new { message = "Booking not found." });
            }

            // Bảo mật: Ngăn chặn User này dùng ID của Booking người khác để hủy trộm
            if (booking.UserId != userId)
            {
                return Forbid(); // Trả về 403 Forbidden
            }

            // Chặn hủy nếu đơn đã ở trạng thái kết thúc
            if (booking.BookingStatus == "Cancelled" || booking.BookingStatus == "CheckedOut")
            {
                return BadRequest(new { message = $"Cannot cancel a booking that is already {booking.BookingStatus}." });
            }

            // Chặn hủy nếu đã đến hoặc vượt quá ngày nhận phòng (ArrivalDate)
            if (DateTime.Now >= booking.ArrivalDate)
            {
                return BadRequest(new { message = "Cannot cancel the booking on or after the arrival date." });
            }

            // Cập nhật trạng thái
            booking.BookingStatus = "Cancelled";
            await _context.SaveChangesAsync();

            return Ok(new { message = "Booking has been cancelled successfully." });
        }

        [Authorize(Roles = "Admin")]
        [HttpPatch("/api/bookings/{id}/checkout")]
        public async Task<IActionResult> CheckoutBooking(Guid id)
        {
            // Tìm hóa đơn của booking này
            var payment = await _context.Payments.FirstOrDefaultAsync(p => p.BookingId == id);
            if (payment == null || payment.PaymentStatus != "Completed")
            {
                return BadRequest(new { message = "Cannot checkout. This booking has not been fully paid yet." });
            }


            var booking = await _context.Bookings.FirstOrDefaultAsync(b => b.Id == id);
            if (booking == null)
            {
                return NotFound(new { message = "Booking not found." });
            }

            // Nếu đơn đã hủy hoặc đã checkout rồi thì báo lỗi
            if (booking.BookingStatus == "Cancelled" || booking.BookingStatus == "CheckedOut")
            {
                return BadRequest(new { message = $"Cannot checkout. This booking is already {booking.BookingStatus}." });
            }

            // Nếu trạng thái đang là Confirmed thì tiến hành Checkout
            if (booking.BookingStatus != "Confirmed")
            {
                return BadRequest(new { message = "Only 'Confirmed' bookings can be checked out." });
            }

            booking.BookingStatus = "CheckedOut";


            await _context.SaveChangesAsync();

            return Ok(new { message = "Guest has successfully checked out. The room is now available." });
        }

        [Authorize(Roles = "Admin")]
        [HttpPatch("/api/bookings/{id}/complete-payment")]
        public async Task<IActionResult> CompletePayment(Guid id)
        {
            //  Tìm thông tin thanh toán của đơn đặt phòng này
            var payment = await _context.Payments.FirstOrDefaultAsync(p => p.BookingId == id);
            if (payment == null)
            {
                return NotFound(new { message = "Payment record for this booking not found." });
            }

            //  Nếu đã thanh toán thành công trước đó rồi thì chặn xử lý lại (Idempotency)
            if (payment.PaymentStatus == "Completed")
            {
                return BadRequest(new { message = "This payment has already been completed." });
            }

            //  Cập nhật trạng thái và lưu mốc thời gian thanh toán thực tế bằng UTC
            payment.PaymentStatus = "Completed";
            payment.PaidAt = DateTime.UtcNow;


            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Payment has been completed successfully.",
                bookingId = payment.BookingId,
                paymentStatus = payment.PaymentStatus,
                paidAt = payment.PaidAt
            });
        }
    }
}