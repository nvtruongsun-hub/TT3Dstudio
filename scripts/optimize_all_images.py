import os
import glob
from PIL import Image

def optimize_hero_images():
    hero_dir = "assets/images"
    hero_files = [
        "studio-desk-tray.jpg",
        "studio-mechanical-parts.jpg",
        "studio-soft-serve-lamp.jpg",
        "studio-pleated-vase.jpg",
        "studio-nfc-wifi.jpg",
        "eng-parts.jpg"
    ]
    print("[1/2] Optimizing large hero/bento images...")
    total_saved = 0
    for fname in hero_files:
        fpath = os.path.join(hero_dir, fname)
        if not os.path.exists(fpath):
            continue
        orig_size = os.path.getsize(fpath)
        im = Image.open(fpath)
        if im.mode != "RGB":
            im = im.convert("RGB")
        
        # Resize if width > 1200
        w, h = im.size
        if w > 1200:
            new_w = 1200
            new_h = int(h * (1200 / w))
            im = im.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        # Save optimized JPG
        im.save(fpath, "JPEG", quality=82, optimize=True)
        # Also save WebP version
        webp_path = os.path.splitext(fpath)[0] + ".webp"
        im.save(webp_path, "WEBP", quality=82)
        
        new_size = os.path.getsize(fpath)
        webp_size = os.path.getsize(webp_path)
        saved = orig_size - new_size
        total_saved += saved
        print(f"  + {fname}: {orig_size // 1024}KB -> {new_size // 1024}KB (WebP: {webp_size // 1024}KB)")
    print(f"  => Total hero savings: {total_saved // 1024} KB\n")

def optimize_product_thumbnails():
    prod_dir = "assets/images/products"
    png_files = glob.glob(os.path.join(prod_dir, "*.png"))
    print(f"[2/2] Optimizing {len(png_files)} product thumbnails in {prod_dir}...")
    total_orig = 0
    total_new_png = 0
    total_webp = 0

    for idx, fpath in enumerate(png_files):
        orig_size = os.path.getsize(fpath)
        total_orig += orig_size
        
        im = Image.open(fpath)
        # Resize to max 600x600 if larger
        w, h = im.size
        if w > 600 or h > 600:
            scale = min(600 / w, 600 / h)
            new_w = int(w * scale)
            new_h = int(h * scale)
            im = im.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        # Save WebP version
        webp_path = os.path.splitext(fpath)[0] + ".webp"
        # If RGBA, save as WebP with alpha, otherwise RGB
        if im.mode == "RGBA":
            im.save(webp_path, "WEBP", quality=80, method=4)
        else:
            im.convert("RGB").save(webp_path, "WEBP", quality=80, method=4)
        
        # Overwrite PNG with optimized 600x600 PNG
        im.save(fpath, "PNG", optimize=True)
        
        new_png_size = os.path.getsize(fpath)
        webp_size = os.path.getsize(webp_path)
        total_new_png += new_png_size
        total_webp += webp_size
        
        if (idx + 1) % 25 == 0 or idx == len(png_files) - 1:
            print(f"  Processed {idx + 1}/{len(png_files)}...")

    print(f"\n=======================================================")
    print(f"  IMAGE OPTIMIZATION COMPLETE:")
    print(f"  Original PNGs: {total_orig / (1024*1024):.2f} MB")
    print(f"  Optimized PNGs: {total_new_png / (1024*1024):.2f} MB")
    print(f"  Generated WebPs: {total_webp / (1024*1024):.2f} MB")
    print(f"  BANDWIDTH SAVINGS: {(total_orig - total_webp) / (1024*1024):.2f} MB ({(1 - total_webp/total_orig)*100:.1f}%)")
    print(f"=======================================================")

if __name__ == "__main__":
    optimize_hero_images()
    optimize_product_thumbnails()
