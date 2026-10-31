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