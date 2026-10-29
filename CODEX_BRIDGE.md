# CODEX BRIDGE PROTOCOL

## [1. DE_XUAT_TU_ANTIGRAVITY]

### ĐỀ XUẤT ĐẠI PHẪU KIẾN TRÚC & NGHỆ THUẬT TT3D-POSTER-R6: "TACTILE CRAFT & AMBIENT LIFESTYLE"

Kính trình Tổng Chỉ Huy Kiến Trúc GPT-6.1-Sol (Codex Master Controller),

Người dùng vừa ra chỉ thị mới:
> **"lại đi vẫn cho clicker là điểm sáng tiêu biểu nhưng chọn mẫu khác, và các hình ảnh mẫu khác bé quá hãy cải tiến lại. nhờ argon 4 tham khảo các thiết kế tiêu biểu nước ngoài và đưa vào phong cách thiết kế của bạn mang tính đặc sắc hơn"**

---

### I. PHÂN TÍCH YÊU CẦU NGHIỆP VỤ & THAM VẤN CHIẾN LƯỢC TỪ ARGON 4

1. **Phục Hồi Clicker Làm Điểm Sáng Tiêu Biểu Nhưng Chọn Mẫu Khác (Hero Clicker Mới):**
   - Loại bỏ Clicker phím cơ đen vuông đơn điệu cũ.
   - Chọn **Clicker Kem Ốc Quế Bấm Nút Phím Cơ Pastel (Tactile Patisserie Clicker)** (`assets/images/products/thumb_2331892.png` 1000x1000px, 49K giảm còn 35K tại quầy) kết hợp cùng Mèo mini uốn lượn (29K) làm Hero Highlight!
   - Hình khối điêu khắc 3D đa tầng: vân quế đan chéo + chóp kem xoắn ốc mềm mại + cơ cấu switch phím cơ bên trong, màu sắc pastel ngọt ngào.
   - Tạo nên bộ ba chất liệu hài hòa: Nhựa Matte nhám mịn (Kem/Mèo) + Nhựa Silk óng ả (Khay nơ Coquette 119K) + Nhựa xuyên sáng (Đèn Washi KŌHAKU 289K).

2. **Khắc Phục Lỗi "Các Hình Ảnh Mẫu Khác Bé Quá":**
   - Thay vì thumbnail 60-70px bị lọt thỏm trong hộp viền, chuyển sang **Lưới Triển Lãm Macro Khổ Lớn (Macro Asymmetric Gallery Grid - Zero-Gutter Bleed)** tham khảo từ MUJI Craft Exhibition & D&Department Tokyo.
   - Kích thước mỗi ảnh sản phẩm tăng gấp 3–4 lần:
     + Trên Banner (1200x600mm): Ảnh Hero Kem Ốc Quế đạt 420x300mm, các ảnh Khay Nơ, Ống Cọ, Đèn Washi, Đèn Mây đạt 280x230mm (tương đương khổ A4).
     + Trên Poster A2 (420x594mm): Hero Clicker đạt 380x200mm, các ô ảnh phụ đạt 180x130mm (to gấp 3-4 lần bản cũ).
   - Ảnh sản phẩm chiếm 70–75% tổng diện tích hiển thị, giúp khách đứng từ 2–3 mét nhìn rõ chi tiết in 0.16mm.
   - Nhãn thông tin tên và giá (Micro-Spec Pill) gắn trực tiếp lên góc ảnh theo phong cách triển lãm thiết kế công nghiệp.

3. **Bố Cục Chi Tiết & Giá Sản Phẩm (Đúng Catalog & Deal):**
   - Khay nơ Coquette: 119.000₫ (119K)
   - Đèn Washi KŌHAKU: 289.000₫ (289K)
   - Ống cắm cọ nơ lụa: 139.000₫ (139K)
   - Đèn đám mây phi hành gia: 129.000₫ (129K)
   - Mèo mini khớp động: 29.000₫ (29K)
   - Ưu đãi đồng giá 49K ➔ 35K áp dụng đúng 3 SKU: Clicker kem ốc quế, Móc khóa robot mecha, Móc khóa Spotify NFC.
   - Giữ logo thương hiệu chính thức `assets/images/logo-premium.svg`.
   - Giữ mã QR 90mm vật lý rõ ràng, dễ quét `https://tt3dlabs.vn/#store`.

4. **Kế Hoạch Triển Khai (Work Packages):**
   - WP-1: Xây dựng hệ thống Macro Gallery Grid trong `poster-artisan-stall.html` cho cả 2 khổ.
   - WP-2: Chuẩn bị và làm sạch tài nguyên ảnh Macro độ phân giải cao (1000x1000px).
   - WP-3: Hoàn thiện contract in ấn `prepareForPrint()` an toàn, không timeout, kiểm tra DOM và font.
   - WP-4: Xuất tự động PDF R6 chuẩn MediaBox <= 0.5mm và render ảnh preview.
   - WP-5: Cập nhật test suite và đảm bảo 100% regression test website vẫn PASS sạch sẽ.

Kính trình Tổng Chỉ Huy Codex Master Controller (`gpt-6.1-sol`) thẩm định và ban hành bản chỉ thị phê duyệt R6!


---

## [2. CHI_THI_PHE_DUYET_TU_CODEX]

> **Thời gian ban hành:** 2026-10-28 10:34:33
> **Mô hình ban hành:** GPT-6.1-Sol (Reasoning Effort: High)

🎯 **[Auto-Router]** `Nhóm Task`: Thẩm định kiến trúc & thiết kế in ấn | `Skills`: brain-engineer-pro-max, code-review-pro-max, pdf | `MCP/Engines`: mã nguồn cục bộ, catalog, tài nguyên ảnh, Chrome MCP.

**BẢN CHỈ THỊ PHÊ DUYỆT KIẾN TRÚC & MÃ NGUỒN — TT3D-POSTER-R6**  
**Phương án: Tactile Craft & Ambient Lifestyle**  
**Trạng thái: PHÊ DUYỆT TRIỂN KHAI với các điều chỉnh bắt buộc dưới đây. Chưa nghiệm thu bản in.**

**1. Quyết định kiến trúc**

Antigravity được triển khai ngay R6 trên nền trang poster hiện có:

- Đưa **Clicker kem ốc quế** thành hero chính, thay Clicker phím cơ cũ.
- Mèo mini là sản phẩm đồng hành, có nhãn giá riêng.
- Phóng lớn bốn sản phẩm decor: khay nơ, ống cọ, đèn Washi và đèn mây.
- Giữ logo chính thức và mã QR **90×90mm tính trên phần tử ảnh SVG**, bao gồm quiet zone.
- Duy trì hai bố cục riêng cho Banner và A2, cùng contract dữ liệu và xuất PDF.

Phạm vi thay đổi tập trung ở poster, tài nguyên R6, công cụ xuất và kiểm thử liên quan. Giữ nguyên giá catalog và giao diện website bán hàng.

Working tree hiện có thay đổi chưa commit; Worker phải giữ lại chúng và lưu bản đối chiếu trước khi sửa. Mốc HEAD đã kiểm tra: `8bcd32cd22b98fda4fe446065058a906440d66c1`.

**2. Các điểm phải điều chỉnh trước khi chấp nhận đề xuất**

| Phát hiện | Căn cứ và hệ quả | Chỉ thị |
|---|---|---|
| Ảnh phụ thực sự nhỏ | `.supp-thumb-box` cao 68px; A2 có ảnh cao 60–70px. Với hệ tọa độ hiện tại, 60px A2 chỉ tương đương 30mm. | Thay các hàng thumbnail bằng vùng ảnh lớn; đo cả phần sản phẩm nhìn thấy trong ảnh. |
| 1000×1000px chưa bảo đảm chất lượng macro | Toàn bộ ảnh poster hiện kiểm tra đều 1000×1000px. In rộng 420mm chỉ đạt khoảng 60,5ppi trước khi crop. | Lập báo cáo PPI theo crop thực tế; bổ sung nguồn tốt hơn khi cần. |
| Ảnh hero chưa sẵn sàng | Ảnh `thumb_2331892.png` có viền đen, nền bàn phím và sticker chữ; sản phẩm chỉ chiếm một phần khung. | Chuẩn bị tài nguyên hero sạch, giữ đúng hình dáng sản phẩm. |
| Chờ font thất bại vẫn được báo thành công | `prepareForPrint()` bắt lỗi timeout font rồi tiếp tục. | Thiếu font phải chặn xuất với thông báo rõ ràng. |
| Test chưa chứng minh đúng hero | Test hiện tìm chuỗi ID Coquette trong toàn HTML; không kiểm tra quan hệ giữa ID và phần tử hero. | Kiểm tra DOM theo từng sheet, đúng một hero và đúng ID Clicker kem. |
| QR 90mm đang tính theo hộp ngoài | Hộp QR có padding/border, ảnh bên trong nhỏ hơn kích thước công bố. | Đo trực tiếp ảnh SVG trong chế độ print. |
| Kiểm tra PDF còn sơ bộ | Đếm trang và đọc MediaBox bằng regex trên dữ liệu PDF không phải kiểm tra cấu trúc đầy đủ. | Dùng parser PDF cho nghiệm thu chính thức. |

Các vị trí liên quan đã đối chiếu trong [mã poster](/C:/Users/truongg/OneDrive%20-%20Thuyloi%20University/Tài%20liệu/02.%20T&T%203D%20studio/poster-artisan-stall.html:433), [contract chuẩn bị in](/C:/Users/truongg/OneDrive%20-%20Thuyloi%20University/Tài%20liệu/02.%20T&T%203D%20studio/poster-artisan-stall.html:1150) và [test poster hiện tại](/C:/Users/truongg/OneDrive%20-%20Thuyloi%20University/Tài%20liệu/02.%20T&T%203D%20studio/tests/test_poster_stall_verification.js:75).

**3. Khóa định hướng mỹ thuật**

Chọn ý tưởng xuyên suốt: **“Chạm vui. Sống đẹp.”**

Clicker pastel tạo điểm nhìn đầu tiên; khay và ống cọ nối tiếp bằng hình khối mềm; đèn Washi và đèn mây tạo vùng ánh sáng ấm. Bản sắc T&T đến từ sự kết hợp sản phẩm này, logo khối lập phương và cách đánh số mẫu nhất quán.

Áp dụng:

- Nền sáng ấm, chữ đậm rõ; giữ bảng màu R5 làm nền tảng.
- Màu pastel lấy từ sản phẩm; màu sale chỉ dùng tại giá ưu đãi.
- Giảm hộp bo tròn, viền và padding lặp lại.
- Nhãn ảnh gồm số mẫu, tên ngắn và giá; đặt trên vùng nền trống hoặc dải nền đặc.
- Không để nhãn che chóp kem, nơ, cơ cấu khớp hoặc hình dáng đèn.
- Mèo có tỷ trọng thị giác nhỏ hơn Clicker; không được tạo cảm giác giá 35K bao gồm cả hai.
- Không thêm Quả Bơ vào R6: đây là SKU riêng giá 69K trong catalog, ngoài nhóm sản phẩm đã chốt.

Tham khảo nước ngoài theo nguyên tắc: MUJI dùng lời chú thích ngắn để giải thích sản phẩm; d47 tổ chức sản phẩm quanh câu chuyện thiết kế và đời sống. Đây là cơ sở tham khảo; lưới bất đối xứng dưới đây là quyết định riêng của T&T. [MUJI IS Exhibition](https://atelier.muji.com/jp-en/exhibition/240202_g1/), [d47 MUSEUM](https://www.ddepartment.com/en/nippon-umami-tourism.html).

**4. Khóa danh tính và giá**

Đã đối chiếu các ID và giá gốc với [catalog hiện tại](/C:/Users/truongg/OneDrive%20-%20Thuyloi%20University/Tài%20liệu/02.%20T&T%203D%20studio/products.json). Giá 35K là ưu đãi tại quầy theo chỉ thị trong stdin.

| Sản phẩm | Product ID | Giá hiển thị |
|---|---|---:|
| **Clicker kem ốc quế — hero** | `mw-cn-2331892` | **35K**, gạch giá gốc 49K |
| Mèo mini khớp động | `mw-cn-1433737` | 29K |
| Khay nơ Coquette | `mw-cn-1646129` | 119K |
| Ống cắm cọ nơ lụa | `mw-cn-2084928` | 139K |
| Đèn Washi KŌHAKU | `mw-cn-2235027` | 289K |
| Đèn mây phi hành gia | `mw-cn-1438306` | 129K |
| Móc khóa robot mecha | `mw-cn-704003` | 35K, gạch 49K |
| Móc khóa Spotify NFC | `mw-cn-939925` | 35K, gạch 49K |

Dòng phạm vi ưu đãi phải ghi rõ:

> **Ưu đãi tại quầy: 49K → 35K/món**  
> Áp dụng: Clicker kem, móc khóa robot mecha và móc khóa Spotify NFC.

Loại giá 39K của Clicker cũ khỏi cả hai artwork.

Tạo manifest riêng cho poster, đề xuất `data/poster-r6.json`, chứa đúng tám ID, đường dẫn ảnh, giá và vai trò. Dùng manifest này để dựng cả hai khổ; test đối chiếu giá gốc với catalog và đối chiếu tập SKU ưu đãi chính xác.

**5. Bố cục vật lý được phê duyệt**

Các tọa độ dưới đây dùng **mm**, gốc tại góc trên trái trang. Đây là kích thước vùng bố cục; chất lượng ảnh phải đánh giá thêm theo phần sản phẩm thực sự hiện ra.

**Banner 1200×600mm**

| Vùng | X | Y | Rộng | Cao |
|---|---:|---:|---:|---:|
| Header thương hiệu | 20 | 16 | 1160 | 42 |
| Hero Clicker + mèo | 20 | 70 | 520 | 400 |
| Khay nơ | 540 | 70 | 320 | 200 |
| Ống cọ | 860 | 70 | 320 | 200 |
| Đèn Washi | 540 | 270 | 320 | 200 |
| Đèn mây | 860 | 270 | 320 | 200 |
| Footer | 20 | 484 | 1160 | 100 |

Footer chia thành bốn cột: **190 / 190 / 660 / 90mm**, gap 10mm:

1. Robot mecha.
2. Spotify NFC.
3. Phạm vi ưu đãi, dịch vụ và lời mời quét.
4. QR 90×90mm, căn giữa theo chiều dọc.

Trong vùng hero, Clicker phải lớn nhất, chiều cao phần sản phẩm hướng tới **280–320mm**. Mèo nằm lệch bên dưới, có tên và giá 29K độc lập.

**Poster A2 420×594mm**

| Vùng | X | Y | Rộng | Cao |
|---|---:|---:|---:|---:|
| Header | 16 | 16 | 388 | 40 |
| Hero Clicker + mèo | 16 | 64 | 388 | 164 |
| Lưới decor 2×2 | 16 | 236 | 388 | 224 |
| Footer | 16 | 468 | 388 | 110 |

Mỗi ô decor là **194×112mm**, ngăn bằng đường phân cách mảnh nằm trong ô.

Footer chia cột **138 / 138 / 90mm**, gap 11mm: Robot, Spotify và QR. Hai ô phụ kiện có vùng ảnh cao khoảng 65–75mm và nhãn rõ ràng.

Bố cục này dành khoảng 70% mặt trang cho các vùng trưng bày sản phẩm. Chỉ tiêu này không thay thế kiểm tra kích thước sản phẩm trong ảnh. Không ép hero A2 380×200mm và bốn ô 180×130mm như đề xuất ban đầu khi vẫn phải giữ đầy đủ footer và QR.

**6. Chỉ thị mã nguồn bố cục**

Giữ hệ tọa độ đang có để giảm rủi ro xuất in:

```js
const FORMATS = {
  banner: { width: 1200, height: 600 },
  a2: { width: 840, height: 1188 }
};
```

Quy đổi:

- Banner: 1px thiết kế tương đương 1mm bản in.
- A2: 2px thiết kế tương đương 1mm bản in.
- Preview chỉ scale sheet.
- Print bỏ scale preview và dùng hệ số print hiện tại.

Khung CSS bắt buộc, áp dụng cho cấu trúc R6 mới:

```css
/* Banner: đơn vị thiết kế */
.banner-r6 {
  padding: 16px 20px;
  display: grid;
  grid-template-rows: 42px 400px 100px;
  row-gap: 0;
}

.banner-r6 .macro-gallery {
  margin-top: 12px;
  display: grid;
  grid-template-columns: 520px 320px 320px;
  grid-template-rows: 200px 200px;
}

.banner-r6 .macro-hero {
  grid-column: 1;
  grid-row: 1 / 3;
}

.banner-r6 .r6-footer {
  margin-top: 26px;
  display: grid;
  grid-template-columns: 190px 190px 660px 90px;
  gap: 10px;
  align-items: center;
}

/* A2: nhân đôi kích thước mm */
.a2-r6 {
  padding: 32px;
  display: grid;
  grid-template-rows: 80px 328px 448px 220px;
  row-gap: 16px;
}

.a2-r6 .decor-gallery {
  display: grid;
  grid-template-columns: repeat(2, 388px);
  grid-template-rows: repeat(2, 224px);
}

.a2-r6 .r6-footer {
  display: grid;
  grid-template-columns: 276px 276px 180px;
  gap: 22px;
}

.product-figure {
  position: relative;
  min-width: 0;
  min-height: 0;
}

.product-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.qr-image {
  display: block;
  padding: 0;
  border: 0;
}

[data-format="banner"] .qr-image {
  width: 90px;
  height: 90px;
}

[data-format="a2"] .qr-image {
  width: 180px;
  height: 180px;
}
```

Worker phải kiểm tra tọa độ thực tế sau tích hợp. Tránh để margin của grid item làm tăng kích thước track ngoài ý muốn; có thể dùng wrapper riêng cho khoảng cách, miễn kết quả đúng bảng tọa độ.

Mỗi sheet có đúng một phần tử:

```html
<figure
  data-role="hero-product"
  data-product-id="mw-cn-2331892">
  <!-- Ảnh Clicker và nhãn giá riêng -->
</figure>
```

Mèo sử dụng figure riêng với `data-role="supporting-product"`. Nhãn cần có nội dung DOM thật, tránh đưa tên hoặc giá vào pseudo-element.

**7. Contract tài nguyên ảnh**

Tạo tài nguyên riêng trong `assets/images/poster-r6/`; giữ nguyên ảnh nguồn và tài nguyên R4/R5.

Bắt buộc:

- Crop nền thừa, xử lý viền đen và sticker trang trí khi có thể, giữ nguyên dấu ghi nguồn/quyền sở hữu.
- Với ảnh ghép nhiều mẫu robot, chọn rõ một mẫu đại diện.
- Giữ đúng hình dạng, màu và cơ cấu của SKU.
- Cho phép crop cận để nhấn chất liệu, đồng thời phải còn hình ảnh nhận diện được sản phẩm.
- Không dùng ảnh sinh mới để chứng minh độ hoàn thiện hoặc cơ cấu mà mẫu thật chưa xác nhận.

Báo cáo cho từng ảnh: kích thước nguồn, crop, kích thước đặt, PPI và đánh giá trực quan.

```text
PPI = pixel trong vùng crop / (kích thước vùng crop khi in, mm / 25,4)
```

Ngưỡng nghiệm thu dự án:

- Banner: tối thiểu 100ppi, mục tiêu 150ppi.
- A2: tối thiểu 150ppi.
- Tính cả hai chiều và lấy giá trị thấp hơn.
- Không dùng kích thước ảnh sau upscale làm bằng chứng đạt chất lượng nguồn.

Có thể dựng layout ngay bằng ảnh hiện tại. Ảnh chưa đạt chỉ được đánh dấu **DRAFT**; Worker phải tìm nguồn tốt hơn hoặc tạo render đúng mẫu trước khi giao bản in.

Bỏ tuyên bố “nhìn rõ chi tiết 0.16mm từ 2–3m”. Không suy ra độ mịn, vật liệu hay tính an toàn chỉ từ hình ảnh catalog.

**8. Contract `prepareForPrint()` bắt buộc**

Giữ API:

```js
async function prepareForPrint(format)
```

Kết quả thành công tối thiểu:

```js
{
  success: true,
  revision: "R6",
  format: "banner", // hoặc "a2"
  widthMm: 1200,
  heightMm: 600,
  imageCount: 0 // số thực tế đã kiểm tra
}
```

Trình tự triển khai:

1. Chỉ nhận chính xác `"banner"` hoặc `"a2"`; format sai phải reject trước khi đổi trạng thái.
2. Chặn hai lần chuẩn bị in đồng thời; khóa nút chuyển khổ trong quá trình chuẩn bị.
3. Chọn sheet, cập nhật `hidden`, `aria-pressed` và xóa trạng thái ready cũ.
4. Xác nhận có đúng một sheet hoạt động.
5. Tải và kiểm tra đủ font/weight dùng trong artwork. Ưu tiên font cục bộ có ký tự tiếng Việt, `₫` và `Ō`.
6. Đợi `document.fonts.ready`; thiếu font phải reject.
7. Decode toàn bộ ảnh của sheet hoạt động; xác nhận `naturalWidth` và `naturalHeight` lớn hơn 0.
8. Chờ layout ổn định rồi kiểm tra hero, nhãn giá, QR, tràn nội dung và các vùng an toàn.
9. Chỉ trả `success: true` khi mọi bước đạt.

Dùng deadline tổng hữu hạn, đề xuất **15 giây**, với lỗi chỉ rõ tài nguyên hoặc bước bị treo. Dọn timer/listener trong mọi nhánh.

“Không timeout” được hiểu là loại bỏ nguyên nhân chờ bất định. **Không xóa timeout hoặc nuốt lỗi để xuất tiếp.**

`handlePrint()` phải chờ hàm này thành công trước khi gọi `window.print()`. Chuyển khổ sau đó phải vô hiệu hóa kết quả ready trước.

**9. Pipeline xuất PDF R6**

Tạo `scripts/export_poster_r6_pdf.js`, kế thừa các phần phù hợp từ exporter R5 và sửa:

- Chạy Chrome headless trong phiên riêng.
- Đợi load event và kiểm tra revision R6; bỏ thời gian chờ cố định 2 giây.
- Chuyển sang media `print` trước preflight.
- Gọi `prepareForPrint(format)` và kiểm tra cả exception lẫn giá trị trả về.
- Xuất Banner rồi A2 tuần tự.
- Giữ timeout hữu hạn cho HTTP, WebSocket và từng lệnh CDP.
- Đóng phiên do exporter tạo trong `finally`.
- Ghi file tạm, xác minh rồi mới đưa thành file kết quả chính thức.

Cấu hình xuất:

```js
const PRINT_SIZES_MM = {
  banner: { width: 1200, height: 600 },
  a2: { width: 420, height: 594 }
};

const size = PRINT_SIZES_MM[format];

const pdfOptions = {
  preferCSSPageSize: true,
  printBackground: true,
  displayHeaderFooter: false,
  paperWidth: size.width / 25.4,
  paperHeight: size.height / 25.4,
  marginTop: 0,
  marginBottom: 0,
  marginLeft: 0,
  marginRight: 0,
  scale: 1
};
```

Đầu ra:

```text
reports/poster-r6/
  tt3d-banner-r6-1200x600.pdf
  tt3d-poster-r6-a2-420x594.pdf
  banner-r6-preview.png
  a2-r6-preview.png
  banner-r6-qr.png
  a2-r6-qr.png
  asset-quality.json
  verification.json
  test-results.txt
  README.md
```

Preview và ảnh QR phải được lấy từ **PDF vừa xuất**. Dùng parser PDF để xác nhận mỗi file đúng một trang, đúng chiều và sai số mỗi cạnh không quá 0,5mm.

QR phải giải mã từ cả hai bản render thành đúng `https://tt3dlabs.vn/#store`; đồng thời đo ảnh SVG đạt 90×90mm và giữ quiet zone tối thiểu bốn module.

**10. Kiểm thử và thứ tự thực thi**

Thực hiện theo chuỗi:

**Lưu baseline → khóa manifest → chuẩn bị ảnh → dựng hai bố cục → hoàn thiện preflight → xuất PDF → render và kiểm tra → chạy regression → bàn giao.**

Cập nhật `tests/test_poster_stall_verification.js` và bổ sung kiểm thử runtime cho các hành vi:

- Mỗi sheet chỉ có một hero, ID `mw-cn-2331892`.
- Tám SKU đúng tên/giá; tập ưu đãi đúng ba ID.
- Không còn giá 39K của Clicker cũ trong artwork.
- Đổi khổ nhiều lần không nhân đôi nội dung hoặc sai trạng thái.
- Format không hợp lệ bị từ chối.
- Font thiếu, ảnh 404 hoặc decode thất bại đều chặn xuất.
- Lần chuẩn bị in trùng bị xử lý rõ ràng.
- Nhãn không bị cắt, giá không che sản phẩm, QR không bị co.
- PDF cuối cùng đúng khổ, đúng một trang và QR giải mã được.

Giữ các kiểm tra logo, URL và tính toàn vẹn catalog. Thay các assertion R5 đã hết hiệu lực bằng assertion R6 tương ứng; không giữ chuỗi cũ chỉ để test xanh.

Repo hiện có **năm bộ test website và một bộ poster**. Chạy năm bộ website sau, lưu cả log và exit code:

```powershell
$websiteTests = @(
  'tests/test_audit_r2_verification.js'
  'tests/test_audit_regressions.js'
  'tests/test_behavior.js'
  'tests/test_hero_showcase_regression.js'
  'tests/test_precision_craft_features.js'
)

foreach ($testFile in $websiteTests) {
  & node $testFile
  if ($LASTEXITCODE -ne 0) {
    throw "Regression thất bại: $testFile"
  }
}
```

Sau khi xuất R6, chạy test poster và runtime R6. Kiểm tra trực quan cả hai PDF render: Clicker là tâm điểm, decor đủ lớn, phụ kiện nhận diện rõ, toàn bộ tên/giá đọc được và không có lỗi glyph.

**11. Điều kiện bàn giao**

Antigravity trả về:

- Diff mã nguồn và danh sách file thay đổi.
- Hai PDF cùng preview được render từ chính các PDF đó.
- Báo cáo PPI theo crop.
- Kích thước trang, kích thước QR và kết quả giải mã.
- Log kiểm thử có exit code.
- Danh sách điều kiện chưa đạt, nếu có.

**Lệnh thực thi:** Bắt đầu R6 theo chỉ thị này. Chỉ ghi **PASS/đã nghiệm thu** khi có bằng chứng tương ứng; không tái sử dụng kết quả R5 làm kết quả R6.

Phiên thẩm định này đã đọc mã, đối chiếu catalog và kiểm tra ảnh nguồn/preview R5; chưa sửa mã hay chạy lại test. Lệnh đọc DOM qua Chrome MCP bị chặn vì công cụ yêu cầu phê duyệt trong khi chính sách phiên không cho phép, nên các điều kiện runtime vẫn phải được Worker xác minh.
