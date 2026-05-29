using System.Security.Claims;
using LuxHotel.Application.Dtos.Auth;
using LuxHotel.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace LuxHotel.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly UserManager<User> _userManager;

    public ProfileController(UserManager<User> userManager)
    {
        _userManager = userManager;
    }

    [HttpGet]
    public async Task<ActionResult<UserProfileDto>> GetProfile()
    {
        var user = await GetCurrentUserAsync();
        if (user is null)
        {
            return Unauthorized(new { message = "User is not authenticated." });
        }

        return Ok(ToProfile(user));
    }

    [HttpPut]
    public async Task<ActionResult<UserProfileDto>> UpdateProfile(UpdateProfileRequestDto request)
    {
        var user = await GetCurrentUserAsync();
        if (user is null)
        {
            return Unauthorized(new { message = "User is not authenticated." });
        }

        user.FullName = request.FullName.Trim();
        user.PhoneNumber = string.IsNullOrWhiteSpace(request.PhoneNumber) ? null : request.PhoneNumber.Trim();

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return BadRequest(new
            {
                message = "Profile update failed.",
                errors = result.Errors.Select(error => error.Description)
            });
        }

        return Ok(ToProfile(user));
    }

    private async Task<User?> GetCurrentUserAsync()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return string.IsNullOrWhiteSpace(userId)
            ? null
            : await _userManager.FindByIdAsync(userId);
    }

    private static UserProfileDto ToProfile(User user)
    {
        return new UserProfileDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email ?? string.Empty,
            PhoneNumber = user.PhoneNumber,
            Role = string.IsNullOrWhiteSpace(user.Role) ? "User" : user.Role
        };
    }
}
