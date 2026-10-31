import zipfile, os, re, openpyxl, xml.etree.ElementTree as ET

fpath = r'C:\Users\truongg\OneDrive - Thuyloi University\Tài liệu\01. khoi nghiep in 3d\Top_Mau_In_3D_Doc_La_Xu_The_MakerWorld.xlsx'
out_dir = os.path.join('assets', 'images', 'products')
os.makedirs(out_dir, exist_ok=True)

wb = openpyxl.load_workbook(fpath, data_only=True)

sheet_drawing_map = {
    'Trang_Diem_Vanity': 'drawing1',
    'Decor_Den_Noi_That': 'drawing2',
    'Hoa_Decor_Kim_Loai': 'drawing3',
    'Do_Choi_Moc_Khoa': 'drawing4',
    'Moc_Khoa_Clicker_Viral': 'drawing5',
    'Hop_De_Ban_Tien_Ich': 'drawing6',
    'Ca_Nhan_Hoa_NFC': 'drawing7'
}

with zipfile.ZipFile(fpath, 'r') as z:
    for sname, dname in sheet_drawing_map.items():
        sheet = wb[sname]
        d_xml_path = f'xl/drawings/{dname}.xml'
        d_rels_path = f'xl/drawings/_rels/{dname}.xml.rels'
        
        if d_xml_path not in z.namelist() or d_rels_path not in z.namelist():
            continue
            
        rels_root = ET.fromstring(z.read(d_rels_path))
        # id to target
        r_map = {}
        for r in rels_root:
            r_id = r.attrib['Id']
            target = r.attrib['Target'].lstrip('/')
            if not target.startswith('xl/'):
                target = 'xl/' + target.replace('../', '')
            r_map[r_id] = target
            
        d_root = ET.fromstring(z.read(d_xml_path))
        
        # map row to image target
        row_img_map = {}
        for anchor in d_root:
            from_el = anchor.find('{*}from')
            if from_el is None:
                continue
            r_str = from_el.find('{*}row').text
            row_idx = int(r_str) + 1 # 1-based row in Excel
            
            blip = anchor.find('.//{*}blip')
            if blip is not None:
                embed_id = blip.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed')
                if embed_id and embed_id in r_map:
                    row_img_map[row_idx] = r_map[embed_id]
                    
        # Now correlate with sheet rows
        for r in range(3, sheet.max_row + 1):
            name_val = sheet.cell(r, 3).value
            if not name_val:
                continue
            m = re.search(r'#(\d+)', str(name_val))
            mid = m.group(1) if m else None
            if not mid:
                continue
                
            dest_file = f'thumb_{mid}.png'
            dest_path = os.path.join(out_dir, dest_file)
            
            img_zip_path = row_img_map.get(r)
            if img_zip_path and img_zip_path in z.namelist():
                # check if file already exists
                if not os.path.exists(dest_path) or os.path.getsize(dest_path) == 0:
                    with open(dest_path, 'wb') as out_f:
                        out_f.write(z.read(img_zip_path))
                    print(f"Extracted [{sname} R{r} #{mid}] -> {dest_file} ({os.path.getsize(dest_path)} bytes)")
                else:
                    pass
            else:
                print(f"No image found for [{sname} R{r} #{mid}]")

print("Image extraction check completed.")
