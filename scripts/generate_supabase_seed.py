#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate Supabase SQL Seed Script for 105 Products and 7 Categories
"""

import json, sys, io
from pathlib import Path

if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

ROOT = Path(__file__).resolve().parent.parent
PRODUCTS_PATH = ROOT / "products.json"
REGISTRY_PATH = ROOT / "data" / "category-registry.json"
SEED_SQL_PATH = ROOT / "supabase" / "seed_products.sql"

def sql_escape(val):
    if val is None:
        return "NULL"
    if isinstance(val, bool):
        return "TRUE" if val else "FALSE"
    if isinstance(val, (int, float)):
        return str(val)
    if isinstance(val, (dict, list)):
        s = json.dumps(val, ensure_ascii=False)
        return "'" + s.replace("'", "''") + "'::jsonb"
    s = str(val).replace("'", "''")
    return f"'{s}'"

def main():
    with open(REGISTRY_PATH, "r", encoding="utf-8") as f:
        categories = json.load(f)

    with open(PRODUCTS_PATH, "r", encoding="utf-8") as f:
        products = json.load(f)

    lines = []
    lines.append("-- =========================================================================")
    lines.append("-- T&T 3D LABS - SEED SCRIPT FOR 7 CATEGORIES & 105 MAKERWORLD PRODUCTS")
    lines.append("-- =========================================================================\n")

    # 1. Insert Categories
    lines.append("-- 1. INSERT CATEGORIES")
    lines.append("INSERT INTO public.categories (id, name, short_name, title, slug, icon, accent_color, accent_bg, badge_text, hero_id, description, display_order) VALUES")
    
    cat_tuples = []
    display_order = 1
    for cat_id, cat in categories.items():
        slug = cat_id.lower().replace("_", "-")
        tup = f"({sql_escape(cat['id'])}, {sql_escape(cat['name'])}, {sql_escape(cat['shortName'])}, {sql_escape(cat['title'])}, {sql_escape(slug)}, {sql_escape(cat.get('icon', 'fa-cube'))}, {sql_escape(cat.get('accentColor', '#141413'))}, {sql_escape(cat.get('accentBg', '#F4F4F5'))}, {sql_escape(cat.get('badgeText'))}, {sql_escape(cat.get('heroId'))}, {sql_escape(cat.get('desc'))}, {display_order})"
        cat_tuples.append(tup)
        display_order += 1
    
    lines.append(",\n".join(cat_tuples))
    lines.append("""ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    short_name = EXCLUDED.short_name,
    title = EXCLUDED.title,
    slug = EXCLUDED.slug,
    icon = EXCLUDED.icon,
    accent_color = EXCLUDED.accent_color,
    accent_bg = EXCLUDED.accent_bg,
    badge_text = EXCLUDED.badge_text,
    hero_id = EXCLUDED.hero_id,
    description = EXCLUDED.description;\n""")

    # 2. Insert Coupons (Standard Welcome coupons)
    lines.append("-- 2. INSERT STANDARD COUPONS")
    lines.append("""INSERT INTO public.coupons (code, discount_type, discount_value, min_order_value, max_discount_cap, usage_limit, is_active)
VALUES 
  ('TT3D10', 'percent', 10, 200000, 50000, 500, TRUE),
  ('WELCOME3D', 'fixed', 20000, 100000, 20000, 1000, TRUE),
  ('VIPXUONG', 'percent', 15, 500000, 100000, 200, TRUE)
ON CONFLICT (code) DO NOTHING;\n""")

    # 3. Insert Products
    lines.append("-- 3. INSERT 105 PRODUCTS")
    lines.append("""INSERT INTO public.products (
    id, model_id, title, clean_title, original_title, category_id,
    price, original_price, badge, archetype_badge, use_case_eyebrow,
    sub_category, sub_category_name, micro_specs, badge_theme,
    image, image_alt, author, makerworld_url, downloads, likes, prints,
    weight_grams, print_time_seconds, selection_score, material_recommendation,
    headline_benefit, description, specs, colors, materials, is_hero, status
) VALUES""")

    prod_tuples = []
    for p in products:
        tup = f"""({sql_escape(p['id'])}, {sql_escape(p.get('modelId', ''))}, {sql_escape(p['title'])}, {sql_escape(p.get('cleanTitle', p['title']))}, {sql_escape(p.get('originalTitle'))}, {sql_escape(p['category'])}, {sql_escape(p['price'])}, {sql_escape(p.get('originalPrice'))}, {sql_escape(p.get('badge'))}, {sql_escape(p.get('archetypeBadge'))}, {sql_escape(p.get('useCaseEyebrow'))}, {sql_escape(p.get('subCategory'))}, {sql_escape(p.get('subCategoryName'))}, {sql_escape(p.get('microSpecs'))}, {sql_escape(p.get('badgeTheme'))}, {sql_escape(p['image'])}, {sql_escape(p.get('imageAlt', p['title']))}, {sql_escape(p.get('author'))}, {sql_escape(p.get('makerworldUrl'))}, {sql_escape(p.get('downloads', 0))}, {sql_escape(p.get('likes', 0))}, {sql_escape(p.get('prints', 0))}, {sql_escape(p.get('weightGrams', 0))}, {sql_escape(p.get('printTimeSeconds', 0))}, {sql_escape(p.get('selectionScore', 0))}, {sql_escape(p.get('materialRecommendation'))}, {sql_escape(p.get('headlineBenefit'))}, {sql_escape(p.get('desc'))}, {sql_escape(p.get('specs', {}))}, {sql_escape(p.get('colors', []))}, {sql_escape(p.get('materials', []))}, {sql_escape(p.get('isHero', False))}, {sql_escape(p.get('status', 'active'))})"""
        prod_tuples.append(tup)

    lines.append(",\n".join(prod_tuples))
    lines.append("""ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    clean_title = EXCLUDED.clean_title,
    original_title = EXCLUDED.original_title,
    category_id = EXCLUDED.category_id,
    price = EXCLUDED.price,
    badge = EXCLUDED.badge,
    archetype_badge = EXCLUDED.archetype_badge,
    use_case_eyebrow = EXCLUDED.use_case_eyebrow,
    sub_category = EXCLUDED.sub_category,
    sub_category_name = EXCLUDED.sub_category_name,
    micro_specs = EXCLUDED.micro_specs,
    badge_theme = EXCLUDED.badge_theme,
    image = EXCLUDED.image,
    author = EXCLUDED.author,
    makerworld_url = EXCLUDED.makerworld_url,
    weight_grams = EXCLUDED.weight_grams,
    print_time_seconds = EXCLUDED.print_time_seconds,
    selection_score = EXCLUDED.selection_score,
    material_recommendation = EXCLUDED.material_recommendation,
    headline_benefit = EXCLUDED.headline_benefit,
    description = EXCLUDED.description,
    specs = EXCLUDED.specs,
    colors = EXCLUDED.colors,
    materials = EXCLUDED.materials,
    is_hero = EXCLUDED.is_hero,
    status = EXCLUDED.status,
    updated_at = TIMEZONE('utc', NOW());\n""")

    with open(SEED_SQL_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"Successfully generated {SEED_SQL_PATH} with {len(categories)} categories and {len(products)} products!")

if __name__ == "__main__":
    main()
