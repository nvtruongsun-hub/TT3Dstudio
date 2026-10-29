const http = require('http');

http.get('http://127.0.0.1:9222/json', (res) => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const list = JSON.parse(d);
    const p = list.find(x => x.url && x.url.includes('gemini.google.com'));
    const ws = new WebSocket(p.webSocketDebuggerUrl);
    ws.onopen = () => {
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: {
          expression: `(() => {
            const editor = document.querySelector('rich-textarea div[contenteditable="true"]') || document.querySelector('p[data-placeholder]');
            const btns = Array.from(document.querySelectorAll('button')).map(b => ({
              ariaLabel: b.getAttribute('aria-label'),
              disabled: b.disabled,
              text: b.innerText
            })).filter(b => b.ariaLabel || b.text);
            return {
              hasEditor: Boolean(editor),
              editorHtml: editor ? editor.outerHTML.slice(0, 200) : null,
              btns: btns.slice(0, 15)
            };
          })()`,
          returnByValue: true
        }
      }));
    };
    ws.onmessage = (msg) => {
      const parsed = JSON.parse(msg.data);
      console.log('Parsed:', JSON.stringify(parsed, null, 2));
      ws.close();
    };
  });
});
