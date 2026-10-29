# T&T 3D Labs R8 — Biển quầy “Móc xinh. Bấm vui.”

Thiết kế ngày 28/10/2026 theo ảnh tham khảo quầy bán móc khóa do người dùng gửi.

## Bố cục và nhận diện

Banner ngang dành cho mặt trước quầy: tên T&T lớn, mô tả ngành hàng rõ, bốn mức giá đọc từ xa. Nền kem, nét tím đậm, màu hồng, mint, tím nhạt và vàng. Mascot phím bấm có khoen móc khóa được vẽ riêng bằng SVG, là hình nhận diện, không phải một sản phẩm được chào bán. Bỏ đèn và nhóm decor khỏi cả hai bản.

Bảng A2 bổ trợ có ảnh bốn mẫu để khách chọn gần quầy. Khi mở HTML, banner ngang là bản mặc định. Nút Xem 100% và In / Lưu PDF vẫn hoạt động.

## Giá và dữ liệu

- Mèo mini: 29.000 ₫.
- Clicker cơ học: 39.000 ₫.
- Clicker kem: 49.000 ₫.
- Clicker quả bơ: 69.000 ₫.

Các giá khớp products.json tại lúc xuất. Không tự đặt ưu đãi, không thay giá website. Ảnh A2 lấy từ catalog. QR khớp với https://nvtruongsun-hub.github.io/TT3Dstudio/ và đã giải mã từ cả hai ảnh render PDF.

## In và kiểm tra

- Banner: 1200 × 600 mm; A2: 420 × 594 mm. Mỗi PDF đúng một trang.
- Banner sử dụng chữ, hình vector và QR SVG để in lớn rõ nét. A2 còn phụ thuộc chất lượng ảnh catalog.
- Font Plus Jakarta Sans đã được lưu cục bộ cùng giấy phép từ R7.
- Đã render PDF bằng Poppler để kiểm tra bố cục, xác nhận không tràn nội dung và kiểm tra xem trước ở 375, 768, 1280, 1920 px.
- Chạy test_poster_stall_verification.js: 5 kiểm tra đạt về giá, tài nguyên, QR và hai khổ PDF.
- In tỷ lệ 100%, không thêm header/footer. PDF chưa thêm bleed/crop marks; xưởng in có thể xử lý theo quy cách thành phẩm.

Bản R7 và các PDF cũ vẫn giữ trong reports/poster-r7. HTML và bài kiểm tra trước khi áp dụng R8 được sao lưu riêng.
