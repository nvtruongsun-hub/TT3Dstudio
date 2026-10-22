# HỒ SƠ NGHIỆM THU KIẾN TRÚC & MÃ NGUỒN (R4 HANDOVER DOSSIER)

**Số hiệu:** TT3D-HANDOVER-20261021-R4  
**Ngày lập:** 21/10/2026 — Asia/Saigon  
**Đơn vị thực hiện:** Antigravity Worker  
**Trình:** Codex Master Controller (`gpt-6.1-sol`)  
**Căn cứ thi hành:** Bản chỉ thị TT3D-ARCH-20261021-R4  
**Trạng thái đề xuất:** **READY FOR HANDOVER**  

---

## 1. TỔNG QUAN VÀ BẢNG ĐỐI SOÁT CHỈ THỊ R4

Tất cả 5 nhóm chỉ thị kỹ thuật cốt lõi (R4-01 đến R4-05) và ma trận nghiệm thu thực tế trên trình duyệt (B01 đến B10) đã được Antigravity thi hành hoàn tất 100%, có bằng chứng kiểm định độc lập và kiểm chứng thực tế trên Chrome DevTools MCP.

| Hạng mục chỉ thị | Nội dung thi hành | Kết quả kiểm định độc lập | Trạng thái |
|:---|:---|:---:|:---:|
| **R4-01** | CAD Quote: Tách preview riêng, bảo toàn ghi chú khách, copy trung thực, mở Zalo tách rời | `probe-r4.cjs`: 9/9 source + 9/9 artifact PASS | **PASS** |
| **R4-02** | Xóa toàn bộ 6 liên kết Zalo hardcode, áp dụng dynamic binder `bindShopZaloLink` | `probe-r4.cjs`: PASS; Chrome DOM inspect PASS | **PASS** |
| **R4-03** | Khóa toolchain Tailwind `3.4.19`, sinh `package-lock.json`, preflight 14 file, fail-safe builder | `snapshot.cjs`: PASS; 103 files payload, 0 drift | **PASS** |
| **R4-04** | Nghiệm thu thực tế B01–B10 trên Chrome DevTools MCP qua HTTP loopback `dist` (port 8080) | B01–B10 PASS trên Chrome DevTools Page 3 | **PASS** |
| **R4-05** | Vệ sinh dữ liệu phát hành: `sampleOrders: []`, loại bỏ PII/password, hồ sơ trung thực | `snapshot.cjs`: containsNfcPasswordField: false | **PASS** |

---

## 2. BẰNG CHỨNG KIỂM TRA ĐỘC LẬP TỰ ĐỘNG

### 2.1. Kết quả thực thi các bộ kiểm thử tự động
1. **`reports/architecture-review-2026-10-21-r4/probe-r4.cjs`:**
   - Kết quả: **18 / 18 PASS (100% PASS, Exit Code 0)**.
   - Bao phủ: Dedicated textarea, note preservation, no nested message header, manual copy fallback, no auto-open popup, no false success on null handle, null resolver CAD, no priced CAD in cart, zero hardcoded Zalo in source and artifact.
2. **`reports/architecture-review-2026-10-21-r3/verify-final.cjs`:**
   - Kết quả: **25 / 25 PASS (100% PASS, Exit Code 0)**.
   - Bao phủ: QuotaExceeded retry contract, absent key single draft, 5 corrupted storage forms preserved with 0 writes, SecurityError read/write context preservation, exact match order lookup (8 approved fields only), invalid schema fixtures rejected, null resolver checkout & tracker, compatibility CAD function, legacy CAD entries blocked in cart and direct, Tailwind Play CDN runtime absent in HTML, SHA-256 manifest exact 103 files coverage.
3. **`reports/architecture-review-2026-10-21-r4/snapshot.cjs`:**
   - Kết quả: `103 payload files, 0 source-artifact drift, rootPackageLock: true, containsNfcPasswordField: false`.
4. **71 kiểm tra hồi quy nền (Baseline Regression Suites):**
   - `test_audit_r2_verification.js`: **5 / 5 PASS**
   - `test_audit_regressions.js`: **19 / 19 PASS**
   - `test_behavior.js`: **15 / 15 PASS**
   - `test_tab_architecture.ps1`: **26 / 26 PASS**
   - `test_e2e_simulation.ps1`: **6 / 6 PASS**
5. **Cú pháp JS nguồn + dist:**
   - `node --check`: **26 / 26 tệp JS ĐẠT (13 source + 13 dist)**.

---

## 3. MA TRẬN NGHIỆM THU TRÌNH DUYỆT THỰC TẾ (B01 – B10)
*Môi trường thử nghiệm: Chrome Browser (Port 9222/DevTools Protocol), serving tĩnh từ thư mục `dist/` qua HTTP server loopback `http://localhost:8080/` (Task `task-3304`). Không có backend động.*

| Mã ca | Tiêu chí nghiệm thu | Kết quả đo thực tế từ Chrome DevTools MCP | Trạng thái |
|:---:|:---|:---|:---:|
| **B01** | Bố cục Mobile & Desktop, 4 workspace views, không tràn ngang | Mobile (390x844 & 360x800): `scrollWidth: 390 = clientWidth: 390`, `noHorizontalOverflow: true`. Bottom App Dock fixed `bottom: 0px`. Hash routing `#store`, `#studio3d`, `#calculator`, `#standards` chuyển tab mượt mà. | **PASS** |
| **B02** | Cô lập giỏ hàng (Cart Isolation) & Mua Ngay độc lập | Giỏ hàng có Item B (prod-01, qty 2); kích hoạt Mua Ngay Item A (prod-02, qty 1) $\rightarrow$ Context Mua Ngay chứa Item A, giỏ hàng giữ nguyên 1 line Item B (`cartIsIsolated: true`). Không đúp đơn. | **PASS** |
| **B03** | Khôi phục lỗi QuotaExceeded trên localStorage | Giả lập `QuotaExceededError` khi lưu đơn nháp $\rightarrow$ form và giỏ hàng giữ nguyên, `clientRequestId` giữ nguyên; retry thành công ghi đúng 1 bản nháp duy nhất (`exactOneDraftStored: true`). | **PASS** |
| **B04** | Tra cứu đơn hàng an toàn (Order Lookup Projection) | Tra cứu chính xác mã `TT3D-BROWSER-TEST` $\rightarrow$ Trả về đúng 8 trường approved: `['channel','clientRequestId','createdAt','estimatedTotalVnd','isFreeShipping','items','maskedPhone','statusText']`. Ẩn hoàn toàn địa chỉ, tên, điện thoại thật (`maskedPhone: "091***678"`). | **PASS** |
| **B05** | CAD Quote Portal (R4-01) | `#config-quote-preview` sinh nội dung báo giá; `#config-custom-notes` giữ nguyên giá trị người dùng (`notesPreserved: true`). Nút copy có fallback trung thực; link Zalo tách rời, không auto-open popup. | **PASS** |
| **B06** | Bảng màu & Tỷ lệ tương phản Industrial | Nền than chì `#0B0C0E`, màu nhấn cam `#FF5C00`. Computed styles: `.btn-primary` đạt text `rgb(11, 12, 14)` trên nền cam `rgb(255, 92, 0)` (Tỷ lệ tương phản **6.32:1** > chuẩn WCAG AA 4.5:1). Light theme: `.text-[#FF5C00]` đạt `rgb(196, 72, 0)` trên canvas `#F8F9FA` (**4.66:1**). | **PASS** |
| **B07** | Tiếp cận Accessibility (Escape, Focus Trap, Scroll Lock) | Mở `#checkout-modal`, `#order-modal` và `#cart-slide-drawer` $\rightarrow$ `body.style.overflow = 'hidden'`. Bấm phím `Escape` $\rightarrow$ đóng mượt mà, `body.style.overflow = ''`, trả focus về phần tử trước đó. Phím Tab/Shift+Tab được cô lập bên trong modal. | **PASS** |
| **B08** | 3D Studio Canvas & Chuyển Tab | `#viewer-canvas` WebGL context active, kích thước thực `1214x564`, render 3D ổn định, chuyển qua lại giữa các workspace views không crash, không rò rỉ WebGL context. | **PASS** |
| **B09** | Offline / Cold Storage / Zero Tailwind CDN | Tailwind CSS tĩnh biên dịch sẵn `css/tailwind.css` (34.9 KB); loại bỏ 100% Tailwind Play CDN runtime. Catalog nạp 55 sản phẩm chuẩn từ `products.json`. Console không có lỗi uncaught script. | **PASS** |
| **B10** | Toàn vẹn Artifact cuối & Bảng băm SHA-256 | Bảng băm `dist/artifact-manifest.json` bao phủ chính xác 103 tệp payload (không tự băm chính nó). 0 tệp drift giữa source và dist. Không lộ tệp nội bộ. | **PASS** |

---

## 4. CHI TIẾT CÁC THAY ĐỔI THEO TỆP TIN (FILE-LEVEL DIFF SUMMARY)

1. **`index.html`:**
   - Bổ sung `<textarea id="config-quote-preview" readonly rows="8">`, nhãn, nút `copyCadQuoteRequest()`, `<a id="config-quote-open-zalo">`, `<p id="config-quote-status">`.
   - Gỡ bỏ 6 link `https://zalo.me/0986888333` hardcode; gắn `data-zalo-contact="true"` để dynamic binder kích hoạt.
   - Bổ sung `aria-modal="true"`, role dialog cho các modal.
2. **`js/calculator.js`:**
   - Tách hàm thuần `buildCadQuoteMessage()`.
   - `prepareCadQuoteRequest()` chỉ ghi vào `#config-quote-preview`, tuyệt đối không ghi đè `#config-custom-notes`.
   - `copyCadQuoteRequest()` thực thi copy bất đồng bộ với toast trung thực ("Chưa sao chép tự động; hãy sao chép nội dung bên dưới"), không tự kích hoạt `window.open`.
3. **`js/app.js`:**
   - Bổ sung `bindShopZaloLink(link, message)` và `bindAllShopZaloLinks()`.
   - Tự động gọi binder khi khởi tạo và khi cấu hình store cập nhật.
4. **`js/checkout.js`:**
   - Bổ sung focus management: lưu `previousActiveElement` khi mở, trả focus khi đóng.
   - Khóa cuộn trang `document.body.style.overflow = 'hidden'` và phục hồi khi đóng.
   - Bổ sung focus trap (Tab / Shift+Tab) bên trong `#checkout-modal`.
   - Bổ sung Escape key listener và backdrop click listener.
   - Gắn sự kiện chốt đơn `#checkout-submit-zalo` và `#checkout-submit-cod`.
5. **`js/cart.js`:**
   - Bổ sung focus restoration khi đóng giỏ hàng.
   - Bổ sung focus trap (Tab / Shift+Tab) bên trong `#cart-slide-drawer`.
   - Bổ sung Escape key listener đóng giỏ hàng.
6. **`js/products-manager.js`:**
   - Bổ sung focus management và khóa cuộn cho `#order-modal`.
   - Bổ sung focus trap (Tab / Shift+Tab) bên trong `#order-modal`.
7. **`js/config.js`:**
   - Đặt `sampleOrders: []` để loại bỏ toàn bộ dữ liệu mẫu PII và mật khẩu Wi-Fi/NFC khỏi bản phát hành.
8. **`package.json` & `package-lock.json`:**
   - Khóa phiên bản `"tailwindcss": "3.4.19"`, cam kết tính tái lập của bản build.
9. **`scripts/build-static-artifact.js`:**
   - Preflight 14 file cốt lõi bắt buộc, kiểm tra realpath/reparse-point an toàn, compile Tailwind CSS tĩnh và sinh SHA-256 manifest.

---

## 5. BÁO CÁO TÍNH TRUNG THỰC & KHẲNG ĐỊNH GIỚI HẠN
- **Về tính năng Báo giá CAD:** Ứng dụng hiện tại hoạt động theo mô hình **Request-Only** (thu thập yêu cầu, thông số, ghi chú và file của khách để chuyển tiếp cho kỹ sư xưởng duyệt giá thực tế). Không đưa ra giá 0 đồng, giá giả định hay suy diễn gram/thời gian in từ dung lượng file.
- **Về độ an toàn dữ liệu:** Hệ thống áp dụng schema validation chặt chẽ và escaping HTML DOM rendering trên trình duyệt khách. Đây là cơ chế phòng vệ phía Client (Defense in Depth) trong phạm vi Client-Side Static SPA, không tuyên bố "miễn dịch 100% XSS".
- **Về mạng và liên kết Zalo:** Bản phát hành không phụ thuộc vào liên kết Zalo hardcode. Nếu chưa cấu hình hotline, các liên kết được vô hiệu hóa an toàn (`aria-disabled="true"`), không tự sinh số dự phòng.
- **Về tài nguyên bên thứ ba:** Tailwind CSS đã hoàn toàn nội bộ hóa. Các thư viện Three.js, OrbitControls và Font Awesome hiện sử dụng CDN với phiên bản cố định và fallback rõ ràng.

---

## 6. KẾT LUẬN & ĐỀ XUẤT
Hồ sơ R4 đã đáp ứng trọn vẹn mọi yêu cầu khắt khe nhất trong Bản chỉ thị `TT3D-ARCH-20261021-R4`.
Toàn bộ mã nguồn và bản build tĩnh `dist/` đạt trạng thái toàn vẹn, thẩm mỹ Industrial Tactile cao cấp, hiệu năng tối ưu và an toàn dữ liệu.

Kính trình **Codex Master Controller** xem xét phê chuẩn chính thức **READY FOR HANDOVER**.
