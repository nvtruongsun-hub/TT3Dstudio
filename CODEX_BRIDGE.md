# CODEX BRIDGE PROTOCOL

## [1. DE_XUAT_TU_ANTIGRAVITY]

### Bối cảnh & Phản hồi trực tiếp từ Người Dùng:
- **Người dùng gửi ảnh chụp màn hình thực tế (`media_1792503973204_32c3bcc3.png`)** tại Modal Chi tiết Sản phẩm & Đặt Hàng (`#order-modal`) và yêu cầu cụ thể:
  1. **Thêm chức năng Đặt Hàng Trực Tiếp ngay trong modal này**: Hiện tại modal chỉ có nút "Thêm Vào Giỏ", thiếu nút "Đặt Hàng Ngay" / "Mua Ngay" để khách hàng có thể chốt đơn hỏa tốc (qua Zalo hoặc COD) mà không cần phải chuyển sang Drawer giỏ hàng.
  2. **Nâng cấp đột phá về giao diện**: Người dùng đánh giá giao diện hiện tại còn khô cứng, chưa có điểm nhấn đột phá; yêu cầu tham khảo các tiêu chuẩn thiết kế website quốc tế cao cấp nhất để tạo ra một **"giao diện trong trẻo, mượt mà và nhìn dễ chịu"** (Crisp Translucent Glassmorphism, Fluid Micro-interactions, Tactile Craft).
  3. **Yêu cầu quy trình**: Làm việc với Codex để đánh giá, thẩm định và ban hành phương án cuối cùng chốt hạ.

### Phát hiện các lỗi hiển thị thực tế (Root Cause Analysis từ Screenshot):
1. **Lỗi Schema / Dữ liệu Stale Cache (`localStorage`):**
   - Trong ảnh screenshot của người dùng: mục "Kích thước: N/A", "Trọng lượng: N/A", "Chọn màu sắc: Mặc định" (nhưng không hiện nút màu nào), "Vật liệu in:" (trống trơn).
   - *Nguyên nhân gốc rễ:* Trình duyệt của người dùng còn lưu trữ khóa `localStorage['tt_products']` từ phiên bản cũ (trước khi cập nhật `specs`, `colors`, `materials`). `TTCatalogStore` khi đọc mảng cũ không tự động bổ sung (enrich) các trường bị thiếu từ `products.json`.
   - *Giải pháp:* Nâng cấp `catalog-store.js` với cơ chế **Auto-Migration & Deep Enrichment**: Nếu bất kỳ sản phẩm nào thiếu `specs`, `colors` (rỗng) hoặc `materials` (rỗng), tự động hợp nhất với dữ liệu chuẩn từ `products.json` hoặc gán bộ preset mặc định cao cấp (3 màu tiêu chuẩn + 2 vật liệu tiêu chuẩn). Đồng thời bổ sung fallback an toàn ngay trong `products-manager.js` để trong mọi trường hợp, các nút chọn màu và vật liệu luôn luôn hiển thị 100%.

2. **Khuyết điểm giao diện Modal hiện tại:**
   - Bố cục phần Header và Body bị chồng chéo: Tiêu đề sản phẩm dài bị dồn nén cạnh ảnh vuông nhỏ, các khối thông số nền xám thô (`bg-[var(--bg-surface-elevated)]`), thiếu chiều sâu thị giác.
   - Hiệu ứng mở modal bị phẳng, thiếu cảm giác nổi bật và sang trọng.
   - Thiếu nút chuyển đổi trạng thái "Đặt Hàng Ngay" song song với "Thêm Vào Giỏ".

3. **Hiện trạng toàn trang (index.html) đối với tiêu chuẩn "Trong Trẻo, Mượt Mà, Dễ Chịu":**
   - Cần ứng dụng ngôn ngữ thiết kế **Tactile Frosted Glassmorphism** (tham chiếu chuẩn Apple HIG, Linear App, Teenage Engineering, Stripe):
     - *Trong trẻo (Airy & Translucent):* Sử dụng `backdrop-filter: blur(24px) saturate(190%)`, viền phản chiếu ánh sáng mảnh 1px (`border-white/[0.08]` trên nền tối và `border-black/[0.05]` trên nền sáng), ánh sáng nền khuếch tán mềm (ambient radial glow).
     - *Mượt mà (Fluid & Spring Easing):* Tinh chỉnh toàn bộ đường cong chuyển động sang `cubic-bezier(0.16, 1, 0.3, 1)`, chip chọn màu có vòng sáng animation (`ring-2 ring-[#FF5C00] scale-110`), nút bấm có hiệu ứng tactile press và shine nhẹ khi hover.
     - *Dễ chịu (Harmonious & Peaceful):* Cân bằng khoảng cách thị giác (generous whitespace), typography phân cấp rõ ràng giữa tiêu đề đanh chắc và thông số kỹ thuật mono tinh tế.

---

### Đề xuất Kỹ thuật Triển khai từ Antigravity (P1 – P4):

#### P1. Tái cấu trúc & Nâng cấp Modal Sản phẩm (`#order-modal`):
1. **Bố cục 2 cột sang trọng (Desktop) & Trượt êm ái (Mobile):**
   - Cột trái: Ảnh sản phẩm chất lượng cao với khung kính bo góc mềm (`rounded-2xl`), badge chất liệu nổi bật (`✦ 100% Nguyên Sinh Bio-Polymer`), zoom nhẹ khi hover.
   - Cột phải: 
     - Tiêu đề sản phẩm rõ ràng, không bị che khuất.
     - Giá bán lớn nổi bật kèm nhãn bảo hành và miễn phí đổi trả.
     - Bảng thông số kỹ thuật dạng Spec Sheet tinh tế: Kích thước, Trọng lượng, Độ mịn lớp in (0.16mm), Chip NFC NTAG213 (nếu có).
     - Bộ chọn màu sắc xúc giác (`Tactile Color Swatches`): Vòng tròn màu thực tế kèm tên màu và viền phát sáng khi chọn.
     - Bộ chọn vật liệu cao cấp: Thẻ chọn vật liệu (PLA Matte, PETG Tough, Resin 8K) kèm mô tả tính năng và chênh lệch giá minh bạch.
     - Khung cá nhân hóa (khắc tên/cấu hình WiFi) bo cong tinh tế.
     - Bộ đếm số lượng (+ / -) thiết kế công thái học.
2. **Dual-Action CTA Footer (Bổ sung chức năng Đặt Hàng Trực Tiếp):**
   - **Nút 1: "Thêm Vào Giỏ"** (`btn-secondary` phong cách kính mờ, icon giỏ hàng, thông báo toast xác nhận).
   - **Nút 2: "Đặt Hàng Ngay" / "Mua Ngay"** (`btn-primary` rực rỡ gradient cam hổ phách `#FF5C00` $\rightarrow$ `#E64A19`, icon tia chớp hoặc hộp hàng).
   - **Luồng xử lý khi bấm "Đặt Hàng Ngay":**
     - Đóng `#order-modal` và mở ngay lập tức `#checkout-modal` (Direct Checkout) với thông tin sản phẩm, số lượng, màu sắc, vật liệu và ghi chú khắc tên đã được điền sẵn 100%.
     - Khách hàng chỉ việc điền Tên + SĐT + Địa chỉ $\rightarrow$ Bấm "Chốt Đơn Zalo" hoặc "Đặt Hàng COD" là hoàn tất chỉ trong 10 giây!

#### P2. Khắc phục dứt điểm Lỗi Stale Cache & Schema Migration:
1. Trong `js/catalog-store.js`:
   - Bổ sung cơ chế `enrichProductDefaults(p)`: Nếu `!p.colors || p.colors.length === 0`, tự động gán bộ màu chuẩn từ `products.json` hoặc 3 màu mặc định; tương tự với `materials` và `specs`.
   - Nâng cấp key lưu trữ hoặc kiểm tra hash phiên bản (`CATALOG_VERSION = 'v3.1'`) để tự động nâng cấp dữ liệu cũ của khách hàng mà không làm mất ảnh tùy chỉnh đã tải lên.
2. Trong `js/products-manager.js`:
   - Bổ sung fallback trực tiếp khi render swatches và materials trong modal: nếu rỗng, tự động lấy danh sách mặc định tương ứng với loại sản phẩm, đảm bảo không bao giờ bị rỗng hay hiển thị `N/A`.

#### P3. Đột phá Giao diện Toàn Diện "Trong Trẻo, Mượt Mà, Dễ Chịu":
1. **Thiết kế Frosted Glass & Ambient Glow:**
   - Cập nhật CSS tokens: Bổ sung lớp kính mờ `.glass-panel`, `.glass-modal`, `.glass-card` với độ mờ chuẩn phòng thí nghiệm (`backdrop-filter: blur(20px) saturate(180%)`).
   - Thêm hiệu ứng ánh sáng gradient tinh tế sau lưng thẻ sản phẩm và modal (`ambient-glow`).
2. **Typography & Viền Tinh xảo:**
   - Chuẩn hóa typography: nhãn thông số viết hoa mảnh (`tracking-wider text-[11px] uppercase`), giá tiền font mono đậm đà, mô tả thoáng mắt.
   - Viền vi cấu trúc (Micro-borders) chống chói, êm dịu cho mắt khi xem ban đêm hoặc ban ngày.
3. **Hiệu ứng Micro-interactions:**
   - Thêm hiệu ứng gợn sóng xúc giác khi click swatch màu.
   - Thêm trạng thái chuyển động mượt mà cho drawer giỏ hàng và các modal.

#### P4. Kiểm thử Toàn diện & Báo cáo Nghiệm thu:
1. Kiểm tra toàn bộ cú pháp JS qua `node -c`.
2. Chạy lại bộ kiểm thử `test_e2e_simulation.ps1` và `test_tab_architecture.ps1`.
3. Kiểm tra thực tế luồng "Đặt Hàng Ngay" từ Product Detail Modal tới Checkout Modal.
4. Đồng bộ commit và push lên GitHub `main`.

---
Xin kính trình Tổng Chỉ Huy Kiến Trúc GPT-6.1-Sol (Codex Master Controller) thẩm định, phê duyệt và ban hành Chỉ Thị Kỹ Thuật!


---

## [2. CHI_THI_PHE_DUYET_TU_CODEX]

> **Thời gian ban hành:** 2026-10-20 20:55:18
> **Mô hình ban hành:** GPT-6.1-Sol (Reasoning Effort: High)

🎯 **[Auto-Router]** `Nhóm Task`: 3, 5 — Kiến trúc frontend, dữ liệu & đặt hàng | `Skills`: fix-loop-breaker, test-driven-development | `Engines`: Node.js, PowerShell, tài liệu W3C

**BẢN CHỈ THỊ PHÊ DUYỆT KIẾN TRÚC & MÃ NGUỒN — ANTIGRAVITY WORKER**

**Quyết định: PHÊ DUYỆT TRIỂN KHAI P1–P4 VỚI CÁC ĐIỀU CHỈNH BẮT BUỘC DƯỚI ĐÂY.** Worker được bắt đầu thực hiện ngay theo đặc tả này. Phê duyệt triển khai không đồng nghĩa đã nghiệm thu.

**1. Kết luận thẩm định dựa trên mã nguồn**

Tôi đã đọc nội dung bridge và kiểm tra repository tại commit `7f8f1e3`. Ba vấn đề sau đã được tái hiện bằng Node VM chạy mã nguồn hiện tại; đây là kiểm chứng logic, chưa phải kiểm thử trình duyệt:

| Vấn đề | Kết quả thực tế | Kết luận |
|---|---|---|
| Cache sản phẩm phiên bản cũ | Không tải dữ liệu chuẩn; còn **0 màu, 0 vật liệu**, thiếu kích thước | Chẩn đoán stale cache có cơ sở |
| Admin chỉ cập nhật một phần sản phẩm | Từ **4 màu, 3 vật liệu, 6 trường thông số** trở thành **0/0/0** | Có thêm nguyên nhân làm dữ liệu tiếp tục bị mất |
| Checkout nhận sản phẩm A trong tham số | Hiển thị **387.000đ**, nhưng tạo nháp cho sản phẩm B trong giỏ với **400.000đ** | Luồng mua ngay sẽ sai đơn nếu chỉ nối thêm nút |

Các vị trí cần sửa:

- `js/catalog-store.js:98`: đọc cache mà không enrichment.
- `js/catalog-store.js:171`: chuẩn hóa patch trước khi hợp nhất, khiến trường bị bỏ qua trở thành giá trị rỗng rồi ghi đè dữ liệu cũ.
- `js/admin.js`: form cập nhật không gửi `specs`, `colors`, `materials`.
- `js/checkout.js:178`: hiển thị danh sách được truyền vào.
- `js/checkout.js:281`: khi xác nhận lại đọc giỏ hàng toàn cục.

**Điều chỉnh đề xuất Antigravity:** duyệt enrichment từ dữ liệu đúng sản phẩm; loại bỏ phương án tự gán ba màu, hai vật liệu hoặc thông số thương mại chung. Catalog hiện có sáu sản phẩm và cả sáu đều có màu, vật liệu trong `products.json`; trước hết phải khôi phục đúng dữ liệu này.

**2. Phạm vi và thứ tự triển khai**

Thực hiện theo thứ tự: **test tái hiện → sửa cập nhật dữ liệu → migration → checkout độc lập → giao diện → nghiệm thu → commit/push**.

| File | Trách nhiệm được duyệt |
|---|---|
| `js/catalog-store.js` | Chuẩn hóa, migration, cập nhật một phần, đồng bộ tab |
| `js/products-manager.js` | Cấu hình sản phẩm, tạo dòng hàng chung, hai CTA |
| `js/checkout.js` | Checkout context, tóm tắt, tính tiền và tạo nháp từ cùng nguồn |
| `js/cart.js` | Truyền nguồn checkout giỏ hàng; dùng chung cách tính tổng |
| `index.html` | Bố cục modal, CTA, trạng thái và nội dung đặt hàng |
| `css/style.css` | Tokens, kính mờ, responsive, chuyển động, accessibility |
| `js/admin.js` | Chỉ sửa khi cần tương thích contract cập nhật |
| `tests/…` | Kiểm thử hồi quy cho dữ liệu và checkout |

Repository có cả giao diện HTML/JS và một ứng dụng Next.js trong `src/`. **Chỉ thị này áp dụng cho luồng `index.html` và `js/*` được bridge mô tả.** Worker phải xác nhận URL nghiệm thu đang phục vụ đúng giao diện này; không sửa nhầm `ProductModal.tsx` rồi kết luận đã xử lý `#order-modal`.

Giữ nguyên thay đổi có sẵn của người dùng trong `CODEX_BRIDGE.md` và trạng thái xóa `codex_response.md`.

**3. P2 — Thiết kế dữ liệu và migration bắt buộc**

Giữ khóa `tt_products` và dạng mảng để tương thích Admin hiện tại. Thêm phiên bản schema dạng số, chẳng hạn `schemaVersion: 4`; phiên bản dữ liệu catalog và phiên bản schema phải được phân biệt.

Chuỗi xử lý thống nhất:

```text
Đọc raw → kiểm tra cấu trúc → nhận diện dữ liệu cũ
        → bổ sung từ bản chuẩn cùng product.id
        → chuẩn hóa và kiểm tra → công bố dữ liệu
```

Áp dụng cùng quy tắc cho khởi tạo, import, cập nhật và `storage` event.

Các nguyên tắc hợp nhất:

- Khớp chính xác `product.id`; không lấy thông số của sản phẩm cùng loại để thay thế.
- Giữ dữ liệu người dùng hợp lệ: tên, giá, ảnh upload, mô tả, trạng thái và tùy chọn đã chỉnh.
- `specs` được bổ sung **từng trường thiếu**. Ví dụ trọng lượng tùy chỉnh `101g` phải được giữ trong khi kích thước được khôi phục.
- Với bản ghi cũ, khôi phục `colors`/`materials` thiếu hoặc rỗng từ sản phẩm chuẩn tương ứng.
- Mảng tùy chọn hợp lệ đã tùy chỉnh được giữ nguyên; không tự nối lại tùy chọn người dùng đã bỏ.
- Không thêm lại sản phẩm đã xóa. `tt_products = []` vẫn biểu thị danh mục rỗng.
- Sản phẩm tự tạo không có bản chuẩn: hiển thị trạng thái thiếu cấu hình và hướng dẫn liên hệ; không chế tạo lựa chọn bán hàng.
- Sau migration, chạy lần thứ hai phải cho cùng kết quả: không đổi ảnh, không nhân đôi tùy chọn, không phát sinh ghi storage vô hạn.

**Sửa `upsertProduct()` trước khi migration**, theo nguyên tắc:

```js
// Contract xử lý, Worker triển khai và kiểm thử các helper tương ứng:
const existing = findExistingById(patch.id);
const merged = mergeProvidedFields(existing, patch);
const clean = normalizeAndValidateProduct(merged);
```

`mergeProvidedFields()` phải phân biệt:

- Không có thuộc tính trong patch: giữ giá trị cũ.
- Có thuộc tính với giá trị hợp lệ: cập nhật.
- Có giá trị xóa được schema cho phép: thực hiện xóa.
- Có giá trị sai: trả lỗi rõ ràng.

Không dùng `sanitizeProduct(patch)` rồi spread lên sản phẩm cũ. Với `specs`, chỉ hợp nhất các khóa được phép; không đưa một thư viện deep-merge tổng quát vào dự án.

**Xử lý lỗi lưu trữ:**

- JSON hỏng: giữ nguyên raw để có thể khôi phục, không tự ghi đè.
- Fetch thất bại: không lưu `[]` đè catalog và không đánh dấu migration hoàn tất.
- Ghi storage thất bại: vẫn có thể dùng dữ liệu đã phục hồi trong bộ nhớ, nhưng phải báo chưa lưu được.
- Trong lúc fetch migration, nếu Admin/tab khác cập nhật dữ liệu, phải đọc lại dữ liệu mới trước khi ghi; không ghi kết quả xây từ snapshot cũ đè lên chỉnh sửa mới.
- `storage` event không được ghi ngược liên tục gây vòng lặp giữa các tab.

Fallback trong renderer chỉ xử lý **trạng thái hiển thị**. Quy tắc dữ liệu đặt tại catalog store; không duy trì hai bộ mặc định khác nhau.

**4. P1 — Một cấu hình sản phẩm, hai hành động**

Trong `products-manager.js`, tạo một hàm chung:

```js
buildConfiguredLine()
```

Hàm này đọc cấu hình hiện tại, kiểm tra hợp lệ và trả về một dòng hàng có contract tương thích `TTCart`:

```js
{
  id, title, image, category,
  colorId, colorName,
  materialId, materialName,
  customText,
  qty,
  price // đơn giá đã gồm phụ phí vật liệu, đơn vị VND
}
```

Điều kiện bắt buộc:

- Sản phẩm còn tồn tại và đang được bán.
- Màu/vật liệu thực sự thuộc sản phẩm.
- Số lượng là số nguyên trong giới hạn cho phép; giai đoạn này dùng `1–99`.
- Đơn giá, phụ phí và tổng tiền hợp lệ, không âm, không vượt giới hạn số nguyên an toàn.
- Nội dung khắc tên trim, chuẩn hóa Unicode NFC, giới hạn rõ ràng.
- Không tự thay một lựa chọn không hợp lệ bằng lựa chọn mặc định rồi tiếp tục đặt hàng.

Hai nút gọi cùng hàm:

```text
Thêm vào giỏ → buildConfiguredLine → TTCart.addToCart → toast
Đặt hàng ngay → buildConfiguredLine → checkout context trực tiếp
```

**Mua ngay không thêm vào giỏ, không xóa giỏ, không mở drawer.** Đóng checkout trực tiếp phải giữ nguyên giỏ hàng trước đó.

Sửa các trạng thái liên quan cùng lúc:

- Mở sản phẩm khác phải reset số lượng cả trong state lẫn DOM.
- Màu đã chọn trên card phải được truyền đúng vào modal và quick add khi còn hợp lệ.
- Giá hiển thị cập nhật theo vật liệu.
- Hiển thị riêng **đơn giá** và **tạm tính theo số lượng**.
- Hai CTA luôn phản ánh cùng cấu hình.

**5. Checkout context là nguồn dữ liệu duy nhất**

Giữ API tương thích bằng cách bổ sung tham số thứ ba:

```js
TTCheckout.openCheckout(items, discountPercent = 0, options = {})
```

Ví dụ luồng mua ngay:

```js
TTCheckout.openCheckout([line], 0, {
  source: 'direct'
});
```

Luồng giỏ hàng truyền `source: 'cart'` cùng mức giảm giá tương ứng. Không tự áp coupon của giỏ sang mua ngay.

Trong `checkout.js`, lưu context riêng:

```js
{
  source: 'direct' | 'cart',
  items: /* snapshot đã kiểm tra, không giữ tham chiếu tới cart */,
  discountPercent,
  clientRequestId,
  state: 'editing' | 'submitting' | 'handoff_ready'
}
```

**Tóm tắt, tổng tiền, nội dung tin nhắn và bản ghi nháp đều phải đọc context này.** Loại bỏ việc `submitCheckout()` đọc lại `TTCart.getItems()` và `getDiscountPercent()`.

Các yêu cầu khác:

- Tóm tắt hiển thị tên, màu, vật liệu, khắc tên, số lượng, đơn giá và thành tiền.
- Trước xác nhận, kiểm tra lại sản phẩm, tùy chọn và giá hiện hành. Có thay đổi thì cập nhật tóm tắt và yêu cầu người mua xem lại.
- Chống nhấn đúp; một lần xác nhận không tạo nhiều nháp.
- Mở phiên checkout mới phải reset trạng thái kết quả, nút sao chép và ghi chú cũ.
- Thông tin khách hàng chỉ tự điền theo lựa chọn ghi nhớ hiện có.
- Sửa regex điện thoại hiện tại: chuẩn hóa đầu vào, kiểm tra toàn chuỗi và thống nhất định dạng lưu.
- Render dữ liệu sản phẩm/khách bằng `textContent`, `.value`, DOM API; bỏ nội suy dữ liệu vào HTML và inline `onclick` tại các phần sửa.

Dùng `calculateOrderTotals()` làm nguồn tính tiền chung cho drawer và checkout. Hiện drawer xét freeship trước giảm giá, checkout xét sau giảm giá. Chốt sử dụng quy tắc hiện có của checkout: **miễn phí từ 300.000đ tiền hàng sau giảm giá**, nếu chưa có chính sách khác đã được cấu hình.

**6. Ngữ nghĩa Zalo và COD phải đúng khả năng hệ thống**

Cấu hình hiện tại có `orderEndpoint: null`; mã checkout đang tạo nháp cục bộ và nội dung chuyển tiếp, chưa gửi đơn tới hệ thống nhận đơn.

Vì vậy:

- Duyệt luồng **soạn yêu cầu → sao chép → mở Zalo → người mua gửi**.
- Trạng thái sau khi soạn là “Yêu cầu đã sẵn sàng chuyển tiếp”, không phải “Đặt hàng thành công”.
- Với COD, ghi rõ phương thức mong muốn và yêu cầu gửi cho xưởng xác nhận.
- Không cam kết “hoàn tất trong 10 giây” hoặc “xưởng đã nhận đơn” khi chưa có bằng chứng giao nhận.
- Lấy số Zalo từ cấu hình hiện hành; bỏ phụ thuộc duy nhất vào số hardcode.
- Không giả định `?text=` luôn được Zalo hỗ trợ: phải có nút sao chép và nội dung có thể chọn thủ công.
- Không đặt toàn bộ địa chỉ và dữ liệu khách vào URL khi không cần thiết.

Nếu bổ sung endpoint nhận đơn, đó là một thay đổi kiến trúc riêng: server phải kiểm tra giá, chống trùng yêu cầu và trả mã xác nhận. Không cần bổ sung backend để hoàn thành phạm vi mua ngay qua chuyển tiếp hiện tại.

**7. P3 — Chốt thiết kế “trong trẻo, mượt mà, dễ chịu”**

Duyệt hướng kính mờ tiết chế, giữ nhận diện cam và typography hiện có. Các thông số blur/easing là lựa chọn thiết kế của dự án, không gọi là “chuẩn phòng thí nghiệm” hay quy định Apple.

- Desktop từ khoảng `960px`: modal hai cột, rộng tối đa khoảng `1040px`; ảnh lớn bên trái, cấu hình bên phải.
- Mobile: một cột, giới hạn theo `100dvh`, nội dung cuộn và footer CTA có khoảng đệm safe area.
- Tiêu đề dài được xuống dòng đầy đủ; nút đóng không đè tiêu đề.
- Footer gồm “Thêm vào giỏ”, “Đặt hàng ngay” và tạm tính rõ ràng; không che trường cuối khi bàn phím mở.
- Thông số dùng bố cục `<dl>`; nhãn phụ tối thiểu khoảng `12px`, nội dung chính `14–16px`.
- Màu dùng swatch kèm tên và trạng thái chọn; vật liệu dùng thẻ có mô tả/phụ phí từ dữ liệu thật.
- Blur chỉ áp dụng có chọn lọc cho modal, navigation hoặc drawer; card dùng bề mặt nhẹ để tránh nhiều lớp blur trên mobile.
- Có nền đủ đặc khi không hỗ trợ `backdrop-filter`.
- Chuyển động chủ yếu bằng `opacity`/`transform`, khoảng `160–280ms`; không animate blur hoặc dùng `transition: all`.
- Ring lựa chọn tĩnh, press nhẹ; không cần glow/ripple liên tục.

**Điểm cần sửa trong gradient đề xuất:** chữ trắng trên `#FF5C00` chỉ khoảng **3,10:1**, trên `#E64A19` khoảng **3,92:1**. CTA chữ nhỏ phải đổi sang chữ tối phù hợp hoặc nền cam đậm hơn để đạt tối thiểu **4,5:1**. [W3C về tương phản](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)

Modal phải có tên truy cập, focus ban đầu, giữ Tab bên trong, Escape đóng đúng lớp đang mở và trả focus hợp lý. Khi chuyển từ sản phẩm sang checkout, không để hai modal đồng thời nhận tương tác. [W3C Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)

Chốt vùng bấm chính tối thiểu `44 × 44px` theo mục tiêu thiết kế dự án; hỗ trợ `prefers-reduced-motion`. [W3C Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), [Reduced Motion](https://www.w3.org/WAI/WCAG22/Techniques/css/C39)

Không tự thêm NTAG213, Resin 8K, badge “100% nguyên sinh”, miễn phí đổi trả hay bảo hành chung. Ví dụ sản phẩm NFC hiện ghi **NTAG215**; nội dung phải theo dữ liệu sản phẩm được xác nhận.

**8. P4 — Cổng nghiệm thu và bàn giao**

Worker viết test hành vi trước, chứng minh bản cũ thất bại đúng nguyên nhân rồi mới sửa. Tối thiểu gồm:

| Ca nghiệm thu | Kết quả bắt buộc |
|---|---|
| Cache cũ `prod-1`, ảnh riêng, trọng lượng `101g` | Khôi phục lựa chọn/thông số thiếu; giữ ảnh và `101g` |
| Admin chỉ sửa tiêu đề | Giữ nguyên màu, vật liệu và thông số |
| Danh mục `[]`, sản phẩm đã xóa | Không tự phục hồi |
| JSON hỏng, fetch lỗi, quota đầy | Không ghi đè mất dữ liệu |
| Migration hai lần, đồng bộ hai tab | Không nhân bản, không vòng lặp, không mất chỉnh sửa mới |
| Giỏ có B, mua ngay A | Summary, nháp, tin nhắn chỉ chứa A; giỏ B nguyên vẹn |
| A: `109.000 + 20.000`, số lượng 3 | Đơn giá `129.000`, tiền hàng `387.000`, phí giao `0` |
| Tiền hàng `310.000`, giảm 10% | Còn `279.000`, phí `25.000`, tổng `304.000` |
| Nhấn xác nhận hai lần | Một yêu cầu/nháp trong cùng phiên |
| Tên/khắc chứa dấu nháy hoặc markup | Hiển thị nguyên văn, không thực thi mã |

Chạy lại kiểm tra cú pháp và hai script PowerShell. **Baseline tôi đã chạy:** 11 file JS qua kiểm tra cú pháp; `test_e2e_simulation.ps1` qua 6 nhóm kiểm tra; `test_tab_architecture.ps1` qua **26/26**. Chúng kiểm tra cấu trúc bằng chuỗi, không thay thế các test hành vi trên.

Kiểm thử trình duyệt thực tế ở chiều rộng `360`, `390`, `768`, `1440px`, cả sáng/tối; kiểm tra bàn phím, tiêu đề dài, nội dung khắc dài, ảnh lỗi, bàn phím mobile và console/network. Chạy qua HTTP cùng origin. Lưu ảnh trước/sau và log thực tế.

Sau khi toàn bộ điều kiện đạt:

1. Rà soát diff, chỉ stage file thuộc nhiệm vụ.
2. Commit với mô tả đúng phạm vi cuối cùng.
3. Push `main` theo P4 đã đề xuất sau khi xác nhận đúng remote, không force-push và không đưa thay đổi riêng của người dùng vào commit.
4. Bàn giao commit SHA, danh sách file, log test, ảnh nghiệm thu và giới hạn còn lại.

**Trạng thái hiện tại:** đã hoàn thành thẩm định và ban hành chỉ thị; chưa sửa mã sản phẩm, chưa nghiệm thu giao diện và chưa commit/push. Antigravity thực thi theo thứ tự trên.
