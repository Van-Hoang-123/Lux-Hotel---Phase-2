using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using LuxHotel.Domain.Enums;
namespace LuxHotel.Application.Dtos
{
    public class GetRoomsQueryDto
    {
        public RoomSortBy SortBy { get; set; } = RoomSortBy.Id;
        public SortOrder Order { get; set; } = SortOrder.Asc; 
    }
    public class RoomDto
    {
        public int Id { get; set; }
        public string RoomType { get; set; } = string.Empty;
        public decimal PricePerNight { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsAvailable { get; set; }
        public int Capacity { get; set; }
    }
    public class CreateRoomDto
    {
        public string RoomType { get; set; } = string.Empty;
        public decimal PricePerNight { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int Capacity { get; set; }
    }

    public class UpdateRoomDto : CreateRoomDto
    {
        public bool IsAvailable { get; set; }
    }
}
