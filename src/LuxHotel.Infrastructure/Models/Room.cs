using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LuxHotel.Infrastructure.Models
{
    [Table("Rooms")]
    public class Room
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string RoomType { get; set; } // Ví dụ: Standard Room, Beach Villa...

        [Required]
        [Column(TypeName = "decimal(18,2)")] // Định nghĩa kiểu dữ liệu tiền tệ chính xác trong SQL Server
        public decimal PricePerNight { get; set; }

        [Required]
        [StringLength(255)]
        public string ImageUrl { get; set; } // Lưu đường dẫn ảnh như ./Images/Room - Standard.jpg

        [StringLength(1000)]
        public string Description { get; set; }

        public bool IsAvailable { get; set; } = true;

        // THỂ HIỆN RELATIONSHIP: Một phòng có thể nằm trong nhiều đơn đặt (Mối quan hệ 1 - Nhiều)
        public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}
