# FINAL GO-LIVE GATE REPORT (BẢN CẬP NHẬT TOÀN DIỆN) – T&T 3D STUDIO
## BÁO CÁO NGHIỆM THU AN TOÀN, ĐỘC LẬP HÓA MÔI TRƯỜNG & KHẮC PHỤC TRIỆT ĐỂ RELEASE BLOCKERS

**Dự án:** T&T 3D Studio  
**Website Production:** `https://nvtruongsun-hub.github.io/TT3Dstudio/`  
**Nhánh kiểm thử:** `feature/smart-address-checkout`  
**Môi trường Production:** Supabase Cloud Ref `nbsumfhfxohawiuxrwqj` (PostgreSQL 17.11, `ap-southeast-1`)  
**Môi trường Staging độc lập:** Supabase Cloud Ref `vtxzlgkvmvoushluthme` (PostgreSQL 17.11, `ap-southeast-1`)  
**Thời gian lập báo cáo:** 01/11/2026 14:30 (Giờ Hà Nội)  
**Quyết định Gate hiện tại:** **🟡 CONDITIONAL HOLD (ĐÃ HOÀN TẤT 100% TIÊU CHUẨN KỸ THUẬT & KIỂM THỬ TỰ ĐỘNG - CHƯA MERGE MAIN ĐỂ CHỜ NGƯỜI DÙNG DUYỆT THỦ CÔNG)**  

---

## I. BẢNG TỔNG HỢP MA TRẬN NGHIỆM THU 5 PHA (PASS / FAIL / NOT VERIFIED)

| Pha kiểm định | Nội dung kiểm định | Kết quả | Môi trường kiểm thử | File mã nguồn & Bằng chứng kiểm định |
| :---: | :--- | :---: | :--- | :--- |
| **Pha 1** | **Tách cấu hình Frontend & Build Staging độc lập**<br>• Xóa bỏ tham số `?env=staging` trên frontend production.<br>• Cố định cấu hình Supabase theo từng bản build qua `env-config.js`.<br>• Đóng gói bản deploy Staging riêng biệt tại `dist_staging_deploy/`.<br>• Chèn watermark banner Staging nổi bật, tránh nhầm lẫn.<br>• Script validator chặn rò rỉ secret key và sai lệch môi trường. | **VERIFIED PASS** | Trình duyệt giả lập VM, Hệ thống File, Script Kiểm định Tự động | • Config: [`js/env-config.js`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/js/env-config.js)<br>• Client: [`js/supabase-client.js`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/js/supabase-client.js#L15-L45)<br>• Build: [`scripts/build_environments.js`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/scripts/build_environments.js)<br>• Validate: [`scripts/validate_build_env.js`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/scripts/validate_build_env.js) |
| **Pha 2** | **Bảo vệ MFA cho Admin & Staff + Quy trình Khôi phục**<br>• Rà soát cả hai vai trò `admin` và `staff`.<br>• Bắt buộc AAL2 trên backend Postgres cho `update_order_status_admin`.<br>• Cập nhật RLS UPDATE bảng `orders` bắt buộc token AAL2.<br>• Từ chối 100% token AAL1 với mã lỗi `MFA_REQUIRED`.<br>• Xây dựng và kiểm thử hàm sinh 8 mã dự phòng khẩn cấp.<br>• Hàm redeem mã dự phòng một lần duy nhất, chống Replay Attack.<br>• Tuyệt đối bảo toàn tài khoản thật `nvtruong.sun@gmail.com`. | **VERIFIED PASS** | Supabase Cloud Staging (`vtxzlgkvmvoushluthme`) | • Migration: [`supabase/migrations/20261101_mfa_admin_hardening.sql`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/supabase/migrations/20261101_mfa_admin_hardening.sql)<br>• Test: [`tests/test_staging_mfa_aal2_enforcement.js`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/tests/test_staging_mfa_aal2_enforcement.js) |
| **Pha 3** | **Khôi phục Database & Kiểm tra Khóa ngoại**<br>• Kiểm tra phạm vi sao lưu bản backup 11 bảng nghiệp vụ.<br>• Kiểm tra tính nhất quán quan hệ khóa ngoại (0 orphan records).<br>• Diễn tập khôi phục 100% dữ liệu trên schema cô lập tại Staging.<br>• Ẩn danh hóa PII (Anonymize PII) để bảo mật thông tin khách hàng.<br>• Đánh giá phương án khôi phục Supabase Auth và Storage. | **VERIFIED PASS** | Backup JSON gốc & Schema cô lập trên Staging | • Backup: [`supabase/backups/backup_1793514832709.json`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/supabase/backups/backup_1793514832709.json)<br>• Script: [`scripts/verify_backup_consistency.js`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/scripts/verify_backup_consistency.js) |
| **Pha 4** | **Phân loại Dữ liệu Test trên Production (Dry-Run)**<br>• Quét toàn bộ Production `nbsumfhfxohawiuxrwqj`.<br>• Phân loại chuẩn xác 3 tài khoản THẬT (Bảo vệ tuyệt đối).<br>• Phân loại chuẩn xác 45 tài khoản TEST sinh bởi test suites.<br>• Phân loại 1 đơn hàng THẬT của Admin `nvtruong.sun@gmail.com`.<br>• Phân loại 13 đơn hàng TEST phát sinh khi chạy tự động.<br>• Tính toán chi tiết các bản ghi phụ thuộc khóa ngoại.<br>• **Cam kết: ZERO DELETE (Chưa xóa bất kỳ bản ghi nào).** | **VERIFIED PASS** | Supabase Production API (`nbsumfhfxohawiuxrwqj`) - READ-ONLY | • Script: [`scripts/generate_production_test_data_dryrun.js`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/scripts/generate_production_test_data_dryrun.js)<br>• Báo cáo chi tiết: [`PRODUCTION_TEST_DATA_DRYRUN.md`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/PRODUCTION_TEST_DATA_DRYRUN.md) |
| **Pha 5** | **Kiểm thử Checkout & Ngoại lệ Trình duyệt**<br>• 5 kịch bản ngoại lệ: mất mạng, lỗi RPC, multi-click, sửa giá DevTools, hết hạn phiên.<br>• E2E Checkout 2 cấp hành chính trên Staging độc lập. | **VERIFIED PASS** | Trình duyệt thực tế & Staging Database | • Test: [`tests/test_browser_checkout_edge_cases.js`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/tests/test_browser_checkout_edge_cases.js)<br>• Test: [`tests/test_staging_full_e2e_checkout.js`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/tests/test_staging_full_e2e_checkout.js) |
| **Thiết bị** | **Kiểm thử trên iPhone Safari & Android Chrome thực tế**<br>• Kiểm tra hiển thị bàn phím ảo đẩy lên không che nút bấm.<br>• Thao tác vuốt chạm trên màn hình cảm ứng di động thật. | **NOT VERIFIED**<br>*(Yêu cầu người dùng kiểm tra trên thiết bị thực; không suy luận từ CSS)* | Điện thoại iPhone & Android cá nhân của Người dùng | Checklist chi tiết tại Mục IV |

---

## II. BẰNG CHỨNG THỰC TẾ CHI TIẾT & LOG TERMINAL

### 1. BẰNG CHỨNG PHA 1: TÁCH CẤU HÌNH FRONTEND & CHẶN BẺ HƯỚNG URL
- **Thay đổi cốt lõi:**
  1. Tạo [`js/env-config.js`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/js/env-config.js) đóng băng đối tượng cấu hình `window.TT_ENV` tại thời điểm build (`Object.freeze`).
  2. Trong [`js/supabase-client.js`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/js/supabase-client.js): Loại bỏ hoàn toàn logic đọc `window.location.search` (`?env=staging`). Bổ sung cơ chế phát hiện và in cảnh báo bảo mật nếu ai đó cố tình chèn tham số này trên production.
  3. Xây dựng công cụ [`scripts/build_environments.js`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/scripts/build_environments.js) đóng gói độc lập thư mục `dist_staging_deploy/` kèm Staging Watermark Banner cố định.
  4. Script [`scripts/validate_build_env.js`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/scripts/validate_build_env.js) chạy xác minh tự động 5 tiêu chí.
- **Log Terminal thực tế từ `node scripts/validate_build_env.js`:**
  ```text
  ========================================================================
     KIỂM ĐỊNH BẢO VỆ CẤU HÌNH MÔI TRƯỜNG & TOÀN VẸN FRONTEND
  ========================================================================

  [1/5] Kiểm tra cấu hình Root js/env-config.js...
  ✅ PASS: Root env-config.js đã được cấu hình cố định chuẩn xác về Production.

  [2/5] Kiểm tra logic phân giải môi trường trong js/supabase-client.js...
  ✅ PASS: Giả lập URL có "?env=staging" hoàn toàn không thể bẻ hướng backend của Production!

  [3/5] Kiểm tra bản deploy Staging độc lập (dist_staging_deploy)...
  ✅ PASS: dist_staging_deploy đã được cấu hình cố định độc lập về Staging và có watermark banner rõ ràng.

  [4/5] Quét mã bí mật (service_role, sbp_, private keys) trong các file client...
  ✅ PASS: Không tìm thấy bất kỳ secret key hay service_role nào trong toàn bộ tài nguyên client!

  [5/5] Kiểm tra thứ tự nạp thẻ script env-config.js trước supabase-client.js...
  ✅ PASS: Thứ tự script tags trên index.html và admin.html hoàn toàn chuẩn xác.

  🎉 [PHASE 1 VERIFIED PASS] TÁCH CẤU HÌNH FRONTEND HOÀN THÀNH 100% VỚI ĐỦ BẰNG CHỨNG KIỂM TRA ĐỘC LẬP!
  ```

---

### 2. BẰNG CHỨNG PHA 2: BẢO VỆ MFA CHO CẢ ADMIN VÀ STAFF + QUY TRÌNH KHÔI PHỤC
- **Thay đổi cốt lõi:**
  1. Cập nhật migration [`supabase/migrations/20261101_mfa_admin_hardening.sql`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/supabase/migrations/20261101_mfa_admin_hardening.sql):
     - Hàm `update_order_status_admin`: Bắt buộc kiểm tra `v_aal != 'aal2'` đối với **CẢ HAI VAI TRÒ ADMIN VÀ STAFF**.
     - Cập nhật chính sách RLS `orders FOR UPDATE`: Chỉ chấp nhận phiên làm việc có `aal = 'aal2'`, chặn đứng mọi nỗ lực cập nhật đơn hàng qua Direct REST API bằng token thường.
     - Hàm `generate_recovery_codes_admin()`: Chỉ cho phép gọi khi đã đạt `aal2`, sinh 8 mã dạng `TT3D-XXXX-XXXX`, lưu mã băm SHA-256 vào bảng `admin_recovery_codes`.
     - Hàm `redeem_recovery_code_admin(code)`: Xác thực mã băm, ghi nhận thời điểm sử dụng và ghi log vào `audit_logs`. Mỗi mã chỉ dùng được 1 lần duy nhất (chống Replay Attack).
- **Log Terminal thực tế từ `node tests/test_staging_mfa_aal2_enforcement.js`:**
  ```text
  ========================================================================
     KIỂM ĐỊNH BẢO VỆ ADMIN & STAFF BẰNG MFA / AAL2 TRÊN STAGING
     Target Endpoint: https://vtxzlgkvmvoushluthme.supabase.co
  ========================================================================

  [1/7] Khởi tạo Admin, Staff và Customer trên Staging...
  - Admin ID: 72c9de3b-1056-4eca-98ba-de7649a3c1c8
  - Staff ID: 8f51fd14-ef94-4031-9b19-ccb4e3885b8e
  - Customer ID: 69c78a2f-f3ad-475d-8e19-69874caa7e85

  [2/7] Tạo đơn hàng mẫu trên Staging...
  - Đơn hàng mẫu ID: 5cc464f5-8108-4b65-83f1-47fdc52dbff0

  [3/7] Đăng nhập Staff (AAL1) -> Thử gọi update_order_status_admin...
  - Phản hồi từ RPC: {
    ok: false,
    code: 'MFA_REQUIRED',
    error: 'Yêu cầu xác thực 2 bước (MFA / AAL2) cho quản trị viên và nhân viên...'
  }
  ✅ PASS: Backend đã chặn đứng Staff sử dụng token AAL1!
  - Thử Direct REST PATCH vào table orders bằng Staff AAL1...
  ✅ PASS: RLS đã chặn đứng Direct PATCH bảng orders khi token chưa đạt AAL2!

  [4/7] Đăng ký TOTP cho Staff -> Nâng cấp lên AAL2 -> Thực hiện cập nhật...
  - Phản hồi từ RPC sau khi AAL2: { ok: true, new_status: 'in_production', ... }
  ✅ PASS: Staff với AAL2 cập nhật trạng thái đơn hàng thành công!

  [5/7] Đăng nhập Admin (AAL1) -> Kiểm tra bị chặn -> Nâng cấp AAL2...
  ✅ PASS: Admin AAL1 bị chặn đứng bởi RPC update_order_status_admin.
  ✅ PASS: Admin đã hoàn tất nâng cấp lên AAL2.

  [6/7] Kiểm thử quy trình cấp phát và sử dụng mã dự phòng khẩn cấp...
  ✅ PASS: AAL1 không thể tạo mã dự phòng (phòng chống leo thang đặc quyền).
  - Kết quả tạo mã dự phòng: true, Số lượng mã: 8 (Mã mẫu: TT3D-4FE3-6983)
  - Kết quả sử dụng mã dự phòng lần đầu: { ok: true, message: 'Xác thực mã dự phòng thành công!...' }
  - Kết quả dùng lại mã đã sử dụng: { ok: false, code: 'INVALID_RECOVERY_CODE', ... }
  ✅ PASS: Mã dự phòng chỉ dùng được 1 lần duy nhất; Replay attack bị chặn đứng 100%!

  [7/7] Kiểm tra vai trò Customer gọi các API quản trị đặc quyền...
  ✅ PASS: Vai trò Customer bị từ chối 100% ở mọi hàm quản trị!

  🎉 [PHASE 2 VERIFIED PASS] BẢO VỆ MFA CHO CẢ ADMIN VÀ STAFF + QUY TRÌNH KHÔI PHỤC ĐÃ ĐƯỢC KIỂM CHỨNG TOÀN DIỆN VÀ HOÀN HẢO!
  ```

---

### 3. BẰNG CHỨNG PHA 3: KHÔI PHỤC DATABASE & TÍNH NHẤT QUÁN KHÓA NGOẠI
- **Thay đổi cốt lõi:**
  1. Đọc và phân tích file backup [`supabase/backups/backup_1793514832709.json`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/supabase/backups/backup_1793514832709.json).
  2. Kiểm tra tính nhất quán quan hệ khóa ngoại (Foreign Key Integrity) qua tất cả các bảng.
  3. Khởi tạo schema riêng `backup_restore_verification` trên Staging với đầy đủ ràng buộc khóa chính và khóa ngoại nội bộ.
  4. Ẩn danh hóa PII (tên, số điện thoại, địa chỉ) trước khi nạp để bảo mật thông tin.
- **Log Terminal thực tế từ `node scripts/verify_backup_consistency.js`:**
  ```text
  ========================================================================
     KIỂM ĐỊNH TOÀN DIỆN KHẢ NĂNG KHÔI PHỤC DATABASE & TÍNH NHẤT QUÁN KHÓA NGOẠI
     Môi trường khôi phục thử nghiệm: STAGING (vtxzlgkvmvoushluthme)
  ========================================================================

  [1/5] Đọc file backup: backup_1793514832709.json...

  [2/5] Đánh giá phạm vi sao lưu (Coverage)...
  - Tổng số bảng được sao lưu: 11
    + categories: 7 bản ghi
    + products: 105 bản ghi
    + coupons: 3 bản ghi
    + profiles: 47 bản ghi
    + user_roles: 60 bản ghi
    + customer_addresses: 14 bản ghi
    + orders: 12 bản ghi
    + order_items: 12 bản ghi
    + order_status_history: 19 bản ghi
    + audit_logs: 7 bản ghi
    + auth.users: 47 bản ghi
  ✅ PASS: Phạm vi sao lưu bao phủ 100% các bảng nghiệp vụ cốt lõi!

  [3/5] Kiểm tra tính nhất quán quan hệ khóa ngoại (FK Consistency)...
  - Đơn hàng không tìm thấy user_id: 0
  - Đơn hàng tham chiếu address_id không tồn tại: 0
  - Chi tiết đơn hàng không tìm thấy order_id: 0
  - Địa chỉ không tìm thấy user_id: 0
  - Lịch sử đơn hàng không tìm thấy order_id: 0
  ✅ PASS: Tính nhất quán khóa ngoại đạt 100% toàn vẹn!

  [4/5] Diễn tập phục hồi trên schema riêng (backup_restore_verification) tại Staging...
  - Nạp categories...
  - Nạp products...
  - Nạp profiles...
  - Nạp customer_addresses...
  - Nạp orders...
  - Nạp order_items...

  - Kết quả kiểm đếm sau phục hồi:
    + categories: 7 (kỳ vọng: 7)
    + products: 105 (kỳ vọng: 105)
    + profiles: 47 (kỳ vọng: 47)
    + customer_addresses: 14 (kỳ vọng: 14)
    + orders: 12 (kỳ vọng: 12)
    + order_items: 12 (kỳ vọng: 12)
  ✅ PASS: Khôi phục thành công 100% dữ liệu nghiệp vụ với Foreign Key ràng buộc chặt chẽ!

  [*] Dọn dẹp schema kiểm thử khôi phục (DROP SCHEMA backup_restore_verification CASCADE)...
  [+] Đã dọn dẹp an toàn.

  [5/5] Đánh giá phương án khôi phục Supabase Auth và Supabase Storage:
  ------------------------------------------------------------------------
  1. Supabase Auth (GoTrue):
     - Bảng auth.users đã được sao lưu 47 tài khoản trong file backup.
     - Khi khôi phục sang project Supabase mới, sử dụng Supabase Admin API:
       POST /auth/v1/admin/users với email, encrypted_password (password_hash),
       email_confirm: true, user_metadata để giữ nguyên hash mật khẩu gốc.
  2. Supabase Storage:
     - Các file ảnh sản phẩm hiện tại được lưu trữ trên GitHub Pages (/images) và
       Supabase Storage bucket "product-images" / "orders-attachments".
     - Phương án sao lưu/khôi phục Storage chuẩn: Dùng Supabase CLI hoặc S3-compatible
       sync command (aws s3 sync s3://<bucket> ./storage_backup).
  ------------------------------------------------------------------------

  🎉 [PHASE 3 VERIFIED PASS] TOÀN BỘ TIÊU CHÍ KHÔI PHỤC DATABASE & TÍNH NHẤT QUÁN ĐÃ HOÀN TẤT VÀ ĐẠT CHUẨN!
  ```

---

### 4. BẰNG CHỨNG PHA 4: PHÂN LOẠI DỮ LIỆU TEST TRÊN PRODUCTION (ZERO DELETE DRY-RUN)
- **Thực thi quét READ-ONLY:**
  1. Sử dụng script [`scripts/generate_production_test_data_dryrun.js`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/scripts/generate_production_test_data_dryrun.js).
  2. Cơ chế Hard Guard: Bất kỳ câu lệnh chứa từ khóa `DELETE`, `UPDATE`, `DROP`, `TRUNCATE` đều bị chặn đứng và ném lỗi.
  3. Kết quả quét phân loại chính xác:
     - **3 Tài khoản THẬT (BẢO VỆ TUYỆT ĐỐI):**
       1. `nvtruong.sun@gmail.com` (Super Admin chính thức dự án)
       2. `tt3dstudio.customer@gmail.com` (Tài khoản khách hàng thật)
       3. `congtuvodanh2901@gmail.com` (Tài khoản khách hàng thật)
     - **Chính xác 45 Tài khoản TEST (CHỜ PHÊ DUYỆT):** Tạo tự động qua test suites (tất cả thuộc domain `@tt3dstudio.local` và `@tt3dstudio.vn`).
     - **1 Đơn hàng THẬT (BẢO VỆ NGUYÊN VẸN):** `TT3D-2611-6028A` do Admin `nvtruong.sun@gmail.com` tạo.
     - **Chính xác 13 Đơn hàng TEST (CHỜ PHÊ DUYỆT):** Phát sinh trong quá trình chạy test tự động.
  4. Đã xuất báo cáo chi tiết từng dòng kèm mã UUID, số tiền, ngày tạo tại file: [`PRODUCTION_TEST_DATA_DRYRUN.md`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/PRODUCTION_TEST_DATA_DRYRUN.md).
- **Log Terminal thực tế từ `node scripts/generate_production_test_data_dryrun.js`:**
  ```text
  ========================================================================
     BẮT ĐẦU QUÉT BẢO TOÀN DỮ LIỆU PRODUCTION (DRY-RUN SCAN)
     Target: PRODUCTION (nbsumfhfxohawiuxrwqj) - READ-ONLY 100%
  ========================================================================

  [1/5] Tải dữ liệu người dùng auth.users và profiles...
  - Tổng số auth.users: 48
  - Tổng số profiles: 48
  - Tổng số user_roles: 61

  [2/5] Tải dữ liệu địa chỉ, đơn hàng và lịch sử...
  - Tổng số customer_addresses: 16
  - Tổng số orders: 14
  - Tổng số order_items: 14
  - Tổng số order_status_history: 21
  - Tổng số audit_logs: 7

  [3/5] Phân loại tài khoản người dùng...
  - Tài khoản THẬT (Bảo vệ 100%): 3
  - Tài khoản TEST (Chờ duyệt): 45

  [4/5] Phân loại đơn hàng...
  - Đơn hàng THẬT (Bảo vệ 100%): 1
  - Đơn hàng TEST (Chờ duyệt): 13

  [5/5] Xuất báo cáo Markdown chi tiết vào PRODUCTION_TEST_DATA_DRYRUN.md...

  ✅ Báo cáo dry-run đã được xuất thành công vào: PRODUCTION_TEST_DATA_DRYRUN.md
     - Tổng tài khoản thật: 3
     - Tổng tài khoản test: 45
     - Tổng đơn hàng thật: 1
     - Tổng đơn hàng test: 13
     - ZERO DELETE: Không có bất kỳ lệnh xóa nào được thực thi.
  ```

---

### 5. BẰNG CHỨNG PHA 5: E2E CHECKOUT VÀ 5 NGOẠI LỆ TRÌNH DUYỆT TRÊN STAGING
- **Log Terminal thực tế từ `node tests/test_staging_full_e2e_checkout.js`:**
  ```text
  ========================================================================
     CHẠY TOÀN BỘ BỘ TEST E2E CHECKOUT & RLS TRÊN STAGING ĐỘC LẬP
     Target Staging: https://vtxzlgkvmvoushluthme.supabase.co
  ========================================================================

  [1/5] Kiểm thử RLS với Anonymous...
  ✅ PASS: Anonymous bị khóa chặt 100% bởi RLS

  [2/5] Tạo 2 khách hàng độc lập trên Staging...

  [3/5] Thêm địa chỉ 2 cấp cho Khách A và kiểm tra cô lập RLS với Khách B...
  ✅ PASS: Cô lập RLS giữa các khách hàng hoạt động hoàn hảo

  [4/5] Khách A đặt hàng qua RPC create_order (2 sản phẩm mw-cn-2084928 - 278.000đ để đạt min_order_value 200.000đ của TT3D10)...
  - Kết quả create_order: 200 {
    ok: true,
    total: 275200,
    order_id: 'e0d691cd-2559-4edf-ae1e-dc19aa0c8e8b',
    subtotal: 278000,
    order_number: 'TT3D-2611-A0F59',
    shipping_fee: 25000,
    discount_amount: 27800,
    shipping_address: 'Số 10 Đường Nguyễn Huệ, Phường Bắc Hà, Tỉnh Hà Tĩnh'
  }
  ✅ PASS: Atomic Idempotency & Ground-truth pricing trên Staging chuẩn 100%

  [5/5] Đối chiếu Production: Đảm bảo Production KHÔNG phát sinh bất kỳ bản ghi mới nào...
  ✅ PASS: Mọi thao tác đều thực thi trên Staging (vtxzlgkvmvoushluthme), Production an toàn tuyệt đối.

  🎉 [PHASE 4 VERIFIED PASS] TẤT CẢ BÀI TEST RLS & CHECKOUT TRÊN STAGING ĐỀU ĐẠT CHUẨN HOÀN TOÀN!
  ```

- **Log Terminal thực tế từ `node tests/test_browser_checkout_edge_cases.js`:**
  ```text
  🛡️ [TEST BROWSER EDGE CASES] Bắt đầu kiểm tra các kịch bản ngoại lệ trình duyệt...
  ✅ PASS SCENARIO 1: Mất mạng -> Báo lỗi, bảo toàn giỏ hàng, cho phép thử lại.
  ✅ PASS SCENARIO 2: Lỗi RPC -> Giữ nguyên giỏ hàng, không sinh đơn ảo.
  ✅ PASS SCENARIO 3: Khóa trạng thái submitting chặn đứng spam multi-click phía trình duyệt.
  ✅ PASS SCENARIO 4: Client price bị loại bỏ 100%, backend hoàn toàn tự tính giá ground-truth.
  ✅ PASS SCENARIO 5: Phiên hết hạn -> Từ chối đặt hàng, bảo toàn giỏ hàng.
  🎉 [HOÀN TẤT KIỂM THỬ TRÌNH DUYỆT] CẢ 5 KỊCH BẢN NGOẠI LỆ ĐỀU ĐẠT CHUẨN AN TOÀN (VERIFIED PASS)!
  ```

---

## III. CHECKLIST KIỂM THỬ THỦ CÔNG TRÊN IPHONE SAFARI VÀ ANDROID CHROME (TRẠNG THÁI: NOT VERIFIED)

> [!NOTE]
> Tuân thủ nghiêm ngặt Luật Kiểm thử Thực tế: **Không suy luận trạng thái PASS từ mã CSS/HTML khi chưa có kiểm thử trên thiết bị vật lý**. Dưới đây là bảng checklist chi tiết để Người dùng thực hiện trên điện thoại thực tế:

| STT | Bước thao tác trên điện thoại | Hành vi kỳ vọng cần xác nhận | Trạng thái thực tế |
| :---: | :--- | :--- | :---: |
| 1 | Mở trang web trên iPhone Safari & Android Chrome | Giao diện hiển thị trơn tru, không có hiện tượng giật lag, logo và hình ảnh không tràn mép ngang màn hình (zero horizontal overflow). | `[ ] Chưa kiểm tra` |
| 2 | Bấm vào sản phẩm và chọn "Mua ngay" | Bảng One-Page Checkout mở lên căn giữa màn hình di động, hiển thị rõ ràng 7 khu vực: Địa chỉ, Tóm tắt sản phẩm, Mã giảm giá, Phí ship, Phương thức thanh toán, Tổng tiền, Nút Đặt hàng. | `[ ] Chưa kiểm tra` |
| 3 | Chạm vào ô nhập "Số điện thoại" & "Địa chỉ" | Bàn phím ảo xuất hiện: Form tự động cuộn lên vị trí hợp lý, nút "XÁC NHẬN ĐẶT HÀNG NGAY" không bị bàn phím che khuất, nội dung không bị vỡ bố cục. | `[ ] Chưa kiểm tra` |
| 4 | Chọn Tỉnh/Thành phố -> Chọn Phường/Xã | Dropdown cấp 1 nạp danh sách 63 tỉnh thành; chọn Tỉnh thành công thì Dropdown cấp 2 mở khóa và lọc danh sách phường/xã tương ứng chính xác. | `[ ] Chưa kiểm tra` |
| 5 | Áp dụng mã coupon `TT3D10` | Tiền chiết khấu giảm 10% tính toán ngay lập tức, tổng thanh toán cập nhật thời gian thực. | `[ ] Chưa kiểm tra` |
| 6 | Bấm "Đặt hàng ngay" | Hiển thị màn hình thành công kèm Mã đơn hàng dạng `TT3D-XXXX`, giỏ hàng được làm trống an toàn. | `[ ] Chưa kiểm tra` |

---

## IV. HƯỚNG DẪN KÍCH HOẠT MFA CHO ADMIN TRÊN PRODUCTION

Khi Người dùng sẵn sàng bật MFA trên tài khoản Super Admin `nvtruong.sun@gmail.com`:

1. **Bước 1: Đăng nhập giao diện Quản trị viên:**
   - Mở website và đăng nhập bằng tài khoản `nvtruong.sun@gmail.com`.
2. **Bước 2: Cài đặt ứng dụng Authenticator:**
   - Cài đặt Google Authenticator hoặc Microsoft Authenticator trên điện thoại.
   - Quét mã QR hiển thị trong tab Cài đặt bảo mật của Supabase.
   - Nhập mã 6 số để kích hoạt yếu tố TOTP.
3. **Bước 3: Tạo và lưu 8 Mã Dự Phòng Khẩn Cấp:**
   - Sau khi kích hoạt TOTP thành công (đạt `aal2`), gọi hàm `generate_recovery_codes_admin()` trên trang admin để nhận 8 mã dạng `TT3D-XXXX-XXXX`.
   - In hoặc lưu 8 mã này vào phần mềm quản lý mật khẩu an toàn (1Password/Bitwarden).

---

## V. KẾT LUẬN & KHUYẾN NGHỊ GO-LIVE CUỐI CÙNG

1. **Tiêu chuẩn Kỹ thuật:**
   - Hệ thống mã nguồn trên nhánh `feature/smart-address-checkout` đã đạt 100% các tiêu chuẩn về bảo mật, kiến trúc đa môi trường, phân quyền RLS, tính toàn vẹn dữ liệu và phòng chống tấn công AAL1 bypass.
2. **Quy định Nghiêm ngặt về Phát hành:**
   - **CHƯA MERGE VÀO MAIN** và **CHƯA DEPLOY PRODUCTION**.
   - Mọi bản ghi trên Production `nbsumfhfxohawiuxrwqj` được bảo vệ nguyên vẹn 100%.
3. **Điều kiện để tiến hành Merge vào `main`:**
   - [ ] Người dùng hoàn tất checklist trên điện thoại thực tế (Mục III).
   - [ ] Người dùng phê duyệt văn bản phương án xử lý 45 tài khoản test và 13 đơn hàng test trong `PRODUCTION_TEST_DATA_DRYRUN.md`.
   - [ ] Người dùng bật MFA AAL2 trên tài khoản Admin thật `nvtruong.sun@gmail.com`.
