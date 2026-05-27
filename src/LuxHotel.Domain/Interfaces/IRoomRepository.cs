using LuxHotel.Domain.Entities;

namespace LuxHotel.Domain.Interfaces;

public interface IRoomRepository
{
    Task<IEnumerable<Room>> GetAllAsync();
    Task<Room?> GetByIdAsync(int id);
    Task<Room> CreateAsync(Room room);
    Task<Room?> UpdateAsync(int id, Room room);
    Task<bool> DeleteAsync(int id);
}