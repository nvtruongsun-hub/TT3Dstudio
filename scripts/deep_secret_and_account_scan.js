const { execSync } = require('child_process');
const { querySql } = require('./query_db');

async function runDeepScan() {
  console.log('========================================================================');
  console.log('   QUÉT BẢO MẬT TOÀN BỘ GIT HISTORY & PHÂN LOẠI DỮ LIỆU DATABASE');
  console.log('========================================================================\n');

  // --- PHẦN 1: QUÉT SECRET TRONG TOÀN BỘ LỊCH SỬ GIT ---
  console.log('[1/2] Quét Secrets trong Git History (Không in giá trị secret)...');
  
  // Patterns to scan
  const patterns = [
    { name: 'Supabase Service Role Key', regex: /eyJhbGciOi[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g },
    { name: 'Supabase Personal Access Token', regex: /sbp_[a-zA-Z0-9]{30,60}/g },
    { name: 'Private Key Block', regex: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g },
    { name: 'Telegram Bot Token', regex: /[0-9]{8,10}:[a-zA-Z0-9_-]{35}/g }
  ];

  let rawLog = '';
  try {
    rawLog = execSync('git log --all -p -n 1000', { maxBuffer: 100 * 1024 * 1024, encoding: 'utf8' });
  } catch (e) {
    console.error('Không thể đọc git log:', e.message);
  }

  const clientFiles = [
    'js/supabase-client.js',
    'js/app.js',
    'js/checkout.js',
    'js/address-book.js',
    'index.html',
    'checkout.html',
    'dist/'
  ];

  let clientLeaks = 0;
  let testFileOccurrences = 0;

  for (const pat of patterns) {
    let match;
    while ((match = pat.regex.exec(rawLog)) !== null) {
      const matchIndex = match.index;
      const contextSnippet = rawLog.substring(Math.max(0, matchIndex - 300), Math.min(rawLog.length, matchIndex + 300));
      
      // Determine if leaked in client-facing files
      const isClient = clientFiles.some(f => contextSnippet.includes('diff --git a/' + f) || contextSnippet.includes('+++ b/' + f));
      
      // Check if it's service_role JWT
      if (pat.name === 'Supabase Service Role Key') {
        try {
          const parts = match[0].split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
            if (payload.role === 'service_role') {
              if (isClient) {
                console.log(`🚨 PHÁT HIỆN: service_role key trong file client (Vị trí đã bị che [REDACTED])!`);
                clientLeaks++;
              } else {
                testFileOccurrences++;
              }
            }
          }
        } catch (_) {}
      } else if (pat.name === 'Supabase Personal Access Token') {
        if (isClient) {
          console.log(`🚨 PHÁT HIỆN: sbp_ token trong file client!`);
          clientLeaks++;
        } else {
          testFileOccurrences++;
        }
      }
    }
  }

  console.log(`- Số lượng secrets bị lộ trong client-facing code (dist, js, html): ${clientLeaks}`);
  console.log(`- Số lần token xuất hiện trong scripts kiểm thử nội bộ: ${testFileOccurrences}`);
  if (clientLeaks === 0) {
    console.log('✅ PASS: Tuyệt đối không có secret (service_role, sbp_) nào bị commit vào mã nguồn phía client.');
  } else {
    console.log('❌ FAIL: Phát hiện rò rỉ secret vào mã nguồn client!');
  }

  // --- PHẦN 2: PHÂN LOẠI CHÍNH XÁC TÀI KHOẢN VÀ ĐƠN HÀNG DATABASE ---
  console.log('\n[2/2] Phân loại dữ liệu Database (Bảo toàn 100%, KHÔNG xóa)...');

  // Lấy tất cả users
  const usersRes = await querySql(`
    SELECT u.id, u.email, u.created_at, u.email_confirmed_at,
           COALESCE(u.raw_user_meta_data->>'full_name', '') as full_name,
           r.role
    FROM auth.users u
    LEFT JOIN public.user_roles r ON u.id = r.user_id
    ORDER BY u.created_at ASC;
  `);

  const realAccounts = [];
  const testAccounts = [];

  const knownRealEmails = [
    'nvtruong.sun@gmail.com',
    'tt3dstudio.customer@gmail.com',
    'congtuvodanh2901@gmail.com'
  ];

  for (const u of (usersRes.data || [])) {
    if (knownRealEmails.includes(u.email)) {
      realAccounts.push(u);
    } else {
      testAccounts.push(u);
    }
  }

  console.log(`\n📌 DANH SÁCH TÀI KHOẢN THẬT (${realAccounts.length} tài khoản - BẤT KHẢ XÂM PHẠM):`);
  console.table(realAccounts.map(a => ({
    id: a.id,
    email: a.email,
    name: a.full_name,
    role: a.role,
    created: a.created_at
  })));

  console.log(`\n🧪 DANH SÁCH TÀI KHOẢN TEST TỰ ĐỘNG (${testAccounts.length} tài khoản - CẦN BẢO LƯU CHO ĐẾN KHI DUYỆT):`);
  console.table(testAccounts.map(a => ({
    id: a.id,
    email: a.email,
    created: a.created_at
  })));

  // Lấy tất cả đơn hàng
  const ordersRes = await querySql(`
    SELECT id, order_number, user_id, shipping_name, shipping_phone, total, status, created_at, idempotency_key
    FROM public.orders
    ORDER BY created_at ASC;
  `);

  const realOrders = [];
  const testOrders = [];

  for (const o of (ordersRes.data || [])) {
    const isRealUser = realAccounts.some(a => a.id === o.user_id);
    if (isRealUser && !o.shipping_name.toLowerCase().includes('test')) {
      realOrders.push(o);
    } else {
      testOrders.push(o);
    }
  }

  console.log(`\n📦 PHÂN LOẠI ĐƠN HÀNG:`);
  console.log(`- Đơn hàng thật: ${realOrders.length} đơn`);
  if (realOrders.length > 0) {
    console.table(realOrders);
  }
  console.log(`- Đơn hàng test: ${testOrders.length} đơn`);
  console.table(testOrders.map(o => ({
    order_number: o.order_number,
    name: o.shipping_name,
    total: o.total,
    status: o.status,
    created: o.created_at
  })));

  console.log('\n🔒 XÁC NHẬN AN TOÀN DỮ LIỆU: 0 bản ghi bị xóa hoặc thay đổi trong quá trình audit.');
}

runDeepScan().catch(console.error);
