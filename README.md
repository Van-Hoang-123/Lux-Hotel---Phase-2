# Lux Hotel

Lux Hotel là giao diện website khách sạn responsive, được xây dựng bằng HTML, CSS và JavaScript thuần. Dự án hiện có phần Front-end tĩnh và được định hướng tích hợp với hệ thống Backend RESTful API cho nghiệp vụ quản lý phòng, đặt phòng, tài khoản người dùng và tin tức khách sạn.

## Mục tiêu dự án

- Xây dựng giao diện giới thiệu khách sạn Lux Hotel theo mẫu Hotel Luxe.
- Cung cấp form kiểm tra phòng trống và đăng ký nhận tin.
- Hiển thị danh sách phòng, dịch vụ, đánh giá khách hàng và bài viết tin tức.
- Chuẩn bị cấu trúc dữ liệu và luồng tích hợp Backend cho hệ thống đặt phòng khách sạn.

## Trạng thái hiện tại

- Front-end: đã có giao diện tĩnh, responsive layout, slider, menu mobile, form validation và dữ liệu mẫu render bằng JavaScript.
- Backend: đang ở giai đoạn kế hoạch triển khai bằng ASP.NET Core, Entity Framework Core và Clean Architecture.

## Công nghệ sử dụng

- HTML5
- CSS3
- JavaScript
- Bootstrap 5.2.3
- Font Awesome 4.7
- Google Fonts: Old Standard TT, Open Sans

## Tính năng Front-end

- Header gồm thông tin liên hệ, logo, menu điều hướng và submenu Room.
- Menu responsive cho thiết bị di động.
- Hero slider với ảnh nền, tiêu đề và form kiểm tra phòng trống.
- Form validation cho Arrival Date, Departure Date và Email.
- Danh sách phòng khách sạn gồm Standard Room, Beach Villa, Exclusive Suite và Luxury Suite.
- Slider phòng riêng cho desktop và mobile.
- Slider giới thiệu Culinary Experience và Spa Like No Other.
- Khu vực Inspired Incentives với hiệu ứng hover đổi ảnh nền.
- Khu vực đánh giá khách hàng.
- Khu vực Articles & News.
- Footer với thông tin liên hệ, quick links, form đăng ký email và nút Go to top.

## Cấu trúc thư mục

```text
Lux Hotel 1/
|-- index.html
|-- index copy.html
|-- style.css
|-- dom.js
|-- Images/
|-- incentives/
|-- Desktop UI.png
|-- Mobile UI.png
|-- Desktop - Menu.jpg
|-- Mobile - Menu.jpg
`-- Read me.docx
```

## Cách chạy dự án

1. Clone repository:

```bash
git clone <repository-url>
cd "Lux Hotel 1"
```

2. Mở file `index.html` bằng trình duyệt.

3. Có thể dùng extension Live Server trong VS Code để chạy giao diện với local server.

> Lưu ý: dự án đang dùng Bootstrap, Font Awesome và Google Fonts qua CDN, vì vậy cần kết nối Internet để giao diện hiển thị đầy đủ.

## Dữ liệu mẫu trên giao diện

### Room

| Tên phòng | Giá khởi điểm |
| --- | ---: |
| Standard Room | $60.0/night |
| Beach Villa | $90.0/night |
| Exclusive Suite | $120.0/night |
| Luxury Suite | $160.0/night |

### Inspired Incentives

| Dịch vụ | Mô tả |
| --- | --- |
| Airport Pickup | Đưa đón khách từ sân bay. |
| Complementary Breakfast | Bữa sáng miễn phí. |
| City Tour Guide | Hướng dẫn viên tham quan thành phố. |
| Beach BBQ Party | Tiệc BBQ trên bãi biển. |

## Định hướng Backend

Theo kế hoạch phát triển, Backend sẽ được xây dựng theo mô hình Clean Architecture với ASP.NET Core và Entity Framework Core.

Các module chính:

- User: đăng ký, đăng nhập, quản lý hồ sơ cá nhân và phân quyền Admin/User.
- Room: quản lý danh sách phòng, chi tiết phòng, giá phòng và hình ảnh.
- Booking: kiểm tra phòng trống, đặt phòng, quản lý lịch sử đặt phòng và tránh đặt trùng lịch.
- Article/News: quản lý bài viết và tin tức hiển thị trên website.
- Security: JWT Authentication, Role-based Authorization, input validation, chống SQL Injection, XSS và CSRF.
- Testing: unit test cho các logic nghiệp vụ quan trọng.
- DevOps: Swagger UI hoặc Postman Collection, Docker và triển khai cloud nếu mở rộng.

## API dự kiến

| Method | Endpoint | Chức năng |
| --- | --- | --- |
| POST | `/api/auth/register` | Đăng ký tài khoản |
| POST | `/api/auth/login` | Đăng nhập và nhận JWT |
| GET | `/api/users/profile` | Lấy thông tin hồ sơ người dùng |
| PUT | `/api/users/profile` | Cập nhật hồ sơ người dùng |
| GET | `/api/rooms` | Lấy danh sách phòng |
| GET | `/api/rooms/{id}` | Lấy chi tiết phòng |
| POST | `/api/rooms` | Tạo phòng mới dành cho Admin |
| PUT | `/api/rooms/{id}` | Cập nhật thông tin phòng dành cho Admin |
| DELETE | `/api/rooms/{id}` | Xóa phòng dành cho Admin |
| POST | `/api/bookings/check-availability` | Kiểm tra phòng trống |
| POST | `/api/bookings` | Tạo đặt phòng |
| GET | `/api/bookings/my` | Xem lịch sử đặt phòng của người dùng |
| GET | `/api/articles` | Lấy danh sách bài viết |
| GET | `/api/articles/{id}` | Lấy chi tiết bài viết |

Các field Front-end đang dùng cần được giữ theo chuẩn camelCase khi tích hợp API:

```json
{
  "arrivalDate": "2026-05-18",
  "departureDate": "2026-05-20",
  "adult": "adult",
  "children": "children",
  "email": "example@gmail.com"
}
```
## Create backend structure

```bash
dotnet new sln -n LuxHotel
dotnet new webapi -n LuxHotel.Api -o src/LuxHotel.Api
dotnet new classlib -n LuxHotel.Domain -o src/LuxHotel.Domain
dotnet new classlib -n LuxHotel.Application -o src/LuxHotel.Application
dotnet new classlib -n LuxHotel.Infrastructure -o src/LuxHotel.Infrastructure
dotnet new xunit -n LuxHotel.Tests -o tests/LuxHotel.Tests
```
## Phân công công việc dự kiến

| Vai trò | Nhiệm vụ chính |
| --- | --- |
| Team Leader & Software Architect | Khởi tạo kiến trúc Clean Architecture, quản lý Git workflow, review Pull Request và điều phối tiến độ. |
| Database & Identity Engineer | Thiết kế ERD, cấu hình DbContext, Migration, User Management và ASP.NET Identity. |
| Security & Authentication Specialist | Cấu hình JWT, phân quyền, validation và middleware bảo mật. |
| Core Developer A - Room Engine | Xây dựng CRUD Room, API danh sách phòng và chi tiết phòng. |
| Core Developer B - Booking Engine | Xây dựng nghiệp vụ đặt phòng, kiểm tra phòng trống, phân trang, lọc và sắp xếp. |
| Advanced Features & Testing Engineer | Upload ảnh, Logging, Caching, Blog API và Unit Test. |
| DevOps, Documentation & FE Integration | Tích hợp Front-end với API thật, Swagger/Postman, tài liệu setup và Docker/deploy nếu có. |

## Git workflow

- Không commit trực tiếp lên `main` hoặc `master`.
- Mỗi tính năng được phát triển trên một branch riêng theo mẫu:

```bash
feature/room-api
feature/booking-api
feature/authentication
feature/frontend-integration
```

- Sau khi hoàn thành, tạo Pull Request để review trước khi merge.
- Commit message nên ngắn gọn, rõ phần việc đã làm.

Ví dụ:

```bash
git checkout -b feature/room-api
git add .
git commit -m "Add room API endpoints"
git push origin feature/room-api
```

## Roadmap

- [x] Xây dựng giao diện trang chủ Lux Hotel.
- [x] Thêm responsive menu cho mobile.
- [x] Thêm slider phòng, slider dịch vụ và hiệu ứng hover.
- [x] Thêm validation cơ bản cho form.
- [ ] Tích hợp API Room thay cho dữ liệu tĩnh trong `dom.js`.
- [ ] Tích hợp API Booking cho form Check Availability và Book Now.
- [ ] Tích hợp Authentication bằng JWT.
- [ ] Thêm Swagger UI hoặc Postman Collection.
- [ ] Viết Unit Test cho các nghiệp vụ chính.
- [ ] Đóng gói Docker và deploy nếu mở rộng.

## Lưu ý khi deploy

- Giữ nguyên cấu trúc thư mục `Images/` để ảnh không bị lỗi đường dẫn.
- Khi deploy lên GitHub Pages hoặc môi trường Linux, nên thống nhất chữ hoa/thường trong đường dẫn ảnh vì hệ thống file có phân biệt `Images` và `images`.
- Các thư viện CDN cần Internet để tải font, icon và Bootstrap.

## Nguồn tham khảo

Giao diện được tham khảo từ Hotel Luxe demo của ThemeBubble: https://themebubble.com/demo/hotelluxe/home/

## Tác giả

Dự án thực hiện cho môn CSW306 - Phát triển Backend.
