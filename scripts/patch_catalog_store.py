# scripts/patch_catalog_store.py
import json, io, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
STORE_JS = ROOT / "js" / "catalog-store.js"
NEW_SEEDS_PATH = ROOT / "reports" / "mw105-r1" / "new_50_seeds.json"

with open(STORE_JS, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update Revision
assert "const CURRENT_CATALOG_REVISION = 'mw-55-v5-compact-tabs';" in content or "CURRENT_CATALOG_REVISION = 'mw-55-v2';" in content
if "const CURRENT_CATALOG_REVISION = 'mw-55-v5-compact-tabs';" in content:
    content = content.replace("const CURRENT_CATALOG_REVISION = 'mw-55-v5-compact-tabs';", "const CURRENT_CATALOG_REVISION = 'mw-105-v1-full';")

# 2. Add 50 new seeds
with open(NEW_SEEDS_PATH, "r", encoding="utf-8") as f:
    new_seeds = json.load(f)

formatted_seeds = []
for mid, info in new_seeds.items():
    formatted_seeds.append(f'  "{mid}": {{\n    "title": {json.dumps(info["title"], ensure_ascii=False)},\n    "cleanTitle": {json.dumps(info["cleanTitle"], ensure_ascii=False)}\n  }}')
new_seeds_block = ",\n" + ",\n".join(formatted_seeds) + "\n};"

target_end = '  "mw-cn-1147539": {\n    "title": "Biển tên/biển hiệu để bàn texture cao cấp tùy biến chữ (Creative Customizable 3D Sign / Nameplate)",\n    "cleanTitle": "Biển Tên Chức Danh Để Bàn Texture Cao Cấp Khắc Chữ"\n  }\n};'

assert target_end in content, "Could not find target_end in catalog-store.js"
replacement_end = target_end[:-2] + new_seeds_block
content = content.replace(target_end, replacement_end)

# 3. Add 2 new categories to fallback registry
fallback_target = """    Ca_Nhan_Hoa_NFC: {
      id: 'Ca_Nhan_Hoa_NFC',
      shortName: 'Cá Nhân Hóa & NFC',
      title: 'Sản Phẩm Cá Nhân Hóa, Biển Số Xe, Mã QR & Móc Khóa NFC',
      accentColor: '#7C3AED',
      accentBg: '#F3E8FF',
      icon: 'fa-fingerprint',
      badgeText: '✦ Smart Custom'
    }
  };"""

fallback_replacement = """    Ca_Nhan_Hoa_NFC: {
      id: 'Ca_Nhan_Hoa_NFC',
      shortName: 'Cá Nhân Hóa',
      title: 'Sản Phẩm Cá Nhân Hóa, Biển Số Xe, Mã QR & Móc Khóa NFC',
      accentColor: '#7C3AED',
      accentBg: '#F3E8FF',
      icon: 'fa-fingerprint',
      badgeText: '✦ Smart Custom'
    },
    Hoa_Decor_Kim_Loai: {
      id: 'Hoa_Decor_Kim_Loai',
      shortName: 'Hoa Kim Loại',
      title: 'Nghệ Thuật Thực Vật Kim Loại Lỏng & Hoa Thủy Ngân Siêu Thực',
      accentColor: '#0D9488',
      accentBg: '#F0FDFA',
      icon: 'fa-gem',
      badgeText: '✦ Kim Loại Lỏng'
    },
    Moc_Khoa_Clicker_Viral: {
      id: 'Moc_Khoa_Clicker_Viral',
      shortName: 'Clicker Viral',
      title: 'Móc Khóa Âm Thanh, Clicker Cơ Học & Fidget Xả Stress Siêu Viral',
      accentColor: '#F43F5E',
      accentBg: '#FFF1F2',
      icon: 'fa-bullseye',
      badgeText: '✦ Xả Stress'
    }
  };"""

assert fallback_target in content, "Could not find fallback_target in catalog-store.js"
content = content.replace(fallback_target, fallback_replacement)

with open(STORE_JS, "w", encoding="utf-8") as f:
    f.write(content)

print("Successfully patched js/catalog-store.js!")
