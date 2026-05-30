using LuxHotel.Application.Converters;
using System;
using System.Text.Json.Serialization;

namespace LuxHotel.Application.Dtos
{

    public class BookingResponseDTO
    {
        public Guid Id { get; set; }
        public int RoomId { get; set; }
        
        public DateTime ArrivalDate { get; set; }
        
        public DateTime DepartureDate { get; set; }
        public int Adult { get; set; }
        public int Children { get; set; }
        public decimal TotalPrice { get; set; }
        public string BookingStatus { get; set; }

    }
}