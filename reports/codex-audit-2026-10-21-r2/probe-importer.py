"""Read production importer without executing main; files only inside this report dir."""
import importlib.util
import json
import struct
import io
from unittest.mock import patch
from pathlib import Path

root = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('audit_importer', root / 'scripts/import_makerworld_catalog.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
# Deliberately invalid PNG: bad IHDR length, invalid CRCs, no IDAT/compressed pixels.
fake = b'\x89PNG\r\n\x1a\n' + struct.pack('>I', 999) + b'IHDR' + struct.pack('>IIBBBBB', 1, 1, 8, 6, 0, 0, 0) + b'xxxx' + struct.pack('>I', 0) + b'IEND' + b'xxxx'
with patch('builtins.open', return_value=io.BytesIO(fake)):
    accepted = module.verify_image_file(Path('in-memory-invalid.png'))
    assert accepted is True
    print(json.dumps({'invalid_png_accepted': accepted, 'bytes': len(fake), 'IDAT_present': b'IDAT' in fake}))

registry = json.loads((root / 'data/category-registry.json').read_text(encoding='utf-8-sig'))
print(json.dumps({'current_registry_values_equal': registry == module.CATEGORY_REGISTRY, 'registry_json_read_by_importer': 'No: path declared only; handwritten dict remains'}))
manifest = json.loads((root / 'assets/manifest.json').read_text(encoding='utf-8-sig'))
products = json.loads((root / 'products.json').read_text(encoding='utf-8-sig'))
wrong = [p['id'] for p in products if p['selectionScore'] != 100 * (p['aestheticScore'] + p['uniquenessScore'] + p['feasibilityScore']) / 15]
print(json.dumps({'published_manifest_revision': manifest['catalogRevision'], 'products_with_rounded_score': len(wrong), 'example_ids': wrong[:3]}))
