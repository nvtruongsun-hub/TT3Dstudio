🎯 **[Auto-Router]** `Nhóm Task`: Thẩm định thiết kế & kiến trúc xuất bản in | `Skills`: code-review-pro-max, pdf | `MCP/Engines`: kiểm tra nguồn cục bộ, tham chiếu thiết kế Adobe/Pentagram.

**BẢN CHỈ THỊ PHÊ DUYỆT KIẾN TRÚC & MÃ NGUỒN — TT3D-POSTER-R4**

**Quyết định: PHÊ DUYỆT TRIỂN KHAI R4 theo các điều chỉnh dưới đây.** Antigravity được thực hiện ngay trong phạm vi poster, tài nguyên liên quan và quy trình xuất PDF. Việc nghiệm thu bản in chỉ hoàn tất khi có sản phẩm xuất thực tế và bằng chứng kiểm tra.

Đã đối chiếu nội dung stdin với mã hiện tại tại HEAD `f5bb70a`. Workspace có nhiều thay đổi chưa commit; giữ nguyên mọi thay đổi ngoài phạm vi chỉ thị. Đây là kết quả thẩm định nguồn và ảnh, chưa phải báo cáo chạy thử R4.

**1. Những điểm phải sửa trong đề xuất**

| Mức | Phát hiện đã xác minh | Chỉ thị |
|---|---|---|
| Cao | R3 đã dùng Plus Jakarta Sans, nhưng còn Space Mono, chữ rất đậm, line-height dưới 1 và tracking âm mạnh. | Chỉnh toàn bộ hệ thống chữ; đổi tên phong cách hoặc khai báo lại font sẽ không đủ. |
| Cao | Ưu đãi 49K → 35K chưa chỉ rõ SKU áp dụng. Clicker chủ lực hiện có giá 39K. | Tách chương trình khuyến mãi khỏi giá niêm yết và gắn với danh sách SKU rõ ràng. |
| Cao | Test R3 bắt buộc bảng màu cũ, tem nghiêng và cấu trúc cũ. | Thay tiêu chí thẩm mỹ đã hết hiệu lực; giữ kiểm tra tính đúng của nội dung và bản in. |
| Vừa | Exporter và trình kiểm tra PDF đang cố định đường dẫn `poster-r3`. | Chuyển đồng bộ sang đầu ra R4; tránh kiểm tra nhầm PDF cũ. |
| Vừa | Nhánh chờ ảnh trong `prepareForPrint()` có thể chờ vô hạn nếu ảnh đã tải lỗi trước lúc gắn handler. | Dùng `decode()`, kiểm tra kích thước ảnh và timeout hữu hạn. |
| Vừa | Kiểm tra QR hiện tại mới giải mã PNG nguồn. | Bổ sung giải mã QR từ trang PDF đã render. |

Các điểm trên nằm trong [nguồn poster](<C:/Users/truongg/OneDrive - Thuyloi University/Tài liệu/02. T&T 3D studio/poster-artisan-stall.html>), [exporter](<C:/Users/truongg/OneDrive - Thuyloi University/Tài liệu/02. T&T 3D studio/scripts/export_poster_pdf.js>) và [bộ kiểm tra poster](<C:/Users/truongg/OneDrive - Thuyloi University/Tài liệu/02. T&T 3D studio/tests/test_poster_stall_verification.js>).

**2. Art direction được duyệt**

“Contemporary Studio Craft” được hiểu thành các quyết định cụ thể:

- Nền sáng, ảnh sản phẩm lớn, khoảng trống rõ ràng.
- Hai khu sản phẩm có thứ bậc: Clicker & phụ kiện; Decor & quà tặng.
- Một điểm nhấn khuyến mãi, một QR nhỏ ở chân.
- Bỏ dải băng chéo, tem giá xoay, khối màu phủ toàn cột và các nhãn kỹ thuật trang trí.
- Khung ảnh phụ nhẹ, thống nhất; không bao mỗi sản phẩm bằng một thẻ có bóng đổ nặng.

Áp dụng nguyên tắc phân cấp thông tin và tiết chế màu/chữ của [Adobe](https://www.adobe.com/express/learn/blog/poster-layout-design), tham khảo cách tổ chức hệ chữ nhất quán trong [nhận diện Cooper Hewitt của Pentagram](https://www.pentagram.com/news/cooper-hewitt-a-democratic-design-identity). Đây là cơ sở thiết kế, không sao chép bố cục nhận diện của họ.

Chốt token:

```css
:root {
  --paper: #FAFAF9;
  --ink: #0F172A;
  --muted: #334155;
  --accent: #EA580C;
  --sale: #E11D48;
  --surface: #F8FAFC;
  --line: #E2E8F0;
  --font-sans: "Plus Jakarta Sans", sans-serif;
}
```

Màu cam dùng cho chi tiết nhận diện; đỏ mận chỉ dùng cho ưu đãi. Chữ mô tả dùng màu đậm trên nền sáng. Không tạo thêm màu nhấn ngoài bảng này.

**3. Typography bắt buộc làm lại**

Duyệt Plus Jakarta Sans, đồng thời:

- Tự lưu font có đủ ký tự tiếng Việt và giấy phép trong `assets/fonts/`.
- Nội dung phụ dùng weight 500–600; tiêu đề 700; giá hoặc điểm nhấn 800.
- Tiêu đề dùng `line-height: 1.12–1.2`; mô tả `1.4–1.5`.
- Tracking tiêu đề không âm quá `-0.02em`; nội dung tiếng Việt để bình thường.
- Viết hoa có chọn lọc. Không biến toàn bộ mô tả thành chữ hoa.
- Loại Space Mono khỏi artwork và loại phụ thuộc Font Awesome CDN nếu chỉ dùng vài biểu tượng.
- Kiểm tra trực quan chuỗi: “Móc khóa • Quà tặng • Ưu đãi • Ống cắm cọ • 35.000₫”.

`document.fonts.ready` chỉ là một phần của kiểm tra. Phải xác nhận font dự kiến thực sự tải thành công; thiếu font phải báo lỗi xuất.

**4. Nội dung sản phẩm và giá**

Đối chiếu [catalog hiện tại](<C:/Users/truongg/OneDrive - Thuyloi University/Tài liệu/02. T&T 3D studio/products.json>) cho kết quả:

| Vai trò | ID sản phẩm | Tên hiển thị rút gọn | Giá niêm yết |
|---|---|---|---:|
| Chủ lực Clicker | `mw-cn-2370777` | Clicker cơ học | 39.000₫ |
| Ảnh phụ | `mw-cn-2331892` | Clicker kem ốc quế | 49.000₫ |
| Ảnh phụ | `mw-cn-1433737` | Mèo mini khớp động | 29.000₫ |
| Móc khóa | `mw-cn-704003` | Móc khóa robot khớp động | 49.000₫ |
| Móc khóa | `mw-cn-939925` | Móc khóa đĩa than NFC | 49.000₫ |
| Chủ lực Decor | `mw-cn-1646129` | Khay nơ Coquette | 119.000₫ |
| Decor phụ | `mw-cn-2084928` | Ống cắm cọ nơ lụa | 139.000₫ |
| Decor phụ | `mw-cn-2235027` | Đèn Washi KŌHAKU | 289.000₫ |
| Decor phụ | `mw-cn-1438306` | Đế đèn mây phi hành gia | 129.000₫ |

Không đổi “đế đèn” thành bộ đèn hoàn chỉnh nếu chưa xác minh phụ kiện đi kèm.

**Quy tắc khuyến mãi:**

- Dựng ngay component thể hiện giá cũ `49.000₫` gạch ngang và giá mới `35.000₫`.
- Đặt ưu đãi trong khu Clicker/phụ kiện, cạnh các mẫu áp dụng.
- Danh sách `productIds` phải dựa vào thông tin chiến dịch có trong bridge/lịch sử công việc. Việc một sản phẩm có giá 49K chưa chứng minh sản phẩm đó được giảm.
- Nếu chưa có bằng chứng xác định SKU, vẫn hoàn thiện bố cục và preview ưu đãi; ghi trạng thái chờ xác định phạm vi trong báo cáo nội bộ. Chưa đánh dấu PDF đó là bản in đã nghiệm thu.
- Không đổi Clicker 39K thành giá gốc 49K; không sửa giá toàn website từ tác vụ poster.

Tách rõ dữ liệu:

```js
const campaign = {
  id: "poster-r4-49-to-35",
  originalPrice: 49000,
  salePrice: 35000,
  productIds: [], // Điền SKU đã xác minh phạm vi áp dụng.
};
```

Khi SKU được chốt, kiểm tra giá catalog của từng SKU bằng 49.000₫ trước khi áp dụng ưu đãi.

**5. Bố cục triển khai**

Giữ hai canvas thiết kế:

- Banner: `1200 × 600px`, xuất `1200 × 600mm`.
- A2: `840 × 1188px`, xuất `420 × 594mm`.

**Banner ngang:**

- Masthead gọn: thương hiệu và một câu định vị.
- Phần chính hai cột, khoảng 57% cho Clicker/phụ kiện và 43% cho Decor.
- Mỗi cột có một ảnh chủ lực, tên và giá rõ ràng.
- Dưới Clicker có dải bốn ảnh: kem, mèo, robot, đĩa than NFC.
- Dưới khay nơ có ba decor riêng: ống cắm cọ, Washi, đế đèn mây.
- Footer chứa dịch vụ bên trái; QR và URL ở góc phải.

**A2 đứng:**

- Masthead → Clicker chủ lực → dải phụ kiện → Decor chủ lực → dải decor → footer.
- Dải phụ kiện dùng lưới 2 × 2 nếu bốn ảnh cùng hàng làm tên quá nhỏ.
- Thiết kế lại grid cho chiều dọc; không thu nhỏ nguyên banner để nhét vào A2.
- Ưu tiên giảm nội dung phụ trước khi giảm ảnh hoặc cỡ chữ.

Nội dung dịch vụ: **“Nhận in quà tặng & thêm tên theo yêu cầu”**.

Bỏ thông số lớp in `0.16mm`, mã “issue”, nhãn CAD và các tuyên bố vật liệu không cần thiết cho quyết định mua hàng. Không thêm cam kết “lấy ngay”, “an toàn tuyệt đối” hoặc thời hạn sale tự đặt.

**6. Xử lý ảnh và QR**

Tám thumbnail đề xuất đều tồn tại và có kích thước `1000 × 1000px`. Tôi đã xem ảnh kem và khay: ảnh kem có chữ trang trí trên ảnh, khay có bối cảnh chụp riêng. Vì vậy, chưa thể coi toàn bộ ảnh là một bộ ảnh studio đồng nhất.

Worker phải:

- Xem đủ các ảnh trước khi chốt.
- Ưu tiên nguồn ảnh sạch đã có; dùng khung crop nhất quán, giữ trọn sản phẩm.
- Không kéo méo hoặc phóng lớn rồi báo cáo là tăng chi tiết.
- Nếu cần chỉnh ảnh, giữ nguyên hình dáng và đặc điểm sản phẩm.
- Đo PPI theo vùng ảnh nguồn thực sự dùng sau crop:

```text
PPI = pixel nguồn sử dụng / (kích thước in mm / 25.4)
```

Ngưỡng nghiệm thu nội bộ: banner tối thiểu 100 PPI, A2 tối thiểu 150 PPI; ghi rõ ảnh nào dưới mục tiêu. Không tính lại pixel do upscale thành chi tiết nguồn.

QR dùng SVG hiện có, đen trên trắng, giữ nguyên vùng trắng bao quanh. Kích thước khởi điểm gồm vùng trắng: khoảng 40mm trên banner và 30mm trên A2. Điều chỉnh theo kết quả quét, đồng thời giữ cụm QR gọn ở góc.

Đích QR: `https://tt3dlabs.vn/#store`. Caption: **“tt3dlabs.vn · Quét xem thêm mẫu”**.

**7. Kiến trúc mã và xuất PDF**

Giữ poster độc lập với ứng dụng bán hàng. Dữ liệu trưng bày dùng một manifest nhỏ để cả banner và A2 lấy cùng tên, ảnh, giá; không tạo framework hoặc pipeline mới.

Giữ các contract:

```js
switchFormat("banner" | "a2");
fitPreview();
await prepareForPrint("banner" | "a2");
```

Yêu cầu triển khai:

- `ResizeObserver` tiếp tục điều khiển preview.
- Đặt chiều cao vùng preview theo viewport; chỉ dùng `min-height` chưa đủ bảo đảm luôn vừa màn hình.
- Đổi định dạng cập nhật đồng thời `hidden` và `aria-pressed`.
- Print bỏ transform preview; chỉ áp dụng scale vật lý của artwork.
- `prepareForPrint()` kiểm tra định dạng, font, `img.decode()`, kích thước ảnh và layout ổn định.
- Có timeout hữu hạn; lỗi phải chỉ rõ tài nguyên và chặn xuất.
- Exporter dùng cấu hình chung cho tên file/kích thước; không hardcode rải rác `r3`.
- Dùng Chromium headless riêng cho xuất nếu môi trường hỗ trợ; tránh phụ thuộc tab tư vấn đang mở.
- Đóng kết nối và tiến trình do exporter tạo trong `finally`.

Giữ nguyên:

```css
@page stall-banner { size: 1200mm 600mm; margin: 0; }
@page stall-a2 { size: 420mm 594mm; margin: 0; }
```

Hai PDF phải có đúng một trang, sai số kích thước tối đa `0.5mm`. Kiểm tra bằng trình đọc PDF thực sự; regex đọc `/MediaBox` chỉ dùng hỗ trợ chẩn đoán.

Không tự thêm bleed làm thay đổi kích thước đã yêu cầu.

**8. Phạm vi sửa được duyệt**

- `poster-artisan-stall.html`
- Tài nguyên mới trong `assets/images/poster-r4/`, font và giấy phép trong `assets/fonts/`
- Các script export, kiểm tra PDF và QR liên quan
- Bộ kiểm tra poster
- Báo cáo và đầu ra trong `reports/poster-r4/`

Giữ tài nguyên và báo cáo R3 làm đối chiếu. Không sửa cart, checkout, trang chủ hoặc triển khai công khai trong nhiệm vụ này.

**9. Cổng nghiệm thu bắt buộc**

| Nhóm | Bằng chứng phải có |
|---|---|
| Nội dung | Hai định dạng đủ sản phẩm; tên, ảnh và giá khớp manifest/catalog |
| Khuyến mãi | Phạm vi SKU rõ ràng; không áp dụng nhầm Clicker 39K hoặc decor |
| Preview | Kiểm tra 375, 768, 1440px và màn hình thấp; không tràn ngang, nút vẫn dùng được |
| Bố cục | Không chồng tên, giá, ảnh, QR; không dùng `overflow:hidden` để che lỗi |
| Tài nguyên | Không ảnh hỏng, font thiếu hoặc lỗi tải tài nguyên |
| PDF | Một trang/file; đúng khổ; không in thanh điều khiển |
| QR | Giải mã được từ PDF đã render về đúng URL |
| Thị giác | Xem cả toàn trang và crop 100% từ PDF cuối; kiểm tra dấu tiếng Việt, ảnh, giá và khoảng cách |

Thay các assertion bắt buộc màu R3 và tem nghiêng bằng tiêu chí R4. Không xóa kiểm tra giá, QR, kích thước hoặc trạng thái đổi định dạng để làm test xanh.

**10. Bàn giao cho Codex**

Antigravity trả về:

- Hai PDF R4 và hai PNG render từ chính PDF đó.
- Manifest sản phẩm/khuyến mãi, bảng PPI và kết quả giải mã QR.
- Diff giới hạn trong phạm vi được duyệt.
- Lệnh đã chạy, exit code và log kiểm tra thực tế.
- Báo cáo rõ trạng thái từng mục: đạt, chưa đạt hoặc chưa chạy.

**Lệnh thực thi: bắt đầu R4 theo chỉ thị này. Hoàn thiện thiết kế, mã và kiểm tra; chỉ ghi “đã nghiệm thu bản in” sau khi mọi cổng bắt buộc đều đạt.**