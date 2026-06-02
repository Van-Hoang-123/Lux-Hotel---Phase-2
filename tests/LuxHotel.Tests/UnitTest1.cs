using LuxHotel.Api.Hubs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace LuxHotel.Tests;

public class UnitTest1
{
    [Fact]
    public void BookingHub_requires_authorized_signalr_clients()
    {
        Assert.True(typeof(Hub).IsAssignableFrom(typeof(BookingHub)));
        Assert.NotNull(Attribute.GetCustomAttribute(typeof(BookingHub), typeof(AuthorizeAttribute)));

    }
}
