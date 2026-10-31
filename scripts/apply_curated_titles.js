const fs = require('fs');

const curatedTitles = {
  "mw-cn-2084928": "Ống cắm cọ Nơ Lụa Sweet Silk",
  "mw-cn-2531095": "Bình cắm cọ Cánh Bướm Nơ Đôi",
  "mw-cn-1646129": "Khay trang sức Nơ Lụa Sweet Silk",
  "mw-cn-2053572": "Hộp trang sức Quả Đào Nếp Lụa",
  "mw-cn-2332788": "Ống cắm cọ Satin Kem Tươi",
  "mw-cn-2332220": "Hộp nhẫn Vỏ Sò Thắt Nơ",
  "mw-cn-2510097": "Khay trưng bày Nếp Gấp Mỹ Thuật",
  "mw-cn-2771973": "Chén trang sức Nếp Gấp Mây Ballet",
  "mw-cn-2615328": "Hộp mỹ phẩm Vân Dệt Nơ Hồng",
  "mw-cn-2709441": "Hộp trang sức Cánh Thiên Thần",
  "mw-cn-2761118": "Tủ mini rèm cuốn Phô Mai 2 Tầng",
  "mw-cn-1954833": "Đèn tam giác Vân Dệt Cổ Điển",
  "mw-cn-1438306": "Đèn ngủ Đám Mây Phi Hành Gia",
  "mw-cn-2327403": "Đèn ngủ Cây Nấm Vân Dệt",
  "mw-cn-2235027": "Đèn bàn KŌHAKU Giấy Washi",
  "mw-cn-2791883": "Đèn ngủ Lunelle Dáng Voan Mỏng",
  "mw-cn-2768588": "Đèn nan tre Đổ Bóng Nghệ Thuật",
  "mw-cn-2050227": "Đèn thiền Zen Garden Tối Giản",
  "mw-cn-1008515": "Bình hoa Túi Giấy Nhăn Ảo Giác",
  "mw-cn-2600068": "Bình hoa Túi Nilon Trong Suốt",
  "mw-cn-1151680": "Bình hoa Túi Vải Mềm Thắt Dây",
  "mw-cn-475316": "Bàn trà mini Tensegrity Phản Trọng Lực",
  "mw-cn-1702306": "Rắn khớp động Gary Zootopia",
  "mw-cn-1553726": "Mô hình Chuột Thiên Thần Có Cánh",
  "mw-cn-1795991": "Fidget Đá Cuội Bấm Phím ASMR",
  "mw-cn-2370777": "Clicker cơ học Liền Khối 100% In 3D",
  "mw-cn-2331892": "Fidget Kem Ốc Quế Switch Cơ",
  "mw-cn-2415902": "Fidget Chim Béo Bấm Phím Nhảy Múa",
  "mw-cn-1433737": "Mèo mini khớp động Trong Lòng Bàn Tay",
  "mw-cn-125751": "Móc khóa Gấu Trúc Khớp Cử Động",
  "mw-cn-704003": "Móc khóa Gundam Mecha Khớp Cử Động",
  "mw-cn-1360122": "Bàn phím mini Fidget 4 Nút Tháo Rời",
  "mw-cn-1753199": "Móc khóa Quả Bơ Switch Cơ Hạt Rời",
  "mw-cn-2936034": "Giá đỡ điện thoại Gấu Werwer Sofa",
  "mw-cn-2996948": "Giỏ xếp nếp Origami Co Giãn Xếp Gọn",
  "mw-cn-1223355": "Ống cắm bút Ống Nước Mario Ngăn Kéo Ẩn",
  "mw-cn-1404920": "Hệ ngăn kéo xếp chồng Pork3D Để Bàn",
  "mw-cn-1827939": "Hộp xoay 3 tầng Vòng Tròn Ma Thuật Sakura",
  "mw-cn-1971424": "Hộp lưu trữ Đu Quay Ferris Xoay Cơ Học",
  "mw-cn-181548": "Hộp xoay đa tầng Cơ Học Để Bàn",
  "mw-cn-1037659": "Kẹp giữ cáp sạc Bậc Thang Tối Giản",
  "mw-cn-701384": "Kẹp cáp bảng IKEA Skadis Tối Giản",
  "mw-cn-176739": "Hộp khẩu độ máy ảnh Cơ Chế Iris Xoay",
  "mw-cn-1012842": "Hộp mật mã xoay Cryptex Da Vinci",
  "mw-cn-951495": "Biển số đỗ xe Xoay Lật Giấu Số Taplo",
  "mw-cn-2206348": "Biển số đỗ xe Cử Chỉ Tay Thể Thao",
  "mw-cn-2719031": "Thẻ đỗ xe Oval Góc Nghiêng 45°",
  "mw-cn-3060338": "Biển số đỗ xe Bồ Hóng Hoạt Hình Đổi Số",
  "mw-cn-2808063": "Biển số xe Bàn Phím Bấm Switch Cơ Clicky",
  "mw-cn-1769352": "Biển mã QR Thẻ Trượt Quầy Thu Ngân",
  "mw-cn-694992": "Biển đứng mã QR Gấp Gọn Quầy Cafe",
  "mw-cn-558306": "Standee Logo 3D Kèm Mã QR Mạng Xã Hội",
  "mw-cn-939925": "Móc khóa Đĩa Than Vinyl Chip NFC Spotify",
  "mw-cn-1836100": "Đèn tranh thấu quang Lithophane Ngọn Núi Vàng",
  "mw-cn-1147539": "Biển tên chức danh để bàn Khắc Chữ 3D"
};

const products = JSON.parse(fs.readFileSync('products.json', 'utf8'));
const baseline = JSON.parse(fs.readFileSync('reports/typography-r1/baseline_seed.json', 'utf8'));

let tableMd = '# BẢNG SO SÁNH BIÊN TẬP TÊN SẢN PHẨM R1 (55 SKUs)\n\n';
tableMd += '| STT | SKU | Tên Cũ (Baseline) | Tên Mới (Atelier Curated) | Lý Do Biên Tập |\n';
tableMd += '| --- | --- | --- | --- | --- |\n';

products.forEach((p, i) => {
  const oldTitle = p.cleanTitle || p.title;
  const newTitle = curatedTitles[p.id] || oldTitle;
  p.cleanTitle = newTitle;

  let reason = 'Chuẩn hóa định danh Atelier: Vật thể + Đặc tính + Tên riêng';
  if (/len dệt/i.test(oldTitle)) reason = 'Đổi "len dệt" sang "Vân Dệt" chính xác cấu trúc in 3D FDM';
  else if (/khay.*sweet silk/i.test(oldTitle) && p.id === 'mw-cn-2084928') reason = 'Sửa danh từ sai ("khay" -> "ống cắm cọ") khớp ảnh thực tế';
  else if (/chống rơi dây|quầy cafe vỉa hè|giải đố cơ khí/i.test(oldTitle)) reason = 'Loại bỏ từ khóa SEO rác, tinh giản nhịp chữ Atelier';

  tableMd += `| ${i + 1} | \`${p.id}\` | ${oldTitle} | **${newTitle}** | ${reason} |\n`;
});

fs.writeFileSync('products.json', JSON.stringify(products, null, 2) + '\n', 'utf8');
fs.writeFileSync('reports/typography-r1/title_migration_table.md', tableMd, 'utf8');
console.log('Successfully updated 55 products in products.json and generated comparison table.');
