using System;
using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace LuxHotel.Application.Converters // Bạn cho vào namespace phù hợp nhé
{
    public class CustomDateTimeFullConverter : JsonConverter<DateTime?>
    {
        // Dùng FFFFFFF (viết hoa) để nhận linh hoạt từ 0 đến 7 chữ số mili giây
        private readonly string _parseFormat = "dd-MM-yyyy";
        private readonly string _writeFormat = "dd-MM-yyyy";

        // Chiều Nhận (Đọc từ FE gửi lên)
        public override DateTime? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            // Nếu FE truyền null
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string dateStr = reader.GetString();

            // Nếu FE truyền chuỗi rỗng ""
            if (string.IsNullOrWhiteSpace(dateStr))
            {
                return null;
            }

            if (DateTime.TryParseExact(dateStr, _parseFormat, CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime date))
            {
                return date;
            }

            throw new JsonException($"Định dạng ngày giờ không hợp lệ. Kỳ vọng dạng: dd-MM-yyyy");
        }

        // Chiều Trả (Trả dữ liệu về lại cho FE nếu cần)
        public override void Write(Utf8JsonWriter writer, DateTime? value, JsonSerializerOptions options)
        {
            if (value.HasValue)
            {
                writer.WriteStringValue(value.Value.ToString(_writeFormat));
            }
            else
            {
                writer.WriteNullValue();
            }
        }
    }
}