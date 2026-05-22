using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace LuxHotel.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedRoomData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Rooms",
                columns: new[] { "Id", "Description", "ImageUrl", "IsAvailable", "PricePerNight", "RoomType" },
                values: new object[,]
                {
                    { 1, "Phòng tiêu chuẩn", "./Images/Room - Standard.jpg", true, 60.0m, "Standard Room" },
                    { 2, "Biệt thự hướng biển", "./Images/Room - Beach Villa.jpg", true, 90.0m, "Beach Villa" },
                    { 3, "Phòng cao cấp đặc biệt", "./Images/Room - Exclusive Suite.jpg", true, 120.0m, "Exclusive Suite" },
                    { 4, "Phòng hoàng gia sang trọng", "./Images/Room - Luxury Suite.jpg", true, 160.0m, "Luxury Suite" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "Id",
                keyValue: 4);
        }
    }
}
