# BÁO CÁO NGHIỆM THU ĐẠI PHẪU TOÀN DIỆN POSTER & BANNER T&T 3D LABS (TT3D-POSTER-R2)
**Theo chỉ thị phê duyệt kiến trúc & mã nguồn GPT-6.1-Sol (Codex Master Controller)**

---

## 1. TỔNG QUAN THAY ĐỔI & ĐỐI CHIẾU NGHỆ THUẬT

| Hạng mục | Bản Cũ (Bị chê mất thẩm mỹ) | Bản Mới Đại Phẫu (Modern Pop-Artisan) |
|---|---|---|
| **Phong cách** | Cổ điển, giấy báo cũ, vàng úa, nghiêm túc | Trẻ trung, sáng sủa, thân thiện, tràn đầy năng lượng |
| **Bảng màu** | Nền Linen `#FAF8F5`, Than chì `#1F2421`, Đất nung đậm | Nền ngọc trai sáng `#FFFDF9`, Cam San Hô `#FF5A36`, Xanh Mint `#06D6A0`, Vàng Bơ `#FFB703` |
| **Typography** | Font serif Playfair Display + JetBrains Mono gầy còm | **Space Grotesk** (Display cá tính) + **Plus Jakarta Sans** (Nội dung đậm nét, rõ ràng) |
| **Hiển thị Preview** | Khổ cứng 1200px, tràn ngang màn hình, cắt méo sản phẩm | **ResizeObserver Auto-Fit 100% viewport**, tự động co giãn đẹp mắt trên mọi thiết bị |
| **Khung ảnh sản phẩm**| Bị ép mỏng 90-115px, cắt cụt đầu đuôi | Khung rộng rãi, `object-fit: contain`, tôn trọn vẹn chi tiết từng đường vân in 3D |
| **Bố cục A2** | 3 thẻ dọc dài nối tiếp giống bản banner | Bố cục A2 chuyên biệt: Header $\rightarrow$ 2 card sản phẩm song song $\rightarrow$ Trạm QR lớn chân trang |
| **Mã QR** | Quiet zone cũ 1 module, bị chìm | SVG vector chuẩn DENSO WAVE 4 modules quiet zone, giải mã chính xác 100% `https://tt3dlabs.vn/#store` |

---

## 2. BẢNG TÍNH ĐỘ PHÂN GIẢI HIỆU DỤNG (PPI) CỦA ẢNH SẢN PHẨM

Công thức: $\text{PPI} = \frac{\text{Pixel nguồn}}{\text{Kích thước đặt ảnh (mm)} / 25.4}$

| Định dạng | Sản phẩm | Nguồn ảnh (px) | Kích thước đặt trên bản in (mm) | PPI Hiệu dụng | Đánh giá chất lượng thực tế |
|---|---|---|---|---|---|
| **Banner (1200x600mm)** | Clicker phím cơ | $1000 \times 1000$ | $314 \times 180\text{ mm}$ | **$81 - 141\text{ PPI}$** | Sắc nét ở cự ly quan sát quầy $1.5\text{m} - 3\text{m}$ |
| **Banner (1200x600mm)** | Khay Coquette nơ | $1000 \times 1000$ | $314 \times 180\text{ mm}$ | **$81 - 141\text{ PPI}$** | Rõ đường vân lụa ở cự ly quan sát quầy |
| **Poster A2 (420x594mm)** | Clicker phím cơ | $1000 \times 1000$ | $160 \times 125\text{ mm}$ | **$159 - 203\text{ PPI}$** | Rất sắc nét ở khoảng cách đứng xem $0.8\text{m} - 1.5\text{m}$ |
| **Poster A2 (420x594mm)** | Khay Coquette nơ | $1000 \times 1000$ | $160 \times 125\text{ mm}$ | **$159 - 203\text{ PPI}$** | Rất sắc nét ở khoảng cách đứng xem $0.8\text{m} - 1.5\text{m}$ |

---

## 3. BẰNG CHỨNG XUẤT FILE IN ẤN VẬT LÝ (PDF)

Hai file PDF thực tế đã được xuất qua Chrome CDP với độ chính xác cao:
- **Banner PDF:** [`tt3d-banner-1200x600.pdf`](./tt3d-banner-1200x600.pdf)
  - Kích thước MediaBox: `3402 x 1700.88 pt` = **`1200.15 x 600.03 mm`** (Sai số: $0.15\text{ mm}$, chuẩn giới hạn $\le 0.5\text{ mm}$).
  - Số trang: Đúng $1$ trang duy nhất. Dung lượng: $2.3\text{ MB}$.
- **Poster A2 PDF:** [`tt3d-poster-a2-420x594.pdf`](./tt3d-poster-a2-420x594.pdf)
  - Kích thước MediaBox: `1191.12 x 1684.08 pt` = **`420.20 x 594.11 mm`** (Sai số: $0.20\text{ mm}$, chuẩn giới hạn $\le 0.5\text{ mm}$).
  - Số trang: Đúng $1$ trang duy nhất. Dung lượng: $1.8\text{ MB}$.

---

## 4. BẰNG CHỨNG GIẢI MÃ MÃ QR (QR DECODE TRUTH)

Chạy kiểm tra giải mã ma trận qua thư viện `jsQR`:
```text
Image dimensions: 600x600
Decoded content : https://tt3dlabs.vn/#store
Decoded location: OK
[PASS] QR strictly decodes to expected target: https://tt3dlabs.vn/#store
```

---

## 5. BẰNG CHỨNG KIỂM THỬ KHÔNG TRÀN MÀN HÌNH (NO OVERFLOW)

Đo đạc thực tế qua Chrome DevTools tại 4 độ phân giải tiêu chuẩn:
- **Mobile (375x812):** `docScrollWidth = docClientWidth`, `hasHorizontalOverflow = false`.
- **Tablet (768x1024):** `docScrollWidth = docClientWidth`, `hasHorizontalOverflow = false`.
- **Laptop (1366x768):** `docScrollWidth = docClientWidth`, `hasHorizontalOverflow = false`.
- **Desktop (1920x1080):** `docScrollWidth = docClientWidth`, `hasHorizontalOverflow = false`.
