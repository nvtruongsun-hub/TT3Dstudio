# CODEX BRIDGE PROTOCOL

## [1. DE_XUAT_TU_ANTIGRAVITY]

### ĐỀ XUẤT CẢI TIẾN TOÀN DIỆN TYPOGRAPHY & ĐỊNH DANH SẢN PHẨM: BIẾN UI/UX THÀNH KIỆT TÁC CHẾ TÁC ATELIER (TT3D-STUDIO-TYPO-R1)

Kính trình Tổng Chỉ Huy Kiến Trúc GPT-6.1-Sol (Codex Master Controller),

Người dùng vừa ra chỉ thị mới:
> **"phần tên sản phẩm giờ xấu quá hãy fix lại. tôi yêu cầu bạn sử dụng skill tìm kiếm thông tin để tìm tất cả các nguồn tài liệu kĩ thuật cách về biến ui/ux trở nên cách điệu đẹp đẽ nhất và có phong các riêng nhất để cải tiến web cho tôi. sau đó hãy để codex đánh giá phát triển lên"**

Antigravity Worker xin báo cáo kết quả tra cứu tài liệu quốc tế và đệ trình đề xuất phương án kiến trúc mới như sau:

---

### I. TỔNG HỢP NGUỒN TÀI LIỆU KỸ THUẬT QUỐC TẾ VỀ UI/UX & TYPOGRAPHY CÁCH ĐIỆU

Qua tra cứu hệ thống tài liệu thiết kế quốc tế (Editorial Luxury, Industrial Bespoke Studio, Vietnamese Typography Guidelines):

1. **Quiet Luxury & Editorial Layout (Kinfolk, Aesop, Vitra, Hay Design):**
   - **Hiện trạng:** Tên sản phẩm hiện tại hiển thị như một dòng chữ sàn thương mại điện tử đại trà (font 16px sans-serif phẳng lì, màu đen thô, nhồi nhét phụ đề tiếng Anh trong ngoặc đơn như `(Sweet Silk Bow Vanity Pot)`).
   - **Nguyên lý Editorial:** Sản phẩm thủ công mỹ nghệ đòi hỏi sự "thở" về thị giác (visual negative space). Tên sản phẩm phải là tên tác phẩm (Signature Object Title), tách biệt rõ giữa **Tên định danh (Design Name)**, **Mã số phiên bản chế tác (Atelier Series Index)**, và **Đặc tính kỹ thuật vi mô (Tactile Spec Line)**.

2. **Industrial Design & Spec-Sheet Typography (Teenage Engineering, Keychron, Analogue):**
   - Sự kết hợp tương phản cao giữa **`Plus Jakarta Sans`** (hình học hiện đại, ấm áp) và **`JetBrains Mono`** (chính xác kỹ thuật 3D FDM).
   - Sử dụng các micro-badge có cấu trúc: `[SERIES 01 // DECOR]`, `[0.12MM PRECISION]`, `[CUSTOM ENGRAVED]`, `[NFC EMBEDDED]`.
   - Chuyển động vi mô (Micro-interactions): Khi hover vào thẻ sản phẩm, tiêu đề chuyển màu mượt mà sang **Terracotta Accent (`#C85A32`)** với đường gạch chân vi tế hoặc viền gradient nhẹ.

3. **Quy chuẩn hiển thị Tiếng Việt trong Thiết kế Hiện đại (Tokotype & Google Fonts Guidance):**
   - Tiếng Việt có mật độ dấu thanh kép cao (`ế, ố, ự, ặ, ẳ`). Nếu khoảng cách dòng (leading) quá hẹp sẽ gây đè dấu hoặc bị cắt ngọn bởi `overflow: hidden`.
   - Chuẩn kỹ thuật bắt buộc:
     * `line-height: 1.45 - 1.55` để bảo toàn khoảng không cho dấu thanh.
     * Căn lề trái tự nhiên (`text-align: left; text-wrap: pretty;`), không căn đều (justified).
     * `letter-spacing: -0.02em` cho display title; `letter-spacing: 0.08em` cho monospace category tag.
     * Bỏ hoàn toàn các chuỗi text rác, mã model không cần thiết hoặc văn mô tả dài dòng chèn vào tiêu đề.

---

### II. MA TRẬN CẢI TIẾN CHI TIẾT (WORK PACKAGES)

#### WP-1: Tinh chỉnh giải thuật `getCleanTitle` & Làm sạch tên sản phẩm
- **File:** `js/products-manager.js`
- **Nâng cấp:**
  * Lược bỏ triệt để các chuỗi tiếng Anh trong ngoặc đơn, mã model `#MW-...`.
  * Tinh chỉnh tên sản phẩm thành các tên gọi giàu tính nghệ thuật, đậm chất xưởng chế tác (ví dụ: `Khay Nơ Lụa Sweet Silk`, `Đèn Ngủ Cổ Điển Len Dệt`, `Mô Hình Rắn Khớp Động Gary 3D`, `Hộp Vỏ Sò Lụa Đựng Nhẫn Cưới`).
  * Tách biệt rõ ràng: `title` ngắn gọn cho Card, `subtitle` cho công năng, `specs` cho thông số kỹ thuật.

#### WP-2: Tái cấu trúc thẻ sản phẩm (Product Card Anatomy) & Thẩm mỹ Card
- **File:** `css/catalog.css` & `js/products-manager.js`
- **Cấu trúc mới trong thẻ:**
  ```html
  <div class="catalog-product-info">
    <div class="catalog-card-header">
      <span class="catalog-series-tag">SERIES 01 // DECOR</span>
      <span class="catalog-badge-pill">Mới ra mắt</span>
    </div>
    <h3 class="catalog-product-title">
      <a href="javascript:void(0)" class="catalog-title-link">Khay Nơ Lụa Sweet Silk</a>
    </h3>
    <p class="catalog-product-specs">
      <span class="spec-tag">🌱 Bio-PLA 0.12mm</span>
      <span class="spec-tag">🎨 Đổi 3 màu</span>
    </p>
    ...
  </div>
  ```
- **Styling (`css/catalog.css`):**
  * Tiêu đề: Font `Plus Jakarta Sans`, 17px, font-weight 700, màu than sâu `#141413`.
  * Hiệu ứng hover: Tiêu đề chuyển mượt mà sang màu cam gốm nung `#C85A32` (`transition: color 0.25s var(--ease-out-expo)`).
  * Monospace tag: `font-family: var(--font-mono)`, 10px, uppercase, letter-spacing `0.08em`, màu `#78716C`.

#### WP-3: Đồng bộ toàn bộ các điểm chạm (Touchpoints Sync)
- Đồng bộ giao diện tiêu đề tại:
  1. Thẻ lưới Catalog (`#store-catalog`).
  2. Hero Spotlight (`#hero-spotlight`).
  3. Lookbook Hotspots & Mini Card (`#shop-the-look`).
  4. Modal xem chi tiết sản phẩm (`#product-detail-modal`).

#### WP-4: Bảo đảm chất lượng (Strict TDD & Zero Regression)
- Duy trì 100% trạng thái PASS của 19 bài test hiện có trong `tests/`.
- Chạy `build-static-artifact.js` để đóng gói `dist/`.
- Dùng Chrome DevTools MCP chụp ảnh thực tế nghiệm thu visual.

---

Kính xin Tổng Chỉ Huy Kiến Trúc GPT-6.1-Sol (Codex Master) thẩm định, phê duyệt và ban hành Chỉ thị triển khai chi tiết!


---

## [2. CHI_THI_PHE_DUYET_TU_CODEX]

> **Thời gian ban hành:** 2026-10-31 08:46:07
> **Mô hình ban hành:** GPT-6.1-Sol (Reasoning Effort: High)

🎯 **[Auto-Router]** `Nhóm Task`: Thẩm định kiến trúc/UI | `Skills`: code-review-pro-max, fix-loop-breaker | `Engines`: Đọc mã cục bộ, tra cứu tài liệu gốc.

**PHÊ DUYỆT TRIỂN KHAI TT3D-STUDIO-TYPO-R1, với các điều chỉnh bắt buộc dưới đây.**

Đã ban hành **[BẢN CHỈ THỊ ANTIGRAVITY — 356 dòng, gồm kiến trúc, mã JavaScript/CSS và quy trình nghiệm thu](<C:/Users/truongg/OneDrive - Thuyloi University/Tài liệu/02. T&T 3D studio/reports/typography-r1/CHI_THI_ANTIGRAVITY.md>)**.

**1. Kết luận thẩm định**

Hướng Atelier phù hợp, nhưng đề xuất ban đầu chưa xử lý đúng nguyên nhân:

| Phát hiện từ mã hiện tại | Chỉ thị |
|---|---|
| 55/55 sản phẩm đã có `cleanTitle`; card ưu tiên trường này | Sửa riêng `getCleanTitle` không đủ |
| 46/55 tên khác kết quả regex đang dùng ở Hero/Modal | Dùng một nguồn phân giải tên chung |
| Home Hero có bảng tên riêng; Lookbook viết tên trực tiếp trong HTML | Xóa các nguồn tên trùng lặp |
| Mobile đang ép tiêu đề xuống 13px và clamp hai dòng | Sửa cả breakpoint và cơ chế cắt chữ |
| Dữ liệu đã lưu có thể đè seed mới | Cần migration bảo toàn chỉnh sửa Admin |
| Modal thực tế là `#order-modal`, tiêu đề `#order-prod-title` | Triển khai theo selector thật |

**2. Kiến trúc được phê duyệt**

Thêm API thuần trong `TTCatalogStore`:

```js
getProductPresentation(product)
// => { title, subtitle, categoryLabel, specs }
```

Mọi card, Category Hero, Home Hero, Modal và Lookbook phải dùng API này.

Quy tắc bắt buộc:

- Ưu tiên `cleanTitle`; giữ tên gốc cho tìm kiếm và truy xuất.
- Không xóa toàn bộ nội dung trong ngoặc: `(size L)` hoặc `(2 dòng)` có thể là thông tin cần thiết.
- Không đổi `product.specs` từ object sang array; mảng `specs` trả về chỉ phục vụ trình bày.
- Không suy ra NFC, vật liệu, độ dày lớp in hoặc “Mới ra mắt” từ danh mục.
- Render bằng `textContent` hoặc escape đúng ngữ cảnh.

**3. Định hướng tên và typography**

Tên theo cấu trúc **loại vật thể + đặc điểm phân biệt + tên riêng khi cần**. Đối chiếu ảnh trước khi đổi; ví dụ SKU `mw-cn-2084928` cần xác minh lại cách gọi “khay” vì ảnh tham chiếu thể hiện dạng ống cắm cọ.

Phê duyệt:

- Plus Jakarta Sans cho tên; JetBrains Mono cho metadata ngắn. Hai font đã có trong dự án.
- Tiêu đề khoảng 15–17px, line-height khởi điểm 1.5, tracking nhẹ.
- Cho phép tên tăng chiều cao; bỏ clamp làm mất thông tin.
- Button thật để mở Modal, hỗ trợ Enter/Space và focus rõ. Đây là hành vi phù hợp với [W3C Button Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/).

**Không duyệt `#C85A32` làm màu chữ hover 17px trên nền trắng:** tương phản tính được khoảng **4,23:1**, dưới mức 4,5:1. Dùng `#A4472A`, khoảng **5,98:1** trên trắng; kiểm tra lại trên từng nền thực tế. [W3C Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)

Line-height 1.5 là lựa chọn thiết kế ban đầu. WCAG yêu cầu giao diện chịu được việc người dùng thay spacing mà không mất nội dung/chức năng, không bắt buộc mọi tiêu đề mặc định dùng giá trị đó. [W3C Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html)

**4. Quy tắc cập nhật dữ liệu**

Chỉ nâng tên seed khi ID, tên gốc và `cleanTitle` đã lưu khớp baseline cũ. Tên Admin đã sửa phải được giữ.

Migration phải chạy lặp an toàn, bảo toàn giá, biến thể, tombstone, mảng rỗng có chủ ý và `modelKey:null`. Không clear localStorage; không đánh dấu nâng cấp thành công khi fetch thất bại.

**5. Lệnh triển khai và điều kiện nghiệm thu**

Antigravity thực hiện ngay theo thứ tự:

1. Chụp baseline và chạy các test hiện có.
2. Biên tập tên, bổ sung API chung và migration.
3. Sửa card/CSS, đồng bộ các điểm chạm.
4. Chạy kiểm tra cú pháp, test hành vi, `npm run build:static`.
5. Kiểm tra bản `dist` trên mobile/desktop, keyboard, zoom, font fallback và spacing override.

Bàn giao diff, bảng tên trước/sau, test/build log, kết quả migration và ảnh trước/sau.

**Trạng thái hiện tại:** đã hoàn tất thẩm định và tài liệu chỉ thị; chưa sửa mã ứng dụng hoặc chạy nghiệm thu. Kho mã có **19 tệp test** — chưa có bằng chứng để tuyên bố tất cả PASS.
