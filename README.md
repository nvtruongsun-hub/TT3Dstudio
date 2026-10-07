# T&T 3D Studio - Smart Living & Aesthetic 3D Crafts

Website thương hiệu và cửa hàng trực tuyến hiện đại dành cho **T&T 3D Studio** (Tiên phong dòng sản phẩm in 3D công nghệ thông minh Smart NFC, Phụ kiện setup bàn làm việc & Nghệ thuật decor ánh sáng).

---

## 🌟 Tính Năng Nổi Bật

1. **Cửa Hàng Sản Phẩm Smart NFC & Decor (Theo Trend TikTok/Shopee):**
   - **Đế WiFi 1 Chạm Thông Minh (TapConnect™ Stand):** Chạm điện thoại kết nối mạng tự động không cần mật khẩu.
   - **Bình Hoa Dập Ly Origami Watertight:** Kỹ thuật ép lớp kín khít chống rò rỉ nước 100%, cắm được cả hoa tươi và cỏ lau khô.
   - **Kệ Đa Năng BedSide & Desk Organizer Pro:** Khay 5-in-1 để iPhone, sạc Apple Watch, hốc AirTag, mắt kính và bút ký.
   - **Đèn Bàn Xoắn Kem Swirl Soft-Serve:** Ánh sáng 3000K dịu êm thư giãn phong cách Crème Atelier.
   - **Bảng Treo Tường Module Hexa Pegboard:** Hệ thống module dán tường không cần khoan.
   - **Bảng Chữ Cái & Tên Monogram 3D Signature:** Khắc tên calligraphy theo yêu cầu kèm linh vật mini đáng yêu.

2. **Trình Quản Trị Trực Quan Dành Riêng Cho Chủ Xưởng (`admin.html`):**
   - **Bảo mật PIN:** Đăng nhập an toàn (mã PIN mặc định: `1234`).
   - **Sửa thông tin không cần code:** Cập nhật Hotline, số Zalo, địa chỉ xưởng, email, link Shopee & TikTok chỉ bằng các ô nhập form đơn giản.
   - **Đổi giá & Khuyến mãi sản phẩm:** Điều chỉnh giá bán, giá gốc, nhãn HOT/SALE trực tiếp.
   - **Lưu & Đồng bộ tức thì:** Dữ liệu lưu vào `localStorage`, mở `index.html` lên là tự động cập nhật ngay lập tức. Có nút **"Tải về config.js"** để lưu vĩnh viễn đưa lên GitHub.

3. **Trình Diễn 3D WebGL (Three.js Inspector):**
   - Khối mô hình 3D tương tác xoay đa chiều trên hero banner.
   - Xem 3D các mẫu thực tế: Đế WiFi NFC, Bình hoa dập ly, Đèn xoắn kem, Bảng Monogram.
   - Kéo thả file `.stl` tùy ý để phân tích kích thước 3 chiều $(X \times Y \times Z)$, thể tích $(cm^3)$ và khối lượng in.

4. **Bảng Tính Báo Giá In 3D Trực Tuyến (Print On Demand):**
   - Hỗ trợ công nghệ FDM, Resin SLA 8K, SLS Laser.
   - Tự động áp dụng chiết khấu số lượng lớn từ 10% đến 25%.
   - Kết nối gửi báo giá trực tiếp qua Zalo chỉ với 1 click.

---

## 📁 Cấu Trúc Thư Mục Dự Án

```
02. T&T 3D studio/
│
├── index.html                  # Giao diện chính của website (Dành cho khách hàng)
├── admin.html                  # Trang quản trị chỉnh sửa thông tin & giá (Dành cho chủ xưởng)
├── README.md                   # Hướng dẫn sử dụng chi tiết
│
├── css/
│   └── style.css               # Phong cách công nghệ dark tech, hiệu ứng laser, badge
│
├── js/
│   ├── config.js               # File cấu hình trung tâm (Thông tin shop, giá sản phẩm)
│   ├── app.js                  # Đồng bộ dữ liệu, lọc danh mục, modal đặt hàng, FAQ
│   ├── calculator.js           # Báo giá in 3D theo yêu cầu & tạo tin nhắn Zalo
│   └── viewer3d.js             # Dựng hình 3D Three.js và phân tích file STL
│
└── assets/
    └── images/                 # Toàn bộ hình ảnh sản phẩm chụp thực tế chuẩn studio
        ├── logo.jpg
        ├── product-nfc-wifi.jpg
        ├── product-pleated-vase.jpg
        ├── product-desk-dock.jpg
        ├── product-soft-serve-lamp.jpg
        ├── product-pegboard.jpg
        ├── product-monogram.jpg
        └── product-nfc-card.jpg
```

---

## 🛠️ Hướng Dẫn Quản Lý & Chỉnh Sửa Website

### Cách 1: Sử dụng Trang Quản Trị Trực Quan `admin.html` (Khuyên Dùng - Không Cần Biết Lập Trình)

1. Nhấp đúp chuột mở file [`admin.html`](admin.html) trên trình duyệt máy tính.
2. Nhập mã PIN bảo mật: **`1234`** $\rightarrow$ Bấm **Mở Khóa Quản Trị**.
3. **Tại Tab "Thông Tin & Liên Hệ":**
   * Sửa lại số điện thoại Hotline và số Zalo của bạn.
   * Cập nhật địa chỉ xưởng và dán link gian hàng Shopee / TikTok Shop của bạn.
4. **Tại Tab "Danh Sách Sản Phẩm & Giá":**
   * Thay đổi giá bán, sửa tiêu đề, đổi tag nhãn *"🔥 HOT"*, *"💧 Kháng Nước"*.
5. Bấm nút **"Lưu Thay Đổi"** ở góc trên cùng.
6. Mở file [`index.html`](index.html), mọi thông tin và giá bán mới sẽ **tự động cập nhật ngay lập tức**!

> **Mẹo:** Tại tab *"Xuất / Đồng Bộ Code"*, bạn có thể bấm **"Tải Về config.js"** rồi chép đè vào thư mục `js/` để lưu vĩnh viễn cấu hình này trước khi đẩy lên GitHub.

---

### Cách 2: Chỉnh Sửa Bằng Cách Mở Code Trực Tiếp

Nếu bạn muốn can thiệp sâu vào code:
* **Sửa thông tin & danh sách sản phẩm:** Mở file [`js/config.js`](js/config.js). Tại đây có đầy đủ cấu trúc tiếng Việt rõ ràng để bạn thay đổi số điện thoại, giá tiền, mô tả.
* **Thay thế hình ảnh sản phẩm:** Chép file ảnh mới của bạn vào thư mục `assets/images/` với tên tương ứng (ví dụ: `product-nfc-wifi.jpg`).
* **Sửa cấu trúc giao diện:** Mở file [`index.html`](index.html) bằng VS Code hoặc Notepad.

---
© 2026 **T&T 3D Studio** - All rights reserved.
