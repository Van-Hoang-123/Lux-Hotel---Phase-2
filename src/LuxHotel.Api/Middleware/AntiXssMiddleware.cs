namespace LuxHotel.Api.Middleware;

public class AntiXssMiddleware
{
    private readonly RequestDelegate _next;
    private readonly string _csp;

    public AntiXssMiddleware(RequestDelegate next, IWebHostEnvironment env)
    {
        _next = next;
        _csp = env.IsDevelopment()
            ? "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; frame-ancestors 'none'"
            : "default-src 'self'; frame-ancestors 'none'";
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var headers = context.Response.Headers;
        var csp = _csp;

        context.Response.OnStarting(() =>
        {
            headers["X-Content-Type-Options"] = "nosniff";
            headers["X-Frame-Options"] = "DENY";
            headers["X-XSS-Protection"] = "1; mode=block";
            headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
            headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()";
            headers["Content-Security-Policy"] = csp;
            return Task.CompletedTask;
        });

        await _next(context);
    }
}
