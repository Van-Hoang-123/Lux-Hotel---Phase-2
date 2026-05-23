namespace LuxHotel.Application.Security.Interfaces;

public interface IJwtService
{
    string GenerateToken(Guid userId, string email, string role);
}
