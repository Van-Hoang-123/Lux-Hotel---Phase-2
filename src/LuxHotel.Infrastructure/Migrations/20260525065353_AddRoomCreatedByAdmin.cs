using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LuxHotel.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRoomCreatedByAdmin : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByAdminId",
                table: "Rooms",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Rooms",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedByAdminId",
                value: null);

            migrationBuilder.UpdateData(
                table: "Rooms",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedByAdminId",
                value: null);

            migrationBuilder.UpdateData(
                table: "Rooms",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedByAdminId",
                value: null);

            migrationBuilder.UpdateData(
                table: "Rooms",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedByAdminId",
                value: null);

            migrationBuilder.CreateIndex(
                name: "IX_Rooms_CreatedByAdminId",
                table: "Rooms",
                column: "CreatedByAdminId");

            migrationBuilder.AddForeignKey(
                name: "FK_Rooms_User_CreatedByAdminId",
                table: "Rooms",
                column: "CreatedByAdminId",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Rooms_User_CreatedByAdminId",
                table: "Rooms");

            migrationBuilder.DropIndex(
                name: "IX_Rooms_CreatedByAdminId",
                table: "Rooms");

            migrationBuilder.DropColumn(
                name: "CreatedByAdminId",
                table: "Rooms");
        }
    }
}
