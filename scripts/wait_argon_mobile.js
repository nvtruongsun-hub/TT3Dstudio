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

async function waitForAdvice() {
  const page = await getGeminiPage();
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  console.log('Waiting for Argon 4 response on mobile UX...');
  let lastLen = 0;
  let stableCount = 0;
  let finalResponse = '';

  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 3000));
    const res = await sendCDPCommand(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const responses = document.querySelectorAll('message-content, .model-response-text, .response-container-content');
        if (!responses.length) return { length: 0, text: '' };
        const last = responses[responses.length - 1];
        const isGenerating = document.querySelector('.generating, .pending-response, [aria-label*="Dừng sinh"], [aria-label*="Stop"]') !== null;
        return {
          length: last.innerText.length,
          text: last.innerText,
          isGenerating
        };
      })()`,
      returnByValue: true
    });

    const val = res.result?.value;
    if (!val) continue;

    console.log(`Poll ${i+1}: length=${val.length}, isGenerating=${val.isGenerating}`);

    if (val.length > 300 && val.text.includes('Mobile') || val.length > 500) {
      if (val.length === lastLen && !val.isGenerating) {
        stableCount++;
        if (stableCount >= 2) {
          finalResponse = val.text;
          break;
        }
      } else {
        stableCount = 0;
        lastLen = val.length;
      }
    }
  }

  ws.close();

  if (finalResponse) {
    fs.writeFileSync('argon_mobile_advice.md', finalResponse, 'utf8');
    console.log(`Successfully captured Argon 4 advice (${finalResponse.length} chars) in argon_mobile_advice.md`);
  } else {
    console.log('Timed out waiting for mobile advice response.');
  }
}

waitForAdvice().catch(console.error);
