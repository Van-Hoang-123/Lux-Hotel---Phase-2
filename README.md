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

1. Open the `Lux Hotel 1/` folder in **VS Code**.
2. Install the **Live Server** extension if not already installed.
3. Right-click `index.html` → select **"Open with Live Server"**.
4. The site opens at `http://127.0.0.1:5500`.

---

## 9. API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Register a new account | — |
| POST | `/api/auth/login` | Login and receive JWT token | — |

> All newly registered accounts are automatically assigned the `User` role by default.

### Profile

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/profile` | Get current user's profile | User / Admin |
| PUT | `/api/profile` | Update current user's profile | User / Admin |

### Rooms

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/rooms` | Get all rooms (supports sorting) | — |
| GET | `/api/rooms?sortBy={field}&order={asc\|desc}` | Get rooms sorted by field | — |
| GET | `/api/rooms/{id}` | Get room by ID | — |
| POST | `/api/rooms` | Create a new room | Admin |
| PUT | `/api/rooms/{id}` | Update room info | Admin |
| DELETE | `/api/rooms/{id}` | Delete a room | Admin |

### Bookings

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| POST | `/api/bookings/check-availability` | Check room availability | — |
| POST | `/api/bookings` | Create a new booking | User |
| GET | `/api/bookings/my` | View personal booking history | User |
| PATCH | `/api/bookings/{id}/cancel` | Cancel a booking | User |
| PATCH | `/api/bookings/{id}/checkout` | Check out a booking | Admin |
| PATCH | `/api/bookings/{id}/complete-payment` | Confirm payment completion | Admin |
| PATCH | `/api/toggle-room-status/{id}` | Toggle room availability status | Admin |

### Articles

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/articles/getAll` | Get all articles | — |
| GET | `/api/articles/getById/{id}` | Get article by ID | — |
| GET | `/api/articles/pagination` | Get articles with pagination (`?pageNumber=1&pageSize=10`) | — |
| GET | `/api/articles/getByTitle/{title}` | Get articles by title (partial match) | — |
| GET | `/api/articles/getByCategory/{category}` | Get articles by category | — |
| POST | `/api/articles` | Create a new article | Admin |
| PUT | `/api/articles/edit/{id}` | Edit an article by ID | Admin |
| DELETE | `/api/articles/delete/{id}` | Hard delete an article by ID | Admin |

---

## 10. Example Request Bodies

### Register

```http
POST /api/auth/register
Content-Type: application/json
```

```json
{
  "fullName": "Nguyen Van A",
  "email": "example@gmail.com",
  "password": "yourpassword",
  "phoneNumber": "0901234567"
}
```

> `phoneNumber` is optional.

**Response `201 Created`:**

```json
{
  "token": "<jwt_token>",
  "user": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "fullName": "Nguyen Van A",
    "email": "example@gmail.com",
    "phoneNumber": "0901234567",
    "role": "User"
  }
}
```

**Response `409 Conflict`:**

```json
{
  "message": "Email is already registered."
}
```

**Response `400 Bad Request`:**

```json
{
  "message": "Registration failed.",
  "errors": ["Passwords must be at least 6 characters."]
}
```

---

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

**Response `200 OK`:**

```json
{
  "token": "<jwt_token>",
  "user": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "fullName": "Nguyen Van A",
    "email": "example@gmail.com",
    "phoneNumber": "0901234567",
    "role": "User"
  }
}
```

**Response `401 Unauthorized`:**

```json
{
  "message": "Invalid email or password."
}
```

---

### Get Profile

```http
GET /api/profile
Authorization: Bearer <token>
```

**Response `200 OK`:**

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "fullName": "Nguyen Van A",
  "email": "example@gmail.com",
  "phoneNumber": "0901234567",
  "role": "User"
}
```

**Response `401 Unauthorized`:**

```json
{
  "message": "User is not authenticated."
}
```

---

### Update Profile

```http
PUT /api/profile
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "fullName": "Nguyen Van B",
  "phoneNumber": "0987654321"
}
```

> `phoneNumber` is optional — omit or send empty string to clear it.

**Response `200 OK`:**

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "fullName": "Nguyen Van B",
  "email": "example@gmail.com",
  "phoneNumber": "0987654321",
  "role": "User"
}
```

**Response `400 Bad Request`:**

```json
{
  "message": "Profile update failed.",
  "errors": ["..."]
}
```

**Response `401 Unauthorized`:**

```json
{
  "message": "User is not authenticated."
}
```

---

### Get All Rooms

```http
GET /api/rooms
```

Supports optional sorting via query parameters:

| Query Param | Description | Example |
| --- | --- | --- |
| `sortBy` | Field to sort by (`pricePerNight`, `capacity`, etc.) | `sortBy=pricePerNight` |
| `order` | Sort direction: `asc` or `desc` | `order=desc` |

Example with sorting:

```http
GET /api/rooms?sortBy=pricePerNight&order=desc
```

**Response `200 OK`:**

```json
[
  {
    "id": 1,
    "roomType": "Standard Room",
    "imageUrl": "/images/room-standard.jpg",
    "pricePerNight": 60.00,
    "description": "Warm textures, soft linens, and a private corner for slower mornings.",
    "isAvailable": true,
    "capacity": 2
  },
  {
    "id": 2,
    "roomType": "Beach Villa",
    "imageUrl": "/images/room-beach-villa.jpg",
    "pricePerNight": 90.00,
    "description": "Steps from the shore with open-air lounging and quiet ocean light.",
    "isAvailable": true,
    "capacity": 3
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
  "roomType": "Standard Room",
  "imageUrl": "/images/room-standard.jpg",
  "pricePerNight": 60.00,
  "description": "Warm textures, soft linens, and a private corner for slower mornings.",
  "isAvailable": true,
  "capacity": 2
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
  "roomType": "Luxury Suite",
  "imageUrl": "/images/room-luxury-suite.jpg",
  "pricePerNight": 160.00,
  "description": "The signature stay: generous space, bay views, and personal service.",
  "capacity": 4
}
```

**Response `201 Created`:**

```json
{
  "id": 5,
  "roomType": "Luxury Suite",
  "imageUrl": "/images/room-luxury-suite.jpg",
  "pricePerNight": 160.00,
  "description": "The signature stay: generous space, bay views, and personal service.",
  "isAvailable": true,
  "capacity": 4
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
  "roomType": "Luxury Suite",
  "imageUrl": "/images/room-luxury-suite-v2.jpg",
  "pricePerNight": 175.00,
  "description": "Updated description with new amenities.",
  "isAvailable": true,
  "capacity": 4
}
```

**Response `200 OK`:**

```json
{
  "id": 5,
  "roomType": "Luxury Suite",
  "imageUrl": "/images/room-luxury-suite-v2.jpg",
  "pricePerNight": 175.00,
  "description": "Updated description with new amenities.",
  "isAvailable": true,
  "capacity": 4
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

### Check Availability

```http
POST /api/bookings/check-availability
Content-Type: application/json
```

```json
{
  "arrivalDate": "2026-06-01",
  "departureDate": "2026-06-05",
  "adult": 2,
  "children": 1
}
```

**Response `200 OK`:** List of available rooms matching the criteria.

**Response `400 Bad Request`:** Missing dates, departure before arrival, or adult count < 1.

---

### Create Booking *(User only)*

```http
POST /api/bookings
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "roomId": 1,
  "arrivalDate": "2026-06-01",
  "departureDate": "2026-06-05",
  "adult": 2,
  "children": 1
}
```

**Response `200 OK`:** Booking details with linked payment record (status: `Pending`, method: `Cash`).

**Response `400 Bad Request`:** Room not available, capacity exceeded, or overlapping booking.

**Response `401 Unauthorized`:** Missing or invalid JWT token.

**Response `404 Not Found`:** Room does not exist or is under maintenance.

**Response `500 Internal Server Error`:** Transaction failure — rollback is triggered automatically.

---

### View My Bookings *(User only)*

```http
GET /api/bookings/my
Authorization: Bearer <token>
```

**Response `200 OK`:** List of all bookings belonging to the authenticated user.

**Response `401 Unauthorized`:** Invalid or missing token.

**Response `404 Not Found`:** User not found in the system.

---

### Cancel Booking *(User only)*

```http
PATCH /api/bookings/{id}/cancel
Authorization: Bearer <token>
```

**Response `200 OK`:**

```json
{
  "message": "Booking has been cancelled successfully."
}
```

**Response `400 Bad Request`:** Booking is already cancelled/checked out, or arrival date has passed.

**Response `403 Forbidden`:** Attempting to cancel another user's booking.

**Response `404 Not Found`:** Booking not found.

---

### Checkout Booking *(Admin only)*

```http
PATCH /api/bookings/{id}/checkout
Authorization: Bearer <token>
```

**Response `200 OK`:** Booking status updated to `CheckedOut`.

**Response `400 Bad Request`:** Booking is not in `Confirmed` status.

**Response `404 Not Found`:** Booking not found.

---

### Complete Payment *(Admin only)*

```http
PATCH /api/bookings/{id}/complete-payment
Authorization: Bearer <token>
```

**Response `200 OK`:** Payment record updated to `Completed` with `paidAt` timestamp.

**Response `400 Bad Request`:** Payment has already been completed (idempotency check).

**Response `404 Not Found`:** No payment record linked to this booking.

---

### Toggle Room Status *(Admin only)*

```http
PATCH /api/toggle-room-status/{id}
Authorization: Bearer <token>
```

**Response `204 No Content`:** Room status toggled between available and maintenance.

**Response `400 Bad Request`:** Cannot lock a room that has active guests or future confirmed bookings.

**Response `404 Not Found`:** Room not found.

---

### Get All Articles

```http
GET /api/articles/getAll
```

**Response `200 OK`:**

```json
[
  {
    "id": 1,
    "title": "Electric Feel And Other Things",
    "author": "admin",
    "category": "Island",
    "summary": "How Panama evenings shape the resort mood.",
    "content": "Full article content here.",
    "publishedAt": "2026-05-29T06:10:30.2196622"
  },
  {
    "id": 2,
    "title": "Staying in Style Forever",
    "author": "admin",
    "category": "Lifestyle",
    "summary": "A guide to slower mornings and resort rituals.",
    "content": "Full article content here.",
    "publishedAt": "2026-05-29T00:00:00"
  },
  {
    "id": 3,
    "title": "Why Hotel Comfort Matters",
    "author": "admin",
    "category": "Design",
    "summary": "The small choices behind a calmer stay.",
    "content": "Full article content here.",
    "publishedAt": "2026-05-29T00:00:00"
  }
]
```

---

### Get Article By ID

```http
GET /api/articles/getById/{id}
```

**Response `200 OK`:**

```json
{
  "id": 2,
  "title": "Staying in Style Forever",
  "author": "admin",
  "category": "Lifestyle",
  "summary": "A guide to slower mornings and resort rituals.",
  "content": "Full article content here.",
  "publishedAt": "2026-05-29T00:00:00"
}
```

---

### Get Articles with Pagination

```http
GET /api/articles/pagination?pageNumber=1&pageSize=2
```

**Response `200 OK`:**

```json
{
  "items": [
    {
      "id": 1,
      "title": "Electric Feel And Other Things",
      "author": "admin",
      "category": "Island",
      "summary": "How Panama evenings shape the resort mood.",
      "content": "Full article content here.",
      "publishedAt": "2026-05-29T06:10:30.2196622"
    },
    {
      "id": 2,
      "title": "Staying in Style Forever",
      "author": "admin",
      "category": "Lifestyle",
      "summary": "A guide to slower mornings and resort rituals.",
      "content": "Full article content here.",
      "publishedAt": "2026-05-29T00:00:00"
    }
  ],
  "pageNumber": 1,
  "pageSize": 2,
  "totalItems": 3,
  "totalPages": 2,
  "hasPreviousPage": false,
  "hasNextPage": true
}
```

---

### Get Articles By Title

```http
GET /api/articles/getByTitle/{title}
```

**Response `200 OK`:** Returns all articles whose title contains the provided string (partial match).

---

### Get Articles By Category

```http
GET /api/articles/getByCategory/{category}
```

Example: `/api/articles/getByCategory/Island`

**Response `200 OK`:**

```json
[
  {
    "id": 1,
    "title": "Electric Feel And Other Things",
    "author": "admin",
    "category": "Island",
    "summary": "How Panama evenings shape the resort mood.",
    "content": "Full article content here.",
    "publishedAt": "2026-05-29T06:10:30.2196622"
  }
]
```

---

### Create Article *(Admin only)*

```http
POST /api/articles
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "title": "Why Hotel Comfort Matters",
  "category": "Design",
  "summary": "The small choices behind a calmer stay.",
  "content": "Full article content here."
}
```

**Response `200 OK`:**

```json
{
  "message": "create successful"
}
```

---

### Edit Article *(Admin only)*

```http
PUT /api/articles/edit/{id}
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "title": "Staying in Style Forever — Updated",
  "category": "Lifestyle",
  "summary": "A guide to slower mornings and resort rituals.",
  "content": "Updated article content here."
}
```

**Response `200 OK`:**

```json
{
  "id": 2,
  "title": "Staying in Style Forever — Updated",
  "author": "admin",
  "category": "Lifestyle",
  "summary": "A guide to slower mornings and resort rituals.",
  "content": "Updated article content here.",
  "publishedAt": "2026-05-29T08:57:05.1253911"
}
```

---

### Delete Article *(Admin only)*

```http
DELETE /api/articles/delete/{id}
Authorization: Bearer <token>
```

**Response `200 OK`:**

```json
{
  "message": "Delete successfully"
}
```

---

## 11. HTTP Status Codes Reference

| Code | Status | When it occurs |
| --- | --- | --- |
| 200 | OK | Successful data retrieval, booking created, cancelled, checked out, or payment completed |
| 201 | Created | Room created successfully |
| 204 | No Content | Room status toggled successfully (no response body) |
| 400 | Bad Request | Invalid dates, adult count < 1, room capacity exceeded, overlapping booking, room has active guests/future bookings when locking, cancellation after arrival date, or duplicate payment completion |
| 401 | Unauthorized | Missing or invalid JWT token, malformed user ID in token |
| 403 | Forbidden | Attempting to cancel another user's booking |
| 404 | Not Found | Room, user, booking, or payment record not found |
| 500 | Internal Server Error | Transaction failure during booking creation — rollback is triggered automatically |

---

## 12. Technologies Used

**Backend:** .NET 9, ASP.NET Core Web API, Entity Framework Core, SQL Server, JWT Authentication, Clean Architecture

**Frontend:** HTML5, CSS3, JavaScript, Bootstrap 5.2.3, Font Awesome 4.7, Google Fonts

---

## 13. Project Structure

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
├── Lux Hotel 1/
│   ├── Images/
│   ├── incentives/
│   ├── dom.js
│   ├── index.html
│   └── style.css
└── README.md
```