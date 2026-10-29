const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');
let content = fs.readFileSync(indexPath, 'utf8');

const targetRegex = /<!-- =+[\r\n\s]+VIEW 3: GÓC CẢM HỨNG[\s\S]+?<\/div>[\s\n\r]+<\/div>[\s\n\r]+<\/div>/;

const newInspirationHtml = `<!-- =======================================================================
         VIEW 3: GÓC CẢM HỨNG (SHOPPABLE INSPIRATION LOOKBOOK - 100% REAL SKU SYNC)
         ======================================================================= -->
    <div id="view-inspiration" class="app-workspace hidden py-12" role="tabpanel" tabindex="0" aria-label="Góc Cảm Hứng">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div class="space-y-2">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#DCDDD5] text-xs font-bold font-mono text-[#586057]">
            <i class="fa-solid fa-compass-drafting text-[#FF5C00]"></i>
            <span>SETUP &amp; PHỐI CẢNH THỰC TẾ</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-[#20231F]">Ý tưởng cho góc sống của bạn.</h2>
          <p class="text-xs sm:text-sm text-[#586057] max-w-2xl leading-relaxed">
            Các bộ phối sản phẩm thực tế từ xưởng T&amp;T 3D. Mỗi set đều liên kết trực tiếp với sản phẩm có thật trong xưởng, mua trọn bộ tiết kiệm ngay 10% chi phí.
          </p>
        </div>

        <div class="space-y-12">
          
          <!-- SETUP 1: BÀN LÀM VIỆC CƠ KHÍ & TỐI GIẢN -->
          <div class="setup-card p-6 sm:p-8 bg-white rounded-3xl border border-[#DCDDD5] shadow-xs">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <!-- Split Collage of 2 Real Products in Setup 1 -->
              <div class="lg:col-span-7 grid grid-cols-2 gap-3 aspect-[16/10] bg-[#F7F6F2] p-3 rounded-2xl border border-[#E5E4DE] overflow-hidden">
                <div class="relative rounded-xl overflow-hidden bg-white border border-[#E5E4DE] group cursor-pointer" onclick="window.openProductDetailModal('mw-cn-1971424')">
                  <img src="assets/images/products/thumb_1971424.png" alt="Hộp bánh xe đu quay Ferris xoay cơ học" class="w-full h-full object-cover group-hover:scale-105 transition-transform">
                  <div class="absolute bottom-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-md">Ferris 360°</div>
                </div>
                <div class="relative rounded-xl overflow-hidden bg-white border border-[#E5E4DE] group cursor-pointer" onclick="window.openProductDetailModal('mw-cn-1404920')">
                  <img src="assets/images/products/thumb_1404920.png" alt="Hệ module ngăn kéo xếp chồng mini Pork3D" class="w-full h-full object-cover group-hover:scale-105 transition-transform">
                  <div class="absolute bottom-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-md">Module Mini</div>
                </div>
              </div>

              <div class="lg:col-span-5 space-y-5">
                <span class="text-xs font-mono font-bold text-[#D45B34] uppercase tracking-wider">Setup 01 • Bàn Làm Việc</span>
                <h3 class="text-xl sm:text-2xl font-bold text-[#20231F]">Góc Làm Việc Cơ Khí &amp; Tối Giản</h3>
                <p class="text-xs text-[#586057] leading-relaxed">
                  Thiết kế góc bàn làm việc cơ học thông minh: Hộp bánh xe Ferris xoay 360° cất giữ phụ kiện nhỏ kết hợp hệ module ngăn kéo mini xếp tầng gọn gàng.
                </p>

                <!-- Hotspot items in this scene -->
                <div class="space-y-2 pt-2 border-t border-slate-100">
                  <div class="text-xs font-bold text-[#20231F]">Sản phẩm thật trong ảnh:</div>
                  <div class="space-y-2">
                    <div class="flex items-center justify-between p-2 rounded-xl bg-[#F7F6F2] hover:bg-orange-50/50 cursor-pointer transition-colors" onclick="window.openProductDetailModal('mw-cn-1971424')">
                      <div class="flex items-center gap-2.5">
                        <img src="assets/images/products/thumb_1971424.png" alt="Ferris" class="w-9 h-9 rounded-lg object-cover border border-[#E5E4DE]">
                        <div>
                          <div class="text-xs font-bold text-[#20231F]">Hộp đu quay Ferris xoay cơ học</div>
                          <div class="text-[10px] font-mono text-[#8A847C]">mw-cn-1971424 · Khối cơ khí 360°</div>
                        </div>
                      </div>
                      <span class="font-mono font-bold text-xs text-[#D45B34]">239.000 đ</span>
                    </div>

                    <div class="flex items-center justify-between p-2 rounded-xl bg-[#F7F6F2] hover:bg-orange-50/50 cursor-pointer transition-colors" onclick="window.openProductDetailModal('mw-cn-1404920')">
                      <div class="flex items-center gap-2.5">
                        <img src="assets/images/products/thumb_1404920.png" alt="Module Pork3D" class="w-9 h-9 rounded-lg object-cover border border-[#E5E4DE]">
                        <div>
                          <div class="text-xs font-bold text-[#20231F]">Hệ module ngăn kéo xếp chồng Pork3D</div>
                          <div class="text-[10px] font-mono text-[#8A847C]">mw-cn-1404920 · Ngàm khóa module</div>
                        </div>
                      </div>
                      <span class="font-mono font-bold text-xs text-[#D45B34]">219.000 đ</span>
                    </div>
                  </div>
                </div>

                <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span class="text-[11px] text-[#586057] block">Giá trọn bộ 2 món (Giảm 10%):</span>
                    <span class="text-xl font-mono font-bold text-[#D45B34]">412.000 đ</span>
                    <span class="text-xs text-slate-400 line-through ml-2">458.000 đ</span>
                  </div>
                  <button type="button" 
                          onclick="window.TTCart.addItem({id:'mw-cn-1971424', title:'Hộp Bánh Xe Đu Quay Ferris Xoay Cơ Học', price:239000, qty:1}); window.TTCart.addItem({id:'mw-cn-1404920', title:'Hệ Module Ngăn Kéo Xếp Chồng Mini Pork3D', price:219000, qty:1}); window.TTCart.openCart();" 
                          class="btn-primary text-xs !py-3 !px-4">
                    Mua Trọn Bộ
                  </button>
                </div>
              </div>

            </div>
          </div>

          <!-- SETUP 2: BÀN TRANG ĐIỂM NƠ LỤA & COQUETTE -->
          <div class="setup-card p-6 sm:p-8 bg-white rounded-3xl border border-[#DCDDD5] shadow-xs">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <!-- Split Collage of 2 Real Products in Setup 2 -->
              <div class="lg:col-span-7 grid grid-cols-2 gap-3 aspect-[16/10] bg-[#FFF1F2]/60 p-3 rounded-2xl border border-rose-200 overflow-hidden">
                <div class="relative rounded-xl overflow-hidden bg-white border border-rose-200 group cursor-pointer" onclick="window.openProductDetailModal('mw-cn-2084928')">
                  <img src="assets/images/products/thumb_2084928.png" alt="Khay đựng son nơ lụa Sweet Silk" class="w-full h-full object-cover group-hover:scale-105 transition-transform">
                  <div class="absolute bottom-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-md">Sweet Silk</div>
                </div>
                <div class="relative rounded-xl overflow-hidden bg-white border border-rose-200 group cursor-pointer" onclick="window.openProductDetailModal('mw-cn-2531095')">
                  <img src="assets/images/products/thumb_2531095.png" alt="Bình cắm cọ Deluxe cánh bướm" class="w-full h-full object-cover group-hover:scale-105 transition-transform">
                  <div class="absolute bottom-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-md">Deluxe Caddy</div>
                </div>
              </div>

              <div class="lg:col-span-5 space-y-5">
                <span class="text-xs font-mono font-bold text-rose-500 uppercase tracking-wider">Setup 02 • Bàn Trang Điểm</span>
                <h3 class="text-xl sm:text-2xl font-bold text-[#20231F]">Góc Bàn Trang Điểm Nơ Lụa &amp; Coquette</h3>
                <p class="text-xs text-[#586057] leading-relaxed">
                  Tone hồng pastel và trắng ngọc trai dịu ngọt: Khay đựng son nước hoa Sweet Silk kết hợp bình cắm cọ nếp lụa cánh bướm lớn chuẩn gu Coquette.
                </p>

                <!-- Hotspot items in this scene -->
                <div class="space-y-2 pt-2 border-t border-slate-100">
                  <div class="text-xs font-bold text-[#20231F]">Sản phẩm thật trong ảnh:</div>
                  <div class="space-y-2">
                    <div class="flex items-center justify-between p-2 rounded-xl bg-[#F7F6F2] hover:bg-rose-50/50 cursor-pointer transition-colors" onclick="window.openProductDetailModal('mw-cn-2084928')">
                      <div class="flex items-center gap-2.5">
                        <img src="assets/images/products/thumb_2084928.png" alt="Sweet Silk" class="w-9 h-9 rounded-lg object-cover border border-[#E5E4DE]">
                        <div>
                          <div class="text-xs font-bold text-[#20231F]">Khay đựng son nước hoa nơ lụa Sweet Silk</div>
                          <div class="text-[10px] font-mono text-[#8A847C]">mw-cn-2084928 · Nhựa Bio-PLA Silk</div>
                        </div>
                      </div>
                      <span class="font-mono font-bold text-xs text-rose-500">139.000 đ</span>
                    </div>

                    <div class="flex items-center justify-between p-2 rounded-xl bg-[#F7F6F2] hover:bg-rose-50/50 cursor-pointer transition-colors" onclick="window.openProductDetailModal('mw-cn-2531095')">
                      <div class="flex items-center gap-2.5">
                        <img src="assets/images/products/thumb_2531095.png" alt="Bình cắm cọ" class="w-9 h-9 rounded-lg object-cover border border-[#E5E4DE]">
                        <div>
                          <div class="text-xs font-bold text-[#20231F]">Bình cắm cọ Deluxe cánh bướm nơ đôi</div>
                          <div class="text-[10px] font-mono text-[#8A847C]">mw-cn-2531095 · Dung tích 20 cọ</div>
                        </div>
                      </div>
                      <span class="font-mono font-bold text-xs text-rose-500">165.000 đ</span>
                    </div>
                  </div>
                </div>

                <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span class="text-[11px] text-[#586057] block">Giá trọn bộ 2 món (Giảm 10%):</span>
                    <span class="text-xl font-mono font-bold text-rose-500">273.000 đ</span>
                    <span class="text-xs text-slate-400 line-through ml-2">304.000 đ</span>
                  </div>
                  <button type="button" 
                          onclick="window.TTCart.addItem({id:'mw-cn-2084928', title:'Khay Đựng Son & Nước Hoa Nơ Lụa Sweet Silk', price:139000, qty:1}); window.TTCart.addItem({id:'mw-cn-2531095', title:'Bình Cắm Cọ Deluxe Cánh Bướm Nơ Đôi', price:165000, qty:1}); window.TTCart.openCart();" 
                          class="btn-primary text-xs !py-3 !px-4">
                    Mua Trọn Bộ
                  </button>
                </div>
              </div>

            </div>
          </div>

          <!-- SETUP 3: QUẦY THU NGÂN & CAFE CHẠM THÔNG MINH -->
          <div class="setup-card p-6 sm:p-8 bg-white rounded-3xl border border-[#DCDDD5] shadow-xs">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <!-- Split Collage of 2 Real Products in Setup 3 -->
              <div class="lg:col-span-7 grid grid-cols-2 gap-3 aspect-[16/10] bg-[#EBF3F5]/60 p-3 rounded-2xl border border-sky-200 overflow-hidden">
                <div class="relative rounded-xl overflow-hidden bg-white border border-sky-200 group cursor-pointer" onclick="window.openProductDetailModal('mw-cn-1769352')">
                  <img src="assets/images/products/thumb_1769352.png" alt="Biển mã QR quầy thu ngân thẻ trượt" class="w-full h-full object-cover group-hover:scale-105 transition-transform">
                  <div class="absolute bottom-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-md">Standee QR</div>
                </div>
                <div class="relative rounded-xl overflow-hidden bg-white border border-sky-200 group cursor-pointer" onclick="window.openProductDetailModal('mw-cn-1147539')">
                  <img src="assets/images/products/thumb_1147539.png" alt="Biển tên chức danh để bàn khắc chữ" class="w-full h-full object-cover group-hover:scale-105 transition-transform">
                  <div class="absolute bottom-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-md">Biển Tên 3D</div>
                </div>
              </div>

              <div class="lg:col-span-5 space-y-5">
                <span class="text-xs font-mono font-bold text-sky-600 uppercase tracking-wider">Setup 03 • Quán Cafe &amp; Cửa Hàng</span>
                <h3 class="text-xl sm:text-2xl font-bold text-[#20231F]">Quầy Thu Ngân &amp; Cafe Chạm Thông Minh</h3>
                <p class="text-xs text-[#586057] leading-relaxed">
                  Giải pháp chuyên nghiệp cho cửa hàng &amp; quán cafe: Biển mã QR thẻ trượt chuyển khoản nhanh kết hợp biển tên thương hiệu in nổi 3D sắc nét.
                </p>

                <!-- Hotspot items in this scene -->
                <div class="space-y-2 pt-2 border-t border-slate-100">
                  <div class="text-xs font-bold text-[#20231F]">Sản phẩm thật trong ảnh:</div>
                  <div class="space-y-2">
                    <div class="flex items-center justify-between p-2 rounded-xl bg-[#F7F6F2] hover:bg-sky-50/50 cursor-pointer transition-colors" onclick="window.openProductDetailModal('mw-cn-1769352')">
                      <div class="flex items-center gap-2.5">
                        <img src="assets/images/products/thumb_1769352.png" alt="Biển QR" class="w-9 h-9 rounded-lg object-cover border border-[#E5E4DE]">
                        <div>
                          <div class="text-xs font-bold text-[#20231F]">Biển mã QR quầy thu ngân thẻ trượt</div>
                          <div class="text-[10px] font-mono text-[#8A847C]">mw-cn-1769352 · Quét ngân hàng kép</div>
                        </div>
                      </div>
                      <span class="font-mono font-bold text-xs text-sky-600">69.000 đ</span>
                    </div>

                    <div class="flex items-center justify-between p-2 rounded-xl bg-[#F7F6F2] hover:bg-sky-50/50 cursor-pointer transition-colors" onclick="window.openProductDetailModal('mw-cn-1147539')">
                      <div class="flex items-center gap-2.5">
                        <img src="assets/images/products/thumb_1147539.png" alt="Biển tên 3D" class="w-9 h-9 rounded-lg object-cover border border-[#E5E4DE]">
                        <div>
                          <div class="text-xs font-bold text-[#20231F]">Biển tên chức danh để bàn khắc chữ 3D</div>
                          <div class="text-[10px] font-mono text-[#8A847C]">mw-cn-1147539 · Tùy biến nội dung riêng</div>
                        </div>
                      </div>
                      <span class="font-mono font-bold text-xs text-sky-600">99.000 đ</span>
                    </div>
                  </div>
                </div>

                <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span class="text-[11px] text-[#586057] block">Giá trọn bộ 2 món (Giảm 10%):</span>
                    <span class="text-xl font-mono font-bold text-sky-600">151.000 đ</span>
                    <span class="text-xs text-slate-400 line-through ml-2">168.000 đ</span>
                  </div>
                  <button type="button" 
                          onclick="window.TTCart.addItem({id:'mw-cn-1769352', title:'Biển Mã QR Quầy Thu Ngân Thẻ Trượt', price:69000, qty:1}); window.TTCart.addItem({id:'mw-cn-1147539', title:'Biển Tên Chức Danh Để Bàn Khắc Chữ Theo Yêu Cầu', price:99000, qty:1}); window.TTCart.openCart();" 
                          class="btn-primary text-xs !py-3 !px-4">
                    Mua Trọn Bộ
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>`;

if (!targetRegex.test(content)) {
  console.error("Could not match inspiration section");
  process.exit(1);
}

content = content.replace(targetRegex, newInspirationHtml);
fs.writeFileSync(indexPath, content, 'utf8');
console.log("Successfully overhauled Inspiration Lookbook section with real SKU images and pricing!");
