const fs = require('fs');

function injectTag(file) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('env-config.js')) {
    console.log(`${file} already contains env-config.js`);
    return;
  }
  const target = '<script src="js/supabase-client.js';
  if (!content.includes(target)) {
    console.warn(`Target not found in ${file}`);
    return;
  }
  const replacement = '<script src="js/env-config.js?v=5.2"></script>\r\n  ' + target;
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content, 'utf8');
  console.log(`Successfully injected env-config.js tag into ${file}`);
}

injectTag('index.html');
injectTag('admin.html');
