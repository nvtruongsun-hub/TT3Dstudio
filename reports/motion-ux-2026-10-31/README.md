# Giao diện & chuyển động Atelier — 31/10/2026

## Mục tiêu

Làm mượt thao tác và tăng sức sống cho chuyển động tự động của storefront đang dùng. “Automation” được xử lý theo ngữ cảnh là animation trên giao diện. Điểm bắt đầu: HEAD `fd41cd6`, catalog hiện hành 105 sản phẩm. Giữ các cập nhật poster và công việc khác đang có trong workspace.

## Các thay đổi

- Thêm nền sáng ấm, đường nét vòng cung, chuyển động nhẹ của ảnh và dải quy trình ba bước **Chọn mẫu → Phối màu → Chế tác riêng**. Nội dung quy trình là minh họa, không thể hiện trạng thái sản xuất thực tế.
- Đổi ảnh hero bằng hòa ảnh, giữ ảnh cũ trong lúc ảnh mới xuất hiện; dọn bản sao sau chuyển cảnh. Việc tải ảnh và chống chọn nhầm ảnh khi bấm liên tiếp vẫn do controller hiện có quản lý.
- Đồng bộ nút dừng ở hero và banner. Ghi nhớ lựa chọn dừng khi tải lại trang. Chọn mẫu hoặc màu thủ công sẽ tạm dừng tự chuyển.
- Dừng vòng lặp khi nội dung ra ngoài vùng nhìn, tab ở nền, chuyển workspace hoặc mở chi tiết/giỏ hàng. Phân biệt focus từ bàn phím với thao tác chạm để nút tiếp tục hoạt động đúng trên điện thoại.
- Thêm nền trượt theo danh mục, chuyển vị trí thẻ khi lọc/sắp xếp, mở/đóng bộ lọc có chuyển tiếp, phản hồi khi bấm và chỉnh nhịp hover.
- Làm mượt mở/đóng chi tiết, hủy lần đóng cũ nếu mở lại ngay. Chuyển sang giỏ/checkout giữ focus và khóa cuộn đúng lớp đang mở.
- Tôn trọng `prefers-reduced-motion`, kể cả thay đổi trong lúc đang chạy hiệu ứng. Không thêm thư viện animation.

## Cấu trúc

- `css/interface-motion.css`: thiết kế chuyển động có phạm vi storefront, giao diện quy trình và điều khiển.
- `js/interface-motion.js`: các hàm nhỏ dùng Web Animations API cho danh sách, bộ lọc, modal, hòa ảnh và nút bấm; có nhánh thao tác tức thì khi không hỗ trợ/giảm chuyển động.
- `js/studio-experience.js`: chủ sở hữu trạng thái chạy/dừng chung và vòng lặp hero.
- `js/products-manager.js`, `js/product-experience.js`, `js/app.js`: gọi các hàm chuyển động tại những điểm cập nhật giao diện; giữ dữ liệu sản phẩm và tính tiền trong module hiện có.
- `index.html`, `scripts/build-static-artifact.js`: nạp và đóng gói hai tài nguyên mới.

Hai tệp runtime mới tổng cộng khoảng 18,4 KB trước nén. Chuyển động liên tục dùng CSS; không thêm vòng vẽ canvas hay vòng `requestAnimationFrame` chạy liên tục. Riêng mở bộ lọc chuyển chiều cao trong thời gian ngắn để nội dung bên dưới đi theo panel.

## Kiểm tra thực tế

`verify.cjs`: **18/18 ca đạt** trên Chrome headless:

- Catalog 105 sản phẩm; hiển thị 12 mẫu lượt đầu.
- Chạy/dừng toàn bộ vòng lặp, ghi nhớ lựa chọn, tự chuyển không lấy focus.
- Chọn thủ công và dọn lớp hòa ảnh; dừng hiệu ứng khi cuộn ra ngoài vùng nhìn.
- Bấm bộ lọc nhiều lần liên tiếp; indicator và kết quả theo đúng danh mục.
- Mở/đóng chi tiết, mở lại ngay khi đang đóng, trả focus về đúng mẫu.
- Chọn biến thể và chuyển sang giỏ; giữ đúng màu, focus, khóa cuộn và vị trí quay lại.
- Responsive 320/390/768/1440 px, không tràn ngang trong các ca kiểm.
- Bật giảm chuyển động trong lúc thao tác; kiểm tra tiếp tục bằng thao tác chạm trên mobile và dừng khi có modal phía trước.
- Không có ngoại lệ JavaScript trong luồng desktop kiểm tra.

Các kiểm tra giỏ dùng browser context riêng, không gửi đơn thật. Có một lần kết nối preview bị từ chối trước khi trang tải; kiểm tra lại HTTP thành công rồi chạy lại bộ kiểm tra cuối đạt 18/18.

Kiểm tra cú pháp JavaScript và parse CSS thành công. Build static thành công: **233 tệp**, 33 entrypoint bắt buộc, manifest SHA-256. Đã đối chiếu các tệp runtime chính giữa source và `dist/`, nội dung trùng khớp.

`git diff --check` còn báo ký tự CR cuối dòng ở tệp `products-manager.js`: tệp này đã dùng CRCRLF từ trước chỉnh sửa; giữ kiểu xuống dòng gốc để tránh thay toàn tệp. Các thay đổi logic trong tệp này được giới hạn ở điểm nối chuyển động và quản lý đóng modal.

## Ảnh và giới hạn

Ảnh `before-desktop.png`, `before-mobile.png`, `after-desktop.png`, `after-mobile.png`; số đo trong các tệp `*-measurements.json`. Desktop 1440 px giữ chiều cao hero khoảng 711 px. Mobile 390 px tăng khoảng 68 px để thêm dải quy trình đã thu gọn. Các ảnh tĩnh không mô tả được đầy đủ chuyển động.

Chưa đo FPS trên thiết bị thật hoặc kết quả chuyển đổi sau phát hành. Đây là bản cục bộ tại `http://127.0.0.1:8765/dist/`.
