using LuxHotel.Domain.Entities;
using LuxHotel.Domain.Enums;
namespace LuxHotel.Domain.Interfaces;

public interface IRoomRepository
{
    Task<IEnumerable<Room>> GetAllAsync(
       RoomSortBy sortBy = RoomSortBy.Id,
       SortOrder order = SortOrder.Asc);
    Task<Room?> GetByIdAsync(int id);
    Task<Room> CreateAsync(Room room);
    Task<Room?> UpdateAsync(int id, Room room);
    Task<bool> DeleteAsync(int id);
}