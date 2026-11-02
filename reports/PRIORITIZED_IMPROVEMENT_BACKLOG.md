# DANH MỤC CẢI TIẾN ƯU TIÊN (PRIORITIZED IMPROVEMENT BACKLOG)
## DỰ ÁN: NÂNG CẤP NỀN TẢNG THƯƠNG MẠI ĐIỆN TỬ & CHẾ TÁC SỐ T&T 3D STUDIO

**Tài liệu tham chiếu:** `reports/TRANSFORMATION_BASELINE_AUDIT.md` • `reports/TARGET_ARCHITECTURE.md`  
**Phương pháp định lượng ưu tiên:** ICE Scoring (Impact × Confidence / Effort) & Ma trận Rủi ro  
**Ngày ban hành:** 02/11/2026  

---

## 1. MA TRẬN PHÂN LOẠI NHIỆM VỤ THEO GIAI ĐOẠN

```
[SPRINT 1 - P0/P1] GIẢI TỎA RÀO CẢN BẢO MẬT & SỬA LỖI CHUYỂN ĐỔI NGAY
  ├── TASK-SEC-01: Kích hoạt TOTP MFA cho Admin Production & Deploy an toàn
  ├── TASK-SEC-02: Hoàn thiện quy trình MFA Recovery (Un-enroll & Lockout rate-limit)
  ├── TASK-CART-01: Sửa lỗi nút "Mua Trọn Bộ" Combo tự động áp dụng giảm giá 10%
  └── TASK-BIZ-01: Đồng bộ 100% địa chỉ xưởng Hà Tĩnh & thương hiệu T&T 3D Studio

[SPRINT 2 - P1/P2] CỔNG DỊCH VỤ CHẾ TÁC IN 3D & FILE CAD
  ├── TASK-FAB-01: Tạo Supabase Storage Bucket 'cad-quotation-uploads' kèm RLS
  ├── TASK-FAB-02: Xây dựng Form Tiếp nhận File CAD / Báo giá in 3D trên Storefront
  └── TASK-FAB-03: Bảng database 'quotation_requests' & RPC quản lý báo giá

[SPRINT 3 - P2] DỌN DẸP MÃ NGUỒN & TỐI ƯU HIỆU NĂNG
  ├── TASK-PERF-01: Gỡ bỏ dead code 'automation-simulator.js' (662 dòng) khỏi index.html
  ├── TASK-PERF-02: Tái cấu trúc 'calculator.js' và lazy-load 3D viewer khi có model
  └── TASK-DATA-01: Thực thi dọn dẹp an toàn 45 test accounts và 13 test orders (sau khi duyệt)

[SPRINT 4 - P2/P3] SEO KỸ THUẬT & TĂNG TRƯỞNG
  ├── TASK-SEO-01: Bổ sung JSON-LD Schema (Product, Organization, LocalBusiness)
  ├── TASK-SEO-02: Tạo sitemap.xml tự động và chuẩn hóa OpenGraph per-product
  └── TASK-GROWTH-01: Tích hợp hệ thống đo lường chuyển đổi sự kiện E-Commerce
```

---

## 2. BẢNG ĐẶC TẢ CHI TIẾT TỪNG NHIỆM VỤ (TASK SPECIFICATIONS)

---

### [TASK-CART-01] Sửa lỗi nút "Mua Trọn Bộ" Combo tự động kích hoạt giảm giá 10%
- **Task ID:** `TASK-CART-01`
- **Mức độ (Severity):** `P2 (High Conversion Impact)`
- **Ưu tiên (Priority):** `SPRINT 1 - TRIỂN KHAI NGAY`
- **Giá trị kinh doanh (Business Value):** Khắc phục tình trạng khách hàng thấy quảng cáo bộ 2 món giảm 10% (412.000 đ) nhưng mở giỏ hàng lại thấy 458.000 đ. Tăng tỷ lệ hoàn tất đơn hàng cho các combo chủ lực.
- **Độ phức tạp (Effort):** `Thấp (1–2 giờ)`
- **Phụ thuộc (Dependencies):** Không có (Độc lập).
- **Files/Modules liên quan:** `index.html` (dòng 740, 808, 876) • `js/cart.js`
- **Acceptance Criteria (Tiêu chuẩn nghiệm thu):**
  1. Khi người dùng bấm nút "Mua Trọn Bộ" tại bất kỳ combo nào trong 3 setup:
     - 2 sản phẩm trong combo được thêm vào giỏ hàng.
     - Giỏ hàng tự động áp dụng mã chiết khấu `TT3D10` hoặc set `currentDiscountPercent = 10`.
     - Ngăn giỏ hàng mở ra hiển thị đúng giá trọn bộ đã giảm (Ví dụ: Setup 1 hiển thị đúng 412.000 đ thay vì 458.000 đ).
  2. Bổ sung thông báo badge "Đã tự động áp dụng ưu đãi Combo 10%" trong giỏ hàng.
- **Kế hoạch kiểm thử (Test Plan):**
  - Viết test suite giả lập tương tác click: Thêm combo 1 $\rightarrow$ Kiểm tra `TTCart.getCartTotal()` $\rightarrow$ Assert tổng tiền sau giảm giá khớp chính xác 412.000 đ.

---

### [TASK-BIZ-01] Đồng bộ 100% địa chỉ xưởng Hà Tĩnh & thương hiệu T&T 3D Studio
- **Task ID:** `TASK-BIZ-01`
- **Mức độ (Severity):** `P1 (Brand & Trust Consistency)`
- **Ưu tiên (Priority):** `SPRINT 1 - TRIỂN KHAI NGAY`
- **Giá trị kinh doanh:** Thống nhất danh tính thương hiệu, xóa bỏ mâu thuẫn vị trí Hà Nội / Hà Tĩnh, củng cố uy tín xưởng chế tác tại địa phương và cam kết giao hàng minh bạch.
- **Độ phức tạp (Effort):** `Thấp (1 giờ)`
- **Phụ thuộc:** Không.
- **Files/Modules liên quan:** `index.html` (dòng 624, 1074, 1301)
- **Acceptance Criteria:**
  1. Thay thế câu chữ trong FAQ (dòng 624): Chuyển *"xưởng Hà Nội"* thành *"Xưởng chế tác tại Thị trấn Cẩm Xuyên, Tỉnh Hà Tĩnh"*. Cập nhật thời gian giao hàng: Nội tỉnh Hà Tĩnh 1 ngày, các tỉnh khác 2–3 ngày qua bưu điện/chuyển phát nhanh.
  2. Đồng bộ phần giới thiệu tại dòng 1074: `<div><strong>Xưởng chế tác:</strong> T&T 3D Studio, Tỉnh Hà Tĩnh</div>`.
  3. Thống nhất tên thương hiệu toàn trang thành: **"T&T 3D Studio"** (loại bỏ hoàn toàn tàn dư của "T&T 3D Labs").
  4. Chuẩn hóa thông số độ dày lớp in: *"Độ mịn lớp in tiêu chuẩn 0.16mm (hỗ trợ 0.08mm siêu mịn cho sản phẩm nghệ thuật)"*.
- **Kế hoạch kiểm thử:**
  - Script quét từ khóa: Xác nhận 0 kết quả cho cụm từ "xưởng Hà Nội" và "T&T 3D Labs" trong `index.html`.

---

### [TASK-PERF-01] Gỡ bỏ Dead Code 'automation-simulator.js' và tối ưu hóa nạp thẻ script
- **Task ID:** `TASK-PERF-01`
- **Mức độ:** `P2 (Performance Optimization)`
- **Ưu tiên:** `SPRINT 1 - TRIỂN KHAI NGAY`
- **Giá trị kinh doanh:** Giảm tải kích thước trang, giảm thời gian phân tích JavaScript (Parse/Compile JS) trên thiết bị di động, cải thiện chỉ số FID/INP.
- **Độ phức tạp (Effort):** `Rất thấp (30 phút)`
- **Phụ thuộc:** Không.
- **Files/Modules liên quan:** `index.html` (dòng 58) • `scripts/build-static-artifact.js`
- **Acceptance Criteria:**
  1. Gỡ bỏ `<script src="js/automation-simulator.js?v=4.1"></script>` khỏi `index.html`.
  2. Cập nhật `REQUIRED_PREFLIGHT_FILES` trong `scripts/build-static-artifact.js` để pipeline build không bị lỗi.
  3. Kiểm tra console trình duyệt: Không có lỗi `ReferenceError` hay `TypeError` nào phát sinh.
- **Kế hoạch kiểm thử:**
  - Chạy `node scripts/build-static-artifact.js` đảm bảo build pass.
  - Chạy toàn bộ test suites hiện hữu không có hồi quy.

---

### [TASK-SEC-02] Hoàn thiện quy trình MFA Recovery (Un-enroll & Rate-limiting Lockout)
- **Task ID:** `TASK-SEC-02`
- **Mức độ:** `P1 (Security Hardening)`
- **Ưu tiên:** `SPRINT 1 - TRIỂN KHAI NGAY`
- **Giá trị kinh doanh:** Cho phép Quản trị viên lấy lại quyền quản trị khi bị mất điện thoại thông qua mã dự phòng một cách tự động, an toàn và chống tấn công dò mã (Brute-Force Protection).
- **Độ phức tạp (Effort):** `Trung bình (3–4 giờ)`
- **Phụ thuộc:** Môi trường Staging Supabase.
- **Files/Modules liên quan:** `supabase/migrations/20261101_mfa_admin_hardening.sql` • `scripts/test_mfa_recovery_audit.js`
- **Acceptance Criteria:**
  1. Bổ sung bảng theo dõi số lần nhập sai `admin_recovery_attempts (user_id, failed_count, locked_until)`.
  2. Nếu nhập sai 5 lần liên tiếp: Khóa chức năng nhập mã trong 15 phút (`LOCKED_TEMPORARILY`).
  3. Khi nhập đúng mã dự phòng: Hàm SQL tự động vô hiệu hóa factor cũ trong `auth.mfa_factors` của người dùng, trả về thông báo và hướng dẫn Admin đăng nhập lại để quét mã QR Authenticator mới (từ đó nhận token AAL2 chính chủ từ GoTrue).
- **Kế hoạch kiểm thử:**
  - Cập nhật test `scripts/test_mfa_recovery_audit.js` để kiểm chứng: Sau khi redeem, Admin quét Authenticator mới $\rightarrow$ Nhận AAL2 $\rightarrow$ Gọi thành công `update_order_status_admin`.

---

### [TASK-FAB-02] Xây dựng Cổng Tiếp nhận File CAD / Báo giá In 3D trên Storefront
- **Task ID:** `TASK-FAB-02`
- **Mức độ:** `P1 (New Capability)`
- **Ưu tiên:** `SPRINT 2`
- **Giá trị kinh doanh:** Mở rộng nguồn thu từ dịch vụ chế tác theo yêu cầu (in linh kiện cơ khí, mẫu thử, quà tặng tùy biến từ file khách gửi), hiện thực hóa năng lực Cốt lõi C.
- **Độ phức tạp (Effort):** `Trung bình - Cao (1–2 ngày)`
- **Phụ thuộc:** `TASK-FAB-01` (Tạo Supabase Storage bucket).
- **Files/Modules liên quan:** `index.html` • `js/quotation-intake.js` • `supabase/migrations/`
- **Acceptance Criteria:**
  1. Khu vực "Gửi File Báo Giá In 3D" xuất hiện trang nhã trên trang chủ hoặc tab riêng.
  2. Khách hàng có thể:
     - Tải lên file `.stl`, `.step`, `.3mf` (kiểm tra dung lượng $\le 50\text{MB}$).
     - Chọn vật liệu mong muốn: Bio-PLA Thẩm mỹ, PETG Chịu nhiệt/Kín nước, Resin SLA Siêu nét, TPU Dẻo.
     - Chọn mật độ in (Infill): 15% Decor, 40% Kỹ thuật, 100% Đặc.
     - Nhập số lượng và thông tin liên hệ (Họ tên, SĐT/Zalo).
  3. Dữ liệu được lưu an toàn vào bảng `public.quotation_requests` và gửi thông báo qua Telegram của Xưởng.
- **Kế hoạch kiểm thử:**
  - Viết test E2E kiểm tra upload file hợp lệ, chặn file thực thi độc hại (`.exe`, `.php`, `.js`), và xác nhận bản ghi trong database.
