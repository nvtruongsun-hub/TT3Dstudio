# T&T 3D — Rà soát và cải tiến UI/UX

Ngày thực hiện: 27/10/2026 · Phạm vi: bản local HTML/JS tĩnh và pipeline `build:static`.

## Kết quả thiết kế

Chuyển cửa hàng sang phong cách sáng, tối giản, ưu tiên sản phẩm: ít khung/badge, nền trung tính, màu đất nung dùng cho hành động chính, typography sans thống nhất và khoảng trắng có phân cấp.

Đã chỉnh trực tiếp cửa hàng, điều hướng, catalog và nền thị giác của các màn Cá nhân hóa, Cảm hứng, Tra đơn, Hỗ trợ. Giữ giá, mã sản phẩm, dữ liệu catalog, biến thể và logic giỏ/checkout có sẵn. Không tạo backend theo dõi đơn mới trong lần cải tiến giao diện này.

## Đánh giá cấu trúc trước sửa

| Vấn đề quan sát | Tác động | Cách xử lý |
|---|---|---|
| Header có nhiều pill, icon, nút đổi theme và hai điểm tra đơn | Không rõ điều hướng chính/phụ, chật ở tablet | Navigation dạng chữ, một vị trí cho mỗi nhiệm vụ, giỏ riêng; menu mở rộng ở màn vừa/hẹp |
| Vẫn gọi Cá nhân hóa là “Studio 3D” | Khó hiểu so với preview 2D thực tế | Đổi tên thành Cá nhân hóa; bỏ badge kỹ thuật bên cạnh |
| Hero dài, nhiều claim vật liệu/độ mịn và bốn ô thông tin | Nội dung cạnh tranh với sản phẩm | Heading hai dòng, mô tả ngắn, một CTA chính; thông tin phụ chuyển thành một dòng |
| Homepage lặp 8 sản phẩm tuyển chọn rồi toàn bộ catalog kèm năm spotlight | Trang rất dài và nhiều sản phẩm xuất hiện lặp | Một catalog duy nhất, ban đầu 8 mẫu, tải thêm 8 mẫu mỗi lần |
| Card nhiều chữ nhỏ, nhãn và shadow | Khó so sánh hàng | Ảnh vuông, tên hai dòng, màu, giá và hành động rõ; thông số chi tiết vẫn trong modal |
| Không có sắp xếp giá dù catalog lớn | Khách phải xem nhiều mới tìm được món vừa ngân sách | Thêm tăng/giảm giá theo dữ liệu catalog thật |
| CTA mở chi tiết phụ thuộc click article | Khó sử dụng bằng bàn phím | Khung ảnh là button có accessible name; tiếp tục dùng modal có sẵn |
| Menu di động chưa công bố trạng thái mở/đóng | Trợ năng thiếu phản hồi trạng thái | `aria-expanded`, nhãn thay đổi, Escape đóng và trả focus |
| Copy Tra đơn hứa thời gian thực trong khi có luồng bản nháp cục bộ | Kỳ vọng không khớp khả năng hiện tại | Nêu đúng giới hạn bản nháp trên trình duyệt, mẫu thử ghi rõ minh họa |

## Cấu trúc hiện tại sau sửa

1. Thông báo ngắn + header.
2. Hero với ảnh thật từ catalog và ba lựa chọn sản phẩm có sẵn.
3. Lối vào danh mục theo nhu cầu.
4. Bộ sưu tập: tìm kiếm, lọc, sort, 8 sản phẩm ban đầu và Xem thêm.
5. Khối giới thiệu cá nhân hóa gọn, có lối vào tính năng.
6. Quy trình 4 bước từ chọn sản phẩm đến giao hàng.
7. FAQ và footer hỗ trợ.

Navigation desktop: Cửa hàng / Cá nhân hóa / Cảm hứng / Tra đơn / Hỗ trợ. Mobile giữ dock 5 mục và menu để vào Cá nhân hóa. Không bỏ SKU khỏi catalog; mọi sản phẩm active vẫn truy cập được qua Xem thêm, danh mục và tìm kiếm.

## Quyết định thị giác

- Một theme sáng, có chuyển đổi an toàn cho người còn lưu lựa chọn tối trong localStorage.
- Accent `#AD492A`, nền `#FAF9F6`, chữ `#252820`; focus viền rõ và màu trạng thái tách khỏi màu trang trí.
- Giảm border/shadow, bỏ các badge không cần thiết trên hero/card bán hàng.
- Card không nhảy/tilt; chỉ zoom ảnh nhẹ khi hover. Reduced motion tắt motion không thiết yếu.
- Hai cột sản phẩm mobile, ba cột màn vừa, bốn cột desktop; header chuyển sang menu trước khi navigation bị chật.
- Các nút thêm giỏ ở mobile có vùng chạm 44px; ảnh sản phẩm có button truy cập bằng bàn phím.

## Kiểm chứng

Baseline: 5 bộ test có sẵn đều đạt trước thay đổi. Sau sửa, một test cũ đòi năm spotlight được cập nhật sang hành vi catalog gọn: 8 SKU riêng biệt, link Xem thêm và reset danh mục khi trở về cửa hàng. Các kiểm thử về giá, giỏ, dữ liệu, XSS và cá nhân hóa được giữ.

- `test_behavior.js`: 15/15.
- `test_audit_regressions.js`: 19/19 với contract catalog mới.
- `test_audit_r2_verification.js`: 5/5.
- `test_hero_showcase_regression.js`: 7/7.
- `test_precision_craft_features.js`: 11/11.
- Build artifact tĩnh: biên dịch Tailwind và đóng gói, chứa stylesheet mới.
- Browser: catalog ban đầu 8, Xem thêm 16, tất cả SKU active truy cập được không trùng, sort tăng giá, lọc đúng nhóm, tìm không dấu, empty state/recovery, mở modal chi tiết.
- Browser: navigation các màn Cá nhân hóa/Cảm hứng/Tra đơn/Hỗ trợ; menu mobile có expanded state và Escape trả focus.
- Không tràn ngang cấp document ở 375/768/1280/1920px trong trạng thái cửa hàng được kiểm tra. Không coi đó là chứng minh mọi thành phần/mọi trạng thái đều đạt.

Số đo chiều cao trang sau sửa trong phiên kiểm tra: khoảng 5.350px ở 375px; 4.470px ở 768px; 3.750px ở 1280px; 3.760px ở 1920px. Đây là số đo layout, không phải thời gian tải hay điểm hiệu năng.

## Giới hạn và việc cần tiếp tục

- Không gửi đơn thật, không nhắn Zalo, không thay đổi giá/chính sách hoặc phát hành lên GitHub.
- Tra đơn cục bộ chưa thay thế hệ thống đơn dùng chung giữa khách và xưởng. Cần backend/auth/quy trình vận hành riêng nếu muốn tiến độ thật cross-device.
- Chưa đo Core Web Vitals field, chưa chạy audit screen reader toàn diện; không cấp chứng nhận WCAG từ các kiểm tra trên.
- Nội dung hỗ trợ có các cam kết vật liệu/chống nước/chính sách cần chủ xưởng xác nhận. Lần này không tự thay đổi điều khoản kinh doanh.
- Những tệp nguồn đã sửa trước lần làm này được giữ và sao lưu trước khi ghi bản cải tiến. Không reset hoặc ghi đè các module ngoài phạm vi đã liệt kê.

## Tệp thay đổi

- `index.html`: cấu trúc, copy, navigation và liên kết stylesheet.
- `css/minimal.css`: lớp thiết kế scoped cho storefront, không áp vào admin.
- `js/app.js`: theme sáng thống nhất, nhãn hero ngắn, trạng thái menu/trợ năng.
- `js/products-manager.js`: catalog tải thêm, sort và button mở chi tiết.
- `tests/test_audit_regressions.js`: contract catalog mới.
- `css/tailwind.css`, `dist/`: tài nguyên sinh bởi pipeline build hiện có.

Ảnh đối chiếu và log kiểm tra được lưu cùng hồ sơ triển khai; các file backup nằm trong thư mục báo cáo của dự án sau khi áp dụng.
