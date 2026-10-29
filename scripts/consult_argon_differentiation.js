const http = require('http');
const fs = require('fs');

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

  const promptText = `Chào Argon 4, Giám đốc Nghệ thuật & Kiến trúc sư UX/UI Trưởng:

Người dùng vừa phản hồi 2 vấn đề trọng yếu cần giải quyết:
1. "Tôi thấy các sản phẩm vẫn chưa phân hóa được rõ nét, vẫn đang có sự trùng lặp khá nhiều. Hãy nghiên cứu chuyên sâu mảng thiết kế UI và cải tiến lại."
   - Thực trạng catalog 55 sản phẩm hiện tại:
     + 10/11 sản phẩm trong Trang_Diem_Vanity đều mang cùng badge "✦ Coquette Chic", các tiêu đề đều lặp lại "Ống cắm cọ...", "Hộp trang sức...", thiếu cá tính riêng biệt cho từng món.
     + 10/11 sản phẩm Decor_Den_Noi_That đều dùng badge "✦ Ambient Craft".
     + 10/11 sản phẩm Do_Choi_Moc_Khoa dùng badge "✦ Viral Fidget" (trong đó có 5 clicker gần giống nhau).
     + 10/11 sản phẩm Hop_De_Ban_Tien_Ich dùng badge "✦ Mechanical Desk".
     + 10/11 sản phẩm Ca_Nhan_Hoa_NFC dùng badge "✦ Smart Custom" (trong đó có 5 biển đỗ xe ô tô).
     + Giao diện thẻ sản phẩm (Product Card) nhìn từ xa khá đồng màu và chưa làm nổi bật: (1) Tính năng độc bản (Archetype), (2) Chất liệu/Công nghệ in đặc thù (Silk óng ả, Print-in-place, Chip NFC, Khớp động uốn lượn), (3) Ngữ cảnh sử dụng cụ thể (Bàn làm việc, Bàn trang điểm, Taplo ô tô, Quán cafe).

2. "Cùng với đó tab cảm ứng [Cảm hứng] đang bị sai ko đồng nhất với mẫu, 1 là xóa bỏ 2 là cải tiến chuyên sâu thêm."
   - Phát hiện nguyên nhân gốc của lỗi sai:
     Tab "#inspiration" (Góc Cảm Hứng) hiện dùng 3 ảnh chụp đơn lẻ nhưng lại gắn thông tin sản phẩm và SKU bị lệch nghiêm trọng:
     + Setup 01: Gán SKU mw-cn-1836100 (vốn là Đèn thấu quang Lithophane ngọn núi vàng 249k) với tên "Đế sạc NFC TapConnect 109k".
     + Setup 02: Dùng ảnh Lọ hoa dập ly xếp nếp (product-pleated-vase.jpg) nhưng danh sách combo lại gồm Khay nơ lụa và Ống cắm cọ (lọ hoa trong ảnh không hề có trong giỏ hàng!).
     + Setup 03: Gán SKU mw-cn-1702306 (Rắn khớp động Zootopia 249k) với tên "Bảng Menu QR 99k"! Khách bấm "Mua trọn bộ" sẽ bị đặt sai sản phẩm thật.
     + Các "hotspot" hiện chỉ là text pill dưới ảnh, không phải pin chỉ điểm tương tác thật trên ảnh.

YÊU CẦU ARGON 4 TƯ VẤN & RA QUYẾT ĐỊNH CHIẾN LƯỢC:
1. Về giải pháp UI Phân hóa Sản phẩm (Product Differentiation Strategy):
   - Thiết kế lại hệ thống Tag / Badge phân tầng theo Archetype & Công năng độc bản (chấm dứt việc 10 sản phẩm chung 1 badge generic).
   - Bố cục Product Card cần thêm những chỉ số thị giác nào (Micro-facets, Material indicator, Use-case tags) để khách hàng lướt qua là nhận diện được ngay món đồ mình cần?
   - Bộ lọc phụ (Sub-category filters / Intent Pills) nên tổ chức ra sao?

2. Về "Tab Cảm Hứng" (Inspiration Tab):
   - Giữa 2 lựa chọn người dùng đưa ra:
     + Phương án A: XÓA BỎ tab Cảm hứng khỏi thanh điều hướng chính, rút gọn về 4 tab chuẩn xác tuyệt đối (Cửa Hàng, Cá Nhân Hóa, Tra Đơn, Hỗ Trợ), đưa các combo bán chạy hoặc bộ sưu tập chọn lọc thành các Section trực quan ngay trong Cửa Hàng (như khuyến nghị ban đầu của bản Audit: "tránh mở thêm quá nhiều tab").
     + Phương án B: CẢI TIẾN CHUYÊN SÂU thành một Lookbook tương tác thực thụ, tái cấu trúc toàn bộ dữ liệu khớp 100% với ảnh và SKU thật, có pin hotspot định vị tọa độ % trên ảnh để khách bấm vào bung popup chi tiết sản phẩm thật.
   - Bạn đánh giá phương án nào mang lại hiệu quả chuyển đổi cao nhất, an toàn dữ liệu và tối ưu trải nghiệm cho khách hàng trên điện thoại?
   - Hãy đưa ra bản thiết kế chi tiết (Design Specification) cho phương án bạn chọn!`;

  console.log('Injecting prompt into Gemini editable textarea...');
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

  console.log('Clicking Send button...');
  const clickRes = await sendCDPCommand(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const btn = document.querySelector('button[aria-label*="Gửi"], button[aria-label*="Send"], .send-button');
      if (btn) {
        btn.click();
        return { clicked: true, aria: btn.getAttribute('aria-label') };
      }
      const el = document.querySelector('rich-textarea [contenteditable="true"]');
      if (el) {
        const ev = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true });
        el.dispatchEvent(ev);
        return { dispatchedEnter: true };
      }
      return { error: 'No send button found' };
    })()`,
    returnByValue: true
  });
  console.log('Click result:', clickRes);

  ws.close();
}

consultArgon().catch(console.error);
