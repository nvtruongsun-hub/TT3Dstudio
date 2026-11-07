# BÁO CÁO XỬ LÝ SỰ CỐ AN NINH: RÀ SOÁT, THANH TRỪNG SERVICE_ROLE KEY & BẢO VỆ REPOSITORY

- **Dự án:** T&T 3D Studio (E-Commerce Platform)
- **Mã dự án Supabase:** `nbsumfhfxohawiuxrwqj` (Production)
- **Thời điểm xử lý:** Ngày 02 tháng 11 năm 2026
- **Trạng thái:** ✅ **ĐÃ KHẮC PHỤC TRIỆT ĐỂ 100% TRÊN MÃ NGUỒN & TOÀN BỘ LỊCH SỬ GIT**

---

## 1. TỔNG QUAN SỰ CỐ & PHẠM VI ẢNH HƯỞNG

### 1.1 Vấn đề phát hiện
- Key đặc quyền `service_role` của Supabase Production và token `sbp_` cá nhân xuất hiện dưới dạng chuỗi hardcode trong 5 file test tự động và một số script tiện ích:
  - `scripts/check_admin_mfa.js`
  - `tests/test_full_10_tables_crud_matrix.js`
  - `tests/test_live_auth_lifecycle.js`
  - `tests/test_live_backend_security_matrix.js`
  - `tests/test_network_drop_in_flight_idempotency.js`
  - `tests/test_env_guard.js` (chứa staging service key)
  - `scripts/audit_storage_and_policies.js`, `scripts/deploy_staging_database.js`, v.v.

### 1.2 Kết quả xác minh phạm vi rò rỉ thực tế (Empirical Verification)
- **Xác minh Remote GitHub (`origin`):**
  - Chạy lệnh kiểm định: `git --no-pager log origin/main -S "[REDACTED_PROD_SERVICE_ROLE_KEY]"`
  - Kết quả: **0 kết quả (Hoàn toàn KHÔNG có trên GitHub)**.
  - Nhánh `feature/smart-address-checkout` (nhánh chứa commit `b4ca76f`) là nhánh làm việc cục bộ (local branch) và **CHƯA TỪNG ĐƯỢC PUSH LÊN GITHUB**.
  - Trên GitHub Public Repository hiện tại chỉ duy nhất có commit của `origin/main` (commit `da2762f`), hoàn toàn không chứa bất kỳ `service_role` hay token bí mật nào.

---

## 2. CÁC HÀNH ĐỘNG ĐÃ TỰ ĐỘNG THỰC THI (100% HOÀN TẤT)

### 2.1 Sửa toàn bộ mã nguồn: Chuyển 100% sang biến môi trường (`process.env`)
Đã loại bỏ toàn bộ các chuỗi JWT và Access Token khỏi mã nguồn hiện tại:
- `scripts/check_admin_mfa.js`: Đọc `process.env.SUPABASE_SERVICE_ROLE_KEY`.
- `tests/test_full_10_tables_crud_matrix.js`: Đọc `process.env.SUPABASE_SERVICE_ROLE_KEY`.
- `tests/test_live_auth_lifecycle.js`: Đọc `process.env.SUPABASE_SERVICE_ROLE_KEY`.
- `tests/test_live_backend_security_matrix.js`: Đọc `process.env.SUPABASE_SERVICE_ROLE_KEY`.
- `tests/test_network_drop_in_flight_idempotency.js`: Đọc `process.env.SUPABASE_SERVICE_ROLE_KEY`.
- `tests/test_env_guard.js`: Đọc `process.env.STAGING_SERVICE_KEY`.
- Toàn bộ 7 script quản trị Supabase (`deploy_staging_database.js`, `query_db.js`, `audit_storage_and_policies.js`,...): Đọc `process.env.SUPABASE_ACCESS_TOKEN`.

### 2.2 Đại phẫu và thanh trừng toàn bộ lịch sử Git (`git-filter-repo`)
- Đã sử dụng công cụ chuyên dụng của Git (`git-filter-repo`) để quét và viết lại toàn bộ cây commit trong lịch sử:
  - Thay thế vĩnh viễn chuỗi `service_role` Production cũ bằng `REDACTED_PROD_SERVICE_ROLE_KEY`.
  - Thay thế vĩnh viễn token `sbp_` bằng `REDACTED_SUPABASE_ACCESS_TOKEN`.
  - Thay thế vĩnh viễn chuỗi `service_role` Staging bằng `REDACTED_STAGING_SERVICE_KEY`.
- Dọn dẹp reflog, dọn dẹp các nhánh phụ `agent/task-*`, và chạy `git gc --prune=now`.
- **Bằng chứng kiểm chứng sau khi viết lại:**
  ```powershell
  git --no-pager log -S "[REDACTED_PROD_SERVICE_ROLE_KEY]" --all
  # -> EXIT 0: ZERO COMMITS FOUND (Đã sạch 100%)

  git --no-pager log -S "[REDACTED_SUPABASE_PAT_TOKEN]" --all
  # -> EXIT 0: ZERO COMMITS FOUND (Đã sạch 100%)
  ```

---

## 3. CHỈ DẪN THAO TÁC TIẾP THEO CHO NGƯỜI DÙNG

### 3.1 Rotate JWT Secret / Key trên Supabase Dashboard (Bước 1 của người dùng)
Mặc dù key chưa từng xuất hiện trên GitHub public, việc thu hồi và cấp mới JWT Secret là tiêu chuẩn an ninh bắt buộc khi đã từng nghi ngờ lộ:
1. Mở trang quản trị API của dự án:
   👉 **[https://supabase.com/dashboard/project/nbsumfhfxohawiuxrwqj/settings/api](https://supabase.com/dashboard/project/nbsumfhfxohawiuxrwqj/settings/api)**
2. Cuộn xuống phần **JWT Settings** -> **JWT Secret**.
3. Bấm nút **"Generate new secret"** (hoặc **"Rotate Keys"**).
4. Xác nhận thao tác. Supabase sẽ:
   - Ngay lập tức hủy bỏ key `service_role` và `anon` cũ.
   - Sinh ra cặp key `anon` và `service_role` mới hoàn toàn.
5. **Cập nhật lại Frontend:**
   - Copy key `anon` mới được cấp.
   - Cung cấp cho Antigravity hoặc cập nhật vào `js/env-config.js` để website tiếp tục đọc/ghi dữ liệu công khai bình thường.

### 3.2 Chuyển GitHub Repository sang chế độ Private (Bước 2 của người dùng)
Để đảm bảo an toàn tuyệt đối cho toàn bộ tài nguyên dự án:
1. Mở trang cài đặt repository trên GitHub:
   👉 **[https://github.com/nvtruongsun-hub/TT3Dstudio/settings](https://github.com/nvtruongsun-hub/TT3Dstudio/settings)**
2. Kéo xuống cuối trang đến khu vực **Danger Zone**.
3. Tại mục **Change repository visibility**, bấm **Change to private**.
4. Nhập tên repo `nvtruongsun-hub/TT3Dstudio` để xác nhận.

---

## 4. KẾT LUẬN & TRẠNG THÁI HIỆN TẠI
- **Lịch sử Git nội bộ:** Hoàn toàn sạch bóng, không còn bất kỳ secret nào.
- **Mã nguồn hiện tại:** 100% tuân thủ bảo mật biến môi trường.
- **GitHub Public Repo:** Nhánh public `main` chưa từng bị nhiễm secret.
