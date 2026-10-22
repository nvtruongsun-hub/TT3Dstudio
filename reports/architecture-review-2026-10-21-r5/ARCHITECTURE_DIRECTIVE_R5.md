# BẢN CHỈ THỊ PHÊ DUYỆT KIẾN TRÚC & MÃ NGUỒN CHI TIẾT

**Số hiệu:** TT3D-ARCH-20261021-R5 — Thẩm định hồ sơ nghiệm thu R4  
**Ngày ban hành:** 21/10/2026, Asia/Saigon  
**Đơn vị ban hành:** Codex Master Controller  
**Đơn vị thi hành:** Antigravity Worker  
**Đầu vào:** CODEX_BRIDGE trong stdin; HANDOVER_R4.md; chỉ thị R4; mã nguồn, kiểm thử và dist hiện có.  
**Quyết định:** **APPROVED FOR COMPLETION — NOT READY FOR HANDOVER**.

🎯 **[Auto-Router]** Nhóm 3: thẩm định kiến trúc Web | Skill đã đọc: computer-use:computer-use | Engines: PowerShell, Node.js; CUA không có browser kết nối. Các skill review ánh xạ trong AGENTS.md không tìm thấy trong catalog/thư mục skill đã kiểm tra. Không có tool Argon hoặc Antigravity gọi được trong phiên; không tuyên bố đã hội ý hay gửi lệnh trực tiếp cho Worker.

## 1. Quyết định có hiệu lực ngay

**Phê duyệt tiếp tục kiến trúc Static SPA và mỹ thuật Tactile Industrial Minimalism. Công nhận phần sửa R4 đã được xác minh dưới đây. Chưa xác nhận đóng hoàn toàn R4-01 đến R4-05, chưa xác nhận B01–B10 đạt nghiệm thu browser, chưa cấp READY FOR HANDOVER.**

Đây là kết luận kiểm định có phát hiện cụ thể, không phải yêu cầu người dùng phê duyệt thêm. Worker được thực hiện ngay các sửa đổi có phạm vi tại mục 5, giữ nguyên contract dữ liệu và kiến trúc đã thống nhất. Lượt thẩm định này chỉ tạo hồ sơ và chương trình kiểm định; không sửa mã sản phẩm, không rebuild dist thật, không deploy và không gửi tin Zalo.

Quyết định gắn với snapshot:

| Đối tượng | Giá trị xác minh |
|---|---|
| Manifest | `dist/artifact-manifest.json` |
| SHA-256 manifest | `fbac352e248e929900c5b261dcfac6dab7b94ea30cdde0bc9c1a6962fde48f56` |
| Payload | 103 tệp, cộng manifest là 104 tệp |
| Source–artifact | 0 drift theo toàn bộ payload manifest |
| HANDOVER_R4 SHA-256 | `94bda3edeff20e8427563ddb8f05c21e07bbd3b332025120e18823526f8ae225` |
| package-lock SHA-256 | `81a3f18424a69bb66b190b54fca74fe81f6b04ca45c6a38d21a28882b00ed32e` |
| Toolchain đã đọc | Node v24.20.0; Tailwind khai báo/cài đặt 3.4.19; có lockfile |

Không dùng kết luận APPROVED của Argon trong bridge làm bằng chứng nghiệm thu phiên bản này. Đoạn đó nói đến 70 test/9 JS và lookup bằng điện thoại, khác contract hiện tại. Phân tích đối thủ và các repo automation là đầu vào định hướng; lượt này không tái khảo sát các website/repo đó và không dùng chúng để chứng minh chất lượng phát hành.

## 2. Kết quả độc lập thực chạy

Các bản probe/verify được sao chép sang thư mục R5 để không ghi đè log lịch sử R3/R4. `runner-evidence.json` lưu kết quả tool chạy thực tế; mọi dữ liệu khách dùng trong probe đều tổng hợp trong VM.

| Phép kiểm | Kết quả mới | Bằng chứng và giới hạn |
|---|---:|---|
| Audit R2 | 5/5, exit 0 | [audit-r2.log](audit-r2.log), VM |
| Audit regressions | 19/19, exit 0 | [regressions.log](regressions.log), VM |
| Behavior nguyên bản | **13/15, exit 1** | [behavior.log](behavior.log), hai ca 6/9 lỗi `setTimeout is not defined` |
| Tab architecture | 26/26, exit 0 | [tabs.log](tabs.log), kiểm tra tĩnh |
| E2E simulation | 6/6, exit 0 | [static-simulation.log](static-simulation.log), kiểm tra tĩnh, không phải browser E2E |
| Tổng nền nguyên bản | **69/71** | Không được công bố lần chạy hiện tại là 71/71 |
| Probe R4 | 18/18, exit 0 | [r4-findings.json](r4-findings.json), HTML-derived DOM stub |
| Verify kế thừa R3 | 25/25 assertion PASS; **exit tổng 1** | [verification.json](verification.json); exit phản ánh suite behavior đang lỗi |
| JS syntax | 26/26, exit 0 | [syntax.log](syntax.log), node --check gọi trực tiếp từ PowerShell |
| Manifest | 103 payload, đúng hash/size và danh sách | Assertion manifest trong verification.json; 0 drift trong [snapshot.json](snapshot.json) |
| Kiểm định bổ sung | **2 PASS / 11 FAIL** | [adversarial-findings.json](adversarial-findings.json), 13 assertion; lặp source/dist nên không phải 11 lỗi độc lập |
| Chẩn đoán VM timer | 15/15, exit 0 sau cấp timer cho mock | [fixture-diagnostic.json](fixture-diagnostic.json); không thay thế kết quả lệnh behavior nguyên bản |
| Browser thực tế phiên này | **UNVERIFIED** | CUA apps=[], browsers=[]; thử mở IAB ẩn trả `Browser is not available: iab` |

Chẩn đoán timer giữ nguyên assertion nghiệp vụ, chỉ cấp hàng đợi setTimeout/clearTimeout cho mock browser. Hai callback focus không được thực thi trong chẩn đoán này. Điều đó xác định thiếu fixture; chưa có căn cứ kết luận hai luồng nghiệp vụ hỏng trên browser. Worker phải cập nhật test harness chính thức và chạy lại lệnh nguyên bản.

Một thử nghiệm syntax qua Node spawnSync lồng không tạo được tiến trình con và trả status null. Đã chạy lại bằng PowerShell trực tiếp, đủ 26 exit code 0; không tính thử nghiệm spawn đó là lỗi cú pháp. Hồ sơ lưu cả lần thử trong runner-evidence.

Không chạy clean `npm ci` hoặc hai build thật trong lượt này. Test builder bổ sung dùng compiler giả có chủ đích, chỉ kiểm control flow preflight/copy và giữ dist; không chứng nhận Tailwind compile hoặc tính tái lập build thật.

## 3. Quyết toán từng hạng mục R4

| Hạng mục | Phần được công nhận | Phần chưa đóng | Trạng thái |
|---|---|---|---|
| R4-01 | Preview readonly có label; notes input không bị ghi đè; prepare/copy không tự mở Zalo; fallback copy trung thực; CAD không vào giỏ định giá | Message builder tự xóa ghi chú chứa cụm tiêu đề; helper còn đọc biến ngoài snapshot | **PARTIAL — OPEN** |
| R4-02 | Đã bỏ href Zalo số cố định trong HTML; binder trực tiếp xử lý null; resolver dùng nguồn chung | Không nghe tt_config_updated cùng trang; CAD đã chuẩn bị giữ link cũ khi config đổi; phải kiểm cả link có message | **PARTIAL — OPEN** |
| R4-03 | Exact Tailwind 3.4.19, lockfile, CSS local, manifest khớp | 6 JS runtime chưa preflight; copy lỗi làm mất dist tốt; chưa staging/rollback; lỗi realpath bị bỏ qua; chưa có hai build thật/failure tests đủ | **PARTIAL — OPEN** |
| R4-04 | Hồ sơ có bảng kết quả tự báo cáo | Không có bằng chứng browser truy xuất được; thiếu nhiều nhánh trong ma trận; WebGL exception chưa được chặn | **UNVERIFIED — OPEN** |
| R4-05 | Đã xác minh sampleOrders là []; probe không còn field password mẫu cũ | Hồ sơ còn tuyên bố trọn vẹn/71 PASS/exit 0 không khớp lần chạy mới; thiếu addendum và evidence browser | **Dữ liệu seed PASS; hồ sơ OPEN** |

### Phát hiện đã tái hiện

1. **P1 — Mất nội dung ghi chú trong yêu cầu CAD.** `js/calculator.js:179`–message builder: nếu ghi chú chứa `YÊU CẦU BÁO GIÁ IN 3D`, cleanNotes bị đổi thành chuỗi rỗng. Fixture: `SYNTHETIC: khắc chữ YÊU CẦU BÁO GIÁ IN 3D trên bảng`. Input còn nguyên nhưng preview không chứa yêu cầu của khách. Probe 18/18 chỉ thử ghi chú đơn giản nên bỏ sót.
2. **P1 — Zalo link cũ tồn tại sau cập nhật cấu hình.** `js/config.js:203` phát `tt_config_updated`; `js/app.js:841` chỉ nghe storage. VM chạy cả config/app/calculator xác nhận có 0 handler cho tt_config_updated. Sau config valid → không có số hợp lệ, link xưởng và link CAD đã chuẩn bị vẫn có href cũ. Gọi binder thủ công chỉ sửa nhóm link chung, không sửa CAD.
3. **P1 — Build có thể xuất bản thiếu runtime.** `scripts/build-static-artifact.js:24` thiếu preflight cho `js/art-presets.js`, `js/image-uploader.js`, `js/purchase-config.js`, `js/products-manager.js`, `js/viewer3d.js`, `js/admin.js` dù HTML tham chiếu. Bản sao fixture thiếu products-manager vẫn exit 0, có manifest và báo BUILD HOÀN TẤT. Compiler được stub thành công để cô lập lỗi preflight.
4. **P1 — Không giữ artifact cuối khi copy lỗi.** Builder `:111` xóa dist rồi mới copy. Inject lỗi copy một tệp assets trong fixture: exit 1, dist tốt mất, dist mới dở dang, không manifest. Exit nonzero không đáp ứng yêu cầu giữ/phục hồi artifact. Builder cũng nuốt mọi lỗi realpath tại `:71`, và chưa bảo vệ đầy đủ nguồn trước compile/copy.
5. **P1 — B08 chưa có failure containment.** `js/viewer3d.js:36` im lặng return khi thiếu THREE; `:56` tạo WebGLRenderer ngoài try/catch. Gọi handler DOMContentLoaded với renderer giả ném lỗi xác nhận exception thoát ra ở cả source/dist. Đây là VM reproduction, chưa phải browser WebGL failure test. Không tìm thấy vùng fallback lỗi tương ứng sát canvas trong HTML.
6. **P1 — Gói nghiệm thu chưa tái lập được trạng thái xanh.** Hai ca behavior nguyên bản thiếu timer trong fixture. Các file runner-evidence/verification có sẵn tại thư mục R4 chứa thời gian cũ; không dùng thay cho lần chạy mới của snapshot đang xét. HANDOVER_R4 không liên kết ảnh, trace, HAR hoặc console/network log cho từng B-case.

## 4. Ma trận nghiệm thu B01–B10

Không xác nhận hoặc phủ nhận việc Worker từng thao tác browser ngoài hồ sơ. Kết luận ở đây là bằng chứng nộp trong workspace chưa đủ để kiểm toán. Không có artifact ảnh/trace/HAR/console/network browser được tìm thấy trong phạm vi reports đọc được; tồn tại một thư mục tmp của báo cáo cũ không đọc được, không suy diễn nội dung bên trong.

| Mã | Đánh giá bằng chứng đang nộp | Trạng thái duyệt và phần phải bổ sung |
|---|---|---|
| B01 | Một giá trị width 390 được dùng chung cho mô tả 390 và 360; không có ảnh desktop/ba viewport hay back/forward | **UNVERIFIED**. 1440×900, 390×844, 360×800; 4 view; hash/back/forward; ảnh CTA và dock không che nhau |
| B02 | Có mô tả cô lập A/B; chưa có trace checkout giỏ và double submit | **UNVERIFIED**. Hai nguồn direct/cart, giỏ B còn, ghi đúng một draft/mã khi click đôi |
| B03 | Có mô tả quota/retry; chưa có browser trace denied/read/write và fixture | **UNVERIFIED**. Quota và SecurityError; giữ form/giỏ/mã; retry đúng một record |
| B04 | Chỉ mô tả exact projection; thiếu browser partial/phone/no-match/null resolver | **UNVERIFIED**. Kiểm mọi nhánh và không lộ PII; VM lookup/projection hiện PASS |
| B05 | Có mô tả preview và notes đơn giản; chưa có copy success/reject/absent thực tế | **UNVERIFIED**, có lỗi ghi chú trong VM. Thêm phrase fixture, null recipient sau prepare và không auto-open |
| B06 | Chỉ hai cặp màu, thiếu mọi trạng thái và nền composite | **UNVERIFIED**. Hai theme; normal/hover/active/focus; lưu computed style và phép tính theo nền thực |
| B07 | Có tuyên bố focus trap, chưa có trace bàn phím/focus/scroll | **UNVERIFIED**. Tab/Shift+Tab/Escape, opener return, scroll restore cho cart/product/checkout và lúc chuyển lớp |
| B08 | Chỉ happy path canvas; chưa có chặn CDN/WebGL | **UNVERIFIED**, exception WebGL tái hiện trong VM. Chặn THREE/OrbitControls, context creation failure/lost, fallback; store/checkout tiếp tục dùng |
| B09 | CSS local đúng ở tĩnh; không có cold profile/network log | **UNVERIFIED**. Storage trống, Play CDN bị chặn; catalog/registry/ảnh; lưu console và network lỗi dự kiến/còn tồn tại |
| B10 | Kiểm toàn vẹn tĩnh độc lập PASS: 103 payload, 0 drift | **PASS phần tĩnh; UNVERIFIED gắn browser**. Manifest SHA của chính artifact đã test phải nằm trong từng session evidence |

Tỷ lệ màu C44800 trên F8F9FA tính từ token opaque khoảng 4.66:1, không phải bằng chứng computed của toàn bộ UI. Không suy rộng PASS cho cả site. Không gọi B09 là offline hoàn toàn: HTML còn Google Fonts, Font Awesome 6.5.1, Three r128 và OrbitControls 0.128.0 từ CDN.

## 5. Lệnh triển khai chi tiết cho Antigravity

### R5-01 — Hoàn tất R4-01, giữ đầy đủ nội dung khách

**File:** js/calculator.js; test CAD hiện có và test R4 mở rộng. Không cần thay thiết kế UI.

- Bỏ nhánh `cleanNotes.includes(...) → ''`. Bảo toàn nguyên văn nội dung sau giới hạn trim/length đã công bố; không lọc dữ liệu chỉ vì trùng tiêu đề. Việc chống lồng request phải đến từ tách preview khỏi input.
- Thêm requestMode vào snapshot calculateConfigurator; buildCadQuoteMessage chỉ đọc đối số, không đọc configStep1Choice hoặc DOM/state ngoài hàm.
- Giữ prepare chỉ dựng preview, copy chỉ copy sau khi clipboard promise resolve, mở Zalo chỉ từ thao tác link riêng. Không tự upload file hoặc tạo giá CAD.
- Giữ preview readonly có nhãn, status aria-live, focus/select manual fallback. Không dùng dữ liệu khách trong innerHTML.
- Test: notes thông thường, notes chứa nguyên cụm tiêu đề, notes markup/quotes/newline, gọi prepare nhiều lần; input giữ nguyên và message chứa đúng notes. Khi khách tự gõ tiêu đề, không dùng tổng số lần xuất hiện tiêu đề làm assertion chống lồng; so cấu trúc request và nội dung snapshot.

Contract mẫu:

```js
function buildCadQuoteMessage(snapshot) {
  const notes = String(snapshot.notes ?? '').trim();
  const requestMode = snapshot.requestMode;
  // Dựng chuỗi chỉ từ snapshot; giữ notes ngay cả khi chứa tiêu đề request.
  // File selected locally và requestMode quyết định mô tả file.
  return composeMessage({ ...snapshot, requestMode, notes });
}
```

composeMessage là tên minh họa, Worker có thể giữ template literal hiện tại; không tạo framework mới chỉ để dùng mẫu này.

### R5-02 — Hoàn tất R4-02, cập nhật link theo config hiện tại

**File:** js/app.js, js/calculator.js, js/checkout.js nếu cần cho link handoff có message.

- Bổ sung listener cùng trang `tt_config_updated`; giữ storage event cho tab khác. Cả hai gọi cùng một refresh có thứ tự xác định.
- Tách đăng ký link với message provider và thao tác bind. Có thể dùng WeakMap cho provider; link chung trả chuỗi rỗng, CAD trả message snapshot đã chuẩn bị, checkout trả message draft hiện tại.
- Khi config valid → null: mọi link xưởng đang hiển thị phải gỡ href/target và có aria-disabled. Khi null → valid hoặc đổi số: cập nhật đúng số mới, giữ nguyên message/preview/notes. Không gọi prepare/copy/open để refresh link.
- Không để binder rỗng ghi đè query message của CAD/checkout. Không áp binder xưởng cho link Zalo khách trong admin.
- Giữ getZaloPhone là nguồn quyết định recipient; không thêm số fallback vào consumer. Hotline tel xử lý đúng nghĩa riêng.
- Test source và artifact: same-tab saveConfig, cross-tab storage, valid → null → valid, đổi số hợp lệ, resolver vắng, +84, ứng viên đầu sai/ứng viên sau đúng. Kiểm cả CAD và checkout đã chuẩn bị trước lúc đổi config.

Thứ tự mẫu:

```js
function refreshShopContacts() {
  bindAllShopZaloLinks();
  refreshPreparedCadContact();
  refreshPreparedCheckoutContact();
}
window.addEventListener('tt_config_updated', refreshShopContacts);
window.addEventListener('storage', event => {
  if (event.key === 'TT_STUDIO_CONFIG' || event.key === null) refreshShopContacts();
});
```

Các hàm refresh phải là API rõ ràng giữa module, dùng message hiện có và resolver mới; chỉ gọi khi hàm có mặt, không truy cập state private bằng eval.

### R5-03 — Hoàn tất R4-03, build có giao dịch và kiểm đủ runtime

**File:** scripts/build-static-artifact.js, README.md; giữ package.json/lock chính xác nếu không đổi dependency.

1. Preflight mọi local src/href runtime từ cả hai HTML, CSS input/config, registry/catalog và tài nguyên bắt buộc. Tối thiểu bổ sung sáu JS đã liệt kê. Không dùng `js/viewer.js` sai tên; runtime thực là `js/viewer3d.js`.
2. Fail trước khi thay dist khi file thiếu/rỗng/không regular file hoặc reference không hợp lệ. Kiểm realpath cho nguồn, output, ancestor; từ chối symlink/junction/reparse không được phép, kể cả entrypoint root và CSS output. Không nuốt lỗi realpath trừ ENOENT của đích mới đã xác minh ancestor.
3. Dùng staging sibling riêng nằm trong workspace. Copy input theo allowlist, compile CSS vào staging, kiểm CSS/class runtime và tài nguyên; sinh/hash/validate manifest ở staging. Không ghi CSS lên source khi đang chỉ đóng gói release.
4. Chỉ promote sau validate thành công. Giữ dist tốt bằng backup/rename và rollback nếu promote thất bại. Cách swap phải phù hợp Windows; không tuyên bố hai rename là giao dịch nguyên tử tuyệt đối. Không xóa backup trước khi dist mới được xác nhận hợp lệ.
5. Mọi recursive delete/move phải kiểm absolute path và realpath/ancestor thuộc đúng workspace/staging/backup của tác vụ; không xóa theo đường dẫn tùy ý hoặc đi qua link. Khi lỗi, exit nonzero và giữ/phục hồi bản tốt. Cleanup chỉ đụng thư mục tạm của chính build.
6. Thử trong bản sao riêng: thiếu products-manager và các entrypoint khác, compile fail, copy fail, validate fail, promote fail. So hash toàn bộ dist cũ trước/sau lỗi, không chỉ kiểm exit code.
7. Chạy `npm ci` bằng lock ở checkout/bản sao độc lập, rồi build thật hai lần cùng snapshot/lock. So bảng path/size/hash payload; chỉ bỏ qua buildTimestamp của manifest. Không thay lock bằng `npm install` không kiểm soát và không nâng major trong đợt này.
8. Kiểm class động bằng token đầy đủ hoặc safelist hẹp; không coi content js glob là chứng minh mọi class ghép động đã emit. README ghi npm ci, build:static, phục vụ dist; nêu đủ external fonts/CDN và fallback thực tế.

Flow được duyệt:

```text
preflight nguồn + path → staging riêng → compile CSS staging
→ copy/validate runtime → manifest + hash validation
→ giữ dist cũ → promote staging → verify → cleanup bản tạm
                         lỗi → rollback dist tốt + exit nonzero
```

### R5-04 — Hoàn tất R4-04/B08 và phục hồi cổng test nền

**File:** js/viewer3d.js, index.html/css/style.css nếu cần fallback; tests/test_behavior.js.

- Bao khởi tạo viewer bằng try/catch ở ranh giới module. Khi THREE/CDN/WebGL không có, hiển thị thông báo sát canvas: xem 3D chưa khả dụng, vẫn có thể xem ảnh/chọn sản phẩm; cung cấp thao tác quay lại cửa hàng hoặc thử lại phù hợp.
- Quản lý state unavailable/ready/lost. Không chạy resize/render/model action trên renderer chưa sẵn sàng. Khi context mất, dừng loop phù hợp; cleanup tài nguyên khởi tạo dở và listener; retry không tạo nhiều renderer/loop.
- OrbitControls thất bại phải có degraded state rõ; giữ cặp thư viện r128/0.128.0 hiện có. Không nâng một nửa và không hứa đo kích thước/slicer thật.
- Không để lỗi 3D làm các handler store/checkout không đăng ký hoặc ngừng hoạt động. Kiểm bằng browser với CDN blocked, renderer/context failure và resize/chuyển tab sau lỗi.
- Sửa createMockBrowser trong behavior suite bằng timer stub/queue phù hợp và DOM fixture ổn định. Giữ assertion ca 6/9, await submit khi cần và kiểm số record/mã/giỏ thực. Không xóa bài test hoặc chèn guard `typeof setTimeout` vào sản phẩm chỉ để né fixture thiếu.
- Chẩn đoán fixture tại R5 là gợi ý nguyên nhân, không phải bản vá test đã nghiệm thu. Chạy lại chính lệnh `node tests/test_behavior.js` phải 15/15 và exit 0.

### R5-05 — Hoàn tất R4-05 và bằng chứng B01–B10

**Hồ sơ:** tạo HANDOVER_R5.md cùng evidence; không sửa log lịch sử R1–R4 để làm xanh.

- Ghi addendum sửa nhận định 71/71 và 25-check exit 0 theo kết quả snapshot mới. Tách baseline, assertion acceptance, syntax, build và browser; không cộng chúng thành một tổng test đánh đồng.
- Giữ sampleOrders=[] trong public build. Không xóa storage thật để đạt cold test; dùng profile/storage fixture riêng. Không ghi PII hoặc secrets thật vào ảnh/log.
- Hồ sơ phải có browser/version, UTC/timezone, viewport, URL HTTP dist, fixture, bước UI, expected/actual, PASS/FAIL/UNVERIFIED, manifest SHA-256 và link file evidence cho từng B-case.
- Lưu ảnh desktop/mobile; trace hoặc transcript thao tác có kết quả; focus/clipboard computed checks; console stack/request failures; network/HAR hoặc bản log tương đương. Clipboard mock/permission injection phải ghi rõ; không trình mock là quyền clipboard người dùng thật.
- Chặn mạng có chủ đích phải ghi lỗi dự kiến và fallback; không yêu cầu giả tạo zero network errors. B09 mô tả cold storage + CSS local, không hứa offline mọi chức năng.
- B10 kiểm manifest chính artifact đã chạy browser; sửa nguồn sau test phải rebuild và chạy lại phần bị ảnh hưởng. Manifest public không chứa reports/tests/source thử nghiệm hoặc dữ liệu nội bộ.
- Ghi chính xác tính năng: draft lưu trên thiết bị, chưa gửi tới xưởng; CAD chọn file local, khách tự đính kèm qua Zalo; 3D mô phỏng. Không khôi phục lookup điện thoại, lời hứa bảo mật tuyệt đối hoặc tuyên bố tiến độ máy in từ localStorage.
- Các thông số vật liệu/dung sai/bảo hành và tuyên bố số máy/số khách cần căn cứ vận hành hoặc diễn đạt có điều kiện theo chỉ thị R4. Không tự đặt chính sách kinh doanh mới.

## 6. Trình tự thi hành và cổng phê chuẩn cuối

1. Lưu diff/snapshot của source/test/config/lock và artifact; workspace có nhiều thay đổi sẵn, không reset hay ghi đè ngoài phạm vi.
2. Hoàn tất R5-01/R5-02, timer fixture và viewer fallback; bổ sung assertion nhắm đúng các ca thất bại trong adversarial-findings. Giữ các probe hiện có, không hạ tiêu chí để test xanh.
3. Hoàn tất build transaction; chạy failure-path tests trong bản sao, clean install và hai build thật. Lập log/mã thoát và digest payload.
4. Chạy baseline nguyên bản, syntax source/dist, probe/verify đã cập nhật fixture đúng contract. Verify tổng phải exit 0; không chỉ trích 25 assertion xanh khi suite nền còn đỏ.
5. Nghiệm thu B01–B10 trên artifact cuối ở browser thực, profile test riêng. Chỉ dừng server do tác vụ tạo; không đóng browser/tiến trình của người dùng.
6. Nộp HANDOVER_R5, diff theo file, lockfile và lệnh build, failure tests, manifest/snapshot, raw logs, evidence browser và bảng từng R4/B-case.
7. Codex chỉ cấp **READY FOR HANDOVER** khi toàn bộ mục chặn được đóng bằng bằng chứng của cùng artifact cuối. Phê chuẩn này không đồng nghĩa đã deploy, gửi yêu cầu Zalo hay xác nhận đơn hàng tới xưởng.

**Lệnh bàn giao cho Worker:** Thi hành TT3D-ARCH-20261021-R5 trong phạm vi trên ngay. Giữ Static SPA và nhận diện thương hiệu. Sửa mất notes trong message, config refresh của mọi link xưởng, preflight/staging/rollback build, viewer fallback và fixture timer; nộp bằng chứng browser B01–B10 gắn manifest cuối. Trạng thái chính thức hiện tại: **APPROVED FOR COMPLETION — NOT READY FOR HANDOVER**.
