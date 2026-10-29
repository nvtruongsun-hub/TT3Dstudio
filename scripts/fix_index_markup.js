const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Remove duplicate broken closing tags
const pattern = /\s*<\/div>\s*<\/div>\s*<\/section>\s*<section id="shop-by-need"/;
const replacement = '\n\n      <section id="shop-by-need"';

if (pattern.test(html)) {
  html = html.replace(pattern, replacement);
  console.log('Successfully removed duplicate closing section tags!');
} else {
  console.log('Pattern not found');
}

// 2. Add curated product grid section if missing
if (!html.includes('id="curated-product-grid"')) {
  const target = '<section id="store-catalog"';
  const curatedSection = `<!-- SECTION: SẢN PHẨM ĐƯỢC CHỌN (CURATED 6-8 HERO ITEMS CHO TRANG CHỦ GỌN) -->
      <section class="py-12 sm:py-16 border-b border-[#DCDDD5]">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span class="text-xs font-mono font-bold text-[#FF5C00] uppercase tracking-wider">Tuyển Chọn Nổi Bật</span>
              <h2 class="text-2xl sm:text-3xl font-extrabold text-[#20231F] mt-1">Sản Phẩm Đang Được Yêu Thích</h2>
              <p class="text-xs sm:text-sm text-[#586057] mt-1">Các thiết kế tinh xảo, tỷ lệ hoàn thiện sắc nét nhất tại xưởng T&amp;T.</p>
            </div>

            <a href="#store-catalog" class="inline-flex items-center gap-2 text-xs font-bold text-[#FF5C00] hover:text-[#C44800] transition-colors shrink-0">
              <span>Xem toàn bộ 55+ sản phẩm</span>
              <i class="fa-solid fa-arrow-right"></i>
            </a>
          </div>

          <!-- Curated Grid (Populated by products-manager.js) -->
          <div id="curated-product-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"></div>
        </div>
      </section>

      <section id="store-catalog"`;

  html = html.replace(target, curatedSection);
  console.log('Successfully added curated-product-grid section!');
}

fs.writeFileSync('index.html', html, 'utf8');
