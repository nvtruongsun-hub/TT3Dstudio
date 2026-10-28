# BÁO CÁO NGHIỆM THU ĐẠI PHẪU NGHỆ THUẬT: CONTEMPORARY STUDIO CRAFT (TT3D-POSTER-R4)
**Tham vấn Nghệ thuật: Argon 4 Creative Council & Phê duyệt Kỹ thuật: Codex Master Controller (`gpt-6.1-sol`)**

---

## 1. THIẾT KẾ ĐỘC BẢN: PHONG CÁCH CONTEMPORARY STUDIO LOOKBOOK

Thực hiện chỉ thị trực tiếp từ người dùng:
> *"phông chữ thì xấu màu sắc thì lòe loẹt, hãy tham khảo các thiết kế poster chuyên nghiệp và làm lại cho tôi. lưu ý sau phần clicker cho 1 vài ảnh đặc sắc nhất và sản phẩm đặc sắc nhất, kết hợp với các dạng sản phẩm móc khóa kèm cùng, khuyến mãi 49k giảm còn 35k các sản phẩm dạng decor cũng đưa thêm các sản phẩm nổi bật riêng, hình ảnh qr thì để 1 góc nhỏ thôi. sử dụng skill thiết kế để làm đi"*

Hội đồng nghệ thuật **Argon 4** cùng **Codex Master Controller** đã thống nhất loại bỏ toàn bộ màu sắc chói gắt (vàng be bẩn, đỏ chu sa, xanh cốm, coban, brutalist) để chuyển sang phong cách **Contemporary Studio Lookbook** chuẩn triển lãm thương mại quốc tế:

| Yếu tố | Bản cũ (R3 - Bị chê lòe loẹt) | Bản mới R4 (Contemporary Studio Lookbook) |
|---|---|---|
| **Bảng màu chủ đạo** | Đỏ cam chu sa `#FF3B1D` + Xanh cốm `#D9F99D` + Coban `#1E40AF` (Chói gắt, nặng nề) | **Trắng kem sứ `#FAFAF9`** (nền tĩnh, sang trọng) + **Slate đen than chì `#0F172A`** (chữ sắc nét) + **Cam hổ phách ấm `#EA580C`** (accent thương hiệu) |
| **Typography** | Space Mono kết hợp thô cứng, font brutalist | **100% Plus Jakarta Sans** (weights 500, 600, 700, 800) đồng bộ, line-height cân đối, dấu tiếng Việt hoàn hảo |
| **Phân khu Clicker & Móc khóa** | Chỉ có 1 ảnh clicker đơn độc | **Hero Clicker 39K** kết hợp **Dải 4 sản phẩm móc khóa & clicker phụ**: Kem ốc quế clicker, Mèo con mini khớp động (29K), Móc khóa robot Gundam mecha, Móc khóa đĩa than Spotify NFC |
| **Chương trình Khuyến mãi** | Không có ưu đãi đồng giá | **Badge Sale Đỏ Mận `#E11D48`**: `🔥 ƯU ĐÃI ĐỒNG GIÁ: 49K GIẢM CÒN 35K` nổi bật, chuyên nghiệp |
| **Phân khu Decor & Quà tặng** | Chỉ có 1 ảnh khay nơ | **Hero Khay nơ Coquette 119K** kết hợp **Dải 3 sản phẩm Decor nổi bật riêng**: Ống cắm cọ nếp gấp nơ lụa (139K), Đế đèn mây phi hành gia (129K), Đèn bàn giấy Washi KŌHAKU (289K) |
| **Vị trí Mã QR** | Chiếm nguyên 1 cột lớn 240px lãng phí | **Compact Corner Hub**: Thu gọn vào góc chân poster ($44 \times 44\text{px}$), URL `tt3dlabs.vn · Quét xem thêm mẫu` |

---

## 2. KẾT QUẢ ĐO ĐẠC KÍCH THƯỚC VẬT LÝ & KIỂM ĐỊNH PDF

Hai file PDF in ấn chuẩn quốc tế đã được xuất tự động qua Chrome CDP:
- **Banner ngang ($1200 \times 600\text{ mm}$):** [`reports/poster-r4/tt3d-banner-r4-1200x600.pdf`](./tt3d-banner-r4-1200x600.pdf) ($9.5\text{ MB}$)
  - MediaBox tọa độ: `[0 0 3402 1700.88]` pt = **`1200.15 x 600.03 mm`**
  - Sai số vật lý: **`0.15 mm`** (Quy chuẩn cho phép $\le 0.5\text{ mm}$). Đúng $1$ trang duy nhất.
- **Poster đứng A2 ($420 \times 594\text{ mm}$):** [`reports/poster-r4/tt3d-poster-r4-a2-420x594.pdf`](./tt3d-poster-r4-a2-420x594.pdf) ($8.3\text{ MB}$)
  - MediaBox tọa độ: `[0 0 1191.12 1684.08]` pt = **`420.20 x 594.11 mm`**
  - Sai số vật lý: **`0.20 mm`** (Quy chuẩn cho phép $\le 0.5\text{ mm}$). Đúng $1$ trang duy nhất.

---

## 3. BẢNG TÍNH ĐỘ PHÂN GIẢI HIỆU DỤNG (PPI)

$$\text{PPI} = \frac{\text{Pixel nguồn}}{\text{Kích thước đặt thực tế (mm)} / 25.4}$$

| Định dạng | Sản phẩm | Pixel nguồn | Kích thước in (mm) | PPI Hiệu dụng | Đánh giá độ nét |
|---|---|---|---|---|---|
| **Banner (1200x600mm)** | Hero Clicker cơ học 39K | $1000 \times 1000$ | $180\text{ mm}$ | **$141\text{ PPI}$** | Sắc nét (Chuẩn cự ly quầy hàng) |
| **Banner (1200x600mm)** | Kem ốc quế Clicker (Sale 35K) | $1000 \times 1000$ | $75\text{ mm}$ | **$339\text{ PPI}$** | Tuyệt hảo (Siêu nét chuẩn tạp chí) |
| **Banner (1200x600mm)** | Mèo mini khớp 29K | $1000 \times 1000$ | $75\text{ mm}$ | **$339\text{ PPI}$** | Tuyệt hảo (Siêu nét chuẩn tạp chí) |
| **Banner (1200x600mm)** | Móc khóa robot (Sale 35K) | $1000 \times 1000$ | $75\text{ mm}$ | **$339\text{ PPI}$** | Tuyệt hảo (Siêu nét chuẩn tạp chí) |
| **Banner (1200x600mm)** | Móc khóa Spotify NFC (Sale 35K) | $1000 \times 1000$ | $75\text{ mm}$ | **$339\text{ PPI}$** | Tuyệt hảo (Siêu nét chuẩn tạp chí) |
| **Banner (1200x600mm)** | Hero Khay nơ Coquette 119K | $1000 \times 1000$ | $180\text{ mm}$ | **$141\text{ PPI}$** | Sắc nét (Chuẩn cự ly quầy hàng) |
| **Banner (1200x600mm)** | Ống cắm cọ nơ lụa 139K | $1000 \times 1000$ | $75\text{ mm}$ | **$339\text{ PPI}$** | Tuyệt hảo (Siêu nét chuẩn tạp chí) |
| **Banner (1200x600mm)** | Đế đèn mây phi hành gia 129K | $1000 \times 1000$ | $75\text{ mm}$ | **$339\text{ PPI}$** | Tuyệt hảo (Siêu nét chuẩn tạp chí) |
| **Banner (1200x600mm)** | Đèn Washi KŌHAKU 289K | $1000 \times 1000$ | $75\text{ mm}$ | **$339\text{ PPI}$** | Tuyệt hảo (Siêu nét chuẩn tạp chí) |
| **Poster A2 (420x594mm)** | Hero Clicker cơ học 39K | $1000 \times 1000$ | $100\text{ mm}$ | **$254\text{ PPI}$** | Rất sắc nét (Chuẩn cự ly gần) |
| **Poster A2 (420x594mm)** | Hero Khay nơ Coquette 119K | $1000 \times 1000$ | $100\text{ mm}$ | **$254\text{ PPI}$** | Rất sắc nét (Chuẩn cự ly gần) |
| **Poster A2 (420x594mm)** | Sản phẩm phụ A2 (Clicker/Decor) | $1000 \times 1000$ | $32.5\text{ mm}$ | **$782\text{ PPI}$** | Tuyệt hảo (Siêu nét chuẩn tạp chí) |

---

## 4. KẾT QUẢ GIẢI MÃ MÃ QR & ĐO QUIET ZONE

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
- Bộ test chuyên biệt Poster R4: [`tests/test_poster_stall_verification.js`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T&T%203D%20studio/tests/test_poster_stall_verification.js) đạt **`9/9 PASS (100%)`**.
- Toàn bộ $6$ bộ regression test hệ thống website đạt **`6/6 PASS CLEANLY (100%)`**.
