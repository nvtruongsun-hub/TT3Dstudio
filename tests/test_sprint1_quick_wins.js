/**
 * Test Suite: Sprint 1 Quick Wins (TDD Phase 2 - RED Verification)
 * 1. Combo button adds items WITH 10% discount to cart
 * 2. Brand & Location Consistency: Zero "xưởng Hà Nội", unified "T&T 3D Studio", standardized layer specs
 * 3. Dead code 'automation-simulator.js' removed from index.html
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT_DIR = path.resolve(__dirname, '..');
const INDEX_HTML_PATH = path.join(ROOT_DIR, 'index.html');
const indexHtml = fs.readFileSync(INDEX_HTML_PATH, 'utf8');

console.log('========================================================================');
console.log('   KIỂM THỬ TDD SPRINT 1 - BẢO ĐẢM TÍNH ĐÚNG ĐẮN GIAO DIỆN & GIỎ HÀNG');
console.log('========================================================================\n');

// --------------------------------------------------------------------------
// TEST 1: Combo buttons in index.html must apply 10% discount on click
// --------------------------------------------------------------------------
console.log('[TEST 1] Kiểm tra nút "Mua Trọn Bộ" Combo tự động áp dụng giảm giá 10%...');
const comboButtonMatches = [...indexHtml.matchAll(/onclick="([^"]*TTCart\.addItem[^"]*openCart[^"]*)"/g)];
assert.ok(comboButtonMatches.length >= 3, 'Phải tìm thấy ít nhất 3 nút Mua Trọn Bộ Combo trong index.html');

let allCombosApplyDiscount = true;
comboButtonMatches.forEach((match, idx) => {
  const code = match[1];
  const hasDiscountCall = code.includes('applyCoupon') || code.includes('setDiscount') || code.includes('TT3D10');
  if (!hasDiscountCall) {
    console.log(`  - Combo ${idx + 1} onclick code: ${code}`);
    allCombosApplyDiscount = false;
  }
});

// --------------------------------------------------------------------------
// TEST 2: Location & Brand Consistency
// --------------------------------------------------------------------------
console.log('\n[TEST 2] Kiểm tra nhất quán địa chỉ xưởng Hà Tĩnh & thương hiệu T&T 3D Studio...');
const hasHanoiWorkshop = /xưởng\s+Hà\s+Nội|Studio,\s*Hà\s+Nội/i.test(indexHtml);
const hasTt3dLabs = /T&amp;T 3D Labs|T&T 3D Labs/i.test(indexHtml);

console.log(`  - Chứa "xưởng Hà Nội": ${hasHanoiWorkshop}`);
console.log(`  - Chứa "T&T 3D Labs": ${hasTt3dLabs}`);

// --------------------------------------------------------------------------
// TEST 3: Dead Code Removal
// --------------------------------------------------------------------------
console.log('\n[TEST 3] Kiểm tra loại bỏ script rác automation-simulator.js khỏi index.html...');
const hasAutomationSimulator = indexHtml.includes('js/automation-simulator.js');
console.log(`  - Chứa "js/automation-simulator.js": ${hasAutomationSimulator}`);

// Assertions to enforce RED status on legacy code
assert.strictEqual(allCombosApplyDiscount, true, 'LỖI: Nút Mua Trọn Bộ chưa gọi mã giảm giá hoặc chiết khấu 10%!');
assert.strictEqual(hasHanoiWorkshop, false, 'LỖI: index.html vẫn còn chứa thông tin xưởng tại Hà Nội mâu thuẫn!');
assert.strictEqual(hasTt3dLabs, false, 'LỖI: index.html vẫn còn chứa thương hiệu cũ T&T 3D Labs!');
assert.strictEqual(hasAutomationSimulator, false, 'LỖI: index.html vẫn nạp script rác automation-simulator.js!');

console.log('\n🎉 [PASS] Tất cả các tiêu chuẩn Sprint 1 đều đạt chuẩn!');
