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

async function consultArgonMobile() {
  const page = await getGeminiPage();
  console.log(`Connecting to Gemini tab: ${page.title}`);

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  const promptText = `Kính gửi Argon 4 — Giám đốc Nghệ thuật & Kiến trúc sư UX/UI Trưởng:

Người dùng vừa gửi phản hồi trực tiếp:
"Giao diện trên điện thoại nhìn còn thô quá không bao quát được gian hàng hãy làm nó 1 cách thật chỉnh chu nghiêm túc, hướng tới sản phẩm toàn diện nhất."

Qua khảo sát thực tế trên viewport điện thoại (iPhone 390x844px), chúng tôi nhận diện chính xác các điểm yếu gây ra cảm giác "thô" và "không bao quát":
1. Layout 1 cột quá lớn: Mỗi thẻ sản phẩm chiếm tới 550px chiều cao và trọn bề ngang màn hình, khiến 1 màn hình chỉ nhìn thấy đúng 1 sản phẩm. Khách muốn lướt 8 sản phẩm phải cuộn qua 4.400px!
2. Thiếu thanh bao quát tổng thể (Store Birds-eye Hub): Khách mở web không thấy được quy mô 55 sản phẩm và 5 danh mục cốt lõi của xưởng ngay ở nửa trên màn hình (Above the Fold).
3. Khoảng cách (padding) dọc quá thưa (py-12 đến py-16), banner và nút bấm quá khổ, các chi tiết card chưa được tinh chỉnh tỉ lệ vi mô (micro-proportions).

ĐỀ XUẤT KIẾN TRÚC ĐẠI TU MOBILE CỦA ANTIGRAVITY:
1. Chuyển đổi mặc định Lưới 2 Cột Chuẩn E-Commerce (2-Column Compact Grid):
   - Cả #curated-product-grid và #store-product-grid trên mobile đều đặt grid-cols-2 gap-3 làm mặc định.
   - Thẻ sản phẩm tối ưu: Ảnh vuông 1:1 bo góc 12px, Archetype Badge 9px gọn gàng, micro-eyebrow 9px, tiêu đề 12px clamp-2, giá 13px font-mono kèm nút tròn xem chi tiết 28x28px.
   - Nhờ đó, mỗi màn hình điện thoại hiển thị đồng thời 4 sản phẩm (2 hàng × 2 cột), bao quát tức thì!

2. Thanh Category Quick-Nav dạng Story/Pill Hub trên cùng:
   - 5 nút danh mục tròn/squircle có icon và đếm số lượng ([💄 Trang Điểm 11], [💡 Đèn Decor 11], [⚙️ Hộp Bàn 11], [🛞 Ô Tô NFC 11], [🎮 Fidget 11]) cho phép 1 chạm là lọc hoặc cuộn tới bộ sưu tập.

3. Dải Bảo chứng Xưởng Chế Tác (Artisan Trust Strip):
   - Thanh telemetry nhỏ gọn 1 dòng: "🖨️ Xưởng in Bambu Lab 24/7 • 🌱 Bio-PLA cao cấp • ⚡ Ship hoả tốc • 🛡️ Bảo hành 100% lỗi in".

4. Tinh gọn Hero & Padding:
   - Giảm padding dọc trên mobile từ 48px xuống 20px-24px, đẩy sản phẩm thật lên ngay trong tầm nhìn đầu tiên.

Xin ý kiến chỉ đạo chiến lược và các nguyên tắc thiết kế chi tiết (Design Tokens/Guidelines) từ Argon 4 để chúng tôi tiến hành triển khai bản dựng hoàn hảo nhất!`;

  console.log('Injecting mobile consultation prompt...');
  await sendCDPCommand(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const editor = document.querySelector('div.ql-editor') || document.querySelector('rich-textarea div[contenteditable="true"]');
      if (!editor) return { ok: false, error: 'Editor not found' };
      
      editor.focus();
      editor.innerHTML = '<p>' + ${JSON.stringify(promptText)}.replace(/\\n/g, '<br>') + '</p>';
      editor.dispatchEvent(new Event('input', { bubbles: true }));
      editor.dispatchEvent(new Event('change', { bubbles: true }));

      const sendBtn = document.querySelector('button[aria-label="Gửi tin nhắn"]') || document.querySelector('button[aria-label*="Gửi"]');
      if (!sendBtn || sendBtn.disabled) return { ok: false, error: 'Send button disabled or not found' };
      sendBtn.click();
      return { ok: true };
    })()`,
    returnByValue: true
  });

  console.log('Consultation sent to Argon 4.');
  ws.close();
}

consultArgonMobile().catch(console.error);
