# KẾ HOẠCH NÂNG CẤP GIAO DIỆN & TRẢI NGHIỆM NGƯỜI DÙNG (UI/UX TRANSFORMATION PLAN)
## THIẾT KẾ ĐỊNH HƯỚNG: PREMIUM DIGITAL FABRICATION + CRAFTSMANSHIP ATELIER

**Tài liệu tham chiếu:** `reports/TRANSFORMATION_BASELINE_AUDIT.md` • `reports/PRODUCT_VISION_AND_STRATEGY.md`  
**Ngày ban hành:** 02/11/2026  
**Chủ trì:** Senior UI/UX Designer & Ecommerce Product Engineer  

---

## 1. HỆ THỐNG THIẾT KẾ TỔNG THỂ (ATELIER DESIGN SYSTEM)

### 1.1. Bảng màu Thẩm mỹ (Color Palette)
Thiết kế theo tông màu ấm áp Bắc Âu (Warm Nordic Atelier) kết hợp thẩm mỹ chế tác công nghiệp cao cấp, loại bỏ hoàn toàn các màu neon chói mắt hoặc độ tương phản yếu:
* **Màu nền (Canvas):** `#FBFBFA` (Màu giấy lụa ấm) kết hợp bề mặt `#FFFFFF` và khung viền `#E5E4DE`.
* **Màu văn bản chính:** `#20231F` (Đen chì than mềm, tỷ lệ tương phản `13.5:1` trên nền trắng).
* **Màu văn bản phụ:** `#586057` (Xám rêu tro trung tính, tỷ lệ tương phản `5.8:1`).
* **Màu nhấn thương hiệu (Brand Accent):** `#B84824` (Cam đất nung / Terracotta Amber đậm nét, đạt tỷ lệ tương phản `5.27:1` trên nền trắng, thỏa mãn chuẩn **WCAG AA** $\ge 4.5:1$).
* **Màu trạng thái:** Xanh ngọc `#059669` (Thành công/Freeship), Xanh hoàng gia `#2563EB` (Thông tin kỹ thuật), Đỏ hồng `#E11D48` (Cảnh báo).

### 1.2. Typography & Phông chữ
* **Phông chữ chủ đạo:** `Inter` kết hợp `system-ui` tối ưu tốc độ tải 0ms.
* **Hệ số tỷ lệ hiển thị:**
  * Tiêu đề Hero: `clamp(2rem, 5vw, 3.25rem)` font-weight `800` tracking `-0.02em`.
  * Tiêu đề Section: `clamp(1.5rem, 3vw, 2.25rem)` font-weight `700`.
  * Văn bản nội dung: `15px` / line-height `1.6`.
  * Thông số kỹ thuật / Giá tiền: `font-mono` (chữ số cố định chiều rộng, tránh nhảy layout khi cập nhật số).

### 1.3. Lưới Responsive & Vùng Chạm Di Động (Touch Targets)
* **Mobile (360px – 430px):** Đệm viền ngang `16px`. Các nút bấm chính đạt chiều cao tối thiểu `48px` (tuân thủ Apple HIG và Google Material Design). Thanh Bottom Dock chia đều 4 cột đối xứng (`grid-template-columns: repeat(4, 1fr)`), có đệm an toàn `calc(76px + env(safe-area-inset-bottom))`.
* **Tablet (768px – 1024px):** Bố cục 2–3 cột sản phẩm, thanh điều hướng nổi căn giữa.
* **Desktop (1280px – 1440px):** Độ rộng container tối đa `1280px`, lưới sản phẩm 4 cột thoáng đãng.

---

## 2. TÁI CẤU TRÚC TRANG CHỦ (HOMEPAGE EXPERIENCE JOURNEY)

Theo lộ trình phát triển đã thống nhất, trang chủ được tổ chức lại theo đúng dòng quyết định mua sắm của khách:

```
[1. TOP MARQUEE] Ticker chạy vô tận: Cam kết xưởng Hà Tĩnh • 1 đổi 1 • Freeship 300K • Hotline
  ↓
[2. HEADER & BRAND] Logo "T&T 3D Studio" • Tìm kiếm • Giỏ hàng badge • Nút Tài khoản
  ↓
[3. HERO SECTION - 2 HÀNH TRÌNH CHÍNH]
  ├── Hành trình 1 (Khám phá): Mua đồ decor, phụ kiện bàn làm việc có sẵn -> #store-catalog
  └── Hành trình 2 (Đặt chế tác): Gửi file CAD / Đặt theo yêu cầu -> #custom-quotation
  ↓
[4. VALUE & CRAFTSMANSHIP] 3 Trụ cột: Dàn máy Bambu Lab • Bio-PLA/PETG • Lớp in 0.16mm/0.08mm
  ↓
[5. BESTSELLERS & COMBO] 3 Bộ Setup tiêu biểu (Tự động kích hoạt giảm 10% khi bấm mua trọn bộ)
  ↓
[6. CATALOG BỘ SƯU TẬP 105 SẢN PHẨM] Bộ lọc thông minh: Danh mục, Mức giá, Màu sắc, Thẻ nổi bật
  ↓
[7. CỔNG TIẾP NHẬN IN 3D & BÁO GIÁ CAD] Upload file STL/STEP • Chọn vật liệu • Nhận báo giá
  ↓
[8. GIẢI PHÁP DOANH NGHIỆP & QUÁN CÀ PHÊ] Đế WiFi NFC một chạm • Biển QR trượt • Khắc logo
  ↓
[9. CHÍNH SÁCH XƯỞNG & FAQ MINH BẠCH] Địa chỉ Cẩm Xuyên, Hà Tĩnh • Bảo hành 7 ngày • Hướng dẫn nhiệt độ
  ↓
[10. FOOTER THỐNG NHẤT] Bản đồ xưởng • Liên hệ Zalo/Hotline • Tra cứu đơn hàng • Bản quyền
```

---

## 3. TỐI ƯU HÓA TRẢI NGHIỆM CHI TIẾT SẢN PHẨM (PRODUCT MODAL)

1. **Hiển thị Ảnh & Biến thể Thực:**
   - 100% sản phẩm có ảnh chụp sắc nét độ phân giải cao, hỗ trợ zoom xem vân in chi tiết.
   - Chọn màu sắc trực quan qua bảng màu thực tế (Trắng ngọc trai Silk, Hồng pastel, Cam nhám Terracotta, Xanh rêu Forest).
   - Tự động cộng giá phụ thu biến thể vật liệu (Ví dụ: Nhựa Silk +20.000 đ) minh bạch.
2. **Khung Thông số Kỹ thuật (Technical Specs Grid):**
   - Kích thước thực tế: Dài × Rộng × Cao (mm).
   - Khối lượng tịnh (Gram) và thời gian máy in vận hành (Giờ).
   - Khuyến nghị nhiệt độ tối đa: PLA $\le 55^\circ\text{C}$, PETG $\le 75^\circ\text{C}$.
3. **Nút Thêm Giỏ Hàng & Mua Ngay Tức Thì:**
   - Trên desktop: Nút nổi bật hiển thị rõ tổng tiền đã tính phụ thu.
   - Trên mobile: Nút cố định đáy màn hình (Sticky CTA) khi cuộn xem mô tả.

---

## 4. QUY CHUẨN TRUY CẬP (ACCESSIBILITY & PERFORMANCE STANDARDS)

* **Semantic HTML:** Đầy đủ các thẻ `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`.
* **Accessible Names:** Mọi nút bấm icon không có text đều có `aria-label` mô tả rõ ràng (`aria-label="Mở giỏ hàng"`, `aria-label="Đăng nhập tài khoản"`).
* **Keyboard Focus:** Đường viền focus nổi bật `2px solid #B84824` khi duyệt bằng phím Tab.
* **Tối ưu hình ảnh:** Toàn bộ ảnh sản phẩm được gắn cờ `loading="lazy"` và `decoding="async"`, có kích thước `width` và `height` cố định để triệt tiêu hiện tượng giật giãy layout (Cumulative Layout Shift - CLS = 0).
