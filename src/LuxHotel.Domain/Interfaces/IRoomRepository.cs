using LuxHotel.Domain.Entities;

namespace LuxHotel.Domain.Interfaces;

public interface IRoomRepository
{
    Task<IReadOnlyList<Room>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<Room?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
}
