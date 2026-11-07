with open('css/interface-motion.css', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if 'atelier-photo-drift' in l:
        print(f"Line {i}: {l.strip()}")

# Replace line 71 and 72 (0-indexed)
lines[71] = ".minimal-storefront #hero .hero-showcase-media > #hero-showcase-img { animation: none; }\n"
lines[72] = "@keyframes atelier-photo-drift { 0%, 100% { transform: none; } }\n"

with open('css/interface-motion.css', 'w', encoding='utf-8') as f:
    f.writelines(lines)
print("Updated lines 71-72 successfully.")
