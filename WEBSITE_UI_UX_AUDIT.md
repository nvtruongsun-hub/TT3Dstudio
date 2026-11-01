# BÁO CÁO AUDIT TRỰC TIẾP TOÀN BỘ WEBSITE (LIVE AUDIT REPORT)
**Dự án:** T&T 3D Studio  
**Môi trường kiểm tra:** Live Production Website (`https://nvtruongsun-hub.github.io/TT3Dstudio/`)  
**Công cụ kiểm định:** Chrome DevTools Protocol (CDP WebSocket Port 9222), Lighthouse Engine v12, Node.js E2E Test Suite  
**Ngày thực hiện:** 01/11/2026  
**Chuyên gia phụ trách:** Senior UI/UX Designer, Ecommerce Product Engineer & QA Lead  
**Trạng thái nhánh làm việc:** `feature/smart-address-checkout` (Commit `c60c16f`)  

---

## 1. TỔNG QUAN HỆ THỐNG VÀ PHẠM VI AUDIT
Audit trực tiếp trên môi trường Production đang phục vụ người dùng thực tế, không can thiệp hay xóa dữ liệu khách hàng. Mục tiêu là phát hiện toàn diện mọi điểm nghẽn về giao diện (UI), trải nghiệm (UX), tính đúng đắn chức năng (Functional Bugs), khả năng tiếp cận (Accessibility - a11y), và hiệu năng tải trang trên 5 kích thước viewport chuẩn:
- **Desktop Siêu Rộng:** 1440 × 900 px
- **Tablet Ngang (Landscape):** 1024 × 768 px
- **Tablet Dọc (Portrait):** 768 × 1024 px
- **Mobile Chuẩn (iPhone 12/13/14 Pro):** 390 × 844 px
- **Mobile Màn Hình Nhỏ (iPhone SE / Android Compact):** 375 × 667 px

Tất cả bằng chứng thị giác ban đầu đã được chụp trực tiếp qua Chrome CDP và lưu trữ tại thư mục [SCREENSHOT_BEFORE/](file:///SCREENSHOT_BEFORE).

---

## 2. KẾT QUẢ AUDIT CHI TIẾT 11 KHU VỰC CHỨC NĂNG CỐT LÕI

### 2.1. Trang Chủ & Hero Showcase (`#hero`)
- **Trạng thái:** ⚠️ **NGUY HIỂM (P0 Visual Bug)**
- **Bằng chứng:** [01_desktop_1440px_hero.png](file:///SCREENSHOT_BEFORE/01_desktop_1440px_hero.png), [05_mobile_390px_hero.png](file:///SCREENSHOT_BEFORE/05_mobile_390px_hero.png), [06_mobile_375px_hero.png](file:///SCREENSHOT_BEFORE/06_mobile_375px_hero.png)
- **Vấn đề phát hiện:**
  1. **Hình ảnh chứa tiếng Trung Quốc thô từ xưởng bên ngoài (P0):** Slide thứ 2 trong Hero Spotlight (`mw-cn-1147539` - Biển Tên Để Bàn) sử dụng ảnh thumbnail gốc (`assets/images/products/thumb_1147539.png`) chứa banner quảng cáo tiếng Trung: *"更多好物，尽在主页"*, *"网抑云冰箱贴（可修改）"*, *"后来我们什么都有了 却没有了我们"*, *"告诉老默，我想吃鱼了"*. Điều này phá vỡ hoàn toàn định vị xưởng chế tác thủ công Việt Nam cao cấp.
  2. **Bất nhất thương hiệu Header Logo (P1):** Logo SVG trên Header (`assets/images/logo-premium.svg`) và thẻ `<title>` hiển thị **"T&T 3D LABS"** thay vì thương hiệu chính thức **"T&T 3D STUDIO"**.
  3. **Độ tương phản màu văn bản (Color Contrast - a11y):** Nút tab Hero inactive (`#hero-tab-1147539`, `#hero-tab-2235027`) và nhãn phụ đạt tỷ lệ tương phản chỉ `3.27:1` (chưa đạt chuẩn WCAG AA `4.5:1`).

### 2.2. Danh Mục Sản Phẩm & Bộ Lọc (`#store`)
- **Trạng thái:** ⚠️ **CẦN TỐI ƯU (P2 UX)**
- **Bằng chứng:** [02_desktop_1440px_catalog.png](file:///SCREENSHOT_BEFORE/02_desktop_1440px_catalog.png), [06_catalog_grid_1440px.png](file:///SCREENSHOT_BEFORE/06_catalog_grid_1440px.png)
- **Vấn đề phát hiện:**
  1. **Tỷ lệ khung hình card sản phẩm (Card Aspect Ratio):** Các ảnh sản phẩm tải từ catalog có độ phân giải gốc không đồng đều (một số ảnh vuông 1:1, một số ảnh 4:3), dẫn đến khoảng đệm trắng không cân xứng giữa các card cạnh nhau trên lưới 4 cột.
  2. **Pills chuyển danh mục:** Trên màn hình mobile (375px & 390px), danh sách Category Pills cuộn ngang mượt nhưng thiếu chỉ báo mờ dần hai mép (scroll shadow mask), khiến người dùng mới khó nhận ra còn danh mục bị khuất bên phải.

### 2.3. Tìm Kiếm & Bộ Lọc Đa Năng
- **Trạng thái:** ✅ **HOẠT ĐỘNG TỐT**
- **Đánh giá:** Bộ lọc tìm kiếm nhanh hỗ trợ tiếng Việt không dấu và có dấu (`fuse.js` / regex normalize). Tuy nhiên input tìm kiếm thiếu thuộc tính `aria-label` độc lập khi không có `<label>` hiển thị tường minh, bị Lighthouse cảnh báo.

### 2.4. Modal Chi Tiết Sản Phẩm (`#order-modal`)
- **Trạng thái:** ⚠️ **CẦN SỬA LỖI TRÀN BỘ CỤC (P2 Layout)**
- **Bằng chứng:** [07_desktop_product_modal.png](file:///SCREENSHOT_BEFORE/07_desktop_product_modal.png)
- **Vấn đề phát hiện:**
  1. **Tràn dọc trên màn hình chiều cao thấp (≤ 800px):** Modal body chứa rất nhiều thông tin (Tiêu đề, Giá, Mô tả, Hướng dẫn sử dụng, Bảng thông số, 10 Bảng màu nhám/lụa, Vật liệu, Ô khắc tên custom, Bộ tăng giảm số lượng). Trên laptop nhỏ hoặc mobile khi bật bàn phím ảo, khu vực chọn màu sắc (`#order-swatches-box`) bị đẩy xuống dưới nếp gấp màn hình, buộc người dùng phải cuộn sâu mới thấy nút hành động.
  2. **Tiêu đề modal còn lưu tên cũ:** Header của modal ghi "T&T 3D Labs · Chi tiết sản phẩm" thay vì "T&T 3D Studio".

### 2.5. Giỏ Hàng Trượt (Cart Slide-Over Drawer)
- **Trạng thái:** ✅ **HOẠT ĐỘNG ỔN ĐỊNH**
- **Bằng chứng:** [08_desktop_cart_drawer.png](file:///SCREENSHOT_BEFORE/08_desktop_cart_drawer.png)
- **Đánh giá:** Giỏ hàng hiển thị đúng danh sách sản phẩm, số lượng, phân loại màu sắc đã chọn, tính toán tổng tiền chính xác, có thanh chỉ báo Freeship 300K trực quan. Badge số lượng trên nút giỏ hàng nổi bật.

### 2.6. Xác Thực Tài Khoản & Đăng Nhập (`#account-modal`)
- **Trạng thái:** ✅ **BẢO MẬT & ĐÃ BẢO VỆ PRODUCTION**
- **Bằng chứng:** [09_desktop_checkout_or_auth.png](file:///SCREENSHOT_BEFORE/09_desktop_checkout_or_auth.png)
- **Đánh giá:** Khi bấm "Thanh toán ngay" mà chưa đăng nhập, hệ thống lập tức chặn lại và mở Modal Đăng nhập/Đăng ký đúng quy tắc nghiệp vụ nghiêm ngặt: *Bắt buộc đăng nhập & xác thực email mới được đặt hàng*.
- **Vấn đề nhỏ:** Console ghi nhận cảnh báo trình duyệt: input mật khẩu chưa nằm trọn vẹn trong thẻ `<form>` ngữ nghĩa và thiếu thuộc tính `autocomplete="current-password"`.

### 2.7. Hồ Sơ Khách Hàng (Customer Profile)
- **Trạng thái:** ✅ **HOẠT ĐỘNG TỐT**
- **Đánh giá:** Hiển thị thông tin email, trạng thái xác thực email (`email_confirmed_at`), danh sách đơn hàng đã đặt và cho phép đăng xuất an toàn.

### 2.8. Sổ Địa Chỉ Thông Minh (Smart Address Book)
- **Trạng thái:** ✅ **HOẠT ĐỘNG TỐT TRÊN BACKEND**
- **Đánh giá:** Hỗ trợ đầy đủ địa giới hành chính 2 cấp Việt Nam mới nhất (Tỉnh/Thành phố & Quận/Huyện/Thị xã). Hỗ trợ gắn nhãn (Nhà riêng, Cơ quan, Khác) và chọn địa chỉ mặc định. Dữ liệu được bảo vệ nghiêm ngặt bằng Row Level Security (RLS) của Supabase.

### 2.9. Trang Thanh Toán (One-Page Checkout)
- **Trạng thái:** ✅ **ĐÚNG THIẾT KẾ & BẢO VỆ CHẶT CHẼ**
- **Đánh giá:** Trang checkout một trang duy nhất gom đủ 7 khu vực: Địa chỉ nhận hàng, Tóm tắt sản phẩm, Mã giảm giá, Phí vận chuyển, Phương thức thanh toán, Tổng thanh toán, Nút "Đặt hàng ngay". Giá được tính toán lại 100% tại database RPC `create_order`, miễn nhiễm hoàn toàn với can thiệp giá từ client.

### 2.10. Theo Dõi Đơn Hàng & Trạng Thái Xưởng (`#view-tracking`)
- **Trạng thái:** 🚨 **LỖI HIỂN THỊ DỮ LIỆU NGHIÊM TRỌNG (P1 DOM Bug)**
- **Bằng chứng:** [10_desktop_tracking_view.png](file:///SCREENSHOT_BEFORE/10_desktop_tracking_view.png), [11_desktop_tracking_result.png](file:///SCREENSHOT_BEFORE/11_desktop_tracking_result.png)
- **Vấn đề phát hiện:**
  - Khi tra cứu đơn hàng có cảnh báo xưởng (ví dụ đơn mẫu `TT3D-DEMO-2026`), banner thông báo màu vàng hiển thị chuỗi ký tự lỗi:
    `⚠️ Cần bạn xác nhận: [object Object]`
  - **Nguyên nhân gốc rễ:** Trong `js/app.js:835`, đối tượng `res.customerAlert` (chứa `{ message: '...' }`) được đưa trực tiếp vào chuỗi template literal `${escapeHtmlApp(res.customerAlert)}` mà không trích xuất thuộc tính `.message`.

### 2.11. Cổng Quản Trị Xưởng (Admin & Staff Studio OS)
- **Trạng thái:** ✅ **ĐÃ TĂNG CƯỜNG BẢO MẬT AAL2**
- **Đánh giá:** Toàn bộ thao tác cập nhật đơn hàng nhạy cảm trên backend đã được khóa cứng bằng Supabase MFA AAL2 (`aal_level = 'aal2'`) và mã phục hồi dự phòng một lần theo đúng bản vá commit `c60c16f`.

---

## 3. AUDIT ĐA THIẾT BỊ & ĐỘ TƯƠNG THÍCH MÀN HÌNH (RESPONSIVENESS)

| Viewport | Kích thước | Trạng thái hiển thị | Vấn đề phát hiện |
| :--- | :--- | :--- | :--- |
| **Desktop Wide** | 1440 × 900 px | Rất tốt | Độ tương phản màu cam `#FF5C00` trên nền trắng chỉ đạt `3.92:1`. |
| **Tablet Landscape** | 1024 × 768 px | Tốt | Thanh Header nổi co giãn hợp lý, bố cục lưới chuyển 3 cột cân đối. |
| **Tablet Portrait** | 768 × 1024 px | Tốt | Hero chuyển sang xếp chồng 1 cột, không bị vỡ layout. |
| **Mobile Standard** | 390 × 844 px | ⚠️ Có xung đột đè lớp | Thanh điều hướng dưới đáy (`.mobile-bottom-dock`) đè lấp nội dung chân trang và phần chân thẻ Hero slider. |
| **Mobile Compact** | 375 × 667 px | ⚠️ Có xung đột đè lớp | Giống 390px; chữ trên nút CTA và thanh điều hướng đáy sát mép màn hình. |

---

## 4. KẾT QUẢ KIỂM TOÁN HIỆU NĂNG & LIGHTHOUSE THỰC TẾ

*(Dữ liệu đo đạc trực tiếp bằng Lighthouse Engine v12 trên Google Chrome Remote Debugging)*

```
══════════════════════════════════════════════════════════
               KẾT QUẢ LIGHTHOUSE TRỰC TIẾP
══════════════════════════════════════════════════════════
  • Best Practices:    100 / 100  (Tối ưu hoàn hảo)
  • SEO:               100 / 100  (Thẻ meta, robots, cấu trúc đầy đủ)
  • Agentic Browsing:  100 / 100  (Semantic tags chuẩn chỉ)
  • Accessibility:      93 - 94 / 100 (Cần khắc phục độ tương phản màu)
══════════════════════════════════════════════════════════
```

### Các mục Accessibility bị trừ điểm:
1. **Color Contrast:** Tỷ lệ tương phản của màu nhấn `#FF5C00` (`#D45B34`) trên nền sáng `#FFFFFF` và `#F7F6F2` đạt từ `3.63:1` đến `3.92:1` (chuẩn WCAG AA tối thiểu là `4.5:1`). Màu chữ phụ xám `#94A3B8` trên `#EFECE6` đạt `2.17:1`.
2. **Label Content Name Mismatch:** Nút `#header-account-btn` có chữ hiển thị "Đăng nhập" nhưng `aria-label="Tài khoản"`; Nút `.open-cart-btn` có số đếm "1" nhưng `aria-label="Giỏ hàng"`.
3. **Touch Target Size:** 3 liên kết ở chân trang (Footer category links) có chiều cao vùng bấm thực tế là `15.2px` (nhỏ hơn chuẩn tối thiểu `24px` của WCAG 2.2).

---

## 5. AUDIT CONSOLE & MẠNG (CONSOLE & NETWORK LOGS)

- **Console Issues:**
  - 4 ô input dạng form chưa có thẻ `<label for="...">` liên kết tương ứng.
  - Cảnh báo input password thiếu bọc `<form>` và thiếu thuộc tính gợi ý `autocomplete`.
  - 1 lỗi `net::ERR_BLOCKED_BY_CLIENT` do extension chặn quảng cáo chặn request thu thập phân tích bên thứ ba (hành vi bình thường của môi trường người dùng).
- **Network Requests:**
  - 113 tài nguyên ảnh, font, script được nạp trơn tru với mã HTTP 200/304, không có ảnh bị lỗi 404 (Broken Image).
  - Web fonts (`JetBrains Mono`, `Plus Jakarta Sans`, `Font Awesome`) được nạp định dạng woff2 hiện đại.
