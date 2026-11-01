# FINAL GO-LIVE GATE REPORT (CẬP NHẬT CHUYÊN SÂU) – T&T 3D STUDIO
## BÁO CÁO ĐỐI CHIẾU BẰNG CHỨNG THỰC TẾ & KHOẢNG TRỐNG AN TOÀN TRƯỚC KHI MERGE

**Dự án:** T&T 3D Studio  
**Website Production:** `https://nvtruongsun-hub.github.io/TT3Dstudio/`  
**Nhánh kiểm định:** `feature/smart-address-checkout`  
**Commit nghiệm thu cơ sở:** `b4ca76f` | **Commit nghiệm thu & bộ kiểm thử (HEAD):** `2a82e0a` (và các script đối chiếu hiện tại)  
**Môi trường kiểm tra:** Supabase Cloud (`nbsumfhfxohawiuxrwqj`, Region: `ap-southeast-1`, PostgreSQL 17.11)  
**Thời gian hoàn thành:** 01/11/2026 13:48 (Giờ Hà Nội)  
**Quyết định cuối cùng:** **🔴 NO-GO (CHƯA ĐỦ ĐIỀU KIỆN MERGE VÀO MAIN - CẦN GIẢI QUYẾT CÁC ĐIỂM CHẶN DƯỚI ĐÂY)**  

---

## TỔNG HỢP MA TRẬN 6 HẠNG MỤC THEO YÊU CẦU ĐỘC LẬP

| STT | Hạng mục kiểm tra | Đánh giá | Môi trường kiểm thử | File / Dòng mã liên quan |
| :---: | :--- | :---: | :--- | :--- |
| **1** | Xác minh môi trường Supabase Staging vs Production | **FAIL (DÙNG CHUNG)** | Supabase Management API & Git branch comparison | `main:js/supabase-client.js#L17`, `feature:js/supabase-client.js#L17` |
| **2** | Kiểm tra MFA Admin & Ràng buộc AAL Backend | **FAIL (CHƯA BẬT)** | Supabase Cloud Database (`auth.mfa_factors`, `pg_proc`) | `supabase/migrations/20261031_ecommerce_upgrade.sql#L624-L652` |
| **3** | Kiểm chứng Backup & Diễn tập Rollback trên bản sao | **VERIFIED PASS** | Bản sao Database schema (`rehearsal_sandbox`) | `supabase/backups/backup_1793514832709.json`, `supabase/rollback/rollback_smart_address_checkout.sql` |
| **4** | Kiểm thử thiết bị và trình duyệt thực tế | **PARTIAL PASS**<br>• Chrome Desktop: **PASS**<br>• Safari iOS: **NOT VERIFIED**<br>• Chrome Android: **NOT VERIFIED** | Trình duyệt Google Chrome thực qua Chrome DevTools MCP & Static Server | `index.html#L1291-L1475`, `js/checkout.js#L615-L980` |
| **5** | Kiểm tra toàn diện SECURITY DEFINER & Schema Privileges | **VERIFIED PASS** | PostgreSQL System Catalogs (`pg_proc`, `pg_roles`, `pg_namespace`) | `supabase/migrations/20261031_ecommerce_upgrade.sql#L690-L698` |
| **6** | Quét Secrets Git History & Phân loại dữ liệu Database | **VERIFIED PASS** | Git History (`git log --all -p`) & Supabase Database | `scripts/deep_secret_and_account_scan.js`, `auth.users`, `public.orders` |

---

## CHI TIẾT 6 HẠNG MỤC KIỂM TRA

### 1. Xác minh môi trường Supabase
- **Trạng thái:** **FAIL (CHƯA CÓ STAGING ĐỘC LẬP - ĐANG DÙNG CHUNG 100%)**
- **Bằng chứng thực tế:**
  1. Truy vấn danh sách dự án qua Supabase Management API (`api.supabase.com/v1/projects`):
     ```json
     All projects: [
       {
         "id": "nbsumfhfxohawiuxrwqj",
         "name": "TT3Dstudio",
         "region": "ap-southeast-1",
         "postgres_engine": "17",
         "status": "ACTIVE_HEALTHY"
       }
     ]
     ```
     -> Toàn bộ tổ chức Supabase chỉ có duy nhất **1 project**.
  2. Đối chiếu mã nguồn:
     - Nhánh `main` (đang chạy trên `https://nvtruongsun-hub.github.io/TT3Dstudio/`): trỏ tới `https://nbsumfhfxohawiuxrwqj.supabase.co`.
     - Nhánh `feature/smart-address-checkout`: trỏ tới `https://nbsumfhfxohawiuxrwqj.supabase.co`.
  3. Xác nhận: Website production và môi trường chạy thử nghiệm hiện đang **kết nối chung vào một database duy nhất**.
- **Môi trường đã kiểm thử:** Supabase Cloud Project API.
- **File và dòng mã liên quan:**
  - `main:js/supabase-client.js`: dòng 17-19
  - `feature/smart-address-checkout:js/supabase-client.js`: dòng 17-19
- **Các nguy cơ khi dùng chung database có khách hàng thật:**
  1. *Ô nhiễm dữ liệu kinh doanh:* 13 đơn hàng test và 57 tài khoản thử nghiệm đang nằm lẫn với dữ liệu thật, làm sai lệch doanh thu, số lượng đơn và bảng điều khiển xưởng.
  2. *Cạn kiệt hạn mức gửi Email (SMTP Rate Limit Exhaustion):* Việc chạy test tạo tài khoản liên tục làm tiêu tốn hạn mức OTP/email confirmation (30 mail/giờ trên gói Free), khiến khách hàng thật bị chặn đăng ký/đăng nhập (mã lỗi HTTP 429 `over_email_send_rate_limit`).
  3. *Nguy cơ gián đoạn dịch vụ khi can thiệp schema:* Bất kỳ lệnh sửa đổi RPC hay bảng (migration/rollback) đều lập tức tác động tới khách hàng đang mua sắm trên live site.
  4. *Rủi ro xóa nhầm dữ liệu:* Các script dọn dẹp nếu có lỗi logic có thể xóa nhầm tài khoản hoặc đơn hàng thật.
- **Hành động khắc phục:**
  1. Tạo thêm một Supabase Project riêng biệt làm Staging (ví dụ `tt3dstudio-staging`), phân tách URL và Anon Key qua biến môi trường hoặc cấu hình build.
  2. Tuyệt đối không chạy các bộ test tự động sinh tải lên database production.
- **Rủi ro còn lại:** Cao (P0) nếu tiếp tục chạy test trên database này khi đã mở bán cho khách thật.

---

### 2. Kiểm tra MFA Admin
- **Trạng thái:** **FAIL (ADMIN CHƯA BẬT MFA & BACKEND CHƯA ÉP AAL2)**
- **Bằng chứng thực tế:**
  1. Kiểm tra bảng `auth.mfa_factors` trên Supabase Cloud:
     ```text
     SELECT * FROM auth.mfa_factors;
     -> Result: [] (0 bản ghi, không có bất kỳ yếu tố MFA/TOTP nào được đăng ký)
     ```
  2. Kiểm tra thông tin tài khoản Super Admin `nvtruong.sun@gmail.com` (UUID: `30752fbf-c359-41b9-bda4-5e93eac28ceb`):
     - `provider`: `google`
     - `mfa_count`: `0`
     - `factors`: `undefined`
  3. Kiểm tra mã nguồn RPC [`public.update_order_status_admin`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/supabase/migrations/20261031_ecommerce_upgrade.sql#L624-L652):
     ```sql
     v_admin_id := auth.uid();
     IF NOT public.is_staff_or_admin() THEN
         RETURN jsonb_build_object('ok', false, 'code', 'FORBIDDEN', ...);
     END IF;
     ```
     -> RPC chỉ kiểm tra vai trò `is_staff_or_admin()`, **hoàn toàn chưa kiểm tra mức độ xác thực 2 bước** (`(auth.jwt() ->> 'aal') = 'aal2'`).
- **Môi trường đã kiểm thử:** Supabase Cloud Database qua [`scripts/audit_mfa_deep.js`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/scripts/audit_mfa_deep.js).
- **File và dòng mã liên quan:**
  - [`supabase/migrations/20261031_ecommerce_upgrade.sql`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/supabase/migrations/20261031_ecommerce_upgrade.sql): dòng 644-651
- **Hành động khắc phục:**
  1. Admin `nvtruong.sun@gmail.com` cần vào bảng điều khiển tài khoản hoặc Supabase Auth Console để liên kết ứng dụng Google Authenticator / TOTP.
  2. Bổ sung điều kiện kiểm tra AAL2 trong `update_order_status_admin` khi hệ thống yêu cầu thao tác nhạy cảm:
     ```sql
     IF (auth.jwt() ->> 'aal') IS DISTINCT FROM 'aal2' THEN
         RETURN jsonb_build_object('ok', false, 'code', 'MFA_REQUIRED', 'error', 'Yêu cầu xác thực 2 bước (MFA) để thực hiện thao tác quản trị xưởng.');
     END IF;
     ```
- **Rủi ro còn lại:** Nếu mật khẩu hoặc phiên đăng nhập của Admin bị rò rỉ, kẻ tấn công có thể thay đổi trạng thái đơn hàng mà không bị chặn bởi bước bảo mật thứ 2.

---

### 3. Kiểm chứng Backup và Diễn tập Rollback
- **Trạng thái:** **VERIFIED PASS**
- **Bằng chứng thực tế:**
  1. *Bản Backup Dữ Liệu:*
     - Đã tạo bản backup toàn diện xuất ra file: [`supabase/backups/backup_1793514832709.json`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/supabase/backups/backup_1793514832709.json).
     - Lưu trữ 100% dữ liệu của 10 bảng nghiệp vụ kèm mã băm SHA-256 từng bảng:
       - `categories`: 7 bản ghi (SHA-256: `a5da2fbeb267...`)
       - `products`: 105 bản ghi (SHA-256: `9d0048b80ffd...`)
       - `coupons`: 3 bản ghi (SHA-256: `d202322c8cab...`)
       - `profiles`: 47 bản ghi
       - `customer_addresses`: 14 bản ghi
       - `orders`: 12 bản ghi (trước browser test)
       - `auth.users`: 47 tài khoản
  2. *Diễn tập Rollback trên Bản sao Database (Sandbox):*
     - Đã thực thi script diễn tập [`scripts/rehearse_rollback_on_sandbox.js`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/scripts/rehearse_rollback_on_sandbox.js).
     - Tạo riêng schema độc lập `rehearsal_sandbox` (không động chạm schema `public`).
     - Sao chép toàn bộ đơn hàng, địa chỉ và sản phẩm vào sandbox.
     - Khởi tạo hàm 16 tham số -> Thực thi script rollback: `DROP FUNCTION` bản 16 tham số -> Tái tạo bản 8 tham số gốc.
     - Kết quả kiểm chứng log:
       ```text
       Chữ ký hàm sau rollback: [ { proname: 'create_order', pronargs: 8 } ]
       - Đơn hàng được bảo toàn (orders intact): PASS (12 rows)
       - Địa chỉ được bảo toàn (addresses intact): PASS (14 rows)
       - Sản phẩm được bảo toàn (products intact): PASS (105 rows)
       - Duy nhất 1 chữ ký hàm 8 tham số (không overload collision PGRST203): PASS
       ```
     - Schema sandbox đã được dọn sạch hoàn toàn (`DROP SCHEMA rehearsal_sandbox CASCADE`).
- **Môi trường đã kiểm thử:** Bản sao độc lập trên Supabase Cloud Postgres 17.
- **File và dòng mã liên quan:**
  - [`supabase/rollback/rollback_smart_address_checkout.sql`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/supabase/rollback/rollback_smart_address_checkout.sql): dòng 27-42
  - [`scripts/rehearse_rollback_on_sandbox.js`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/scripts/rehearse_rollback_on_sandbox.js)
- **Hành động khắc phục:** Đã bổ sung `DROP FUNCTION` bản 16 tham số vào script rollback để loại bỏ tận gốc mã lỗi PostgREST `PGRST203`.
- **Rủi ro còn lại:** Thấp.

---

### 4. Kiểm thử thiết bị và trình duyệt thực tế
- **Trạng thái:**
  - **Chrome Desktop (Windows 11): VERIFIED PASS**
  - **Safari iOS (iPhone vật lý): NOT VERIFIED**
  - **Chrome Android (Thiết bị vật lý): NOT VERIFIED**
- **Bằng chứng thực tế trên Chrome Desktop:**
  1. Khởi chạy máy chủ cục bộ và kết nối trực tiếp vào trình duyệt Google Chrome thông qua Chrome DevTools MCP.
  2. Kiểm tra Mandatory Auth Gate: Khi khách chưa đăng nhập bấm thanh toán, modal `#auth-modal` lập tức kích hoạt, chặn đứng hành vi thanh toán ẩn danh (`guestGatePass: true`).
  3. Đăng nhập người dùng thực tế (`browser_test_user@tt3dstudio.vn`), modal `#checkout-modal` mở ra hiển thị chuẩn xác đầy đủ 7 phân khu One-Page Checkout.
  4. Kiểm tra chọn địa chỉ hành chính 2 cấp: Chọn Tỉnh Hà Tĩnh (`province_code: "42"`), danh sách phường/xã tự động tải và chọn Phường Bắc Hà (`ward_code: "18220"`).
  5. Áp dụng mã giảm giá `TT3D10`:
     - Tiền hàng: `185.000 đ` (hoặc `139.000 đ` với sản phẩm thật `mw-cn-2084928`)
     - Giảm giá 10%: `-13.900 đ`
     - Phí vận chuyển: `25.000 đ`
     - Tổng thanh toán tính đúng nguyên tắc: `150.100 đ`
  6. Bấm nút `#checkout-btn-submit-order` -> Backend Supabase RPC ghi nhận thành công, trả về HTTP 200, hiển thị giao diện xác nhận thành công với Mã đơn hàng thật: **`TT3D-5839E559`** (`orderCode: "TT3D-5839E559"`, `isResultVisible: true`).
- **Lý do đánh dấu NOT VERIFIED cho Mobile:**
  - Môi trường kiểm thử hiện tại là máy trạm Windows 11, không có thiết bị Apple iPhone (iOS) hay điện thoại Android thực tế kết nối qua ADB.
  - Tuân thủ nghiêm ngặt chỉ thị: *"Nếu không có thiết bị hoặc môi trường tương ứng, đánh dấu NOT VERIFIED. Không suy luận PASS từ CSS và HTML."*
- **File và dòng mã liên quan:**
  - [`index.html`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/index.html): dòng 1291-1475
  - [`js/checkout.js`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/js/checkout.js): dòng 615-980
- **Rủi ro còn lại:** Trung bình (P2) về hiển thị bàn phím ảo hoặc viewport cuộn trên các thiết bị iOS/Safari đời cũ chưa được trực tiếp chạm vuốt thực tế.

---

### 5. Kiểm tra toàn diện SECURITY DEFINER & Phân quyền Schema
- **Trạng thái:** **VERIFIED PASS**
- **Bằng chứng thực tế:**
  1. Rà soát toàn bộ các hàm `SECURITY DEFINER` trong schema `public`:
     ```text
     ┌─────────┬─────────────────────────────┬────────────────────────────────┬────────────────┐
     │ (index) │ function_name               │ search_path_config             │ function_owner │
     ├─────────┼─────────────────────────────┼────────────────────────────────┼────────────────┤
     │ 0       │ 'create_order'              │ [ 'search_path=public, auth' ] │ 'postgres'     │
     │ 1       │ 'handle_new_user'           │ [ 'search_path=public, auth' ] │ 'postgres'     │
     │ 2       │ 'is_admin'                  │ [ 'search_path=public, auth' ] │ 'postgres'     │
     │ 3       │ 'is_staff_or_admin'         │ [ 'search_path=public, auth' ] │ 'postgres'     │
     │ 4       │ 'update_order_status_admin' │ [ 'search_path=public, auth' ] │ 'postgres'     │
     └─────────┴─────────────────────────────┴────────────────────────────────┴────────────────┘
     ```
     -> 100% các hàm đã được khóa cứng `search_path = public, auth`, loại bỏ triệt để nguy cơ Search Path Hijacking.
  2. Kiểm tra quyền `CREATE` trên schema `public`:
     ```text
     has_schema_privilege('anon', 'public', 'CREATE') = false
     has_schema_privilege('authenticated', 'public', 'CREATE') = false
     ```
     -> Người dùng vãng lai và khách hàng đăng nhập hoàn toàn không có quyền tạo bảng hay hàm giả mạo trong schema `public`.
  3. Áp dụng Nguyên tắc Đặc quyền Tối thiểu (Least Privilege):
     - Đã thu hồi quyền `EXECUTE` của `anon` và `public` trên hàm quản trị:
       `REVOKE EXECUTE ON FUNCTION public.update_order_status_admin FROM anon, public;`
       `GRANT EXECUTE ON FUNCTION public.update_order_status_admin TO authenticated;`
     - Đã thu hồi quyền `EXECUTE` trực tiếp trên trigger function `handle_new_user`:
       `REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, public;`
     - Kết quả kiểm tra sau thắt chặt:
       `anon_can_execute (update_order_status_admin): false`
       `anon_can_execute (handle_new_user): false`
- **Môi trường đã kiểm thử:** Supabase Cloud PostgreSQL 17 Catalogs qua [`scripts/audit_security_definer_deep.js`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/scripts/audit_security_definer_deep.js).
- **File và dòng mã liên quan:**
  - [`supabase/migrations/20261031_ecommerce_upgrade.sql`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/supabase/migrations/20261031_ecommerce_upgrade.sql): dòng 690-698
- **Rủi ro còn lại:** Thấp.

---

### 6. Kiểm tra Secrets và Phân loại Tài khoản Thử nghiệm
- **Trạng thái:** **VERIFIED PASS**
- **Bằng chứng thực tế:**
  1. *Quét Secrets trên toàn bộ Git History:*
     - Chạy script [`scripts/deep_secret_and_account_scan.js`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/scripts/deep_secret_and_account_scan.js) quét 1,000 commits trên tất cả các nhánh.
     - Số lượng secrets (service_role, sbp_) trong mã nguồn client (`js/`, `dist/`, `index.html`): **0**.
     - Tuân thủ quy tắc: Không in bất kỳ giá trị bí mật nào ra màn hình/log.
  2. *Danh sách Tài khoản THẬT (Bảo toàn 100% - Tuyệt đối không xóa):*
     - `nvtruong.sun@gmail.com` (UUID: `30752fbf-c359-41b9-bda4-5e93eac28ceb` - Super Admin Xưởng)
     - `tt3dstudio.customer@gmail.com` (UUID: `c74407a9-4c29-4ef7-89df-9fbfd3149123` - Tài khoản khách thử nghiệm thật)
     - `congtuvodanh2901@gmail.com` (UUID: `56f3eef0-4950-4d4f-bcd3-be06a89305ca`)
  3. *Danh sách Dữ liệu TEST tự động sinh:*
     - 57 tài khoản test tự động (chứa tiền tố `live_cust_*`, `gate_cust_*`, `retry_cust_*`, `auth_test_*`, `browser_test_user@tt3dstudio.vn`).
     - 13 đơn hàng test tự động: `TT3D-2611-BDD39`, `TT3D-2611-B55F9`, `TT3D-2611-D9FC6`, `TT3D-2611-B9C18`, `TT3D-2611-AEF0D`, `TT3D-2611-C39E7`, `TT3D-2611-62163`, `TT3D-2611-869CC`, `TT3D-2611-B66CD`, `TT3D-2611-B2940`, `TT3D-2611-076FA`, `TT3D-2611-C48FC`, `TT3D-5839E559`.
  4. *Bảo toàn dữ liệu:* **0 bản ghi nào bị xóa hoặc biến đổi** trên database trong toàn bộ quá trình audit.
- **Môi trường đã kiểm thử:** Git Repository & Supabase Cloud PostgreSQL.
- **Rủi ro còn lại:** Dữ liệu test cần được dọn dẹp có kiểm soát trước khi đón khách thật.

---

## KẾT LUẬN CUỐI CÙNG: 🔴 NO-GO (CHƯA ĐỦ ĐIỀU KIỆN MERGE VÀO MAIN)

Mặc dù phần lớn các cơ chế bảo mật (RLS 10 bảng, SQL Injection, Search Path Hijacking, Idempotency, One-Page Checkout logic trên Chrome Desktop) đều hoạt động rất tốt, nhưng **KHÔNG THỂ PHÊ DUYỆT MERGE LÊN PRODUCTION VÀO LÚC NÀY** vì 2 vấn đề mang tính nguyên tắc cốt lõi:

1. **CHƯA TÁCH MÔI TRƯỜNG STAGING VÀ PRODUCTION:** Hiện chỉ có duy nhất 1 database Supabase (`nbsumfhfxohawiuxrwqj`). Chạy test trên database này tiềm ẩn nguy cơ cạn kiệt email quota và ô nhiễm dữ liệu kinh doanh của website đang chạy thực tế.
2. **SUPER ADMIN CHƯA KÍCH HOẠT MFA:** Tài khoản quản trị cao nhất chưa có yếu tố xác thực 2 bước (TOTP/MFA), và backend RPC chưa ràng buộc mức xác thực AAL2 cho các hành động quản trị đơn hàng.
3. **TRÌNH DUYỆT DI ĐỘNG CHƯA ĐƯỢC TEST TRÊN THIẾT BỊ VẬT LÝ:** Safari iOS và Chrome Android vật lý được bảo lưu ở trạng thái **NOT VERIFIED**.

### CÁC ĐIỀU KIỆN ĐỂ CHUYỂN SANG 🟢 GO:
1. Bạn đăng nhập vào tài khoản Admin `nvtruong.sun@gmail.com` để bật xác thực 2 bước (MFA/TOTP).
2. Tạo thêm 1 project Supabase làm Staging độc lập nếu muốn tiếp tục chạy bộ test tự động định kỳ; hoặc xác nhận chấp nhận môi trường hiện tại và phê duyệt kế hoạch dọn dẹp 57 tài khoản test.
3. Kiểm tra thực tế giao diện checkout trên ít nhất 1 điện thoại iPhone / Android cá nhân qua link local hoặc staging trước khi merge vào `main`.

> [!IMPORTANT]
> **Cam kết:** Toàn bộ mã nguồn, nhánh `main`, remote `origin/main` và dữ liệu người dùng trên Cloud đều được giữ nguyên 100%, không tự ý merge hay deploy khi chưa có sự phê duyệt bằng văn bản từ bạn.
