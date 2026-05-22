using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LuxHotel.Infrastructure.Models
{
    public class User : IdentityUser<Guid>
    {
        [Required]
        [StringLength(150)]
        public string FullName { get; set; }

        [Required]
        [StringLength(20)]
        public string Role { get; set; } // "Admin" hoặc "User"

        // THỂ HIỆN RELATIONSHIP: Một User có thể có nhiều đơn đặt phòng (Mối quan hệ 1 - Nhiều)
        public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}
