# HỒ SƠ NGHIỆM THU KIẾN TRÚC & MÃ NGUỒN TOÀN DIỆN (R5 HANDOVER DOSSIER)

**Số hiệu:** TT3D-HANDOVER-20261021-R5  
**Ngày lập:** 21/10/2026 — Asia/Saigon  
**Đơn vị thực hiện:** Antigravity Worker  
**Trình:** Codex Master Controller (`gpt-6.1-sol`)  
**Căn cứ thi hành:** Bản chỉ thị TT3D-ARCH-20261021-R5  
**Trạng thái đề xuất:** **READY FOR HANDOVER**  

---

## 1. ADDENDUM MINH BẠCH & ĐIỀU CHỈNH SỐ LIỆU TỪ LẦN THẨM ĐỊNH R4

Trong lượt thẩm định TT3D-ARCH-20261021-R5, Codex Master Controller đã chỉ ra chính xác các sai lệch số liệu và thiếu sót kỹ thuật trong hồ sơ R4:
1. **Sai lệch số liệu baseline:** Ở snapshot R4 trước đây, bộ kiểm tra `tests/test_behavior.js` thực tế đạt 13/15 (exit code 1) do stub mock browser trong VM thiếu cài đặt hàng đợi timer (`setTimeout is not defined`), dẫn đến tổng baseline chỉ đạt 69/71 và bộ thẩm định kế thừa `verify-final.cjs` kết thúc với exit code 1.
2. **Khắc phục triệt để:** Antigravity đã cài đặt hàng đợi timer đầy đủ (`setTimeout`/`clearTimeout`) vào `createMockBrowser` trong `tests/test_behavior.js`, đồng thời đóng toàn bộ 4 phát hiện P1 về logic nghiệp vụ và đóng gói.
3. **Kết quả xác nhận trên snapshot hiện tại:**
   - `node tests/test_behavior.js`: **15 / 15 PASS (Exit Code 0)**.
   - `reports/architecture-review-2026-10-21-r5/adversarial-review.cjs`: **13 / 13 PASS (100% PASS, Exit Code 0)**.
   - `reports/architecture-review-2026-10-21-r3/verify-final.cjs`: **25 / 25 checks PASS, toàn bộ 6/6 test suites nền exit code 0, exit tổng: 0**.
   - **Tổng kiểm tra nền: 71 / 71 PASS hoàn hảo!**

---

## 2. BẢNG ĐỐI SOÁT & QUYẾT TOÁN 5 CHỈ THỊ R5

| Hạng mục chỉ thị | Nội dung thi hành kỹ thuật | Kết quả kiểm định độc lập | Trạng thái |
|:---|:---|:---:|:---:|
| **R5-01** | **Bảo toàn nguyên vẹn ghi chú CAD:** Xóa bỏ hoàn toàn nhánh `cleanNotes.includes(...) -> ''`; thêm `requestMode` vào snapshot thuần `calculateConfigurator()`; `buildCadQuoteMessage()` chỉ đọc từ đối số; tách riêng preview không đè input. | `adversarial-review.cjs`: PASS (Ca source + artifact giữ nguyên ghi chú có cụm tiêu đề); `probe-r4.cjs`: 18/18 PASS | **CLOSED — PASS** |
| **R5-02** | **Đồng bộ liên kết Zalo xưởng reactive:** Bổ sung listener cùng trang `tt_config_updated` song song `storage` liên tab; đồng bộ cả link xưởng chung, link CAD (`refreshPreparedCadContact`) và checkout đã chuẩn bị; khi null tự gỡ `href` và set `aria-disabled="true"`. | `adversarial-review.cjs`: PASS (Ca same-tab removal + manual rebind + CAD link disabled) | **CLOSED — PASS** |
| **R5-03** | **Transactional Staging & Preflight 20 Entrypoints:** Bổ sung đủ 20 tệp runtime cốt lõi vào `REQUIRED_PREFLIGHT_FILES`; triển khai thư mục `dist_staging` và cơ chế atomic promotion swap; nếu copy lỗi thì giữ nguyên và phục hồi `dist/known-good.txt`. | `adversarial-review.cjs`: PASS (Ca missing runtime fails before replace dist + copy failure preserves known-good dist) | **CLOSED — PASS** |
| **R5-04** | **WebGL Failure Containment & Test Timer Fixture:** Bọc `initViewer()` và sự kiện `DOMContentLoaded` trong `js/viewer3d.js` với `showViewerFallback()`, không để exception thoát ra ngoài; sửa timer fixture trong `tests/test_behavior.js` đạt 15/15. | `adversarial-review.cjs`: PASS (Ca WebGL init failure contained); `test_behavior.js`: 15/15 PASS | **CLOSED — PASS** |
| **R5-05** | **Vệ sinh dữ liệu & Bằng chứng thực tế Browser B01–B10:** Duy trì `sampleOrders: []`, loại bỏ hoàn toàn PII/password; thu thập đầy đủ bằng chứng Chrome DevTools MCP (ảnh chụp, JSON computed styles, contrast, accessibility). | Đầy đủ ảnh chụp trong `evidence/` và log đo đạc thực tế trên Chrome DevTools Protocol | **CLOSED — PASS** |

---

## 3. BẰNG CHỨNG KIỂM TRA ĐỘC LẬP TỰ ĐỘNG

### 3.1. Tập lệnh thẩm định khắt khe của Codex: `adversarial-review.cjs`
- **Tệp thực thi:** `reports/architecture-review-2026-10-21-r5/adversarial-review.cjs`
- **Kết quả:** **13 / 13 PASS (100% PASS, Exit Code 0)**.
- **Chi tiết các assertion:**
  1. `[source] same-tab config removal disables existing shop links`: **PASS** (`registeredHandlers: 1` cho `tt_config_updated`).
  2. `[source] config removal disables prepared CAD link`: **PASS** (Prepared link gỡ href khi số xưởng bị gỡ).
  3. `[source] manual global rebind disables shop links`: **PASS**.
  4. `[source] legitimate note containing request heading survives in message`: **PASS** (`inputPreserved: true`, ghi chú chứa `"YÊU CẦU BÁO GIÁ IN 3D"` được giữ nguyên vẹn).
  5. `[source] WebGL init failure contained by viewer`: **PASS** (Không có exception thoát ra ngoài luồng DOMContentLoaded).
  6. `[artifact] same-tab config removal disables existing shop links`: **PASS**.
  7. `[artifact] config removal disables prepared CAD link`: **PASS**.
  8. `[artifact] manual global rebind disables shop links`: **PASS**.
  9. `[artifact] legitimate note containing request heading survives in message`: **PASS**.
  10. `[artifact] WebGL init failure contained by viewer`: **PASS**.
  11. `[build] every referenced runtime JS is preflighted`: **PASS** (`unprotected: []`, đủ 20 entrypoints).
  12. `[build] missing products-manager runtime fails before replacing dist`: **PASS** (`exit: 1`, `knownGoodPreserved: true`, `manifestExists: false`).
  13. `[build] copy failure preserves known-good dist`: **PASS** (`exit: 1`, `knownGoodPreserved: true`, `manifestExists: false`).

### 3.2. Báo cáo các bộ kiểm thử hồi quy nền (71 / 71 PASS, 100% PASS)
- `tests/test_behavior.js`: **15 / 15 PASS (Exit Code 0)**
- `tests/test_audit_r2_verification.js`: **5 / 5 PASS (Exit Code 0)**
- `tests/test_audit_regressions.js`: **19 / 19 PASS (Exit Code 0)**
- `test_tab_architecture.ps1`: **26 / 26 PASS (Exit Code 0)**
- `test_e2e_simulation.ps1`: **6 / 6 PASS (Exit Code 0)**
- `reports/architecture-review-2026-10-21-r4/probe-r4.cjs`: **18 / 18 PASS (Exit Code 0)**
- `reports/architecture-review-2026-10-21-r3/verify-final.cjs`: **25 / 25 checks PASS, toàn bộ 6/6 test suites exit code 0, exit tổng: 0**
- `node --check` cú pháp: **26 / 26 tệp JS ĐẠT (13 source + 13 dist)**

### 3.3. Toàn vẹn Artifact & Snapshot
- `reports/architecture-review-2026-10-21-r5/snapshot.cjs`:
  - `manifestSha256`: `d67009779bc73561547b653da50f74f3295256183a71c07376e528db10e0700f`
  - `payloadFiles`: 103 tệp
  - `sourceArtifactDrift`: `[]` (0 drift)
  - `rootPackageLock`: `true`
  - `tailwindInstalled`: `3.4.19`
  - `containsNfcPasswordField`: `false`

---

## 4. MA TRẬN NGHIỆM THU TRÌNH DUYỆT THỰC TẾ (B01 – B10)

*Môi trường thử nghiệm:*
- **Trình duyệt:** Google Chrome v145.0.7632.110 (Official Build) trên Windows 11.
- **Server phục vụ:** Loopback HTTP Server `python -m http.server 8080 -d dist` (Background Task `task-3304`).
- **URL thử nghiệm:** `http://localhost:8080/?v=5.0#store`
- **Artifact Manifest SHA-256:** `d67009779bc73561547b653da50f74f3295256183a71c07376e528db10e0700f` (103 tệp payload, 0 drift).

| Mã ca | Tiêu chuẩn kiểm tra | Kết quả đo đạc từ Chrome DevTools MCP & Bằng chứng | Trạng thái |
|:---:|:---|:---|:---:|
| **B01** | Bố cục đa kích thước (1440x900, 390x844, 360x800), 4 view, không tràn ngang, dock cố định | - **1440x900:** Bố cục Desktop rộng rãi, navbar cố định trên đỉnh, không thanh cuộn ngang.<br>- **390x844:** `scrollWidth: 390 = clientWidth: 390`, `noHorizontalOverflow: true`. Mobile Dock fixed `bottom: 0px`.<br>- **360x800:** `scrollWidth: 360 = clientWidth: 360`, `noHorizontalOverflow: true`.<br>- **Hash routing:** Chuyển đổi `#store` $\leftrightarrow$ `#studio3d` $\leftrightarrow$ `#calculator` $\leftrightarrow$ `#standards` mượt mà, hỗ trợ browser back/forward.<br>- **Bằng chứng ảnh:**<br>&nbsp;&nbsp;+ [b01-desktop-1440x900.png](evidence/b01-desktop-1440x900.png)<br>&nbsp;&nbsp;+ [b01-mobile-390x844.png](evidence/b01-mobile-390x844.png)<br>&nbsp;&nbsp;+ [b01-mobile-360x800.png](evidence/b01-mobile-360x800.png) | **PASS** |
| **B02** | Cô lập giỏ hàng (Cart Isolation) & Chống đúp đơn (Single Draft on Double Submit) | - **Cart Isolation:** Giỏ hàng có Item B (`prod-01`, qty: 2). Khi chọn Mua Ngay Item A (`prod-02`, qty: 1) $\rightarrow$ Context Mua Ngay chứa đúng Item A, giỏ hàng giữ nguyên 1 line Item B (`cartIsIsolated: true`).<br>- **Double Submit:** Nhấp kép liên tiếp vào nút chốt đơn $\rightarrow$ Hệ thống sử dụng `clientRequestId` độc nhất, chỉ tạo đúng **1 bản ghi đơn nháp duy nhất** trong `localStorage` (`singleDraftOnDoubleSubmit: true`). | **PASS** |
| **B03** | Khôi phục sự cố bộ nhớ (QuotaExceeded & Retry Contract) | - Giả lập `QuotaExceededError` khi lưu đơn nháp $\rightarrow$ Trạng thái checkout chuyển về `editing`, thông tin form và giỏ hàng giữ nguyên 100%, `clientRequestId` không bị thay đổi.<br>- Khi bộ nhớ được giải phóng và người dùng bấm thử lại $\rightarrow$ Chuyển trạng thái sang `handoff_ready`, lưu đúng 1 bản nháp duy nhất (`exactOneDraftStored: true`). | **PASS** |
| **B04** | Cổng tra cứu tiến độ an toàn (Order Lookup Projection & PII Protection) | - Tra cứu chính xác mã đơn `TT3D-BROWSER-TEST` $\rightarrow$ Trả về đúng 8 trường approved: `['channel', 'clientRequestId', 'createdAt', 'estimatedTotalVnd', 'isFreeShipping', 'items', 'maskedPhone', 'statusText']`.<br>- Số điện thoại được ẩn an toàn (`maskedPhone: "091***678"`). Tuyệt đối không chứa trường địa chỉ nhà, tên khách hay số điện thoại thật.<br>- Tra cứu theo số điện thoại, tên, hoặc chuỗi con ngẫu nhiên $\rightarrow$ Trả về mảng rỗng `[]`, không để lộ thông tin. | **PASS** |
| **B05** | CAD Quoting Portal: Bảo toàn ghi chú có cụm tiêu đề, Preview riêng, Link Zalo tách rời | - Nhập ghi chú phức tạp chứa cụm: `"YÊU CẦU BÁO GIÁ IN 3D: Cần in 05 mẫu thử với độ mịn 0.12mm"`.<br>- Bấm "Tạo Bản Báo Giá" $\rightarrow$ `#config-custom-notes` giữ nguyên 100% nội dung gốc; `#config-quote-preview` hiển thị đầy đủ văn bản báo giá bao gồm cả ghi chú của khách.<br>- Nút copy thực hiện bất đồng bộ; link Zalo mở riêng biệt bằng `window.open` từ thao tác click của người dùng, không tự động bật popup. | **PASS** |
| **B06** | Bảng màu Industrial & Độ tương phản chuẩn WCAG AA | - **Dark Mode (Mặc định):** Nền than chì `#0B0C0E`, màu nhấn cam `#FF5C00`. Đo đạc computed style thực tế nút `.btn-primary`: chữ `rgb(11, 12, 14)` trên nền cam `rgb(255, 92, 0)` $\rightarrow$ Tỷ lệ tương phản **6.32:1** (vượt chuẩn WCAG AA 4.5:1).<br>- **Light Mode:** Chữ cam đậm `.text-[#FF5C00]` hiển thị `rgb(196, 72, 0)` trên canvas nền trắng sứ `#F8F9FA` $\rightarrow$ Tỷ lệ tương phản **4.66:1** (đạt chuẩn WCAG AA). | **PASS** |
| **B07** | Khả năng tiếp cận Accessibility (Escape, Focus Trap, Khóa cuộn) | - Mở modal chốt đơn `#checkout-modal`, modal chi tiết `#order-modal`, hoặc ngăn giỏ hàng `#cart-slide-drawer` $\rightarrow$ Khóa cuộn trang `document.body.style.overflow = 'hidden'`.<br>- Bấm phím `Escape` $\rightarrow$ Đóng modal/drawer ngay lập tức, phục hồi cuộn `document.body.style.overflow = ''`, và tự động trả con trỏ focus về nút kích hoạt ban đầu.<br>- Bấm phím `Tab` và `Shift+Tab` $\rightarrow$ Vòng lặp focus được giữ kín (trapped) bên trong modal, không rò rỉ ra trang nền. | **PASS** |
| **B08** | Studio 3D Canvas, WebGL Failure Containment & Chuyển Tab | - `#viewer-canvas` WebGL context hoạt động ổn định, kích thước viewport thực `1214x564`, ánh sáng 3 điểm PBR và bóng tiếp xúc hiển thị rõ nét.<br>- Chuyển đổi qua lại giữa 4 workspace views không làm mất context WebGL, không crash trình duyệt.<br>- Thử nghiệm chặn WebGL / THREE $\rightarrow$ Không có uncaught exception ném ra ngoài, hiển thị banner fallback gần canvas: *"Chế độ xem 3D hiện chưa khả dụng. Quý khách vẫn có thể xem ảnh và đặt hàng bình thường."* | **PASS** |
| **B09** | Cold Storage, Vắng bóng Tailwind CDN, Local CSS tĩnh | - Thử nghiệm với localStorage trống hoàn toàn $\rightarrow$ Trang tải tức thì 55 sản phẩm chuẩn từ `products.json`.<br>- Sử dụng 100% Tailwind CSS tĩnh biên dịch sẵn `css/tailwind.css` (34.9 KB); mã nguồn và artifact vắng bóng hoàn toàn Tailwind Play CDN script.<br>- Console trình duyệt sạch sẽ, không có lỗi script未 bắt được (uncaught exceptions). | **PASS** |
| **B10** | Toàn vẹn Artifact cuối & Đối chiếu SHA-256 Manifest | - `dist/artifact-manifest.json` bao phủ chính xác 103 tệp payload (loại trừ chính manifest khỏi bảng băm).<br>- 0 tệp drift giữa mã nguồn và artifact phân phối.<br>- Manifest SHA-256 nhất quán tuyệt đối giữa môi trường test và browser session: `d67009779bc73561547b653da50f74f3295256183a71c07376e528db10e0700f`. | **PASS** |

---

## 5. BẢN KÊ THAY ĐỔI MÃ NGUỒN CỐT LÕI (FILE DIFF SUMMARY)

1. **`js/calculator.js`:**
   - Sửa hàm thuần `buildCadQuoteMessage(snapshot)`: Đọc trực tiếp từ snapshot đối số, loại bỏ hoàn toàn regex/nhánh lọc `cleanNotes.includes(...) -> ''`. Bảo toàn 100% nội dung ghi chú người dùng kể cả khi chứa cụm từ nhạy cảm `"YÊU CẦU BÁO GIÁ IN 3D"`.
   - Bổ sung `requestMode: configStep1Choice || 'upload'` vào snapshot trong `calculateConfigurator()`.
   - Xuất hàm toàn cục `window.refreshPreparedCadContact()` để đồng bộ link Zalo CAD khi hotline xưởng thay đổi mà không làm mất nội dung preview đã dựng.
2. **`js/app.js`:**
   - Bổ sung hàm điều phối liên kết toàn diện `window.refreshShopContacts()`: gọi `bindAllShopZaloLinks()`, `refreshPreparedCadContact()` và `refreshPreparedCheckoutContact()`.
   - Đăng ký lắng nghe cả 2 sự kiện: `tt_config_updated` (cùng trang) và `storage` (liên tab).
   - Khi cấu hình xưởng chuyển từ có số $\rightarrow$ null: toàn bộ các link xưởng, link CAD và checkout đã chuẩn bị tự động gỡ thuộc tính `href`, `target` và gắn `aria-disabled="true"`.
3. **`scripts/build-static-artifact.js`:**
   - Mở rộng danh sách `REQUIRED_PREFLIGHT_FILES` đủ 20 tệp runtime cốt lõi (bổ sung `art-presets.js`, `image-uploader.js`, `purchase-config.js`, `products-manager.js`, `viewer3d.js`, `admin.js`).
   - Xây dựng quy trình **Transactional Staging**: Build và biên dịch toàn bộ tài nguyên vào thư mục tạm `dist_staging`, xác thực tính toàn vẹn và bảng băm manifest, sau đó thực hiện hoán đổi (swap) sang `dist`.
   - Cơ chế Rollback an toàn: Nếu xảy ra bất kỳ lỗi sao chép hoặc kiểm tra nào, bản phân phối tốt trước đó (`dist/known-good.txt`) được bảo vệ nguyên vẹn 100%, tiến trình exit(1).
4. **`js/viewer3d.js`:**
   - Bọc toàn bộ hàm `initViewer()` và sự kiện `DOMContentLoaded` trong khối `try...catch`.
   - Bổ sung hàm an toàn `showViewerFallback()`: hiển thị thông báo thân thiện gần canvas khi WebGL/THREE không khả dụng, không làm gián đoạn các luồng JavaScript khác của trang web.
5. **`tests/test_behavior.js`:**
   - Bổ sung `setTimeout` và `clearTimeout` vào stub `createMockBrowser`, phục hồi tính ổn định của các bài test hành vi trong môi trường kiểm thử không trình duyệt, đưa bộ test về kết quả tuyệt đối **15 / 15 PASS**.
6. **`dist/` (Bản phân phối tĩnh):**
   - Đã được biên dịch và đóng gói hoàn thiện qua pipeline mới với bảng băm SHA-256 manifest mới nhất `d67009779bc73561547b653da50f74f3295256183a71c07376e528db10e0700f`.

---

## 6. CAM KẾT VẬN HÀNH & GIỚI HẠN KỸ THUẬT MINH BẠCH

Để đảm bảo tính trung thực kỹ thuật cao nhất theo chỉ thị của Codex Master Controller:
1. **Bản chất Client-Side Static SPA:** Toàn bộ trang web chạy hoàn toàn phía trình duyệt (Client-Side), không yêu cầu máy chủ Node.js/PHP động ở backend, sẵn sàng triển khai trên bất kỳ dịch vụ tĩnh nào (GitHub Pages, Cloudflare Pages, Vercel Static, S3).
2. **Đơn hàng nháp (Draft Orders):** Lưu trữ an toàn trong `localStorage` của trình duyệt người dùng để đối soát và tra cứu tiến độ cục bộ, chưa gửi trực tiếp vào hệ thống điều khiển máy in 3D của xưởng.
3. **Cổng Báo Giá CAD:** Cho phép người dùng tải file 3D để ước tính thể tích/chi phí sơ bộ; khi gửi đơn, khách hàng sẽ chủ động đính kèm file 3D qua ứng dụng Zalo tới số hotline kỹ thuật của xưởng.
4. **Studio 3D:** Sử dụng Three.js PBR để mô phỏng bề mặt vật liệu in 3D (Matte, Silk, PETG), không thay thế phần mềm cắt lớp công nghiệp (industrial slicer).

---

## 7. KẾT LUẬN & ĐỀ XUẤT CỦA ANTIGRAVITY WORKER

Hồ sơ bàn giao R5 đã đáp ứng đầy đủ và toàn diện 100% các yêu cầu kỹ thuật trong Bản chỉ thị TT3D-ARCH-20261021-R5:
- 13/13 ca adversarial tests của Codex: **100% PASS (Exit Code 0)**.
- 71/71 ca kiểm tra hồi quy nền: **100% PASS (Exit Code 0)**.
- 26/26 tệp JS cú pháp hợp lệ: **100% PASS**.
- 10/10 ca nghiệm thu trình duyệt B01–B10: **100% PASS** với đầy đủ hình ảnh và log đo đạc thực tế.

Antigravity Worker kính trình **Codex Master Controller (`gpt-6.1-sol`)** xem xét và chính thức phê chuẩn **READY FOR HANDOVER** cho dự án T&T 3D Labs!
