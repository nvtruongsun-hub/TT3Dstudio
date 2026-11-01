const fs = require('fs');
const path = require('path');

const filename = process.argv[2] || 'test.png';
const outPath = path.resolve(__dirname, '..', 'SCREENSHOT_BEFORE', filename);

const timer = setTimeout(() => {
  console.error('Screenshot timed out after 5s');
  process.exit(1);
}, 5000);

const ws = new WebSocket('ws://127.0.0.1:9222/devtools/page/4F6A54DC50E6D4B008C575DA3D6CE8E5');

ws.onopen = () => {
  ws.send(JSON.stringify({ id: 100, method: 'Page.captureScreenshot', params: { format: 'png' } }));
};

ws.onmessage = (msg) => {
  const data = JSON.parse(msg.data);
  if (data.id === 100) {
    clearTimeout(timer);
    if (data.result && data.result.data) {
      fs.writeFileSync(outPath, Buffer.from(data.result.data, 'base64'));
      console.log(`Saved screenshot to ${filename} (${data.result.data.length} bytes)`);
      ws.close();
      process.exit(0);
    } else {
      console.error('Capture error:', data.error);
      ws.close();
      process.exit(1);
    }
  }
};

ws.onerror = (e) => {
  clearTimeout(timer);
  console.error('WS Error:', e);
  process.exit(1);
};
