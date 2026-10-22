#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
T&T 3D Labs - MakerWorld 55 Catalog Importer & Asset Pipeline
Tuân thủ Chỉ thị Kỹ thuật GPT-6.1-Sol (Codex Master Controller)
"""
import argparse
import hashlib
import json
import os
import shutil
import sys
from datetime import datetime
from pathlib import Path

# Cấu hình encoding UTF-8 cho Windows console
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
if sys.stderr and hasattr(sys.stderr, "reconfigure"):
    try:
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

BASE_DIR = Path(__file__).resolve().parent.parent

DEFAULT_SOURCE_JSON = BASE_DIR.parent / "01. khoi nghiep in 3d" / "makerworld_multisheet_data.json"
DEFAULT_SOURCE_THUMBS = BASE_DIR.parent / "01. khoi nghiep in 3d" / "anh_mau_3d_xu_the"
DEFAULT_OUT_JSON = BASE_DIR / "products.json"
DEFAULT_OUT_THUMBS = BASE_DIR / "assets" / "images" / "products"
DEFAULT_MANIFEST = BASE_DIR / "assets" / "manifest.json"
CATEGORY_REGISTRY_JSON = BASE_DIR / "data" / "category-registry.json"

def verify_image_file(path: Path) -> bool:
    """Xác thực định dạng và giải mã cấu trúc ảnh PNG thực tế (Codex R07)."""
    try:
        import struct
        with open(path, "rb") as f:
            header = f.read(8)
            if header != b"\x89PNG\r\n\x1a\n":
                return False
            has_ihdr = False
            has_idat = False
            has_iend = False
            while True:
                length_bytes = f.read(4)
                if not length_bytes or len(length_bytes) < 4:
                    break
                length = struct.unpack(">I", length_bytes)[0]
                chunk_type = f.read(4)
                if len(chunk_type) < 4:
                    break
                if chunk_type == b"IHDR":
                    if length != 13:
                        return False
                    ihdr_data = f.read(13)
                    if len(ihdr_data) < 13:
                        return False
                    width, height = struct.unpack(">II", ihdr_data[:8])
                    if width <= 0 or height <= 0:
                        return False
                    has_ihdr = True
                    f.seek(4, os.SEEK_CUR)  # skip CRC
                elif chunk_type == b"IDAT":
                    if length > 0:
                        has_idat = True
                    f.seek(length + 4, os.SEEK_CUR)
                elif chunk_type == b"IEND":
                    has_iend = True
                    f.seek(4, os.SEEK_CUR)
                    break
                else:
                    f.seek(length + 4, os.SEEK_CUR)
            return bool(has_ihdr and has_idat and has_iend)
    except Exception:
        return False

# Nguồn biên tập danh mục duy nhất từ file JSON (Codex R10)
if CATEGORY_REGISTRY_JSON.exists():
    with open(CATEGORY_REGISTRY_JSON, "r", encoding="utf-8-sig") as f:
        CATEGORY_REGISTRY = json.load(f)
else:
    raise FileNotFoundError(f"Missing category registry JSON: {CATEGORY_REGISTRY_JSON}")

# Bảng palette màu sắc thông minh cho từng loại sản phẩm
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
    ]
}

def determine_palette(mat_rec, title, cat_id):
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

def compute_sha256(filepath):
    hasher = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()

def main():
    parser = argparse.ArgumentParser(description="T&T 3D Labs 55-Catalog Importer")
    parser.add_argument("--source-json", default=str(DEFAULT_SOURCE_JSON), help="Đường dẫn file makerworld_multisheet_data.json")
    parser.add_argument("--thumb-dir", default=str(DEFAULT_SOURCE_THUMBS), help="Thư mục chứa ảnh thumbnail gốc")
    parser.add_argument("--out-json", default=str(DEFAULT_OUT_JSON), help="Đường dẫn file products.json đầu ra")
    parser.add_argument("--out-thumb-dir", default=str(DEFAULT_OUT_THUMBS), help="Thư mục chứa ảnh thumbnail đầu ra")
    parser.add_argument("--manifest", default=str(DEFAULT_MANIFEST), help="Đường dẫn manifest.json đầu ra")
    parser.add_argument("--dry-run", action="store_true", help="Chạy kiểm tra tính hợp lệ mà không ghi file")

    args = parser.parse_args()

    src_json_path = Path(args.source_json)
    src_thumb_dir = Path(args.thumb_dir)
    out_json_path = Path(args.out_json)
    out_thumb_dir = Path(args.out_thumb_dir)
    manifest_path = Path(args.manifest)

    print(f"=== BẮT ĐẦU PIPELINE NHẬP DANH MỤC 55 SẢN PHẨM ===")
    print(f"Source JSON: {src_json_path}")
    print(f"Source Thumbs: {src_thumb_dir}")
    print(f"Dry Run: {args.dry_run}\n")

    if not src_json_path.exists():
        print(f"[LỖI] Không tìm thấy file JSON nguồn: {src_json_path}")
        sys.exit(1)

    if not src_thumb_dir.exists():
        print(f"[LỖI] Không tìm thấy thư mục ảnh nguồn: {src_thumb_dir}")
        sys.exit(1)

    with open(src_json_path, "r", encoding="utf-8") as f:
        source_data = json.load(f)

    # 1. Validation 5 Danh mục
    expected_cats = list(CATEGORY_REGISTRY.keys())
    actual_cats = list(source_data.keys())
    if set(expected_cats) != set(actual_cats):
        print(f"[LỖI] Danh mục nguồn không khớp! Mong đợi: {expected_cats}, Thực tế: {actual_cats}")
        sys.exit(1)

    all_products = []
    seen_ids = set()
    category_heroes = {}
    copied_thumbs = []
    image_hashes = {}

    # 2. Xử lý từng danh mục & Tìm Hero Item
    for cat_id in expected_cats:
        cat_data = source_data[cat_id]
        models = cat_data.get("models", [])
        if len(models) != 11:
            print(f"[LỖI] Danh mục '{cat_id}' có {len(models)} sản phẩm (yêu cầu đúng 11)!")
            sys.exit(1)

        # Thuật toán xếp hạng Hero theo chỉ thị GPT-6.1-Sol:
        # (-selectionScore, -prints, -downloads, -likes, modelId)
        def hero_sort_key(m):
            score = 100.0 * (m["aesthetic_score"] + m["uniqueness_score"] + m["feasibility_score"]) / 15.0
            return (-score, -m["prints"], -m["downloads"], -m["likes"], m["id"])

        sorted_models = sorted(models, key=hero_sort_key)
        hero_model = sorted_models[0]
        hero_id = hero_model["id"]
        category_heroes[cat_id] = hero_id

        hero_score = 100.0 * (hero_model["aesthetic_score"] + hero_model["uniqueness_score"] + hero_model["feasibility_score"]) / 15.0
        print(f"  [HERO] {cat_id:20} -> ID: {hero_id} | Điểm: {hero_score:4.1f}/100 | Lượt in: {hero_model['prints']:5} | {hero_model['title_vi'][:40]}")

        for model in models:
            mid = model["id"]
            if mid in seen_ids:
                print(f"[LỖI] Trùng lặp Model ID: {mid}")
                sys.exit(1)
            seen_ids.add(mid)

            # Kiểm tra file thumbnail và giải mã cấu trúc ảnh (Codex R07)
            thumb_name = f"thumb_{mid}.png"
            src_thumb_path = src_thumb_dir / thumb_name
            if not src_thumb_path.exists():
                print(f"[LỖI] Không tìm thấy file thumbnail: {src_thumb_path}")
                sys.exit(1)

            if not verify_image_file(src_thumb_path):
                print(f"[LỖI] File thumbnail không phải ảnh PNG hợp lệ hoặc bị lỗi giải mã: {src_thumb_path}")
                sys.exit(1)

            dest_thumb_path = out_thumb_dir / thumb_name
            thumb_hash = compute_sha256(src_thumb_path)
            image_hashes[thumb_name] = thumb_hash
            copied_thumbs.append((src_thumb_path, dest_thumb_path, thumb_name))

            # Xây dựng schema chuẩn hóa (Codex Section 5.6)
            is_hero = (mid == hero_id)
            # Giữ selectionScore chính xác từ công thức, chỉ làm tròn khi render
            score = (100.0 * (model["aesthetic_score"] + model["uniqueness_score"] + model["feasibility_score"])) / 15.0

            # Specs
            hours = round(model["time_sec"] / 3600.0, 1)
            specs = {
                "weight": f"{model['weight_g']}g",
                "printTime": f"{hours} giờ"
            }

            # Colors & Materials
            colors = determine_palette(model["material_rec"], model["title_vi"], cat_id)
            materials = determine_materials(model["material_rec"], cat_id)

            badge = "✦ Tiêu Biểu" if is_hero else CATEGORY_REGISTRY[cat_id]["badgeText"]

            prod = {
                "id": f"mw-cn-{mid}",
                "modelId": str(mid),
                "title": model["title_vi"],
                "originalTitle": model["title_orig"],
                "category": cat_id,
                "type": "standard",
                "price": int(model["price_vnd"]),
                "originalPrice": None,
                "badge": badge,
                "image": f"assets/images/products/{thumb_name}",
                "imageAlt": model["title_vi"],
                "imageSource": "preset",
                "presetId": None,
                "modelKey": None,
                "author": model["designer"],
                "makerworldUrl": model["url"],
                "downloads": int(model["downloads"]),
                "likes": int(model["likes"]),
                "prints": int(model["prints"]),
                "weightGrams": int(model["weight_g"]),
                "printTimeSeconds": int(model["time_sec"]),
                "aestheticScore": int(model["aesthetic_score"]),
                "uniquenessScore": int(model["uniqueness_score"]),
                "feasibilityScore": int(model["feasibility_score"]),
                "selectionScore": score,
                "materialRecommendation": model["material_rec"],
                "headlineBenefit": model["use_case"],
                "desc": model["selection_reason"],
                "videoScript": model["viral_idea"],
                "productionNotes": model["action"],
                "licenseName": model["license_name"],
                "commercialStatus": model["commercial_status"],
                "isHero": is_hero,
                "specs": specs,
                "colors": colors,
                "materials": materials,
                "status": "active",
                "updatedAt": "2026-10-21T00:00:00.000Z"
            }
            all_products.append(prod)

    if len(all_products) != 55:
        print(f"[LỖI] Tổng số sản phẩm không đúng 55 (thực tế: {len(all_products)})!")
        sys.exit(1)

    print(f"\n[OK] Preflight đạt 100%: 55 sản phẩm duy nhất, 5 danh mục, 5 Hero items, 55 ảnh hợp lệ.")

    # Sau khi preflight toàn bộ đạt mới tiến hành copy ảnh (Codex Section 5.6)
    if not args.dry_run:
        out_thumb_dir.mkdir(parents=True, exist_ok=True)
        for src_p, dst_p, _ in copied_thumbs:
            shutil.copy2(src_p, dst_p)

    manifest = {
        "catalogRevision": "mw-55-v2",
        "schemaVersion": 5,
        "generatedAt": "2026-10-21T00:00:00.000Z",
        "totalProducts": 55,
        "categories": CATEGORY_REGISTRY,
        "heroes": category_heroes,
        "productIds": [p["id"] for p in all_products],
        "imageHashes": image_hashes
    }

    if not args.dry_run:
        out_json_path.parent.mkdir(parents=True, exist_ok=True)
        with open(out_json_path, "w", encoding="utf-8") as f:
            json.dump(all_products, f, ensure_ascii=False, indent=2)
        print(f"[THÀNH CÔNG] Đã ghi catalog 55 sản phẩm vào: {out_json_path}")

        manifest_path.parent.mkdir(parents=True, exist_ok=True)
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(manifest, f, ensure_ascii=False, indent=2)
        print(f"[THÀNH CÔNG] Đã ghi manifest vào: {manifest_path}")
    else:
        print("[DRY-RUN] Không ghi file vào đĩa.")

if __name__ == "__main__":
    main()
