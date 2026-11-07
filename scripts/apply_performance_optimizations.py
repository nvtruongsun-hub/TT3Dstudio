import re
import os

print("Applying Web Performance & Display Lag Optimizations...")

# 1. Update index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1a. Add defer to non-deferred <script> tags in <head>
def defer_head_scripts(match):
    head_content = match.group(0)
    # Match <script src="..."> that doesn't have defer or type="module"
    def add_defer(s_match):
        tag = s_match.group(0)
        if 'defer' in tag or 'type="module"' in tag or 'type=\'module\'' in tag:
            return tag
        return tag.replace('<script ', '<script defer ')
    
    updated_head = re.sub(r'<script\s+[^>]*src=[\'"][^\'"]+[\'"][^>]*>', add_defer, head_content)
    return updated_head

html = re.sub(r'<head>.*?</head>', defer_head_scripts, html, flags=re.DOTALL)

# 1b. Bento cards pictures & loading="lazy" decoding="async"
bento_replacements = [
    (
        '<img src="assets/images/studio-mechanical-parts.jpg" alt="Bàn làm việc &amp; Cơ khí" class="bento-card-bg-img" onerror="this.onerror=null; this.src=\'assets/images/logo-premium-mark.svg\';">',
        '<picture class="bento-card-bg-img"><source srcset="assets/images/studio-mechanical-parts.webp" type="image/webp"><img src="assets/images/studio-mechanical-parts.jpg" alt="Bàn làm việc &amp; Cơ khí" class="w-full h-full object-cover" loading="lazy" decoding="async" onerror="this.onerror=null; this.src=\'assets/images/logo-premium-mark.svg\';"></picture>'
    ),
    (
        '<img src="assets/images/studio-desk-tray.jpg" alt="Góc trang điểm Coquette" class="bento-card-bg-img" onerror="this.onerror=null; this.src=\'assets/images/logo-premium-mark.svg\';">',
        '<picture class="bento-card-bg-img"><source srcset="assets/images/studio-desk-tray.webp" type="image/webp"><img src="assets/images/studio-desk-tray.jpg" alt="Góc trang điểm Coquette" class="w-full h-full object-cover" loading="lazy" decoding="async" onerror="this.onerror=null; this.src=\'assets/images/logo-premium-mark.svg\';"></picture>'
    ),
    (
        '<img src="assets/images/products/thumb_2595057.png?v=20261101-hd" alt="Hoa kim loại lỏng Y3K" class="bento-card-bg-img" onerror="this.onerror=null; this.src=\'assets/images/logo-premium-mark.svg\';">',
        '<picture class="bento-card-bg-img"><source srcset="assets/images/products/thumb_2595057.webp" type="image/webp"><img src="assets/images/products/thumb_2595057.png?v=20261101-hd" alt="Hoa kim loại lỏng Y3K" class="w-full h-full object-cover" loading="lazy" decoding="async" onerror="this.onerror=null; this.src=\'assets/images/logo-premium-mark.svg\';"></picture>'
    ),
    (
        '<img src="assets/images/products/thumb_2680027.png?v=20261101-hd" alt="Mõ tụng kinh giải nghiệp" class="bento-card-bg-img" onerror="this.onerror=null; this.src=\'assets/images/logo-premium-mark.svg\';">',
        '<picture class="bento-card-bg-img"><source srcset="assets/images/products/thumb_2680027.webp" type="image/webp"><img src="assets/images/products/thumb_2680027.png?v=20261101-hd" alt="Mõ tụng kinh giải nghiệp" class="w-full h-full object-cover" loading="lazy" decoding="async" onerror="this.onerror=null; this.src=\'assets/images/logo-premium-mark.svg\';"></picture>'
    ),
    (
        '<img src="assets/images/studio-soft-serve-lamp.jpg" alt="Đèn Decor &amp; Bình hoa" class="bento-card-bg-img" onerror="this.onerror=null; this.src=\'assets/images/logo-premium-mark.svg\';">',
        '<picture class="bento-card-bg-img"><source srcset="assets/images/studio-soft-serve-lamp.webp" type="image/webp"><img src="assets/images/studio-soft-serve-lamp.jpg" alt="Đèn Decor &amp; Bình hoa" class="w-full h-full object-cover" loading="lazy" decoding="async" onerror="this.onerror=null; this.src=\'assets/images/logo-premium-mark.svg\';"></picture>'
    )
]

for orig, repl in bento_replacements:
    if orig in html:
        html = html.replace(orig, repl)
        print("  + Replaced bento image with WebP picture")
    else:
        print(f"  ! Warning: could not find exact bento img in html: {orig[:40]}...")

# 1c. Hero showcase WebP picture
hero_orig = '''                  <img id="hero-showcase-img" 
                       src="assets/images/products/thumb_1646129.png?v=20261101-hd" width="700" height="525" fetchpriority="high" 
                       alt="Khay đĩa lụa mềm thắt nơ Coquette" 
                       class="w-full h-full object-cover object-center">'''

hero_repl = '''                  <picture id="hero-showcase-picture" class="w-full h-full block">
                    <source id="hero-showcase-source" srcset="assets/images/products/thumb_1646129.webp" type="image/webp">
                    <img id="hero-showcase-img" 
                         src="assets/images/products/thumb_1646129.png?v=20261101-hd" width="700" height="525" fetchpriority="high" decoding="async"
                         alt="Khay đĩa lụa mềm thắt nơ Coquette" 
                         class="w-full h-full object-cover object-center">
                  </picture>'''

if hero_orig in html:
    html = html.replace(hero_orig, hero_repl)
    print("  + Replaced hero showcase with WebP picture")
else:
    # Try normalized spacing
    html = re.sub(
        r'<img\s+id="hero-showcase-img"[^>]+>',
        hero_repl.strip(),
        html
    )
    print("  + Replaced hero showcase with regex")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("[OK] index.html updated successfully.")


# 2. Update js/products-manager.js
with open('js/products-manager.js', 'r', encoding='utf-8') as f:
    pm = f.read()

# Replace image rendering inside buildProductCardHTML
pm_target_pattern = r'(function buildProductCardHTML\(item\) \{.*?const original = [^;]+;)'
pm_match = re.search(pm_target_pattern, pm, re.DOTALL)
if pm_match:
    prefix = pm_match.group(1)
    new_prefix = prefix + '\n    const rawImg = sanitizeImageUrl(item.image);\n    const webpImg = rawImg.replace(/\\.(png|jpe?g)($|\\?)/i, \'.webp$2\');'
    pm = pm.replace(prefix, new_prefix, 1)

pm_img_pattern = r'<img\s+src="\$\{sanitizeImageUrl\(item\.image\)\}"\s+width="600"\s+height="600"\s+loading="lazy"\s+decoding="async"\s+alt="([^"]+)"\s+onerror="([^"]+)">'
pm_img_repl = r'''<picture class="catalog-product-picture">
            <source srcset="${webpImg}" type="image/webp">
            <img src="${rawImg}" width="600" height="600" loading="lazy" decoding="async" alt="\1" onerror="\2">
          </picture>'''

pm, count = re.subn(pm_img_pattern, pm_img_repl, pm, count=1)
if count > 0:
    print(f"  + Replaced buildProductCardHTML image with <picture> WebP tag")
else:
    print(f"  ! Warning: buildProductCardHTML image regex did not match")

with open('js/products-manager.js', 'w', encoding='utf-8') as f:
    f.write(pm)
print("[OK] js/products-manager.js updated successfully.")


# 3. Update js/app.js to support hero showcase picture source
with open('js/app.js', 'r', encoding='utf-8') as f:
    app_js = f.read()

hero_swap_target = "if (window.TTInterfaceMotion) window.TTInterfaceMotion.swapHeroImage(imgEl, targetSrc, alt);"
hero_swap_replacement = """// Update picture WebP source if present
        const sourceEl = document.getElementById('hero-showcase-source');
        if (sourceEl) {
          sourceEl.srcset = targetSrc.replace(/\\.(png|jpe?g)($|\\?)/i, '.webp$2');
        }
        if (window.TTInterfaceMotion) window.TTInterfaceMotion.swapHeroImage(imgEl, targetSrc, alt);"""

if hero_swap_target in app_js:
    app_js = app_js.replace(hero_swap_target, hero_swap_replacement, 1)
    print("  + Added WebP source update to switchHeroShowcase in js/app.js")

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(app_js)
print("[OK] js/app.js updated successfully.")


# 4. Update css/catalog.css with content-visibility
with open('css/catalog.css', 'r', encoding='utf-8') as f:
    cat_css = f.read()

card_target = "#store-catalog .catalog-product-card {\n  --product-ink: #141413;"
card_replacement = """#store-catalog .catalog-product-card {
  /* Modern Web Guidance: Skip off-screen card layout & paint calculations */
  content-visibility: auto;
  contain-intrinsic-size: auto none auto 380px;
  --product-ink: #141413;"""

if card_target in cat_css:
    cat_css = cat_css.replace(card_target, card_replacement, 1)
    print("  + Added content-visibility to catalog-product-card in css/catalog.css")
else:
    # Try with \r\n
    card_target_crlf = "#store-catalog .catalog-product-card {\r\n  --product-ink: #141413;"
    if card_target_crlf in cat_css:
        cat_css = cat_css.replace(card_target_crlf, card_replacement.replace('\n', '\r\n'), 1)
        print("  + Added content-visibility (CRLF) to catalog-product-card in css/catalog.css")

# Also add offscreen section containment
section_containment = """
/* Modern Web Guidance: Off-screen sections skip layout until scrolled near viewport */
#home-shop-the-look,
#view-inspiration,
#view-tracking,
#view-support {
  content-visibility: auto;
  contain-intrinsic-size: auto none auto 600px;
}
"""
if "#home-shop-the-look" not in cat_css:
    cat_css += section_containment
    print("  + Added content-visibility to offscreen sections in css/catalog.css")

with open('css/catalog.css', 'w', encoding='utf-8') as f:
    f.write(cat_css)
print("[OK] css/catalog.css updated successfully.")


# 5. Update css/interface-motion.css
with open('css/interface-motion.css', 'r', encoding='utf-8') as f:
    motion_css = f.read()

# Neutralize continuous 60fps atelier-photo-drift and heavy atelier-orbit
motion_css = re.sub(
    r'@keyframes atelier-photo-drift\s*\{[^}]+\}',
    '@keyframes atelier-photo-drift { 0%, 100% { transform: none; } }',
    motion_css
)

motion_css = re.sub(
    r'@keyframes atelier-orbit\s*\{[^}]+\}',
    '@keyframes atelier-orbit { 0%, 100% { transform: none; } }',
    motion_css
)

with open('css/interface-motion.css', 'w', encoding='utf-8') as f:
    f.write(motion_css)
print("[OK] css/interface-motion.css updated successfully.")

print("\nALL PERFORMANCE OPTIMIZATIONS APPLIED!")
