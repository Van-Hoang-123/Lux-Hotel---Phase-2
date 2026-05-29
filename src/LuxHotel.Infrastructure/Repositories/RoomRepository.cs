using LuxHotel.Application.Dtos;
using LuxHotel.Domain.Entities;
using LuxHotel.Domain.Interfaces;
using LuxHotel.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using LuxHotel.Domain.Enums;
namespace LuxHotel.Infrastructure.Repositories
{
    public class RoomRepository : IRoomRepository
    {
        private readonly LuxHotelDbContext _context;

        public RoomRepository(LuxHotelDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Room>> GetAllAsync(RoomSortBy sortBy = RoomSortBy.Id, SortOrder order = SortOrder.Asc)       
            {
            IQueryable<Room> query = _context.Rooms;
            bool desc = order == SortOrder.Desc;
            query = sortBy switch
            {
                RoomSortBy.PricePerNight => desc
                    ? query.OrderByDescending(r => r.PricePerNight)
                    : query.OrderBy(r => r.PricePerNight),

                RoomSortBy.Capacity => desc
                    ? query.OrderByDescending(r => r.Capacity)
                    : query.OrderBy(r => r.Capacity),

                RoomSortBy.RoomType => desc
                    ? query.OrderByDescending(r => r.RoomType)
                    : query.OrderBy(r => r.RoomType),

                _ => desc
                    ? query.OrderByDescending(r => r.Id)
                    : query.OrderBy(r => r.Id)
            };

            return await query.ToListAsync();
        }

        public async Task<Room?> GetByIdAsync(int id)
            => await _context.Rooms.FindAsync(id);

        public async Task<Room> CreateAsync(Room room)
        {
            _context.Rooms.Add(room);
            await _context.SaveChangesAsync();
            return room;
        }

        public async Task<Room?> UpdateAsync(int id, Room room)
        {
            var existing = await _context.Rooms.FindAsync(id);
            if (existing is null) return null;

            existing.RoomType = room.RoomType;
            existing.PricePerNight = room.PricePerNight;
            existing.ImageUrl = room.ImageUrl;
            existing.Description = room.Description;
            existing.IsAvailable = room.IsAvailable;
            existing.Capacity = room.Capacity;

            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var room = await _context.Rooms.FindAsync(id);
            if (room is null) return false;

            _context.Rooms.Remove(room);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
