# T&T 3D Labs — Bright Layers / R9

Thiết kế ngày 28/10/2026 theo yêu cầu mới: sáng sủa, chuyên nghiệp và có dấu ấn riêng.

## Ý tưởng

Nền trắng, xanh cobalt, chữ navy và điểm nhấn xanh chanh rất nhỏ. Biểu tượng hai chữ T được dựng bằng SVG với các đường lớp in, liên hệ trực tiếp tên T&T và kỹ thuật in 3D. Đây là hình nhận diện cho bộ biển quầy, không phải sản phẩm bán.

Bố cục dùng tiêu đề lớn “Chạm một chút. Vui cả ngày.”, hàng giá thoáng có vạch phân chia nhẹ, khoảng trắng rõ. Banner ưu tiên đọc từ xa; A2 bổ sung ảnh mẫu. Không dùng lại mascot, khung viền và các thẻ giá pastel của R8.

## Sản phẩm

Mèo mini 29.000 ₫; clicker cơ học 39.000 ₫; clicker kem 49.000 ₫; clicker quả bơ 69.000 ₫. Giá và ảnh khớp products.json tại thời điểm kiểm tra. Không thay đổi catalog hoặc tự thêm khuyến mãi.

## Đầu ra và kiểm tra

- Banner 1200 × 600 mm và bảng mẫu A2 420 × 594 mm, mỗi file một trang.
- Đã render PDF bằng Poppler để kiểm tra, giải mã được QR trên cả hai bản.
- Xem trước tại 375, 768, 1280, 1920 px không tràn ngang. Nội dung cả hai khổ không tràn canvas.
- Font cục bộ; banner dùng chữ, hình vector và QR SVG. A2 còn phụ thuộc ảnh catalog 1000 px.
- Chạy kiểm tra giá, tài nguyên, QR và kích thước PDF bằng tests/test_poster_stall_verification.js.
- In 100%, không thêm header/footer. PDF chưa có bleed/crop marks.

HTML mở mặc định bản ngang. Các bản R7 và R8 được giữ riêng; bản HTML và bài kiểm tra trước khi thay được sao lưu.
