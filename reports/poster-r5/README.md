# BÁO CÁO NGHIỆM THU ĐẠI PHẪU NGHỆ THUẬT R5: "CONTEMPORARY STUDIO SIGNATURE"
**Hội đồng Chiến lược: Tham vấn Art Direction từ Argon 4 & Thẩm định Kỹ thuật bởi Codex Master Controller (`gpt-6.1-sol`)**

---

## 1. GIẢI QUYẾT TRIỆT ĐỂ YÊU CẦU NGƯỜI DÙNG: BẢN SẮC RIÊNG CỦA T&T 3D LABS

Người dùng yêu cầu:
> *"vẫn chưa có bản sắc riêng clicker kia để làm nền chính ko có gì đặc sắc hãy chọn món đồ đặc sắc nhất và mã qr để quá bé bên cạnh đó phải để logo thương hiệu shop vào. hãy cải tiến toàn diện lại"*

### Bốn Quyết Định Thiết Kế Đột Phá Đã Thực Thi:
1. **Khay Nơ Coquette Lụa Mềm Là Hero Showstopper Chính Của Shop:**
   - Xóa bỏ việc dùng Clicker làm nền chính.
   - Chọn [Khay đĩa lụa mềm thắt nơ Coquette](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T&T%203D%20studio/assets/images/poster-r4/tray-hero.png) (`mw-cn-1646129` - sản phẩm đứng đầu toàn bộ danh mục với 12.437 lượt tải) làm **Visual Showstopper** lớn nhất ở trung tâm, đại diện cho kỹ nghệ in lụa Silk óng ả không gợn vân và thẩm mỹ thời thượng Douyin/Xiaohongshu.
   - Đi kèm là các tuyệt phẩm decor ánh sáng: Ống cắm cọ nơ lụa (139K), Đèn bàn giấy Washi KŌHAKU (289K).
2. **Khu Vực Quà Tặng & Đồ Chơi Xả Stress Thông Minh:**
   - Clicker phím cơ in 3D (39K), Mèo con mini khớp động (29K).
   - Móc khóa robot Gundam mecha, Móc khóa đĩa than Spotify NFC chạm phát nhạc.
   - **Badge Ưu Đãi Đồng Giá:** `🔥 ƯU ĐÃI ĐỒNG GIÁ: 49K GIẢM CÒN 35K` (Áp dụng đúng 3 sản phẩm: Kem clicker, Robot mecha, Móc khóa Spotify NFC).
3. **Nhúng Logo Thương Hiệu Chính Thức:**
   - Đặt logo vector chính thức của shop [assets/images/logo-premium.svg](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T&T%203D%20studio/assets/images/logo-premium.svg) với biểu tượng khối lập phương 3D đặc trưng tại Header góc trái trên cả hai khổ Banner và A2.
4. **Phóng To Mã QR Đúng Chuẩn 90mm:**
   - Tăng kích thước từ 44px lên **`90 x 90px` trên canvas** (tương đương **`90 x 90mm` trên bản in vật lý**).
   - Đặt trong khung Prominent Hub sang trọng, kèm CTA chính xác và kích thích quét:
     `QUÉT XEM DANH MỤC MẪU`
     `🌐 tt3dlabs.vn • Quét để xem video & đặt in màu bạn thích`

---

## 2. KẾT QUẢ ĐO ĐẠC KÍCH THƯỚC VẬT LÝ & KIỂM ĐỊNH PDF

Hai file PDF in ấn chuyên nghiệp đã được xuất tự động qua Chrome CDP:
- **Banner ngang ($1200 \times 600\text{ mm}$):** [`reports/poster-r5/tt3d-banner-r5-1200x600.pdf`](./tt3d-banner-r5-1200x600.pdf) ($8.7\text{ MB}$)
  - MediaBox tọa độ: `[0 0 3402 1700.88]` pt = **`1200.15 x 600.03 mm`**
  - Sai số vật lý: **`0.15 mm`** (Quy chuẩn cho phép $\le 0.5\text{ mm}$). Đúng $1$ trang duy nhất.
- **Poster đứng A2 ($420 \times 594\text{ mm}$):** [`reports/poster-r5/tt3d-poster-r5-a2-420x594.pdf`](./tt3d-poster-r5-a2-420x594.pdf) ($7.9\text{ MB}$)
  - MediaBox tọa độ: `[0 0 1191.12 1684.08]` pt = **`420.20 x 594.11 mm`**
  - Sai số vật lý: **`0.20 mm`** (Quy chuẩn cho phép $\le 0.5\text{ mm}$). Đúng $1$ trang duy nhất.

---

## 3. BẢNG TÍNH ĐỘ PHÂN GIẢI HIỆU DỤNG (PPI)

$$\text{PPI} = \frac{\text{Pixel nguồn}}{\text{Kích thước đặt thực tế (mm)} / 25.4}$$

| Định dạng | Sản phẩm | Pixel nguồn | Kích thước in (mm) | PPI Hiệu dụng | Đánh giá độ nét |
|---|---|---|---|---|---|
| **Banner (1200x600mm)** | Hero Khay nơ Coquette 119K | $1000 \times 1000$ | $210\text{ mm}$ | **$121\text{ PPI}$** | Rất sắc nét (Cự ly quầy hàng) |
| **Banner (1200x600mm)** | Đèn Washi KŌHAKU 289K | $1000 \times 1000$ | $100\text{ mm}$ | **$254\text{ PPI}$** | Siêu nét (Cự ly gần) |
| **Banner (1200x600mm)** | Ống cắm cọ nơ lụa 139K | $1000 \times 1000$ | $100\text{ mm}$ | **$254\text{ PPI}$** | Siêu nét (Cự ly gần) |
| **Banner (1200x600mm)** | Clicker cơ học phím bấm 39K | $1000 \times 1000$ | $120\text{ mm}$ | **$212\text{ PPI}$** | Rất sắc nét (Cự ly gần) |
| **Banner (1200x600mm)** | Kem ốc quế Clicker (Sale 35K) | $1000 \times 1000$ | $68\text{ mm}$ | **$374\text{ PPI}$** | Tuyệt hảo (Chuẩn tạp chí) |
| **Banner (1200x600mm)** | Mèo mini khớp 29K | $1000 \times 1000$ | $68\text{ mm}$ | **$374\text{ PPI}$** | Tuyệt hảo (Chuẩn tạp chí) |
| **Banner (1200x600mm)** | Móc khóa robot (Sale 35K) | $1000 \times 1000$ | $68\text{ mm}$ | **$374\text{ PPI}$** | Tuyệt hảo (Chuẩn tạp chí) |
| **Banner (1200x600mm)** | Móc khóa Spotify NFC (Sale 35K) | $1000 \times 1000$ | $68\text{ mm}$ | **$374\text{ PPI}$** | Tuyệt hảo (Chuẩn tạp chí) |
| **Poster A2 (420x594mm)** | Hero Khay nơ Coquette 119K | $1000 \times 1000$ | $110\text{ mm}$ | **$231\text{ PPI}$** | Rất sắc nét (Cự ly gần) |
| **Poster A2 (420x594mm)** | Clicker cơ học 39K | $1000 \times 1000$ | $45\text{ mm}$ | **$564\text{ PPI}$** | Tuyệt hảo (Chuẩn tạp chí) |
| **Poster A2 (420x594mm)** | Sản phẩm phụ A2 (Clicker/Decor) | $1000 \times 1000$ | $30\text{ mm}$ | **$847\text{ PPI}$** | Tuyệt hảo (Chuẩn tạp chí) |

---

## 4. KẾT QUẢ GIẢI MÃ MÃ QR & ĐO QUIET ZONE

- Kích thước QR thực tế trên bản in: **$90 \times 90\text{mm}$** (sai số $\le 0.5\text{mm}$).
- Mã QR vector chuẩn DENSO WAVE trong SVG ($25 \times 25$ module, viewBox $33 \times 33$, quiet zone $= 4\text{ modules}$).
- Giải mã trực tiếp từ file ảnh qua `jsQR`:
  ```text
  Image dimensions: 600x600
  Decoded content : https://tt3dlabs.vn/#store
  Decoded location: OK
  [PASS] QR strictly decodes to expected target: https://tt3dlabs.vn/#store
  ```

---

## 5. HỆ THỐNG KIỂM THỬ TỰ ĐỘNG
- Bộ test chuyên biệt Poster R5: [`tests/test_poster_stall_verification.js`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi University/T%C3%A0i%20li%E1%BB%87u/02.%20T&T%203D%20studio/tests/test_poster_stall_verification.js) đạt **`9/9 PASS (100%)`**.
- Toàn bộ $6$ bộ regression test hệ thống website đạt **`6/6 PASS CLEANLY (100%)`**.
