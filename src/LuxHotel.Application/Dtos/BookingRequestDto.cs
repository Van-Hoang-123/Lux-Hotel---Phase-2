using LuxHotel.Application.Converters;
using System.Text.Json.Serialization;

namespace LuxHotel.Application.Dtos;

public class BookingRequestDto
{
    public int RoomId { get; set; }
    [JsonConverter(typeof(CustomDateTimeFullConverter))]
    public DateTime? ArrivalDate { get; set; }
    [JsonConverter(typeof(CustomDateTimeFullConverter))]
    public DateTime? DepartureDate { get; set; }
    public int Adult { get; set; }
    public int Children { get; set; }
}
