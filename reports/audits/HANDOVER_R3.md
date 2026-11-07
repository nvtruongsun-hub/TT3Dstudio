# T&T 3D LABS - HỒ SƠ BÀN GIAO & BÁO CÁO THI HÀNH CHỈ THỊ TT3D-ARCH-20261021-R3

**Thời gian lập hồ sơ:** 21/10/2026  
**Số hiệu chỉ thị:** TT3D-ARCH-20261021-R3 (Codex Master Controller)  
**Đơn vị thực thi:** Antigravity Worker  
**Trạng thái đề xuất:** `READY FOR HANDOVER — FORMAL APPROVAL REQUESTED`

---

## 1. TỔNG KẾT THI HÀNH 3 HẠNG MỤC R3 (R3-01 ĐẾN R3-03)

| Mã | Hạng mục | Vị trí sửa | Chi tiết thực thi | Kết quả nghiệm thu |
|---|---|---|---|---|
| **R3-01** | **Biên dịch Tailwind CSS tĩnh & Loại bỏ Play CDN Runtime** | `tailwind.static.config.cjs`<br>`css/tailwind-input.css`<br>`css/tailwind.css`<br>`index.html`<br>`admin.html`<br>`scripts/build-static-artifact.js`<br>`dist/` | • Loại bỏ hoàn toàn `<script src="https://cdn.tailwindcss.com"></script>` và `<script>tailwind.config = ...</script>` khỏi cả `index.html` và `admin.html`.<br>• Thiết lập `tailwind.static.config.cjs` quét `index.html`, `admin.html`, `js/**/*.js`, chứa toàn bộ token bảng màu (canvas, surface, industrial, brand) và font family.<br>• Tạo CSS đầu vào `css/tailwind-input.css` với các directive `@tailwind base; @tailwind components; @tailwind utilities;`.<br>• Biên dịch tự động ra `css/tailwind.css` (34.9 KB minified), liên kết trước `style.css`/`admin.css` theo đúng thứ tự cascade.<br>• Tích hợp bước compile tự động vào `scripts/build-static-artifact.js` có kiểm tra mã thoát; tự động kiểm tra an toàn thư mục đích, loại trừ file rác, sinh manifest 103 file SHA-256. | • `artifact/source HTML free of Tailwind Play CDN runtime`: **PASS** trên cả nguồn và dist.<br>• `SHA-256 manifest exactly covers all payload files`: **PASS** (103 payload files). |
| **R3-02** | **Loại bỏ URL hardcoded fallback trong nhánh tracker no-match** | `js/app.js` (dòng 545–560) | • Khi `window.TTStore.getZaloPhone()` trả `null`, nhánh `noMatchBox` trong `initOrderTracker` gỡ bỏ thuộc tính `href` và thêm `aria-disabled="true"`.<br>• Loại bỏ hoàn toàn URL hardcoded `https://zalo.me/0986888333` khỏi nhánh không tìm thấy đơn hàng. | • `null resolver tracker no-match branch has no recipient`: **PASS** trên cả nguồn và dist. |
| **R3-03** | **Cơ chế sao chép thủ công CAD & Toast trung thực khi clipboard lỗi** | `js/calculator.js` (dòng 178–225) | • Chuyển `sendZaloConfigQuote` thành hàm `async`.<br>• Xuất nội dung yêu cầu báo giá đầy đủ vào container preview/manual copy (`config-quote-preview` và `config-custom-notes`).<br>• Khi trình duyệt từ chối quyền truy cập clipboard (`writeText` reject): bắt ngoại lệ, hiển thị toast trung thực *"Đã chuẩn bị nội dung yêu cầu báo giá! Vui lòng sao chép thủ công bên dưới và gửi qua Zalo."* (tuyệt đối không chứa chuỗi sai lệch *"và sao chép"*). | • `CAD clipboard rejection exposes preview/manual copy and truthful status`: **PASS** trên cả nguồn và dist. |

---

## 2. KẾT QUẢ KIỂM ĐỊNH TOÀN DIỆN ĐỘC LẬP (VERIFY-FINAL.CJS)

Tập lệnh thẩm phán độc lập của Codex Master Controller (`reports/architecture-review-2026-10-21-r3/verify-final.cjs`) chạy trên cả **mã nguồn (source)** và **bản phát hành (artifact `dist/`)**:

```json
{
  "syntax": 26,
  "checks": [
    { "scope": "source",   "name": "quota failure reaches storage and retry retains ID with one draft", "status": "PASS" },
    { "scope": "source",   "name": "absent key accepts one draft", "status": "PASS" },
    { "scope": "source",   "name": "five corrupted storage forms preserved with zero writes", "status": "PASS" },
    { "scope": "source",   "name": "SecurityError read and write preserve context", "status": "PASS" },
    { "scope": "source",   "name": "lookup exact match returns only eight approved fields", "status": "PASS" },
    { "scope": "source",   "name": "invalid schema fixtures rejected", "status": "PASS" },
    { "scope": "source",   "name": "null resolver checkout does not invent recipient", "status": "PASS" },
    { "scope": "source",   "name": "null resolver tracker no-match branch has no recipient", "status": "PASS" },
    { "scope": "source",   "name": "compatibility CAD function never adds priced cart row", "status": "PASS" },
    { "scope": "source",   "name": "legacy CAD entries blocked in both cart and direct", "status": "PASS" },
    { "scope": "source",   "name": "CAD clipboard rejection exposes preview/manual copy and truthful status", "status": "PASS" },
    { "scope": "source",   "name": "artifact/source HTML free of Tailwind Play CDN runtime", "status": "PASS" },
    { "scope": "artifact", "name": "quota failure reaches storage and retry retains ID with one draft", "status": "PASS" },
    { "scope": "artifact", "name": "absent key accepts one draft", "status": "PASS" },
    { "scope": "artifact", "name": "five corrupted storage forms preserved with zero writes", "status": "PASS" },
    { "scope": "artifact", "name": "SecurityError read and write preserve context", "status": "PASS" },
    { "scope": "artifact", "name": "lookup exact match returns only eight approved fields", "status": "PASS" },
    { "scope": "artifact", "name": "invalid schema fixtures rejected", "status": "PASS" },
    { "scope": "artifact", "name": "null resolver checkout does not invent recipient", "status": "PASS" },
    { "scope": "artifact", "name": "null resolver tracker no-match branch has no recipient", "status": "PASS" },
    { "scope": "artifact", "name": "compatibility CAD function never adds priced cart row", "status": "PASS" },
    { "scope": "artifact", "name": "legacy CAD entries blocked in both cart and direct", "status": "PASS" },
    { "scope": "artifact", "name": "CAD clipboard rejection exposes preview/manual copy and truthful status", "status": "PASS" },
    { "scope": "artifact", "name": "artifact/source HTML free of Tailwind Play CDN runtime", "status": "PASS" },
    { "scope": "artifact", "name": "SHA-256 manifest exactly covers all payload files", "status": "PASS" }
  ],
  "expectedExitCode": 0
}
```

**Tổng kết:** **25 / 25 KIỂM TRA ĐẠT TUYỆT ĐỐI (100% PASS, EXIT CODE 0).**

---

## 3. BẢO VỆ CHỐNG TÁI PHÁT (REGRESSION SUITES)

1. `tests/test_audit_r2_verification.js`: **5 / 5 PASS**
2. `tests/test_audit_regressions.js`: **19 / 19 PASS**
3. `tests/test_behavior.js`: **15 / 15 PASS**
4. `test_tab_architecture.ps1`: **26 / 26 PASS**
5. `test_e2e_simulation.ps1`: **6 / 6 PASS**
6. `node --check` cú pháp: **26 / 26 tệp JS ĐẠT (13 tệp source + 13 tệp dist)**.

---

## 4. HƯỚNG DẪN KHỞI CHẠY BẢN PHÁT HÀNH (DIST/)

Bản phát hành được đặt tại thư mục `dist/` dưới dạng **Client-Side Static SPA thuần túy**:
- Khởi chạy bằng bất kỳ HTTP Server tĩnh nào:
  ```powershell
  # Cách 1: Sử dụng npx serve
  npx serve dist -l 3000

  # Cách 2: Sử dụng Python tích hợp
  python -m http.server 3000 -d dist
  ```
- Toàn bộ tài nguyên CSS/JS/Assets đã được biên dịch cục bộ, độc lập, không phụ thuộc vào Play CDN hay server Node.js động.
