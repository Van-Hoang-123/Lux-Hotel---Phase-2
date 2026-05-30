using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LuxHotel.Application.Dtos
{
    public class ArticleCreateRequest
    {
        [Required] // Bắt buộc phải nhập dữ liệu đầu vào
        [StringLength(255)] // Giới hạn độ dài chuỗi ký tự tối đa
        public string Title { get; set; }

        [StringLength(50)]
        [AllowedValues("Daily", "Blog", "Event", ErrorMessage = "Category name must be: Daily, Blog, Event")]
        public string Category { get; set; }

        [Required]
        [StringLength(500)]
        public string Summary { get; set; }

        [Required]
        public string Content { get; set; }
    }
}
