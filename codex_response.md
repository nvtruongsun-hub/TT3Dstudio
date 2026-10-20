🎯 **[Auto-Router]** `Nhóm Task`: 3 — Web/UI, 4 — Dữ liệu & đặt hàng | `Skills`: Rà soát trực tiếp; các skill Web được ánh xạ chưa có trong môi trường | `MCP/Engines`: PowerShell, tài liệu MDN/Zalo

**Phê duyệt triển khai P1–P4 với các điều chỉnh bắt buộc dưới đây. Antigravity được bắt đầu thực thi ngay. Phê duyệt kiến trúc này chưa thay thế việc nghiệm thu mã nguồn và kiểm thử.**

1. **Chốt phạm vi và sửa các giả định kiến trúc**

   Đối chiếu mã nguồn thực tế cho thấy:

   | Phát hiện | Chỉ thị |
   |---|---|
   | Có cả `index.html` và ứng dụng Next.js trong `src/` | Đợt này nâng cấp bản HTML tĩnh theo Bridge. Xác minh entrypoint triển khai trước khi phát hành. |
   | `getStoredProducts()` duyệt `DEFAULT_PRODUCTS.map(...)` | Thay cơ chế đọc catalog: phải hiển thị sản phẩm mới, tôn trọng xóa và catalog rỗng. |
   | Admin có các bản dữ liệu mặc định riêng | Hợp nhất dữ liệu nền vào `products.json`, bảo toàn thông số phong phú hiện nằm trong Client. |
   | `config.js` đã có helper đơn hàng, dữ liệu mẫu và thao tác trừ kho | Tách yêu cầu đặt hàng mới khỏi helper sản xuất để tránh trừ kho khi khách chỉ chuẩn bị đơn. |
   | VietQR xuất hiện trong cart, cấu hình, footer và coupon | Rà toàn bộ đường chạy của bản HTML, thay vì chỉ ẩn modal. |
   | Client đang dựng HTML từ dữ liệu sản phẩm bằng chuỗi | Chặn đường chèn mã qua tên, ảnh, mô tả, màu và nội dung cá nhân hóa trước khi mở rộng import/upload. |

   **Không công bố “đồng bộ 100%” nếu chưa nêu phạm vi.** `localStorage` chỉ phục vụ dữ liệu trong trình duyệt tương ứng. Sự kiện `storage` cập nhật các tab khác cùng origin; tab thực hiện thay đổi cần sự kiện nội bộ riêng. Đây không phải kênh chuyển đơn từ điện thoại khách về máy xưởng. [MDN — storage event](https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event)

2. **Giữ kiến trúc HTML hiện tại và phân chia trách nhiệm rõ ràng**

   Giữ bốn route `#store`, `#studio3d`, `#calculator`, `#standards`, hành vi Back/Forward, viewer 3D và calculator.

   Phân công tệp:

   | Tệp | Trách nhiệm sau nâng cấp |
   |---|---|
   | `products.json` | Catalog nền đầy đủ, phiên bản được đưa lên hosting |
   | `js/catalog-store.js` — mới | Đọc, kiểm tra, lưu, migration, import/export catalog |
   | `js/products-manager.js` | Hiển thị catalog và tương tác chọn sản phẩm |
   | `js/image-uploader.js` — mới | Kiểm tra, nén ảnh, preview, trả Data URL |
   | `js/art-presets.js` — mới | Manifest ảnh tuyển chọn và thông tin nguồn |
   | `js/checkout.js` — mới | Form, snapshot đơn, tính tiền, soạn tin và chuyển tiếp |
   | `js/cart.js` | Quản lý giỏ, số lượng, drawer; gọi checkout |
   | `js/admin.js` — mới | Logic quản trị tách khỏi khối script lớn trong HTML |
   | `css/admin.css` — mới | Giao diện Admin, giới hạn selector trong phạm vi Admin |
   | `js/config.js` | Thông tin shop, chính sách bán hàng, cấu hình khả năng checkout |

   Dùng JavaScript thuần và cách nạp script tương thích hiện tại. `catalog-store.js` phải sẵn sàng trước các consumer. Những consumer khởi tạo bất đồng bộ phải cùng chờ một promise khởi tạo; không đọc catalog khi chưa tải xong.

   Bảo toàn các API đang được dùng như `TTStore.addToCart`, `TTCart.openCart`. Không ghi đè toàn bộ `window.TTStore` làm mất phương thức cấu hình.

3. **P1 — Gỡ VietQR và định nghĩa trung thực trạng thái đặt hàng**

   Loại khỏi đường chạy hiện hành:

   - Modal, nút, listener và API `triggerVietQRModal`/`triggerVietQR`.
   - `BANK_CONFIG`, việc dựng URL `img.vietqr.io` và nút tự xác nhận đã thanh toán.
   - Badge VietQR ở footer, hướng dẫn và placeholder coupon liên quan.
   - Khả năng bật lại QR từ cấu hình cũ. Bảo toàn những trường cấu hình khác khi migration.

   Thay bằng form ngắn gồm tên, số điện thoại, địa chỉ giao hàng và ghi chú tùy chọn. Địa chỉ bắt buộc khi yêu cầu giao tận nơi. Giữ dữ liệu form khi đóng/mở checkout trong cùng phiên.

   Có hai lựa chọn nghiệp vụ: **trao đổi qua Zalo** và **yêu cầu COD**. Tuy nhiên, phải phân biệt hai chế độ vận hành:

   | Chế độ | Hành vi được phép |
   |---|---|
   | Website tĩnh hiện tại | Soạn yêu cầu, cho khách sao chép và mở Zalo để gửi; COD là phương thức thanh toán mong muốn trong yêu cầu |
   | Có backend tiếp nhận hoạt động | Gửi yêu cầu COD tới server; báo tiếp nhận sau phản hồi lưu thành công |

   Với website tĩnh, dùng nội dung như **“Chuẩn bị yêu cầu COD”**, sau đó **“Sao chép nội dung”** và **“Mở Zalo kỹ thuật viên”**. Không hiển thị “Xưởng đã nhận đơn”, “Đã giữ hàng” hoặc “Đang chuẩn bị hàng” chỉ vì đã ghi vào máy khách.

   Với backend, thông báo thành công phải là **“Đã tiếp nhận yêu cầu — chờ xưởng xác nhận”**. Tiếp nhận yêu cầu chưa đồng nghĩa với xác nhận tồn kho hay giao hàng.

   Cấu hình mặc định:

   ```js
   checkout: {
     mode: 'manual',
     orderEndpoint: null,
     paymentMethods: ['cod']
   }
   ```

   Không dựng endpoint giả hoặc biến timeout thành kết quả thành công.

4. **Chuẩn hóa giỏ, tiền và hợp đồng đơn hàng**

   Bổ sung `productId` vào dòng giỏ, tách khỏi định danh dòng. Định danh dòng được tạo từ tuple có cấu trúc:

   ```js
   JSON.stringify([
     productId,
     colorId,
     materialId,
     customText.trim().normalize('NFC')
   ])
   ```

   Không ghép tùy tiện bằng dấu gạch ngang và không đưa nội dung cá nhân hóa vào inline JavaScript. Các nội dung khắc khác nhau phải tạo dòng riêng.

   Migration giỏ cũ phải đối chiếu catalog, không suy luận `productId` bằng cách cắt chuỗi ID. Dòng không đối chiếu được cần yêu cầu khách kiểm tra lại.

   Dùng một hàm tính tiền chung cho drawer, checkout và tin nhắn:

   ```js
   calculateOrderTotals(items, promotion, shippingPolicy)
   // -> {
   //   subtotal, discountAmount, merchandiseTotal,
   //   shippingFee, payableTotal
   // }
   ```

   Tiền là số nguyên VND; số lượng là số nguyên dương có giới hạn. Kiểm tra `Number.isSafeInteger`, giá âm, `NaN` và tổng vượt giới hạn. Vật liệu cộng giá phải được tính nhất quán ở cả Quick Add và modal.

   Chuyển điều kiện freeship hiện có thành chính sách cấu hình, dùng cùng quy tắc ở mọi nơi. Khi chưa biết phí vận chuyển, đặt `shippingFee` và `payableTotal` là `null`, hiển thị **“Phí giao hàng sẽ được xưởng xác nhận”**.

   Hợp đồng yêu cầu đơn:

   ```ts
   type DirectOrder = {
     schemaVersion: 1;
     clientRequestId: string;
     serverOrderId?: string;
     createdAt: string;
     channel: 'zalo' | 'cod';
     paymentMethod: 'cod';
     status: 'draft' | 'handoff_started' | 'received';
     customer: {
       name: string;
       phone: string;
       address: string;
       note: string;
     };
     items: Array<{
       lineId: string;
       productId: string;
       title: string;
       colorId: string | null;
       materialId: string | null;
       customText: string | null;
       quantity: number;
       unitPrice: number;
     }>;
     totals: {
       subtotal: number;
       discountAmount: number;
       merchandiseTotal: number;
       shippingFee: number | null;
       payableTotal: number | null;
     };
   };
   ```

   `received` chỉ được đặt từ phản hồi server. Tạo ID bằng `crypto.randomUUID()` khi được hỗ trợ, có fallback phù hợp; bỏ mã ngẫu nhiên bốn chữ số.

   Snapshot yêu cầu phải độc lập với catalog: sửa giá hoặc xóa sản phẩm sau này không được thay đổi lịch sử. Không lưu Base64 ảnh vào từng đơn.

   Khóa nút trong lúc submit, giữ cùng `clientRequestId` khi retry. Nếu triển khai backend, server phải xử lý idempotency và tự tính lại giá, khuyến mại, khả năng bán từ dữ liệu tin cậy.

   Giữ giỏ khi sao chép, mở Zalo, lỗi mạng hoặc lưu thất bại. Chỉ xóa sau tiếp nhận bền vững từ server hoặc thao tác rõ ràng của khách.

5. **Zalo phải có đường lui hoạt động được**

   Mã hiện tại sử dụng `zalo.me/<phone>?text=...`. Tài liệu đã kiểm tra chưa đủ để bảo đảm tham số này điền sẵn nội dung tới đúng người nhận trên mọi nền tảng. Không cam kết “gửi đơn tự động một chạm” dựa trên URL đó. Các tính năng chia sẻ và chat của Zalo cần được phân biệt với thao tác gửi tin. [Zalo Developers](https://developers.zalo.me/docs/social/share)

   Luồng bắt buộc:

   - Hiển thị bản xem trước nội dung đơn.
   - Có nút **Sao chép nội dung đơn** với trạng thái thành công/thất bại.
   - Có liên kết **Mở Zalo kỹ thuật viên** lấy số từ cấu hình shop.
   - Khi clipboard bị từ chối, hiện textarea chỉ đọc để khách chọn và sao chép thủ công.
   - Khi không mở được ứng dụng, vẫn giữ nội dung và thông tin liên hệ trên trang.

   Clipboard cần xử lý quyền truy cập và secure context. [MDN — Clipboard.writeText](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText)

   Tin nhắn phải có mã tham chiếu, từng mặt hàng, tùy chọn, số lượng, đơn giá, tạm tính, giảm giá, phí giao hàng và thông tin nhận hàng. Thêm câu **“Nhờ xưởng xác nhận giá cuối cùng và thời gian giao.”**

   Không đưa tên, điện thoại hoặc địa chỉ vào URL. Link mở tab mới dùng `rel="noopener noreferrer"`. Chỉ ghi nhận `handoff_started` là đã bắt đầu chuyển tiếp, không suy diễn thành tin nhắn đã gửi.

6. **P3 — Catalog dùng chung, lưu an toàn và migration có kiểm soát**

   Giữ `tt_products` là mảng sản phẩm để giảm phá vỡ tương thích. Tất cả consumer phải truy cập qua repository chung.

   Quy tắc đọc:

   - Không có khóa: tải `products.json`.
   - Có mảng hợp lệ, kể cả `[]`: dùng nguyên danh sách đó.
   - Dữ liệu hỏng: thông báo, cho xuất dữ liệu để khôi phục; không tự ghi mặc định đè lên.
   - Không tải được dữ liệu nền và không có bản hợp lệ: hiện trạng thái lỗi cùng nút thử lại.

   Hoàn thiện `products.json` bằng các trường hiện có: `type`, `modelKey`, `specs`, `colors`, `materials`, `headlineBenefit`, `specLine`. Khi migration, chỉ bổ sung trường thiếu từ đúng sản phẩm cùng `id`; không ghép theo `modelKey` và không tự thêm lại sản phẩm đã xóa.

   Rà các `modelKey` không nhất quán của sản phẩm desk dock và pegboard, đối chiếu danh sách viewer thực sự hỗ trợ.

   Bổ sung trường:

   ```ts
   status: 'active' | 'draft' | 'archived';
   imageAlt: string;
   imageSource: 'upload' | 'url' | 'preset';
   presetId?: string;
   updatedAt: string;
   ```

   Client chỉ hiển thị `active`; Admin quản lý đủ trạng thái. Import/export phải kiểm tra toàn bộ schema, ID trùng, giá, enum, giới hạn chuỗi và ảnh. Import có bản xem trước số lượng thay đổi trước khi thay catalog.

   Ghi thành công rồi mới cập nhật UI và phát `tt_products_updated`. Tab khác nghe `storage`; tab hiện tại nghe sự kiện nội bộ. Nếu form đang sửa mà catalog đổi ở tab khác, cảnh báo xung đột thay vì ghi đè âm thầm.

   **Xuất `products.json` là tải tệp xuống.** UI phải nói rõ việc đưa dữ liệu lên website công khai cần bước cập nhật tệp trên hosting; thao tác này không tự ghi vào repository.

7. **Uploader Base64 được duyệt với ngân sách dung lượng**

   Duyệt ba nguồn ảnh trong cùng editor: **Tải từ máy**, **URL**, **Thư viện mẫu**. Có drag/drop, file input truy cập được bằng bàn phím và preview tức thời.

   Thông số triển khai ban đầu:

   | Hạng mục | Giới hạn |
   |---|---|
   | File đầu vào | JPEG, PNG, WebP; tối đa 6 MiB |
   | Kích thước giải mã | Tối đa 24 megapixel |
   | Kích thước sau resize | Cạnh dài tối đa 1200 px, giữ tỉ lệ |
   | Đầu ra | WebP, fallback JPEG |
   | Dung lượng mục tiêu | Khoảng 120 KiB; tối đa 180 KiB phần ảnh nhị phân |
   | Ngân sách ghi cục bộ | Ngưỡng bảo thủ 3 MiB tổng dữ liệu Web Storage liên quan |

   Ngưỡng trên là chính sách ứng dụng, không phải bảo đảm quota của trình duyệt. Base64 tăng kích thước và `localStorage` có quota nhỏ; mọi lệnh đọc/ghi phải xử lý ngoại lệ. [MDN — Storage quotas](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)

   Pipeline: kiểm tra kích thước → kiểm tra định dạng và giải mã → resize/nén → kiểm tra đầu ra → preview → lưu khi bấm **Lưu sản phẩm**.

   Kiểm tra ảnh giải mã được, không chỉ tin extension hoặc MIME do file khai báo. Đợt này từ chối SVG, GIF và HEIC, kèm thông báo định dạng hỗ trợ.

   Không ghi ảnh mới vào storage mỗi lần preview. Khi đầy bộ nhớ, giữ catalog đã lưu và bản sửa trên form; đề nghị dùng URL hoặc ảnh preset, không tự xóa dữ liệu khác.

   Với URL: cho phép HTTPS và đường dẫn ảnh nội bộ đã kiểm tra; chặn `javascript:`, `file:`, Data URL ngoài loại raster được phép. URL ngoại vi được hiển thị trực tiếp, không mặc định tải vào canvas để nén.

   Khi chọn ảnh liên tiếp, kết quả xử lý cũ không được ghi đè ảnh mới. Thu hồi object URL sau khi dùng; ảnh lỗi chuyển sang placeholder nội bộ một lần.

8. **P2 — Art direction phải bám đúng sản phẩm**

   Chốt ngôn ngữ thị giác: nền Obsidian/Paper, typography hiện có, cam công nghiệp làm điểm nhấn, thông tin kỹ thuật gọn và bố cục có khoảng trống. Tiếp tục dùng design token đang có thay vì bổ sung một hệ màu cạnh tranh.

   Bộ ảnh cần bao phủ NFC, bình hoa, desk dock, đèn xoắn, pegboard và monogram. Dùng ảnh được sở hữu hoặc có quyền sử dụng, lưu trong `assets/images/`; preset có manifest chứa `id`, tên, nhóm phù hợp, đường dẫn, alt và nguồn/quyền sử dụng.

   Mỗi nhóm có ảnh tổng thể và ảnh cận chi tiết khi tài sản cho phép. Ánh sáng studio phải giữ khả năng đọc hình khối, màu và bề mặt thật. Ảnh AI hoặc concept phải được phân biệt khi có thể khiến khách hiểu sai sản phẩm bán.

   **Không áp nhãn “0.16mm Silk-Matte” lên toàn catalog.** Mã hiện tại có nhiều độ cao lớp khác nhau. Badge và thông số phải lấy từ đúng sản phẩm. Các tuyên bố vật liệu, khả năng chống nước, tải trọng và bảo hành cần giữ đúng dữ liệu đã được xưởng xác nhận.

   Ảnh có kích thước hoặc `aspect-ratio` cố định để hạn chế nhảy bố cục; ảnh ngoài màn hình dùng lazy loading, ảnh hero dùng tải ưu tiên. Grain chỉ nên nằm trên nền, không che texture sản phẩm. Chuyển động ngắn khoảng 140–220 ms, hỗ trợ `prefers-reduced-motion`; không phát âm thanh thành công mặc định.

9. **Admin, bảo mật và phạm vi lịch sử đơn**

   Hoàn thiện Admin bằng sidebar, toolbar tìm kiếm, bộ lọc trạng thái/danh mục, bảng catalog và editor có preview. Bổ sung trạng thái đang tải, đang lưu, lỗi, catalog rỗng và thay đổi chưa lưu.

   Dùng component preview chung với Client để ảnh, giá và badge khớp nhau. Preset phải hiển thị sản phẩm đang áp dụng; thay ảnh chỉ cập nhật bản nháp cho tới lúc lưu.

   Mọi dữ liệu nhập, kể cả từ Admin và JSON, đều cần kiểm tra. Dùng `textContent`, thuộc tính DOM đã kiểm tra và `addEventListener` cho nội dung động; không nội suy dữ liệu vào `onclick` hay HTML tùy ý. Validate màu trước khi gán vào CSS.

   PIN nằm trong JavaScript/localStorage chỉ là khóa tiện dụng trên thiết bị, không phải xác thực bảo vệ Admin công khai. Khi bổ sung backend, thao tác quản trị và xem đơn phải được xác thực, phân quyền phía server.

   Với bản cục bộ, dùng kho riêng `TT_DIRECT_ORDER_DRAFTS_V1`, có nhãn **“Yêu cầu lưu trên trình duyệt này”**. Không trộn vào `TT_STUDIO_ORDERS` đang chứa dữ liệu mẫu và hành vi sản xuất.

   Chỉ lưu thông tin liên hệ lâu dài khi khách chủ động chọn ghi nhớ; cung cấp xóa lịch sử. Không ghi thông tin cá nhân vào console, URL hoặc log kiểm thử. Dữ liệu demo phải tách khỏi dữ liệu thật.

   Modal/drawer cần quản lý focus, trả focus khi đóng, Escape, nhãn input và thông báo lỗi đọc được. Trên mobile, bàn phím và dock không được che nút hành động.

10. **Thứ tự thực thi và bằng chứng nghiệm thu bắt buộc**

   Antigravity thực hiện tuần tự:

   **Chụp baseline và xác minh entrypoint → hợp nhất catalog → gỡ VietQR và dựng checkout → uploader/preset/Admin → art direction → kiểm thử hồi quy.**

   Bảo toàn thay đổi hiện có của người dùng; tạo diff nhỏ theo từng bước. Không gộp chuyển framework vào đợt nâng cấp này.

   Điều kiện nghiệm thu:

   | Nhóm | Kết quả phải chứng minh |
   |---|---|
   | VietQR | Không còn UI, đường gọi hoặc request VietQR trong bản phát hành |
   | Catalog | Thêm mới xuất hiện; xóa không hồi sinh; `[]` giữ rỗng; archive ẩn khỏi Client |
   | Đồng bộ | Admin/Client cùng origin cập nhật đúng; form đang sửa có cảnh báo xung đột |
   | Migration | Giữ thông số, tùy chọn và dữ liệu cũ; JSON hỏng không bị ghi đè |
   | Ảnh | Upload/URL/preset hoạt động; ảnh lỗi, file giả, quá lớn và hết quota được xử lý |
   | Tiền | Giá vật liệu, số lượng, giảm giá và shipping nhất quán ở mọi màn hình |
   | Zalo | Sao chép thất bại vẫn có đường lui; mở Zalo không báo đã gửi/đã giữ hàng |
   | COD | Bản tĩnh hiển thị yêu cầu chuyển tiếp; backend chỉ báo tiếp nhận sau lưu thành công |
   | Gửi lặp | Double-click/retry không tạo nhiều yêu cầu đã tiếp nhận |
   | An toàn | Payload HTML/JS qua import, tên, ảnh và nội dung khắc không thực thi |
   | Hồi quy | Bốn route, Back/Forward, 3D, calculator, theme và giỏ vẫn hoạt động |
   | Hiển thị | Kiểm tra tối thiểu 360, 390, 768 và 1440 px, cùng thao tác bàn phím |

   Dùng parser JavaScript thực sự để kiểm tra cú pháp; kiểm tra cả script còn nằm trong HTML. Các script PowerShell hiện có chủ yếu kiểm tra chuỗi/cấu trúc nên chỉ là kiểm tra phụ, không được báo là E2E trình duyệt.

   Chạy kiểm thử trình duyệt cho catalog, checkout và điều hướng trên HTTP. Nếu entrypoint phát hành thuộc Next.js, cần kiểm tra build tương ứng và đánh giá lại phạm vi tích hợp trước phát hành; build Next.js không xác nhận bản HTML đã đúng.

   Bàn giao lại Codex: danh sách tệp sửa, diff, migration đã áp dụng, log lệnh và exit code, ảnh desktop/mobile, kết quả kiểm thử, giới hạn còn lại và trạng thái cấu hình tiếp nhận COD.

**Lệnh thực thi:** Bắt đầu hợp nhất lớp dữ liệu và loại bỏ VietQR ngay. Chỉ đánh dấu hoàn tất khi bằng chứng nghiệm thu khớp hành vi thực tế; mọi trạng thái tiếp nhận đơn phải phản ánh đúng khả năng lưu và chuyển đơn của hệ thống.