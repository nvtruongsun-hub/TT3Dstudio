# T&T 3D — Trải nghiệm sản phẩm trên điện thoại và máy tính

Ngày: 27/10/2026. Nối tiếp bản thiết kế tối giản; phạm vi là storefront HTML/JS đang chạy và artifact tĩnh.

## Mục tiêu

Khách hiểu được hình dáng, công dụng, giá và phiên bản đang chọn trước khi đặt. Tối giản không đồng nghĩa với ẩn hết thông tin mua hàng.

## Những thay đổi đã thực hiện

| Khu vực | Điện thoại | Máy tính |
|---|---|---|
| Catalog | Mặc định ảnh lớn một cột; có lựa chọn Lưới hai cột, ghi nhớ trên thiết bị | Ba cột với ảnh lớn hơn thay cho bốn cột nhỏ |
| Card | Hiện công dụng, tên màu, giá và nút Xem & chọn có chữ | Thông tin tương tự, dễ so sánh giữa các mẫu |
| Ảnh | Hiển thị trọn ảnh theo `contain`, không cắt hình dáng; bấm để mở xem lớn | Cùng ảnh gốc, có phóng to/thu nhỏ và kéo ảnh khi đã zoom |
| Chi tiết | Toàn màn hình; nội dung cuộn riêng; nút thêm giỏ/đặt hàng luôn ở footer nhìn thấy | Panel lớn hai cột: ảnh và thông tin/lựa chọn; màn tablet hẹp chuyển sang xếp dọc |
| Lựa chọn | Màu/vật liệu có nhãn và trạng thái chọn; tổng giá cập nhật | Cùng một hợp đồng dữ liệu và giá, không dùng giá riêng cho giao diện desktop |
| Bàn phím/trợ năng | Vùng chạm lớn, trường nhập 16px ở bước mua để hạn chế zoom khi nhập trên mobile | Ảnh có button và alt đúng sản phẩm; dialog native, Escape và trả focus; không chặn Ctrl/Cmd zoom trình duyệt |

Nút trên card mở chi tiết để khách xem và chọn trước; không tự thêm phiên bản mặc định khi khách chưa hiểu rõ các tùy chọn. Màu đã chọn trên card được chuyển vào chi tiết theo logic có sẵn.

Trong chi tiết có:

- Tên đầy đủ, giá và mô tả.
- Công dụng lấy từ dữ liệu SKU.
- Thông tin kích thước/khối lượng/vật liệu/chính sách; phần thiếu nói rõ cần xưởng xác nhận.
- Dòng “Bạn chọn” nêu màu, vật liệu và số lượng.
- Ghi chú ảnh tham khảo; không đổi màu bằng filter để giả làm ảnh biến thể.

## Giới hạn dữ liệu cần xử lý để khách cảm nhận tốt hơn nữa

**Cả 55 SKU hiện không có `specs.dimensions`.** Bản cũ thay bằng “Tiêu chuẩn xưởng”; bản này nói rõ chưa có số đo. Các ảnh đã kiểm tra có kích thước 1.000 × 1.000px; phóng to không tạo ra chi tiết vật lý mới.

Ưu tiên bổ sung cho sản phẩm có doanh số/nhu cầu cao trước:

1. Số đo thực Dài × Rộng × Cao và đơn vị, đưa vào `specs.dimensions` của đúng SKU. Không lấy một kích thước chung cho cả danh mục.
2. Ảnh đúng mẫu ở chính diện, góc nghiêng và phần có chức năng như ngăn chứa/đế/nắp.
3. Một ảnh có thước hoặc vật làm chuẩn để hiểu tỷ lệ thực; một ảnh đặt trong không gian sử dụng.
4. Ảnh riêng cho màu/vật liệu thật. Hiện tại hệ thống chỉ có ảnh tham khảo mẫu, chưa tự dựng bộ ảnh biến thể khi dữ liệu đó chưa có.
5. Ảnh cận bề mặt hoàn thiện và video sử dụng ngắn nếu có chi tiết chuyển động/NFC.
6. Ghi rõ sản phẩm đèn có/không gồm bộ điện, bình dùng hoa tươi/khô theo kiểm thử thật, phụ kiện gì đi kèm.

Không dùng ảnh AI để chứng minh một góc chụp, độ kín nước, độ mịn lớp hoặc màu thực tế chưa được kiểm chứng.

## Kiểm chứng

- 57 kiểm thử hồi quy hiện có về dữ liệu, giá, giỏ, cấu hình và hành vi vẫn đạt.
- 36 kiểm tra trình duyệt: tìm/lọc/sort/tải thêm, mọi SKU vẫn truy cập được, công dụng hiển thị, ảnh không crop, alt đúng SKU, mở/zoom/đóng viewer và trả focus, browser zoom, màu/vật liệu/số lượng/giá, giỏ nhận đúng lựa chọn, đổi layout mobile, navigation và menu.
- Không tràn ngang document trong trạng thái cửa hàng được kiểm tại 375/768/1280/1920px. Footer chi tiết vẫn trong viewport ở 375×900 và 375×667; nội dung cuộn độc lập.
- Build tĩnh biên dịch CSS, đóng gói module mới. Module ảnh được thêm vào preflight để build không âm thầm thiếu script.
- Không gửi đơn/tin nhắn thật hoặc thay đổi giá/catalog; test giỏ chỉ chạy trên origin QA riêng.
- Chưa kiểm thử trên iPhone/Android vật lý, chưa đo CWV field và chưa chạy screen reader toàn diện. Kích thước trình duyệt giả lập không thay thế các bước này.

## Tệp chính

- `index.html`: khung chi tiết, thông tin cần xem, điều khiển layout và dialog ảnh.
- `css/minimal.css`: layout điện thoại/tablet/desktop và kích thước controls.
- `js/product-experience.js`: viewer ảnh, trạng thái zoom, focus và tóm tắt phiên bản.
- `js/products-manager.js`: công dụng, thông số trung thực, lựa chọn theo SKU và cách vào luồng mua.
- `scripts/build-static-artifact.js`: kiểm tra module mới trước đóng gói.

Ảnh và kết quả browser ở `reports/product-clarity-20261027-evidence/`; các file trước sửa được sao lưu trong `reports/product-clarity-backup-20261027-*`.
