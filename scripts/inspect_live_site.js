const https = require('https');

https.get('https://nvtruongsun-hub.github.io/TT3Dstudio/', (res) => {
  let html = '';
  res.on('data', c => html += c);
  res.on('end', () => {
    console.log('=== LIVE SITE INSPECTION REPORT ===');
    console.log('Status:', res.statusCode);
    console.log('Title:', html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim());
    
    // Scripts
    const scripts = [...html.matchAll(/<script\b[^>]*src=["']([^"']+)["'][^>]*>/gi)].map(m => m[1]);
    console.log('\n--- SCRIPT TAGS (Total: ' + scripts.length + ') ---');
    scripts.forEach(s => console.log(' - ' + s));
    
    // Styles
    const styles = [...html.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi)].map(m => m[1]);
    console.log('\n--- STYLESHEET TAGS (Total: ' + styles.length + ') ---');
    styles.forEach(s => console.log(' - ' + s));
    
    // Check key strings
    console.log('\n--- KEY PHRASE AUDIT ---');
    console.log('Contains "T&T 3D Labs":', html.includes('T&T 3D Labs'));
    console.log('Contains "T&T 3D Studio":', html.includes('T&T 3D Studio'));
    console.log('Contains "Hà Tĩnh":', html.includes('Hà Tĩnh'));
    console.log('Contains "Hà Nội":', html.includes('Hà Nội'));
    console.log('Contains "MakerWorld":', html.includes('MakerWorld'));
    console.log('Contains "Zalo":', html.includes('zalo') || html.includes('Zalo'));
    console.log('Contains "env-config.js":', html.includes('env-config.js'));
    console.log('Contains "vn-administrative.js":', html.includes('vn-administrative.js'));
    console.log('Contains "smart-address":', html.includes('smart-address') || html.includes('customer_addresses'));
    console.log('Contains Chinese text (网抑云, 更多好物):', /更多好物|网抑云|[\u4e00-\u9fa5]{2,}/.test(html));
    
    // Check contact and footer
    const phoneMatches = html.match(/0\d{9}/g) || [];
    console.log('\nPhone numbers found:', [...new Set(phoneMatches)]);
    
    const emailMatches = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
    console.log('Emails found:', [...new Set(emailMatches)]);
    
    const zaloMatches = html.match(/https?:\/\/(?:zalo\.me|chat\.zalo\.me)[^\s"'>]+/gi) || [];
    console.log('Zalo links found:', [...new Set(zaloMatches)]);
  });
}).on('error', (err) => {
  console.error('Fetch error:', err.message);
});
