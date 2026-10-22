# BẢN CHỈ THỊ PHÊ DUYỆT KIẾN TRÚC & MÃ NGUỒN CHI TIẾT

**Số hiệu:** TT3D-ARCH-20261021-R4  
**Ngày ban hành:** 21/10/2026 — Asia/Saigon  
**Đơn vị ban hành:** Codex Master Controller  
**Đơn vị thi hành:** Antigravity Worker  
**Đầu vào:** CODEX_BRIDGE được cung cấp qua stdin, hồ sơ R1–R3, nguồn và artifact tại workspace.  
**Trạng thái:** **APPROVED FOR COMPLETION — NOT READY FOR HANDOVER**

🎯 **[Auto-Router]** Nhóm 3/4: thẩm định kiến trúc Web và mã nguồn | Skills: computer-use:computer-use | Engines: PowerShell, Node.js, Web. Các skill review trong ma trận không có trong catalog/thư mục skill đã kiểm tra. Không có tool Argon/Antigravity gọi được; không phát sinh phiên tham vấn hay phiên Worker trong lượt này.

## 1. Quyết định có hiệu lực ngay

**Phê duyệt kiến trúc Static SPA và định hướng “Tactile Industrial Minimalism”. Công nhận các sửa đổi đã được kiểm chứng ở mục 2. Phê duyệt Worker thực hiện ngay R4-01…R4-05. Chưa chấp thuận yêu cầu READY FOR HANDOVER đối với artifact đang trình.**

Lý do là các tiêu chí R3 còn thiếu, không phải do chờ người dùng cho phép: luồng CAD chưa có preview riêng, ghi đè ghi chú, gộp copy/mở liên hệ và báo trạng thái vượt bằng chứng; liên kết Zalo tĩnh chưa theo resolver chung; build chưa khóa dependency và chưa fail khi thiếu entrypoint; chưa có nghiệm thu browser. Worker được sửa trong phạm vi văn bản này mà không hỏi lại quyền sửa.

Quyết định gắn với artifact hiện có:
- Manifest: `dist/artifact-manifest.json`.
- SHA-256 manifest: `81e337d11fc6ac12c068f9c38f673e1bab68305aab1794fdfe85d49a38dbef87`.
- 103 payload files; manifest không tự băm chính nó; tổng số file gồm manifest là 104.
- Payload nguồn tương ứng khớp artifact: không phát hiện drift.

Không lấy tuyên bố APPROVED của Gemini trong stdin làm nghiệm thu hiện tại: đoạn đó dùng số test cũ, đề xuất lookup điện thoại đã bị loại và tuyên bố bảo mật tuyệt đối không có cơ sở. Lượt này không tham vấn Argon trực tiếp. Văn bản này là lệnh để bàn giao cho Worker; không tuyên bố Worker đã nhận hoặc thực thi.

## 2. Bằng chứng kiểm định độc lập trong lượt R4

| Phép kiểm | Kết quả thực chạy | Giới hạn |
|---|---:|---|
| test_audit_r2_verification.js | 5/5, exit 0 | Hành vi mô phỏng |
| test_audit_regressions.js | 19/19, exit 0 | VM/DOM stub |
| test_behavior.js | 15/15, exit 0 | Hành vi mô phỏng |
| test_tab_architecture.ps1 | 26/26, exit 0 | Kiểm tra tĩnh chuỗi/regex |
| test_e2e_simulation.ps1 | 6/6, exit 0 | Kiểm tra tĩnh, không phải browser E2E |
| Probe chẩn đoán R2 | exit 0 | Assertion chỉ bao phủ một phần các metric |
| Cú pháp JS nguồn + dist | 26/26, exit 0 | Không chứng minh hành vi trình duyệt |
| Bộ verify-final kế thừa R3, chạy lại ở R4 | 25/25, exit 0 | 24 kiểm tra nguồn/artifact + manifest |
| Probe R4 dùng ID từ HTML thật | **4 PASS, 14 FAIL, exit 1** | 9 tiêu chí × 2 bản; VM, không phải browser |
| Manifest | 103/103 payload khớp hash và size | Toàn vẹn, không chứng nhận an toàn |
| Browser desktop/mobile, console/network | **UNVERIFIED** | CUA thực trả apps=[], browsers=[] |
| Build tái lập, thử failure path | **Chưa chạy** | Lượt này không rebuild/ghi đè dist |

71 kiểm tra nền = 39 kiểm tra hành vi mô phỏng + 32 kiểm tra tĩnh. Báo riêng probe, syntax và acceptance; không cộng chúng thành “E2E toàn diện”.

Hồ sơ kèm theo:
- [runner-evidence.json](runner-evidence.json): kết quả gọi suite trực tiếp trong lượt này; các raw log cùng thư mục.
- [verification.json](verification.json): kết quả chạy lại bộ R3. Bản `verify-final.cjs` ở thư mục R4 đọc bằng chứng suite nền mới của R4; không tự chạy các suite đó.
- [r4-findings.json](r4-findings.json), [probe-r4.cjs](probe-r4.cjs): ca bổ sung có assert, dữ liệu giả, không gửi mạng.
- [snapshot.json](snapshot.json): hash nguồn/artifact, drift, phiên bản dependency và giới hạn browser.
- [review-scope.json](review-scope.json): phạm vi thao tác.

**Vì sao 25/25 vẫn chưa đủ:** harness R2/R3 tự tạo element cho mọi ID mà `getElementById` nhận được. Vì vậy nó tự tạo `config-quote-preview` dù HTML không có element đó. Assertion cũ còn chấp nhận nội dung nằm ở bất kỳ node nào và không kiểm ghi chú được bảo toàn. Probe R4 chỉ trả node có ID trong HTML thực, qua đó tái hiện lỗi. Đây là thiếu coverage của test, không phủ nhận các PASS hợp lệ khác.

14 FAIL là bảy tiêu chí lặp lại trên nguồn và dist, không phải 14 lỗi gốc riêng biệt. Bốn PASS bổ sung xác nhận null resolver không mở CAD và hàm CAD tương thích không thêm dòng có giá vào giỏ, trên cả hai bản.

## 3. Phê duyệt nền tảng kiến trúc và định hướng sản phẩm

### 3.1. Runtime và ranh giới dữ liệu

Giữ bản phát hành HTML/CSS/JS thuần trong `dist/`; `src/` Next.js là thử nghiệm, không đưa vào artifact và không chuyển runtime trong đợt này.

Luồng được chấp thuận:

```text
Cấu hình xưởng + catalog công khai
  → Static SPA: Store / Studio / CAD / Standards
  → Mua hàng catalog → bản nháp cục bộ → preview → khách mở Zalo
  → Yêu cầu CAD → preview yêu cầu → copy / khách mở Zalo → tự đính kèm file
  → Tra bản nháp bằng toàn bộ mã chính xác trên cùng trình duyệt

Không có backend đồng bộ tiến độ hoặc xác nhận xưởng đã nhận yêu cầu.
```

Tiếp tục giữ schema validation, lỗi storage có contract, giỏ và mã nháp được giữ khi lỗi, idempotency theo clientRequestId, lookup đúng mã và projection giới hạn. Không mở lại tìm kiếm qua tên/số điện thoại. Local masking không phải phân quyền hay xác thực. PIN admin chỉ là khóa giao diện cục bộ.

Tuyên bố “instant quoting từ STL/STEP/3MF” chỉ là roadmap. Bản hiện tại là **request-only**, không có giá 0 đồng, giá mẫu, gram suy từ MB hoặc thời gian in được suy đoán. Chọn file cục bộ không đồng nghĩa upload.

### 3.2. Định hướng mỹ thuật được duyệt

Giữ nền than chì, bề mặt mờ và một màu nhấn cam `#FF5C00`; font display Space Grotesk, nội dung Plus Jakarta Sans, monospace chỉ cho mã/thông số. Cam là lựa chọn nhận diện của T&T, không quảng bá thành “tiêu chuẩn quốc tế ngành in 3D” khi chưa có nguồn.

Giữ 5 Hero Spotlight và catalog dễ tìm; ưu tiên ảnh sản phẩm/chất liệu thật, phân cấp chữ và khoảng trống. Không thêm hiệu ứng kính, chuyển động hoặc mô hình 3D vào mọi khối. Reduced motion, khả năng dùng bàn phím, chữ tiếng Việt và cả hai theme phải được kiểm thực.

Các tỷ lệ token tính lại: than chì/cam 6.3205:1; than chì/hover 5.0099:1; `#C44800`/`#F8F9FA` 4.6611:1. Không suy từ token sang chứng nhận WCAG toàn trang. Các nền pha alpha, opacity và trạng thái tương tác cần computed styles.

### 3.3. Đánh giá đối sánh và hệ automation

Trang chủ [thiendanglamgi.com](https://thiendanglamgi.com/) được công cụ Web đọc có danh mục, hỗ trợ/tra cứu/bảo hành và thông điệp khuyến mại lặp lại. Đây là tham khảo cấu trúc nội dung. Công cụ không cung cấp nghiệm thu thị giác; nhận xét “cao cấp hơn”, màu/font và hiệu quả chuyển đổi vẫn là đánh giá thiết kế cần kiểm chứng.

Trang [custom](https://thiendanglamgi.com/custom) chỉ trả shell “Đang tải trang” cho công cụ đọc ở lượt này. Không đủ bằng chứng khẳng định tính năng đối thủ đang hỏng hoặc Coming Soon. Không dùng điểm chưa xác minh đó để tuyên bố T&T vượt trội.

Đã xác nhận hiện diện ba thư mục Modern_Automation_Tools và file CapCut MCP nêu trong bridge; chưa kiểm runtime, dependency, bản quyền asset hoặc export thực. Phê duyệt phương án tích hợp theo ranh giới:

| Công cụ | Vai trò được duyệt | Điều kiện |
|---|---|---|
| Remotion | Tạo clip/ảnh sản phẩm offline | Dùng model/asset có quyền; web chỉ nhận MP4/WebM/poster, lazy-load, muted, playsinline; có ảnh fallback |
| Slidev | Lookbook B2B độc lập | Link hoặc export tĩnh đã kiểm; không kéo runtime Vue vào SPA chỉ để hiển thị catalog |
| Python/PPTX/COM | Tài liệu và báo giá sau duyệt kỹ thuật | Chạy máy nội bộ; không chạy COM từ HTTP client; số liệu đầu vào phải được xưởng xác nhận |
| CapCutAPI | Chuẩn bị draft video marketing | Không hứa MCP tự xuất video hoàn chỉnh khi mới chứng minh sửa draft; không gắn vào luồng checkout |

Các công việc media này không phải điều kiện đóng R4 và không được chen vào nhánh sửa hiện tại. Render GPU tuần tự theo AGENTS.md, chạy nền và dừng đúng tiến trình do tác vụ tạo. Không dừng toàn bộ POWERPNT của người dùng.

## 4. Các việc Worker được thực thi ngay

### R4-01 — Hoàn tất R3-03: bảo toàn ghi chú, preview riêng, copy và liên hệ tách rời

**Ưu tiên P1; chặn bàn giao.** File: `js/calculator.js:179–235`, `index.html:820,866` và CSS nếu cần.

**Bằng chứng:** HTML không có `config-quote-preview`. Code dùng fallback `config-custom-notes` là input một dòng và ghi `.value = message`. Lần bấm thứ hai lấy message lần trước làm ghi chú; probe đo hai tiêu đề yêu cầu trong message thứ hai. Khi clipboard reject, toast thực là “Đã mở Zalo! Vui lòng dán nội dung...” khác nội dung báo cáo R3.

**Contract và UI được phê duyệt:**

```html
<label for="config-quote-preview">Nội dung yêu cầu báo giá</label>
<textarea id="config-quote-preview" readonly rows="10"
  aria-describedby="config-quote-help"></textarea>
<p id="config-quote-help">File đang ở thiết bị của bạn.
  Hãy gửi kèm file CAD trong cuộc trò chuyện với xưởng.</p>
<button type="button" onclick="window.copyCadQuoteRequest()">Sao chép yêu cầu</button>
<a id="config-quote-open-zalo" aria-disabled="true">Mở Zalo</a>
<p id="config-quote-status" role="status" aria-live="polite"></p>
```

1. Giữ ô notes chỉ chứa đầu vào của khách. Tuyệt đối không dùng làm fallback preview. Thiếu preview là lỗi render được báo rõ; không tiếp tục với thông báo thành công.
2. Tách hàm thuần `buildCadQuoteMessage(request)`; nhận snapshot từ `calculateConfigurator()`, whitelist material/infill, qty nguyên 1–100, notes tối đa 500. Không có side effect giỏ/storage/clipboard/network trong builder.
3. `prepareCadQuoteRequest()` đồng bộ: dựng message, gán vào textarea riêng, hiện panel, cập nhật URL từ resolver; không gọi clipboard hoặc `window.open`.
4. Có thể giữ `sendZaloConfigQuote` làm alias cho prepare để tương thích, đổi CTA hiện tại thành “Chuẩn bị yêu cầu báo giá”. Alias không tự gửi hoặc mở Zalo.
5. `copyCadQuoteRequest()` chỉ copy nội dung preview hiện tại. Khi không có preview/message thì hướng dẫn chuẩn bị. Await clipboard trong try/catch. Chỉ báo đã sao chép sau resolve; reject/API vắng: focus/select textarea và ghi “Chưa sao chép tự động; hãy sao chép nội dung bên dưới”.
6. Mở Zalo bằng anchor riêng, do khách bấm trực tiếp. Không await copy rồi tự mở popup. Không có thông báo khẳng định đã mở/đã gửi/đã nhận. `window.open` trả null với noopener không đủ để suy luận popup đã bị chặn hay đã mở; dùng trạng thái trung tính. Xem [MDN Window.open](https://developer.mozilla.org/en-US/docs/Web/API/Window/open).
7. Null resolver: bỏ href, aria-disabled và chặn activation; preview/copy vẫn hoạt động. Query text không đảm bảo ứng dụng đích nhận nội dung và không upload file.
8. Giữ file whitelist, 0 byte, 25 MiB, qty và chặn CAD cũ. Builder/render dùng textContent hoặc value; không đưa notes/tên file vào innerHTML.
9. Chuẩn bị lại sau thay đổi lựa chọn phải cập nhật preview; copy không tự thay ghi chú. Giữ notes qua mọi lỗi clipboard và null resolver.

**Acceptance:** notes không đổi sau 1/2/3 lần chuẩn bị, message chỉ có một header với fixture gốc; clipboard success/reject/absent; null resolver; không auto-open khi chuẩn bị/copy; textarea thật readonly, có nhãn và dùng được trên mobile. Thử markup ở notes/tên file bằng dữ liệu giả, không thực thi.

Mẫu triển khai cốt lõi, cần ghép với state hiện tại:

```js
async function copyCadQuoteRequest() {
  const preview = document.getElementById('config-quote-preview');
  const status = document.getElementById('config-quote-status');
  if (!preview || !preview.value) {
    if (status) status.textContent = 'Hãy chuẩn bị yêu cầu trước.';
    return { ok: false, code: 'NO_PREVIEW' };
  }
  try {
    if (typeof navigator === 'undefined' ||
        typeof navigator.clipboard?.writeText !== 'function') {
      throw new Error('CLIPBOARD_UNAVAILABLE');
    }
    await navigator.clipboard.writeText(preview.value);
    if (status) status.textContent = 'Đã sao chép nội dung yêu cầu.';
    return { ok: true };
  } catch {
    preview.focus();
    preview.select();
    if (status) status.textContent =
      'Chưa sao chép tự động; hãy sao chép nội dung bên dưới.';
    return { ok: false, code: 'MANUAL_COPY_REQUIRED' };
  }
}
```

### R4-02 — Hoàn tất R3-02 trên các liên kết Zalo tĩnh

**Ưu tiên P1; chặn bàn giao.** File: `index.html:152,187,517,1200,1369,1495`, `js/app.js`, `js/config.js`.

Công nhận nhánh tracker no-match đã sửa. Tuy nhiên còn **sáu href Zalo cố định** trong nguồn và artifact. Không có binder chung cập nhật các link đó; null resolver trong tracker không bảo vệ các link header/footer/mobile. Link checkout có luồng cập nhật riêng nhưng href seed vẫn cần bỏ.

Đánh dấu các link **liên hệ xưởng** bằng `data-zalo-contact`, không để số đích trong HTML. Không đổi link admin liên hệ **khách hàng** thành số xưởng.

```js
function bindShopZaloLink(link, message = '') {
  const phone = window.TTStore?.getZaloPhone?.() ?? null;
  link.removeAttribute('href');
  link.removeAttribute('target');
  link.setAttribute('aria-disabled', String(!phone));
  link.onclick = phone ? null : event => event.preventDefault();
  if (!phone) return;
  const query = message ? '?text=' + encodeURIComponent(message) : '';
  link.href = 'https://zalo.me/' + phone + query;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.removeAttribute('aria-disabled');
}
```

Gọi binder sau config sẵn sàng, khi config được thay trong cùng trang và sau `storage` event phù hợp. Nhánh có message giữ đúng message của nó; không áp dụng binder rỗng ghi đè checkout/CAD.

Acceptance: valid → null → valid; resolver vắng; +84; ứng viên đầu sai ứng viên sau hợp lệ; từng link xưởng nhận đúng cấu hình hoặc không có href. Giữ đúng semantics hotline tel và link Zalo khách trong admin. Không nhắn tin thử tới số thật.

### R4-03 — Hoàn tất R3-01: khóa build và fail an toàn

**Ưu tiên P1; chặn bàn giao.** File: `package.json` hoặc `tooling/static/`, lockfile, `scripts/build-static-artifact.js`, config Tailwind.

Đã đạt: Play CDN và runtime tailwind.config bị loại khỏi hai HTML; CSS local trước CSS tùy biến; config quét HTML/admin/JS; manifest 103 payload khớp; CSS có dữ liệu.

Còn thiếu:
- Khai báo Tailwind `^3.4.1`, bản cài thực tế `3.4.19`; không có package-lock/shrinkwrap ở root hoặc tooling/static.
- Builder dùng `if (existsSync(src)) copy` với index/admin/products: entrypoint bị thiếu sẽ bị bỏ qua mà vẫn báo build hoàn tất.
- Chưa có bằng chứng hai build cùng input cho payload cùng hash hoặc failure-path tests.
- HTML vẫn dùng Google Fonts, Font Awesome và Three.js/OrbitControls CDN. Câu “toàn bộ tài nguyên độc lập cục bộ” trong HANDOVER_R3 không chính xác.

Chỉ thị:
1. Khóa toolchain Tailwind 3.x bằng version chính xác và lockfile. Ưu tiên lock theo phiên bản đã kiểm chứng hiện tại; không nâng major hoặc sửa dependency Next.js ngoài nhu cầu.
2. Có thể dùng tooling/static gọn nếu không muốn cài toàn bộ Next. Builder phải trỏ đúng CLI của toolchain đó; README ghi lệnh npm ci và build đầy đủ.
3. Preflight bắt buộc index.html, admin.html, products.json, CSS đầu vào, config và các JS/CSS runtime được tham chiếu. Thiếu phải throw/exit nonzero trước khi xóa dist hiện có.
4. Kiểm path tuyệt đối/realpath và reparse point trước xóa/copy; đích phải đúng dist/build tạm bên trong workspace. Không cho phép đi theo symlink/junction ra ngoài phạm vi build.
5. Compile trong staging; chỉ đóng gói artifact hợp lệ. Khi compile/copy/validate lỗi phải nonzero và không báo hoàn tất. Giữ hoặc phục hồi artifact cuối thành công; không để dist nửa chừng được coi là bản phát hành.
6. Kiểm class ghép động bằng map chuỗi đầy đủ hoặc safelist hẹp theo [Tailwind content configuration](https://v3.tailwindcss.com/docs/content-configuration#dynamic-class-names). Không coi quét js/**/* là bảo đảm mọi class động đã được emit.
7. Build hai lần cùng snapshot/lock; so digest payload, bỏ qua riêng buildTimestamp của manifest. Mọi khác biệt phải giải thích. Thử thiếu entrypoint và compile fail ở bản sao test, không xóa source thật.
8. Manifest phải bao phủ đúng payload cuối, không tự hash manifest, không chứa tests/reports/source thử nghiệm/backup hoặc dữ liệu nội bộ không dùng runtime.
9. Ghi rõ CDN còn dùng, phiên bản và fallback. Giữ cặp Three r128/OrbitControls 0.128.0 nhất quán, không nâng một nửa. Không bắt buộc chuyển mọi dependency thành local trong đợt này nếu fallback đã kiểm.

### R4-04 — Nghiệm thu browser còn thiếu từ R3-04

**Ưu tiên: cổng bàn giao bắt buộc.** Không thay bằng regex, VM hoặc ảnh do AI dựng.

Serve dist qua HTTP loopback trong profile/storage test riêng. Ghi browser/version, viewport, manifest SHA-256 và dữ liệu fixture. Không sửa storage người dùng thật; chỉ dừng server do tác vụ tạo.

| Mã | Ca bắt buộc | Điều kiện đạt |
|---|---|---|
| B01 | 1440×900, 390×844, 360×800; 4 view, hash/back/forward | Ảnh và thao tác thật; không tràn ngang/dock che CTA |
| B02 | Giỏ B, mua ngay A; checkout giỏ; double submit | Nháp đúng nguồn, giỏ B còn, một record/mã |
| B03 | quota/denied rồi retry | Form/giỏ/mã giữ nguyên; retry một record |
| B04 | Lookup exact/partial/phone; found/no-match; resolver null | Không lộ địa chỉ/tên; không có số đích dự phòng |
| B05 | CAD R4-01 | Preview riêng; notes không đổi; copy success/reject/absent; mở link riêng |
| B06 | Dark/light; normal/hover/active/focus | Computed foreground/background, opacity/nền composite; tương phản vùng chữ thực |
| B07 | Tab/Shift+Tab/Escape; modal/giỏ mở/đóng | Focus thấy được, không lọt nền modal; trả focus và scroll |
| B08 | Studio đổi tab/resize; mất CDN/WebGL | Fallback rõ; Store/checkout tiếp tục dùng được; không uncaught error |
| B09 | Cold storage; chặn Tailwind Play CDN | CSS local giữ layout; catalog/registry/assets hợp lệ; kiểm console/network |
| B10 | Artifact cuối | Manifest/hash khớp đúng bản đã test; không lộ hồ sơ nội bộ |

Console/network phải ghi lỗi request, stack hoặc trạng thái degraded cụ thể. Trong ca chặn mạng có chủ đích, ghi lỗi dự kiến và fallback; không yêu cầu giả “0 lỗi mạng” khi đang chủ động chặn.

Lượt R4 không có browser kết nối nên các ca trên UNVERIFIED. Worker có công cụ phù hợp phải hoàn tất; không xin xác nhận người dùng để thay kết quả test.

### R4-05 — Hồ sơ trung thực và dữ liệu demo trong artifact

**Ưu tiên P1 cho vệ sinh dữ liệu phát hành và tính chính xác hồ sơ.**

`js/config.js:188…299`, được copy nguyên vào dist, có block sampleOrders với tên/điện thoại/địa chỉ dạng thật và field mật khẩu NFC/Wi-Fi. Chưa xác định đó là dữ liệu giả hay thật; không kết luận có rò rỉ thông tin thật, và không chép các giá trị đó vào log mới.

Đối với artifact để phát hành, đặt sampleOrders=[] hoặc tách demo fixture rõ ràng khỏi public build. Cold admin phải hiển thị empty state trung thực. Không xóa dữ liệu đang lưu của người dùng để đạt kiểm thử; chỉ bỏ seed khỏi nguồn phát hành. Nếu xác định có giá trị thật từng công khai thì xử lý thu hồi/thay thông tin tương ứng trong công việc riêng được chủ sở hữu xác nhận; không suy đoán.

Tạo HANDOVER_R4.md với từng R4/B01–B10 PASS/FAIL/UNVERIFIED và link bằng chứng. Sửa các tuyên bố sai bằng addendum, giữ lịch sử R1–R3:
- 71 kiểm tra nền, probe, syntax, acceptance và browser là các nhóm khác nhau.
- Không còn câu “miễn dịch 100% XSS”, “bảo mật cao hơn đối thủ” hay “toàn bộ tài nguyên độc lập cục bộ” nếu chưa có bằng chứng.
- Mô phỏng vật liệu không chứng minh kích thước, dung sai, chất lượng bản in hoặc slicer thật.
- Cam kết ±0.15mm, chống nước tuyệt đối, độ bền nhiều năm, số máy/số khách và điều kiện bảo hành phải có căn cứ vận hành. Chỗ chưa có căn cứ dùng mô tả có điều kiện, không tự bịa thông số hoặc sửa chính sách kinh doanh.
- Trình bày trạng thái “đang chờ Codex nghiệm thu” tách biệt READY FOR HANDOVER.

## 5. Trình tự thực thi và các bất biến

1. Lưu diff/snapshot trước sửa; workspace đang có nhiều thay đổi sẵn. Không reset, dọn hoặc ghi đè công việc ngoài phạm vi.
2. Tái hiện notes bị ghi đè và request lồng bằng probe R4. Sửa R4-01/R4-02 theo contract, không thay kiến trúc để né ca lỗi.
3. Làm R4-03 và R4-05; dựng artifact cuối, so manifest/source. Không chạy render video trong đợt sửa.
4. Chạy lại suite nền có raw log và exit code; syntax nguồn/dist. Chạy acceptance cập nhật có ID bám HTML. Giữ hồ sơ test lịch sử bất biến.
5. `probe-r4.cjs` hỗ trợ API prepare/copy mới; Worker có thể đưa ca tương đương vào tests/. Nếu đổi ID/API phải giữ đầy đủ tiêu chí bảo toàn dữ liệu, manual copy, không tự mở và resolver; không xóa assertion chỉ để test xanh.
6. Bộ verify-final lịch sử có ca gọi copy qua handler cũ. Sau tách UI, viết acceptance kế thừa đúng các hành động prepare → copy thay vì bắt buộc side effect cũ; ghi giải thích thay đổi fixture. Không sửa log lịch sử hoặc trình kết quả lịch sử thành lần chạy mới.
7. Thực hiện B01–B10 trên artifact cuối và lưu ảnh/trace/console/network. Mọi sửa nguồn sau đó cần rebuild, hash lại và kiểm phần chịu ảnh hưởng.
8. Nộp HANDOVER_R4, diff theo file, lockfile/lệnh build, manifest cuối, hash nguồn/test/config, log/mã thoát, evidence browser, ma trận tiêu chí.
9. Codex xét bàn giao trên đúng manifest cuối. Chỉ khi toàn bộ tiêu chí chặn đã đạt mới cấp READY FOR HANDOVER. Quyết định đó không tự đồng nghĩa đã deploy hoặc đã gửi tin cho khách.

Bất biến bắt buộc: không mất giỏ/notes khi lỗi; không làm record trùng; không đổi mã nháp khi retry; không đè storage hỏng; không tạo giá CAD giả; không dựng người nhận liên hệ từ fallback consumer; không hiển thị thông tin đã gửi/nhận khi chỉ có dữ liệu cục bộ.

## 6. Lệnh bàn giao ngắn cho Antigravity

> Thi hành TT3D-ARCH-20261021-R4 ngay trong phạm vi được phê duyệt. Giữ Static SPA và mỹ thuật hiện tại. Hoàn tất preview CAD riêng, bảo toàn notes, tách prepare/copy/open; áp resolver cho sáu link xưởng; khóa build và fail khi thiếu input; bỏ sample order seed khỏi public artifact; nghiệm thu B01–B10. Nộp HANDOVER_R4 cùng bằng chứng mới gắn manifest cuối. Trạng thái hiện tại: APPROVED FOR COMPLETION — NOT READY FOR HANDOVER.

**Kết luận của Master Controller:** các cải thiện R3 có giá trị và được công nhận theo phạm vi đã kiểm. Yêu cầu phê duyệt bàn giao toàn bộ chưa đạt vì các thiếu sót và cổng nghiệm thu nêu rõ ở trên. Không cần thêm một vòng đồng ý sửa từ người dùng; Worker được triển khai ngay bản chỉ thị này.

