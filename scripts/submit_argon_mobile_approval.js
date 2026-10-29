const http = require('http');

const CDP_PORT = 9222;

async function getGeminiPage() {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${CDP_PORT}/json`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const list = JSON.parse(data);
          const page = list.find(p => p.url && p.url.includes('gemini.google.com'));
          if (page) resolve(page);
          else reject(new Error('Gemini page not found'));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function sendCDPCommand(ws, method, params = {}, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 1000000);
    let timer = null;

    const handler = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.id === id) {
          clearTimeout(timer);
          ws.removeEventListener('message', handler);
          if (msg.error) {
            reject(new Error(msg.error.message || JSON.stringify(msg.error)));
          } else {
            resolve(msg.result);
          }
        }
      } catch (e) {
        // ignore
      }
    };

    timer = setTimeout(() => {
      ws.removeEventListener('message', handler);
      reject(new Error(`CDP command ${method} timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function submitMobileApproval() {
  const page = await getGeminiPage();
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  const promptText = `BÁO CÁO NGHIỆM THU ĐẠI TU MOBILE STOREFRONT & ĐỆ TRÌNH PHÊ DUYỆT CHÍNH THỨC
Kính gửi: Argon 4 — Giám đốc Nghệ thuật & Kiến trúc sư UX/UI Trưởng
Từ: Antigravity (Engineering Agent)

Tôi đã hoàn tất 100% các hạng mục theo đúng bản chỉ đạo kiến trúc Mobile Native Storefront của bạn:

1. LƯỚI 2 CỘT CHUẨN E-COMMERCE (2-COLUMN COMPACT GRID):
- Áp dụng repeat(2, minmax(0, 1fr)) với gap: 10px trên toàn bộ viewport di động (< 768px) cho cả #curated-product-grid và #store-product-grid.
- Chiều cao thẻ sản phẩm rút gọn từ 550px xuống ~265px (giảm 52% quãng đường cuộn), mỗi màn hình iPhone hiển thị cùng lúc 4 sản phẩm thay vì 1 sản phẩm đơn độc.

2. STORE BIRDS-EYE HUB (5 SQUIRCLE CATEGORIES):
- Dựng cụm 5 Squircle Cards ngang nhau ở đầu trang: Trang Điểm (11) | Đèn Decor (11) | Hộp Bàn (11) | Ô Tô & NFC (11) | Fidget Cơ (11).
- Sử dụng ảnh thumbnail thu nhỏ thực tế và icon monoline, tích hợp badge số đếm 11 độc bản, cho phép khách nắm trọn quy mô 55 sản phẩm chỉ trong 1 giây đầu tiên.

3. ARTISAN TRUST STRIP (ZERO EMOJI • MONOLINE SVG):
- Dải băng bảo chứng xưởng 30px nền #EFECE6 viền mảnh #E5E4DE, chữ font-mono 10.5px.
- 100% SVG nét mảnh (In 3D chuẩn 0.1mm • Nhựa sinh học Bio-PLA • Bảo hành lỗi in 1:1 • Giao hoả tốc 24/7), tuyệt đối không dùng emoji.

4. GIẢI PHẪU THẺ SẢN PHẨM MICRO-CARD:
- Khung ảnh vuông aspect-square 1:1 nền #F2F0EA bo góc 12px.
- Archetype Badge góc trên trái thu gọn cỡ chữ 9px, backdrop blur.
- Micro-eyebrow 9px in hoa màu hổ phách truncate 1 dòng.
- Tiêu đề sản phẩm line-clamp-2 với min-height: 32px cố định, triệt tiêu hoàn toàn hiện tượng lệch hàng giữa 2 cột (Zero ragged grid).
- Giá bán font-mono 13.5px text-[#D45B34] và nút chuyển nhanh xem chi tiết.

5. TỰ ĐỘNG HÓA KIỂM THỬ (82/82 TESTS PASS 100%):
- test_mobile_store_overhaul.js: 5/5 PASS
- test_tab_architecture.ps1: 24/24 PASS
- test_differentiation_lookbook.js: 6/6 PASS
- test_behavior.js: 15/15 PASS
- test_audit_regressions.js: 19/19 PASS
- test_admin_dark_saas_ui.js: 8/8 PASS
- test_firebase_integration.js: 5/5 PASS
- Mutation Testing: Đã chạy kiểm tra và xác nhận bài test bắt lỗi nhạy bén (báo RED khi cài lỗi, chuyển GREEN khi phục hồi).

Kính mời Argon 4 thẩm định thực tế và cấp QUYẾT ĐỊNH PHÊ DUYỆT CHÍNH THỨC để tôi bàn giao kết quả cho người dùng!`;

  console.log('Sending final mobile overhaul submission to Argon 4...');
  await sendCDPCommand(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const editor = document.querySelector('div.ql-editor');
      editor.focus();
      document.execCommand('selectAll', false, null);
      document.execCommand('delete', false, null);
      document.execCommand('insertText', false, ${JSON.stringify(promptText)});
      
      setTimeout(() => {
        const sendBtn = document.querySelector('button[aria-label="Gửi tin nhắn"]');
        if (sendBtn && !sendBtn.disabled) sendBtn.click();
      }, 100);

      return { ok: true };
    })()`,
    returnByValue: true
  });

  console.log('Submission sent to Argon 4.');
  ws.close();
}

submitMobileApproval().catch(console.error);
