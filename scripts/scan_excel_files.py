import os, glob

user_home = os.path.expanduser('~')
search_roots = [
    os.path.join(user_home, 'Downloads'),
    os.path.join(user_home, 'Desktop'),
    r'c:\Users\truongg\OneDrive - Thuyloi University\Tài liệu'
]

print("Scanning for Excel files...")
for root in search_roots:
    if os.path.exists(root):
        for dirpath, dirnames, filenames in os.walk(root):
            # don't go too deep into node_modules or .git
            if any(x in dirpath for x in ['node_modules', '.git', 'AppData', '.gemini', 'venv']):
                continue
            for f in filenames:
                if f.lower().endswith(('.xlsx', '.xls', '.csv')) and not f.startswith('~$'):
                    full_p = os.path.join(dirpath, f)
                    try:
                        mtime = os.path.getmtime(full_p)
                        size = os.path.getsize(full_p)
                        print(f"{full_p} | size: {size} | mtime: {mtime}")
                    except Exception:
                        pass
