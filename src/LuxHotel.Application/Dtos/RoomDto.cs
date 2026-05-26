using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LuxHotel.Application.Dtos
{
    public class RoomDto
    {
        public int Id { get; set; }
        public string RoomType { get; set; } = string.Empty;
        public decimal PricePerNight { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsAvailable { get; set; }
    }
    public class CreateRoomDto
    {
        public string RoomType { get; set; } = string.Empty;
        public decimal PricePerNight { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class UpdateRoomDto : CreateRoomDto
    {
        public bool IsAvailable { get; set; }
    }
}
