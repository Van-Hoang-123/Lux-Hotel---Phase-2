
using Microsoft.EntityFrameworkCore;


namespace LuxHotel.Infrastructure.Models.Context
{
    public class LuxHotelDbContext : DbContext
    {
        public LuxHotelDbContext(DbContextOptions<LuxHotelDbContext> options) : base(options) { }
        public DbSet<Room> Rooms { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Article> Articles { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Bơm dữ liệu mẫu cho bảng Room theo đúng yêu cầu giao diện Front-end
            modelBuilder.Entity<Room>().HasData(
                new Room { Id = 1, RoomType = "Standard Room", PricePerNight = 60.0m, ImageUrl = "./Images/Room - Standard.jpg", Description = "Phòng tiêu chuẩn", IsAvailable = true },
                new Room { Id = 2, RoomType = "Beach Villa", PricePerNight = 90.0m, ImageUrl = "./Images/Room - Beach Villa.jpg", Description = "Biệt thự hướng biển", IsAvailable = true },
                new Room { Id = 3, RoomType = "Exclusive Suite", PricePerNight = 120.0m, ImageUrl = "./Images/Room - Exclusive Suite.jpg", Description = "Phòng cao cấp đặc biệt", IsAvailable = true },
                new Room { Id = 4, RoomType = "Luxury Suite", PricePerNight = 160.0m, ImageUrl = "./Images/Room - Luxury Suite.jpg", Description = "Phòng hoàng gia sang trọng", IsAvailable = true }
            );
        }

    }
}
