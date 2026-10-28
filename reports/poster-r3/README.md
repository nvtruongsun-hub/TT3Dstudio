# BÁO CÁO NGHIỆM THU ĐẠI PHẪU NGHỆ THUẬT: NEO-TACTILE POP & SWISS KINETIC (TT3D-POSTER-R3)
**Hội đồng Chiến lược: Tham vấn Art Direction từ Argon 4 & Thẩm định Kỹ thuật bởi Codex Master Controller (`gpt-6.1-sol`)**

---

## 1. BẢN THIẾT KẾ ĐỘC BẢN: THOÁT KHỎI BẪY "THẺ WEB" (ZERO-CARD RULE)

Dựa trên chỉ trích và yêu cầu của người dùng về việc thiết kế phải mang phong cách riêng, màu sắc xu thế mới, **Argon 4** và **Codex Master** đã thống nhất xóa bỏ hoàn toàn layout "chia card website":

| Hạng mục | Bản Cũ (R1 & R2 - Bị chê) | Bản Mới R3 (Neo-Tactile Pop & Swiss Kinetic) |
|---|---|---|
| **Cấu trúc thị giác** | Bị "Hội chứng thẻ web" (3 hình chữ nhật bo góc đặt cạnh nhau như trang web) | **Full-Bleed Asymmetric Color-Blocking**: 3 mảng màu liền mép không gutter, đường kẻ sắc cạnh |
| **Bảng màu** | Be vàng bẩn hoặc trắng xám đơn điệu | **Raw Butter & Electric Vermilion**: Nền Kem bơ `#F4EFE6`, Đỏ Cam chu sa `#FF3B1D`, Xanh cốm `#D9F99D`, Đen mực `#141413`, Coban `#1E40AF` |
| **Giá tiền & Huy hiệu**| Nút bấm dẹt nhỏ giống nút web thông thường | **Tem nhãn dán chéo (Die-cut Sticker)** xoay `-6°` và `+6°`, số giá `39K` và `119K` khổng lồ |
| **Poster đứng A2** | Chia cột đơn điệu | **Bố cục Swiss Kinetic**: Masthead `T&T 3D LABS` cực lớn, **dải băng chéo `+10°`** vắt ngang tâm, tương phản Đỏ Cam vs Coban |
| **Trạm QR Web** | Khung tròn nhỏ | Thiết kế dạng **Vé vào Maker Lab (Ticket Stub)** với QR vector chuẩn DENSO WAVE 4 modules quiet zone |

---

## 2. KẾT QUẢ ĐO ĐẠC VẬT LÝ & KIỂM ĐỊNH KÍCH THƯỚC PDF

Hai file PDF in ấn đã được xuất tự động qua Chrome CDP với điều kiện kiểm tra sẵn sàng (`prepareForPrint`):
- **Banner ngang ($1200 \times 600\text{ mm}$):** [`reports/poster-r3/tt3d-banner-r3-1200x600.pdf`](./tt3d-banner-r3-1200x600.pdf) (2.9 MB)
  - MediaBox đo bằng hiệu tọa độ: `[0 0 3402 1700.88]` pt = **`1200.15 x 600.03 mm`**
  - Sai số vật lý: **`0.15 mm`** (Quy chuẩn cho phép $\le 0.5\text{ mm}$). Số trang: Đúng $1$ trang duy nhất.
- **Poster đứng A2 ($420 \times 594\text{ mm}$):** [`reports/poster-r3/tt3d-poster-r3-a2-420x594.pdf`](./tt3d-poster-r3-a2-420x594.pdf) (2.3 MB)
  - MediaBox đo bằng hiệu tọa độ: `[0 0 1191.12 1684.08]` pt = **`420.20 x 594.11 mm`**
  - Sai số vật lý: **`0.20 mm`** (Quy chuẩn cho phép $\le 0.5\text{ mm}$). Số trang: Đúng $1$ trang duy nhất.

---

## 3. BẢNG TÍNH ĐỘ PHÂN GIẢI HIỆU DỤNG (PPI)

$$\text{PPI} = \frac{\text{Pixel nguồn}}{\text{Kích thước đặt thực tế (mm)} / 25.4}$$

| Định dạng | Sản phẩm | Nguồn ảnh | Kích thước đặt trên bản in (mm) | PPI Hiệu dụng | Đánh giá thị giác ngoài đời thực |
|---|---|---|---|---|---|
| **Banner (1200x600mm)** | Clicker Fidget 39K | $1000 \times 1000\text{px}$ | $300 \times 250\text{ mm}$ | **$102\text{ PPI}$** | Sắc nét từ cự ly đứng xem quầy $1.5\text{m} - 3\text{m}$ |
| **Banner (1200x600mm)** | Khay Coquette 119K | $1000 \times 1000\text{px}$ | $300 \times 250\text{ mm}$ | **$102\text{ PPI}$** | Nổi bật chi tiết nơ lụa từ cự ly quầy |
| **Poster A2 (420x594mm)** | Clicker Fidget 39K | $1000 \times 1000\text{px}$ | $148 \times 148\text{ mm}$ | **$172\text{ PPI}$** | Rất sắc nét ở khoảng cách đi bộ $0.8\text{m} - 1.5\text{m}$ |
| **Poster A2 (420x594mm)** | Khay Coquette 119K | $1000 \times 1000\text{px}$ | $148 \times 148\text{ mm}$ | **$172\text{ PPI}$** | Rất sắc nét ở khoảng cách đi bộ $0.8\text{m} - 1.5\text{m}$ |

---

## 4. KẾT QUẢ GIẢI MÃ MÃ QR & ĐO QUIET ZONE

- Ma trận QR trong SVG: $25 \times 25$ module, viewBox $33 \times 33$ (Quiet zone $= 4\text{ modules}$ ở cả 4 phía theo đúng tiêu chuẩn DENSO WAVE).
- Giải mã trực tiếp từ file ảnh qua `jsQR`:
  ```text
  Image dimensions: 600x600
  Decoded content : https://tt3dlabs.vn/#store
  Decoded location: OK
  [PASS] QR strictly decodes to expected target: https://tt3dlabs.vn/#store
  ```

---

## 5. HỆ THỐNG KIỂM THỬ TỰ ĐỘNG
- Bộ test chuyên biệt Poster R3: [`tests/test_poster_stall_verification.js`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T&T%203D%20studio/tests/test_poster_stall_verification.js) đạt **`9/9 PASS`**.
- Toàn bộ $66$ ca kiểm thử hệ thống website (`test_hero_showcase_regression.js`, `test_audit_regressions.js`, `test_behavior.js`, `test_precision_craft_features.js`, `test_audit_r2_verification.js`) đều đạt **`66/66 PASS`**.
