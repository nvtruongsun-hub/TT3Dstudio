# Thẩm định và cải tiến trải nghiệm T&T 3D Labs — 30/10/2026

## Phạm vi

Rà soát storefront HTML/CSS/JavaScript đang phát hành; kiểm tra trực tiếp bằng Chrome headless trên Windows. Bản Next.js trong `src/` không phải entrypoint của gói phát hành theo README nên không thay đổi trong đợt này.

Điểm bắt đầu: HEAD `1471cf7`. Trong quá trình làm việc repo có thêm cập nhật từ tiến trình khác; bộ kiểm tra đã được điều chỉnh theo giao diện hiện hành ở HEAD `4c63831`, cùng các thay đổi cục bộ bổ sung. Không hoàn nguyên những cập nhật đó.

## Các phát hiện và thay đổi

| Hiện tượng quan sát | Nguồn / hệ quả | Xử lý |
| --- | --- | --- |
| Dock trên điện thoại xếp thành cột, che phần lớn cuối màn hình | Layout phụ thuộc utility chưa có trong CSS đã biên dịch; điều hướng cản xem sản phẩm | Khai báo grid 5 cột ngay trong component; đồng bộ breakpoint với menu trên; bỏ nút giỏ hàng nổi trùng chức năng với header |
| Nút ảnh lớn vẫn cho hai cột | `css/style.css` ép cả `large` và `compact` bằng `!important` | Gỡ các quy tắc ép layout cũ; để từng chế độ có số cột riêng; mặc định lưới gọn và giữ lựa chọn đã lưu |
| Nút trong khối sản phẩm tuyển chọn không mở cấu hình | Event delegation chỉ gắn vào catalog | Dùng chung bộ xử lý cho các container sản phẩm có mặt; không cần khôi phục khối tuyển chọn khi nó đã được bỏ trong cập nhật repo mới |
| Nhiều thông điệp kỹ thuật chạy liên tục ở đầu trang | Phân tán chú ý, lặp nội dung, chiếm chiều cao | Thay marquee bằng dải thông tin mua hàng đứng yên; làm lại hero, ảnh và CTA; đưa catalog đến sớm hơn |
| Badge kỹ thuật được suy ra từ danh mục | Có thể gán chung thông số cho các sản phẩm khác nhau | Dùng nhãn mô tả trung tính “Chế tác theo mẫu”, giữ nhãn NFC cho sản phẩm phù hợp |
| Catalog trống trong lúc khởi tạo | Người dùng không phân biệt đang tải và không có kết quả | Thêm trạng thái tải có `role=status`, `aria-busy`; tách trạng thái danh sách rỗng với tìm kiếm không khớp; cung cấp tải lại có kiểm soát |
| Tìm kiếm, danh mục con và sắp xếp cần nhiều thao tác để quay về ban đầu | Khó hiểu vì sao chỉ còn vài sản phẩm | Thêm “Đặt lại bộ lọc”, đồng bộ tìm kiếm, danh mục, sắp xếp và URL |
| Nút sản phẩm trên mobile chỉ còn mũi tên; sticky filter có offset thấp hơn navbar | Hành động thiếu rõ ràng và bộ lọc có thể chồng lên thanh trên | Hiển thị “Xem mẫu” ở mọi kích thước, thêm tên truy cập theo sản phẩm và đồng bộ offset bộ lọc 72/66/62 px |

## Hướng trình bày và chuyển động

- Giữ nhận diện T&T và ảnh sản phẩm hiện có; dùng bảng màu studio sáng, chữ rõ, khoảng cách thống nhất và CTA có thứ bậc.
- Thay nội dung hero thành “Thiết kế có gu. Dấu ấn của bạn.”; ảnh giới thiệu lớn, giá đọc từ catalog.
- Danh mục sử dụng nút HTML thật, thao tác được bằng Tab/Enter.
- Tự chuyển ba sản phẩm hero mỗi 7 giây; có chỉ báo thứ tự và nút tạm dừng. Chọn thủ công sẽ dừng tự chuyển. Không đổi focus người dùng.
- Dừng chu kỳ khi hero ra khỏi vùng nhìn, chuyển workspace, trang nền hoặc đang tương tác với showcase.
- Reveal khi cuộn và hover nhẹ dùng CSS/IntersectionObserver; không thêm thư viện hiệu ứng.
- Tôn trọng `prefers-reduced-motion`, kể cả khi người dùng thay đổi cài đặt trong lúc mở trang.

## Bằng chứng kiểm tra

- `node tests/test_behavior.js`: 15/15.
- `node tests/test_audit_regressions.js`: 19/19.
- `node tests/test_hero_showcase_regression.js`: 7/7 (contract/markup hiện có).
- `node tests/test_world_class_storefront.js`: 8/8; cập nhật các kỳ vọng marquee cũ sang thông tin tĩnh và kiểm soát hiệu ứng.
- `reports/ux-refresh-2026-10-30/verify.cjs`: 15/15 kịch bản trình duyệt. Kết quả chi tiết trong `verification.json`.
- Browser checks: tìm kiếm, rỗng/xóa tìm kiếm, sắp xếp giá, danh mục bằng Enter, đặt lại bộ lọc, cấu hình và thêm giỏ, menu mobile, hai kiểu xem ảnh, giảm chuyển động, tự chuyển/dừng và phục hồi catalog sau lỗi tải.
- Responsive: 320, 390, 768 và 1440 px; không tràn ngang ở những kích thước đã kiểm; header không vượt 80 px, dock không vượt 74 px trong kịch bản kiểm.
- Parse CSS thành công bằng PostCSS và kiểm tra cú pháp các JS đã chỉnh.
- `node scripts/build-static-artifact.js`: đã thực hiện; gói runtime tại `dist/` có manifest SHA-256.

Các kiểm tra giỏ hàng chỉ thêm dữ liệu trong browser context thử nghiệm; không xác nhận checkout, không tạo đơn thật hay gửi tin nhắn khách hàng.

## Ảnh và giới hạn

- `before-desktop.png`, `before-mobile.png`: màn hình ban đầu.
- `final-desktop.png`, `final-mobile.png`: ảnh chụp phiên bản mới nhất.
- `final-mobile-catalog.png`: ảnh catalog mobile sạch sau khi hoàn tất hiệu ứng; `after-mobile-catalog.png` là ảnh trong kịch bản giỏ hàng và có thể còn toast.
- Số liệu DOM trong `final-audit.json`; đây là số đo tại viewport kiểm tra, không phải số liệu người dùng thực.

Đợt này không xác nhận bảo mật toàn bộ backend, quyền truy cập Firestore, thanh toán hoặc việc giao hàng thật. Chưa có dữ liệu analytics sau phát hành để kết luận mức tăng doanh thu/chuyển đổi. Một số ảnh sản phẩm nguồn có chữ hoặc watermark cần bộ ảnh chụp nhất quán hơn ở đợt nội dung tiếp theo.
