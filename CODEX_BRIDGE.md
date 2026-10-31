# CODEX CONSULTATION BRIDGE: EXPANDING STORE TO FULL 105-PRODUCT MAKERWORLD CATALOG

## 1. BỐI CẢNH & YÊU CẦU NGƯỜI DÙNG (USER DIRECTIVE)
Người dùng yêu cầu:
> "Top_Mau_In_3D_Doc_La_Xu_The_MakerWorld.xlsx hãy đồng bộ từ file này của tôi đang được lưu ở máy lên web"

Antigravity đã quét máy tính và tìm thấy tệp gốc tại:
`C:\Users\truongg\OneDrive - Thuyloi University\Tài liệu\01. khoi nghiep in 3d\Top_Mau_In_3D_Doc_La_Xu_The_MakerWorld.xlsx` (dung lượng 64.7 MB).

---

## 2. KẾT QUẢ AUDIT DỮ LIỆU TỆP EXCEL 105 SẢN PHẨM

### A. Cấu trúc Sheet & Danh mục:
Tệp Excel chứa **105 sản phẩm tuyển chọn** (55 sản phẩm cũ + 50 sản phẩm mới hoàn toàn) phân bổ qua 7 danh mục chuyên biệt:
1. `Trang_Diem_Vanity`: 12 sản phẩm (11 cũ + 1 mới: Hộp nắp lụa bánh kem gấu nhỏ #2266980)
2. `Decor_Den_Noi_That`: 17 sản phẩm (11 cũ + 6 bình hoa nghệ thuật mới: #1478590, #1045280, #2705739, #2756450, #2451563, #2214866)
3. `Hoa_Decor_Kim_Loai`: 10 sản phẩm (DANH MỤC MỚI HOÀN TOÀN: Hoa diên vĩ, lá monstera, bướm kim loại lỏng Y3K cắm bình #2595057, #2595994, #2596131...)
4. `Hop_De_Ban_Tien_Ich`: 14 sản phẩm (11 cũ + 3 tiện ích mới: #1182396, #2122042, #2258248)
5. `Ca_Nhan_Hoa_NFC`: 11 sản phẩm (11 cũ giữ nguyên)
6. `Do_Choi_Moc_Khoa`: 24 sản phẩm (11 cũ + 13 mô hình khớp động STEM mới: rồng, robot, fidget cơ học)
7. `Moc_Khoa_Clicker_Viral`: 17 sản phẩm (DANH MỤC MỚI HOÀN TOÀN: Mõ tụng kinh giải nghiệp, chân mèo compliant 100% in 3D, clicker mèo thò đầu #2680027, #1073472, #1105014...)

### B. Tình trạng Dữ liệu & Ảnh mẫu:
- **Dữ liệu kinh tế:** Toàn bộ 105 sản phẩm có đầy đủ giá bán lẻ đề xuất (VNĐ), gram nhựa, thời gian in (s/h), điểm tuyển chọn, link MakerWorld gốc và tác giả Trung Quốc.
- **Thumbnail:** 105/105 ảnh mẫu chất lượng cao đã được Antigravity giải nén trực tiếp từ Drawing XML của tệp Excel vào `assets/images/products/thumb_<modelId>.png` (100% sẵn sàng trên đĩa).

---

## 3. CÁC QUYẾT ĐỊNH KIẾN TRÚC CẦN CODEX PHÊ DUYỆT (DECISION GATES)

### Cổng 1: Kiến trúc Danh Mục (Taxonomy & Navigation Tabs)
- **Phương án A (Khuyên nghị - 7 Tabs Độc Lập):**
  Thêm 2 danh mục mới vào `category-registry.js` và thanh tab shop:
  `Tất cả (105)` | `Trang điểm (12)` | `Đèn & Decor (17)` | `Hoa kim loại (10)` | `Bàn làm việc (14)` | `Cá nhân hóa (11)` | `Đồ chơi & Fidget (24)` | `Clicker Viral (17)`.
  *Ưu điểm:* Tôn vinh 2 bộ sưu tập hot trend cực mạnh (Hoa kim loại lỏng Y3K & Móc khóa Clicker ASMR viral), người dùng bấm 1 chạm là duyệt ngay.
- **Phương án B (5 Tabs Gộp & Subcategories):**
  Gộp `Hoa_Decor_Kim_Loai` vào `Decor_Den_Noi_That` (tổng 27 mẫu) và `Moc_Khoa_Clicker_Viral` vào `Do_Choi_Moc_Khoa` (tổng 41 mẫu).
  *Nhược điểm:* Khiến 2 danh mục này bị quá tải sản phẩm, ẩn mất bộ sưu tập hoa kim loại và clicker độc lạ.

### Cổng 2: Quy tắc Strict TDD & Cập nhật Test Baseline
Trong repo, các bài test cũ (`test_behavior.js` Case 11 và `test_audit_regressions.js` Ca B) được viết trước đây với assertion cứng:
`assert.strictEqual(defaultCatalog.length, 55, 'Catalog must contain exactly 55 products')`
Theo quy tắc nghiệp vụ mới của người dùng (nâng cấp từ bản seed 55 lên toàn bộ 105 mẫu của xưởng), xin chỉ thị của Codex về việc nâng cấp baseline contract này thành 105 sản phẩm để phản ánh đúng yêu cầu nghiệp vụ thực tế.

### Cổng 3: Hợp đồng Di trú 3 chiều (3-Way Merge & Revision Bump)
- Nâng `CURRENT_CATALOG_REVISION` từ `'mw-55-v5-compact-tabs'` lên `'mw-105-v1-full'`.
- Bổ sung 50 sản phẩm mới vào `BASELINE_PRODUCT_SEED_MAP` trong `catalog-store.js` để bảo vệ các chỉnh sửa thủ công của Admin (nếu có) mà vẫn tự động nạp 50 mẫu mới cho khách hàng cũ.

Xin Codex Master (`gpt-6.1-sol`) cho bản thiết kế chi tiết và chỉ đạo thực thi.


---

## [2. CHI_THI_PHE_DUYET_TU_CODEX]

> **Thời gian ban hành:** 2026-10-31 09:55:34
> **Mô hình ban hành:** GPT-6.1-Sol (Reasoning Effort: High)

🎯 **[Auto-Router]** `Nhóm Task`: Phê duyệt kiến trúc & mã nguồn | `Skills`: brain-engineer-pro-max, code-review-pro-max | `MCP/Engines`: PowerShell, Node.js

**BẢN CHỈ THỊ PHÊ DUYỆT — `TT3D-MW105-R1`**

**Phê duyệt triển khai catalog mặc định 105 sản phẩm, chia thành 7 danh mục.** Antigravity được thực hiện các thay đổi và kiểm thử dưới đây. Phê duyệt kiến trúc này chưa phải xác nhận mã nguồn 105 mẫu đã hoàn tất hoặc website đã được cập nhật.

Qua kiểm tra repository, catalog hiện có đúng **55 ID duy nhất, 5 danh mục, mỗi danh mục 11 mẫu**. Bốn suite liên quan đạt **45/45 kiểm tra**. Thư mục ảnh có **132 thumbnail**; cần xác minh ánh xạ từng sản phẩm, không dùng tổng số tệp để kết luận 105/105 ảnh đúng. Nội dung Excel 105 mẫu trong bridge vẫn phải được Worker đối soát trước khi ghi dữ liệu phát hành.

**1. Quyết định tại ba cổng**

| Cổng | Quyết định | Điều kiện thực thi |
|---|---|---|
| Danh mục | **Duyệt phương án A: 7 danh mục + “Tất cả”**, tổng cộng 8 nút lọc | Giữ nguyên ID 5 danh mục cũ; thêm đúng 2 ID mới |
| Baseline test | **Duyệt nâng hợp đồng catalog mặc định từ 55 lên 105** | Giữ nguyên fixture lịch sử 55 mẫu để kiểm thử di trú |
| Revision và merge | **Duyệt `mw-105-v1-full`** | Seed mới được bổ sung từ `incomingDefaults`; bảo toàn chỉnh sửa Admin, tombstone và catalog rỗng có chủ ý |

**Điều chỉnh bắt buộc đối với đề xuất cổng 3:** `BASELINE_PRODUCT_SEED_MAP` hiện chỉ tham gia nhận diện thay đổi `cleanTitle`. Nó không phải bảng baseline đầy đủ cho giá, ảnh, tác giả hoặc thông số sản xuất. Thêm 50 mục vào bảng này **không tự tạo ra cơ chế three-way merge cho toàn bộ dữ liệu**. Logic thực tế nằm tại [catalog-store.js](</C:/Users/truongg/OneDrive - Thuyloi University/Tài liệu/02. T&T 3D studio/js/catalog-store.js:673>).

**2. Hợp đồng dữ liệu và taxonomy**

Dùng phân bổ sau làm kỳ vọng độc lập trong kiểm thử phát hành:

```js
const EXPECTED_CATEGORY_COUNTS = Object.freeze({
  Trang_Diem_Vanity: 12,
  Decor_Den_Noi_That: 17,
  Hoa_Decor_Kim_Loai: 10,
  Hop_De_Ban_Tien_Ich: 14,
  Ca_Nhan_Hoa_NFC: 11,
  Do_Choi_Moc_Khoa: 24,
  Moc_Khoa_Clicker_Viral: 17
});

const EXPECTED_DEFAULT_COUNT = 105;
```

| ID danh mục | Nhãn shop | Số mẫu mặc định |
|---|---|---:|
| `Trang_Diem_Vanity` | Trang điểm | 12 |
| `Decor_Den_Noi_That` | Đèn & Decor | 17 |
| `Hoa_Decor_Kim_Loai` | Hoa kim loại | 10 |
| `Hop_De_Ban_Tien_Ich` | Bàn làm việc | 14 |
| `Ca_Nhan_Hoa_NFC` | Cá nhân hóa | 11 |
| `Do_Choi_Moc_Khoa` | Đồ chơi & Fidget | 24 |
| `Moc_Khoa_Clicker_Viral` | Clicker Viral | 17 |

Nguồn biên tập registry là [data/category-registry.json](</C:/Users/truongg/OneDrive - Thuyloi University/Tài liệu/02. T&T 3D studio/data/category-registry.json>). Sinh lại `js/category-registry.js` từ nguồn này; đồng bộ các fallback hiện hữu trong store, products manager và router. Không thêm một bảng danh mục riêng với nội dung khác.

Hai danh mục mới phải có đủ metadata đang được consumer sử dụng: `id`, `name`, `shortName`, `title`, `desc`, `heroId`, màu, icon và badge. Nhãn “Hoa kim loại” mô tả bộ sưu tập; thông tin vật liệu phải thể hiện đúng nhựa in thực tế.

Giữ 5 hero hiện tại để bảo toàn hợp đồng cũ. Với mỗi danh mục mới, chọn một sản phẩm có thật, đang active, theo thứ tự:

```text
selectionScore giảm dần
→ prints giảm dần
→ downloads giảm dần
→ likes giảm dần
→ modelId tăng dần, so sánh dạng số
```

Điểm thiếu đứng sau điểm hợp lệ. Ghi ID được chọn vào registry và kiểm thử tính nhất quán với `isHero`; không phỏng đoán hero từ các ID ví dụ trong bridge.

**3. Chỉ thị nhập dữ liệu từ Excel**

Importer hiện tại vẫn đọc JSON trung gian và khóa cứng **11 mẫu/danh mục, tổng 55** tại [import_makerworld_catalog.py](</C:/Users/truongg/OneDrive - Thuyloi University/Tài liệu/02. T&T 3D studio/scripts/import_makerworld_catalog.py:173>). Worker phải cập nhật pipeline này trước khi tái sử dụng.

Thực hiện tuần tự:

1. Chụp snapshot `products.json` 55 mẫu hiện tại làm fixture lịch sử và đối chiếu diff.
2. Đọc workbook nguồn ở chế độ chỉ đọc. Xác minh header, dòng dữ liệu và khóa nối giữa các sheet.
3. Tạo dữ liệu chuẩn hóa trong vùng staging, chưa ghi đè catalog đang dùng.
4. Kiểm tra toàn bộ dữ liệu và ảnh; chỉ promote khi tất cả kiểm tra đạt.

Hợp đồng định danh:

```js
id = `mw-cn-${modelId}`;
```

`modelId` là chuỗi chữ số chuẩn hóa. Không sinh ID từ STT hoặc vị trí dòng.

Bắt buộc chứng minh bằng tập ID:

```text
oldIds.size = 55
incomingIds.size = 105
oldIds ⊆ incomingIds
incomingIds \ oldIds có đúng 50 phần tử
```

Không chỉ kiểm tra `105 - 55`. Hai tập có cùng kích thước vẫn có thể thiếu sản phẩm cũ.

Quy tắc ánh xạ:

- Nối dữ liệu bằng `modelId`; không nối theo tên gần giống hoặc thứ tự dòng.
- Chốt nguồn sở hữu từng trường sau khi kiểm tra header. Nếu các sheet mâu thuẫn giá, trọng lượng hoặc thời gian, ghi rõ model ID, ô nguồn và giá trị; không âm thầm chọn.
- `price`: số nguyên VNĐ hợp lệ; không nhân thêm 1.000 khi dữ liệu đã là VNĐ.
- `weightGrams`: gram; `printTimeSeconds`: giây. Chỉ nhân 3.600 khi nguồn được xác nhận là giờ.
- Giữ tác giả gốc, URL MakerWorld, điểm tuyển chọn và dữ liệu giấy phép. Không thay tác giả nguồn bằng thương hiệu xưởng.
- Thiếu điểm phải giữ trạng thái thiếu; bỏ các fallback kiểu `value or 5`, `value or 100`.
- Giữ nội dung biên tập hiện hữu của 55 mẫu, đặc biệt `cleanTitle`, badge và phân nhóm nhỏ, trừ những thay đổi được thể hiện rõ trong diff.
- Bổ sung đầy đủ trường trình bày cho 50 mẫu mới theo schema hiện hữu; không bịa số liệu hoặc tính năng.

Đối với ảnh, script hiện tại đang gán cứng tên sheet với `drawing1…drawing7` và có thể bỏ qua tệp đã tồn tại. Worker phải kiểm tra quan hệ **worksheet → drawing → relationship → media**, đối chiếu anchor với đúng dòng sản phẩm. Xác nhận định dạng thực bằng giải mã ảnh; đổi đuôi thành `.png` không phải chuyển đổi định dạng.

Mỗi sản phẩm cần một dòng báo cáo nguồn: model ID, sheet/dòng, giá, trọng lượng, thời gian, đường dẫn ảnh và hash ảnh. Đường dẫn tuyệt đối trên máy chỉ nằm trong báo cáo nội bộ.

**4. Hợp đồng di trú được phê duyệt**

Thay đúng revision:

```js
const CURRENT_SCHEMA_VERSION = 5;
const CURRENT_CATALOG_REVISION = 'mw-105-v1-full';
```

Giữ schema 5 vì thay đổi này mở rộng nội dung catalog, chưa đổi cấu trúc lưu trữ.

Tiếp tục sử dụng `buildMigration()` hiện hữu:

```text
Đọc catalog và metadata
→ tải, xác thực incomingDefaults
→ merge các bản ghi đang lưu
→ khi revision khác: thêm ID còn thiếu, trừ tombstone
→ ghi products thành công
→ ghi metadata
```

Các bất biến bắt buộc:

- Cài mới, chưa có storage: nhận đủ 105 mẫu mặc định.
- Catalog 55 mẫu nguyên vẹn: nhận thêm đúng 50 mẫu.
- Sản phẩm Admin tự tạo vẫn tồn tại.
- Giá, ảnh, tiêu đề, category, trạng thái, mảng màu/vật liệu và `modelKey: null` do Admin lưu được bảo toàn theo hợp đồng hiện tại.
- Tombstone ngăn seed bị thêm lại.
- `[]` có chủ ý tiếp tục rỗng.
- Storage hỏng không bị ghi đè.
- Fetch thất bại không nâng revision bền vững.
- Ghi products thất bại không được ghi metadata báo đã hoàn thành.
- Chạy lại migration không thêm trùng hoặc tạo thay đổi không cần thiết.

**Không áp điều kiện “catalog sau migration luôn có 105 mẫu”.** Catalog đã chỉnh sửa có thể chứa sản phẩm riêng, mẫu bị xóa hoặc mẫu bị ẩn. Con số 105 thuộc hợp đồng **catalog mặc định**.

Giữ nguyên snapshot cũ trong `BASELINE_PRODUCT_SEED_MAP`. Có thể thêm snapshot `title`/`cleanTitle` ban đầu của 50 ID mới phục vụ các lần cập nhật sau, nhưng không sửa lại baseline cũ theo dữ liệu mới.

Phạm vi merge của đợt này là bổ sung seed và giữ cơ chế cập nhật `cleanTitle` hiện hữu. Nếu muốn cập nhật những trường khác của bản ghi đã lưu theo Excel, phải có baseline lịch sử đúng để áp dụng:

```text
local == baseline → nhận incoming
local != baseline → giữ local
không có baseline đáng tin cậy → giữ local
```

Không mở rộng cơ chế này bằng cách coi giá trị hiện tại trong workbook là baseline lịch sử.

**5. Thay đổi giao diện và các consumer**

Tab shop đang ghi cứng `(55)` và `(11)` tại [index.html](</C:/Users/truongg/OneDrive - Thuyloi University/Tài liệu/02. T&T 3D studio/index.html:442>). Bổ sung hai nút lọc mới và cập nhật số đếm từ catalog runtime.

Có thể dùng hàm sau trong lifecycle hiện hữu:

```js
function refreshCategoryCounts() {
  const products = window.TTCatalogStore.getProductsSync(true);
  const counts = new Map([['all', products.length]]);

  for (const product of products) {
    counts.set(
      product.category,
      (counts.get(product.category) || 0) + 1
    );
  }

  document
    .querySelectorAll('#store-catalog .catalog-categories [data-category]')
    .forEach(button => {
      const count = button.querySelector('.catalog-pill-count');
      if (count) {
        count.textContent = `(${counts.get(button.dataset.category) || 0})`;
      }
    });
}
```

Gọi sau khi store khởi tạo và trong listener `tt_products_updated` hiện có. Số trên tab tính theo toàn bộ sản phẩm active của danh mục; số kết quả tìm kiếm/lọc giữ vai trò riêng.

Worker phải cập nhật đồng thời:

- Hai select Admin: `prod-category`, `filter-category-select`.
- Router và deep link cho hai category ID mới, giữ nguyên chữ hoa/thường.
- Fallback registry trong các module hiện hữu.
- Cache version của script thay đổi trong cả `index.html` và `admin.html`.
- Thông báo Admin đang ghi cứng “55 sản phẩm”: dùng độ dài danh sách thực tế.

Giữ `CATALOG_PAGE_SIZE = 12`. “Xem thêm” phải cho phép truy cập hết 105 mẫu. Thanh danh mục cuộn ngang trên mobile, không gây tràn toàn trang; giữ focus bàn phím và `aria-pressed`.

**6. Test, build và đồng bộ**

Không chỉ sửa hai assertion được nêu trong bridge. Baseline hiện còn nằm trong:

```text
tests/test_behavior.js
tests/test_audit_regressions.js
tests/test_compact_tabs_and_excel_catalog.js
tests/test_differentiation_lookbook.js
```

Viết kỳ vọng mới trước, xác nhận thất bại vì catalog còn 55, rồi triển khai. Không thay toàn bộ chuỗi `55` thành `105`: fixture di trú và revision lịch sử phải được giữ.

Tối thiểu phải kiểm thử:

| Kịch bản | Kết quả |
|---|---|
| Catalog mặc định | 105 ID duy nhất, đúng phân bổ 7 danh mục |
| Đối chiếu tập ID cũ/mới | Giữ 55 ID cũ, thêm đúng 50 ID mới |
| Di trú có chỉnh sửa Admin | Giữ chỉnh sửa và sản phẩm riêng |
| Tombstone, catalog rỗng, storage hỏng | Giữ đúng các bất biến hiện hành |
| Offline, lỗi ghi storage, chạy lại migration | Không nâng revision sai hoặc thêm trùng |
| Hai danh mục mới | Tab, deep link, Admin, modal, mua hàng hoạt động |
| Media và phân trang | 105 ảnh giải mã được; toàn bộ mẫu truy cập được |

Không thay assertion bằng `>= 105` hoặc bằng độ dài lấy từ chính file đang kiểm tra.

Firestore hiện vẫn ghi revision cứng `mw-55-v2` tại [firebase-init.js](</C:/Users/truongg/OneDrive - Thuyloi University/Tài liệu/02. T&T 3D studio/js/firebase-init.js:367>). Nếu sử dụng luồng đồng bộ cloud, lấy revision từ `TTCatalogStore.CURRENT_CATALOG_REVISION`; không ghi metadata báo hoàn tất khi còn sản phẩm lỗi hoặc metadata chưa lưu thành công. Không tự thêm thao tác xóa hàng loạt document cloud.

Chạy lại bốn suite nêu trên cùng các suite bị ảnh hưởng về presentation, hero, Admin và Firebase. Sau đó dùng pipeline phát hành thực tế:

```powershell
npm run build:static
```

Kiểm tra trên artifact `dist/`: registry, revision, catalog 105 mẫu và toàn bộ ảnh tham chiếu. Chụp desktop/mobile, kiểm tra console và request tài nguyên. Build thành công chưa đủ để tuyên bố website đã đồng bộ; nếu phát hành, phải kiểm tra lại URL đích.

**7. Hồ sơ Worker phải trả về**

Gửi diff đúng phạm vi cùng:

- Báo cáo đối chiếu nguồn, tập ID và ảnh.
- Log RED/GREEN, kết quả regression và build.
- Bằng chứng migration giữ chỉnh sửa Admin, tombstone và tính idempotent.
- Ảnh kiểm tra giao diện, lỗi còn lại và trạng thái phát hành thực tế.

Giữ nguyên các thay đổi chưa commit không thuộc catalog đang có trong workspace.

**Lệnh thực thi:** Antigravity bắt đầu bằng snapshot 55 mẫu và kiểm thử hợp đồng 105, sau đó triển khai lần lượt dữ liệu, registry, migration, giao diện và artifact. Không cần xin lại phê duyệt ba cổng trong phạm vi chỉ thị này.
