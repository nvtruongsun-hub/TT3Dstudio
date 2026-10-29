/** R10 acceptance: generated hero asset, honest copy, offline assets, QR and PDF sizes. */
const fs=require('fs'),path=require('path'),assert=require('assert');
const {PNG}=require('pngjs'),jsQR=require('jsqr');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'poster-artisan-stall.html'),'utf8');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'data/poster-r10.json'),'utf8'));
let count=0;function check(name,fn){fn();console.log('[PASS] '+name);count++;}
check('Generated hero exists and actual resolution matches manifest',()=>{
 const image=PNG.sync.read(fs.readFileSync(path.join(root,manifest.heroAsset)));
 assert.deepEqual([image.width,image.height],manifest.imageDimensions);
 assert.equal(manifest.generated,true);assert(html.includes(manifest.heroAsset));
 assert(html.includes('minh họa ý tưởng'));
});
check('Bottom prices match actual catalog SKUs',()=>{
 const catalog=JSON.parse(fs.readFileSync(path.join(root,'products.json'),'utf8').replace(/^\uFEFF/,''));
 assert.equal(manifest.items.length,4);
 for(const item of manifest.items){
  assert.equal(catalog.find(p=>p.id===item.id)?.price,item.price);
  assert(html.includes(item.id));assert(html.includes(item.price.toLocaleString('vi-VN')+' ₫'));
 }
 assert.equal((html.match(/aria-label="Bảng giá sản phẩm trong shop"/g)||[]).length,2);
});
check('All image and font paths resolve',()=>{
 for(const match of html.matchAll(/(?:src="|url\(')(assets\/[^"')]+)/g))assert(fs.existsSync(path.join(root,match[1])),match[1]);
});
check('QR resolves to the same shop URL as the link',()=>{
 const png=PNG.sync.read(fs.readFileSync(path.join(root,'assets/images/poster-r7/qr-shop.png')));
 const code=jsQR(new Uint8ClampedArray(png.data),png.width,png.height);
 assert.equal(code?.data,'https://nvtruongsun-hub.github.io/TT3Dstudio/');assert(html.includes('href="'+code.data+'"'));
});
for(const [file,w,h] of [['TT3D-poster-A2.pdf',420,594],['TT3D-banner-1200x600.pdf',1200,600]])check(file+' has one page with correct dimensions',()=>{
 const pdf=fs.readFileSync(path.join(root,'reports/poster-r10',file),'latin1');
 const m=pdf.match(/\/MediaBox\s*\[\s*([\d.\s]+)\s*\]/);assert(m);
 const b=m[1].trim().split(/\s+/).map(Number);
 assert(Math.abs((b[2]-b[0])*25.4/72-w)<.3);assert(Math.abs((b[3]-b[1])*25.4/72-h)<.3);
 assert.equal((pdf.match(/\/Type\s*\/Page\b/g)||[]).length,1);
});
console.log(count+' R10 acceptance checks passed.');
