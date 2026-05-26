using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using LuxHotel.Infrastructure.Persistence;

namespace LuxHotel.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoomsController : ControllerBase
    {
        private readonly LuxHotelDbContext _context;
        private readonly IWebHostEnvironment _env;
        public RoomsController(LuxHotelDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [HttpGet("{id}")] // Test Get Book By Id
        public async Task<IActionResult> GetRoomById(int id)
        {
            // Tìm phòng trong Database dựa vào Id truyền lên
            var room = await _context.Rooms.FindAsync(id);

            // Nếu không tìm thấy phòng, trả về mã trạng thái HTTP 404 Not Found
            if (room == null)
            {
                return NotFound(new { message = $"Không tìm thấy phòng nào có Id = {id}." });
            }

            // Nếu tìm thấy, trả về mã trạng thái HTTP 200 OK kèm theo dữ liệu của phòng (JSON)
            return Ok(room);
        }
    }
}
