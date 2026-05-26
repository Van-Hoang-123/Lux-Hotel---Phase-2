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

> To find your server name, open **SQL Server Management Studio (SSMS)** — the server name appears on the login screen.

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
https://localhost:5255/swagger
```

---

## 8. Run the Frontend

### Live Server (recommended)

1. Open the `frontend/` folder in **VS Code**.
2. Install the **Live Server** extension if not already installed.
3. Right-click `index.html` → select **"Open with Live Server"**.
4. The site opens at `http://127.0.0.1:5500`.

---

## 9. API Endpoints

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

## 10. Example Request Bodies

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
  "message": "Không tìm thấy phòng nào có Id = 1."
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

## 11. Technologies Used

**Backend:** .NET 9, ASP.NET Core Web API, Entity Framework Core, SQL Server, JWT Authentication, Clean Architecture

**Frontend:** HTML5, CSS3, JavaScript, Bootstrap 5.2.3, Font Awesome 4.7, Google Fonts

---

## 12. Project Structure

```text
Lux-Hotel---Phase-2/
├── src/
│   ├── LuxHotel.Api/              # Web API entry point
│   │   ├── Controllers/
│   │   ├── Properties/
│   │   │   └── launchSettings.json
│   │   ├── appsettings.json
│   │   └── Program.cs
│   ├── LuxHotel.Application/      # Business logic, DTOs
│   ├── LuxHotel.Domain/           # Entities, Interfaces
│   └── LuxHotel.Infrastructure/   # EF Core, DbContext, Migrations
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── dom.js
│   └── Images/
└── README.md
```