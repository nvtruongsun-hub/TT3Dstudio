const fs = require('fs');
const path = require('path');

const srcDir = path.resolve('assets/images/poster-r4');
const dstDir = path.resolve('assets/images/poster-r6');

if (!fs.existsSync(dstDir)) {
  fs.mkdirSync(dstDir, { recursive: true });
}

const files = fs.readdirSync(srcDir);
files.forEach(f => {
  const src = path.join(srcDir, f);
  const dst = path.join(dstDir, f);
  fs.copyFileSync(src, dst);
  console.log(`Copied ${f} to assets/images/poster-r6/`);
});
