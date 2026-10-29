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
            const btns = Array.from(document.querySelectorAll('button'));
            const matches = btns.filter(b => {
              const label = (b.getAttribute('aria-label') || '').toLowerCase();
              return label.includes('gửi') || label.includes('send') || label.includes('submit');
            }).map(b => ({
              ariaLabel: b.getAttribute('aria-label'),
              className: b.className,
              disabled: b.disabled,
              html: b.outerHTML.slice(0, 150)
            }));
            return matches;
          })()`,
          returnByValue: true
        }
      }));
    };
    ws.onmessage = (msg) => {
      const parsed = JSON.parse(msg.data);
      console.log('Matches:', JSON.stringify(parsed, null, 2));
      ws.close();
    };
  });
});
