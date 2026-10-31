# scripts/patch_products_manager.py
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FILE_PATH = ROOT / "js" / "products-manager.js"

with open(FILE_PATH, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add categories to DEFAULT_CATEGORY_METADATA
target_meta = """    Ca_Nhan_Hoa_NFC: {
      id: 'Ca_Nhan_Hoa_NFC',
      shortName: 'Cá Nhân Hóa & NFC',
      title: 'Sản Phẩm Cá Nhân Hóa, Biển Số Xe, Mã QR & Móc Khóa NFC',
      accentColor: '#7C3AED',
      icon: 'fa-fingerprint',
      badgeText: '✦ Smart Custom'
    }
  };"""

replacement_meta = """    Ca_Nhan_Hoa_NFC: {
      id: 'Ca_Nhan_Hoa_NFC',
      shortName: 'Cá Nhân Hóa',
      title: 'Sản Phẩm Cá Nhân Hóa, Biển Số Xe, Mã QR & Móc Khóa NFC',
      accentColor: '#7C3AED',
      icon: 'fa-fingerprint',
      badgeText: '✦ Smart Custom'
    },
    Hoa_Decor_Kim_Loai: {
      id: 'Hoa_Decor_Kim_Loai',
      shortName: 'Hoa Kim Loại',
      title: 'Nghệ Thuật Thực Vật Kim Loại Lỏng & Hoa Thủy Ngân Siêu Thực',
      accentColor: '#0D9488',
      icon: 'fa-gem',
      badgeText: '✦ Kim Loại Lỏng'
    },
    Moc_Khoa_Clicker_Viral: {
      id: 'Moc_Khoa_Clicker_Viral',
      shortName: 'Clicker Viral',
      title: 'Móc Khóa Âm Thanh, Clicker Cơ Học & Fidget Xả Stress Siêu Viral',
      accentColor: '#F43F5E',
      icon: 'fa-bullseye',
      badgeText: '✦ Xả Stress'
    }
  };"""

# Normalize \r\n for matching
content_normalized = content.replace("\r\n", "\n")
target_meta_norm = target_meta.replace("\r\n", "\n")
replacement_meta_norm = replacement_meta.replace("\r\n", "\n")

assert target_meta_norm in content_normalized, "Could not find target_meta in products-manager.js"
content_normalized = content_normalized.replace(target_meta_norm, replacement_meta_norm)

# 2. Add refreshCategoryCounts function
refresh_fn = """  // Refresh Dynamic Category Counts (Codex Directive TT3D-MW105-R1)
  function refreshCategoryCounts() {
    if (!window.TTCatalogStore || typeof window.TTCatalogStore.getProductsSync !== 'function') return;
    const products = window.TTCatalogStore.getProductsSync(true);
    const counts = new Map([['all', products.length]]);

    for (const product of products) {
      counts.set(
        product.category,
        (counts.get(product.category) || 0) + 1
      );
    }

    document
      .querySelectorAll('#store-catalog .catalog-categories [data-category]')
      .forEach(button => {
        const countEl = button.querySelector('.catalog-pill-count');
        if (countEl) {
          countEl.textContent = `(${counts.get(button.dataset.category) || 0})`;
        }
      });
  }

  window.refreshCategoryCounts = refreshCategoryCounts;
"""

target_init_event = """  window.addEventListener('tt_products_updated', () => {
    renderStoreProducts(currentCategoryFilter);
    renderCuratedProducts();
  });"""

replacement_init_event = refresh_fn + """  window.addEventListener('tt_products_updated', () => {
    refreshCategoryCounts();
    renderStoreProducts(currentCategoryFilter);
    renderCuratedProducts();
  });"""

target_init_event_norm = target_init_event.replace("\r\n", "\n")
replacement_init_event_norm = replacement_init_event.replace("\r\n", "\n")

assert target_init_event_norm in content_normalized, "Could not find target_init_event in products-manager.js"
content_normalized = content_normalized.replace(target_init_event_norm, replacement_init_event_norm)

# Also call refreshCategoryCounts in init()
target_render_store = "    renderStoreProducts(currentCategoryFilter);"
replacement_render_store = "    refreshCategoryCounts();\n    renderStoreProducts(currentCategoryFilter);"
content_normalized = content_normalized.replace(target_render_store, replacement_render_store, 1)

# Write back preserving \r\n
with open(FILE_PATH, "w", encoding="utf-8", newline="\r\n") as f:
    f.write(content_normalized.replace("\n", "\r\n"))

print("Successfully patched js/products-manager.js!")
