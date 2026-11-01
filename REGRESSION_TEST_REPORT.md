# BÁO CÁO HỒI QUY KIỂM THỬ TỰ ĐỘNG (REGRESSION TEST REPORT)
**Dự án:** T&T 3D Studio  
**Nhánh kiểm thử:** `feature/smart-address-checkout`  
**Công cụ thực thi:** Node.js v24.20.0, Native Test Assertions  
**Ngày chạy nghiệm thu:** 01/11/2026  

---

## 1. TỔNG KẾT BỘ KIỂM THỬ (TEST EXECUTION SUMMARY)

Toàn bộ 9 bộ test bao quát từ chức năng hiển thị, danh mục 105 sản phẩm, luồng thanh toán một trang, sổ địa chỉ thông minh đến bảo mật phân quyền MFA AAL2 đều đã được thực thi và đạt kết quả **100% PASS**:

| Tên bài test | Số ca kiểm thử | Kết quả | Trọng tâm kiểm định |
| :--- | :---: | :---: | :--- |
| `tests/test_tracking_alert_rendering.js` | 4/4 | **PASS** | Kiểm chứng render thông báo tra cứu đơn hàng, triệt tiêu `[object Object]` (TDD Strict) |
| `tests/test_hero_showcase_regression.js` | 7/7 | **PASS** | Tính bất biến của Hero Showcase, ảnh biển tên mới, ARIA tabs |
| `tests/test_catalog_105_contract.js` | 8/8 | **PASS** | Hợp đồng toàn vẹn 105 sản phẩm, không trùng lặp ID, đủ ảnh và giá |
| `tests/test_no_text_image_overlap.js` | 3/3 | **PASS** | Chống đè lấp chữ và ảnh trên card sản phẩm và hero mobile |
| `tests/test_smart_address_checkout.js` | 4/4 | **PASS** | Danh mục hành chính 2 cấp, duy nhất 1 địa chỉ mặc định, bất biến Order Snapshot |
| `tests/test_one_page_checkout_e2e.js` | 6/6 | **PASS** | Chặn khách chưa xác minh email, tính phí ship/voucher, bảo vệ giỏ hàng |
| `tests/test_staging_mfa_aal2_enforcement.js`| 7/7 | **PASS** | Ép buộc MFA AAL2 cho Admin & Staff trên Staging, kiểm thử mã phục hồi 1 lần |
| `tests/test_browser_checkout_edge_cases.js` | 5/5 | **PASS** | Mất mạng khi đặt hàng, lỗi RPC máy chủ, chống spam multi-click, chống sửa giá client |
| `tests/test_env_guard.js` | 3/3 | **PASS** | Chặn đứng hoàn toàn việc chạy test hoặc mutate database Production |

---

## 2. TRÍCH XUẤT NHẬT KÝ THỰC TẾ TỪ TERMINAL (RAW TEST LOGS)

### 2.1. Test Render Thông Báo Tra Cứu (BUG-P1-01 Strict TDD)
```text
==========================================================
   TEST TRACKING CUSTOMER ALERT RENDERING (TDD)
==========================================================

Checking raw interpolation in app.js: CLEAN
✅ ALL TRACKING ALERT RENDERING CHECKS PASSED!
```

### 2.2. Test Hero Showcase & Tính Bất Biến
```text
==========================================================
   HERO SHOWCASE LOGIC & DATA INTEGRITY TESTS
==========================================================

  [PASS] H01: Approved Hero IDs exist in catalog with active status & valid images on disk
  [PASS] H02: mw-cn-1646129 identity matches catalog record (Coquette Silk Tray, 119.000₫)
  [PASS] H03: mw-cn-1147539 identity matches catalog record (Customizable Nameplate, 99.000₫)
  [PASS] H04: mw-cn-2235027 identity matches catalog record (KŌHAKU Washi Lamp, 289.000₫)
  [PASS] H05: CSS Geometry rules enforce max-width 460px, aspect-ratio 4:3 and fade animation
  [PASS] H06: HTML satisfies WAI-ARIA tablist contract, semantic geometry and clean utilities
  [PASS] H07: js/app.js controller eliminates hardcoded catalogs and enforces race condition guard

==========================================================
   ALL 7 HERO SHOWCASE REGRESSION CHECKS PASSED (7/7)
==========================================================
```

### 2.3. Test Hợp Đồng Toàn Vẹn 105 Sản Phẩm
```text
🧪 [TEST] Running test_catalog_105_contract.js...
Checking products.json count: current = 105, expected = 105
✅ ALL 8 CONTRACT CHECKS PASSED!
```

### 2.4. Test Chống Đè Lấp Nội Dung
```text
[PASS] 1. Bento card content does not use overlapping max-w-[75%] utility class
[PASS] 2. Mobile Bento CSS does not allow 60% image + 78% text collision
[PASS] 3. Desktop Bento CSS enforces bounded content zone preventing overlap with thumbnail

All No-Overlap Invariant Tests Passed!
```

### 2.5. Test Sổ Địa Chỉ & One-Page Checkout E2E
```text
🧪 [TEST SUITE] Bắt đầu kiểm định Smart Address & Checkout...
✅ TEST 1 PASSED: Tìm kiếm hành chính 2 cấp tiếng Việt không dấu chuẩn xác 100%.
✅ TEST 2 PASSED: Ràng buộc duy nhất 1 địa chỉ mặc định hoạt động hoàn hảo.
✅ TEST 3 PASSED: Order Shipping Snapshot bảo toàn bất biến tuyệt đối khi địa chỉ tài khoản thay đổi.
✅ TEST 4 PASSED: Format địa chỉ 2 cấp chính xác.
🎉 [HOÀN TẤT] 100% SMART ADDRESS TEST SUITE PASSED CHUẨN XÁC!

🧪 [TEST E2E] Bắt đầu kiểm thử End-to-End One-Page Checkout...
✅ CASE 1 PASSED: Khách chưa đăng nhập bị chặn tuyệt đối.
✅ CASE 2 PASSED: Khách chưa xác minh email bị chặn theo đúng quy tắc bảo mật.
✅ CASE 3 PASSED: Tính toán tổng tiền, chiết khấu và freeship chuẩn xác 100%.
✅ CASE 4 PASSED: Khởi tạo Idempotency key độc lập thành công.
✅ CASE 5 PASSED: Giỏ hàng được bảo vệ nguyên vẹn khi backend lỗi.
✅ CASE 6 PASSED: Đặt hàng thành công, giỏ hàng dọn dẹp an toàn.
🎉 [HOÀN TẤT E2E] Tất cả các ca kiểm thử nghiệp vụ One-Page Checkout đều ĐẠT CHUẨN!
```

### 2.6. Test Ngoại Lệ Trình Duyệt (Browser Edge Cases)
```text
🛡️ [TEST BROWSER EDGE CASES] Bắt đầu kiểm tra các kịch bản ngoại lệ trình duyệt...
✅ PASS SCENARIO 1: Mất mạng -> Báo lỗi, bảo toàn giỏ hàng, cho phép thử lại.
✅ PASS SCENARIO 2: Lỗi RPC -> Giữ nguyên giỏ hàng, không sinh đơn ảo.
✅ PASS SCENARIO 3: Khóa trạng thái submitting chặn đứng spam click phía trình duyệt.
✅ PASS SCENARIO 4: Client price bị loại bỏ 100%, backend hoàn toàn tự tính giá ground-truth.
✅ PASS SCENARIO 5: Phiên hết hạn -> Từ chối đặt hàng, bảo toàn giỏ hàng.
🎉 [HOÀN TẤT KIỂM THỬ TRÌNH DUYỆT] CẢ 5 KỊCH BẢN NGOẠI LỆ ĐỀU ĐẠT CHUẨN AN TOÀN (VERIFIED PASS)!
```

### 2.7. Test Ép Buộc MFA AAL2 Trên Staging
```text
========================================================================
   KIỂM ĐỊNH BẢO VỆ ADMIN & STAFF BẰNG MFA / AAL2 TRÊN STAGING
   Target Endpoint: https://vtxzlgkvmvoushluthme.supabase.co
========================================================================
[1/7] Khởi tạo Admin, Staff và Customer trên Staging...
[2/7] Tạo đơn hàng mẫu trên Staging...
[3/7] Đăng nhập Staff (AAL1) -> Thử gọi update_order_status_admin -> Bị chặn (MFA_REQUIRED)
[4/7] Đăng ký TOTP cho Staff -> Nâng cấp lên AAL2 -> Cập nhật thành công!
[5/7] Đăng nhập Admin (AAL1) -> Bị chặn -> Nâng cấp AAL2 -> Thành công!
[6/7] Kiểm thử cấp phát & sử dụng mã dự phòng khẩn cấp 1 lần -> Replay attack bị chặn 100%!
[7/7] Vai trò Customer bị từ chối 100% ở mọi hàm quản trị!
🎉 [PHASE 2 VERIFIED PASS] BẢO VỆ MFA CHO CẢ ADMIN VÀ STAFF ĐẠT CHUẨN TUYỆT ĐỐI!
```
