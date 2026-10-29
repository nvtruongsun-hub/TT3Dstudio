/**
 * T&T 3D Labs - Cloud Firestore Data Seeder
 * Uploads all 55 products from products.json to Firebase Cloud Firestore
 * Project: tt3dlabs
 */

const fs = require('fs');
const path = require('path');

const FIREBASE_API_KEY = "AIzaSyDq99rkCb_I8WeeG-qc_uhBnfAPep1emls";
const PROJECT_ID = "tt3dlabs";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

function toFirestoreValue(val) {
  if (val === null || val === undefined) {
    return { nullValue: null };
  }
  if (typeof val === 'boolean') {
    return { booleanValue: val };
  }
  if (typeof val === 'number') {
    if (Number.isInteger(val)) {
      return { integerValue: String(val) };
    }
    return { doubleValue: val };
  }
  if (typeof val === 'string') {
    return { stringValue: val };
  }
  if (Array.isArray(val)) {
    return {
      arrayValue: {
        values: val.map(toFirestoreValue)
      }
    };
  }
  if (typeof val === 'object') {
    const fields = {};
    for (const [k, v] of Object.entries(val)) {
      if (v !== undefined) {
        fields[k] = toFirestoreValue(v);
      }
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function objectToFirestoreFields(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      fields[k] = toFirestoreValue(v);
    }
  }
  return { fields };
}

async function uploadProduct(product, index, total) {
  const docId = product.id;
  const url = `${BASE_URL}/products/${encodeURIComponent(docId)}?key=${FIREBASE_API_KEY}`;
  const body = objectToFirestoreFields({
    ...product,
    syncedAt: new Date().toISOString()
  });

  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to upload ${docId}: HTTP ${res.status} - ${errText}`);
  }

  const result = await res.json();
  return result;
}

async function uploadCatalogMeta(count) {
  const url = `${BASE_URL}/metadata/catalog?key=${FIREBASE_API_KEY}`;
  const body = objectToFirestoreFields({
    totalProducts: count,
    revision: 'mw-55-v2',
    lastSync: new Date().toISOString(),
    source: 'T&T 3D Labs Studio Official'
  });

  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errText = await res.text();
    console.warn('Metadata upload warning:', errText);
  }
}

async function main() {
  console.log('==========================================================');
  console.log('   T&T 3D LABS - FIREBASE CLOUD FIRESTORE DATA SYNC       ');
  console.log('==========================================================');
  console.log(`Target Firebase Project: ${PROJECT_ID}`);

  const productsPath = path.join(__dirname, '../products.json');
  const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

  console.log(`Found ${products.length} products in products.json.`);
  console.log('Beginning batch upload to Cloud Firestore collection "products"...\n');

  let successCount = 0;
  let failCount = 0;

  // Process in small concurrent batches of 5 to optimize network speed without exceeding rate limits
  const BATCH_SIZE = 5;
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(async (prod, idx) => {
      const overallIdx = i + idx + 1;
      try {
        await uploadProduct(prod, overallIdx, products.length);
        successCount++;
        console.log(`  [${overallIdx}/${products.length}] ✓ Synced: ${prod.id} - ${prod.title.slice(0, 45)}...`);
      } catch (err) {
        failCount++;
        console.error(`  [${overallIdx}/${products.length}] ✗ Error ${prod.id}: ${err.message}`);
      }
    }));
  }

  console.log('\nUpdating catalog metadata in Firestore...');
  await uploadCatalogMeta(successCount);

  console.log('\n==========================================================');
  console.log(`Sync Complete: ${successCount} Success | ${failCount} Failed`);
  console.log('==========================================================');

  if (failCount > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal sync error:', err);
  process.exit(1);
});
