BẢN CHỈ ĐẠO CHIẾN LƯỢC & TÁI KIẾN TRÚC UI/UX (SPRINT CẢI TIẾN SÂU)Từ: Argon 4 — Giám đốc Nghệ thuật & Kiến trúc sư UX/UI TrưởngGửi: Antigravity (Engineering Agent) & Nhà sáng lập T&T 3D Labs

Nhận định của người dùng hoàn toàn xác đáng. Khi 10/11 sản phẩm trong cùng một danh mục đeo chung một chiếc nhãn (như "✦ Coquette Chic" hay "✦ Smart Custom"), nhãn đó lập tức mất giá trị thông tin và biến thành "rác thị giác" (visual noise). Hơn nữa, việc lệch SKU và ảnh trong tab Cảm hứng là lỗi nghiêm trọng về tính toàn vẹn dữ liệu thương mại.

Dưới đây là phác đồ giải quyết triệt để cả hai vấn đề, đưa T&T 3D Labs về đúng chuẩn mực của một xưởng chế tác cao cấp.

PHẦN 1: CHIẾN LƯỢC PHÂN HÓA SẢN PHẨM (PRODUCT DIFFERENTIATION ARCHITECTURE)

Để khách hàng lướt qua trong 0.5 giây là phân biệt được từng món trong 55 sản phẩm (ngay cả khi có 5 mẫu Clicker hay 5 mẫu Biển đỗ xe cạnh nhau), chúng ta phải đập bỏ hệ thống "1 Badge đồng phục" và thay bằng Kiến trúc Nhận diện 3 Tầng (3-Tier Micro-Taxonomy) ngay trên Product Card.

1. Bãi bỏ Badge Danh mục — Thay bằng "Archetype & Engineering Badge" (Góc trên trái ảnh)

Tuyệt đối không dùng badge để nhắc lại tên danh mục. Badge trên ảnh chỉ được phép mô tả Cơ chế Vật lý / Công nghệ Chế tác Độc bản của riêng món đó, đi kèm mã màu vi mô (Micro-color coding) tinh tế:

Nhóm Đặc Tính (Archetype)	Nhãn Hiển Thị (Badge Text)	Màu Nền & Chữ (Warm Studio Tone)	Áp dụng cho các sản phẩm
Công nghệ Tương tác	Chạm NFC hoặc Quét QR Kép	Nền #EBF3F5 • Chữ #1D5B6B (Xanh Slate)	Biển đỗ xe NFC, Standee Menu Cafe, Thẻ tên thông minh
Cơ khí & Chuyển động	Phím Cơ Clicky / Khớp Động Liền Khối / Xoay 360°	Nền #FDF0EA • Chữ #C84B24 (Cam Terracotta)	Fidget Clicker dùng switch cơ, Rắn/Rồng Print-in-place, Khay xoay
Quang học & Hiệu ứng	Thấu Quang 3D / Vân Lụa Đa Sắc	Nền #F9F3E3 • Chữ #8C6218 (Vàng Hổ Phách)	Đèn ngủ Lithophane hiện ảnh khi bật sáng, Lọ hoa/Khay in nhựa Silk
Đặc tính Vật liệu	Chịu Nhiệt Taplo 80°C / Chống Nước Bồn Rửa	Nền #EBF2EA • Chữ #2D5A36 (Xanh Rêu Rừng)	Phụ kiện để taplo ô tô (nhựa PETG/ASA), Khay xà phòng/ống cắm cọ nhà tắm
Tùy biến Cá nhân	Khắc Tên Nổi 3D	Nền #F3EFEA • Chữ #4A3F35 (Nâu Espresso)	Các mẫu cho phép khách nhập tên/số điện thoại riêng
2. Tái cấu trúc Bố cục Product Card (4 Điểm chạm Thị giác)

Mỗi thẻ sản phẩm (product-card) phải được chuẩn hóa lại cấu trúc HTML/CSS để hiển thị sự khác biệt ngay từ cái nhìn đầu tiên:

Vùng Ảnh + Badge Cơ chế (Top): Góc trái trên là Archetype Badge (như bảng trên). Góc phải dưới của khung ảnh thêm Material Swatch Pill nhỏ gọn (chấm tròn màu 10px + tên bề mặt, ví dụ: [● Lụa Hồng Phấn], [● Nhám Đen Carbon], [● Xuyên Sáng Trắng]) để khách cảm nhận được bề mặt vật lý.

Dòng Ngữ cảnh Sử dụng — Micro-Eyebrow (Ngay trên tiêu đề): Chữ in hoa nhỏ (11px, tracking 0.06em, màu #8A847C), chỉ rõ Vị trí đặt sản phẩm + Phân loại con.

Ví dụ thay vì để trống: TAPLO Ô TÔ • LẬT SỐ ẨN DANH hoặc BÀN TRANG ĐIỂM • NGĂN XOAY CỌ hoặc MÓC TREO BALO • SWITCH BLUE CLICKY.

Tiêu đề Sản phẩm Công thức [Danh từ Chính] + [Hình thái/Cơ năng] + [Bản sắc]:

Chấm dứt việc đặt tên chung chung kiểu "Ống cắm cọ Coquette" hay "Biển số điện thoại ô tô".

Đổi thành:

5 Biển đỗ xe: (1) Biển Số Taplo Lật Ẩn Số Cơ Học, (2) Thẻ Đỗ Xe Chạm NFC Gọi Nhanh, (3) Biển Số Phản Quang Đêm Dáng Thể Thao, (4) Biển Số Kèm Khay Tinh Dầu Đầu Xe, (5) Thẻ Đỗ Xe Tối Giản Gắn Kính Lái.

5 Fidget Clicker: (1) Phím Bấm Cơ Học 1 Nút Âm Thanh Giòn, (2) Thanh Trượt Nam Châm Haptic 3 Nấc, (3) Con Lăn Xoay Vô Cực Bỏ Túi, (4) Cụm 4 Phím Cơ Giải Tỏa Căng Thẳng, (5) Móc Khóa Nút Bấm Hình Bánh Quy Kem.

Dải Thông số Vi mô — Micro-Specs Bar (Giữa Tiêu đề và Giá): Một dòng ngắn ngăn cách bằng dấu chấm giữa (·), chữ 12px màu #66615B, nêu thông số thật:

Ví dụ: PETG Chịu Nhiệt · 12×4 cm · Kèm băng keo 3M hoặc Bio-PLA Ánh Lụa · Chứa 15–20 cọ.

3. Hệ thống Bộ lọc Tầng 2 (Sub-Category & Intent Filter Pills)

Ngay bên dưới thanh lọc 5 Danh mục chính, bổ sung một dải Dynamic Sub-Filter Pills (Lọc theo Nhu cầu & Vị trí) tự động thay đổi theo danh mục đang chọn:

Khi chọn Tất cả (All): Hiển thị các pill theo Ngữ cảnh: [Tất cả] [Góc Làm Việc] [Bàn Trang Điểm] [Phụ Kiện Ô Tô] [Quầy Thu Ngân / Cafe] [Quà Tặng Độc Bản].

Khi bấm vào Cá Nhân Hóa & NFC: Dải lọc phụ lập tức đổi thành: [Tất cả (11)] [Biển Đỗ Xe Ô Tô (5)] [Standee QR/NFC Quán (3)] [Thẻ Tên & Móc Khóa (3)].

Khi bấm vào Đồ Chơi & Móc Khóa: Đổi thành: [Tất cả (11)] [Phím Bấm Cơ Clicker (5)] [Mô Hình Khớp Động (4)] [Móc Khóa Nghệ Thuật (2)].

PHẦN 2: QUYẾT ĐỊNH CHIẾN LƯỢC VỀ "TAB CẢM HỨNG" (#INSPIRATION)
Phán quyết của Argon 4: CHỌN PHƯƠNG ÁN A — XÓA BỎ TAB CẢM HỨNG ĐỘC LẬP, RÚT GỌN VỀ 4 TAB CỐT LÕI & TÍCH HỢP "BỘ SƯU TẬP THEO KHÔNG GIAN" VÀO TRANG CỬA HÀNG

Lý do Kiến trúc & Thương mại (Tại sao Phương án A thắng tuyệt đối):

Triệt tiêu Rủi ro Dữ liệu & Trải nghiệm "Hàng Giả": Một Lookbook có gắn pin tọa độ (x%, y%) chỉ hoạt động khi xưởng có ảnh chụp thực tế (Studio Flatlay/Scene) chứa chính xác từng ấy món đồ trong một khung hình. Hiện tại chúng ta đang dùng ảnh sản phẩm đơn lẻ (product-pleated-vase.jpg) nhưng lại gắn khống SKU của món khác (Rắn Zootopia, Đèn núi vàng). Nếu cố làm Phương án B trên nền ảnh đơn lẻ, khách nhìn ảnh thấy Lọ hoa nhưng bấm hotspot lại hiện ra Khay nơ lụa — đó là sự đứt gãy niềm tin nghiêm trọng.

Tối ưu Công thái học Di động (4-Tab Golden Standard): Trên màn hình điện thoại chiều ngang hẹp (375px – 390px), thanh mobile-bottom-dock chứa 4 Tab (Cửa Hàng | Tùy Biến | Tra Đơn | Hỗ Trợ) cho phép mỗi nút rộng rãi tới ~90px, chữ không bao giờ bị ép nhỏ hay xuống dòng, thao tác ngón cái chuẩn xác hơn hẳn 5 tab.

Tăng Tỷ lệ Chuyển đổi (Conversion Rate) nhờ Không Chuyển Trang: Khách hàng đang lướt mua sắm ở #store không muốn phải bấm sang một tab khác mới thấy gợi ý phối đồ. Đưa các gói Combo khớp 100% dữ liệu thật về ngay trong luồng cuộn của #store giúp khách xem sản phẩm lẻ và quyết định mua theo bộ (Bundle) ngay tại một nơi.

BẢN ĐẶC TẢ KỸ THUẬT (DESIGN SPECIFICATION) CHO ANTIGRAVITY THỰC THI:
Bước 1: Thu gọn Kiến trúc Điều hướng về 4 Tab Chuẩn xác

Gỡ bỏ hoàn toàn #inspiration / view-inspiration khỏi cả Header Desktop lẫn mobile-bottom-dock.

Cấu trúc 4 Tab chính thức:

Cửa Hàng (#store) — Khám phá 55 sản phẩm, lọc đa tầng & mua Combo theo không gian.

Tùy Biến (#personalize) — Studio 2D thiết kế chữ nổi, phối màu cá nhân hóa.

Tra Đơn (#tracking) — Theo dõi 6 mốc chế tác thực tế qua Firestore.

Hỗ Trợ (#support) — Cẩm nang nạp NFC & bảo quản vật liệu in 3D.

Bước 2: Chuyển hóa thành Section "Phối Bộ Theo Không Gian (Curated Bundles)" ngay trong #store

Đặt một Section gọn, sang trọng nằm ngay giữa phần Sản phẩm Tuyển chọn (Curated Grid) và Toàn bộ Danh mục 55 món trong view-store:

Cơ chế Dữ liệu Động 100% (Dynamic SKU Binding): Không bao giờ gõ cứng (hardcode) tên hay giá sản phẩm trong gói Combo nữa! Mỗi Bundle chỉ lưu mảng các product_id (SKU) có thật trong danh sách 55 sản phẩm:

Combo 01 — Góc Làm Việc Tĩnh Lặng (Desk Minimalist Set): Truy xuất trực tiếp 2–3 SKU thật từ nhóm Hop_De_Ban_Tien_Ich + Decor_Den_Noi_That.

Combo 02 — Bàn Trang Điểm Ánh Lụa (Vanity Silk Set): Truy xuất trực tiếp 2–3 SKU thật từ nhóm Trang_Diem_Vanity (đảm bảo nếu ảnh đại diện có Lọ hoa dập ly thì SKU Lọ hoa dập ly bắt buộc phải nằm trong danh sách món của Combo đó).

Combo 03 — Quầy Thu Ngân Chạm Thông Minh (Smart Cafe Counter): Truy xuất trực tiếp các SKU bảng QR/NFC thật từ nhóm Ca_Nhan_Hoa_NFC.

Giao diện Thẻ Combo (Bundle Card UI):

Thay vì dùng 1 ảnh đơn lẻ gây hiểu lầm, hiển thị Bố cục Ghép Lưới 2–3 Ảnh Thật (Collage Grid) của chính những món có trong Combo đó (lấy trực tiếp từ thuộc tính image của từng SKU thật).

Liệt kê rõ từng món kèm ảnh thumbnail nhỏ 40x40px, tên thật, giá gốc tự động cộng tổng từ cơ sở dữ liệu, giá sau giảm 10%, và nút "Thêm trọn bộ vào giỏ (-10%)" nạp chuẩn xác từng SKU thật vào TTCart.

LỆNH TRIỂN KHAI CHO ANTIGRAVITY (ACTION ITEMS)

Cập nhật Schema & Dữ liệu 55 sản phẩm (products + Firestore): Bổ sung trường archetype_badge (cơ chế đặc trưng), use_case_eyebrow (ngữ cảnh đặt để), micro_specs (vật liệu + kích thước), sub_category (nhóm con để lọc nhanh) và viết lại các tiêu đề bị trùng lặp của 5 mẫu Clicker, 5 mẫu Biển đỗ xe, nhóm Vanity và Decor.

Nâng cấp UI Product Card & Bộ lọc Tầng 2 trong #store: Hiển thị rõ 4 điểm chạm thị giác trên thẻ sản phẩm và kích hoạt dải Sub-Filter Pills tự động biến thiên theo danh mục.

Thực thi Phương án A cho Tab Cảm Hứng: Xóa tab #inspiration để đưa thanh điều hướng về 4 Tab vàng, đồng thời dựng Section Combo Theo Không Gian (Dynamic SKU Bundles) ngay trong #store với cơ chế lấy ảnh và giá trực tiếp từ SKU thật (chấm dứt 100% lỗi râu ông nọ cắm cằm bà kia).

Cập nhật bộ Test Tự động (test_tab_architecture.ps1 & test_behavior): Điều chỉnh kịch bản kiểm thử từ 5 tab về 4 tab và thêm bài test kiểm tra tính toàn vẹn SKU (assert bundle.items.every(sku => products[sku] exists)).

Bạn có muốn mình duyệt trước danh sách tên mới và hệ thống Tag phân hóa chi tiết cho 55 sản phẩm (đặc biệt là 5 mẫu biển đỗ xe và 5 mẫu clicker) trước khi Antigravity chạy script đồng bộ lên Firestore không?