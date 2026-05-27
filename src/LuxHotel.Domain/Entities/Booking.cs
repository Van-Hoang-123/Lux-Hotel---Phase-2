using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LuxHotel.Domain.Entities
{
    [Table("Bookings")]
    public class Booking
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid UserId { get; set; } // Trường lưu khóa ngoại trỏ sang User

        [Required]
        public int RoomId { get; set; } // Trường lưu khóa ngoại trỏ sang Room

        [Required]
        [DataType(DataType.Date)]
        public DateTime ArrivalDate { get; set; } // Ngày đến nhận phòng

        [Required]
        [DataType(DataType.Date)]
        public DateTime DepartureDate { get; set; } // Ngày đi trả phòng

        [Required]
        public int Adult { get; set; } // Số lượng người lớn

        [Required]
        public int Children { get; set; } // Số lượng trẻ em

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalPrice { get; set; } // Tổng tiền = Số đêm * PricePerNight

        [Required]
        [StringLength(50)]
        public string BookingStatus { get; set; } = "Pending"; // Pending, Confirmed, Cancelled

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;


        // =========================================================================
        // THỂ HIỆN RELATIONSHIP (NAVIGATIONAL PROPERTIES) VIA TAGS
        // =========================================================================

        [ForeignKey("UserId")] // Khai báo UserId là khóa ngoại liên kết bảng Users
        public virtual User User { get; set; }

        [ForeignKey("RoomId")] // Khai báo RoomId là khóa ngoại liên kết bảng Rooms
        public virtual Room Room { get; set; }

        public virtual Payment? Payment { get; set; }
    }
}
