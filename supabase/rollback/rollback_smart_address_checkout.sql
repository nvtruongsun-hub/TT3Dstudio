-- =========================================================================
-- ROLLBACK SCRIPT: SMART ADDRESS CHECKOUT & SECURE ORDER RPC
-- Project: T&T 3D Studio (Supabase nbsumfhfxohawiuxrwqj)
-- Target: Feature branch feature/smart-address-checkout
-- =========================================================================

BEGIN;

-- 1. XÓA POLICY & BẢNG customer_addresses (NẾU ROLLBACK TOÀN BỘ TÍNH NĂNG ĐỊA CHỈ)
DROP POLICY IF EXISTS "Users can view own addresses" ON public.customer_addresses;
DROP POLICY IF EXISTS "Users can insert own addresses" ON public.customer_addresses;
DROP POLICY IF EXISTS "Users can update own addresses" ON public.customer_addresses;
DROP POLICY IF EXISTS "Users can delete own addresses" ON public.customer_addresses;
DROP POLICY IF EXISTS "Staff and admin can view all customer addresses" ON public.customer_addresses;

DROP TRIGGER IF EXISTS trg_ensure_single_default_address ON public.customer_addresses;
DROP FUNCTION IF EXISTS public.ensure_single_default_customer_address();

-- Lưu ý: Chỉ drop bảng nếu cần hoàn tác hoàn toàn database. Nếu muốn giữ dữ liệu khách hàng, comment dòng dưới:
-- DROP TABLE IF EXISTS public.customer_addresses CASCADE;

-- 2. GỠ CÁC CỘT MỞ RỘNG TRÊN BẢNG orders (NẾU CẦN)
-- ALTER TABLE public.orders DROP COLUMN IF EXISTS address_id;
-- ALTER TABLE public.orders DROP COLUMN IF EXISTS order_shipping_snapshot;

-- 3. KHÔI PHỤC HÀM create_order VỀ PHIÊN BẢN 8 THAM SỐ GỐC (20261031_ecommerce_upgrade.sql)
-- Xóa hàm 16 tham số mới để tránh xung đột PostgREST overload collision (PGRST203)
DROP FUNCTION IF EXISTS public.create_order(
    JSONB, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, BOOLEAN, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
);

CREATE OR REPLACE FUNCTION public.create_order(
    p_items JSONB,
    p_shipping_name TEXT,
    p_shipping_phone TEXT,
    p_shipping_address TEXT,
    p_customer_note TEXT,
    p_payment_method TEXT,
    p_coupon_code TEXT,
    p_idempotency_key TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_user_id UUID;
    v_email_confirmed TIMESTAMPTZ;
    v_order_id UUID;
    v_order_number TEXT;
    v_subtotal INT := 0;
    v_discount INT := 0;
    v_shipping_fee INT := 25000;
    v_total INT := 0;
    v_item RECORD;
    v_prod RECORD;
    v_coupon RECORD;
    v_coupon_id UUID := NULL;
    v_line_total INT;
    v_existing_id UUID;
    v_existing_order_number TEXT;
    v_clean_phone TEXT;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('ok', false, 'code', 'UNAUTHORIZED', 'error', 'Bạn phải đăng nhập tài khoản trước khi tiến hành đặt hàng.');
    END IF;

    SELECT email_confirmed_at INTO v_email_confirmed FROM auth.users WHERE id = v_user_id;
    IF v_email_confirmed IS NULL THEN
        RETURN jsonb_build_object('ok', false, 'code', 'EMAIL_NOT_VERIFIED', 'error', 'Tài khoản chưa xác minh email.');
    END IF;

    IF p_idempotency_key IS NULL OR TRIM(p_idempotency_key) = '' THEN
        RETURN jsonb_build_object('ok', false, 'code', 'MISSING_IDEMPOTENCY_KEY', 'error', 'Thiếu mã khóa idempotency.');
    END IF;

    SELECT id, order_number INTO v_existing_id, v_existing_order_number FROM public.orders WHERE idempotency_key = p_idempotency_key;
    IF v_existing_id IS NOT NULL THEN
        RETURN jsonb_build_object('ok', true, 'order_id', v_existing_id, 'order_number', v_existing_order_number, 'is_duplicate', true);
    END IF;

    IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
        RETURN jsonb_build_object('ok', false, 'code', 'EMPTY_CART', 'error', 'Giỏ hàng đang trống.');
    END IF;

    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id TEXT, quantity INT) LOOP
        SELECT price, status INTO v_prod FROM public.products WHERE id = v_item.product_id;
        IF v_prod.status != 'active' THEN
            RETURN jsonb_build_object('ok', false, 'code', 'PRODUCT_UNAVAILABLE', 'error', 'Sản phẩm không khả dụng');
        END IF;
        v_subtotal := v_subtotal + (v_prod.price * v_item.quantity);
    END LOOP;

    IF (v_subtotal - v_discount) >= 300000 THEN
        v_shipping_fee := 0;
    ELSE
        v_shipping_fee := 25000;
    END IF;

    v_total := (v_subtotal - v_discount) + v_shipping_fee;
    v_order_number := 'TT3D-' || TO_CHAR(NOW(), 'YYMM') || '-' || UPPER(SUBSTRING(MD5(p_idempotency_key) FROM 1 FOR 5));

    INSERT INTO public.orders (
        order_number, user_id, status, payment_method, payment_status,
        subtotal, discount_amount, shipping_fee, total, coupon_id,
        shipping_name, shipping_phone, shipping_address, customer_note, idempotency_key
    ) VALUES (
        v_order_number, v_user_id, 'request_received', COALESCE(p_payment_method, 'cod'), 'pending',
        v_subtotal, v_discount, v_shipping_fee, v_total, v_coupon_id,
        p_shipping_name, p_shipping_phone, p_shipping_address, p_customer_note, p_idempotency_key
    ) RETURNING id INTO v_order_id;

    RETURN jsonb_build_object(
        'ok', true,
        'order_id', v_order_id,
        'order_number', v_order_number,
        'subtotal', v_subtotal,
        'total', v_total
    );
END;
$$;

COMMIT;
