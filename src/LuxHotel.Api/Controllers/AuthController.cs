using LuxHotel.Application.Dtos.Auth;
using LuxHotel.Application.Security.Interfaces;
using LuxHotel.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace LuxHotel.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private const string DefaultRole = "User";

    private readonly UserManager<User> _userManager;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;
    private readonly IJwtService _jwtService;

    public AuthController(
        UserManager<User> userManager,
        RoleManager<IdentityRole<Guid>> roleManager,
        IJwtService jwtService)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _jwtService = jwtService;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterRequestDto request)
    {
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser is not null)
        {
            return Conflict(new { message = "Email is already registered." });
        }

        await EnsureRoleExistsAsync(DefaultRole);

        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = request.FullName.Trim(),
            Email = request.Email.Trim(),
            UserName = request.Email.Trim(),
            PhoneNumber = string.IsNullOrWhiteSpace(request.PhoneNumber) ? null : request.PhoneNumber.Trim(),
            Role = DefaultRole
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return BadRequest(new
            {
                message = "Registration failed.",
                errors = result.Errors.Select(error => error.Description)
            });
        }

        var roleResult = await _userManager.AddToRoleAsync(user, DefaultRole);
        if (!roleResult.Succeeded)
        {
            return BadRequest(new
            {
                message = "Registration succeeded, but assigning the default role failed.",
                errors = roleResult.Errors.Select(error => error.Description)
            });
        }

        return StatusCode(StatusCodes.Status201Created, BuildAuthResponse(user));
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginRequestDto request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null || !await _userManager.CheckPasswordAsync(user, request.Password))
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        return Ok(BuildAuthResponse(user));
    }

    private async Task EnsureRoleExistsAsync(string role)
    {
        if (!await _roleManager.RoleExistsAsync(role))
        {
            await _roleManager.CreateAsync(new IdentityRole<Guid>(role));
        }
    }

    private AuthResponseDto BuildAuthResponse(User user)
    {
        var email = user.Email ?? string.Empty;

        return new AuthResponseDto
        {
            Token = _jwtService.GenerateToken(user.Id, email, GetEffectiveRole(user)),
            User = new UserProfileDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = email,
                PhoneNumber = user.PhoneNumber,
                Role = GetEffectiveRole(user)
            }
        };
    }

    private static string GetEffectiveRole(User user)
    {
        return string.IsNullOrWhiteSpace(user.Role) ? DefaultRole : user.Role;
    }
}
