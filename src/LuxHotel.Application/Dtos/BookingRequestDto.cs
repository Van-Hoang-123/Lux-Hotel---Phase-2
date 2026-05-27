namespace LuxHotel.Application.Dtos;

public class BookingRequestDto
{
    public int RoomId { get; set; }
    public DateTime ArrivalDate { get; set; }
    public DateTime DepartureDate { get; set; }
    public int Adult { get; set; }
    public int Children { get; set; }
}
