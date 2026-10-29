const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

const target = 'id="store-category-filters" role="group" aria-label="Bộ lọc danh mục">';
const closeDiv = '</div>\n          </div>';
const closeDivCrlf = '</div>\r\n          </div>';

const subFilterHtml = `\n            <!-- Sub-Category Filter Pills (Dynamic 2nd Tier Taxonomy) -->\n            <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1" id="store-sub-filters" role="group" aria-label="Bộ lọc phân loại chi tiết"></div>`;

if (!html.includes('id="store-sub-filters"')) {
  if (html.includes(closeDivCrlf)) {
    html = html.replace(closeDivCrlf, '</div>' + subFilterHtml + '\r\n          </div>');
    fs.writeFileSync(indexPath, html, 'utf8');
    console.log('Added #store-sub-filters (CRLF)');
  } else if (html.includes(closeDiv)) {
    html = html.replace(closeDiv, '</div>' + subFilterHtml + '\n          </div>');
    fs.writeFileSync(indexPath, html, 'utf8');
    console.log('Added #store-sub-filters (LF)');
  } else {
    console.error('Could not find insertion point');
  }
} else {
  console.log('#store-sub-filters already present');
}
