import zipfile, xml.etree.ElementTree as ET

fpath = r'C:\Users\truongg\OneDrive - Thuyloi University\Tài liệu\01. khoi nghiep in 3d\Top_Mau_In_3D_Doc_La_Xu_The_MakerWorld.xlsx'
with zipfile.ZipFile(fpath, 'r') as z:
    wb_root = ET.fromstring(z.read('xl/workbook.xml'))
    wb_rels = ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))
    rel_map = {r.attrib['Id']: r.attrib['Target'] for r in wb_rels}
    
    for s in wb_root.findall('.//{*}sheet'):
        sname = s.attrib['name']
        rId = s.attrib['{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id']
        target = rel_map[rId]
        # see if sheet has drawing rel
        sheet_rels_path = 'xl/worksheets/_rels/' + target.split('/')[-1] + '.rels'
        drawing_target = None
        if sheet_rels_path in z.namelist():
            s_rels = ET.fromstring(z.read(sheet_rels_path))
            for rel in s_rels:
                if 'drawing' in rel.attrib.get('Type', ''):
                    drawing_target = rel.attrib['Target']
        print(f'Sheet "{sname}" -> {target} -> Drawing: {drawing_target}')
