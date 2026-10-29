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

async function consultArgon() {
  const page = await getGeminiPage();
  console.log(`Connecting to Gemini tab: ${page.title}`);

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  const promptText = `Chào Argon 4, cố vấn chiến lược Art Direction & Industrial Design:
Người dùng phản hồi về thiết kế Poster/Banner quầy hàng xưởng in 3D (T&T 3D Labs) như sau:
1. "vẫn cho clicker là điểm sáng tiêu biểu nhưng chọn mẫu khác": Trước đây dùng clicker phím cơ đen vuông đơn điệu bị chê. Giờ cần chọn một mẫu Clicker / Fidget độc đáo, bắt mắt, mang tính biểu tượng đặc sắc hơn nhiều (Ví dụ: Clicker Kem Ốc Quế cơ học pastel, Đá cuội Fidget ASMR, Bàn phím Bambu Lab Fidget Clicker, Quả bơ Fidget, v.v.).
2. "các hình ảnh mẫu khác bé quá hãy cải tiến lại": Các ảnh mẫu phụ ở bản R5 (60-70px) quá nhỏ, thiếu sức sống và không làm nổi bật được chi tiết in 3D. Cần bố cục lại để các sản phẩm đều có kích thước lớn, khoáng đạt, có tỷ lệ thị giác rõ ràng, nhìn từ 2-3m vẫn thấy rõ chất lượng in.
3. Tham khảo các thiết kế quầy pop-up & poster triển lãm tiêu biểu nước ngoài (như MUJI craft showcase, D&Department, Bauhaus Pop-up, Tokyo Maker Faire, KAWS/Pop Mart lifestyle):
   - Hãy tư vấn bố cục thị giác (Visual Hierarchy) cho cả khổ Banner ngang (1200x600mm) và Poster đứng A2 (420x594mm).
   - Chọn mẫu Clicker nào làm "Điểm sáng tiêu biểu" (Hero Highlight) tốt nhất, kết hợp ăn ý với Khay nơ Coquette lụa mềm và Đèn Washi KŌHAKU.
   - Giải pháp hiển thị ảnh sản phẩm lớn hơn (Macro/Hero-scale) mà không làm vỡ bố cục hay gây chật chội.
   - Bảng màu, typography và micro-copywriting tinh tế để poster vừa chuyên nghiệp, vừa mang bản sắc craft độc bản của studio, không bị giống AI generic.`;

  // Focus and insert text
  const injectRes = await sendCDPCommand(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('rich-textarea [contenteditable="true"]');
      if (!el) return { error: 'No editable element found' };
      el.focus();
      document.execCommand('selectAll', false, null);
      document.execCommand('insertText', false, ${JSON.stringify(promptText)});
      return { ok: true, len: el.innerText.length };
    })()`,
    returnByValue: true
  });
  console.log('Inject result:', injectRes);

  await new Promise(r => setTimeout(r, 1000));

  // Click Send button
  const clickRes = await sendCDPCommand(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const btn = document.querySelector('button[aria-label*="Gửi"], button[aria-label*="Send"], .send-button');
      if (btn) {
        btn.click();
        return { clicked: true, aria: btn.getAttribute('aria-label') };
      }
      // fallback: press enter
      const el = document.querySelector('rich-textarea [contenteditable="true"]');
      if (el) {
        const ev = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true });
        el.dispatchEvent(ev);
        return { dispatchedEnter: true };
      }
      return { error: 'No send button or input found' };
    })()`,
    returnByValue: true
  });
  console.log('Click result:', clickRes);

  ws.close();
}

consultArgon().catch(console.error);
