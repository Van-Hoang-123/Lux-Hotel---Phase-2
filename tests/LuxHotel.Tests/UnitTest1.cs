using LuxHotel.Api.Hubs;
using LuxHotel.Api.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Reflection;

namespace LuxHotel.Tests;

public class UnitTest1
{
    [Fact]
    public void BookingHub_requires_authorized_signalr_clients()
    {
        Assert.True(typeof(Hub).IsAssignableFrom(typeof(BookingHub)));
        Assert.NotNull(Attribute.GetCustomAttribute(typeof(BookingHub), typeof(AuthorizeAttribute)));

    }

    [Fact]
    public void CheckoutBooking_allows_users_and_admins()
    {
        var method = typeof(BookingsController).GetMethod(nameof(BookingsController.CheckoutBooking));
        var attribute = method?.GetCustomAttribute<AuthorizeAttribute>();

        Assert.NotNull(attribute);
        Assert.Equal("User,Admin", attribute?.Roles);
    }
}
