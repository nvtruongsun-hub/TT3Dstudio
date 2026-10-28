const fs = require('fs');
const path = require('path');
const products = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'products.json'), 'utf8'));

['Do_Choi_Moc_Khoa', 'Trang_Diem_Vanity', 'Decor_Den_Noi_That', 'Ca_Nhan_Hoa_NFC'].forEach(cat => {
  console.log(`\n=== CATEGORY: ${cat} ===`);
  const items = products.filter(p => p.category === cat);
  items.slice(0, 6).forEach(p => {
    console.log(`[${p.id}] ${p.title} | ${p.price.toLocaleString('vi-VN')}d | ${p.image}`);
  });
});
