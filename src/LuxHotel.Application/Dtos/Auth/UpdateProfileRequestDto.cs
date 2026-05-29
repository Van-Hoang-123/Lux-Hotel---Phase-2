namespace LuxHotel.Application.Dtos.Auth;

public class UpdateProfileRequestDto
{
    public string FullName { get; set; } = string.Empty;

    public string? PhoneNumber { get; set; }
}
