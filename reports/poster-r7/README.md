# Poster T&T 3D Labs R7 — Góc nhỏ. Gu riêng.

Thiết kế ngày 28/10/2026. Thay bản R6 bằng một bộ nhận diện đồng nhất cho poster A2 và banner ngang.

## Định hướng

- Màu kem, xanh olive đậm và đất nung lấy từ logo hiện có của shop.
- Tiêu đề lớn, nhiều khoảng thở; nét lớp in gợi nghề in 3D.
- Một sản phẩm chủ đạo: đèn nấm vân dệt, 239.000 ₫.
- Dải sản phẩm nhỏ theo yêu cầu mới: clicker kem ốc quế 49.000 ₫, clicker quả bơ 69.000 ₫, móc khóa mèo mini 29.000 ₫.
- Dùng ảnh và giá có sẵn trong products.json, không tạo ảnh sản phẩm giả hoặc thêm khuyến mãi chưa xác nhận.
- Nhấn mạnh móc khóa và clicker trong dải sản phẩm phía dưới, dùng thông điệp “Bấm vui / Treo xinh / Tặng bạn”. Cập nhật đồng bộ A2 và banner. Giá lấy từ catalog hiện tại, không tự áp dụng chương trình giảm giá R6.

## Sử dụng

Mở `poster-artisan-stall.html`, chọn khổ A2 hoặc banner. Nút Xem 100% cho phép xem chi tiết; nút In / Lưu PDF chuẩn bị đầy đủ font và ảnh trước khi mở hộp thoại in. Font được lưu cục bộ cùng giấy phép OFL.

Hai PDF đi kèm là một trang mỗi file, đúng 420 × 594 mm và 1200 × 600 mm. Khi in chọn tỷ lệ 100%, không thêm header/footer. File chưa có bleed/crop marks; nếu xưởng cần tràn lề, yêu cầu họ giữ nguyên vùng thiết kế và thêm bleed theo quy cách máy.

## QR

QR riêng của R7 dẫn đến https://nvtruongsun-hub.github.io/TT3Dstudio/ và khớp với URL in trên poster. URL này trả HTTP 200 trong lần kiểm tra. QR cũ dùng tt3dlabs.vn, tên miền không phân giải được trong lần kiểm tra 28/10/2026. Không thay QR dùng ở các phần khác của website.

## Kiểm chứng

- Hai khổ chỉ xuất đúng một trang, kích thước MediaBox đã được kiểm tra.
- Đã render PDF bằng Poppler và kiểm tra ảnh thực tế, không chỉ dựa vào HTML.
- Giải mã QR từ ảnh render của cả hai PDF.
- Xem trước ở 375, 768, 1280 và 1920 px: không tràn ngang ở chế độ vừa màn hình; đổi khổ chọn đúng một bản.
- Ảnh và font tải đầy đủ. Giá của cả bốn mẫu đối chiếu với catalog.
- Test `tests/test_poster_stall_verification.js` được cập nhật cho R7; bản test R6 được giữ trong thư mục backup cùng HTML cũ. Các file xuất lịch sử R6 vẫn còn.

## Chất lượng ảnh nguồn

Ảnh catalog hiện là PNG 1000 × 1000, một phần chứa khoảng trong suốt. Chữ, logo và QR trong PDF là vector; ảnh sản phẩm vẫn bị giới hạn bởi ảnh nguồn. Bản banner lớn nên thay bằng ảnh gốc độ phân giải cao trước khi in để xem gần. Không tăng độ phân giải giả hoặc làm sai hình dáng, màu sắc sản phẩm.

Các nội dung thương hiệu ở đây là phương án thiết kế cho poster, không sửa giá/catalog, website chính hoặc đăng nội dung lên mạng.
