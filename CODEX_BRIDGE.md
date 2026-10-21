# CODEX BRIDGE PROTOCOL

## [1. DE_XUAT_TU_ANTIGRAVITY]

### Bối cảnh & Yêu cầu Mới từ Người Dùng:
- Người dùng cung cấp tệp dữ liệu gồm **55 sản phẩm in 3D xu thế tuyển chọn gắt gao từ MakerWorld China** (có đầy đủ Model ID, tên Việt hóa, thông số kỹ thuật, trọng lượng nhựa, thời gian in, giá bán đề xuất, kịch bản video, file thumbnail `thumb_{id}.png`).
- 55 sản phẩm được phân chia thành **5 danh mục chính**:
  1. `Trang_Diem_Vanity`: HỘP ĐỰNG ĐỒ TRANG ĐIỂM, CỌ MỸ PHẨM & TRANG SỨC (11 sản phẩm)
  2. `Decor_Den_Noi_That`: ĐÈN NGỦ NGHỆ THUẬT, BÌNH HOA ĐÁNH LỪA THỊ GIÁC & TƯỢNG DECOR (11 sản phẩm)
  3. `Do_Choi_Moc_Khoa`: ĐỒ CHƠI KHỚP ĐỘNG, MÓC KHÓA HOẠT HÌNH & FIDGET XẢ STRESS (11 sản phẩm)
  4. `Hop_De_Ban_Tien_Ich`: HỘP ĐỂ BÀN THÔNG MINH, CƠ CẤU BÁNH RĂNG & TIỆN ÍCH ĐA NĂNG (11 sản phẩm)
  5. `Ca_Nhan_Hoa_NFC`: SẢN PHẨM CÁ NHÂN HÓA, MÃ QR & MÓC KHÓA THÔNG MINH NFC (11 sản phẩm)

- **Yêu cầu kiến trúc & giao diện cụ thể:**
  1. **Cấu trúc tổng quan danh mục (Category Hub / Overview Architecture):**
     - Trang Store được tổ chức lại theo 5 danh mục trực quan.
     - **Mỗi danh mục chính sẽ có 1 Sản Phẩm Đặc Biệt (Hero / Spotlight Item)** được làm nổi bật với diện tích trưng bày lớn, visual sang trọng, thông số ấn tượng và nút CTA tương tác nhanh.
     - Các sản phẩm còn lại trong danh mục được sắp xếp theo lưới sản phẩm tinh xảo (Tactile Product Grid).
  2. **Tương tác lọc danh mục thông minh (Category Filter & Detail View):**
     - Khi người dùng click chọn vào 1 danh mục (hoặc bấm "Xem tất cả"), giao diện tự động lọc mượt mà, chuyển cảnh êm ái sang xem toàn bộ 11 sản phẩm của danh mục đó (đồng bộ hash route `#store?cat=...` hoặc tab filter).
     - Cho phép chuyển đổi nhanh giữa các danh mục ("Tất cả", 5 danh mục) với micro-interactions sắc sảo.
  3. **Hệ thống Automation mượt mà, chuyên nghiệp & bắt mắt:**
     - Tự động nạp toàn bộ 55 sản phẩm vào `products.json` với schema chuẩn, liên kết đúng file thumbnail thực tế từ `assets/images/products/thumb_{id}.png`.
     - Tự động sao chép các file thumbnail gốc từ thư mục lưu trữ cục bộ (`..\01. khoi nghiep in 3d\anh_mau_3d_xu_the\`) vào assets web.
     - Nâng cấp `catalog-store.js` lên phiên bản `v4.0` để tự động migration 55 sản phẩm vào `localStorage` mà không làm mất ảnh upload của Admin.
     - Giữ vững toàn bộ hợp đồng kỹ thuật đã được nghiệm thu: Modal chi tiết 2 cột trong trẻo, 2 nút hành động (Thêm Vào Giỏ & Đặt Hàng Ngay), luồng Direct Checkout Zalo/COD, bảo vệ XSS và tính toán phí vận chuyển tự động.

### Hiện trạng Mã nguồn & Dữ liệu Cục bộ:
1. Đã tìm thấy thư mục ảnh thumbnail gốc chứa đầy đủ 82 ảnh mẫu (`thumb_*.png`) tại:
   `C:\Users\truongg\OneDrive - Thuyloi University\Tài liệu\01. khoi nghiep in 3d\anh_mau_3d_xu_the`
2. `products.json`: Hiện chỉ có 6 sản phẩm mẫu cũ. Cần mở rộng lên 55 sản phẩm chuẩn hóa với đầy đủ metadata: `modelId`, `author`, `makerworldUrl`, `downloads`, `likes`, `specs`, `materials`, `colors`, `isHero`.
3. `index.html`: Cần bổ sung section Category Spotlight Showcase (Hero per Category) và thanh điều hướng danh mục dạng Pills mượt mà.
4. `js/products-manager.js`: Cập nhật logic render để hỗ trợ hiển thị Hero Card riêng biệt cho từng danh mục + Grid sản phẩm thông minh + bộ lọc category 5 phân khúc.

### Kế hoạch Triển khai Chi tiết (P1 – P4):
- **P1. Chuyển đổi dữ liệu & Assets (Data & Media Pipeline):**
  - Sao chép toàn bộ các file `thumb_{modelId}.png` tương ứng của 55 sản phẩm vào `assets/images/products/`.
  - Viết script Python tự động parse CSV 55 sản phẩm sang `products.json` chuẩn schema: gán đúng category, xác định 1 Hero Item nổi bật nhất cho mỗi category (dựa trên điểm tuyển chọn 100/100 và lượt tải/lượt in cao nhất), cấu hình màu sắc/vật liệu phù hợp với mô tả sản phẩm.
- **P2. Tối ưu Giao diện Category Hub & Hero Showcase (`index.html`, `css/style.css`):**
  - Thiết kế section **"Bản Đồ Danh Mục & Sản Phẩm Tiêu Biểu" (Category Spotlight Showcase)**: Mỗi danh mục có 1 khối Hero lớn ấn tượng (ảnh lớn, badge 100 điểm, lượt in thực tế, nút Đặt Hàng Hỏa Tốc & nút "Xem tất cả 11 mẫu").
  - Thanh Tab Filter 5 Danh Mục với hiệu ứng kính mờ (Frosted Pill Navigation), active indicator chuyển động mượt mà.
  - Lưới sản phẩm (Grid) hiển thị đầy đủ thẻ sản phẩm với ảnh thật, badge trending, giá bán và quick action.
- **P3. Cập nhật Store Engine & Sync (`js/catalog-store.js`, `js/products-manager.js`):**
  - Bổ sung hàm lọc category, chọn Hero item, tìm kiếm sản phẩm.
  - Tự động migration catalog lên `v4.0` đảm bảo nạp đầy đủ 55 sản phẩm mới mà không bị dính cache cũ.
- **P4. Kiểm thử Hồi quy & Bàn giao:**
  - Chạy lại toàn bộ `tests/test_behavior.js`, `test_e2e_simulation.ps1`, `test_tab_architecture.ps1`.
  - Kiểm tra cú pháp JS (`node -c`) và hiển thị thực tế trên trình duyệt.

Xin kính trình Tổng Chỉ Huy Kiến Trúc GPT-6.1-Sol (Codex Master Controller) xem xét và ban hành Chỉ Thị Kỹ Thuật!


---

## [2. CHI_THI_PHE_DUYET_TU_CODEX]

> **Thời gian ban hành:** 2026-10-21 10:19:45
> **Mô hình ban hành:** GPT-6.1-Sol (Reasoning Effort: High)

🎯 **[Auto-Router]** `Nhóm Task`: 3 — Web, kết hợp 7 — Kiến trúc & tự động hóa | `Skills`: các skill Web ánh xạ chưa có trong môi trường | `MCP/Engines`: PowerShell, Node.js, Python.

**BẢN CHỈ THỊ PHÊ DUYỆT KIẾN TRÚC & MÃ NGUỒN CHI TIẾT**

**Quyết định: PHÊ DUYỆT TRIỂN KHAI P1–P4 theo các điều chỉnh bắt buộc dưới đây.** Antigravity được thực hiện ngay trong repository; đây là phê duyệt phương án triển khai, chưa phải nghiệm thu thay đổi hay cho phép triển khai lên production.

**1. Những sự thật đã được kiểm chứng**

- `products.json` hiện có 6 sản phẩm mẫu.
- `js/catalog-store.js` đã khai báo `CURRENT_SCHEMA_VERSION = 4`. Chỉ đổi nhãn thành “v4.0” sẽ không giải quyết migration.
- Migration hiện tại chỉ làm giàu sản phẩm đã lưu, chưa thêm các sản phẩm mới từ catalog nền.
- `sanitizeProduct()` chưa giữ các trường như `modelId`, `author`, `makerworldUrl`, `downloads`, `likes`, `prints`, `isHero`.
- Router trong `js/app.js` đang đối chiếu toàn bộ hash, chưa hiểu `#store?cat=...`.
- Card và một số vùng trong modal đang chèn dữ liệu trực tiếp vào HTML và inline handler. Không được coi bảo vệ XSS hiện tại là đã bao phủ renderer.
- Viewer đang tìm sản phẩm bằng `modelKey`, có nhánh dự phòng lấy sản phẩm đầu tiên. Điều này có thể chọn sai sản phẩm khi mở rộng catalog.

Nguồn dữ liệu phù hợp đã tìm thấy:

```text
..\01. khoi nghiep in 3d\makerworld_multisheet_data.json
```

Nguồn này có **55 Model ID duy nhất, 5 nhóm × 11 mẫu**. Cả 55 đều có file ảnh tương ứng trong thư mục thumbnail đã nêu. File `makerworld_catalog_data.json` chỉ có 30 mẫu, không dùng làm nguồn cho đợt nhập này.

Kiểm thử nền đã chạy: **10/10 ca hành vi đạt**, **26/26 kiểm tra cấu trúc đạt**, bộ mô phỏng luồng đạt; kiểm tra cú pháp hai file catalog và renderer đạt. Chưa kiểm tra giao diện thực tế trên trình duyệt.

**2. Phạm vi kiến trúc được duyệt**

Giữ kiến trúc HTML/CSS/JavaScript đang phục vụ `index.html`. Không chuyển sang Next.js hoặc đưa framework mới vào đợt này.

Phân trách nhiệm rõ ràng:

| Thành phần | Trách nhiệm |
|---|---|
| Script nhập dữ liệu | Chuẩn hóa nguồn, kiểm tra ảnh, sinh catalog và manifest |
| `catalog-store.js` | Validation, lưu trữ, migration, CRUD, đồng bộ |
| `products-manager.js` | Hero, grid, tìm kiếm, modal và thao tác sản phẩm |
| `app.js` | Workspace, hash route và lịch sử điều hướng |
| `checkout.js` | Một nguồn tính tiền và phí vận chuyển |
| `viewer3d.js` | Hiển thị mô hình phù hợp và giữ đúng Product ID |

Không để renderer tự ghi `localStorage`, hoặc tạo thêm bộ tính phí vận chuyển trong card/Hero.

Luồng được duyệt:

```text
Nguồn JSON + thumbnail
        ↓
Importer → validation → products.json + manifest
        ↓
CatalogStore → migration bảo toàn dữ liệu Admin
        ↓
Route/state → Hero + grid + modal
        ↓
Cart hoặc Direct Checkout hiện có
```

**3. P1 — Dữ liệu, định danh và thumbnail**

Tạo script, ví dụ:

```text
scripts/import_makerworld_catalog.py
```

Script nhận đường dẫn nguồn và thư mục ảnh qua tham số; không hardcode đường dẫn máy cá nhân vào mã chạy trên trình duyệt.

Giữ nguyên năm category ID:

```js
const CATEGORY_IDS = [
  'Trang_Diem_Vanity',
  'Decor_Den_Noi_That',
  'Do_Choi_Moc_Khoa',
  'Hop_De_Ban_Tien_Ich',
  'Ca_Nhan_Hoa_NFC'
];
```

Tạo registry dùng chung cho Store và Admin, chứa `id`, nhãn ngắn, tiêu đề và màu nhấn. Không sao chép các danh sách khác nhau vào nhiều file.

**Định danh sản phẩm mới:**

```js
id: `mw-cn-${String(source.id)}`
modelId: String(source.id)
```

Không sử dụng số thứ tự dòng làm ID. Không gán lại `prod-1`…`prod-6` cho những mẫu mới có tên gần giống.

Hợp đồng ánh xạ dữ liệu:

| Trường đích | Nguồn/quy tắc |
|---|---|
| `title` | `title_vi` |
| `originalTitle` | `title_orig` |
| `category` | Key nhóm |
| `price` | `price_vnd`, số nguyên VND |
| `author` | `designer` |
| `makerworldUrl` | `url` |
| `downloads`, `likes`, `prints` | Giữ riêng, số nguyên không âm |
| `weightGrams` | `weight_g` |
| `printTimeSeconds` | `time_sec` |
| `materialRecommendation` | `material_rec` |
| `headlineBenefit` | `use_case` |
| `desc` | `selection_reason` |
| `videoScript` | `viral_idea` |
| `productionNotes` | `action` |
| `image` | `assets/images/products/thumb_{modelId}.png` |
| `imageSource` | `preset` |
| `imageAlt` | Tên Việt hóa |
| `licenseName` | `license_name` |
| `commercialStatus` | `commercial_status`, giữ nguyên |
| `isHero` | Kết quả chọn Hero |
| `modelKey` | `null` nếu chưa có mô hình phù hợp |

Giữ các trường tương thích hiện có: `type`, `originalPrice`, `badge`, `specs`, `colors`, `materials`, `status`, `updatedAt`.

Các quyết định bắt buộc:

- `specs.weight` và thời gian hiển thị phải được suy ra từ số liệu gốc.
- Thiếu kích thước, độ dày lớp in hoặc bảo hành thì để thiếu; không tự tạo thông số.
- Không suy diễn mọi sản phẩm trong nhóm NFC đều có chip NFC.
- Tách vật liệu/màu **được đề xuất** khỏi biến thể **xưởng thực sự cung cấp**. Các biến thể bán cần cấu hình rõ trong file override theo `modelId`.
- Không tự đặt phụ phí vật liệu hoặc giá gạch ngang.
- Lưu metadata chi phí nguồn trong đối tượng riêng nếu cần; không nhầm thành phụ phí khách phải trả.

Nguồn thực tế có 50 mẫu `Chua_ro`, 4 mẫu `Can_mua_giay_phep`, 1 mẫu `Da_xac_minh`. Bảo toàn những trạng thái này trong dữ liệu và Admin; không tự đổi thành đã xác minh quyền thương mại.

Importer phải hỗ trợ `--dry-run`, kiểm tra:

1. Đúng 55 bản ghi, 55 ID duy nhất.
2. Mỗi category đúng 11 bản ghi.
3. Giá và số liệu hợp lệ.
4. Đủ 55 thumbnail, file đọc được.
5. Đường dẫn đích nằm trong `assets/images/products/`.
6. Không có lỗi trước khi ghi catalog chính.

Chỉ sao chép **55 ảnh tương ứng**, không sao chép toàn bộ 82 ảnh. Không xóa hoặc di chuyển thư mục nguồn.

Sinh manifest chứa revision catalog, danh sách ID, kết quả kiểm tra và hash ảnh. Chạy lại với cùng đầu vào phải cho cùng kết quả; không dùng thời gian chạy để làm thay đổi toàn bộ `updatedAt`.

**4. Quy tắc chọn Hero và giao diện Category Hub**

Điểm tuyển chọn được tính từ ba tiêu chí nguồn, mỗi tiêu chí tối đa 5:

```js
selectionScore =
  100 * (aestheticScore + uniquenessScore + feasibilityScore) / 15;
```

Giữ giá trị chính xác trong dữ liệu; làm tròn khi hiển thị. “100 điểm” phải được diễn đạt là **điểm tuyển chọn nội bộ**, không phải đánh giá của người mua.

Chọn Hero theo thứ tự:

```text
Điểm tuyển chọn giảm dần
→ prints giảm dần
→ downloads giảm dần
→ likes giảm dần
→ modelId tăng dần
```

Theo dữ liệu hiện tại, kết quả chuẩn là:

| Danh mục | Hero Model ID |
|---|---:|
| `Trang_Diem_Vanity` | `1646129` |
| `Decor_Den_Noi_That` | `1438306` |
| `Do_Choi_Moc_Khoa` | `1702306` |
| `Hop_De_Ban_Tien_Ich` | `1971424` |
| `Ca_Nhan_Hoa_NFC` | `1836100` |

Không gắn cùng một badge “100 điểm” cho cả 55 mẫu. Không đổi nhãn lượt tải thành lượt in.

**Chế độ Tất cả:**

- Hiển thị 5 khối danh mục.
- Mỗi khối gồm tiêu đề, 1 Hero lớn, lưới 10 mẫu còn lại và “Xem tất cả”.
- Hero được tính trong tổng 11 mẫu; không render thêm bản sao trong lưới cùng khối.

**Chế độ một danh mục:**

- Hiển thị Hero và lưới 10 mẫu còn lại.
- Tổng cộng đúng 11 Product ID duy nhất trên catalog mặc định.
- Có nút quay lại “Tất cả” và chuyển nhanh giữa các nhóm.

Số lượng trên giao diện phải tính từ catalog active thực tế. Khi Admin ẩn hoặc thêm sản phẩm, không tiếp tục hardcode “11 mẫu”.

CTA Hero dùng **“Đặt hàng ngay”**, mở modal cấu hình sản phẩm hiện có. Chưa có quy trình giao hỏa tốc thì không dùng lời hứa “Đặt hàng hỏa tốc”.

Thiết kế dùng token màu, typography và khoảng cách đang có. Áp dụng:

- Hai cột cho Hero trên desktop, một cột trên mobile.
- Pills cuộn ngang trên màn hình hẹp.
- Chuyển cảnh bằng opacity/transform khoảng 160–220 ms.
- Tôn trọng `prefers-reduced-motion`.
- Không trì hoãn phản hồi bấm nút để chờ animation.
- Có loading, empty và error state riêng.
- Nút có focus rõ, thao tác bàn phím và trạng thái `aria-pressed`.

Tìm kiếm phải kết hợp category, hỗ trợ tiếng Việt không dấu, tìm theo tên và Model ID. Khi có từ khóa, ưu tiên danh sách kết quả và số lượng phù hợp; không giữ các Hero không khớp.

**5. P3 — Migration bảo toàn dữ liệu Admin**

Tách rõ ba khái niệm:

```text
Phiên bản phát hành giao diện: v4.0
Phiên bản cấu trúc dữ liệu: schemaVersion
Phiên bản bộ sản phẩm nền: catalogRevision
```

Đợt thay đổi cấu trúc này dùng `schemaVersion = 5`; migration bộ 55 mẫu phải dựa vào một `catalogRevision` riêng. Không kiểm tra mỗi `tt_schema_version === "4"` rồi bỏ qua.

Giữ `tt_products` là mảng để tương thích. Thêm metadata lưu revision và tombstone bằng key riêng, ví dụ `tt_catalog_meta`.

Thuật toán phải là hàm thuần, có thể kiểm thử độc lập:

```js
buildMigration({
  storedProducts,
  previousDefaults,
  incomingDefaults,
  metadata
});
// → { products, metadata, changed, report }
```

Quy tắc merge:

1. **Storage chưa tồn tại:** nạp đủ 55 mẫu mặc định.
2. **Storage là `[]`:** giữ catalog rỗng theo hợp đồng hiện có; không tự phục hồi.
3. **JSON hỏng hoặc sai kiểu:** giữ nguyên dữ liệu thô, báo trạng thái cần khôi phục; không ghi đè bằng `[]`.
4. **Có dữ liệu cũ:** giữ sản phẩm Admin, bổ sung seed mới chưa tồn tại và chưa bị tombstone.
5. **Trùng ID:** bảo toàn dữ liệu tùy chỉnh; chỉ bổ sung trường thực sự thiếu.
6. **Cùng revision đã migration:** không tự nhập lại các seed bị Admin xóa.
7. **Chạy lần hai:** không trùng sản phẩm, không ghi storage nếu dữ liệu không đổi.

Phải merge trên **bản ghi thô trước khi sanitize**. Nếu sanitize trước, giá trị mặc định như ảnh, category hoặc mảng rỗng có thể che mất trạng thái “chưa được cung cấp”.

Bảo toàn toàn bộ cụm ảnh:

```text
image + imageSource + presetId + imageAlt
```

Ảnh dạng `data:image/...` cũ vẫn được bảo toàn, kể cả khi bản ghi chưa có `imageSource: "upload"`.

Giữ giá, tiêu đề, trạng thái, thông số riêng, màu và vật liệu Admin đã sửa. Nếu không xác định được một giá trị là mặc định hay chỉnh tay, ưu tiên giữ dữ liệu đã lưu.

Sáu sản phẩm cũ không được tự động ghép với mẫu MakerWorld mới. Lưu baseline cũ thành fixture để làm giàu dữ liệu legacy và kiểm thử. Nếu cần hiển thị chúng, dùng nhóm “Bộ sưu tập đã lưu”; không ép vào năm nhóm mới bằng suy đoán.

**Tiêu chí 55 sản phẩm áp dụng cho catalog mặc định sạch.** Trình duyệt có sản phẩm tùy chỉnh có thể chứa nhiều hơn 55 bản ghi; không xóa dữ liệu để đạt một con số kiểm thử.

Về ghi storage:

- Ghi danh sách thành công trước khi đánh dấu migration hoàn tất.
- Ghi marker thất bại thì không báo migration đã hoàn tất.
- Retry phải idempotent; không gọi hai lần `setItem()` là một giao dịch nguyên tử.
- Khi quota đầy, giữ catalog cũ và thông báo rõ.
- Không nhân đôi toàn bộ ảnh base64 vào nhiều key backup.
- Đồng bộ tab qua `storage`, không ghi ngược gây vòng lặp.
- Khi phát hiện catalog thay đổi ở tab khác trong lúc chỉnh sửa, không âm thầm ghi đè bản mới hơn.

Mở rộng sanitizer và validation cho toàn bộ metadata đã duyệt. Các API hiện có của `TTCatalogStore` và event `tt_products_updated` phải tiếp tục hoạt động.

Cập nhật cả `admin.html` và `js/admin.js`: dropdown category, bộ lọc, bảo toàn metadata khi sửa một trường, import/export và tombstone khi xóa seed.

**6. Router — một nơi sở hữu lịch sử điều hướng**

`app.js` chịu trách nhiệm đọc/ghi hash. `products-manager.js` nhận state để render.

Hợp đồng URL:

```text
#store
#store?cat=Trang_Diem_Vanity
#store?cat=Decor_Den_Noi_That
```

Tách phần route và query trước khi tra bảng:

```js
function parseStoreHash(hash, allowedCategories) {
  const raw = String(hash || '#store').replace(/^#/, '');
  const separator = raw.indexOf('?');

  const path = (
    separator < 0 ? raw : raw.slice(0, separator)
  ).toLowerCase();

  const query = separator < 0 ? '' : raw.slice(separator + 1);
  const params = new URLSearchParams(query);
  const requested = params.get('cat');

  return {
    path,
    category: allowedCategories.has(requested) ? requested : 'all'
  };
}
```

Không lowercase toàn bộ hash vì category ID đang có chữ hoa.

Yêu cầu triển khai:

- Click pill hoặc “Xem tất cả” tạo tối đa một history entry.
- `pushState()` không tự phát `hashchange`; router phải áp dụng state ngay sau khi ghi URL.
- Reload, Back và Forward khôi phục đúng danh mục.
- Init bất đồng bộ không được render `'all'` đè lên danh mục trong URL.
- Early return khi đang ở Store không được ngăn cập nhật category.
- Giữ các alias route và bốn workspace hiện có.
- Bỏ listener filter cũ hoặc nối vào dispatcher mới; không để hai listener cùng xử lý.

Giữ hàm `renderStoreProducts(filter)` làm wrapper tương thích nếu các nơi khác đang gọi.

**7. Modal, checkout, XSS và viewer**

Giữ modal hai cột và hai hành động:

```js
TTCart.addToCart(configuredLine);

TTCheckout.openCheckout(
  [configuredLine],
  0,
  { source: 'direct' }
);
```

Direct Checkout không thêm sản phẩm vào giỏ. Màu, vật liệu, số lượng và nội dung cá nhân hóa phải đi cùng một cấu hình.

Thống nhất nguồn tạo dòng hàng bằng cách tái sử dụng hoặc trích xuất `buildConfiguredLine()`. Sản phẩm cần nhập tên, số điện thoại hoặc cấu hình QR/NFC phải mở modal trước; không quick-add cấu hình rỗng.

Giữ công thức tiền hiện tại:

```text
Đơn giá = giá cơ bản + phụ phí vật liệu
Tiền hàng = tổng đơn giá × số lượng
Miễn ship khi tiền hàng sau giảm giá ≥ 300.000đ
Phí ship dưới ngưỡng = 25.000đ
Giỏ rỗng = 0đ phí ship
```

Không suy ra công thức ship theo trọng lượng trong đợt này.

**Yêu cầu renderer an toàn:**

- Dùng `textContent` cho dữ liệu văn bản.
- Dùng `createElement()` và event delegation cho tương tác.
- Không nội suy tên, ID, màu hoặc vật liệu vào inline JavaScript.
- Chỉ chấp nhận màu hex đúng định dạng trước khi gán style.
- Kiểm tra scheme URL ảnh và liên kết; từ chối `javascript:`.
- Chỉ giữ data URL ảnh raster hợp lệ cho upload.
- Khi ảnh dự phòng cũng thất bại, dừng handler để tránh lặp.

Phải kiểm tra cả Hero, card, modal, Admin và phần hiển thị giỏ hàng có nhận dữ liệu sản phẩm.

**Yêu cầu viewer:**

- Không gán `nfc_wifi` làm model mặc định cho cả 55 sản phẩm.
- Sản phẩm chưa có mô hình phù hợp dùng `modelKey: null`; ẩn “Soi 3D” tương ứng.
- Theo dõi `activeProductId`, không dùng `modelKey` để quyết định sản phẩm mua.
- Loại bỏ nhánh lấy `products[0]` khi xác định sản phẩm để đặt hàng.
- Giữ chức năng và mô hình 3D cũ đang hoạt động.

**8. P4 — Kiểm thử và cổng nghiệm thu**

Các bộ test cũ phải chạy lại. Khi baseline đổi, chuyển dữ liệu legacy thành fixture; không xóa assertion bảo toàn ảnh hoặc thông số để làm test xanh.

Bổ sung tối thiểu:

| Nhóm | Ca bắt buộc |
|---|---|
| Dữ liệu | 55 ID duy nhất; 11/category; 5 Hero; đủ ảnh |
| Metadata | Không mất trường qua init, sửa, lưu, export/import |
| Migration | Cache cũ nhận seed mới, giữ ảnh và thông số riêng |
| Migration | `[]`, JSON hỏng, fetch lỗi, quota lỗi, marker lỗi |
| Migration | Chạy hai lần không đổi; seed đã xóa không tái xuất hiện |
| Router | Deep link, reload, Back/Forward, category lạ, init chậm |
| Hiển thị | Hero không trùng grid; số lượng theo active thực tế |
| Checkout | Direct A giữ nguyên giỏ B; cấu hình và phí ship đúng |
| XSS | Payload trong title, ID, specs, màu, vật liệu và URL |
| Viewer | Nút mua giữ đúng Product ID; mẫu thiếu model không mở sai |

Lệnh kiểm tra nền:

```powershell
node tests/test_behavior.js

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\test_e2e_simulation.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\test_tab_architecture.ps1

node --check js/catalog-store.js
node --check js/products-manager.js
node --check js/app.js
node --check js/admin.js
node --check js/viewer3d.js
```

Hai script PowerShell hiện chủ yếu kiểm tra chuỗi và cấu trúc mã. Phải bổ sung kiểm tra trình duyệt thực tế cho lọc, lịch sử, modal và checkout.

Kiểm tra tối thiểu tại chiều rộng 360, 768 và 1440 px, cả giao diện sáng/tối: không tràn ngang trang, không CTA bị che, không lỗi console phát sinh do thay đổi, không thiếu thumbnail.

**9. Thứ tự thi công và báo cáo bàn giao**

Antigravity thực hiện tuần tự:

1. Ghi nhận diff hiện có; không ghi đè công việc người dùng.
2. Tạo registry, importer, manifest và fixture legacy.
3. Hoàn thành validation, sanitizer và migration.
4. Hoàn thành router cùng state filter.
5. Dựng Hero/grid và cập nhật Admin.
6. Tích hợp modal, checkout, bảo vệ renderer và viewer.
7. Chạy kiểm thử, kiểm tra trình duyệt và gửi log thực tế.

Đồng bộ phiên bản asset giữa `index.html` và `admin.html`, tránh một trang dùng engine cũ.

Báo cáo bàn giao phải có danh sách file thay đổi, manifest 55 mẫu, bảng Hero, kết quả migration, từng lệnh kiểm thử với exit code, ảnh giao diện thực tế và các giới hạn còn lại.

**Cho phép triển khai ngay theo chỉ thị này. Chỉ được báo hoàn tất khi dữ liệu, migration, điều hướng và hành vi mua hàng đều có bằng chứng kiểm chứng.**
