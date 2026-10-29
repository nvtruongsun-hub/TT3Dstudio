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

async function waitForArgonResponse() {
  const page = await getGeminiPage();
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  console.log('Polling Argon 4 response...');
  let lastLen = 0;
  let stableCount = 0;
  let finalMarkdown = '';

  for (let i = 0; i < 45; i++) {
    await new Promise(r => setTimeout(r, 3000));
    const res = await sendCDPCommand(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const responses = document.querySelectorAll('.model-response-text, message-content');
        if (!responses.length) return { text: '', isGenerating: false };
        const last = responses[responses.length - 1];
        const isGenerating = !!document.querySelector('button[aria-label*="Dừng"], button[aria-label*="Stop"], .generating');
        return {
          text: last.innerText,
          isGenerating
        };
      })()`,
      returnByValue: true
    });

    const info = (res && res.result && res.result.value) || {};
    const textLen = (info.text || '').length;
    console.log(`[${i+1}] Length: ${textLen}, Generating: ${info.isGenerating}`);

    if (textLen > 100 && !info.isGenerating) {
      if (textLen === lastLen) {
        stableCount++;
        if (stableCount >= 2) {
          finalMarkdown = info.text;
          break;
        }
      } else {
        stableCount = 0;
        lastLen = textLen;
      }
    }
  }

  ws.close();

  if (finalMarkdown) {
    fs.writeFileSync('argon_rebuild_evaluation.md', finalMarkdown, 'utf8');
    console.log(`\nSuccessfully captured Argon 4 response (${finalMarkdown.length} chars)! Saved to argon_rebuild_evaluation.md`);
  } else {
    console.log('Could not capture finished response within timeout.');
  }
}

waitForArgonResponse().catch(console.error);
