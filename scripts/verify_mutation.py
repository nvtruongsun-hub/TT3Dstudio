# scripts/verify_mutation.py
import json, subprocess, sys, io
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

STORE_PATH = Path('js/catalog-store.js')
with open(STORE_PATH, 'r', encoding='utf-8') as f:
    orig_store = f.read()

# 1. Inject Mutant: change CURRENT_CATALOG_REVISION in catalog-store.js to 'mutant-rev'
mutant_store = orig_store.replace("CURRENT_CATALOG_REVISION = 'mw-105-v1-full'", "CURRENT_CATALOG_REVISION = 'mutant-rev'")
with open(STORE_PATH, 'w', encoding='utf-8') as f:
    f.write(mutant_store)

print('--- INJECTED MUTANT: catalog revision changed to mutant-rev ---')
res_mutant = subprocess.run(['node', 'tests/test_catalog_105_contract.js'], capture_output=True, text=True, encoding='utf-8')
print('Mutant Return Code:', res_mutant.returncode)
assert res_mutant.returncode != 0, 'Mutant MUST fail contract test!'
error_lines = [line for line in res_mutant.stderr.splitlines() if 'AssertionError' in line or 'catalog-store.js' in line]
print('Mutant Caught By Test:', error_lines[0] if error_lines else 'AssertionError')

# 2. Restore Original
with open(STORE_PATH, 'w', encoding='utf-8') as f:
    f.write(orig_store)

print('\n--- RESTORED: original revision restored ---')
res_clean = subprocess.run(['node', 'tests/test_catalog_105_contract.js'], capture_output=True, text=True, encoding='utf-8')
print('Clean Return Code:', res_clean.returncode)
assert res_clean.returncode == 0, 'Restored code MUST pass contract test!'
print('GATE 4 MUTATION TESTING VERIFIED 100% PASS!')
