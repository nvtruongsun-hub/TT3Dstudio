# T&T 3D Labs - Digital Fabrication & Aesthetic 3D Studio

Website thương hiệu và nền tảng giới thiệu xưởng chế tác kỹ thuật số trực tuyến dành cho **T&T 3D Labs** (Xưởng Chế Tác & In 3D Kỹ Thuật Số • Smart Living & Aesthetic Physical Crafts).

---

## 🌟 Kiến Trúc & Tính Năng Cốt Lõi

1. **Ngôn Ngữ Thiết Kế "Tactile Industrial Minimalism":**
   - **Bảng màu:** Nền than chì công nghiệp Dark Slate (`#0B0C0E`, `#14171C`), viền mờ phay xước, điểm nhấn độc bản Safety Orange (`#FF5C00`).
   - **Typography kỹ thuật:** Bộ font **Space Grotesk** dành riêng cho tiêu đề, thông số dung sai và giá bán; kết hợp **Plus Jakarta Sans** cho nội dung đọc mượt mà.
   - **Tương tác xúc giác:** Hiệu ứng `tactile lift` 5px và viền mờ cam khói cho Hero Spotlight và Product Cards.

2. **Kiến Trúc Multi-View Workspace 4 Tab Chuyên Biệt:**
   - **`#view-store` (Cửa Hàng & Bộ Sưu Tập):** Catalog 55 sản phẩm chuẩn hóa phân theo 5 danh mục chính với 5 Hero Spotlight nổi bật.
   - **`#view-studio3d` (Studio 3D PBR Viewport):** Khung nhìn 3D tương tác mô phỏng hình dáng và chất liệu vật liệu thời gian thực.
   - **`#view-configurator` (Cổng Yêu Cầu Báo Giá In CAD):** Cho phép chọn file CAD tại máy (`.stl`, `.step`, `.3mf`, `.obj`) và gửi thông số vật liệu để kỹ thuật viên xưởng cắt lớp (slice) trên Bambu Studio báo giá chính xác. Không định giá tự động khi chưa cắt lớp thật.
   - **`#view-standards` (Tiêu Chuẩn Xưởng & Bản Nháp Đơn Hàng):** Công bố quy chuẩn cơ khí, bảng so sánh chất lượng, cam kết bảo hành và Cổng xem lại bản nháp đơn hàng trên thiết bị.

3. **Cổng Xem Bản Nháp Đơn Hàng Cục Bộ (`#order-tracker-portal`):**
   - Hỗ trợ khách hàng tra cứu lại các bản nháp đơn hàng đã lập trên thiết bị theo đúng Mã đơn (`TT3D-XXXX`).
   - **Ranh giới dữ liệu minh bạch:** Dữ liệu lưu trong bộ nhớ trình duyệt của người dùng (Local Draft Storage), không suy diễn tiến độ in máy thực tế khi chưa có backend chuyên dụng.
   - **Bảo vệ dữ liệu:** Áp dụng DOM API an toàn `.textContent` để hiển thị dữ liệu động (tuân thủ nguyên tắc phòng vệ OWASP DOM-based XSS Prevention Cheat Sheet), validate schema chặt chẽ và tự động che giấu thông tin cá nhân (Data Masking `098***8333`).
   - Tích hợp sao chép mã đơn vào Clipboard và mở liên kết Zalo hỗ trợ kỹ thuật viên.

4. **Trình Quản Trị Xưởng Cục Bộ (`admin.html`):**
   - Quản lý 55 sản phẩm, xem danh sách bản nháp đơn hàng trên máy, cấu hình đơn giá nhựa và thông tin hotline.
   - Mã khóa PIN giao diện cục bộ (Mặc định: `2026`). *Lưu ý: Đây là khóa bảo vệ giao diện cục bộ trên trình duyệt, không thay thế hệ thống xác thực an toàn server-side.*

---

## 📁 Cấu Trúc Thư Mục Phát Hành

```
02. T&T 3D studio/
│
├── dist/                       # Thư mục artifact đóng gói HTML tĩnh phục vụ phát hành
│   ├── index.html              # Trang chủ ứng dụng Client-Side SPA
│   ├── admin.html              # Trang quản trị xưởng cục bộ
│   ├── products.json           # Catalog 55 sản phẩm chuẩn hóa
│   ├── artifact-manifest.json  # Bảng băm SHA-256 xác thực toàn vẹn của gói phát hành
│   ├── css/                    # Stylesheet & Design Tokens
│   ├── js/                     # 13 tệp JavaScript module độc lập
│   └── assets/                 # Thư mục hình ảnh & tài nguyên tĩnh
│
├── index.html                  # Mã nguồn giao diện chính 4 Workspace Views
├── admin.html                  # Mã nguồn trang quản trị xưởng cục bộ
├── products.json               # Seed catalog 55 sản phẩm chuẩn hóa (11 item / danh mục)
├── README.md                   # Tài liệu hướng dẫn kỹ thuật & bàn giao
│
├── css/
│   └── style.css               # Hệ thống design tokens, bento grid, tactile cards, mobile dock
│
├── js/
│   ├── config.js               # Cấu hình trung tâm & resolver getZaloPhone() dùng chung
│   ├── app.js                  # Global router hash, tabs, theme toggle, order draft tracker
│   ├── catalog-store.js        # Catalog Store an toàn, journal recovery, immutable cache
│   ├── category-registry.js    # Nguồn sự thật duy nhất cho 5 danh mục chính
│   ├── purchase-config.js      # Bộ dựng đơn hàng chuẩn hóa giá & validation số lượng
│   ├── checkout.js             # Direct Checkout Context, safe draft storage & validator
│   ├── cart.js                 # Slide-over cart controller an toàn
│   ├── products-manager.js     # Render 5 Hero Spotlights & 55 Product Cards
│   ├── calculator.js           # Cổng tiếp nhận yêu cầu báo giá CAD & Zalo
│   └── viewer3d.js             # Three.js 3D Viewport mô phỏng hình học
│
├── tests/                      # Bộ kiểm thử hồi quy & xác minh kiến trúc tự động (71 PASS)
│   ├── test_audit_r2_verification.js
│   ├── test_audit_regressions.js
│   └── test_behavior.js
│
└── assets/
    ├── images/products/        # Toàn bộ 55 ảnh sản phẩm (11 ảnh / danh mục)
    └── manifest.json           # PWA Web App Manifest
```

> **Lưu ý kiến trúc:** Phiên bản phát hành hiện tại vận hành hoàn toàn dưới dạng **Client-Side SPA tĩnh (HTML/CSS/JavaScript thuần)**, độc lập và tải cực nhanh không phụ thuộc server backend nặng nề. Thư mục `src/` (Next.js) là nhánh thử nghiệm kiến trúc tương lai và không nằm trong gói phát hành tĩnh này.

---

## 🛠️ Hướng Dẫn Vận Hành & Đóng Gói

1. **Đóng gói bản phát hành tĩnh (Artifact Build):**
   ```bash
   npm run build:static
   ```
   Lệnh này sẽ tự động thu thập các tệp allowlist vào thư mục `dist/` và sinh bảng băm SHA-256 tại `dist/artifact-manifest.json`.

2. **Khởi chạy ứng dụng:**
   Khuyến nghị phục vụ thư mục `dist/` thông qua một máy chủ HTTP tĩnh:
   ```bash
   # Cách 1: Dùng Node.js npx serve
   npx serve dist

   # Cách 2: Dùng Python HTTP server
   python -m http.server 8080 -d dist
   ```
   Sau đó mở trình duyệt tại `http://localhost:8080` (hoặc cổng tương ứng).

3. **Quản trị xưởng cục bộ:**
   Mở `http://localhost:8080/admin.html`, nhập mã PIN `2026` để mở giao diện quản trị điều chỉnh cấu hình xưởng.

4. **Chạy bộ kiểm thử kiểm định tự động:**
   ```powershell
   node tests/test_audit_r2_verification.js
   node tests/test_audit_regressions.js
   node tests/test_behavior.js
   node reports/architecture-review-2026-10-21-r2/probe-handover.cjs
   powershell -ExecutionPolicy Bypass -File .\test_tab_architecture.ps1
   powershell -ExecutionPolicy Bypass -File .\test_e2e_simulation.ps1
   ```

---
© 2026 **T&T 3D Labs** • Tactile Industrial Minimalism. All rights reserved.
