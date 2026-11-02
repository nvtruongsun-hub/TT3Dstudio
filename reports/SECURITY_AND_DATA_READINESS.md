# BÁO CÁO SẴN SÀNG AN TOÀN BẢO MẬT & DỮ LIỆU (SECURITY & DATA READINESS)
## ĐÁNH GIÁ MA TRẬN PHÂN QUYỀN, PHÒNG THỦ DỮ LIỆU & QUẢN TRỊ BẢN SAO LƯU

**Tài liệu tham chiếu:** `reports/TRANSFORMATION_BASELINE_AUDIT.md` • `FINAL_RELEASE_DECISION.md`  
**Ngày ban hành:** 02/11/2026  
**Chủ trì:** Cybersecurity & Supabase RLS Auditor  

---

## 1. MA TRẬN PHÂN QUYỀN TRÊN 10 BẢNG NGHIỆP VỤ (RLS CRUD MATRIX)

Toàn bộ 10 bảng dữ liệu trong schema `public` đã được bật Row Level Security (RLS) và kiểm thử thực nghiệm trên Supabase Staging:

| Tên bảng | Anonymous (Chưa đăng nhập) | Khách hàng A (Customer A) | Khách hàng B (Customer B) | Nhân viên / Admin (Staff / Admin) |
| :--- | :---: | :---: | :---: | :---: |
| **1. categories** | `SELECT` | `SELECT` | `SELECT` | `ALL (CRUD)` |
| **2. products** | `SELECT` (chỉ active) | `SELECT` (chỉ active) | `SELECT` (chỉ active) | `ALL (CRUD)` |
| **3. coupons** | `SELECT` (chỉ active) | `SELECT` (chỉ active) | `SELECT` (chỉ active) | `ALL (CRUD)` |
| **4. profiles** | `NONE` | `SELECT / UPDATE (Chỉ bản ghi của A)` | `SELECT / UPDATE (Chỉ bản ghi của B)` | `SELECT` tất cả • `UPDATE` có kiểm soát |
| **5. user_roles** | `NONE` | `SELECT (Chỉ xem role của A)` | `SELECT (Chỉ xem role của B)` | `ALL (Chỉ Admin)` |
| **6. customer_addresses** | `NONE` | `CRUD (Chỉ địa chỉ của A)` | `CRUD (Chỉ địa chỉ của B)` | `SELECT` theo đơn |
| **7. orders** | `NONE` | `SELECT (Chỉ đơn của A)` • `INSERT (Qua RPC)` | `SELECT (Chỉ đơn của B)` • `INSERT (Qua RPC)` | `SELECT` tất cả • `UPDATE (Bắt buộc AAL2)` |
| **8. order_items** | `NONE` | `SELECT (Chỉ items thuộc đơn A)` | `SELECT (Chỉ items thuộc đơn B)` | `ALL` |
| **9. order_status_history** | `NONE` | `SELECT (Chỉ lịch sử thuộc đơn A)` | `SELECT (Chỉ lịch sử thuộc đơn B)` | `ALL` |
| **10. audit_logs** | `NONE` | `NONE` | `NONE` | `SELECT (Admin)` • Ghi nhận tự động qua RPC |

---

## 2. KIỂM ĐỊNH PHÒNG THỦ CÁC VÉC-TƠ TẤN CÔNG CHÍNH (THREAT DEFENSE MATRIX)

### 2.1. Tấn công can thiệp giá từ trình duyệt (DevTools Price Tampering)
* **Nguy cơ:** Kẻ xấu can thiệp DOM hoặc sửa biến JavaScript để gửi giá sản phẩm `price: 1000` hoặc sửa `subtotal`.
* **Phòng thủ:** Hàm SQL RPC `create_order` **hoàn toàn bỏ qua trường giá của client**. Database tự truy vấn giá gốc từ bảng `public.products`, tự tính chiết khấu coupon hợp lệ từ bảng `public.coupons`, tự tính phí giao hàng 25K/Freeship 300K và chốt tổng tiền ground-truth.

### 2.2. Tấn công tạo đơn hàng trùng lặp (Duplicate Submission / Replay Attack)
* **Nguy cơ:** Khách hàng click liên tiếp vào nút "Đặt hàng ngay" do mạng chập chờn hoặc cố tình gửi lặp request.
* **Phòng thủ:**
  - Client khóa cờ `isSubmitting = true`, làm mờ nút và hiển thị spinner.
  - Client sinh khóa `idempotency_key` (UUID v4) độc nhất cho mỗi phiên thanh toán.
  - Backend kiểm tra `orders(idempotency_key)`. Nếu đã tồn tại, trả về ngay đơn hàng cũ kèm mã HTTP 200, ngăn chặn hoàn toàn việc tạo 2 bản ghi đơn hàng trong database.

### 2.3. Tấn công vượt quyền cập nhật đơn hàng (AAL1 Bypass Attack)
* **Nguy cơ:** Kẻ xấu đánh cắp được mật khẩu tài khoản Admin, đăng nhập bằng token thường (AAL1) để đổi trạng thái đơn thành "Đã thanh toán" hoặc "Đã giao".
* **Phòng thủ:**
  - RPC `update_order_status_admin` bắt buộc kiểm tra:
    ```sql
    v_aal := COALESCE(auth.jwt() ->> 'aal', 'aal1');
    IF v_aal != 'aal2' THEN
        RETURN jsonb_build_object('ok', false, 'code', 'MFA_REQUIRED', ...);
    END IF;
    ```
  - Policy RLS `orders FOR UPDATE` từ chối mọi lệnh direct `PATCH /orders` nếu JWT chưa đạt `aal2`. Token mật khẩu thông thường bị chặn đứng 100%.

### 2.4. Khắc phục Lỗ hổng MFA Recovery (Edge Function Pattern)
* **Nguy cơ:** Khi Admin mất máy Authenticator, dùng mã dự phòng qua RPC database không thể tự nâng token JWT lên AAL2.
* **Giải pháp đã kiểm chứng (`tests/test_mfa_recovery_aal2_flow.js`):**
  - Xây dựng Edge Function `mfa-recovery-reset`.
  - Khách mang JWT của mình gọi hàm kèm recovery code $\rightarrow$ Edge Function xác thực mã với database $\rightarrow$ Gỡ factor cũ qua `auth.admin.mfa.deleteFactor` $\rightarrow$ Hướng dẫn Admin quét Authenticator mới $\rightarrow$ Vượt qua TOTP challenge $\rightarrow$ Supabase GoTrue cấp JWT AAL2 chính chủ.

---

## 3. BẢNG PHÂN LOẠI DỮ LIỆU THỬ NGHIỆM TRÊN PRODUCTION (DRY-RUN SCAN)

Theo báo cáo chi tiết trong `PRODUCTION_TEST_DATA_DRYRUN.md`:

| Phân loại | Tài khoản người dùng (`auth.users`) | Đơn hàng (`orders`) | Trạng thái bảo vệ |
| :--- | :---: | :---: | :--- |
| **Dữ liệu THẬT (Protected Real Data)** | **3 Tài khoản**<br>• `nvtruong.sun@gmail.com` (Super Admin)<br>• `tt3dstudio.customer@gmail.com`<br>• `congtuvodanh2901@gmail.com` | **1 Đơn hàng**<br>• Mã: `TT3D-2611-6028A`<br>• Khách: `nvtruong.sun@gmail.com`<br>• Giá trị: 164.000 đ | **BẢO VỆ NGUYÊN VẸN 100% (ZERO MUTATION)** |
| **Dữ liệu TEST (Pending Approval)** | **45 Tài khoản**<br>(Thuộc domain `@tt3dstudio.local` và `@tt3dstudio.vn` sinh bởi test suites tự động) | **13 Đơn hàng**<br>(Các đơn hàng thử nghiệm phát sinh trong quá trình kiểm thử tự động) | **CHỜ DUYỆT VĂN BẢN ĐỂ DỌN DẸP (ZERO DELETE)** |

---

## 4. KẾT QUẢ DIỄN TẬP PHỤC HỒI DATABASE (BACKUP & RESTORE REHEARSAL)

Đã diễn tập phục hồi toàn diện file backup `backup_1793514832709.json` vào schema cô lập `backup_restore_verification` trên Supabase Staging:
* **Khôi phục thành công:** 10/10 bảng nghiệp vụ cốt lõi (286 bản ghi).
* **Kiểm tra tính nhất quán:** 0 bản ghi mồ côi (zero orphan records).
* **Kết luận:** Hệ thống sao lưu đạt chuẩn khôi phục thảm họa (Disaster Recovery Ready).
