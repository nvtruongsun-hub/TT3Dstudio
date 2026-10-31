# T&T 3D Labs — Tactile Play / R11 (Vibrant Sắc Màu Rõ Nét)

Thiết kế ngày 30/10/2026. Phát triển trực tiếp từ bản R10 của Tổng Chỉ Huy Kiến Trúc Codex Master Controller (`gpt-6.1-sol`) theo chỉ thị: **"hãy nhìn poster codex mà học hỏi tham vấn, hãy phát triển từ banner của codex để làm rõ nét phần sắc màu hơn"**.

---

## 1. Mục Tiêu Thiết Kế & Cải Tiến Sắc Màu R11

- **Học hỏi & Kế thừa từ Codex R10:**
  * Giữ trọn vẹn bố cục ba đồ chơi bấm phím cơ (Tactile Trio Fidget Toys: Mèo mini, Kem ốc quế, Quả bơ) để lộ switch cơ học, góc nhìn isometric 3/4.
  * Giữ thông điệp thương hiệu tinh tế: *"Bấm vui. Mang theo. / Một chút cá tính. Một niềm vui trong lòng bàn tay."* cùng cam kết *"TỪNG LỚP IN. RIÊNG CHẤT BẠN."*.
  * Giữ khung viền đôi thủ công (contour frame) và bảng giá 4 SKU minh bạch đối chiếu catalog `products.json`.

- **Phát triển sắc màu rõ nét, sống động (Vibrant Sắc Màu):**
  * **Nền giấy sáng Gallery Luminous (`#FAF8F5`):** Thay thế nền xám ngà mờ đục cũ `#f5f0e8` bằng nền giấy mỹ thuật ấm áp, tinh khiết, loại bỏ hoàn toàn cảm giác u tối, ám bụi.
  * **Xử lý màu sắc ảnh chủ đạo (`tactile-trio-vibrant.png`):** Tăng cường độ tươi tắn có chọn lọc (Taro Lavender +32%, Strawberry Cream +28%, Matcha Avocado +30%, Waffle Gold +22%), làm nổi bật các hạt cốm rắc sắc màu và stem switch cơ học xuyên thấu. Áp dụng đường cong tương phản vi mô (S-curve micro-contrast) để giữ nguyên đường vân lớp in FDM và bề mặt nhựa matte tự nhiên.
  * **Điểm nhấn tiêu đề Coral Terracotta (`#D94826`):** Chữ `vui.` đạt tỷ lệ tương phản 4,04:1 trên nền `#FAF8F5`, tạo năng lượng vui tươi và thu hút ánh nhìn từ xa.
  * **Hệ thống chấm màu trang trí (Color Swatch Dots):** Gắn 4 chấm màu tròn tinh tế (`--taro`, `--mint`, `--strawberry`, `--matcha`) cạnh tên 4 sản phẩm ở bảng giá chân trang trên cả hai khổ, tạo cầu nối thị giác trực quan với các khối đồ chơi phía trên.

---

## 2. Thông Số Ảnh Nguồn & Độ Phân Giải Vật Lý (PPI)

- **Ảnh nguồn R10:** `assets/images/poster-r10/tactile-trio.png` ($1536 \times 1024\text{ px}$, SHA-256: `118e1ad9621a8da70159c34e19507d228acc0cc6c7c715bbc33f7ae45c757d47`).
- **Ảnh dẫn xuất R11:** `assets/images/poster-r11/tactile-trio-vibrant.png` ($1536 \times 1024\text{ px}$, SHA-256: `2f5518d6dbc2dfa7f5440ed875103a224194af9fad6118e46da1036407721e7b`).
- **Phương pháp chỉnh:** Xử lý HSV chọn lọc theo dải màu, cân bằng sáng nền về cùng `#FAF8F5`, giữ bóng tiếp xúc mềm và đường cong tương phản vi mô S-curve; không dùng bộ lọc gộp `filter: saturate` trên toàn trang.
- **Mật độ điểm ảnh khi in (Effective PPI):**
  * **Banner 1200 × 600 mm:** Ảnh chiếm chiều rộng 755 mm $\rightarrow$ Mật độ in thực tế đạt **$\approx 51.7\text{ PPI}$** (phù hợp khoảng cách nhìn quầy hàng 1.5 – 3m).
  * **Poster A2 420 × 594 mm:** Ảnh chiếm toàn bộ chiều rộng 420 mm $\rightarrow$ Mật độ in thực tế đạt **$\approx 92.9\text{ PPI}$** (phù hợp khoảng cách nhìn gần 0.5 – 1m).
  * Chữ, viền, logo và mã QR đều là vector gốc, giữ độ sắc nét tuyệt đối ở mọi khoảng cách nhìn.

---

## 3. Danh Mục Giá Niêm Yết & Tính Chân Thực (Honest Transparency)

- Cả hai khổ poster đều hiển thị 4 SKU đại diện, giá đối chiếu chính xác với `products.json`:
  1. **Mèo mini khớp động** (`mw-cn-1433737`): 29.000 ₫
  2. **Clicker cơ học** (`mw-cn-2370777`): 39.000 ₫
  3. **Clicker kem** (`mw-cn-2331892`): 49.000 ₫
  4. **Clicker quả bơ** (`mw-cn-1753199`): 69.000 ₫
- **Ghi chú minh bạch:** Xuất hiện rõ ràng trên cả hai khổ:
  > *"Giá mẫu thực tế trong shop · Hình phía trên là minh họa ý tưởng."*
- Bốn chấm màu cạnh tên sản phẩm đóng vai trò **trang trí nghệ thuật (decorative swatches)** hài hòa với hình ảnh 3D concept; không phải bảng khai báo mã filament thực tế của shop.

---

## 4. Hồ Sơ Bàn Giao & Kết Quả Kiểm Chứng R11

1. **File in ấn chuẩn MediaBox:**
   - `TT3D-banner-1200x600.pdf`: Kích thước đo kiểm $1200.15 \times 600.03\text{ mm}$ (sai số $0.15\text{ mm} \le 0.3\text{ mm}$), đúng 1 trang.
   - `TT3D-poster-A2.pdf`: Kích thước đo kiểm $420.20 \times 594.11\text{ mm}$ (sai số $0.20\text{ mm} \le 0.3\text{ mm}$), đúng 1 trang.
   - *Lưu ý nhà in:* File PDF xuất chưa nhúng bleed/crop marks. Khi in thực tế, vui lòng chọn tỷ lệ 100%, không thêm header/footer mặc định của trình duyệt.
2. **Hình ảnh Render PDF & So sánh trực quan:**
   - `banner-pdf.png`: Render trực tiếp từ PDF Banner ở độ phân giải 1800 × 900 px.
   - `a2-pdf.png`: Render trực tiếp từ PDF A2 ở độ phân giải 1061 × 1500 px.
   - `comparison-banner-r10-r11.png`: Ảnh so sánh trực diện Banner R10 vs R11.
   - `comparison-a2-r10-r11.png`: Ảnh so sánh trực diện A2 R10 vs R11.
3. **Mã QR:**
   - Giải mã trực tiếp từ file render PDF bằng `jsQR`: **100% khớp URL** `https://nvtruongsun-hub.github.io/TT3Dstudio/`.
4. **Kiểm tra hiển thị đa màn hình (Responsive Viewports):**
   - Đạt 100% không tràn ngang tại các mốc 375, 768, 1280 và 1920 px.
5. **Kiểm thử hệ thống:**
   - Bộ test R11 chuyên biệt: `node tests/test_poster_stall_verification.js` $\rightarrow$ **9 / 9 PASS**.
   - Toàn bộ suite hồi quy hệ thống: **18 / 19 PASS** (1 fail có sẵn từ trước, không có bất kỳ regression nào).
