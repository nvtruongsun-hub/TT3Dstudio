const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');
let content = fs.readFileSync(indexPath, 'utf8');

const targetSectionRegex = /<!-- =+[\r\n\s]+5\. MOBILE BOTTOM APPLICATION DOCK[\s\S]+?<\/nav>/;

const newDockHtml = `<!-- =========================================================================
       5. MOBILE BOTTOM APPLICATION DOCK (ACCESSIBLE 5-VIEW APP DOCK + FLOATING CART FAB)
       ========================================================================= -->
  <button type="button" 
          onclick="window.TTCart.openCart()" 
          class="floating-cart-fab md:hidden fixed bottom-20 right-4 z-40 w-12 h-12 rounded-full bg-[#D45B34] text-white shadow-[0_10px_25px_-5px_rgba(212,91,52,0.45)] flex items-center justify-center transition-transform active:scale-95 border-2 border-white focus:outline-none focus:ring-2 focus:ring-[#D45B34]" 
          title="Xem giỏ hàng" 
          aria-label="Xem Giỏ Hàng">
    <div class="relative flex items-center justify-center">
      <i class="fa-solid fa-bag-shopping text-base"></i>
      <span class="cart-badge-count hidden absolute -top-2.5 -right-3 min-w-[18px] h-[18px] px-1 rounded-full bg-[#111114] text-white text-[10px] font-bold flex items-center justify-center font-mono border border-white">
        0
      </span>
    </div>
  </button>

  <nav class="mobile-bottom-dock md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#DCDDD5] px-1 py-1 shadow-lg" aria-label="Điều hướng di động">
    <div class="grid grid-cols-5 items-center justify-around">
      
      <button type="button" 
              onclick="window.switchWorkspace('view-store')" 
              data-nav-view="view-store" 
              class="dock-item flex flex-col items-center py-1.5 px-1 text-[#586057] active:text-[#FF5C00]"
              aria-label="Cửa Hàng">
        <i class="fa-solid fa-store text-base"></i>
        <span class="dock-label text-[10px] font-medium mt-0.5">Cửa Hàng</span>
      </button>

      <button type="button" 
              onclick="window.switchWorkspace('view-personalize')" 
              data-nav-view="view-personalize" 
              class="dock-item flex flex-col items-center py-1.5 px-1 text-[#586057] active:text-[#FF5C00]"
              aria-label="Cá Nhân Hóa">
        <i class="fa-solid fa-wand-magic-sparkles text-base text-[#D45B34]"></i>
        <span class="dock-label text-[10px] font-medium mt-0.5">Tùy Biến</span>
      </button>

      <button type="button" 
              onclick="window.switchWorkspace('view-inspiration')" 
              data-nav-view="view-inspiration" 
              class="dock-item flex flex-col items-center py-1.5 px-1 text-[#586057] active:text-[#FF5C00]"
              aria-label="Góc Cảm Hứng">
        <i class="fa-solid fa-compass-drafting text-base text-[#FF5C00]"></i>
        <span class="dock-label text-[10px] font-medium mt-0.5">Cảm Hứng</span>
      </button>

      <button type="button" 
              onclick="window.switchWorkspace('view-tracking')" 
              data-nav-view="view-tracking" 
              class="dock-item flex flex-col items-center py-1.5 px-1 text-[#586057] active:text-[#FF5C00]"
              aria-label="Theo Dõi Đơn Hàng">
        <i class="fa-solid fa-truck-fast text-base text-blue-600"></i>
        <span class="dock-label text-[10px] font-medium mt-0.5">Đơn Hàng</span>
      </button>

      <button type="button" 
              onclick="window.switchWorkspace('view-support')" 
              data-nav-view="view-support" 
              class="dock-item flex flex-col items-center py-1.5 px-1 text-[#586057] active:text-[#FF5C00]"
              aria-label="Hướng Dẫn & Hỗ Trợ">
        <i class="fa-solid fa-circle-question text-base text-emerald-600"></i>
        <span class="dock-label text-[10px] font-medium mt-0.5">Hỗ Trợ</span>
      </button>

    </div>
  </nav>`;

if (!targetSectionRegex.test(content)) {
  console.error("Could not find mobile bottom dock section in index.html");
  process.exit(1);
}

content = content.replace(targetSectionRegex, newDockHtml);
fs.writeFileSync(indexPath, content, 'utf8');
console.log("Successfully updated mobile bottom dock in index.html");
