import sys, os, openpyxl, json, io, re

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

print(f'Current products.json has {len(products)} products.')

excel_path = r'C:\Users\truongg\.gemini\antigravity\brain\9324bcca-30cb-4b20-b89a-f522610fa9cc\.user_uploaded\media_1792552368163_d3adc6ce.xlsx'
wb = openpyxl.load_workbook(excel_path, data_only=True)

excel_items = []
for sname in ['Trang_Diem_Vanity', 'Decor_Den_Noi_That', 'Do_Choi_Moc_Khoa', 'Hop_De_Ban_Tien_Ich', 'Ca_Nhan_Hoa_NFC']:
    sheet = wb[sname]
    for r in range(3, sheet.max_row + 1):
        stt = sheet.cell(r, 1).value
        name_cell = sheet.cell(r, 3).value
        if not stt or not name_cell:
            continue
        text = str(name_cell).strip()
        m = re.search(r'#(\d+)', text)
        model_id = m.group(1) if m else None
        
        # also get columns for price, specs, etc.
        # let's inspect columns
        row_data = {}
        for c in range(1, sheet.max_column + 1):
            header = sheet.cell(2, c).value
            val = sheet.cell(r, c).value
            if header:
                row_data[str(header).strip()] = val

        excel_items.append({
            'sheet': sname,
            'stt': stt,
            'text': text,
            'model_id': model_id,
            'row': r,
            'data': row_data
        })

print(f'Total items in Excel sheets: {len(excel_items)}')

missing_in_json = []
for item in excel_items:
    found = False
    for p in products:
        if item['model_id'] and (item['model_id'] in p.get('id', '') or item['model_id'] in p.get('makerworldUrl', '') or item['model_id'] in p.get('title', '')):
            found = True
            break
    if not found:
        missing_in_json.append(item)

print(f'Missing items in products.json: {len(missing_in_json)}')
for m in missing_in_json:
    print(f"- [{m['sheet']} STT {m['stt']}] ID #{m['model_id']}: {m['text'][:100]}")
