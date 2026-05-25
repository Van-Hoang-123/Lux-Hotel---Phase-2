using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LuxHotel.Domain.Entities
{
    [Table("Articles")]
    public class Article
    {
        [Key] // Đánh dấu đây là Khóa chính
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)] // Tự động tăng (Identity 1,1)
        public int Id { get; set; }

        [Required] // Bắt buộc phải nhập dữ liệu đầu vào
        [StringLength(255)] // Giới hạn độ dài chuỗi ký tự tối đa
        public string Title { get; set; }

        [Required]
        [StringLength(100)]
        public string Author { get; set; }

        [StringLength(50)]
        public string Category { get; set; }

        [Required]
        [StringLength(500)]
        public string Summary { get; set; }

        [Required]
        public string Content { get; set; }

        public DateTime PublishedAt { get; set; } = DateTime.UtcNow;
    }
}
