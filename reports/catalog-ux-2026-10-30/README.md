# Cải tiến trải nghiệm chọn mẫu — 30/10/2026

## Những vấn đề quan sát

- Vùng tìm kiếm, danh mục và nhiều phân loại con chiếm phần lớn màn hình điện thoại trước khi người dùng thấy mẫu.
- Danh sách mặc định dồn nhiều mẫu cùng nhóm lên đầu; chưa thể hiện được cả năm nhóm sản phẩm.
- Thiếu lọc ngân sách và thiếu cách nhìn nhanh những điều kiện đang áp dụng.
- Thẻ mẫu có nhiều nhãn nhỏ, ảnh bị cắt, hành động chọn mẫu chưa nổi bật.

## Đã triển khai

1. Gom tìm kiếm và các nhóm mẫu vào thanh gọn. Mở bộ lọc chi tiết khi cần; trên điện thoại thanh này cuộn theo trang để nhường diện tích cho ảnh.
2. Thêm ngân sách dưới 100.000 đ, từ 100.000 đến dưới 200.000 đ và từ 200.000 đ. Áp dụng trên giá cơ bản; ghi rõ biến thể được xác nhận khi chọn mẫu.
3. Chỉ hiện phân loại con tương ứng với nhóm đã chọn. Hiển thị từng điều kiện dưới dạng nút có thể bỏ riêng; hỗ trợ đặt lại tất cả và trạng thái không có kết quả.
4. Gợi ý xen kẽ năm nhóm ở chế độ Đề xuất; giữ thứ tự trong từng nhóm. Sắp xếp tăng/giảm giá dùng giá thực. Hiển thị 12 mẫu mỗi lượt và tải tiếp cho tới hết danh sách.
5. Làm lại thẻ mẫu: ảnh giữ nguyên tỷ lệ và không cắt, tên/giá rõ hơn, mô tả công dụng ngắn, số màu từ dữ liệu thực và nút **Xem & chọn**. Có chế độ ảnh lớn hoặc lưới, ghi nhớ lựa chọn.
6. Giữ luồng chọn màu, vật liệu và thêm giỏ. Đóng chi tiết sẽ trả focus về thẻ đang xem và giữ kết quả lọc.
7. Bổ sung tên truy cập cho nút, mở bộ lọc bằng bàn phím, Escape để đóng, chữ chọn sắp xếp 16 px trên mobile và màu hành động có độ tương phản tối thiểu 4,5 trong các ca đo.

## Số đo giao diện

Ảnh trước/sau dùng Chrome ở cùng viewport, cuộn đầu catalog ngay dưới navbar. Đây là số đo bố cục, chưa phải số liệu sử dụng thực tế.

| Viewport | Vùng tìm kiếm/danh mục trước | Sau | Vị trí đầu thẻ trước | Sau |
| --- | ---: | ---: | ---: | ---: |
| Desktop 1440 × 1000 | 258 px | 128 px | 462 px | 443 px |
| Mobile 390 × 844 | 317 px | 120 px | 553 px | khoảng 374 px |

Vùng điều khiển trên mobile giảm khoảng 62%; đầu danh sách xuất hiện sớm hơn khoảng 179 px. Các số đo chính xác nằm trong `before-measurements.json` và `after-measurements.json`.

## Kiểm tra

- `verify.cjs`: 19 ca trình duyệt cho bộ lọc kết hợp, bỏ từng điều kiện, ngân sách và các biên 100.000/200.000 đ, tải đủ 55 mẫu, thứ tự ổn định, focus, dữ liệu màu, độ tương phản, giỏ hàng và lưu chế độ xem.
- Responsive 320, 390, 768, 1440 px; kiểm tra hai kiểu xem, các điều khiển nằm trong màn hình và không tràn ngang. `capture.cjs` xác nhận bản CSS `choice-v2` và chữ sắp xếp mobile 16 px.
- Bộ trình duyệt cũ `reports/ux-refresh-2026-10-30/verify.cjs`: 15/15, bao gồm hero, tìm kiếm, điều hướng, giỏ hàng và phục hồi lỗi tải catalog.
- Bốn bộ kiểm tra Node hiện có: 49/49. Điều chỉnh kỳ vọng từ 8 thành 12 mẫu và thay kiểm tra nhãn thông số cũ bằng cấu trúc thẻ mới; giữ kiểm tra các hành động và dữ liệu màu thực.
- Kiểm tra cú pháp JavaScript, parse CSS và đóng gói static thành công; `dist/` có 209 tệp cùng manifest.

Kịch bản giỏ hàng dùng browser context riêng; không tạo đơn hay gửi tin nhắn. Có một lượt kiểm tra khởi tạo bị timeout khi luồng log của máy chủ xem trước đầy; đã đổi máy chủ xem trước sang chế độ không ghi từng request và chạy lại. Dữ liệu sản phẩm không thay đổi trong xử lý này.

## Tệp chính và bản xem trước

- `index.html`: cấu trúc catalog và nhãn điều khiển.
- `css/catalog.css`: thiết kế có phạm vi riêng cho catalog.
- `js/products-manager.js`: thẻ mẫu, bộ lọc, thứ tự đề xuất và phân trang.
- `scripts/build-static-artifact.js`: bổ sung CSS mới vào preflight.
- Bản xem trước: http://127.0.0.1:8765/dist/
- Ảnh `after-desktop.png`, `after-tablet.png`, `after-mobile.png`, `after-small-mobile.png`.

Chất lượng ảnh nguồn còn khác nhau giữa các nhóm; một số ảnh chứa chữ/watermark. Bước nội dung tiếp theo nên chuẩn hóa bộ ảnh sản phẩm. Chưa có số liệu analytics để kết luận mức tăng chuyển đổi.
