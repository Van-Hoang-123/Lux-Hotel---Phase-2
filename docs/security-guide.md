# Security & Authentication — Maintenance Guide

> Owner: Member 3 (Quân)
> Branch: `feature/jwt-security`
> Last updated: 2026-06-02

---

## 1. JWT Configuration

Settings live in `appsettings.json` under the `JwtSettings` key. Never hardcode these in source.

```json
"JwtSettings": {
  "SecretKey": "<minimum 32 characters>",
  "Issuer": "LuxHotelApi",
  "Audience": "LuxHotelClient",
  "ExpiresInMinutes": 60
}
```

**Rules:**
- `SecretKey` must be **≥ 32 characters** (HS256 requires a 256-bit key). The app will throw at startup if this is violated.
- In production, supply `SecretKey` via environment variable or secrets manager — never commit a real key to git.
- `ExpiresInMinutes` controls token lifetime. Clock skew tolerance is set to 30 seconds (`Program.cs:64`).

---

## 2. Protecting an Endpoint

### Require any authenticated user
```csharp
[Authorize]
public async Task<IActionResult> MyEndpoint() { ... }
```

### Require Admin role only
```csharp
[Authorize(Roles = "Admin")]
public async Task<IActionResult> AdminOnly() { ... }
```

### Require User role only
```csharp
[Authorize(Roles = "User")]
public async Task<IActionResult> UserOnly() { ... }
```

Named policies (`"AdminOnly"`, `"UserOnly"`) are also registered in `Program.cs:67-71` and can be used with `[Authorize(Policy = "AdminOnly")]` interchangeably.

**Important:** `UseAuthentication()` must come before `UseAuthorization()` in the middleware pipeline (`Program.cs:145-146`). Do not reorder.

---

## 3. Generating a Token

`IJwtService` is registered as a singleton. Inject it wherever a token needs to be issued (typically the auth controller after password verification).

```csharp
// Inject
private readonly IJwtService _jwtService;

// Issue token — pass primitives, not the User object
string token = _jwtService.GenerateToken(user.Id, user.Email, user.Role);
```

The method signature is `GenerateToken(Guid userId, string email, string role)`. It returns a signed JWT string ready to send to the client.

Token claims included:
| Claim | Value |
|---|---|
| `sub` | userId (Guid) |
| `email` | user email |
| `NameIdentifier` | userId (Guid) — for `User.FindFirstValue` compatibility |
| `Role` | "Admin" or "User" |
| `jti` | unique token ID (new Guid per token) |

---

## 4. Adding a Validator

Validators use **FluentValidation** and are auto-discovered from the `LuxHotel.Application` assembly.

### Step 1 — Create the validator
```csharp
// LuxHotel.Application/Validators/MyRequestValidator.cs
using FluentValidation;
using LuxHotel.Application.Dtos;

namespace LuxHotel.Application.Validators;

public class MyRequestValidator : AbstractValidator<MyRequestDto>
{
    public MyRequestValidator()
    {
        RuleFor(x => x.SomeField)
            .NotEmpty().WithMessage("someField is required.")
            .MaximumLength(100).WithMessage("someField must be at most 100 characters.");
    }
}
```

### Step 2 — Nothing else needed
`AddValidatorsFromAssemblyContaining<RoomValidator>()` in `Program.cs:74` scans the entire Application assembly. Any new `AbstractValidator<T>` class is picked up automatically.

### Step 3 — Validation is automatic
`AddFluentValidationAutoValidation()` (`Program.cs:75`) intercepts model binding. If validation fails, the framework returns `400 Bad Request` with field-level errors before the action runs. No `ModelState.IsValid` check needed in controllers.

**Active validators:**
- `EmailValidator` → `EmailSubscriptionDto` — not-empty, RFC 5321 format, max 254 chars
- `RoomValidator` → room create/update requests

---

## 5. Security Headers

`AntiXssMiddleware` (`LuxHotel.Api/Middleware/AntiXssMiddleware.cs`) adds the following headers to every response:

| Header | Value | Purpose |
|---|---|---|
| `X-Content-Type-Options` | `nosniff` | Prevents MIME-type sniffing |
| `X-Frame-Options` | `DENY` | Blocks clickjacking via iframes |
| `X-XSS-Protection` | `1; mode=block` | Legacy browser XSS filter |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limits referrer header leakage |
| `Permissions-Policy` | `geolocation=(), microphone=(), camera=()` | Disables sensitive browser APIs |
| `Content-Security-Policy` | environment-aware (see below) | Restricts resource loading |

**CSP by environment:**
- **Development:** allows `unsafe-inline` for scripts and styles (needed for browser devtools / hot reload)
- **Production:** `default-src 'self'; frame-ancestors 'none'` — strict, no inline execution

The middleware is registered first in the pipeline (`Program.cs:132`) so headers apply before any other middleware can write a response.

---

## 6. CSRF Protection

Antiforgery is configured in `Program.cs:79-86`:
- Cookie name: `XSRF-TOKEN` (readable by JavaScript — `HttpOnly = false` is intentional)
- Header name: `X-XSRF-TOKEN` (must be echoed by the client in mutating requests)
- `SameSite = Strict` — cookie is not sent on cross-origin requests

This follows the **Double Submit Cookie** pattern: the server compares the cookie value against the header value. A cross-origin attacker cannot read the cookie, so they cannot forge the header.

---

## 7. SQL Injection

No action needed. The project uses **EF Core LINQ queries exclusively** — no raw SQL string concatenation anywhere. EF Core parameterizes all queries automatically.

**Policy:** never use `FromSqlRaw()` with user-supplied input. If raw SQL is needed for performance, use `FromSqlRaw()` with `SqlParameter` objects only — never string interpolation.

---

## 8. Testing with Swagger

1. Start the API (`dotnet run` from `src/LuxHotel.Api`)
2. Open `/swagger`
3. Call `POST /api/auth/login` with valid credentials → copy the `token` value from the response
4. Click **Authorize** (top right) → paste the token only (Swagger adds `Bearer ` prefix automatically)
5. All subsequent requests include the Authorization header

---

## 9. Roles Reference

| Role | Assigned at | Access |
|---|---|---|
| `Admin` | Registration with admin flag or seeded | Room CRUD, all booking management |
| `User` | Default on registration | Own bookings only |

Role is stored on the `User` entity and embedded in the JWT at login. No role change takes effect until the user logs in again and receives a new token.
