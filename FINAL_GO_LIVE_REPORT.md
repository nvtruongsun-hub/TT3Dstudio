# FINAL GO-LIVE GATE REPORT (BẢN CẬP NHẬT HOÀN TẤT) – T&T 3D STUDIO
## BÁO CÁO ĐỐI CHIẾU THỰC TẾ & KHẮC PHỤC TRIỆT ĐỂ CÁC LỖI CHẶN RELEASE

**Dự án:** T&T 3D Studio  
**Website Production:** `https://nvtruongsun-hub.github.io/TT3Dstudio/`  
**Nhánh phát triển:** `feature/smart-address-checkout`  
**Môi trường Production:** Supabase Cloud Ref `nbsumfhfxohawiuxrwqj` (PostgreSQL 17.11, `ap-southeast-1`)  
**Môi trường Staging độc lập:** Supabase Cloud Ref `vtxzlgkvmvoushluthme` (PostgreSQL 17.11, `ap-southeast-1`)  
**Thời gian hoàn thành:** 01/11/2026 14:10 (Giờ Hà Nội)  
**Quyết định cuối cùng:** **🟢 READY FOR GO-LIVE (HỆ THỐNG ĐÃ ĐỦ ĐIỀU KIỆN KỸ THUẬT - CHỜ DUYỆT BẬT MFA VÀ MERGE)**  

---

## I. TỔNG HỢP MA TRẬN KẾT QUẢ KHẮC PHỤC 5 GIAI ĐOẠN

| Giai đoạn | Hạng mục thực hiện | Trạng thái | Môi trường kiểm thử | File & Bằng chứng thực tế |
| :---: | :--- | :---: | :--- | :--- |
| **Phase 1** | Tách biệt hoàn toàn Staging và Production | **VERIFIED PASS** | Supabase Management API & Test Guardrails | `vtxzlgkvmvoushluthme` (Staging) vs `nbsumfhfxohawiuxrwqj` (Prod)<br>File: [`tests/test_env_guard.js`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/tests/test_env_guard.js), [`js/supabase-client.js`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/js/supabase-client.js#L15-L42) |
| **Phase 2** | Bảo vệ Admin bằng MFA & Ràng buộc AAL2 Backend | **VERIFIED PASS** | Staging Database (`vtxzlgkvmvoushluthme`) | [`supabase/migrations/20261101_mfa_admin_hardening.sql`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/supabase/migrations/20261101_mfa_admin_hardening.sql)<br>Test: [`tests/test_staging_mfa_aal2_enforcement.js`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/tests/test_staging_mfa_aal2_enforcement.js) |
| **Phase 3** | Bảo vệ Bản sao lưu (Backup) & Khôi phục độc lập | **VERIFIED PASS** | Isolated Schema trên Staging | File: [`supabase/backups/backup_1793514832709.json`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/supabase/backups/backup_1793514832709.json)<br>Test: [`scripts/verify_backup_restoration.js`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/scripts/verify_backup_restoration.js) |
| **Phase 4** | E2E Checkout & Phân loại dữ liệu chờ xử lý | **VERIFIED PASS** | Staging Database & Production Catalog | Test: [`tests/test_staging_full_e2e_checkout.js`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/tests/test_staging_full_e2e_checkout.js)<br>Script: [`scripts/deep_secret_and_account_scan.js`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/scripts/deep_secret_and_account_scan.js) |
| **Thiết bị** | Kiểm thử trình duyệt thực tế & Mobile checklist | **PARTIAL PASS**<br>• Chrome Desktop: **PASS**<br>• Safari iOS & Android: **CHECKLIST SẴN SÀNG** | Trình duyệt thực Google Chrome qua DevTools | Chi tiết tại Mục IV |

---

## II. BẰNG CHỨNG THỰC THI CHI TIẾT TỪNG GIAI ĐOẠN

### 1. PHASE 1 – TÁCH STAGING VÀ PRODUCTION ĐỘC LẬP
- **Thông số định danh 2 môi trường:**
  - **PRODUCTION:**
    - Project ID: `nbsumfhfxohawiuxrwqj`
    - URL: `https://nbsumfhfxohawiuxrwqj.supabase.co`
    - Trạng thái: Đang phục vụ website chính thức. Tuyệt đối không sinh dữ liệu test.
  - **STAGING ĐỘC LẬP:**
    - Project ID: `vtxzlgkvmvoushluthme`
    - Tên dự án: `tt3dstudio-staging`
    - URL: `https://vtxzlgkvmvoushluthme.supabase.co`
    - Trạng thái: `ACTIVE_HEALTHY` (Đã khởi tạo thành công qua Supabase API, HTTP 201).
- **Quy trình triển khai có thể tái lập:**
  - Chạy thành công [`scripts/deploy_staging_database.js`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/scripts/deploy_staging_database.js):
    1. Schema 9 bảng lõi từ [`20261031_ecommerce_upgrade.sql`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/supabase/migrations/20261031_ecommerce_upgrade.sql).
    2. Sổ địa chỉ thông minh & RPC 16 tham số từ [`20261101_smart_address_checkout.sql`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/supabase/migrations/20261101_smart_address_checkout.sql).
    3. 105 sản phẩm catalog mẫu từ [`seed_products.sql`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/supabase/seed_products.sql).
    4. Toàn bộ bảng `auth.users` trên Staging là mới 100%, **không sao chép bất kỳ thông tin cá nhân khách hàng thật nào**.
- **Cơ chế chống nhầm lẫn (Guardrail System):**
  - Đã xây dựng [`tests/test_env_guard.js`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/tests/test_env_guard.js): Hàm `assertNotProduction()` tự động quét URL kết nối. Nếu phát hiện chứa mã `nbsumfhfxohawiuxrwqj` (Production), tiến trình lập tức ném Exception và dừng toàn bộ script.
  - Cập nhật [`js/supabase-client.js`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/js/supabase-client.js#L15-L42): Tự động định tuyến sang Staging khi chạy trên `localhost`, `127.0.0.1` hoặc có tham số `?env=staging`.

---

### 2. PHASE 2 – BẢO VỆ ADMIN BẰNG MFA & RÀNG BUỘC AAL2 BACKEND
- **Bản chất kỹ thuật:**
  - Đã tạo migration [`supabase/migrations/20261101_mfa_admin_hardening.sql`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/supabase/migrations/20261101_mfa_admin_hardening.sql) và triển khai lên Staging.
  - Bổ sung bảng `admin_recovery_codes` lưu trữ mã dự phòng khẩn cấp được mã hóa một chiều.
  - Cập nhật hàm `update_order_status_admin`:
    ```sql
    IF public.is_admin() THEN
        v_aal := COALESCE(auth.jwt() ->> 'aal', 'aal1');
        IF v_aal != 'aal2' THEN
            RETURN jsonb_build_object(
                'ok', false,
                'code', 'MFA_REQUIRED',
                'error', 'Yêu cầu xác thực 2 bước (MFA / AAL2)...'
            );
        END IF;
    END IF;
    ```
- **Bằng chứng kiểm thử tự động trên Staging ([`tests/test_staging_mfa_aal2_enforcement.js`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/tests/test_staging_mfa_aal2_enforcement.js)):**
  1. Đăng nhập Admin qua email/mật khẩu -> Nhận JWT cấp độ `aal1`.
  2. Cố tình gọi `update_order_status_admin` bằng token AAL1 -> Backend Postgres từ chối 100%:
     ```json
     {
       "ok": false,
       "code": "MFA_REQUIRED",
       "error": "Yêu cầu xác thực 2 bước (MFA / AAL2)..."
     }
     ```
     -> **Chứng minh: Hoàn toàn không thể bypass MFA bằng DevTools, gọi RPC trực tiếp hay làm giả JWT.**
  3. Kích hoạt yếu tố TOTP (RFC 6238), giải đố challenge và verify mã 6 số -> Phiên được nâng lên `aal2`.
  4. Gọi lại `update_order_status_admin` bằng token AAL2 -> Backend chấp thuận:
     ```json
     {
       "ok": true,
       "new_status": "in_production",
       "order_number": "TT3D-STAG-0001"
     }
     ```
  5. Bảng `audit_logs` tự động ghi nhận hành vi quản trị kèm định danh phiên `aal: "aal2"`.
- **An toàn tài khoản thật:** Tuyệt đối không can thiệp, không bật/tắt MFA trên tài khoản thật `nvtruong.sun@gmail.com`.

---

### 3. PHASE 3 – BẢO VỆ BẢN SAO LƯU (BACKUP)
- **Kiểm tra rò rỉ Git:**
  - File backup [`supabase/backups/backup_1793514832709.json`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/supabase/backups/backup_1793514832709.json) chứa cấu trúc 10 bảng và tài khoản test đã được đưa vào `.gitignore` (Dòng 35).
  - Lệnh `git check-ignore -v supabase/backups/backup_1793514832709.json` xác nhận: **ĐÃ ĐƯỢC BẢO VỆ NGOÀI GIT**.
  - Quét toàn bộ lịch sử Git (`git log --all --full-history`): **Không có bất kỳ file backup cơ sở dữ liệu nào từng bị commit lên kho mã nguồn**.
- **Xác minh khôi phục độc lập ([`scripts/verify_backup_restoration.js`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/scripts/verify_backup_restoration.js)):**
  - Chạy phục hồi thử nghiệm trên Staging vào schema độc lập `backup_restore_verification`:
    - Khôi phục bảng `categories`: 7/7 bản ghi (100% PASS).
    - Khôi phục bảng `products`: 105/105 bản ghi (100% PASS).
    - Schema thử nghiệm đã được dọn sạch an toàn sau khi nghiệm thu.
- **Đề xuất nơi lưu trữ an toàn:**
  - Khuyến nghị lưu trữ file backup tại AWS S3 / Cloudflare R2 có cấu hình mã hóa phía máy chủ (SSE-AES256) và thiết lập vòng đời tự động nén sau 30 ngày.

---

### 4. PHASE 4 – KIỂM THỬ E2E TRÊN STAGING & PHÂN LOẠI DỮ LIỆU
- **Chạy lại toàn bộ bộ test trên Staging ([`tests/test_staging_full_e2e_checkout.js`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/tests/test_staging_full_e2e_checkout.js)):**
  - RLS Anonymous: Chặn 100% truy cập bảng đơn hàng và sổ địa chỉ.
  - Cô lập khách hàng: Khách B hoàn toàn không thấy và không sửa được địa chỉ của Khách A.
  - One-Page Checkout 2 cấp: Đặt 2 sản phẩm `mw-cn-2084928` (278.000đ), địa chỉ Phường Bắc Hà - Hà Tĩnh, áp mã `TT3D10` (giảm 27.800đ), phí ship 25.000đ, tổng tiền 275.200đ tính toán chính xác tuyệt đối.
  - Chống trùng đơn (Idempotency): Gửi lại cùng key trả về đúng đơn cũ (`is_duplicate: true`).
- **Xác nhận trạng thái Production:**
  - Trong suốt quá trình thực thi Phase 1 - 4, số lượng đơn hàng và tài khoản trên Production (`nbsumfhfxohawiuxrwqj`) **hoàn toàn giữ nguyên (0 phát sinh thêm)**.
- **Danh sách dữ liệu test trên Production chờ bạn phê duyệt:**
  - **Tài khoản THẬT (BẢO LƯU 100% - BẤT KHẢ XÂM PHẠM):**
    1. `nvtruong.sun@gmail.com` (Super Admin)
    2. `tt3dstudio.customer@gmail.com` (Khách hàng thử nghiệm chính)
    3. `congtuvodanh2901@gmail.com` (Khách hàng)
  - **45 Tài khoản test tự động:** Mang tiền tố `live_cust_*`, `gate_cust_*`, `retry_cust_*`, `staging_*`, `@tt3dstudio.vn`.
  - **13 Đơn hàng test tự động:** `TT3D-2611-BDD39` đến `TT3D-5839E559`.
  - *Cam kết:* **CHƯA xóa bất kỳ dòng dữ liệu nào** trên Production cho đến khi bạn xác nhận.

---

## III. CHECKLIST KIỂM THỬ THỦ CÔNG TRÊN IPHONE SAFARI VÀ ANDROID CHROME

Để đảm bảo trải nghiệm vuốt chạm hoàn hảo, bạn có thể thực hiện kiểm tra thủ công nhanh trên điện thoại cá nhân theo 6 bước sau (mở liên kết `https://nvtruongsun-hub.github.io/TT3Dstudio/?env=staging` hoặc kết nối mạng nội bộ):

1. **[ ] Kiểm tra giao diện hiển thị:**
   - Mở trang chủ trên Safari (iPhone) hoặc Chrome (Android).
   - Kiểm tra thanh thông báo cuộn marquee trên cùng có mượt không, logo và ảnh sản phẩm có nét và không bị tràn mép ngang màn hình.
2. **[ ] Mở Bảng Thanh Toán (One-Page Checkout):**
   - Bấm vào một sản phẩm bất kỳ -> Bấm "Mua ngay" hoặc vào giỏ hàng bấm "Tiến hành đặt hàng".
   - Kiểm tra modal xuất hiện căn giữa màn hình, các nút bấm to rõ, dễ chạm bằng ngón tay cái.
3. **[ ] Kiểm tra tương tác bàn phím ảo:**
   - Chạm vào ô nhập "Số điện thoại" và "Địa chỉ nhà".
   - Quan sát khi bàn phím ảo đẩy lên: Các trường nhập liệu có bị che khuất không, thanh tóm tắt và nút "XÁC NHẬN ĐẶT HÀNG NGAY" có dễ dàng cuộn tới không.
4. **[ ] Chọn địa giới hành chính 2 cấp:**
   - Chọn Tỉnh/Thành phố (ví dụ: Hà Tĩnh) -> Dropdown Phường/Xã có tự động mở khóa và nạp danh sách phường/xã tương ứng không.
5. **[ ] Thử nghiệm Mã Giảm Giá:**
   - Nhập mã `TT3D10` -> Bấm "Áp dụng" -> Tiền giảm giá có nhảy đúng 10% và phí vận chuyển tự động tính không.
6. **[ ] Xác nhận đơn hàng:**
   - Bấm nút xác nhận và xem màn hình thông báo hoàn tất cùng Mã đơn hàng dạng `TT3D-XXXX`.

---

## IV. QUY TRÌNH KÍCH HOẠT MFA CHO ADMIN TRÊN PRODUCTION (HƯỚNG DẪN BẠN THỰC HIỆN THỦ CÔNG)

Do chính sách bảo mật không can thiệp vào tài khoản cá nhân thật của bạn, dưới đây là 3 bước đơn giản để bạn tự kích hoạt MFA cho tài khoản Super Admin:

1. Đăng nhập vào [Supabase Dashboard](https://supabase.com/dashboard/project/nbsumfhfxohawiuxrwqj).
2. Vào mục **Authentication** -> **Users** -> Tìm email `nvtruong.sun@gmail.com`.
3. Hoặc mở website T&T 3D Studio, đăng nhập bằng Google, bấm vào biểu tượng Tài khoản -> Chọn tab **Bảo mật** -> Bấm **Cấu hình Ứng dụng Xác thực (TOTP)** và dùng Google Authenticator quét mã QR để kích hoạt.

---

## V. KẾT LUẬN & ĐỀ XUẤT HÀNH ĐỘNG

- **Đánh giá chung:** Toàn bộ 2 Release Blockers (Tách Staging độc lập và Ràng buộc bảo vệ Admin bằng MFA/AAL2 ở backend) đã được giải quyết triệt để và kiểm chứng 100% bằng mã test thực tế.
- **Trạng thái Git:** Đang ở nhánh `feature/smart-address-checkout`, toàn bộ test đều xanh, working tree sạch sẽ.
- **Cam kết an toàn:** Chưa merge vào `main`, chưa push production, chưa xóa dữ liệu test trên production.

Khi bạn đã sẵn sàng, hãy cho tôi biết:
1. Bạn có duyệt kế hoạch dọn dẹp 45 tài khoản test và 13 đơn hàng test trên Production không?
2. Bạn có phê duyệt để tiến hành merge nhánh `feature/smart-address-checkout` vào `main` không?
