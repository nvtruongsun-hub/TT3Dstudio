# BÁO CÁO BẰNG CHỨNG KIỂM THỬ THỰC TẾ (TEST EVIDENCE REPORT)
## DỰ ÁN: NÂNG CẤP TOÀN DIỆN NỀN TẢNG T&T 3D STUDIO

**Thời gian lập báo cáo:** 02/11/2026 10:05 (Giờ Hà Nội)  
**Đơn vị thực hiện:** QA Lead & Test Automation Engineer  
**Quy trình tuân thủ:** Strict TDD 5 Pha (Luật Kun Chen & Mutation Testing)  

---

## 1. TỔNG HỢP KẾT QUẢ CÁC BỘ KIỂM THỬ (TEST EXECUTION SUMMARY)

| Tên bộ test (Test Suite) | Mục đích kiểm định | Môi trường | Lệnh thực thi | Kết quả |
| :--- | :--- | :---: | :--- | :---: |
| **1. test_sprint1_quick_wins.js** | Tự động áp dụng giảm giá Combo 10%, xóa script rác, nhất quán địa chỉ xưởng Hà Tĩnh & thương hiệu T&T 3D Studio. | Local VM / File Engine | `node tests/test_sprint1_quick_wins.js` | **100% PASS** |
| **2. test_mfa_recovery_aal2_flow.js** | Luồng khôi phục MFA qua Edge Function `mfa-recovery-reset`, gỡ factor cũ, quét Authenticator mới đạt AAL2. | Offline Mock Spec | `node tests/test_mfa_recovery_aal2_flow.js` | **9/9 PASS** |
| **3. test_browser_checkout_edge_cases.js** | 5 kịch bản ngoại lệ: mất mạng, lỗi RPC, multi-click, can thiệp giá DevTools, hết hạn phiên. | Headless Browser | `node tests/test_browser_checkout_edge_cases.js` | **5/5 PASS** |
| **4. test_one_page_checkout_e2e.js** | Kiểm định 6 tiêu chuẩn: Chặn chưa đăng nhập, chặn chưa verify email, tính freeship 300K, idempotency key, bảo vệ giỏ hàng. | Headless Browser | `node tests/test_one_page_checkout_e2e.js` | **6/6 PASS** |
| **5. test_smart_address_checkout.js** | Sổ địa chỉ 2 cấp hành chính, tìm kiếm không dấu, duy nhất 1 địa chỉ mặc định, snapshot bất biến. | Headless Browser | `node tests/test_smart_address_checkout.js` | **4/4 PASS** |
| **6. verify_backup_consistency.js** | Diễn tập phục hồi 10/10 bảng nghiệp vụ vào schema cô lập với ràng buộc Foreign Key và đếm bản ghi. | Supabase Staging | `node scripts/verify_backup_consistency.js` | **10/10 PASS** |
| **7. build-static-artifact.js** | Kiểm tra preflight 32 entrypoint bắt buộc, biên dịch Tailwind CSS tĩnh và đóng gói 238 file vào `dist/`. | Build Pipeline | `node scripts/build-static-artifact.js` | **PASS (Exit 0)** |

---

## 2. TRÍCH XUẤT TERMINAL LOGS THỰC TẾ

### 2.1. Log Kiểm thử TDD Sprint 1 Quick Wins (Xác nhận Xanh sau khi sửa)
```text
PS C:\Users\truongg\OneDrive - Thuyloi University\Tài liệu\02. T&T 3D studio> node tests/test_sprint1_quick_wins.js
========================================================================
   KIỂM THỬ TDD SPRINT 1 - BẢO ĐẢM TÍNH ĐÚNG ĐẮN GIAO DIỆN & GIỎ HÀNG
========================================================================

[TEST 1] Kiểm tra nút "Mua Trọn Bộ" Combo tự động áp dụng giảm giá 10%...

[TEST 2] Kiểm tra nhất quán địa chỉ xưởng Hà Tĩnh & thương hiệu T&T 3D Studio...
  - Chứa "xưởng Hà Nội": false
  - Chứa "T&T 3D Labs": false

[TEST 3] Kiểm tra loại bỏ script rác automation-simulator.js khỏi index.html...
  - Chứa "js/automation-simulator.js": false

🎉 [PASS] Tất cả các tiêu chuẩn Sprint 1 đều đạt chuẩn!
```

### 2.2. Bằng chứng Pha 4 Mutation Testing (Kiểm định ngược độ nhạy của bài test)
Cố tình chèn lại chuỗi lỗi giả định `"T&amp;T 3D Labs · Xưởng in 3D Hà Tĩnh"` vào `index.html`:
```text
PS C:\Users\truongg\OneDrive - Thuyloi University\Tài liệu\02. T&T 3D studio> node tests/test_sprint1_quick_wins.js
[TEST 2] Kiểm tra nhất quán địa chỉ xưởng Hà Tĩnh & thương hiệu T&T 3D Studio...
  - Chứa "xưởng Hà Nội": false
  - Chứa "T&T 3D Labs": true

AssertionError [ERR_ASSERTION]: LỖI: index.html vẫn còn chứa thương hiệu cũ T&T 3D Labs!
true !== false
=> BÀI TEST LẬP TỨC PHÁT HIỆN LỖI VÀ BÁO ĐỎ (GATE 4 VERIFIED PASS).
Sau đó khôi phục lại bản đúng, chạy lại test đạt 100% XANH.
```

### 2.3. Log Kiểm thử MFA Recovery -> AAL2 Elevation Flow
```text
PS C:\Users\truongg\OneDrive - Thuyloi University\Tài liệu\02. T&T 3D studio> node tests/test_mfa_recovery_aal2_flow.js
==========================================================
   TEST MFA RECOVERY -> AAL2 FLOW
==========================================================

  ✅ getMfaStatus báo aal1 + 1 TOTP verified
  ✅ AAL1 bị chặn generate_recovery_codes_admin (MFA_REQUIRED)
  ✅ Mã dự phòng sai -> INVALID_RECOVERY_CODE, không gỡ factor
  ✅ Mã dự phòng đúng -> Edge Function gỡ toàn bộ factor cũ
  ✅ Mã TOTP sai/sai định dạng không nâng phiên
  ✅ Sau recovery + đăng ký TOTP mới: phiên đạt AAL2, tạo được mã dự phòng
  ✅ enrollTotp dọn factor chưa verify còn sót
  ✅ Tham số RPC update_order_status_admin khớp chữ ký SQL
  ✅ Edge Function: redeem bằng JWT người dùng trước, service role chỉ lấy từ env

🎉 9/9 PASS
```

### 2.4. Log Đóng gói Bản phát hành (Static Artifact Packaging)
```text
PS C:\Users\truongg\OneDrive - Thuyloi University\Tài liệu\02. T&T 3D studio> node scripts/build-static-artifact.js
==========================================================
   T&T 3D LABS - STATIC ARTIFACT PACKAGING PIPELINE (R5)
==========================================================

[*] Đang thực hiện Preflight kiểm tra tài nguyên bắt buộc...
  + Đã xác minh đầy đủ 32 entrypoints cốt lõi.

[*] Đang biên dịch Tailwind CSS tĩnh (Industrial Design System)...
Rebuilding...
Done in 2239ms.
  + Đã biên dịch css/tailwind.css (59858 bytes)

[*] Đang sao chép các tệp HTML & cấu hình phát hành vào staging...
  + index.html
  + admin.html
  + products.json
[*] Đang sao chép tài nguyên tĩnh (css, js, assets) vào staging...
  + css/
  + js/
  + assets/

[*] Đang tính toán bảng băm SHA-256 cho toàn bộ artifact...
[*] Đang xúc tiến (promote) bản đóng gói staging sang dist/...

==========================================================
   BUILD HOÀN TẤT: 238 tệp đã được đóng gói an toàn
   Đích phát hành: dist/
   Manifest: dist/artifact-manifest.json
==========================================================
```
