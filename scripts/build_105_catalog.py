#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
T&T 3D Labs - Build 105 Catalog from MakerWorld Excel with Rich Differentiation Fields
Approved by Codex Master Directive TT3D-MW105-R1
"""

import openpyxl, json, re, sys, io, os
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

ROOT_DIR = Path(__file__).resolve().parent.parent
EXCEL_PATH = Path(r"C:\Users\truongg\OneDrive - Thuyloi University\Tài liệu\01. khoi nghiep in 3d\Top_Mau_In_3D_Doc_La_Xu_The_MakerWorld.xlsx")
PRODUCTS_JSON_PATH = ROOT_DIR / "products.json"
CATEGORY_REGISTRY_PATH = ROOT_DIR / "data" / "category-registry.json"

COLOR_PALETTES = {
    "silk": [
        {"id": "silk_pearl_white", "name": "Trắng Ngọc Trai Silk", "hex": "#F0ECE1"},
        {"id": "silk_pastel_pink", "name": "Hồng Lụa Pastel", "hex": "#F7C6D0"},
        {"id": "silk_champagne", "name": "Vàng Champagne Óng", "hex": "#EED9A7"}
    ],
    "matte": [
        {"id": "matte_obsidian", "name": "Đen Obsidian Mờ", "hex": "#1E2022"},
        {"id": "matte_chalk_white", "name": "Trắng Gốm Sứ", "hex": "#F5F2EB"},
        {"id": "matte_terracotta", "name": "Cam Đất Studio", "hex": "#C85A32"}
    ],
    "retro_wood": [
        {"id": "retro_wood_brown", "name": "Nâu Gỗ Vintage", "hex": "#7D5A44"},
        {"id": "translucent_warm", "name": "Trắng Ấm Xuyên Sáng", "hex": "#FFF8E7"},
        {"id": "matte_black", "name": "Đen Khung Nhôm", "hex": "#1A1A1A"}
    ],
    "candy": [
        {"id": "candy_green", "name": "Xanh Ngọc Zootopia", "hex": "#10B981"},
        {"id": "candy_yellow", "name": "Vàng Phô Mai", "hex": "#FBBF24"},
        {"id": "candy_white", "name": "Trắng Sữa", "hex": "#F8FAFC"}
    ],
    "tech": [
        {"id": "tech_charcoal", "name": "Than Chì Taplo", "hex": "#1F2937"},
        {"id": "tech_aluminum", "name": "Xám Kim Loại", "hex": "#64748B"},
        {"id": "tech_orange", "name": "Cam Cảnh Báo", "hex": "#FF5C00"}
    ],
    "metal": [
        {"id": "metal_liquid_silver", "name": "Bạc Thủy Ngân Lỏng", "hex": "#E2E8F0"},
        {"id": "metal_molten_gold", "name": "Vàng Nóng Chảy 18K", "hex": "#F59E0B"},
        {"id": "metal_titanium_blue", "name": "Titan Ánh Xanh", "hex": "#0284C7"}
    ],
    "clicker": [
        {"id": "clicker_cat_pink", "name": "Hồng Đệm Mèo Pastel", "hex": "#FDA4AF"},
        {"id": "clicker_zen_wood", "name": "Nâu Gỗ Mõ Trầm", "hex": "#78350F"},
        {"id": "clicker_neon_lime", "name": "Xanh Chuối Neon Viral", "hex": "#84CC16"}
    ]
}

def determine_palette(mat_rec, title, cat_id):
    if cat_id == "Hoa_Decor_Kim_Loai":
        return COLOR_PALETTES["metal"]
    if cat_id == "Moc_Khoa_Clicker_Viral":
        return COLOR_PALETTES["clicker"]
    combined = (mat_rec + " " + title).lower()
    if "silk" in combined or "lụa" in combined or "ngọc trai" in combined or cat_id == "Trang_Diem_Vanity":
        return COLOR_PALETTES["silk"]
    elif "gỗ" in combined or "len" in combined or "washi" in combined or "đèn" in combined:
        return COLOR_PALETTES["retro_wood"]
    elif "clicker" in combined or "rắn" in combined or "kem" in combined or "đồ chơi" in combined or cat_id == "Do_Choi_Moc_Khoa":
        return COLOR_PALETTES["candy"]
    elif "xe" in combined or "nfc" in combined or "qr" in combined or cat_id == "Ca_Nhan_Hoa_NFC":
        return COLOR_PALETTES["tech"]
    return COLOR_PALETTES["matte"]

def determine_materials(mat_rec, cat_id):
    if cat_id == "Hoa_Decor_Kim_Loai":
        return [
            {
                "id": "pla_metal",
                "name": "PLA Ánh Kim Siêu Mịn",
                "label": "PLA Silk Metal Bóng Láng",
                "desc": "Hiệu ứng phản chiếu kim loại chất lỏng chân thực",
                "priceModifier": 0
            },
            {
                "id": "pla_chameleon",
                "name": "PLA Đổi Màu Theo Góc Nhìn",
                "label": "PLA Gradient Đa Sắc",
                "desc": "Chuyển sắc lung linh theo ánh sáng môi trường",
                "priceModifier": 25000
            }
        ]
    if cat_id == "Moc_Khoa_Clicker_Viral":
        return [
            {
                "id": "pla_tough",
                "name": "PLA Chịu Va Đập Cao",
                "label": "PLA Bền Bỉ Cơ Học",
                "desc": "Đàn hồi tốt cho cơ cấu nảy nhíp hàng vạn lần bấm",
                "priceModifier": 0
            },
            {
                "id": "petg_sound",
                "name": "PETG Âm Đanh Giòn",
                "label": "PETG Clicker Siêu Đanh",
                "desc": "Cho tiếng gõ giòn tan, nảy tay cực đã",
                "priceModifier": 15000
            }
        ]
    rec_lower = mat_rec.lower()
    mats = [
        {
            "id": "pla_matte",
            "name": "PLA Matte",
            "label": "PLA Matte Thẩm Mỹ",
            "desc": "Bề mặt mờ mịn cao cấp, triệt tiêu vân in hoàn hảo",
            "priceModifier": 0
        }
    ]
    if "silk" in rec_lower or cat_id == "Trang_Diem_Vanity":
        mats.append({
            "id": "pla_silk",
            "name": "PLA Silk Cao Cấp",
            "label": "PLA Silk Óng Ánh",
            "desc": "Hiệu ứng phản chiếu óng ả như vải lụa tơ tằm",
            "priceModifier": 20000
        })
    if "petg" in rec_lower or "taplo" in rec_lower or "nhiệt" in rec_lower or cat_id == "Ca_Nhan_Hoa_NFC":
        mats.append({
            "id": "petg_tough",
            "name": "PETG Chịu Lực & Nhiệt",
            "label": "PETG Tough Bền Bỉ",
            "desc": "Chịu nhiệt độ taplo ô tô 75°C, chống va đập",
            "priceModifier": 25000
        })
    if "xuyên sáng" in rec_lower or "translucent" in rec_lower or "đèn" in rec_lower:
        mats.append({
            "id": "pla_translucent",
            "name": "PLA Xuyên Sáng",
            "label": "PLA Xuyên Sáng Khuếch Tán",
            "desc": "Tán sắc ánh sáng LED dịu mắt, không gây chói",
            "priceModifier": 30000
        })
    return mats

def clean_product_title(vn_title: str) -> str:
    t = re.sub(r'\s*\([^)]*\)\s*$', '', vn_title).strip()
    t = re.sub(r'^[#\d\.\-\s]+', '', t).strip()
    return t

def generate_differentiation(cat: str, is_hero: bool, title: str, weight: int, idx: int) -> dict:
    """Tạo bộ thông tin phân hóa sắc nét cho 50 sản phẩm mới."""
    if is_hero:
        return {
            "archetypeBadge": "✦ Lựa Chọn Tiêu Biểu",
            "useCaseEyebrow": "SẢN PHẨM TIÊU BIỂU • BỘ SƯU TẬP ATELIER",
            "subCategory": "tieu_bieu",
            "subCategoryName": "Lựa Chọn Tiêu Biểu",
            "microSpecs": f"Thiết kế flagship chuẩn xưởng · {weight}g",
            "badgeTheme": "amber"
        }

    if cat == "Hoa_Decor_Kim_Loai":
        badges = [
            "Kim Loại Lỏng Độc Bản",
            "Hiệu Ứng Thủy Ngân",
            "Đường Nét Siêu Thực",
            "Phản Chiếu Đa Sắc",
            "Điêu Khắc Đương Đại",
            "Họa Tiết Gợn Sóng Nóng Chảy"
        ]
        themes = ["cyan", "slate", "emerald", "amber"]
        return {
            "archetypeBadge": badges[idx % len(badges)],
            "useCaseEyebrow": "TRƯNG BÀY • KIM LOẠI LỎNG ART",
            "subCategory": "hoa_kim_loai",
            "subCategoryName": "Hoa Kim Loại Lỏng",
            "microSpecs": f"Nhựa Bio-PLA Silk Ánh Kim · {weight}g",
            "badgeTheme": themes[idx % len(themes)]
        }

    if cat == "Moc_Khoa_Clicker_Viral":
        badges = [
            "Âm Thanh Đanh Giòn",
            "Cơ Chế Nảy Nhíp 100%",
            "Giải Tỏa Căng Thẳng",
            "Công Tắc Phím Cơ",
            "Âm Vang Tích Công Đức",
            "Thiết Kế Độc Lạ Viral"
        ]
        themes = ["rose", "emerald", "amber", "terracotta", "cyan"]
        return {
            "archetypeBadge": badges[idx % len(badges)],
            "useCaseEyebrow": "BỎ TÚI • FIDGET XẢ STRESS",
            "subCategory": "clicker_fidget",
            "subCategoryName": "Clicker & Fidget",
            "microSpecs": f"Nhựa PLA Tough Chịu Lực · {weight}g",
            "badgeTheme": themes[idx % len(themes)]
        }

    if cat == "Trang_Diem_Vanity":
        return {
            "archetypeBadge": "Nắp Lụa Bánh Kem Độc Đáo",
            "useCaseEyebrow": "BÀN TRANG ĐIỂM • HỘP TRANG SỨC",
            "subCategory": "hop_trang_suc",
            "subCategoryName": "Hộp Trang Sức Nắp Lụa",
            "microSpecs": f"Nhựa Bio-PLA Lụa Mịn · {weight}g",
            "badgeTheme": "rose"
        }

    if cat == "Decor_Den_Noi_That":
        badges = [
            "Nghệ Thuật Thị Giác",
            "Khuếch Tán Ánh Sáng",
            "Thiết Kế Tinh Xảo",
            "Phong Cách Bắc Âu",
            "Tạo Hình Điêu Khắc",
            "Ánh Sáng Ambient Dịu Mắt"
        ]
        themes = ["amber", "rose", "slate", "emerald"]
        return {
            "archetypeBadge": badges[idx % len(badges)],
            "useCaseEyebrow": "PHÒNG KHÁCH • ĐÈN & DECOR",
            "subCategory": "den_decor",
            "subCategoryName": "Đèn & Tượng Decor",
            "microSpecs": f"Nhựa PLA Xuyên Sáng · {weight}g",
            "badgeTheme": themes[idx % len(themes)]
        }

    if cat == "Hop_De_Ban_Tien_Ich":
        badges = [
            "Tổ Chức Gọn Gàng",
            "Cơ Cấu Tiện Dụng",
            "Công Thái Học Bàn Làm Việc"
        ]
        themes = ["emerald", "slate", "amber"]
        return {
            "archetypeBadge": badges[idx % len(badges)],
            "useCaseEyebrow": "BÀN LÀM VIỆC • HỘP TIỆN ÍCH",
            "subCategory": "hop_de_ban",
            "subCategoryName": "Hộp Để Bàn Đa Năng",
            "microSpecs": f"Nhựa Bio-PLA Siêu Bền · {weight}g",
            "badgeTheme": themes[idx % len(themes)]
        }

    if cat == "Do_Choi_Moc_Khoa":
        badges = [
            "Khớp Xoay Linh Hoạt",
            "Fidget Chống Buồn Ngủ",
            "In Nguyên Khối Không Ráp",
            "Art Toy Sưu Tầm",
            "Khớp Khóa Cơ Học",
            "Chuyển Động Êm Ái"
        ]
        themes = ["cyan", "emerald", "rose", "amber"]
        return {
            "archetypeBadge": badges[idx % len(badges)],
            "useCaseEyebrow": "BÀN LÀM VIỆC • ART TOY ĐỘNG",
            "subCategory": "art_toy_khop",
            "subCategoryName": "Art Toy Khớp Động",
            "microSpecs": f"Nhựa PLA In Nguyên Khối · {weight}g",
            "badgeTheme": themes[idx % len(themes)]
        }

    return {
        "archetypeBadge": "Thiết Kế Độc Quyền",
        "useCaseEyebrow": "SẢN PHẨM • ĐẶC TRƯNG STUDIO",
        "subCategory": "tieu_chuan",
        "subCategoryName": "Mẫu Tiêu Chuẩn",
        "microSpecs": f"In 3D Chuẩn Xưởng · {weight}g",
        "badgeTheme": "slate"
    }

def main():
    print("=== T&T 3D Labs: Bắt đầu compile 105 Catalog ===")
    
    with open(CATEGORY_REGISTRY_PATH, 'r', encoding='utf-8') as f:
        category_registry = json.load(f)
    print(f"Loaded {len(category_registry)} categories from registry.")

    BASELINE_55_PATH = ROOT_DIR / "reports" / "mw105-r1" / "baseline_55_products.json"
    with open(BASELINE_55_PATH, 'r', encoding='utf-8') as f:
        existing_products = json.load(f)
    existing_by_id = {p['id']: p for p in existing_products}
    print(f"Loaded {len(existing_by_id)} baseline products from {BASELINE_55_PATH}.")

    wb = openpyxl.load_workbook(EXCEL_PATH, data_only=True)
    
    cat_sheet_names = [
        'Trang_Diem_Vanity',
        'Decor_Den_Noi_That',
        'Hoa_Decor_Kim_Loai',
        'Do_Choi_Moc_Khoa',
        'Moc_Khoa_Clicker_Viral',
        'Hop_De_Ban_Tien_Ich',
        'Ca_Nhan_Hoa_NFC'
    ]
    sheet_details = {}
    for sname in cat_sheet_names:
        sheet = wb[sname]
        sheet_details[sname] = {}
        for r in range(3, sheet.max_row + 1):
            stt = sheet.cell(r, 1).value
            name_cell = sheet.cell(r, 3).value
            author_cell = sheet.cell(r, 4).value
            score_cell = sheet.cell(r, 5).value
            analysis_cell = sheet.cell(r, 6).value
            mech_cell = sheet.cell(r, 7).value
            benefit_cell = sheet.cell(r, 8).value
            stats_cell = sheet.cell(r, 9).value
            video_cell = sheet.cell(r, 10).value
            mat_cell = sheet.cell(r, 11).value
            weight_cell = sheet.cell(r, 12).value
            time_cell = sheet.cell(r, 13).value
            price_cell = sheet.cell(r, 15).value
            license_cell = sheet.cell(r, 18).value
            
            if not name_cell:
                continue
            m = re.search(r'#(\d+)', str(name_cell))
            mid = m.group(1) if m else None
            key = mid or str(stt)
            
            sheet_details[sname][key] = {
                'stt': stt,
                'name': str(name_cell).strip(),
                'author_orig': str(author_cell).strip() if author_cell else '',
                'score': str(score_cell).strip() if score_cell else '',
                'analysis': str(analysis_cell).strip() if analysis_cell else '',
                'mech': str(mech_cell).strip() if mech_cell else '',
                'benefit': str(benefit_cell).strip() if benefit_cell else '',
                'video': str(video_cell).strip() if video_cell else '',
                'material': str(mat_cell).strip() if mat_cell else '',
                'weight': weight_cell,
                'print_time': time_cell,
                'price': int(price_cell) if isinstance(price_cell, (int, float)) and price_cell > 0 else None,
                'license': str(license_cell).strip() if license_cell else ''
            }

    sheet_src = wb['Du_lieu_nguon']
    raw_items = []
    for r in range(3, sheet_src.max_row + 1):
        mid = str(sheet_src.cell(r, 1).value or '').strip()
        cat = str(sheet_src.cell(r, 2).value or '').strip()
        orig_name = str(sheet_src.cell(r, 3).value or '').strip()
        vn_name = str(sheet_src.cell(r, 4).value or '').strip()
        author = str(sheet_src.cell(r, 5).value or '').strip()
        url = str(sheet_src.cell(r, 6).value or '').strip()
        downloads = int(sheet_src.cell(r, 8).value or 0)
        likes = int(sheet_src.cell(r, 9).value or 0)
        prints = int(sheet_src.cell(r, 10).value or 0)
        weight = int(sheet_src.cell(r, 11).value or 0)
        time_s = int(sheet_src.cell(r, 12).value or 0)
        a_score = float(sheet_src.cell(r, 13).value or 5)
        u_score = float(sheet_src.cell(r, 14).value or 5)
        f_score = float(sheet_src.cell(r, 15).value or 5)
        sel_score = (100.0 * (a_score + u_score + f_score)) / 15.0
        reason = str(sheet_src.cell(r, 17).value or '').strip()
        license_name = str(sheet_src.cell(r, 18).value or '').strip()
        commercial = str(sheet_src.cell(r, 19).value or '').strip()
        
        if not mid or cat not in category_registry:
            continue
            
        detail = sheet_details.get(cat, {}).get(mid, {})
        price = detail.get('price')
        
        raw_items.append({
            'mid': mid,
            'cat': cat,
            'vn_name': vn_name,
            'orig_name': orig_name,
            'author': author,
            'url': url,
            'downloads': downloads,
            'likes': likes,
            'prints': prints,
            'weight': weight,
            'time_s': time_s,
            'a_score': a_score,
            'u_score': u_score,
            'f_score': f_score,
            'sel_score': sel_score,
            'reason': reason,
            'license_name': license_name,
            'commercial': commercial,
            'price': price,
            'detail': detail
        })

    heroes = {
        'Trang_Diem_Vanity': category_registry['Trang_Diem_Vanity']['heroId'],
        'Decor_Den_Noi_That': category_registry['Decor_Den_Noi_That']['heroId'],
        'Hop_De_Ban_Tien_Ich': category_registry['Hop_De_Ban_Tien_Ich']['heroId'],
        'Ca_Nhan_Hoa_NFC': category_registry['Ca_Nhan_Hoa_NFC']['heroId'],
        'Do_Choi_Moc_Khoa': category_registry['Do_Choi_Moc_Khoa']['heroId'],
        'Hoa_Decor_Kim_Loai': 'mw-cn-1334861',
        'Moc_Khoa_Clicker_Viral': 'mw-cn-1073472'
    }

    final_products = []
    new_added_count = 0
    preserved_count = 0

    for idx, item in enumerate(raw_items):
        mid = item['mid']
        pid = f"mw-cn-{mid}"
        cat = item['cat']
        
        if pid in existing_by_id:
            final_products.append(existing_by_id[pid])
            preserved_count += 1
        else:
            is_hero = (pid == heroes.get(cat))
            badge = "✦ Tiêu Biểu" if is_hero else category_registry[cat]['badgeText']
            hours = round(item['time_s'] / 3600.0, 1)
            specs = {
                "weight": f"{item['weight']}g",
                "printTime": f"{hours} giờ"
            }
            colors = determine_palette(item['detail'].get('material', ''), item['vn_name'], cat)
            materials = determine_materials(item['detail'].get('material', ''), cat)
            clean_title = clean_product_title(item['vn_name'])
            diff_fields = generate_differentiation(cat, is_hero, item['vn_name'], item['weight'], idx)
            
            new_prod = {
                "id": pid,
                "modelId": str(mid),
                "title": item['vn_name'],
                "cleanTitle": clean_title,
                "archetypeBadge": diff_fields["archetypeBadge"],
                "useCaseEyebrow": diff_fields["useCaseEyebrow"],
                "subCategory": diff_fields["subCategory"],
                "subCategoryName": diff_fields["subCategoryName"],
                "microSpecs": diff_fields["microSpecs"],
                "badgeTheme": diff_fields["badgeTheme"],
                "originalTitle": item['orig_name'],
                "category": cat,
                "type": "standard",
                "price": int(item['price']),
                "originalPrice": None,
                "badge": badge,
                "image": f"assets/images/products/thumb_{mid}.png",
                "imageAlt": item['vn_name'],
                "imageSource": "preset",
                "presetId": None,
                "modelKey": None,
                "author": item['author'],
                "makerworldUrl": item['url'],
                "downloads": item['downloads'],
                "likes": item['likes'],
                "prints": item['prints'],
                "weightGrams": item['weight'],
                "printTimeSeconds": item['time_s'],
                "aestheticScore": int(item['a_score']),
                "uniquenessScore": int(item['u_score']),
                "feasibilityScore": int(item['f_score']),
                "selectionScore": item['sel_score'],
                "materialRecommendation": item['detail'].get('material', 'PLA / PETG'),
                "headlineBenefit": item['detail'].get('benefit', item['reason']),
                "desc": item['reason'] or item['detail'].get('analysis', ''),
                "videoScript": item['detail'].get('video', ''),
                "productionNotes": item['detail'].get('mech', ''),
                "licenseName": item['license_name'],
                "commercialStatus": item['commercial'],
                "isHero": is_hero,
                "specs": specs,
                "colors": colors,
                "materials": materials,
                "status": "active",
                "updatedAt": "2026-10-31T00:00:00.000Z"
            }
            final_products.append(new_prod)
            new_added_count += 1

    print(f"\nFinal catalog compilation summary:")
    print(f" - Total products: {len(final_products)}")
    print(f" - Preserved existing items: {preserved_count}")
    print(f" - Newly added items: {new_added_count}")

    with open(PRODUCTS_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(final_products, f, ensure_ascii=False, indent=2)
    print(f"Successfully written 105 products to: {PRODUCTS_JSON_PATH}")

if __name__ == "__main__":
    main()
