namespace LuxHotel.Application.Dtos.Auth;

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;

    public UserProfileDto User { get; set; } = new();
}
