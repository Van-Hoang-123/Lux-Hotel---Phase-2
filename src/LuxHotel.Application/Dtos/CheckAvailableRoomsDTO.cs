using System;
using System.Text.Json.Serialization;
using LuxHotel.Application.Converters; // Import converter ở trên vào

namespace LuxHotel.Application.Dtos
{
    public class CheckAvailableRooomsDTO
    {
        [JsonConverter(typeof(CustomDateTimeFullConverter))]
        public DateTime? ArrivalDate { get; set; }

        [JsonConverter(typeof(CustomDateTimeFullConverter))]
        public DateTime? DepartureDate { get; set; }

        public int Adult { get; set; }
        public int Children { get; set; }
    }
}