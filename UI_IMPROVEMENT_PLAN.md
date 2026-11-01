# KẾ HOẠCH CẢI TIẾN GIAO DIỆN & TRẢI NGHIỆM (UI IMPROVEMENT PLAN)
**Dự án:** T&T 3D Studio  
**Mục tiêu:** Tối ưu hóa toàn diện giao diện, độ tin cậy chức năng, trải nghiệm mobile và khả năng tiếp cận mà không viết lại từ đầu, không tự ý merge/deploy production, tuân thủ nghiêm ngặt quy trình TDD & E2E.  
**Nhánh làm việc:** `feature/smart-address-checkout`  

---

## 1. NGUYÊN TẮC THỰC THI (CORE PRINCIPLES & GUARDRAILS)
1. **Bảo toàn dữ liệu Production:** Tuyệt đối không can thiệp, cập nhật hay xóa dữ liệu trên Supabase Production (`nbsumfhfxohawiuxrwqj`).
2. **Không phá vỡ chức năng cũ:** Mọi thay đổi phải vượt qua 100% các bài test hiện có trong `tests/`.
3. **Quy trình TDD 5 Pha chặt chẽ:** Viết test phát hiện lỗi (ĐỎ) $\rightarrow$ Sửa code logic tối giản $\rightarrow$ Test chuyển XANH $\rightarrow$ Kiểm định Mutation $\rightarrow$ Báo cáo bằng chứng thực tế.
4. **Chia nhỏ từng lát cắt triển khai (Thin Vertical Slices):** Thực hiện tuần tự từng Phase, kiểm tra nghiệm thu từng phần trước khi chuyển sang bước tiếp theo.

---

## 2. LỘ TRÌNH THỰC HIỆN TỪNG PHA (PHASE-BY-PHASE ROADMAP)

### 🔹 GIAI ĐOẠN 1: KHẮC PHỤC CÁC LỖI CHẶN P0 & BẤT NHẤT THƯƠNG HIỆU (PHASE 2 - HOMEPAGE & BRANDING)
- **Mục tiêu:** Loại bỏ hoàn toàn hình ảnh chứa tiếng Trung Quốc, chuẩn hóa nhận diện "T&T 3D Studio", xử lý xung đột thanh dock điều hướng đáy mobile.
- **Các đầu việc cụ thể:**
  1. **Xử lý ảnh Hero Slide 2 (`BUG-P0-01`):**
     - Thay thế hình ảnh của `thumb_1147539.png` (Biển tên chức danh để bàn) bằng ảnh chụp thực tế đồ họa sạch, sắc nét, thể hiện đúng kỹ thuật in 3D FDM sắc sảo với chữ số Việt Nam hoặc phong cách Atelier tối giản.
     - Cập nhật hash trong `assets/manifest.json` và đồng bộ trong `products.json`.
  2. **Chuẩn hóa nhận diện thương hiệu T&T 3D Studio (`BUG-P1-02`):**
     - Cập nhật chữ trong file SVG logo Header `assets/images/logo-premium.svg` và `assets/images/logo-premium-dark.svg` từ `3D LABS` sang `3D STUDIO` (hoặc font chữ atelier hài hòa).
     - Đồng bộ thẻ `<title>`, `<meta description>`, footer copyright và tiêu đề modal trong `index.html` và `admin.html`.
  3. **Xử lý khoảng đệm đáy chống đè lấp trên Mobile (`BUG-P1-03`):**
     - Bổ sung lớp tiện ích `pb-24 sm:pb-12` cho các khối workspace và chân trang (`footer`), kết hợp `env(safe-area-inset-bottom)` để thanh dock không bao giờ che khuất nút bấm hoặc thông tin.
- **Cổng kiểm duyệt (Gate 1):**
  - Chạy `node tests/test_hero_showcase_regression.js` và `node tests/test_mobile_store_overhaul.js` -> Phải PASS 100%.
  - Chụp ảnh kiểm chứng thực tế không còn chữ tiếng Trung và không bị đè lấp trên 375px/390px.

---

### 🔹 GIAI ĐOẠN 2: SỬA LỖI LOGIC HIỂN THỊ & NÂNG CẤP CATALOG (PHASE 3 - CATALOG & TRACKING)
- **Mục tiêu:** Khắc phục lỗi `[object Object]` trong tra cứu đơn hàng, tối ưu hiển thị lưới sản phẩm và thông số kỹ thuật.
- **Các đầu việc cụ thể:**
  1. **Sửa lỗi `[object Object]` trong kết quả tra cứu (`BUG-P1-01`):**
     - Cập nhật `js/app.js:835`: kiểm tra kiểu dữ liệu của `res.customerAlert`. Nếu là object, trích xuất thuộc tính `.message` hoặc `.text`.
     - Viết bài test kiểm thử tự động kiểm tra cả 3 trường hợp: `customerAlert` là object, là string, hoặc null/undefined.
  2. **Chuẩn hóa khung hình sản phẩm (Image Aspect Ratio):**
     - Đồng bộ hóa lớp bao ảnh trên card sản phẩm dùng `aspect-square object-contain` hoặc `aspect-[4/3] object-cover` với nền `bg-[#F7F6F2]`, đảm bảo mọi ảnh sản phẩm thẳng hàng, ngay ngắn trên mọi kích cỡ màn hình.
  3. **Tối ưu Modal Chi Tiết Sản Phẩm (`#order-modal`):**
     - Tối ưu phân bổ không gian 2 cột trên desktop và phân tầng cuộn mượt mà trên màn hình nhỏ. Đảm bảo bảng chọn màu sắc không bị chìm mất khi mở modal.
- **Cổng kiểm duyệt (Gate 2):**
  - Test tra cứu đơn hàng mẫu `TT3D-DEMO-2026` hiển thị thông điệp tiếng Việt sạch sẽ.
  - Chạy toàn bộ test catalog `node tests/test_catalog_105_contract.js` -> PASS.

---

### 🔹 GIAI ĐOẠN 3: NÂNG CAO TRẢI NGHIỆM MOBILE & TIẾP CẬN (PHASE 4 - MOBILE UX & A11Y)
- **Mục tiêu:** Đưa điểm Lighthouse Accessibility lên $\ge 98/100$, tối ưu hóa tương tác cảm ứng.
- **Các đầu việc cụ thể:**
  1. **Nâng cao tỷ lệ tương phản màu (Color Contrast - WCAG AA):**
     - Tinh chỉnh các biến CSS màu nhấn cam cho văn bản (`--color-accent-text: #B84824` / `#C24E26`) để đạt tỷ lệ tương phản $\ge 4.5:1$ trên nền trắng và nền kem.
     - Nâng màu xám nhạt phụ từ `#94A3B8` lên `#64748B` hoặc `#586057`.
  2. **Khớp nhãn trợ năng Accessible Name:**
     - Đồng bộ `aria-label` cho `#header-account-btn` và `.open-cart-btn`.
     - Thêm thẻ `<label>` ẩn hoặc `aria-label` trực tiếp cho tất cả các trường form input chưa có nhãn.
  3. **Tăng kích thước vùng bấm cảm ứng (Touch Targets):**
     - Đặt chiều cao tối thiểu `min-height: 36px` cho các liên kết danh mục chân trang và các nút tiện ích.
- **Cổng kiểm duyệt (Gate 3):**
  - Chạy lại `lighthouse_audit` trên Chrome DevTools -> Điểm Accessibility đạt $\ge 98/100$, Best Practices 100, SEO 100.

---

### 🔹 GIAI ĐOẠN 4: HỒI QUY BẢO MẬT & KIỂM THỬ E2E TOÀN DIỆN (PHASE 5 & 6 - SECURITY & REGRESSION)
- **Mục tiêu:** Đảm bảo không xảy ra bất kỳ hồi quy nào đối với các tính năng thanh toán, bảo mật môi trường và phân quyền Admin.
- **Các bài test bắt buộc vượt qua:**
  1. `tests/test_env_guard.js` (Chặn kết nối nhầm Production)
  2. `tests/test_smart_address_checkout.js` (Luồng sổ địa chỉ thông minh)
  3. `tests/test_one_page_checkout_e2e.js` (Thanh toán 1 trang khép kín)
  4. `tests/test_staging_mfa_aal2_enforcement.js` (Bảo vệ MFA AAL2 cho Admin/Staff)
  5. `tests/test_browser_checkout_edge_cases.js` (Thao tác biên trên trình duyệt)
- **Cổng kiểm duyệt (Gate 4):**
  - 100% test files chạy PASS không có ngoại lệ.
  - Kiểm tra `git diff` chứng minh không làm rò rỉ bất kỳ secret key nào.

---

### 🔹 GIAI ĐOẠN 5: CHỤP ẢNH ĐỐI CHỨNG & XUẤT BÁO CÁO CUỐI CÙNG (PHASE 7 & 8 - DELIVERABLES)
- **Mục tiêu:** Cung cấp đầy đủ bằng chứng đối chứng Before / After cho người dùng đánh giá trước khi xem xét merge.
- **Các tài liệu xuất xưởng:**
  1. `SCREENSHOT_AFTER/`: Bộ ảnh chụp màn hình sau khi hoàn thiện trên 5 viewport và các modal chức năng.
  2. `FINAL_UI_UX_REPORT.md`: Báo cáo tổng kết đối chiếu từng tiêu chí trước và sau khi tối ưu.
  3. `PERFORMANCE_REPORT.md`: Báo cáo chỉ số Lighthouse, Web Vitals và thời gian phản hồi.
  4. `REGRESSION_TEST_REPORT.md`: Báo cáo nhật ký chạy thực tế của toàn bộ test suite.
