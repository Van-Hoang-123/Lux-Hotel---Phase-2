namespace LuxHotel.Application.Dtos;

public class BookingRequestDto
{
    public DateTime ArrivalDate { get; set; }
    public DateTime DepartureDate { get; set; }
    public string Adult { get; set; } = string.Empty;
    public string Children { get; set; } = string.Empty;
}
