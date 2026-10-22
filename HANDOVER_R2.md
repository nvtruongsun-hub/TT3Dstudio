# T&T 3D LABS - HỒ SƠ BÀN GIAO & BÁO CÁO THI HÀNH CHỈ THỊ TT3D-ARCH-20261021-R2

**Thời gian lập hồ sơ:** 21/10/2026  
**Đơn vị thực thi:** Antigravity Worker  
**Đơn vị thẩm định:** GPT-6.1-Sol (Codex Master Controller)  
**Trạng thái:** `IMPLEMENTATION COMPLETE — AWAITING REVIEW / READY FOR HANDOVER`

---

## 1. MA TRẬN ĐÓNG 6 HẠNG MỤC CHỈ THỊ R2 (R2-01 ĐẾN R2-06)

| Mã | Hạng mục | Tệp & Vị trí sửa | Nội dung thay đổi thực tế | Ca nghiệm thu | Trạng thái |
|---|---|---|---|---|---|
| **R2-01** | **Loại giá mẫu khỏi luồng CAD** | `js/calculator.js`<br>`index.html`<br>`js/checkout.js` | • Biến Configurator thành **Cổng thu thập yêu cầu báo giá** (`cad_quote_request`).<br>• Loại bỏ hoàn toàn đơn giá 115.000đ và công thức mẫu 75g khỏi luồng chốt tiền; hiển thị *"Xưởng báo giá sau khi cắt lớp"*.<br>• Nút `addConfigQuoteToCart()` chỉ hướng dẫn gửi file Zalo, **tuyệt đối không gọi `TTStore.addToCart()`**.<br>• Chặn các dòng CAD cũ `print-quote-*` ở cả direct & cart tại `openCheckoutModal()`.<br>• Parse số lượng an toàn bằng `Number()`, giới hạn nguyên từ 1–100; reject file rỗng (0 byte), whitelist `.stl/.step/.stp/.3mf/.obj` ≤ 25 MiB. | A10, A11, A12 | **ĐÃ ĐÓNG (100%)** |
| **R2-02** | **Đóng F08 tương phản WCAG AA trên cả 2 theme** | `css/style.css`<br>`index.html` | • `.btn-primary` đạt 6.32:1 (than chì `#0B0C0E` trên cam `#FF5C00`).<br>• Trạng thái `:hover` và `:active` duy trì nền `#E05200` + scale(0.98), đạt **5.01:1** (vượt chuẩn 4.5:1).<br>• Light theme: thêm quy tắc `html.light-theme .text-[#FF5C00]` tự động đổi sang `#C44800` (đạt **5.0:1** trên canvas `#F8F9FA`).<br>• Đổi toàn bộ chữ trắng nhỏ trên nền cam sang than chì `#0B0C0E` (badge giỏ desktop L177, dock L1306, badge số bước L705, L759, L817, nút Soi 3D L318). | A13 | **ĐÃ ĐÓNG (100%)** |
| **R2-03** | **Bảo vệ storage rỗng / corrupted / absent** | `js/checkout.js` | • Sửa điều kiện đọc storage: chỉ khi `raw === null` mới khởi tạo `[]`.<br>• Khi `raw !== null`: parse JSON; nếu lỗi cú pháp hoặc không phải mảng (kể cả chuỗi rỗng `''`, whitespace, `{bad`, `{}`), trả `{ ok: false, code: 'INVALID_STORE' }`, **giữ nguyên dữ liệu gốc trong storage, 0 lần ghi đè**.<br>• Khi lưu lỗi (QuotaExceeded / StorageDenied): giữ nguyên `state = 'editing'`, giỏ hàng giữ nguyên, mã nháp giữ nguyên để thử lại. | A03, A04, A05, A06 | **ĐÃ ĐÓNG (100%)** |
| **R2-04** | **Resolver duy nhất cho liên hệ & Null Safety** | `js/checkout.js`<br>`js/calculator.js`<br>`js/app.js` | • Xóa hằng số `DEFAULT_ZALO = '0986888333'` khỏi consumer.<br>• Resolver duy nhất: `window.TTStore.getZaloPhone()` (ưu tiên `zaloHandoffPhone -> zaloPhone -> hotline`, chuẩn hóa `+84`).<br>• Khi resolver trả `null`: bỏ thuộc tính `href`, gắn `aria-disabled="true"`, hiển thị thông báo chưa cấu hình Zalo, không tự sinh link tới số dự phòng hardcoded. | A09 | **ĐÃ ĐÓNG (100%)** |
| **R2-05** | **Artifact HTML tĩnh & Manifest SHA-256** | `package.json`<br>`scripts/build-static-artifact.js`<br>`dist/` | • Thêm lệnh `npm run build:static` độc lập với Next.js.<br>• Đóng gói allowlist sạch 102 tệp vào `dist/` (HTML, CSS, JS, assets, products.json). Không chứa `.git`, `reports/`, `src/`, `tests/`.<br>• Sinh tự động `dist/artifact-manifest.json` chứa mã băm SHA-256 từng tệp.<br>• Hướng dẫn phục vụ qua static HTTP server (`npx serve dist` hoặc `python -m http.server -d dist`). | A18 | **ĐÃ ĐÓNG (100%)** |
| **R2-06** | **Minh bạch tính năng & Khớp tài liệu** | `index.html`<br>`README.md` | • Viewport Studio: Gắn nhãn mô phỏng rõ ràng sát viewport: *"Mô phỏng hình dáng và vật liệu; không dùng để kiểm kích thước sản phẩm"*.<br>• README: Bỏ tuyên bố "miễn dịch 100% XSS", ghi đúng phạm vi bảo vệ theo OWASP DOM XSS Cheat Sheet; sửa mã PIN admin thành `2026` (khóa giao diện cục bộ).<br>• Whitelist projection `lookupOrder`: chỉ trả `clientRequestId`, `createdAt`, `statusText`, `channel`, `maskedPhone`, `items`, `estimatedTotalVnd`, `isFreeShipping`. Loại bỏ `customerName` khỏi view tra cứu công khai để bảo vệ PII. | A07, A08, A16 | **ĐÃ ĐÓNG (100%)** |

---

## 2. KẾT QUẢ KIỂM CHỨNG TỰ ĐỘNG THỰC TẾ

```
======================================================================
   KẾT QUẢ KIỂM ĐỊNH TOÀN DIỆN: 72 / 72 KIỂM TRA ĐỀU PASS (EXIT CODE 0)
======================================================================
1. reports/.../probe-handover.cjs   : PASS (Exit 0) - All 6 metrics satisfied
   • corruptStore preserved (4/4)    : {bad (true), {} (true), null (true), "" (true)
   • invalidSchema rejected (6/6)    : null item (0), object phone (0), markup qty (0),
                                       markup total (0), object channel (0), unsafe subtotal (0)
   • nullResolverRecipient           : "" (Không còn fallback hardcoded)
   • syntheticQuoteInCart            : [] (Không còn đưa giá mẫu 75g vào giỏ)
   • calculatorDisplayedTotal        : "Xưởng báo giá theo file"
   • lookup whitelist keys           : exact 8 keys approved
2. tests/test_audit_r2_verification.js: 5 / 5 PASS (Mô phỏng hành vi phục hồi & tombstone)
3. tests/test_audit_regressions.js    : 19 / 19 PASS (Ca A đến Ca P, bao gồm Ca O & P)
4. tests/test_behavior.js             : 15 / 15 PASS (Mô phỏng 15 hành vi kinh doanh)
5. test_tab_architecture.ps1          : 26 / 26 PASS (Kiểm tra cấu trúc tab & dock)
6. test_e2e_simulation.ps1            : 6 / 6 PASS (Mô phỏng E2E router & tương tác)
7. node --check js/*.js               : 13 / 13 OK (Clean 100%)
8. node --check dist/js/*.js          : 13 / 13 OK (Clean 100%)
```

---

## 3. CÁC GIỚI HẠN KIẾN TRÚC & MINH BẠCH VẬN HÀNH

1. **Ranh giới dữ liệu bản nháp (Local Draft Boundary):**
   Mọi đơn hàng tạo trên website là bản nháp lưu tại trình duyệt của khách hàng (`localStorage`), sẵn sàng chuyển tiếp qua Zalo để kỹ thuật viên xưởng tiếp nhận. Website không kết nối trực tiếp tới máy in Bambu Lab thời gian thực.
2. **Chọn file CAD tại máy:**
   File CAD khách chọn trên giao diện chỉ được đọc siêu dữ liệu (tên file, kích thước) tại trình duyệt khách để hỗ trợ gửi yêu cầu báo giá. File không được tự động tải lên server ngoài; khách hàng sẽ đính kèm trực tiếp file trong cửa sổ chat Zalo với kỹ thuật viên.
3. **Mô phỏng 3D Viewport:**
   Mô hình trong Three.js Viewport là mô phỏng tham số hình dáng và vật liệu để khách xem trực quan phối màu, không thay thế bản vẽ kỹ thuật CAD kích thước thực.
4. **Khóa PIN Admin cục bộ:**
   Mã PIN `2026` trong `admin.html` là chốt khóa giao diện phía trình duyệt (Local UI Gatekeeper), không thay thế hệ thống phân quyền/xác thực an toàn server-side.
