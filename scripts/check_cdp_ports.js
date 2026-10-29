const http = require('http');

[9222, 9223, 9224].forEach(port => {
  http.get(`http://127.0.0.1:${port}/json`, res => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
      try {
        const pages = JSON.parse(d);
        console.log(`Port ${port}: ${pages.length} pages`);
        pages.forEach(p => console.log(`  - [${p.type}] ${p.title} (${p.url})`));
      } catch (e) {
        console.log(`Port ${port}: parse error`);
      }
    });
  }).on('error', err => console.log(`Port ${port}: offline (${err.message})`));
});
