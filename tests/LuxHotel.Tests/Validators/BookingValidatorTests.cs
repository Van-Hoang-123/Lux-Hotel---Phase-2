using System.Text.Json;
using LuxHotel.Application.Dtos;

namespace LuxHotel.Tests.Validators;

public class BookingValidatorTests
{
    [Fact]
    public void Booking_request_reads_backend_date_format()
    {
        var dto = JsonSerializer.Deserialize<BookingRequestDto>(
            """
            {
              "roomId": 1,
              "arrivalDate": "03-06-2026",
              "departureDate": "05-06-2026",
              "adult": 2,
              "children": 1
            }
            """,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.NotNull(dto);
        Assert.Equal(new DateTime(2026, 6, 3), dto.ArrivalDate);
        Assert.Equal(new DateTime(2026, 6, 5), dto.DepartureDate);
        Assert.Equal(2, dto.Adult);
        Assert.Equal(1, dto.Children);
    }

    [Fact]
    public void Booking_request_writes_backend_date_format()
    {
        var dto = new BookingRequestDto
        {
            RoomId = 1,
            ArrivalDate = new DateTime(2026, 6, 3),
            DepartureDate = new DateTime(2026, 6, 5),
            Adult = 2,
            Children = 1
        };

        var json = JsonSerializer.Serialize(dto, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

        Assert.Contains("\"arrivalDate\":\"03-06-2026\"", json);
        Assert.Contains("\"departureDate\":\"05-06-2026\"", json);
    }
}
