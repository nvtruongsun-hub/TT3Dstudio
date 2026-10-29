# T&T 3D Labs — Tactile Play / R10

Thiết kế ngày 29/10/2026. Hình chủ đạo được tạo mới bằng công cụ image_gen tích hợp theo prompt người dùng: ba clicker dạng mèo mini, kem ốc quế và quả bơ, góc nhìn isometric, nhựa pastel mờ có vân in 3D, switch cơ học lộ nhẹ, nền ngà và ánh sáng studio mềm.

## Thiết kế

Ảnh chiếm phần lớn diện tích banner; chữ than xanh và đất nung được tiết chế để tập trung vào hình dáng và vật liệu. Thông điệp “Bấm vui. Mang theo.”. Không dùng lại khối TT, mascot và các thẻ giá của bản cũ. Bản A2 dùng cùng hình chủ đạo, không chuyển thành bảng catalog.

Bảng giá được bổ sung khung viền đôi: viền đất nung, đường bên trong mảnh, góc bo bất đối xứng và hai lớp lệch nhẹ gợi các lớp in. Tên bảng nằm ngắt trên viền; các mức giá có đường chia cột mảnh. Áp dụng đồng bộ banner và A2.

Ảnh gốc: `assets/images/poster-r10/tactile-trio.png`. Prompt đầy đủ lưu trong IMAGE-PROMPT.md cùng thư mục. Dùng built-in image_gen, không dùng API/CLI dự phòng.

## Tính chính xác của hình ảnh

Đây là hình minh họa ý tưởng, không phải ảnh chụp sản phẩm đang bán. Mèo clicker trong hình không được xác nhận là mẫu mèo khớp động trong catalog. Theo yêu cầu bổ sung, chân cả hai bản có bảng giá mẫu thực tế: mèo mini khớp động 29.000 ₫, clicker cơ học 39.000 ₫, clicker kem 49.000 ₫, clicker quả bơ 69.000 ₫. Giá được đối chiếu products.json. Dòng chú thích cạnh bảng giá phân biệt hình ý tưởng với mẫu thực tế.

Công cụ trả file 1536 × 1024 px. Từ “8k” trong prompt mô tả mong muốn chi tiết, không có nghĩa đầu ra là 8K. Không tạo thêm pixel giả bằng upscaling. Với bản in 120 × 60 cm để nhìn gần, cần ảnh nguồn độ phân giải cao hơn nếu muốn độ nét ảnh tương đương chữ vector.

## Đầu ra

- Banner 1200 × 600 mm và poster A2 420 × 594 mm; mỗi file một trang.
- Chữ và QR rõ, font lưu cục bộ. Kiểm tra PDF bằng Poppler, kiểm tra kích thước MediaBox và QR từ bản render.
- Kiểm tra xem trước 375, 768, 1280, 1920 px; không tràn ngang ở chế độ vừa màn hình. Nội dung nằm trong canvas ở cả hai khổ.
- HTML mở mặc định banner ngang; chuyển khổ và in bằng các nút phía trên.
- Bản in chưa có bleed/crop marks. Chọn tỷ lệ 100%, không thêm header/footer.

Các bản R7–R9 được giữ lại. Không thay đổi sản phẩm, giá hoặc đăng nội dung lên website công khai.
