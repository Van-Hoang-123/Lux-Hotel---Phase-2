using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LuxHotel.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LuxHotel.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoomsController : ControllerBase
    {
        private readonly IRoomRepository _context;
        public RoomsController(IRoomRepository context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllRooms()
        {
            var rooms = await _context.Rooms.ToListAsync();
            return Ok(rooms);
        }

        [HttpGet("{id}")] // Test Get Book By Id
        public async Task<IActionResult> GetRoomById(int id)
        {
            var room = new Room
            {
                RoomType = dto.RoomType,
                PricePerNight = dto.PricePerNight,
                ImageUrl = dto.ImageUrl,
                Description = dto.Description,
                IsAvailable = true
            };
            var created = await _context.CreateAsync(room);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        // PUT /api/rooms/1
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateRoomDto dto)
        {
            var room = new Room
            {
                RoomType = dto.RoomType,
                PricePerNight = dto.PricePerNight,
                ImageUrl = dto.ImageUrl,
                Description = dto.Description,
                IsAvailable = dto.IsAvailable
            };
            var updated = await _context.UpdateAsync(id, room);
            if (updated is null)
                return NotFound(new { message = $"Room {id} not found." });

            return Ok(updated);
        }

        // DELETE /api/rooms/1
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _context.DeleteAsync(id);
            if (!success)
                return NotFound(new { message = $"Room {id} not found." });

            return NoContent();
        }
    }
}
