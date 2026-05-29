using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LuxHotel.Application.Dtos
{
    public class ArticleEditRequest
    {
        
        public string? Title { get; set; }

        [StringLength(50)]
        [AllowedValues("Daily", "Blog", "Event", ErrorMessage = "Category name must be: Daily, Blog, Event")]
        public string? Category { get; set; }

        
        [StringLength(500)]
        public string? Summary { get; set; }

     
        public string? Content { get; set; }
    }
}
