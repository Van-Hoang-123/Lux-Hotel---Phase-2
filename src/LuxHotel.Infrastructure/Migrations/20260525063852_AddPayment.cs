using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LuxHotel.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPayment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                IF OBJECT_ID(N'[Payments]', N'U') IS NULL
                BEGIN
                    CREATE TABLE [Payments] (
                        [Id] uniqueidentifier NOT NULL,
                        [BookingId] uniqueidentifier NOT NULL,
                        [Amount] decimal(18,2) NOT NULL,
                        [PaymentMethod] nvarchar(50) NOT NULL,
                        [PaymentStatus] nvarchar(50) NOT NULL,
                        [TransactionId] nvarchar(100) NULL,
                        [PaidAt] datetime2 NULL,
                        [CreatedAt] datetime2 NOT NULL,
                        CONSTRAINT [PK_Payments] PRIMARY KEY ([Id]),
                        CONSTRAINT [FK_Payments_Bookings_BookingId] FOREIGN KEY ([BookingId]) REFERENCES [Bookings] ([Id]) ON DELETE CASCADE
                    );
                END;
                """);

            migrationBuilder.Sql("""
                IF NOT EXISTS (
                    SELECT 1
                    FROM sys.indexes
                    WHERE name = N'IX_Payments_BookingId'
                        AND object_id = OBJECT_ID(N'[Payments]', N'U')
                )
                BEGIN
                    CREATE UNIQUE INDEX [IX_Payments_BookingId] ON [Payments] ([BookingId]);
                END;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                IF OBJECT_ID(N'[Payments]', N'U') IS NOT NULL
                BEGIN
                    DROP TABLE [Payments];
                END;
                """);
        }
    }
}
