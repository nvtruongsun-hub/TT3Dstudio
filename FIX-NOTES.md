# Kiểm định Category Hub — 2026-10-21

Phạm vi phiên này: đọc bridge từ stdin, kiểm định và xuất chỉ thị cho Antigravity; chưa sửa mã ứng dụng.

- Hiện tượng được báo: nút Soi 3D xuất hiện khi thiếu model; viewer thêm sai/không thêm sản phẩm; cần kiểm định Category Hub trước khi bàn giao.
- Môi trường: Windows PowerShell, Node.js v24.20.0, ứng dụng HTML/JS tĩnh. Chưa xác định commit cuối chạy đúng; baseline là snapshot có SHA256 trong log dưới đây.
- Trạng thái ban đầu: `CODEX_BRIDGE.md` đã sửa, `codex_response.md` đã xóa. Giữ nguyên cả hai.
- Tái hiện: `node reports/codex-audit-2026-10-21/reproduce-audit.cjs`.
- Bằng chứng: `reports/codex-audit-2026-10-21/reproduction.log`, probe exit 0 xác nhận 8 lỗi/quan sát trên bản cũ; đây không phải kết quả sửa lỗi hay browser E2E.
- Đầu vào: storage sai kiểu, fetch throw, seed thiếu metadata, catalog thật 55 mẫu với modelKey null, fixture A/B dùng chung modelKey, route category → studio → store, color ID chứa dấu nháy và mã thử vô hại.
- Kết quả nền: 15/15 hành vi, 6/6 kiểm tra cấu trúc mô phỏng, 26/26 cấu trúc tab đạt; 7 file JS qua node --check. Các kiểm tra xanh chưa bao phủ lỗi đã tái hiện.
- Sửa nhận định của bridge: cart.js đã tạo alias TTStore.addToCart; không thể quy lỗi nút giỏ cho việc TTStore không tồn tại trong trang tải đầy đủ.
- Phương án: phân loại storage/fetch đúng; merge raw trước sanitize; giữ Product ID trong viewer; một nguồn dựng dòng hàng; bỏ handler có dữ liệu động; router áp URL và state cùng nhau.
- Rà soát thứ hai: subagent chỉ đọc xác nhận độc lập lỗi migration, router, XSS Admin và thiếu coverage. Không có thay đổi mã từ subagent.
- Việc đã thử trong phiên: probe Node VM → xác nhận 8 ca; không thử vá ứng dụng. Đã bỏ một assertion phụ không phù hợp về tên action HTML trong probe; assertion chính của router đo số Hero và URL.
- Chưa kiểm: trình duyệt thật, WebGL, mobile/light/dark, khả năng truy cập. Worker phải kiểm theo chỉ thị trước nghiệm thu.

Chỉ thị và spec triển khai: `reports/codex-audit-2026-10-21/CHI_THI_ANTIGRAVITY.md`.

## Tái thẩm định bridge F01–F12 — 21/10/2026

- Đầu vào: Worker báo hoàn tất 12 điểm và mọi test đạt. Scope phiên này: review/chỉ thị, chưa sửa ứng dụng.
- Thực chạy: regression 11/11, behavior 15/15, tab structure 26/26, E2E structure 6/6, syntax 8/8. Các số đạt không bao phủ đầy đủ callback/persistence/browser.
- Lệnh tái hiện: node reports/codex-audit-2026-10-21/recheck-current.cjs — xác nhận 9 vấn đề trên snapshot hiện tại: cart updateQty undefined, ordersBody undefined, raw HTML cart, same-tab Store giữ category, qty parser/default option, cart boundary, runner nuốt exit failure, mất tombstone, offline persist revision quá sớm.
- Môi trường: Windows PowerShell; Node v24.20.0; input products.json và working tree hiện tại. Baseline importer: data/baseline_products_v1.json. Không xác nhận baseline git commit chạy đúng.
- Rà soát độc lập chỉ đọc đồng thuận về persistence/registry/runner. Chưa chạy browser thật trong phiên này; không coi báo cáo browser từ stdin là bằng chứng độc lập.
- Spec/sơ đồ mới và lệnh cho Worker: reports/codex-audit-2026-10-21/CHI_THI_TAI_THAM_DINH.md.
- Quyết định: phê duyệt phương án khắc phục; chưa nghiệm thu bản hiện tại. Chưa có bản vá nên chưa kết luận bước kiểm thật sau sửa hoặc ghi bài học 'đã sửa xong'.
