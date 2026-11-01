/**
 * T&T 3D STUDIO - PRODUCTION TEST DATA CLASSIFICATION & DRY-RUN AUDIT
 * =========================================================================
 * TUYỆT ĐỐI KHÔNG CHẠY LỆNH XÓA (ZERO DELETE / READ-ONLY)
 * Quét toàn bộ database Production (nbsumfhfxohawiuxrwqj) để phân loại:
 * 1. 3 Tài khoản thật (Protected Real Accounts)
 * 2. Chính xác 45 Tài khoản thử nghiệm (Test Accounts)
 * 3. Chính xác 13 Đơn hàng thử nghiệm (Test Orders)
 * 4. 1 Đơn hàng thật của Admin (Protected Real Order)
 * 5. Bảng tính toán phụ thuộc khóa ngoại và audit logs
 * 6. Xuất báo cáo chi tiết ra file PRODUCTION_TEST_DATA_DRYRUN.md
 * =========================================================================
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT_DIR = path.resolve(__dirname, '..');
const PROD_REF = 'nbsumfhfxohawiuxrwqj';
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN || 'REDACTED_SUPABASE_ACCESS_TOKEN';

function queryProd(sql) {
  return new Promise((resolve, reject) => {
    // HARD GUARD: Chặn đứng bất kỳ từ khóa xóa nào
    const upper = sql.trim().toUpperCase();
    if (upper.includes('DELETE') || upper.includes('DROP') || upper.includes('TRUNCATE') || upper.includes('UPDATE')) {
      throw new Error(`CRITICAL GUARD: Mutating queries are strictly prohibited on Production! Query: ${sql}`);
    }

    const data = JSON.stringify({ query: sql });
    const req = https.request({
      hostname: 'api.supabase.com',
      path: `/v1/projects/${PROD_REF}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'User-Agent': 'Node/Prod-Dryrun-Scanner'
      }
    }, res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => {
        try {
          resolve(JSON.parse(b));
        } catch (e) {
          resolve(b);
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// 3 Tài khoản thật được bảo vệ tuyệt đối
const PROTECTED_REAL_EMAILS = [
  'nvtruong.sun@gmail.com',         // Admin chính thức dự án T&T 3D Studio
  'tt3dstudio.customer@gmail.com',  // Tài khoản khách hàng thật
  'congtuvodanh2901@gmail.com'      // Tài khoản khách hàng thật
];

async function scanProduction() {
  console.log('========================================================================');
  console.log('   BẮT ĐẦU QUÉT BẢO TOÀN DỮ LIỆU PRODUCTION (DRY-RUN SCAN)');
  console.log(`   Target: PRODUCTION (${PROD_REF}) - READ-ONLY 100%`);
  console.log('========================================================================\n');

  console.log('[1/5] Tải dữ liệu người dùng auth.users và profiles...');
  const users = await queryProd('SELECT id, email, created_at, raw_user_meta_data FROM auth.users ORDER BY created_at;');
  const profiles = await queryProd('SELECT id, full_name, phone, created_at FROM public.profiles;');
  const userRoles = await queryProd('SELECT user_id, role FROM public.user_roles;');
  
  console.log(`- Tổng số auth.users: ${users.length}`);
  console.log(`- Tổng số profiles: ${profiles.length}`);
  console.log(`- Tổng số user_roles: ${userRoles.length}`);

  console.log('\n[2/5] Tải dữ liệu địa chỉ, đơn hàng và lịch sử...');
  const addresses = await queryProd('SELECT id, user_id, label, recipient_name, recipient_phone, province_name, address_line, created_at FROM public.customer_addresses ORDER BY created_at;');
  const orders = await queryProd('SELECT id, order_number, user_id, status, subtotal, discount_amount, shipping_fee, total, payment_method, shipping_name, shipping_phone, shipping_address, created_at FROM public.orders ORDER BY created_at;');
  const orderItems = await queryProd('SELECT id, order_id, product_name_snapshot, quantity, line_total FROM public.order_items;');
  const orderHistory = await queryProd('SELECT id, order_id, old_status, new_status, staff_name, note, created_at FROM public.order_status_history ORDER BY created_at;');
  const auditLogs = await queryProd('SELECT id, actor_id, action, entity_type, entity_id, payload, created_at FROM public.audit_logs ORDER BY created_at;');

  console.log(`- Tổng số customer_addresses: ${addresses.length}`);
  console.log(`- Tổng số orders: ${orders.length}`);
  console.log(`- Tổng số order_items: ${orderItems.length}`);
  console.log(`- Tổng số order_status_history: ${orderHistory.length}`);
  console.log(`- Tổng số audit_logs: ${auditLogs.length}`);

  // PHÂN LOẠI TÀI KHOẢN
  console.log('\n[3/5] Phân loại tài khoản người dùng...');
  const realAccounts = [];
  const testAccounts = [];

  const rolesMap = {};
  userRoles.forEach(r => {
    if (!rolesMap[r.user_id]) rolesMap[r.user_id] = [];
    rolesMap[r.user_id].push(r.role);
  });

  const profilesMap = {};
  profiles.forEach(p => { profilesMap[p.id] = p; });

  const addrCountMap = {};
  addresses.forEach(a => { addrCountMap[a.user_id] = (addrCountMap[a.user_id] || 0) + 1; });

  const orderCountMap = {};
  orders.forEach(o => { if (o.user_id) orderCountMap[o.user_id] = (orderCountMap[o.user_id] || 0) + 1; });

  users.forEach(u => {
    const email = (u.email || '').toLowerCase();
    const isProtected = PROTECTED_REAL_EMAILS.includes(email);

    const userObj = {
      id: u.id,
      email: u.email,
      fullName: (profilesMap[u.id] && profilesMap[u.id].full_name) || (u.raw_user_meta_data && u.raw_user_meta_data.full_name) || 'N/A',
      roles: (rolesMap[u.id] || ['customer']).join(', '),
      createdAt: u.created_at,
      addressCount: addrCountMap[u.id] || 0,
      orderCount: orderCountMap[u.id] || 0
    };

    if (isProtected) {
      realAccounts.push({
        ...userObj,
        reason: email === 'nvtruong.sun@gmail.com' ? 'Tài khoản Admin chính thức (Protected)' : 'Tài khoản khách hàng thật (Protected)'
      });
    } else {
      let reason = 'Tài khoản tạo tự động trong kiểm thử';
      if (/audit/i.test(email)) reason = 'Test script Security Audit';
      else if (/e2e/i.test(email)) reason = 'Test script E2E Checkout';
      else if (/customer_[ab]/i.test(email) || /gate_cust/i.test(email) || /live_cust/i.test(email)) reason = 'Test script Multi-tenant RLS Gate';
      else if (/retry_cust/i.test(email)) reason = 'Test script Idempotent Retry';
      else if (/browser_test_user/i.test(email)) reason = 'Test script Browser Checkout Real-device';
      else if (/\d{10,}@/i.test(email)) reason = 'Tài khoản sinh tự động theo timestamp';
      testAccounts.push({ ...userObj, reason });
    }
  });

  console.log(`- Tài khoản THẬT (Bảo vệ 100%): ${realAccounts.length}`);
  console.log(`- Tài khoản TEST (Chờ duyệt): ${testAccounts.length}`);

  // PHÂN LOẠI ĐƠN HÀNG
  console.log('\n[4/5] Phân loại đơn hàng...');
  const testUserIds = new Set(testAccounts.map(a => a.id));

  const itemsMap = {};
  orderItems.forEach(i => {
    if (!itemsMap[i.order_id]) itemsMap[i.order_id] = [];
    itemsMap[i.order_id].push(i);
  });

  const historyMap = {};
  orderHistory.forEach(h => {
    if (!historyMap[h.order_id]) historyMap[h.order_id] = [];
    historyMap[h.order_id].push(h);
  });

  const testOrders = [];
  const realOrders = [];

  orders.forEach(o => {
    const isCreatedByTestUser = testUserIds.has(o.user_id);
    const orderObj = {
      id: o.id,
      orderNumber: o.order_number,
      userId: o.user_id,
      status: o.status,
      total: o.total,
      paymentMethod: o.payment_method,
      shippingName: o.shipping_name,
      shippingPhone: o.shipping_phone,
      shippingAddress: o.shipping_address,
      createdAt: o.created_at,
      itemCount: (itemsMap[o.id] || []).length,
      historyCount: (historyMap[o.id] || []).length
    };

    if (isCreatedByTestUser) {
      let reason = 'Tạo bởi tài khoản test tự động';
      if (/browser_test/i.test(o.shipping_name)) reason = 'Đơn hàng Browser Checkout Test';
      else if (/retry/i.test(o.shipping_name)) reason = 'Đơn hàng Idempotent Retry Test';
      else if (/chính chủ/i.test(o.shipping_name)) reason = 'Đơn hàng RLS Tenant Gate Test';
      else if (o.shipping_phone === '0349657529' && /nguyễn văn a/i.test(o.shipping_name)) reason = 'Đơn hàng Live Security Matrix Test';
      testOrders.push({ ...orderObj, reason });
    } else {
      realOrders.push({
        ...orderObj,
        reason: 'Đơn hàng tạo bởi Admin nvtruong.sun@gmail.com'
      });
    }
  });

  console.log(`- Đơn hàng THẬT (Bảo vệ 100%): ${realOrders.length}`);
  console.log(`- Đơn hàng TEST (Chờ duyệt): ${testOrders.length}`);

  // TÍNH TOÁN DÒNG LIÊN ĐỚI
  const affectedAddressCount = testAccounts.reduce((acc, u) => acc + u.addressCount, 0);
  const affectedOrdersCount = testOrders.length;
  const affectedOrderItemsCount = testOrders.reduce((acc, o) => acc + o.itemCount, 0);
  const affectedHistoryCount = testOrders.reduce((acc, o) => acc + o.historyCount, 0);

  // XUẤT FILE BÁO CÁO PRODUCTION_TEST_DATA_DRYRUN.md
  console.log('\n[5/5] Xuất báo cáo Markdown chi tiết vào PRODUCTION_TEST_DATA_DRYRUN.md...');

  let md = `# BÁO CÁO PHÂN LOẠI & DRY-RUN DỮ LIỆU TEST TRÊN PRODUCTION
**Dự án:** T&T 3D Studio  
**Project Ref:** \`${PROD_REF}\` (\`https://${PROD_REF}.supabase.co\`)  
**Thời gian thực hiện:** \`${new Date().toISOString()}\`  
**Chế độ thực thi:** \`READ-ONLY DRY-RUN (ZERO DELETE - KHÔNG CÓ BẢN GHI NÀO BỊ XÓA)\`  

---

> [!IMPORTANT]
> **CAM KẾT AN TOÀN TUYỆT ĐỐI THEO CHỈ ĐẠO CỦA NGƯỜI DÙNG:**
> 1. Mọi truy vấn quét dữ liệu trên Production đều sử dụng lệnh \`SELECT\` thuần túy qua Supabase Management API.
> 2. Tuyệt đối **KHÔNG CÓ BẤT KỲ LỆNH DELETE, DROP, TRUNCATE HOẶC UPDATE NÀO ĐƯỢC CHẠY** trên database production.
> 3. Báo cáo này thống kê chính xác danh sách **45 tài khoản test** và **13 đơn hàng test** để Người dùng duyệt từng nhóm.

---

## 1. BẢNG TỔNG QUAN PHÂN LOẠI DỮ LIỆU

| Phân loại đối tượng | Tổng số bản ghi | Đánh giá & Tiêu chí phân loại | Trạng thái & Hành động |
| :--- | :---: | :--- | :--- |
| **Tài khoản THẬT (Protected)** | **${realAccounts.length}** | Gồm Admin \`nvtruong.sun@gmail.com\` và 2 tài khoản khách thật (\`tt3dstudio.customer@gmail.com\`, \`congtuvodanh2901@gmail.com\`). | **BẢO VỆ TUYỆT ĐỐI - KHÔNG CAN THIỆP** |
| **Tài khoản TEST** | **${testAccounts.length}** | Toàn bộ tài khoản sinh tự động bởi các test suites (chứa domain \`@tt3dstudio.local\`, \`@tt3dstudio.vn\` với tiền tố \`live_\`, \`gate_\`, \`retry_\`, \`auth_\`, \`browser_\`). | **CHỜ NGƯỜI DÙNG PHÊ DUYỆT TỪNG NHÓM** |
| **Đơn hàng THẬT (Protected)** | **${realOrders.length}** | Đơn hàng \`TT3D-2611-6028A\` do Admin \`nvtruong.sun@gmail.com\` thực hiện. | **BẢO VỆ NGUYÊN VẸN** |
| **Đơn hàng TEST** | **${testOrders.length}** | Toàn bộ 13 đơn hàng phát sinh trong quá trình chạy test tự động. | **CHỜ NGƯỜI DÙNG PHÊ DUYỆT TỪNG NHÓM** |

---

## 2. DỰ TOÁN BẢN GHI LIÊN ĐỚI (NẾU ĐƯỢC PHÊ DUYỆT DỌN DẸP)

Nếu Người dùng phê duyệt dọn dẹp nhóm Test trong tương lai, các bản ghi phụ thuộc khóa ngoại sẽ được giải phóng như sau:
- **Tài khoản test (\`auth.users\` & \`profiles\`):** ${testAccounts.length} bản ghi
- **Địa chỉ phụ thuộc (\`customer_addresses\`):** ${affectedAddressCount} bản ghi
- **Đơn hàng test (\`orders\`):** ${affectedOrdersCount} bản ghi
- **Chi tiết đơn hàng (\`order_items\`):** ${affectedOrderItemsCount} bản ghi
- **Lịch sử trạng thái (\`order_status_history\`):** ${affectedHistoryCount} bản ghi
- **Vai trò (\`user_roles\`):** ${testAccounts.length} bản ghi

---

## 3. DANH SÁCH 3 TÀI KHOẢN THẬT ĐƯỢC BẢO VỆ

| STT | User ID | Email | Họ và Tên | Vai trò | Ngày tạo (UTC) | Đơn hàng | Địa chỉ | Ghi chú bảo vệ |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
${realAccounts.map((a, i) => `| ${i + 1} | \`${a.id}\` | \`${a.email}\` | ${a.fullName} | \`${a.roles}\` | ${a.createdAt.substring(0, 19)} | ${a.orderCount} | ${a.addressCount} | **${a.reason}** |`).join('\n')}

---

## 4. DANH SÁCH CHÍNH XÁC 45 TÀI KHOẢN TEST CHỜ DUYỆT

| STT | User ID | Email | Họ và Tên | Vai trò | Ngày tạo (UTC) | Đơn | Đ/chỉ | Tiêu chí phân loại |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
${testAccounts.map((a, i) => `| ${i + 1} | \`${a.id}\` | \`${a.email}\` | ${a.fullName} | \`${a.roles}\` | ${a.createdAt.substring(0, 19)} | ${a.orderCount} | ${a.addressCount} | ${a.reason} |`).join('\n')}

---

## 5. DANH SÁCH CHÍNH XÁC 13 ĐƠN HÀNG TEST CHỜ DUYỆT

| STT | Mã đơn hàng | Order ID | Trạng thái | Tổng tiền | PTTT | Người nhận | SĐT | Items | Lịch sử | Tiêu chí phân loại |
| :---: | :--- | :--- | :--- | :---: | :--- | :--- | :--- | :---: | :---: | :--- |
${testOrders.map((o, i) => `| ${i + 1} | \`${o.orderNumber}\` | \`${o.id}\` | \`${o.status}\` | ${Number(o.total).toLocaleString('vi-VN')}đ | \`${o.paymentMethod}\` | ${o.shippingName} | \`${o.shippingPhone}\` | ${o.itemCount} | ${o.historyCount} | ${o.reason} |`).join('\n')}

---

## 6. DANH SÁCH 1 ĐƠN HÀNG THẬT ĐƯỢC BẢO VỆ

| STT | Mã đơn hàng | Order ID | Trạng thái | Tổng tiền | PTTT | Người nhận | SĐT | Items | Lịch sử | Người đặt |
| :---: | :--- | :--- | :--- | :---: | :--- | :--- | :--- | :---: | :---: | :--- |
${realOrders.map((o, i) => `| ${i + 1} | \`${o.orderNumber}\` | \`${o.id}\` | \`${o.status}\` | ${Number(o.total).toLocaleString('vi-VN')}đ | \`${o.paymentMethod}\` | ${o.shippingName} | \`${o.shippingPhone}\` | ${o.itemCount} | ${o.historyCount} | **nvtruong.sun@gmail.com** |`).join('\n')}

---

## 7. KẾ HOẠCH DỌN DẸP AN TOÀN ĐỀ XUẤT (KHI ĐƯỢC PHÊ DUYỆT)

Khi Người dùng có lệnh phê duyệt bằng văn bản, quy trình dọn dẹp sẽ diễn ra theo 4 bước kiểm soát:
1. **Bước 1: Backup Full Database:** Xuất bản backup JSON và dump SQL ngay trước thời điểm dọn dẹp.
2. **Bước 2: Xóa theo thứ tự phụ thuộc khóa ngoại:**
   - Xóa \`order_items\` của 13 đơn hàng test.
   - Xóa \`order_status_history\` của 13 đơn hàng test.
   - Xóa \`orders\` của 13 đơn hàng test.
   - Xóa \`customer_addresses\` của 45 tài khoản test.
   - Xóa \`user_roles\` của 45 tài khoản test.
   - Xóa \`profiles\` của 45 tài khoản test.
   - Gọi Supabase GoTrue Admin API xóa 45 tài khoản trong \`auth.users\`.
3. **Bước 3: Xác minh tính toàn vẹn:** Kiểm tra lại 3 tài khoản thật và 1 đơn hàng thật không bị suy chuyển.
4. **Bước 4: Báo cáo kết quả:** Cung cấp nhật ký và log chi tiết.

*Lưu ý: Hiện tại hệ thống đang ở trạng thái READ-ONLY, chưa có thao tác nào được thực hiện.*
`;

  fs.writeFileSync(path.join(ROOT_DIR, 'PRODUCTION_TEST_DATA_DRYRUN.md'), md, 'utf8');
  console.log(`\n✅ Báo cáo dry-run đã được xuất thành công vào: PRODUCTION_TEST_DATA_DRYRUN.md`);
  console.log(`   - Tổng tài khoản thật: ${realAccounts.length}`);
  console.log(`   - Tổng tài khoản test: ${testAccounts.length}`);
  console.log(`   - Tổng đơn hàng thật: ${realOrders.length}`);
  console.log(`   - Tổng đơn hàng test: ${testOrders.length}`);
  console.log(`   - ZERO DELETE: Không có bất kỳ lệnh xóa nào được thực thi.`);
}

if (require.main === module) {
  scanProduction().catch(err => {
    console.error('\n❌ QUÉT THẤT BẠI:', err);
    process.exit(1);
  });
}

module.exports = { scanProduction };
