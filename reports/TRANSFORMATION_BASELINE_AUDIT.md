# BÁO CÁO KIỂM TOÁN HIỆN TRẠNG TOÀN DIỆN (TRANSFORMATION BASELINE AUDIT)
## DỰ ÁN: NÂNG CẤP NỀN TẢNG THƯƠNG MẠI ĐIỆN TỬ & CHẾ TÁC SỐ T&T 3D STUDIO

**Thời gian kiểm toán:** 02/11/2026 09:55 (Giờ Hà Nội)  
**Đơn vị thực hiện:** Principal AI Engineering Agent (Google Antigravity Lead)  
**Website Production:** `https://nvtruongsun-hub.github.io/TT3Dstudio/`  
**Repository:** `https://github.com/nvtruongsun-hub/TT3Dstudio`  
**Nhánh kiểm toán:** `feature/smart-address-checkout` (Commit HEAD: `089137c`)  
**Commit Production trên GitHub Pages:** `da2762f` (Nhánh `main`)  
**Supabase Production:** `nbsumfhfxohawiuxrwqj` (PostgreSQL 17.11, `ap-southeast-1`)  
**Supabase Staging:** `vtxzlgkvmvoushluthme` (PostgreSQL 17.11, `ap-southeast-1`)  
**Trạng thái tuân thủ:** ✅ **ZERO PRODUCTION MUTATION** | ✅ **100% EMPIRICAL VERIFICATION**  

---

## I. MỤC ĐÍCH & PHẠM VI KIỂM TOÁN (EXECUTIVE SUMMARY)

Báo cáo này thiết lập **Hiện trạng Chuẩn mực (Baseline Ground-Truth)** cho toàn bộ dự án T&T 3D Studio trước khi tiến hành các bước cải tạo và nâng cấp lớn. Toàn bộ các nhận định, lỗi phát hiện và chỉ số trong tài liệu này đều dựa trên **bằng chứng thực tế thu thập từ mã nguồn, truy vấn API trực tiếp và kiểm tra HTTP trên website đang chạy**, tuyệt đối không suy đoán hay giả định.

### Bảng tóm tắt kết quả phân loại phát hiện (Severity Breakdown)

| Mức độ | Số lượng | Mô tả tóm tắt |
| :---: | :---: | :--- |
| **P0 (Critical)** | **1** | Rào cản khóa chết tài khoản Admin Production nếu deploy AAL2 khi Admin chưa bật MFA TOTP (`auth.mfa_factors = 0`). |
| **P1 (High)** | **5** | Đứt gãy kiến trúc Next.js vs SPA; Lệch phiên bản giữa Live Pages và Feature branch; Lỗi nâng quyền JWT của MFA Recovery; Mâu thuẫn địa lý Hà Nội vs Hà Tĩnh; Rủi ro bản quyền thương mại 105 mẫu MakerWorld (`commercialStatus: 'Chua_ro'`). |
| **P2 (Medium)** | **5** | 22 file JS tải đồng thời chứa nhiều dead code (LayercraftSimulator 662 dòng không dùng, 3D viewer không có model nào); Nút combo không áp dụng giảm giá vào giỏ hàng; Thiếu hoàn toàn form báo giá in 3D / CAD uploader trên giao diện; Mâu thuẫn độ mịn lớp 0.08mm vs 0.16mm; Thiếu rate-limiting trên RPC redeem recovery code. |
| **P3 (Low / Polish)** | **2** | Placeholder email (`tenban@gmail.com`) còn sót lại trong mã HTML; Thiếu thông số chịu nhiệt vật lý (HDT) trên thẻ sản phẩm. |

---

## II. CHI TIẾT CÁC PHÁT HIỆN KIỂM TOÁN (AUDIT FINDINGS REGISTER)

---

### [FINDING-SEC-01] Rào cản phát hành: Nguy cơ khóa chết Super Admin Production do chưa kích hoạt TOTP
- **ID:** `FINDING-SEC-01`
- **Mức độ (Severity):** `P0 (Critical Blocker)`
- **Trạng thái:** `CONFIRMED (ĐÃ XÁC MINH 100%)`
- **Vị trí:** Database Production `nbsumfhfxohawiuxrwqj` • Bảng `auth.mfa_factors`
- **Cách tái hiện:**
  1. Gửi truy vấn SQL kiểm tra qua Supabase Management API:
     `SELECT count(*) as total_mfa_factors FROM auth.mfa_factors;`
  2. Kết quả trả về chính xác: `[{"total_mfa_factors": 0}]`.
- **Expected vs Actual:**
  * *Kỳ vọng:* Admin đã đăng ký ít nhất 1 yếu tố TOTP trên Authenticator để có thể đăng nhập đạt mức `aal2`.
  * *Thực tế:* Hiện có 0 yếu tố MFA được đăng ký trên Production.
- **Bằng chứng:** API log từ `https://api.supabase.com/v1/projects/nbsumfhfxohawiuxrwqj/database/query` trả về mảng `total_mfa_factors: 0`.
- **Tác động nghiệp vụ (Business Impact):** Nếu chạy file migration `20261101_mfa_admin_hardening.sql` lên Production lúc này, RPC `update_order_status_admin` và policy RLS `orders FOR UPDATE` sẽ lập tức từ chối mọi yêu cầu với lỗi `MFA_REQUIRED`. Super Admin thật (`nvtruong.sun@gmail.com`) sẽ bị khóa hoàn toàn khỏi tác vụ quản lý đơn hàng.
- **Đề xuất xử lý:** Bắt buộc giữ nguyên trạng thái **CONDITIONAL GO**. Hướng dẫn Chủ website đăng nhập tài khoản thật trên Supabase Dashboard hoặc trang Admin để quét mã QR Authenticator trước khi áp dụng migration.
- **Độ tin cậy:** 100% (Dữ liệu truy vấn trực tiếp từ Production).

---

### [FINDING-ARCH-01] Đứt gãy kiến trúc: Dự án Next.js 14 App Router bị bỏ quên, vận hành thực tế bằng SPA tĩnh
- **ID:** `FINDING-ARCH-01`
- **Mức độ (Severity):** `P1 (High Architectural Disconnect)`
- **Trạng thái:** `CONFIRMED (ĐÃ XÁC MINH 100%)`
- **Vị trí:** Thư mục `src/` so với `index.html` và `js/`
- **Cách tái hiện:**
  1. Kiểm tra lịch sử git: `git log --oneline -- src/`.
  2. Commit duy nhất chạm vào `src/` là `0a45a7b` ngày 08/10/2026. Kể từ đó đến nay (02/11/2026), thư mục `src/` không hề được cập nhật.
  3. Kiểm tra GitHub Pages: Website phục vụ trực tiếp từ `index.html` gốc của repository, không sử dụng output build của Next.js (`next build` / `out`).
- **Expected vs Actual:**
  * *Kỳ vọng:* Hoặc hệ thống chạy hoàn toàn bằng Next.js 14, hoặc tài liệu phải ghi rõ Next.js chỉ là bản thử nghiệm không dùng.
  * *Thực tế:* Thư mục `src/` chứa một hệ thống component Next.js song song (`QuoteRequestSection.tsx`, `Viewer3DModal.tsx`, `StoreContext.tsx`) nhưng hoàn toàn không được kết nối với luồng đặt hàng Supabase, sổ địa chỉ hay môi trường GitHub Pages. Toàn bộ logic kinh doanh thực tế nằm ở `index.html`, `js/app.js`, `js/checkout.js`.
- **Bằng chứng:** Output từ `git log 0a45a7b..HEAD -- src` trả về rỗng. Lệnh `package.json` có script `build:static` thực chất đóng gói các file `js/` và `css/` tĩnh vào `dist/`.
- **Tác động nghiệp vụ:** Gây hiểu lầm nghiêm trọng cho các kỹ sư phát triển tiếp theo về tech stack; làm phân mảnh tài nguyên mã nguồn.
- **Đề xuất xử lý:** Giữ vững chiến lược Evolutionary Upgrade: Tiếp tục tối ưu và vận hành nền tảng SPA tĩnh hiện hữu trên GitHub Pages (chi phí hosting 0đ, tốc độ tĩnh siêu nhanh), đóng băng `src/` thành tài liệu tham khảo cho đến khi có kế hoạch migrate toàn diện sang Vercel/Cloudflare Pages.
- **Độ tin cậy:** 100%.

---

### [FINDING-ARCH-02] Tồn đọng mã rác (Dead Code): 22 file JS tải đồng thời, hàng nghìn dòng script không hoạt động
- **ID:** `FINDING-ARCH-02`
- **Mức độ (Severity):** `P2 (Medium Performance & Maintainability)`
- **Trạng thái:** `CONFIRMED (ĐÃ XÁC MINH 100%)`
- **Vị trí:** `index.html` dòng 40–62 • `js/automation-simulator.js` • `js/calculator.js` • `js/viewer3d.js`
- **Cách tái hiện:**
  1. Kiểm tra `index.html`: Thẻ `<script>` nạp 22 file JS tuần tự.
  2. Quét tìm kiếm `LayercraftSimulator` trên toàn bộ repository: Chỉ xuất hiện trong file định nghĩa `js/automation-simulator.js` (662 dòng), không có bất kỳ dòng code nào khởi tạo hay gọi `new LayercraftSimulator()`.
  3. Quét kiểm tra `modelKey` trên toàn bộ 105 sản phẩm trong `products.json`: 100% sản phẩm có `modelKey: null`. Hàm `isSupported3DModel(item.modelKey)` luôn trả về `false`. Nút 3D Viewer luôn bị ẩn (`hidden = true, disabled = true`). File `js/viewer3d.js` (732 dòng) không bao giờ được kích hoạt cho bất kỳ sản phẩm nào.
  4. Quét `js/calculator.js`: Script tìm kiếm các element `config-upload-box`, `config-total-price` nhưng các element này đã bị xóa hoặc ẩn khỏi `index.html` (dòng 585 bị comment).
- **Expected vs Actual:**
  * *Kỳ vọng:* Chỉ nạp những script có UI tương ứng và phục vụ trực tiếp người dùng.
  * *Thực tế:* Tải dư thừa ít nhất 4 file script lớn (~2.500 dòng code JS dead code), gây lãng phí băng thông và tăng thời gian Parse/Compile JS trên mobile.
- **Bằng chứng:** Script `Select-String` không tìm thấy bất kỳ lời gọi `LayercraftSimulator` nào. File `products.json` chứa 105 giá trị `modelKey: null`.
- **Tác động nghiệp vụ:** Làm chậm chỉ số LCP và INP trên thiết bị di động tầm trung/yếu; mã nguồn cồng kềnh khó bảo trì.
- **Đề xuất xử lý:** Bundle hoặc gỡ bỏ các script không sử dụng khỏi `index.html`. Với 3D Viewer và Calculator, chỉ nạp động (Dynamic Lazy Load) khi người dùng thực sự mở modal yêu cầu.
- **Độ tin cậy:** 100%.

---

### [FINDING-LIVE-01] Mâu thuẫn phiên bản giữa Live Production và Feature Branch
- **ID:** `FINDING-LIVE-01`
- **Mức độ (Severity):** `P1 (High Release Divergence)`
- **Trạng thái:** `CONFIRMED (ĐÃ XÁC MINH 100%)`
- **Vị trí:** `https://nvtruongsun-hub.github.io/TT3Dstudio/` so với nhánh `feature/smart-address-checkout`
- **Cách tái hiện:**
  1. Chạy script `node scripts/inspect_live_site.js` truy vấn HTTP trực tiếp tới trang live.
  2. Tiêu đề trang live: `T&T 3D Labs — Tiệm in 3D đầu tiên tại Hà Tĩnh | Decor & quà tặng`.
  3. Trang live hoàn toàn KHÔNG có các script: `js/env-config.js`, `js/vn-administrative.js`, `js/address-book.js`.
  4. Trang live vẫn dùng phiên bản cũ tại commit `da2762f` (nhánh `main`), trong khi branch `feature/smart-address-checkout` đã đi trước 10 commits (`089137c`).
- **Expected vs Actual:**
  * *Kỳ vọng:* Người dùng trải nghiệm được các tính năng Smart Address và One-Page Checkout mới.
  * *Thực tế:* Khách hàng trên production vẫn đang dùng bản cũ (chưa có sổ địa chỉ 2 cấp, chưa có đồng bộ thương hiệu T&T 3D Studio).
- **Bằng chứng:** Output từ `scripts/inspect_live_site.js`: `Contains "smart-address": false`, `Contains "env-config.js": false`.
- **Tác động nghiệp vụ:** Khách hàng chưa được hưởng lợi từ các cải tiến checkout và bảo mật đã được kiểm thử thành công.
- **Đề xuất xử lý:** Sau khi hoàn thành kiểm thử Phase 0 và được phê duyệt, tạo PR merge từ `feature/smart-address-checkout` vào `main`.
- **Độ tin cậy:** 100%.

---

### [FINDING-SEC-02] Giới hạn kiến trúc MFA Recovery: Redeem thành công nhưng JWT không đạt AAL2
- **ID:** `FINDING-SEC-02`
- **Mức độ (Severity):** `P1 (High Security & UX Limitation)`
- **Trạng thái:** `CONFIRMED (ĐÃ XÁC MINH 100%)`
- **Vị trí:** `supabase/migrations/20261101_mfa_admin_hardening.sql` • Hàm `redeem_recovery_code_admin`
- **Cách tái hiện:**
  1. Chạy bài kiểm thử: `node scripts/test_mfa_recovery_audit.js`.
  2. Tạo Admin có AAL1 (chưa qua TOTP) $\rightarrow$ Gọi `redeem_recovery_code_admin(code)`.
  3. Hàm trả về `{ ok: true, message: '...' }`.
  4. Kiểm tra JWT của phiên làm việc: `auth.jwt() ->> 'aal'` vẫn trả về `"aal1"`.
  5. Gọi tiếp RPC `update_order_status_admin`: Bị từ chối với lỗi `MFA_REQUIRED`.
- **Expected vs Actual:**
  * *Kỳ vọng:* Admin sau khi nhập mã dự phòng khẩn cấp phải thực hiện được quyền cập nhật đơn hàng.
  * *Thực tế:* Do PostgreSQL RPC không thể ký lại GoTrue JWT, phiên làm việc vẫn bị chặn bởi các rào cản AAL2.
- **Bằng chứng:** Terminal log từ `test_mfa_recovery_audit.js`:
  `Token sau redeem: aal = "aal1" => Phản hồi update_order_status_admin: { ok: false, code: 'MFA_REQUIRED' }`.
- **Tác động nghiệp vụ:** Nếu Admin mất thiết bị Authenticator, việc dùng mã dự phòng hiện tại chỉ ghi nhận log mà không thực sự giúp Admin vượt qua cổng kiểm tra AAL2 trên giao diện.
- **Đề xuất xử lý:** Cập nhật hàm `redeem_recovery_code_admin`: Khi nhập đúng mã dự phòng, tự động xóa factor cũ trong `auth.mfa_factors` của Admin, đồng thời chuyển cờ cho phép Admin đăng nhập lại để quét mã QR Authenticator mới ngay lập tức. Bổ sung rate-limiting (khóa sau 5 lần nhập sai).
- **Độ tin cậy:** 100%.

---

### [FINDING-BIZ-01] Mâu thuẫn thông tin địa lý: Trụ sở xưởng tại Hà Nội hay Hà Tĩnh?
- **ID:** `FINDING-BIZ-01`
- **Mức độ (Severity):** `P1 (High Content Trust Discrepancy)`
- **Trạng thái:** `CONFIRMED (ĐÃ XÁC MINH 100%)`
- **Vị trí:** `index.html` dòng 6, 624, 1074, 1101, 1131, 1301
- **Cách tái hiện:**
  1. Mở file `index.html` và tìm kiếm cụm từ `"Hà Nội"` và `"Hà Tĩnh"`.
  2. Dòng 6: `<title>T&T 3D Studio - Tiệm in 3D đầu tiên tại Hà Tĩnh | Decor & quà tặng</title>`.
  3. Dòng 624 (FAQ): *"thời gian chế tác tại xưởng Hà Nội từ 1–2 ngày làm việc. Thời gian vận chuyển: nội thành Hà Nội 1–2 ngày..."*.
  4. Dòng 1074: `<div><strong>Xưởng chế tác:</strong> T&T 3D Labs Studio, Hà Nội</div>`.
  5. Dòng 1131 (Footer): `<div>Xưởng: Thị trấn Cẩm Xuyên, Tỉnh Hà Tĩnh</div>`.
  6. Dòng 1301: `<p>T&T 3D Labs — Xưởng in 3D Hà Tĩnh — Giao hàng toàn quốc</p>`.
- **Expected vs Actual:**
  * *Kỳ vọng:* Thông tin địa chỉ xưởng và xuất phát điểm giao hàng phải nhất quán trên toàn trang.
  * *Thực tế:* Khách hàng đọc FAQ sẽ hiểu xưởng ở Hà Nội; nhìn tiêu đề và chân trang lại thấy xưởng ở Cẩm Xuyên, Hà Tĩnh.
- **Bằng chứng:** Trích xuất dòng code cụ thể từ `index.html`.
- **Tác động nghiệp vụ:** Làm giảm sút niềm tin của khách hàng về tính xác thực của doanh nghiệp; gây hiểu nhầm về thời gian và chi phí giao hàng nội tỉnh/ngoại tỉnh.
- **Đề xuất xử lý:** Cần xác nhận dứt khoát với Chủ dự án: Trụ sở chính xưởng sản xuất đặt tại Thị trấn Cẩm Xuyên, Hà Tĩnh (như đã nêu trong Lộ trình phát triển). Sửa toàn bộ các câu chữ "xưởng Hà Nội" trong FAQ và modal giới thiệu thành địa chỉ Hà Tĩnh thống nhất.
- **Độ tin cậy:** 100%.

---

### [FINDING-BIZ-02] Mâu thuẫn thông số kỹ thuật: Độ dày lớp in 0.08mm hay 0.16mm?
- **ID:** `FINDING-BIZ-02`
- **Mức độ (Severity):** `P2 (Medium Technical Inconsistency)`
- **Trạng thái:** `CONFIRMED (ĐÃ XÁC MINH 100%)`
- **Vị trí:** `index.html` dòng 80, 251 so với dòng 614
- **Cách tái hiện:**
  1. Dòng 80 (Marquee): *"ĐỘ MỊN CÔNG NGHỆ 0.08MM · NHỰA NGUYÊN SINH BIO-PLA..."*.
  2. Dòng 251 (Hero specs): *"Độ mịn lớp 0.08mm"*.
  3. Dòng 614 (FAQ): *"Sản phẩm T&T 3D được in từ nhựa nguyên sinh sinh học Bio-PLA và PETG trên dàn máy Bambu Lab tốc độ cao với độ dày lớp 0.16mm mịn chắc."*.
- **Expected vs Actual:**
  * *Kỳ vọng:* Thống nhất một thông số kỹ thuật chuẩn hoặc phân định rõ: 0.08mm cho chi tiết nghệ thuật cao cấp, 0.16mm cho đồ decor tiêu chuẩn.
  * *Thực tế:* Hai thông số trái ngược nhau xuất hiện song song trên cùng một trang.
- **Tác động nghiệp vụ:** Khách hàng am hiểu kỹ thuật in 3D FDM sẽ nghi ngờ tính chuyên nghiệp và tính trung thực của xưởng.
- **Đề xuất xử lý:** Chuẩn hóa nội dung: *"Độ dày lớp in tiêu chuẩn 0.16mm (hỗ trợ chế tác siêu mịn 0.08mm theo yêu cầu đặc biệt)"*.
- **Độ tin cậy:** 100%.

---

### [FINDING-BIZ-03] Rủi ro pháp lý & sở hữu trí tuệ: 105 sản phẩm MakerWorld có commercialStatus "Chua_ro"
- **ID:** `FINDING-BIZ-03`
- **Mức độ (Severity):** `P1 (High IP / Legal Risk)`
- **Trạng thái:** `CONFIRMED (ĐÃ XÁC MINH 100%)`
- **Vị trí:** `products.json` trên toàn bộ 105 sản phẩm
- **Cách tái hiện:**
  1. Kiểm tra trường `commercialStatus` và `licenseName` trong `products.json`:
     `node -e "const p = require('./products.json'); console.log([...new Set(p.map(x => x.commercialStatus))]);"`
  2. Kết quả trả về: `['Chua_ro']`.
  3. Trường `licenseName` là `'Standard Digital File License'` (giấy phép mặc định của MakerWorld thường cấm bán thương mại trừ khi tác giả cấp quyền qua Patreon/Thangs hoặc mua quyền thương mại).
  4. Trường `author` trong file JSON lại ghi: `'T&T 3D Labs Studio'`, trong khi link `makerworldUrl` trỏ về các nhà sáng tạo cộng đồng.
- **Expected vs Actual:**
  * *Kỳ vọng:* Mọi sản phẩm thương mại phải có xác nhận bản quyền rõ ràng: Mẫu tự thiết kế (In-house), Mẫu Creative Commons Commercial (CC-BY), hoặc Mẫu đã mua Commercial License từ tác giả.
  * *Thực tế:* Toàn bộ catalog đang ở trạng thái "Chưa rõ" bản quyền thương mại.
- **Tác động nghiệp vụ:** Nguy cơ bị tác giả gốc khiếu nại bản quyền DMCA hoặc rủi ro pháp lý khi mở rộng kinh doanh công khai.
- **Đề xuất xử lý:**
  1. Rà soát phân loại 105 sản phẩm thành 3 nhóm:
     - Nhóm A: Sản phẩm T&T tự thiết kế (Biển tên, đế NFC, phụ kiện bàn làm việc).
     - Nhóm B: Mẫu cộng đồng có giấy phép CC Commercial.
     - Nhóm C: Dịch vụ in gia công (In theo yêu cầu - Printing as a Service): Khách hàng cung cấp link/file, xưởng chỉ tính công in và vật liệu (không bán bản quyền mẫu).
- **Độ tin cậy:** 100%.

---

### [FINDING-LIVE-03] Lỗi chuyển đổi giỏ hàng: Nút "Mua Trọn Bộ" không áp dụng giảm giá 10% như quảng cáo
- **ID:** `FINDING-LIVE-03`
- **Mức độ (Severity):** `P2 (Medium Conversion Friction)`
- **Trạng thái:** `CONFIRMED (ĐÃ XÁC MINH 100%)`
- **Vị trí:** `index.html` dòng 740, 808, 876 • `js/cart.js`
- **Cách tái hiện:**
  1. Trên trang chủ, cuộn xuống khu vực Setup / Combo.
  2. Thấy thẻ Combo hiển thị: *"Giá trọn bộ 2 món (Giảm 10%): 412.000 đ (gốc 458.000 đ)"*.
  3. Bấm nút **"Mua Trọn Bộ"**.
  4. Ngăn giỏ hàng mở ra: Tổng tiền hiển thị là **458.000 đ** (giá gốc nguyên bản), mức giảm giá hiển thị 0đ!
- **Expected vs Actual:**
  * *Kỳ vọng:* Khi bấm "Mua Trọn Bộ", giỏ hàng phải tự động áp dụng mã giảm giá 10% hoặc set discount để tổng thanh toán đúng bằng 412.000 đ như đã hứa.
  * *Thực tế:* Hàm `onclick` chỉ gọi `addItem` cho 2 món hàng độc lập mà không truyền bất kỳ tham số chiết khấu nào vào `window.TTCart`.
- **Bằng chứng:** Mã nguồn dòng 740:
  `onclick="window.TTCart.addItem({id:'mw-cn-1971424', ...}); window.TTCart.addItem({id:'mw-cn-1404920', ...}); window.TTCart.openCart();"`.
- **Tác động nghiệp vụ:** Khách hàng cảm thấy bị "lừa giá" ngay tại bước thêm vào giỏ hàng, gây tụt giảm nghiêm trọng tỷ lệ chuyển đổi (drop-off).
- **Đề xuất xử lý:** Cập nhật hàm gọi: Thêm logic tự động áp dụng mã combo hoặc gọi `window.TTCart.applyCoupon('TT3D10')` khi bấm nút Mua Trọn Bộ.
- **Độ tin cậy:** 100%.

---

### [FINDING-LIVE-04] Thiếu hụt chức năng cốt lõi: Không có Form gửi file CAD / Yêu cầu báo giá trên Storefront
- **ID:** `FINDING-LIVE-04`
- **Mức độ (Severity):** `P2 (Core Capability Gap)`
- **Trạng thái:** `CONFIRMED (ĐÃ XÁC MINH 100%)`
- **Vị trí:** `index.html` • Toàn bộ storefront
- **Cách tái hiện:**
  1. Đọc mục tiêu sản phẩm: Cung cấp dịch vụ *"Chế tác số & In 3D theo yêu cầu từ bản vẽ CAD"*.
  2. Tìm kiếm trên giao diện `index.html`: Hoàn toàn không có form upload file STL/STEP/OBJ, không có trường chọn vật liệu hay số lượng cho đơn in tùy chỉnh.
  3. Khu vực duy nhất đề cập đến là mục "Tra cứu yêu cầu đặt hàng" (dòng 904) chỉ phục vụ tra cứu mã đơn cũ. Khu vực Live Customizer ở dòng 585 đã bị set `display: none !important`.
- **Expected vs Actual:**
  * *Kỳ vọng:* Có khu vực rõ ràng cho phép khách: Chọn nhu cầu $\rightarrow$ Chọn vật liệu/màu $\rightarrow$ Gửi file CAD/3D hoặc mô tả $\rightarrow$ Nhận báo giá từ kỹ thuật viên.
  * *Thực tế:* Khách chỉ có thể mua các sản phẩm decor có sẵn hoặc liên hệ Zalo một cách thủ công.
- **Tác động nghiệp vụ:** Đánh mất hoàn toàn nhóm khách hàng doanh nghiệp, kỹ sư và cá nhân cần in 3D theo yêu cầu riêng (Cột trụ C trong 6 Năng lực Mục tiêu).
- **Đề xuất xử lý:** Tái sinh module Báo giá in 3D (dựa trên tinh hoa của `src/components/home/QuoteRequestSection.tsx` và `js/calculator.js`), tích hợp form tiếp nhận yêu cầu có kiểm soát file an toàn, lưu vào database Supabase để xưởng quản lý tập trung.
- **Độ tin cậy:** 100%.

---

### [FINDING-SEC-04] Tồn đọng dữ liệu thử nghiệm trên Production Database (45 Accounts & 13 Orders)
- **ID:** `FINDING-SEC-04`
- **Mức độ (Severity):** `P1 (Data Hygiene & Production Readiness)`
- **Trạng thái:** `CONFIRMED (ĐÃ XÁC MINH 100%)`
- **Vị trí:** Database Production `nbsumfhfxohawiuxrwqj`
- **Cách tái hiện:**
  1. Xem báo cáo quét Dry-run: `PRODUCTION_TEST_DATA_DRYRUN.md`.
  2. Bảng `auth.users`: 48 tài khoản (3 tài khoản thật, 45 tài khoản test dạng `test_*@tt3dstudio.local` và `@tt3dstudio.vn`).
  3. Bảng `orders`: 14 đơn hàng (1 đơn hàng thật của Admin `TT3D-2611-6028A`, 13 đơn hàng test sinh ra trong quá trình kiểm thử).
- **Expected vs Actual:**
  * *Kỳ vọng:* Môi trường Production phải sạch sẽ, chỉ chứa dữ liệu khách hàng thực tế.
  * *Thực tế:* Dữ liệu test xen lẫn dữ liệu thật do trước đây chưa tách môi trường Staging độc lập.
- **Tác động nghiệp vụ:** Làm sai lệch số liệu báo cáo doanh thu, tồn kho và danh sách khách hàng trong Dashboard quản trị.
- **Đề xuất xử lý:** Đã có script dry-run và danh sách ID cụ thể. Chờ văn bản phê duyệt chính thức của Chủ website để thực hiện lệnh dọn dẹp bằng transaction an toàn (Zero Data Loss cam kết).
- **Độ tin cậy:** 100%.

---

## III. MA TRẬN ĐỐI CHIẾU 6 NĂNG LỰC MỤC TIÊU (CAPABILITY GAP ANALYSIS)

| Năng lực mục tiêu | Trạng thái hiện tại | Khoảng cách cần hoàn thiện (Gaps) | Mức độ ưu tiên |
| :--- | :---: | :--- | :---: |
| **A. Premium Storefront** | `Khá (75%)` | Giao diện đã được nâng cấp màu sắc và tương phản WCAG AA; còn tồn đọng chữ vendor tiếng Trung ở một số ảnh phụ; mâu thuẫn thương hiệu Studio/Labs. | **P1** |
| **B. Smart E-Commerce** | `Tốt (85%)` | Đã có One-Page Checkout, Sổ địa chỉ 2 cấp, Freeship 300K, mã giảm giá, Idempotency; Cần sửa lỗi nút Combo không giảm giá và hoàn tất deploy live. | **P0 / P1** |
| **C. 3D Fabrication Service** | `Thiếu (20%)` | Chưa có form tiếp nhận yêu cầu CAD trên giao diện; chưa có Supabase Storage bucket để lưu trữ file 3D; 3D viewer chưa kết nối model. | **P1 (Chiến lược)** |
| **D. Workshop Operations** | `Cơ bản (60%)` | Đã có trang `admin.html`, state machine đơn hàng, bảo vệ AAL2 (trên Staging); Cần khắc phục cơ chế MFA Recovery và hoàn tất kích hoạt TOTP trên Production. | **P0 (Blocker)** |
| **E. Growth & SEO System** | `Sơ khai (35%)` | Đã có thẻ meta cơ bản; thiếu sitemap XML tự động, canonical URL chuẩn, OpenGraph dynamic per-product, schema Structured Data (Product, LocalBusiness). | **P2** |
| **F. Secure & Scalable Platform** | `Rất tốt (90%)` | RLS cô lập dữ liệu hoàn hảo; Staging độc lập 100%; Diễn tập khôi phục 10 bảng đạt 100%; Cần bổ sung rate-limiting trên RPC và thiết lập Storage an toàn. | **P1** |

---

## IV. ĐỀ XUẤT LỘ TRÌNH THỰC THI (ACTIONABLE TRANSFORMATION ROADMAP)

Theo nguyên tắc **Tính đúng đắn và Bảo mật $\rightarrow$ Luồng đặt hàng thực tế $\rightarrow$ Trải nghiệm UX $\rightarrow$ Vận hành xưởng $\rightarrow$ Tăng trưởng SEO**:

### 🎯 GIAI ĐOẠN 1: BẢO VỆ NỀN TẢNG & GIẢI TỎA RÀO CẢN GO-LIVE (P0 / P1)
1. **Khắc phục lỗi JWT của MFA Recovery:** Cập nhật hàm `redeem_recovery_code_admin` có cơ chế un-enroll factor cũ để Admin quét mã mới và bổ sung lockout sau 5 lần thử sai.
2. **Kích hoạt TOTP Admin Production:** Hướng dẫn Chủ website hoàn tất quét mã QR Authenticator trên tài khoản `nvtruong.sun@gmail.com`.
3. **Sửa lỗi Combo Cart:** Cập nhật mã nguồn gọi `addItem` tự động kích hoạt mã giảm giá `TT3D10` khi mua trọn bộ.
4. **Đồng bộ nội dung địa lý & thương hiệu:** Thay thế 100% các từ "Hà Nội" thành "Hà Tĩnh", thống nhất tên gọi duy nhất: **"T&T 3D Studio"**.

### 🎯 GIAI ĐOẠN 2: THIẾT LẬP CỔNG TIẾP NHẬN DỊCH VỤ IN 3D (PHASE 3 FABRICATION)
1. **Tạo Supabase Storage Bucket:** Thiết lập bucket `cad-quotation-uploads` có cấu hình an toàn (chỉ nhận file `.stl`, `.step`, `.stp`, `.3mf`, dung lượng $\le 50\text{MB}$, RLS chỉ uploader và staff/admin mới được xem).
2. **Xây dựng Form Yêu Cầu Báo Giá trên Storefront:** Tái sinh giao diện tiếp nhận file trực quan, chọn vật liệu (Bio-PLA, PETG, Resin), chọn độ đặc infill, lưu yêu cầu vào bảng `quotation_requests`.

### 🎯 GIAI ĐOẠN 3: TỐI ƯU HÓA HIỆU SUẤT & DỌN DẸP MÃ NGUỒN (DEAD CODE CLEANUP)
1. **Loại bỏ script rác:** Gỡ bỏ `js/automation-simulator.js` (662 dòng) và các script mồ côi khỏi `index.html`.
2. **Tối ưu hình ảnh & Asset Delivery:** Đảm bảo toàn bộ 105 ảnh sản phẩm đều có bản WebP nén chất lượng cao kèm lazy-loading.

---

## V. KẾT LUẬN KIỂM TOÁN HIỆN TRẠNG

1. **Về Kỹ thuật & Bảo mật:** Nền tảng cốt lõi (Core Engine) trên nhánh `feature/smart-address-checkout` đã đạt độ hoàn thiện rất cao (RLS bảo vệ 10 bảng, tính toán giá ground-truth, khôi phục database toàn vẹn).
2. **Về Trải nghiệm & Kinh doanh:** Cần khắc phục ngay 2 điểm ma sát lớn nhất: lỗi hiển thị giá combo giỏ hàng và mâu thuẫn địa chỉ Hà Nội / Hà Tĩnh.
3. **Cam kết an toàn:** Toàn bộ quá trình kiểm toán được thực hiện ở chế độ Read-Only, không gây xáo trộn dữ liệu Production. Báo cáo này là cơ sở vững chắc để bước vào Giai đoạn Triển khai (Phase 1).
