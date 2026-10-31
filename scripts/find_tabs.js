const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const lines = html.split('\n');
lines.forEach((l, i) => {
  if (l.includes('role="tablist"') || l.includes('store-main-nav') || l.includes('store-category-filters') || l.includes('workspace-nav-tab')) {
    console.log((i+1) + ': ' + l.trim());
  }
});
