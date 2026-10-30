🎯 **[Auto-Router]** `Nhóm Task`: Kiến trúc, bảo mật, dữ liệu đơn hàng & CRO | `Skills`: `brain-engineer-pro-max`, `code-review-pro-max` | `MCP/Engines`: PowerShell, Node.js, tài liệu chính thức Firebase/Telegram

**[2. CHI_THI_PHE_DUYET_TU_CODEX]**

**BẢN CHỈ THỊ TT3D-MASTER-AUDIT-R7 — PHÊ DUYỆT TRIỂN KHAI CÓ ĐIỀU KIỆN**

**Quyết định:** Antigravity được triển khai ngay các gói WP-1 đến WP-10 dưới đây. Chưa đủ căn cứ phê duyệt hệ thống hiện tại cho vận hành đơn hàng production. Ưu tiên xử lý bí mật, lưu trữ và quyền truy cập trước khi tiếp tục cải tiến hình thức.

**1. Căn cứ thẩm định**

Đã đối chiếu stdin với repository tại commit `6f9277a75a127a05b8898b7374169927e518b9f1`, đọc các đường đi trọng yếu qua checkout, Order Engine, admin, Firebase, Telegram và các bài kiểm thử liên quan.

Kết quả kiểm tra trực tiếp:

| Nội dung | Kết quả |
|---|---|
| Chạy riêng từng file `tests/test_*.js` | **18/18 suite exit code 0** |
| Kiểm tra manifest artifact hiện có | **208 tệp, không thiếu tệp, không sai SHA-256** |
| Token Telegram trong source và artifact | **Có trong cả hai** |
| Giả lập lỗi ghi localStorage | Engine vẫn trả `ok: true`, đơn không được lưu |
| Tra cứu bằng một chữ số hoặc dấu `-` | Được chấp nhận |
| Chuyển `delivered → in_production` | Được chấp nhận |
| Database đơn hàng bằng `[]` | Tự sinh hai đơn demo |
| Escape nội dung sản phẩm trong Telegram | Có trường chưa escape |

Đây là kiểm tra mã nguồn và hành vi cục bộ với dữ liệu giả. Chưa kiểm chứng Firestore Rules đang triển khai, thiết bị Zalo thực, hiệu năng điện thoại, hoặc giao dịch production. Không gọi bot và không gửi thông báo thật.

Các thay đổi có sẵn trong working tree được giữ nguyên; đợt thẩm định này chưa sửa mã ứng dụng.

**2. Những phát hiện bắt buộc xử lý**

| Mức | Phát hiện, nguyên nhân và hậu quả | Chỉ thị sửa |
|---|---|---|
| **P0** | Token bot được hardcode tại [telegram-notifier.js](<C:/Users/truongg/OneDrive - Thuyloi University/Tài liệu/02. T&T 3D studio/js/telegram-notifier.js:12>), đồng thời được đóng gói vào `dist`. Người tải JavaScript có thể lấy token. | Thu hồi token đã lộ; đưa token mới hoàn toàn sang server. Xóa đường đọc/ghi token từ trình duyệt. |
| **P1** | [Order Engine](<C:/Users/truongg/OneDrive - Thuyloi University/Tài liệu/02. T&T 3D studio/js/order-engine.js:281>) bắt lỗi lưu rồi bỏ qua; `createOrderRequest` và cập nhật trạng thái vẫn báo thành công. | Mọi thao tác lưu phải trả kết quả rõ ràng; chỉ xác nhận thành công sau khi lưu thành công. |
| **P1** | `getOrderProjection` dùng `endsWith(cleanInput)`. Dấu `-` sau chuẩn hóa thành chuỗi rỗng nên vượt kiểm tra; projection còn trả token. | Loại bỏ xác thực bằng hậu tố số điện thoại. Kiểm tra quyền ở server; không trả token từ projection. |
| **P1** | `updateOrderStatus` chỉ kiểm tra tên trạng thái tồn tại, không kiểm tra cạnh chuyển hợp lệ. | Áp dụng state machine và lệnh nghiệp vụ; cấm hồi sinh đơn hoàn tất bằng setter tùy ý. |
| **P1** | [Checkout](<C:/Users/truongg/OneDrive - Thuyloi University/Tài liệu/02. T&T 3D studio/js/checkout.js:654>) không chờ kết quả `saveOrder`; Telegram được gửi độc lập. Có thể có tin báo nhưng không có đơn cloud. | Commit đơn trước, tạo sự kiện thông báo trong cùng transaction, gửi Telegram sau commit. |
| **P1** | `detectOrderTrack` mặc định hàng sẵn khi thiếu dữ liệu. Các cờ `madeToOrder`/`requiresPrinting` không được giữ qua quá trình chuẩn hóa checkout. Không có kiểm chứng tồn kho. | Server quyết định theo SKU, biến thể, tồn kho và tùy chỉnh thực tế; dữ liệu thiếu phải chuyển kiểm tra thủ công. |
| **P1** | [Firestore listener](<C:/Users/truongg/OneDrive - Thuyloi University/Tài liệu/02. T&T 3D studio/js/firebase-init.js:250>) mặc định lấy 50 đơn; admin dùng tập đó để tính KPI toàn kỳ. Tổng tiền còn bao gồm mọi trạng thái. | Tách truy vấn danh sách khỏi thống kê; định nghĩa rõ giá trị đơn, doanh thu và hoàn tiền. |
| **P1** | Nhiều test cloud/Telegram chỉ kiểm tra `includes(...)`; một số test yêu cầu duy trì việc phát token xuống client. | Thay các kỳ vọng sai bằng kiểm thử hành vi, quyền truy cập và kết quả lưu thực tế trên emulator. |
| **P2** | Các nhánh admin cập nhật ba kho dữ liệu riêng; cloud luôn ghi đè local theo thứ tự merge, không theo version. Broadcast có bên phát nhưng chưa thấy bên nhận trong các module trọng yếu đã kiểm tra. | Một nguồn dữ liệu có thẩm quyền; cache theo version; BroadcastChannel chỉ báo dữ liệu cần tải lại. |
| **P2** | Phiếu đóng gói đưa `colorName`, một số định danh và số điện thoại vào HTML chưa escape đầy đủ; Telegram cũng có trường sản phẩm chưa escape. | Dùng `textContent` hoặc escape theo đúng ngữ cảnh. Kiểm thử dữ liệu chứa `<`, `>`, `&`, dấu nháy. |

PIN admin hiện chỉ là khóa giao diện bằng `sessionStorage`. Chưa có bằng chứng để kết luận Firestore production đang mở công khai, nhưng cũng chưa có bằng chứng xác nhận dữ liệu được bảo vệ đúng. Không được dùng PIN này làm căn cứ cấp quyền cloud.

Tuyên bố “toàn bộ asset dùng `?v=4.2`” cũng chưa đúng: các entrypoint đang dùng nhiều phiên bản query khác nhau.

**3. Kiến trúc được phê duyệt**

Giữ storefront tĩnh hiện tại. Bổ sung một backend nhỏ cho những việc cần thẩm quyền và giao dịch. Chọn Firebase Functions kết hợp Firestore để phù hợp hạ tầng đang có; không chuyển cả storefront sang Next.js trong đợt này.

Luồng chuẩn:

```text
Storefront
  → lưu nháp trên thiết bị
  → gửi yêu cầu tới Order API
  → server xác thực, kiểm tra SKU, tính giá
  → transaction ghi đơn + audit + notification outbox
  → trả xác nhận đã lưu
  → worker thông báo gửi Telegram

Admin
  → đăng nhập Firebase Auth
  → gửi command kèm expectedVersion
  → server kiểm tra quyền và chuyển trạng thái
  → transaction cập nhật đơn + audit + outbox

Trang tra cứu
  → gửi thông tin xác thực tới API
  → nhận projection công khai tối thiểu
```

Không đưa microservices, message broker riêng hay framework state management mới vào phạm vi này.

**Ranh giới bắt buộc:**

- `orders`: dữ liệu nội bộ, gồm PII; khách không được liệt kê hoặc tải toàn bộ collection.
- `audit`: server tạo, không cho client sửa hoặc xóa.
- `notification_outbox`: server quản lý, client không được truy cập.
- Catalog công khai chỉ chứa dữ liệu cần cho khách.
- Token bot nằm trong Secret Manager và chỉ bind vào function cần dùng. Firebase có cơ chế `defineSecret` cho trường hợp này. [Tài liệu Firebase](https://firebase.google.com/docs/functions/config-env)
- Admin dùng Firebase Auth và vai trò được cấp từ server; không tin `staffName`, `role` hay cờ đăng nhập do client gửi.
- Backend dùng Admin SDK vẫn phải tự kiểm tra quyền. SDK server bỏ qua Firestore Security Rules. [Tài liệu quyền truy cập Firestore](https://firebase.google.com/docs/firestore/security/rules-conditions)

Nếu chưa có tài khoản hoặc cấu hình cloud để triển khai, Worker vẫn hoàn thành code và kiểm thử emulator. Chế độ local phải ghi rõ “bản nháp trên thiết bị”, không giả thành công cloud.

**4. Contract mã nguồn và bất biến dữ liệu**

Các tên dưới đây là giao diện đích; Worker được điều chỉnh cách tổ chức file nhưng phải giữ hành vi.

```ts
type FulfillmentTrack =
  | 'in_stock'
  | 'print_on_demand'
  | 'needs_review';

type Result<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      code:
        | 'VALIDATION_ERROR'
        | 'UNAUTHORIZED'
        | 'FORBIDDEN'
        | 'VERSION_CONFLICT'
        | 'INVALID_TRANSITION'
        | 'STORAGE_UNAVAILABLE'
        | 'SERVICE_UNAVAILABLE';
      message: string;
      retryable: boolean;
    };

interface CreateOrderInput {
  clientRequestId: string;
  channel: 'cod' | 'zalo';
  items: Array<{
    productId: string;
    variantId: string;
    qty: number;
    personalization?: {
      text: string;
      fontId: string;
    };
  }>;
  customer: {
    name: string;
    phone: string;
    address?: string;
    note?: string;
  };
}

interface OrderCommand {
  commandId: string;
  orderId: string;
  expectedVersion: number;
  type: string;
  payload: unknown; // Phải được validate bằng schema theo từng type.
}
```

Không nhận giá, mức giảm, `fulfillmentTrack`, trạng thái, người thao tác hoặc tổng thanh toán từ client như dữ liệu có thẩm quyền.

**Bất biến bắt buộc:**

1. Tiền VND dùng số nguyên an toàn; số lượng hữu hạn, nguyên dương và có giới hạn.
2. Server kiểm tra SKU/biến thể còn bán, tính lại giá, giảm giá và phí giao.
3. Lưu snapshot tên, biến thể, giá và tùy chỉnh tại thời điểm đặt. Sửa catalog không được làm đổi đơn cũ.
4. `clientRequestId` được giữ ổn định khi retry. Backend thực hiện idempotency nguyên tử, có phạm vi theo người gửi/phiên đã xác thực.
5. Cùng khóa và cùng nội dung trả cùng đơn; cùng khóa nhưng nội dung khác phải báo xung đột.
6. Không cấp quyền xem đơn chỉ vì người gọi biết `clientRequestId`.
7. Mỗi command thành công tăng `version`; retry cùng `commandId` không tăng thêm version và không tạo thêm audit/outbox.
8. Đơn, audit và outbox được ghi cùng transaction.
9. Actor lấy từ danh tính server xác thực; thời gian nghiệp vụ dùng server timestamp.
10. Không gọi Telegram hoặc side effect bên ngoài trong transaction. Firestore có thể chạy lại transaction callback khi xung đột. [Tài liệu transaction](https://firebase.google.com/docs/firestore/manage-data/transactions)

Thuật toán xử lý command:

```text
Xác thực → validate → kiểm tra quyền
→ transaction:
    kiểm tra command đã xử lý
    đọc đơn và dữ liệu liên quan
    kiểm tra expectedVersion
    kiểm tra điều kiện chuyển trạng thái
    tính trạng thái mới
    ghi đơn, audit, outbox và kết quả command
→ trả kết quả đã commit
```

Không tự retry một command lỗi thời bằng cách bỏ `expectedVersion`.

**5. Vòng đời đơn, tồn kho và thay đổi yêu cầu**

**Phân luồng:**

- `in_stock`: mọi dòng đã xác định biến thể, đủ tồn khả dụng và không cần chế tác thêm.
- `print_on_demand`: có dòng cần in/chế tác, các dòng còn lại đã xác định.
- `needs_review`: thiếu thông tin tồn kho, biến thể hoặc quy trình.
- Đơn không có sản phẩm bị từ chối.
- `isCustomizable` chỉ thể hiện khả năng cá nhân hóa, không đồng nghĩa khách đã yêu cầu cá nhân hóa.
- Đơn hỗn hợp được theo dõi theo dòng; phiên bản này chỉ giao khi toàn bộ dòng sẵn sàng.

**Luồng thông thường:**

```text
request_received → confirmed

Hàng sẵn:
confirmed → ready_to_pack → shipped → delivered

Cần chế tác:
confirmed + productionState=queued
→ in_production
→ quality_check
→ ready_to_pack
→ shipped
→ delivered
```

Nút “Đưa vào hàng đợi” không được báo “đang in” trước khi xưởng thực sự bắt đầu. Chưa thấy tích hợp máy Bambu trong đường đi đã kiểm tra; cập nhật trạng thái không phải lệnh điều khiển máy.

Có thể giữ thao tác một chạm `confirm_and_route`: server kiểm tra và ghi nhận việc xác nhận cùng bước phân luồng trong một transaction. Không dùng cách này để bỏ qua tồn kho hoặc QC.

**Tình huống biên phải có command riêng:**

| Tình huống | Hành vi bắt buộc |
|---|---|
| Đổi màu/tên trước chế tác | Tạo revision, lưu trước/sau, tính lại giá và tồn kho; yêu cầu khách xác nhận khi thay đổi giá hoặc mẫu |
| Đổi khi đã in | Tạo yêu cầu thay đổi và quyết định của xưởng; không sửa âm thầm snapshot đang sản xuất |
| Hủy trước giao | Ghi lý do, giải phóng reservation chưa sử dụng; không tự hoàn nguyên vật liệu đã tiêu hao |
| Hủy sau khi gửi vận chuyển | Đi qua quy trình thu hồi/hoàn trả; không chuyển trực tiếp thành “chưa xử lý” |
| Hoàn trả | Có hồ sơ và trạng thái riêng; ghi nhận nhận hàng thực tế, QC và quyết định nhập lại kho |
| Hoàn tiền | Theo dõi riêng với vận chuyển; hàng trả về không đồng nghĩa đã hoàn tiền |
| Tạm giữ | Lưu trạng thái cần quay lại và điều kiện tiếp tục; kiểm tra lại khi resume |

`delivered` không được chuyển lại `in_production`. Nhu cầu làm lại phải tạo công việc thay thế có liên kết và lịch sử riêng.

Audit phải có `eventId`, `commandId`, `orderId`, version trước/sau, actor UID, thời gian server, loại thao tác, phần thay đổi và lý do. Timeline khách chỉ nhận thông tin đã chọn để công khai; không nhận nguyên audit hoặc ghi chú nội bộ.

**6. Đồng bộ, offline, tra cứu và Telegram**

**Nguồn dữ liệu và offline**

- Firestore qua backend là nguồn có thẩm quyền của đơn đã tiếp nhận.
- Local draft và cache không được ghi đè trạng thái cloud bằng phép spread theo thứ tự.
- Tách trạng thái đồng bộ `local_draft / pending_sync / committed / conflict / failed` khỏi trạng thái chế tác.
- Offline chỉ được báo “đã lưu trên thiết bị”; chỉ chuyển sang “xưởng đã nhận” sau ACK từ server.
- Nếu lưu nháp thất bại, giữ giỏ hàng và hiển thị lỗi có thể xử lý.
- Command admin offline được lưu như yêu cầu chờ gửi; sau khi có mạng phải kiểm tra lại version.
- BroadcastChannel chỉ gửi định danh/version để bên nhận tải lại; không gửi PII hay token.
- Giữ hàm `unsubscribe`, gọi khi đăng xuất; không để listener tiếp tục cập nhật dữ liệu sau logout.
- Trạng thái “Cloud đã kết nối” phải dựa trên kết quả thực, không đặt trước khi listener thành công.

Migration từ ba kho local cũ phải có bản xuất dự phòng, dry-run và báo cáo xung đột. Không tự tải mọi draft cũ lên cloud vì có nguy cơ tạo lại đơn đã xử lý.

**Tra cứu**

- Dùng token ngẫu nhiên mạnh, kiểm tra ở server; lưu hash thay cho token thô trong dữ liệu tra cứu.
- Không dùng một chữ số, bốn số cuối hay số điện thoại đơn thuần làm bí mật truy cập.
- Không trả token trong projection; không cho liệt kê đơn.
- Có giới hạn thử sai và phản hồi không giúp dò đơn tồn tại.
- Không gửi token, điện thoại, địa chỉ, chữ cá nhân hóa hoặc URL chứa token vào Analytics/log.
- Hoạt động qua hai thiết bị độc lập, không phụ thuộc localStorage của máy đặt hàng.

**Telegram**

- Client không còn `sendMessage`, `getUpdates`, nhập token hoặc tải cấu hình chứa token.
- Loại bỏ cơ chế “lấy người chat gần nhất” để tự nhận làm chủ xưởng. Cách hiện tại không chứng minh quan hệ giữa số điện thoại nhập vào với Chat ID trả về.
- Đích nhận phải được cấu hình và xác minh trong quy trình dành cho admin.
- Outbox dùng khóa ổn định theo đơn/version/loại sự kiện; consumer có lease và retry hữu hạn.
- Escape mọi trường động, giới hạn nội dung; `sendMessage` giới hạn 4.096 ký tự sau xử lý entities. [Telegram Bot API](https://core.telegram.org/bots/api#sendmessage)
- Phân biệt thông báo đơn mới, xác nhận, tiến độ và hủy.
- Lỗi Telegram không rollback đơn đã commit.
- Không cam kết “exactly once”: mất ACK sau khi Telegram đã nhận có thể gây trùng khi retry. Ghi nhận tình trạng không chắc chắn và cung cấp thao tác xử lý.
- Không đặt nội dung riêng tư vào thông báo vượt nhu cầu vận hành.

Token đã xuất hiện trong stdin, source và artifact phải được thu hồi. Xóa khỏi file không thay thế việc thu hồi. Không tự force-push lịch sử Git để xử lý sự cố này.

**7. CRO, cá nhân hóa và hiệu năng**

**CTA và Zalo**

Phê duyệt hướng:

- CTA chính **“Đặt hàng COD”** khi backend đã sẵn sàng tiếp nhận.
- CTA phụ **“Tư vấn mẫu này qua Zalo”** cho người cần hỗ trợ.
- Hai CTA dùng chung snapshot sản phẩm và tùy chỉnh.
- COD cần địa chỉ giao hàng; luồng tư vấn Zalo không ép nhập địa chỉ ngay.
- Mở Zalo hoặc sao chép nội dung không được tính là đơn đã gửi.
- Khi chưa có backend, dùng nhãn “Chuẩn bị yêu cầu COD”; giữ giải thích rõ bản nháp chỉ nằm trên thiết bị.
- Bảo toàn cấu hình khi quay lại từ Zalo; có phương án sao chép thủ công khi Clipboard API không hoạt động.

**Preview**

Giữ preview hiện có làm nền tảng. Module cá nhân hóa đang có canvas 2D; không gọi đó là mô hình 3D chính xác nếu chưa có dữ liệu tương ứng.

Worker thống nhất snapshot giữa preview → giỏ → checkout → đơn → phiếu xưởng. Kiểm thử chữ tiếng Việt có dấu, font thiếu glyph, khoảng trắng, tên dài, màu và font. Giới hạn chữ lấy từ quy tắc từng SKU và hiển thị trước khi nhập; không cắt âm thầm sau khi khách xác nhận.

**Trust signals**

Hiển thị gần CTA giá cuối, phí giao, thời gian dự kiến và chính sách áp dụng. Cam kết đổi mới, freeship, giao trong ngày phải phù hợp khả năng vận hành thực tế. ETA cần phân biệt thời gian xưởng chuẩn bị với thời gian vận chuyển.

Bảng màu, monospace và sticky filter là lựa chọn thiết kế; chưa đủ chứng cứ gọi giao diện “đạt chuẩn Baymard” hoặc khẳng định tăng chuyển đổi.

Đo funnel theo sự kiện đã định nghĩa: xem sản phẩm → tùy chỉnh → bắt đầu checkout → lỗi → server tiếp nhận. Tách sự kiện mở Zalo khỏi đơn được ghi nhận.

**Hiệu năng**

Storefront đã có giới hạn tám sản phẩm ban đầu và “Xem thêm” tại [products-manager.js](<C:/Users/truongg/OneDrive - Thuyloi University/Tài liệu/02. T&T 3D studio/js/products-manager.js:477>). **Chưa phê duyệt virtual scroll.**

Phê duyệt:

- Admin phân trang 25–50 dòng, dùng cursor server.
- Thống kê độc lập với trang danh sách.
- Debounce tìm kiếm, loại bỏ sort lặp, chỉ render phần cần cập nhật.
- Đo lại viewer khi ẩn tab, mở/đóng nhiều lần và mất WebGL context.
- Kiểm tra listener/RAF có tăng qua nhiều chu kỳ hay không trước khi kết luận memory leak.
- Lưu trace trước/sau trên cùng thiết bị và cùng tập dữ liệu; không báo phần trăm tăng tốc khi chưa đo.

**8. Gói công việc cho Antigravity**

Các đường dẫn mới là đề xuất, không phải tệp đã tồn tại.

| Gói | Phạm vi triển khai | Điều kiện nghiệm thu | Phụ thuộc |
|---|---|---|---|
| **WP-1 — Cô lập bí mật** | Sửa `telegram-notifier.js`, `firebase-init.js`, admin và artifact guard; lập biên bản thu hồi token | Không còn token trong tài nguyên công khai, cấu hình cloud client, log hoặc fixture; chưa có token mới thì notification tắt rõ ràng | Không |
| **WP-2 — Backend và quyền** | Tạo `functions/`, cấu hình emulator, rules và xác thực admin; chốt schema API | Khách không đọc/list orders, sửa trạng thái, đọc audit/outbox/config; staff có quyền đúng; gọi API trực tiếp vẫn được kiểm tra | WP-1 |
| **WP-3 — Domain đơn hàng** | Tách transition, validation, tính tiền, phân luồng thành module thuần | Từ chối đơn rỗng, giá/qty sai, cạnh chuyển sai; phân luồng theo dữ liệu có thẩm quyền | WP-2 |
| **WP-4 — Transaction và audit** | Create API, command API, version, idempotency, reservation và outbox | Hai yêu cầu đồng thời không tạo trùng; hai admin cùng version chỉ một bên thành công; lỗi không ghi dở dang | WP-3 |
| **WP-5 — Checkout bền vững** | Sửa checkout/cart và thêm adapter API; giữ khóa retry, bảo toàn draft | Timeout rồi retry vẫn cùng đơn; chỉ báo tiếp nhận sau ACK; lỗi lưu không mất giỏ | WP-4 |
| **WP-6 — Admin, tracking, migration** | Gom các nhánh cập nhật; projection server; cache version; migration có dry-run | Hai phiên độc lập thấy cùng tiến độ; logout ngắt listener; local cũ không ghi đè cloud; không tự sinh demo | WP-4 |
| **WP-7 — Notification worker** | Consumer outbox, formatter, retry, trạng thái gửi và resend có kiểm soát | Telegram lỗi không mất đơn; payload được escape; timeout, retry và sự kiện trùng có hành vi xác định | WP-4 |
| **WP-8 — KPI và phân trang** | Truy vấn theo thời gian, tổng hợp đầy đủ, cursor; tách doanh thu khỏi giá trị đơn | Dữ liệu trên 50 đơn vẫn cho tổng đúng; lọc ngày theo `Asia/Ho_Chi_Minh`; không cộng đơn hủy/demo vào doanh thu | WP-6 |
| **WP-9 — CRO và preview** | CTA, biểu mẫu theo kênh, snapshot cá nhân hóa, funnel | Cấu hình không mất qua Zalo; preview khớp đơn; keyboard/mobile dùng được; không ghi nhận conversion giả | WP-5 |
| **WP-10 — Đóng gói và bàn giao** | Runner test, artifact gate, kiểm tra trình duyệt, runbook và rollback | Toàn bộ release gates bên dưới đạt, có log và bằng chứng | WP-1–9 |

Không chia nhỏ `admin.js` chỉ theo số dòng. Ưu tiên gom các quyết định đang lặp: cập nhật đơn, trạng thái, tiền và phân luồng. Các wrapper cũ có thể tồn tại trong quá trình chuyển đổi nhưng phải gọi cùng command service.

**9. Quy trình TDD và cổng phát hành**

Với mỗi thay đổi hành vi, Worker phải có test thất bại đúng nguyên nhân trước bản sửa, sau đó test xanh. Không sửa assertion để giữ thiết kế không an toàn.

Các ca bắt buộc:

- LocalStorage bị chặn/đầy, JSON hỏng, database rỗng.
- Timeout trước và sau server commit; double-click; reload rồi retry.
- Cùng idempotency key nhưng payload khác.
- Hai admin cạnh tranh cùng version.
- Người không có quyền gọi thẳng API.
- Token sai/rỗng; dấu `-`; một chữ số; đoán hậu tố điện thoại.
- Đơn đã giao bị yêu cầu quay lại in.
- Thay đổi màu khi đã bắt đầu sản xuất.
- Tồn kho không đủ, không rõ và đơn hỗn hợp.
- Snapshot cá nhân hóa đi xuyên toàn bộ luồng.
- Telegram bị timeout, từ chối, trả lỗi giới hạn và nhận sự kiện trùng.
- Trên 50 đơn, đơn hủy, hoàn tiền và mốc ngày theo múi giờ xưởng.
- Hai browser context có storage độc lập: context khách tạo đơn, context admin xử lý, khách tải lại thấy trạng thái mới.

Dùng unit test cho domain, Firestore Emulator cho transaction/rules, fake transport cho Telegram và browser test cho tương tác. Mock dịch vụ ngoài là hợp lệ; không được coi mock thành công là bằng chứng tích hợp production.

Worker bổ sung runner có exit code tổng hợp vì `package.json` hiện chưa có `test`. Giữ các test cũ còn đúng; thay rõ những test đang bắt buộc phát token xuống client.

**Chỉ phát hành khi:**

1. Token cũ đã được thu hồi; token mới chỉ tồn tại phía server.
2. Không còn P0/P1 mở trong luồng được phát hành.
3. Test hành vi, quyền và transaction đạt; có kiểm tra hai context độc lập.
4. `build:static` đạt trên bản sửa; scan artifact trước promotion, kiểm tra lại hash sau đóng gói.
5. Preflight bổ sung `firebase-init.js` và kiểm tra mọi tham chiếu tài nguyên local từ HTML/CSS/JS.
6. Asset version được sinh từ build ID hoặc content hash, không thay số query thủ công từng file.
7. Kiểm tra console, network, mobile, Zalo thực và phiếu in A4/A5.
8. Có migration, rollback và runbook vận hành; không rollback về artifact chứa token đã lộ.

Báo cáo bàn giao phải ghi commit, diff, lệnh đã chạy, exit code, test thất bại trước sửa, kết quả sau sửa, tình trạng migration và những bước cloud chưa thực hiện. Không dùng “18/18 PASS”, SHA-256 hoặc ảnh giao diện thay cho bằng chứng quyền truy cập và lưu đơn bền vững.

**Lệnh thực thi cho Worker:** Bắt đầu WP-1, tiếp tục tuần tự theo dependency đã nêu. Hoàn thành code và kiểm thử local/emulator trong phạm vi này; giữ nguyên các thay đổi không liên quan, không tự commit/push/deploy. Phê duyệt hiện tại dành cho phương án triển khai, chưa phải xác nhận các bản sửa hoặc điều kiện production đã hoàn tất.