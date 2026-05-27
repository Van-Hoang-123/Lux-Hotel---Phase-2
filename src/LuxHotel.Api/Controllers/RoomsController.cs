using LuxHotel.Application.Dtos;
using LuxHotel.Domain.Entities;
using LuxHotel.Domain.Interfaces;
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

        // GET /api/rooms
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var rooms = await _context.GetAllAsync();
            var result = rooms.Select(r => new RoomDto
            {
                Id = r.Id,
                RoomType = r.RoomType,
                PricePerNight = r.PricePerNight,
                ImageUrl = r.ImageUrl,
                Description = r.Description,
                IsAvailable = r.IsAvailable
            });
            return Ok(result);
        }

        // GET /api/rooms/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var room = await _context.GetByIdAsync(id);
            if (room is null)
                return NotFound(new { message = $"Room {id} not found." });

            return Ok(new RoomDto
            {
                Id = room.Id,
                RoomType = room.RoomType,
                PricePerNight = room.PricePerNight,
                ImageUrl = room.ImageUrl,
                Description = room.Description,
                IsAvailable = room.IsAvailable
            });
        }

        // POST /api/rooms
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreateRoomDto dto)
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
