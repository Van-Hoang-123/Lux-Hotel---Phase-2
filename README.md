# Lux Hotel Project - Setup & Run Guide

## 1. Clone the Project

```bash
git clone https://github.com/Van-Hoang-123/Lux-Hotel---Phase-2
cd Lux-Hotel---Phase-2
```

Or download the source code as a ZIP file and extract it.

---

## 2. Requirements

Make sure the following tools are installed:

| Tool | Version | Download |
| --- | --- | --- |
| .NET SDK | 9.0 | https://dotnet.microsoft.com/download |
| SQL Server | 2019+ or LocalDB | https://www.microsoft.com/sql-server |
| Visual Studio 2022 | any | https://visualstudio.microsoft.com |
| VS Code *(alternative)* | any | https://code.visualstudio.com |

Verify .NET installation:

```bash
dotnet --version
# Expected: 9.x.x
```

---

## 3. Open the Project

Open the `.sln` file using **Visual Studio 2022**, or open the root folder in **VS Code**.

---

## 4. Install Dependencies

Open a terminal in the root directory (where the `.sln` file is located) and run:

```bash
dotnet restore
```

---

## 5. Configure the Connection String

Open `src/LuxHotel.Api/appsettings.json` and update the connection string with your SQL Server name:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=YOUR_SERVER_NAME;Database=LuxHotelDB;Trusted_Connection=True;TrustServerCertificate=True"
}
```

Example:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=DESKTOP-12345;Database=LuxHotelDB;Trusted_Connection=True;TrustServerCertificate=True"
}
```

> To find your server name, open **SQL Server Management Studio (SSMS)** — the server name is shown on the login screen.

---

## 6. Database Setup

Run the following command from the root directory:

```bash
dotnet ef database update --project src/LuxHotel.Infrastructure/ --startup-project src/LuxHotel.Api/
```

This will create the `LuxHotelDB` database and all tables automatically.

> If you see an error about no migrations found, create the initial migration first:
> ```bash
> dotnet ef migrations add InitialCreate --project src/LuxHotel.Infrastructure/ --startup-project src/LuxHotel.Api/
> dotnet ef database update --project src/LuxHotel.Infrastructure/ --startup-project src/LuxHotel.Api/
> ```

---

## 7. Run the Backend API

```bash
cd src/LuxHotel.Api
dotnet run
```

The API will be available at:

```
http://localhost:5255
https://localhost:7210
```

Swagger UI (for testing endpoints):

```
https://localhost:7210/swagger
```

---

## 8. Run the Frontend

### Option A — Live Server (recommended)

1. Open the `frontend/` folder in **VS Code**.
2. Install the **Live Server** extension if not already installed.
3. Right-click `index.html` → select **"Open with Live Server"**.
4. The site opens at `http://127.0.0.1:5500`.

### Option B — Open directly in browser

```bash
# Windows
start frontend/index.html

# macOS
open frontend/index.html
```

> **Note:** Opening via `file://` may cause CORS errors. Use Live Server to avoid this.

### Configure API URL

Open `frontend/dom.js` and make sure the base URL matches the running backend:

```js
const API_BASE = "http://localhost:5255/api";
```

---

## 9. CORS Configuration

CORS is already configured in `src/LuxHotel.Api/Program.cs` — **no changes needed**.

The project uses the `"AllowFrontend"` policy which accepts requests from any origin during development:

```csharp
// Register CORS policy (already in Program.cs)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

// Applied in the middleware pipeline (already in Program.cs)
app.UseCors("AllowFrontend"); // placed before UseAuthentication and MapControllers
```

> ⚠️ `AllowAnyOrigin()` is intentional for development. Before deploying to production, replace it with a specific origin:
> ```csharp
> policy.WithOrigins("https://your-production-domain.com")
>       .AllowAnyHeader()
>       .AllowAnyMethod();
> ```

---

## 10. API Endpoints

### Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Register a new account |
| POST | `/api/auth/login` | Login and receive JWT token |

### Rooms

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/rooms` | Get all rooms | — |
| GET | `/api/rooms/{id}` | Get room by ID | — |
| POST | `/api/rooms` | Create a new room | Admin |
| PUT | `/api/rooms/{id}` | Update room info | Admin |
| DELETE | `/api/rooms/{id}` | Delete a room | Admin |

### Bookings

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| POST | `/api/bookings/check-availability` | Check room availability | — |
| POST | `/api/bookings` | Create a booking | User |
| GET | `/api/bookings/my` | View booking history | User |

### Articles

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/articles` | Get all articles |
| GET | `/api/articles/{id}` | Get article by ID |

---

## 11. Example Request Bodies

### Check Availability

```http
POST /api/bookings/check-availability
Content-Type: application/json
```

```json
{
  "arrivalDate": "2026-06-01",
  "departureDate": "2026-06-05",
  "adults": 2,
  "children": 1
}
```

### Login

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "email": "example@gmail.com",
  "password": "yourpassword"
}
```

---

### Get All Rooms

```http
GET /api/rooms
```

**Response `200 OK`:**

```json
[
  {
    "id": 1,
    "title": "Standard Room",
    "imageUrl": "/images/room-standard.jpg",
    "pricePerNight": 60.00,
    "description": "Warm textures, soft linens, and a private corner for slower mornings."
  },
  {
    "id": 2,
    "title": "Beach Villa",
    "imageUrl": "/images/room-beach-villa.jpg",
    "pricePerNight": 90.00,
    "description": "Steps from the shore with open-air lounging and quiet ocean light."
  }
]
```

---

### Get Room By ID

```http
GET /api/rooms/{id}
```

**Response `200 OK`:**

```json
{
  "id": 1,
  "title": "Standard Room",
  "imageUrl": "/images/room-standard.jpg",
  "pricePerNight": 60.00,
  "description": "Warm textures, soft linens, and a private corner for slower mornings."
}
```

**Response `404 Not Found`:**

```json
{
  "message": "Room with Id = 1 not found."
}
```

---

### Create Room *(Admin only)*

```http
POST /api/rooms
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "title": "Luxury Suite",
  "imageUrl": "/images/room-luxury-suite.jpg",
  "pricePerNight": 160.00,
  "description": "The signature stay: generous space, bay views, and personal service."
}
```

**Response `201 Created`:**

```json
{
  "id": 5,
  "title": "Luxury Suite",
  "imageUrl": "/images/room-luxury-suite.jpg",
  "pricePerNight": 160.00,
  "description": "The signature stay: generous space, bay views, and personal service."
}
```

---

### Update Room *(Admin only)*

```http
PUT /api/rooms/{id}
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "title": "Luxury Suite",
  "imageUrl": "/images/room-luxury-suite-v2.jpg",
  "pricePerNight": 175.00,
  "description": "Updated description with new amenities."
}
```

**Response `200 OK`:**

```json
{
  "id": 5,
  "title": "Luxury Suite",
  "imageUrl": "/images/room-luxury-suite-v2.jpg",
  "pricePerNight": 175.00,
  "description": "Updated description with new amenities."
}
```

---

### Delete Room *(Admin only)*

```http
DELETE /api/rooms/{id}
Authorization: Bearer <token>
```

**Response `204 No Content`**

---

## 12. Technologies Used

**Backend:** .NET 9, ASP.NET Core Web API, Entity Framework Core, SQL Server, JWT Authentication, Clean Architecture

**Frontend:** HTML5, CSS3, JavaScript, Bootstrap 5.2.3, Font Awesome 4.7, Google Fonts

---

## 13. Project Structure

```text
Lux-Hotel---Phase-2/
├── .github/                         # GitHub Actions workflows
├── docs/                            # Project documentation
├── Lux Hotel 1/                     # Frontend — static site
│   ├── Images/                      # Room and UI images
│   ├── incentives/                  # Incentives section assets
│   ├── dom.js                       # JavaScript — fetch API and render
│   ├── index.html                   # Main page
│   ├── index copy.html              # Backup / draft page
│   ├── style.css                    # Global styles
│   ├── Desktop UI.png               # UI reference — desktop
│   ├── Desktop - Menu.jpg           # UI reference — menu
│   ├── Mobile UI.png                # UI reference — mobile
│   ├── Mobile - Menu.jpg            # UI reference — mobile menu
│   └── Read me.docx                 # Original notes
├── src/                             # Backend — Clean Architecture
│   ├── LuxHotel.Api/                # Web API entry point
│   │   ├── Controllers/
│   │   ├── Middleware/
│   │   ├── Properties/
│   │   │   └── launchSettings.json  # Ports: 5255 / 7210
│   │   ├── appsettings.json
│   │   ├── appsettings.Development.json
│   │   └── Program.cs
│   ├── LuxHotel.Application/        # Business logic, DTOs, Validators
│   ├── LuxHotel.Domain/             # Entities, Interfaces
│   └── LuxHotel.Infrastructure/     # EF Core, DbContext, Migrations
├── tests/                           # Unit and integration tests
├── .gitignore
├── AGENTS.md
├── ERD.jpg                          # Entity Relationship Diagram
├── LuxHotel.sln                     # Solution file
├── README.md
└── server.py                        # Dev utility script
```

---

## 14. Team Workflow — Syncing the Database

When a team member creates a new Migration and pushes it to Git, all other members only need to follow these 3 steps:

**Step 1 — Pull the latest code:**

```bash
git pull origin <shared-branch-name>
```

**Step 2 — Verify connection string** in `src/LuxHotel.Api/appsettings.Development.json` points to your local SQL Server.

**Step 3 — Update your local database:**

```bash
dotnet ef database update --project src/LuxHotel.Infrastructure/ --startup-project src/LuxHotel.Api/
```

EF Core will automatically create the database if it does not exist, or upgrade the table structure if an older version is present — no manual `.sql` export/import needed.

> ⚠️ The member who creates the Migration must commit the entire `Migrations/` folder to Git:
> ```bash
> git add src/LuxHotel.Infrastructure/Migrations/
> git commit -m "Add migration: <migration-name>"
> git push origin <branch-name>
> ```

---

## 15. Troubleshooting

| Problem | Cause | Fix |
| --- | --- | --- |
| `dotnet ef` not found | EF tools not installed | Run `dotnet tool install --global dotnet-ef` |
| Database connection error | Wrong server name | Double-check `DefaultConnection` in `appsettings.json` |
| CORS error in browser | CORS not configured | Follow step 9 above |
| Images not loading | Wrong path casing | Keep folder name as `Images/` (capital I) |
| Swagger not opening | App not running | Make sure `dotnet run` completed without errors |