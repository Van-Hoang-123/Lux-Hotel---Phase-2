using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace LuxHotel.Api.Hubs;

[Authorize]
public class BookingHub : Hub
{
}
