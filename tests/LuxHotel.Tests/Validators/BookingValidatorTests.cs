using LuxHotel.Application.Dtos;
using LuxHotel.Application.Validators;

namespace LuxHotel.Tests.Validators;

public class BookingValidatorTests
{
    private readonly BookingValidator _sut = new();

    private static BookingRequestDto ValidDto() => new()
    {
        ArrivalDate = DateTime.UtcNow.Date.AddDays(1),
        DepartureDate = DateTime.UtcNow.Date.AddDays(3),
        Adult = "2",
        Children = "0"
    };

    [Fact]
    public void Valid_payload_passes()
    {
        var result = _sut.Validate(ValidDto());
        Assert.True(result.IsValid);
    }

    [Fact]
    public void Past_arrival_date_fails()
    {
        var dto = ValidDto();
        dto.ArrivalDate = DateTime.UtcNow.Date.AddDays(-1);
        var result = _sut.Validate(dto);
        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(dto.ArrivalDate));
    }

    [Fact]
    public void Departure_equal_to_arrival_fails()
    {
        var dto = ValidDto();
        dto.DepartureDate = dto.ArrivalDate;
        var result = _sut.Validate(dto);
        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(dto.DepartureDate));
    }

    [Fact]
    public void Departure_before_arrival_fails()
    {
        var dto = ValidDto();
        dto.DepartureDate = dto.ArrivalDate.AddDays(-1);
        var result = _sut.Validate(dto);
        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(dto.DepartureDate));
    }

    [Theory]
    [InlineData("")]
    [InlineData("0")]
    [InlineData("11")]
    [InlineData("abc")]
    [InlineData("-1")]
    public void Invalid_adult_values_fail(string adult)
    {
        var dto = ValidDto();
        dto.Adult = adult;
        var result = _sut.Validate(dto);
        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(dto.Adult));
    }

    [Theory]
    [InlineData("1")]
    [InlineData("4")]
    [InlineData("10")]
    public void Adult_in_range_passes(string adult)
    {
        var dto = ValidDto();
        dto.Adult = adult;
        var result = _sut.Validate(dto);
        Assert.True(result.IsValid);
    }

    [Theory]
    [InlineData("")]
    [InlineData("11")]
    [InlineData("abc")]
    [InlineData("-1")]
    public void Invalid_children_values_fail(string children)
    {
        var dto = ValidDto();
        dto.Children = children;
        var result = _sut.Validate(dto);
        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(dto.Children));
    }

    [Theory]
    [InlineData("0")]
    [InlineData("3")]
    [InlineData("10")]
    public void Children_in_range_passes(string children)
    {
        var dto = ValidDto();
        dto.Children = children;
        var result = _sut.Validate(dto);
        Assert.True(result.IsValid);
    }
}
