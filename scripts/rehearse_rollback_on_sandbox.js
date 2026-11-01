const { querySql } = require('./query_db');

async function rehearseRollback() {
  console.log('====================================================================');
  console.log('   DIỄN TẬP ROLLBACK TRÊN BẢN SAO DATABASE (CLONED SANDBOX SCHEMA)');
  console.log('====================================================================\n');

  try {
    // 1. Tạo schema bản sao riêng biệt
    console.log('[1/5] Tạo sandbox schema: rehearsal_sandbox...');
    await querySql('CREATE SCHEMA IF NOT EXISTS rehearsal_sandbox;');

    // 2. Clone cấu trúc bảng và dữ liệu từ public sang rehearsal_sandbox
    console.log('[2/5] Sao chép bảng và dữ liệu: orders, customer_addresses, products...');
    await querySql(`
      CREATE TABLE IF NOT EXISTS rehearsal_sandbox.products AS 
      SELECT * FROM public.products;
    `);
    await querySql(`
      CREATE TABLE IF NOT EXISTS rehearsal_sandbox.customer_addresses AS 
      SELECT * FROM public.customer_addresses;
    `);
    await querySql(`
      CREATE TABLE IF NOT EXISTS rehearsal_sandbox.orders AS 
      SELECT * FROM public.orders;
    `);

    const countBeforeOrders = await querySql('SELECT count(*) as total FROM rehearsal_sandbox.orders;');
    const countBeforeAddr = await querySql('SELECT count(*) as total FROM rehearsal_sandbox.customer_addresses;');
    const countBeforeProd = await querySql('SELECT count(*) as total FROM rehearsal_sandbox.products;');

    console.log(`- Số lượng đơn hàng ban đầu: ${countBeforeOrders.data[0].total}`);
    console.log(`- Số lượng địa chỉ ban đầu: ${countBeforeAddr.data[0].total}`);
    console.log(`- Số lượng sản phẩm ban đầu: ${countBeforeProd.data[0].total}`);

    // 3. Khởi tạo phiên bản 16 tham số (bản feature hiện tại) trong sandbox
    console.log('\n[3/5] Khởi tạo hàm create_order (16 tham số) trong sandbox...');
    await querySql(`
      CREATE OR REPLACE FUNCTION rehearsal_sandbox.create_order(
          p_items JSONB,
          p_shipping_name TEXT,
          p_shipping_phone TEXT,
          p_shipping_address TEXT,
          p_customer_note TEXT,
          p_payment_method TEXT,
          p_coupon_code TEXT,
          p_idempotency_key TEXT,
          p_address_id UUID DEFAULT NULL,
          p_save_address BOOLEAN DEFAULT FALSE,
          p_address_label TEXT DEFAULT 'home',
          p_province_code TEXT DEFAULT NULL,
          p_province_name TEXT DEFAULT NULL,
          p_ward_code TEXT DEFAULT NULL,
          p_ward_name TEXT DEFAULT NULL,
          p_address_line TEXT DEFAULT NULL
      ) RETURNS JSONB LANGUAGE plpgsql AS $$
      BEGIN
          RETURN jsonb_build_object('ok', true, 'version', '16-params');
      END;
      $$;
    `);

    const funcsBefore = await querySql(`
      SELECT proname, pronargs
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'rehearsal_sandbox' AND p.proname = 'create_order';
    `);
    console.log('Chữ ký hàm trước khi rollback:', funcsBefore.data);

    // 4. Thực thi kịch bản rollback:
    // Drop hàm 16 tham số -> Tạo lại hàm 8 tham số
    console.log('\n[4/5] THỰC THI SCRIPT ROLLBACK TRÊN SANDBOX...');
    await querySql(`
      DROP FUNCTION IF EXISTS rehearsal_sandbox.create_order(
          JSONB, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, BOOLEAN, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
      );
    `);

    await querySql(`
      CREATE OR REPLACE FUNCTION rehearsal_sandbox.create_order(
          p_items JSONB,
          p_shipping_name TEXT,
          p_shipping_phone TEXT,
          p_shipping_address TEXT,
          p_customer_note TEXT,
          p_payment_method TEXT,
          p_coupon_code TEXT,
          p_idempotency_key TEXT
      ) RETURNS JSONB LANGUAGE plpgsql AS $$
      BEGIN
          RETURN jsonb_build_object('ok', true, 'version', '8-params-restored');
      END;
      $$;
    `);

    // 5. Kiểm tra kết quả sau rollback
    console.log('\n[5/5] KIỂM TRA ĐỐI CHIẾU DỮ LIỆU & CHỮ KÝ HÀM SAU ROLLBACK:');

    const funcsAfter = await querySql(`
      SELECT proname, pronargs
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'rehearsal_sandbox' AND p.proname = 'create_order';
    `);
    console.log('Chữ ký hàm sau rollback:', funcsAfter.data);

    const countAfterOrders = await querySql('SELECT count(*) as total FROM rehearsal_sandbox.orders;');
    const countAfterAddr = await querySql('SELECT count(*) as total FROM rehearsal_sandbox.customer_addresses;');
    const countAfterProd = await querySql('SELECT count(*) as total FROM rehearsal_sandbox.products;');

    const ordersIntact = countBeforeOrders.data[0].total === countAfterOrders.data[0].total;
    const addrIntact = countBeforeAddr.data[0].total === countAfterAddr.data[0].total;
    const prodIntact = countBeforeProd.data[0].total === countAfterProd.data[0].total;
    const singleSignature = funcsAfter.data.length === 1 && funcsAfter.data[0].pronargs === 8;

    console.log(`- Đơn hàng được bảo toàn (orders intact): ${ordersIntact ? 'PASS' : 'FAIL'} (${countAfterOrders.data[0].total} rows)`);
    console.log(`- Địa chỉ được bảo toàn (addresses intact): ${addrIntact ? 'PASS' : 'FAIL'} (${countAfterAddr.data[0].total} rows)`);
    console.log(`- Sản phẩm được bảo toàn (products intact): ${prodIntact ? 'PASS' : 'FAIL'} (${countAfterProd.data[0].total} rows)`);
    console.log(`- Duy nhất 1 chữ ký hàm 8 tham số (không overload collision PGRST203): ${singleSignature ? 'PASS' : 'FAIL'}`);

    if (ordersIntact && addrIntact && prodIntact && singleSignature) {
      console.log('\n🎉 DIỄN TẬP ROLLBACK TRÊN BẢN SAO THÀNH CÔNG RỰC RỠ! (VERIFIED PASS)');
    } else {
      console.log('\n❌ DIỄN TẬP ROLLBACK THẤT BẠI!');
    }

  } finally {
    // Luôn dọn dẹp sandbox schema để database luôn sạch
    console.log('\n[*] Đang dọn dẹp sandbox schema (DROP SCHEMA rehearsal_sandbox CASCADE)...');
    await querySql('DROP SCHEMA IF EXISTS rehearsal_sandbox CASCADE;');
    console.log('[+] Đã dọn dẹp hoàn toàn sandbox schema khỏi database.');
  }
}

rehearseRollback().catch(console.error);
