# DANH SÁCH LỖI & VẤN ĐỀ TRẢI NGHIỆM (WEBSITE BUG LIST)
**Dự án:** T&T 3D Studio  
**Phân loại mức độ ưu tiên:**
- **P0 (Blocker / Critical):** Lỗi nghiêm trọng phá vỡ thương hiệu hoặc trải nghiệm cốt lõi.
- **P1 (High):** Lỗi logic hiển thị, lỗi render dữ liệu, bất nhất thương hiệu diện rộng, xung đột điều hướng.
- **P2 (Medium / Polish):** Lỗi độ tương phản màu, khả năng tiếp cận (a11y), tràn bố cục màn hình nhỏ.

---

## 1. DANH SÁCH LỖI P0 (CRITICAL / BLOCKERS)

### BUG-P0-01: Ảnh Slide Hero Chứa Banner Quảng Cáo & Chữ Tiếng Trung Quốc Thô
- **Mức độ:** `P0 - Blocker (Visual & Brand Credibility)`
- **Vị trí:** Trang chủ -> Section Hero Showcase -> Slide 02 (`#hero-tab-1147539`)
- **Tệp nguồn liên quan:**
  - `data/baseline_products_v1.json:3942`
  - `products.json:3942`
  - `assets/images/products/thumb_1147539.png`
  - `js/app.js:479`
- **Các bước tái hiện (Steps to Reproduce):**
  1. Mở trang chủ `https://nvtruongsun-hub.github.io/TT3Dstudio/`.
  2. Tại khung "Tác phẩm tiêu biểu từ xưởng", bấm chọn tab thứ hai: "Biển Tên Để Bàn" (hoặc chờ autoplay chuyển slide sau 5 giây).
  3. Quan sát ảnh hiển thị trong khung chế tác.
- **Hiện tượng thực tế (Observed Behavior):**
  Ảnh hiển thị nguyên bản poster quảng cáo nội địa Trung Quốc với các dòng chữ: *"更多好物，尽在主页"*, *"网抑云冰箱贴（可修改）"*, *"后来我们什么都有了 却没有了我们"*, *"告诉老默，我想吃鱼了"*.
- **Kỳ vọng (Expected Behavior):**
  Toàn bộ ảnh đại diện sản phẩm của T&T 3D Studio phải là hình ảnh sản phẩm 3D hoàn thiện chụp studio thực tế, sạch sẽ, không chứa chữ tiếng nước ngoài hay meme quảng cáo của sàn thương mại điện tử Trung Quốc.
- **Nguyên nhân gốc rễ (Root Cause):**
  Tệp ảnh `assets/images/products/thumb_1147539.png` được tải trực tiếp từ trang MakerWorld CN mà chưa qua xử lý làm sạch đồ họa hoặc chưa thay thế bằng ảnh chụp thực tế từ xưởng Hà Tĩnh.
- **Bằng chứng thị giác (Screenshot Evidence):**
  - [05_mobile_390px_hero.png](file:///SCREENSHOT_BEFORE/05_mobile_390px_hero.png)
  - [06_mobile_375px_hero.png](file:///SCREENSHOT_BEFORE/06_mobile_375px_hero.png)
- **Tiêu chuẩn nghiệm thu (Acceptance Criteria):**
  - Thay thế hoặc làm sạch hoàn toàn hình ảnh của `thumb_1147539.png` bằng ảnh chụp thực tế biển tên để bàn in 3D cao cấp.
  - Tuyệt đối không còn bất kỳ chữ tiếng Trung Quốc nào xuất hiện trong Hero Showcase.

---

## 2. DANH SÁCH LỖI P1 (HIGH PRIORITY)

### BUG-P1-01: Lỗi Render `[object Object]` Trong Khung Theo Dõi Đơn Hàng
- **Mức độ:** `P1 - High (DOM Rendering Bug)`
- **Vị trí:** Trang Theo Dõi Đơn Hàng (`#view-tracking`) -> Khung kết quả tra cứu
- **Tệp nguồn liên quan:**
  - `js/app.js:835`
  - `js/order-engine.js:179`
- **Các bước tái hiện (Steps to Reproduce):**
  1. Điều hướng tới tab "Theo Dõi Đơn Hàng" (`#tracking`).
  2. Nhập mã đơn hàng mẫu `TT3D-DEMO-2026` vào ô tra cứu và bấm "Tra cứu ngay".
  3. Quan sát hộp thông báo cảnh báo màu vàng phía trên thanh tiến độ 6 mốc.
- **Hiện tượng thực tế (Observed Behavior):**
  Hộp cảnh báo hiển thị: `⚠️ Cần bạn xác nhận: [object Object]`.
- **Kỳ vọng (Expected Behavior):**
  Hộp cảnh báo phải hiển thị thông điệp văn bản rõ ràng: *"Xưởng cần bạn xác nhận lại mẫu chữ khắc, logo hoặc màu sắc trước khi in."* (hoặc nội dung tin nhắn tương ứng).
- **Nguyên nhân gốc rễ (Root Cause):**
  Trong `js/app.js:835`:
  ```javascript
  alertBox.innerHTML = `<i class="fa-solid fa-bell text-amber-600 mt-0.5 shrink-0"></i><div><strong class="font-bold">Cần bạn xác nhận:</strong> ${escapeHtmlApp(res.customerAlert)}</div>`;
  ```
  `res.customerAlert` là một đối tượng `{ message: '...', ... }`. Khi truyền trực tiếp cả object vào hàm `escapeHtmlApp`, JavaScript thực hiện ép kiểu chuỗi `String(object)` sinh ra `[object Object]`.
- **Bằng chứng thị giác (Screenshot Evidence):**
  - [11_desktop_tracking_result.png](file:///SCREENSHOT_BEFORE/11_desktop_tracking_result.png)
- **Tiêu chuẩn nghiệm thu (Acceptance Criteria):**
  - Trích xuất an toàn `res.customerAlert?.message || res.customerAlert?.text || (typeof res.customerAlert === 'string' ? res.customerAlert : '')`.
  - Hiển thị đúng câu thông báo tiếng Việt, tuyệt đối không bao giờ xuất hiện chuỗi `[object Object]`.

---

### BUG-P1-02: Bất Nhất Thương Hiệu Header Logo ("T&T 3D LABS" vs "T&T 3D STUDIO")
- **Mức độ:** `P1 - High (Brand Identity Inconsistency)`
- **Vị trí:** Header Logo, Footer, Thẻ `<title>`, Modal Tiêu đề
- **Tệp nguồn liên quan:**
  - `assets/images/logo-premium.svg:10`
  - `assets/images/logo-premium-dark.svg:10`
  - `index.html:6, 116, 1099, 1540`
  - `admin.html:6, 36, 79`
- **Các bước tái hiện (Steps to Reproduce):**
  1. Mở bất kỳ trang nào của website.
  2. Quan sát logo vector ở góc trái Header và tiêu đề tab trên thanh trình duyệt.
- **Hiện tượng thực tế (Observed Behavior):**
  Logo vector ghi chữ "3D LABS", tiêu đề trang ghi "T&T 3D Labs", trong khi tên thương hiệu chính thức và tên miền dự án là "T&T 3D Studio".
- **Kỳ vọng (Expected Behavior):**
  Đồng bộ hóa tên nhận diện thương hiệu thành **T&T 3D Studio** trên logo vector SVG, tiêu đề trang và các tài liệu giao diện.
- **Nguyên nhân gốc rễ (Root Cause):**
  Tệp SVG tĩnh `logo-premium.svg` chứa thẻ `<text>3D LABS</text>`.
- **Bằng chứng thị giác (Screenshot Evidence):**
  - [01_desktop_1440px_hero.png](file:///SCREENSHOT_BEFORE/01_desktop_1440px_hero.png)
- **Tiêu chuẩn nghiệm thu (Acceptance Criteria):**
  - Cập nhật logo vector và văn bản thương hiệu thống nhất thành "T&T 3D STUDIO".

---

### BUG-P1-03: Thanh Điều Hướng Đáy Mobile (`.mobile-bottom-dock`) Đè Che Lấp Nội Dung
- **Mức độ:** `P1 - High (Mobile Navigation & Layout Conflict)`
- **Vị trí:** Giao diện mobile (màn hình < 768px: iPhone 390px, 375px)
- **Tệp nguồn liên quan:**
  - `index.html:1165`
  - `css/style.css`
- **Các bước tái hiện (Steps to Reproduce):**
  1. Xem website trên thiết bị di động kích thước 390px hoặc 375px.
  2. Cuộn xuống cuối trang chủ hoặc quan sát khu vực chân card Hero slider.
- **Hiện tượng thực tế (Observed Behavior):**
  Thanh dock cố định (`position: fixed; bottom: 0`) nổi phía trên che mất một phần nút xem chi tiết và giá sản phẩm ở chân Hero, đồng thời che lấp dòng bản quyền và các liên kết chân trang khi cuộn kịch đáy.
- **Kỳ vọng (Expected Behavior):**
  Nội dung chính và chân trang phải có khoảng đệm dự phòng dưới đáy (`padding-bottom` tối thiểu `80px` kèm `env(safe-area-inset-bottom)`) trên thiết bị mobile để người dùng cuộn đến đâu cũng xem trọn vẹn nội dung.
- **Bằng chứng thị giác (Screenshot Evidence):**
  - [05_mobile_390px_hero.png](file:///SCREENSHOT_BEFORE/05_mobile_390px_hero.png)
  - [06_mobile_375px_hero.png](file:///SCREENSHOT_BEFORE/06_mobile_375px_hero.png)
- **Tiêu chuẩn nghiệm thu (Acceptance Criteria):**
  - Bổ sung đệm đáy an toàn trên mobile, không còn hiện tượng thanh dock đè lấp bất kỳ nút bấm hoặc thông tin nào.

---

## 3. DANH SÁCH LỖI P2 (MEDIUM / ACCESSIBILITY & POLISH)

### BUG-P2-01: Độ Tương Phản Màu Chưa Đạt Chuẩn WCAG AA (Lighthouse Accessibility)
- **Mức độ:** `P2 - Medium (Accessibility & Readability)`
- **Vị trí:** Màu chữ nhấn cam `#FF5C00` / `#D45B34` trên nền sáng, chữ xám phụ `#94A3B8`
- **Tệp nguồn liên quan:**
  - `css/minimal.css`
  - `css/style.css`
  - `index.html`
- **Hiện tượng thực tế (Observed Behavior):**
  Tỷ lệ tương phản đo được là `3.63:1` đến `3.92:1` (chuẩn WCAG AA yêu cầu tối thiểu `4.5:1` cho chữ thường và `3.0:1` cho chữ lớn).
- **Kỳ vọng (Expected Behavior):**
  Tinh chỉnh mã màu chữ cam nhấn sang tông đậm hơn một chút (ví dụ `#B84824` hoặc `#C24E26` khi hiển thị trên nền trắng `#FFFFFF` hoặc `#F7F6F2`) để đạt tỷ lệ tương phản $\ge 4.5:1$, giúp điểm Accessibility đạt trên 98/100.
- **Bằng chứng thực tế:**
  Báo cáo Lighthouse Snapshot từ Chrome DevTools: `color-contrast (score: 0, 9 nodes failed)`.

---

### BUG-P2-02: Lệch Nhãn Trợ Năng Form Input & Accessible Name Mismatch
- **Mức độ:** `P2 - Medium (Screen Reader a11y)`
- **Vị trí:** `#header-account-btn`, `.open-cart-btn`, các ô input trong form tra cứu
- **Tệp nguồn liên quan:**
  - `index.html:156, 175`
- **Hiện tượng thực tế (Observed Behavior):**
  Nút tài khoản có chữ "Đăng nhập" nhưng `aria-label="Tài khoản"` làm bộ đọc màn hình đọc sai tên; Nút giỏ hàng có số lượng "1" nhưng `aria-label="Giỏ hàng"`.
- **Kỳ vọng (Expected Behavior):**
  Khớp tên `aria-label` với nội dung văn bản hiển thị theo đúng quy tắc WCAG 2.2 Accessible Name.

---

### BUG-P2-03: Chiều Cao Vùng Bấm Liên Kết Chân Trang Quá Nhỏ (Touch Target Size)
- **Mức độ:** `P2 - Medium (Mobile Usability)`
- **Vị trí:** Các liên kết danh mục ở chân trang (`footer li a`)
- **Hiện tượng thực tế (Observed Behavior):**
  Vùng bấm đo được là `86px × 15.2px`, nhỏ hơn kích thước tối thiểu `24px × 24px` của WCAG.
- **Kỳ vọng (Expected Behavior):**
  Thêm `padding: 6px 0; display: inline-block` cho các liên kết chân trang để đạt kích thước tương tác an toàn trên cảm ứng.
