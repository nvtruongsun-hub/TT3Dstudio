-- =========================================================================
-- T&T 3D LABS - SMART ADDRESS & ECOMMERCE CHECKOUT MIGRATION
-- Migration: 20261101_smart_address_checkout.sql
-- Description: Customer Addresses Table, 2-Tier Administrative Support,
--              Order Shipping Snapshot, Default Address Triggers & Secure RPC
-- =========================================================================

-- 1. BẢNG SỔ ĐỊA CHỈ KHÁCH HÀNG (CUSTOMER_ADDRESSES)
CREATE TABLE IF NOT EXISTS public.customer_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    label TEXT CHECK (label IN ('home', 'office', 'other')) DEFAULT 'home' NOT NULL,
    recipient_name TEXT NOT NULL,
    recipient_phone TEXT NOT NULL,
    province_code TEXT NOT NULL,
    province_name TEXT NOT NULL,
    ward_code TEXT NOT NULL,
    ward_name TEXT NOT NULL,
    address_line TEXT NOT NULL,
    delivery_note TEXT,
    is_default BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Index tra cứu theo user
CREATE INDEX IF NOT EXISTS idx_customer_addresses_user ON public.customer_addresses(user_id);

-- Partial Unique Index: Đảm bảo MỖI khách chỉ có TỐI ĐA 1 địa chỉ mặc định
CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_addresses_single_default 
ON public.customer_addresses(user_id) 
WHERE is_default = TRUE;

-- Trigger auto updated_at
DROP TRIGGER IF EXISTS set_customer_addresses_updated_at ON public.customer_addresses;
CREATE TRIGGER set_customer_addresses_updated_at
BEFORE UPDATE ON public.customer_addresses
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger tự động bỏ cờ mặc định của các địa chỉ cũ khi đặt địa chỉ mới làm mặc định
CREATE OR REPLACE FUNCTION public.handle_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = TRUE THEN
        UPDATE public.customer_addresses
        SET is_default = FALSE
        WHERE user_id = NEW.user_id AND id != NEW.id AND is_default = TRUE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_single_default_address ON public.customer_addresses;
CREATE TRIGGER trigger_single_default_address
BEFORE INSERT OR UPDATE OF is_default ON public.customer_addresses
FOR EACH ROW
WHEN (NEW.is_default = TRUE)
EXECUTE FUNCTION public.handle_single_default_address();

-- 2. THIẾT LẬP ROW LEVEL SECURITY (RLS) CHO CUSTOMER_ADDRESSES
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own addresses" ON public.customer_addresses;
CREATE POLICY "Users can view own addresses"
ON public.customer_addresses FOR SELECT
USING (auth.uid() = user_id OR public.is_staff_or_admin());

DROP POLICY IF EXISTS "Users can insert own addresses" ON public.customer_addresses;
CREATE POLICY "Users can insert own addresses"
ON public.customer_addresses FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own addresses" ON public.customer_addresses;
CREATE POLICY "Users can update own addresses"
ON public.customer_addresses FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own addresses" ON public.customer_addresses;
CREATE POLICY "Users can delete own addresses"
ON public.customer_addresses FOR DELETE
USING (auth.uid() = user_id);

-- 3. MỞ RỘNG BẢNG ORDERS (THÊM SNAPSHOT VÀ ADDRESS_ID)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS address_id UUID REFERENCES public.customer_addresses(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS order_shipping_snapshot JSONB DEFAULT '{}'::jsonb;

-- 4. NÂNG CẤP HÀM SECURE ORDER RPC VỚI SMART ADDRESS SUPPORT
CREATE OR REPLACE FUNCTION public.create_order(
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
    p_province_code TEXT DEFAULT NULL,
    p_province_name TEXT DEFAULT NULL,
    p_ward_code TEXT DEFAULT NULL,
    p_ward_name TEXT DEFAULT NULL,
    p_address_line TEXT DEFAULT NULL,
    p_address_label TEXT DEFAULT 'home'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_user_id UUID;
    v_email_confirmed TIMESTAMPTZ;
    v_provider TEXT;
    v_is_oauth BOOLEAN := FALSE;
    v_order_id UUID;
    v_order_number TEXT;
    v_subtotal INT := 0;
    v_discount INT := 0;
    v_shipping_fee INT := 25000;
    v_total INT := 0;
    v_item RECORD;
    v_prod RECORD;
    v_coupon RECORD;
    v_addr RECORD;
    v_line_total INT;
    v_existing_id UUID;
    v_existing_order_number TEXT;
    v_clean_phone TEXT;
    v_final_address TEXT;
    v_final_name TEXT;
    v_final_phone TEXT;
    v_snapshot JSONB;
    v_saved_address_id UUID := NULL;
BEGIN
    -- 1. Xác thực người dùng
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'ok', false,
            'code', 'UNAUTHORIZED',
            'error', 'Bạn phải đăng nhập tài khoản trước khi tiến hành đặt hàng.'
        );
    END IF;

    -- 2. Kiểm tra email đã xác minh hoặc đăng nhập OAuth (Google/Facebook)
    SELECT 
        email_confirmed_at,
        raw_app_meta_data->>'provider'
    INTO 
        v_email_confirmed, 
        v_provider
    FROM auth.users 
    WHERE id = v_user_id;

    IF v_provider IN ('google', 'facebook') THEN
        v_is_oauth := TRUE;
    END IF;

    IF v_email_confirmed IS NULL AND NOT v_is_oauth THEN
        RETURN jsonb_build_object(
            'ok', false,
            'code', 'EMAIL_NOT_VERIFIED',
            'error', 'Tài khoản của bạn chưa xác minh email. Vui lòng kiểm tra hộp thư và bấm liên kết xác minh để kích hoạt quyền đặt hàng.'
        );
    END IF;

    -- 3. Kiểm tra Idempotency chống đặt trùng đơn khi click nhanh
    IF p_idempotency_key IS NULL OR TRIM(p_idempotency_key) = '' THEN
        RETURN jsonb_build_object(
            'ok', false,
            'code', 'MISSING_IDEMPOTENCY_KEY',
            'error', 'Thiếu mã khóa idempotency hợp lệ.'
        );
    END IF;

    SELECT id, order_number INTO v_existing_id, v_existing_order_number
    FROM public.orders 
    WHERE idempotency_key = p_idempotency_key;

    IF v_existing_id IS NOT NULL THEN
        RETURN jsonb_build_object(
            'ok', true,
            'order_id', v_existing_id,
            'order_number', v_existing_order_number,
            'is_duplicate', true,
            'message', 'Đơn hàng này đã được ghi nhận trước đó.'
        );
    END IF;

    -- 4. Xử lý địa chỉ: từ sổ địa chỉ đã lưu (p_address_id) HOẶC form địa chỉ mới
    IF p_address_id IS NOT NULL THEN
        -- Kiểm tra quyền sở hữu địa chỉ
        SELECT * INTO v_addr 
        FROM public.customer_addresses 
        WHERE id = p_address_id;

        IF v_addr.id IS NULL OR v_addr.user_id != v_user_id THEN
            RETURN jsonb_build_object(
                'ok', false,
                'code', 'UNAUTHORIZED_ADDRESS',
                'error', 'Địa chỉ giao hàng đã chọn không tồn tại hoặc không thuộc quyền sở hữu của bạn.'
            );
        END IF;

        v_saved_address_id := v_addr.id;
        v_final_name := v_addr.recipient_name;
        v_final_phone := v_addr.recipient_phone;
        v_final_address := v_addr.address_line || ', ' || v_addr.ward_name || ', ' || v_addr.province_name;
        
        v_snapshot := jsonb_build_object(
            'source', 'saved_address',
            'address_id', v_addr.id,
            'label', v_addr.label,
            'recipient_name', v_addr.recipient_name,
            'recipient_phone', v_addr.recipient_phone,
            'province_code', v_addr.province_code,
            'province_name', v_addr.province_name,
            'ward_code', v_addr.ward_code,
            'ward_name', v_addr.ward_name,
            'address_line', v_addr.address_line,
            'delivery_note', v_addr.delivery_note,
            'full_address_text', v_final_address
        );
    ELSE
        -- Địa chỉ mới từ form One-Page Checkout
        v_final_name := TRIM(COALESCE(p_shipping_name, ''));
        IF v_final_name = '' THEN
            RETURN jsonb_build_object('ok', false, 'code', 'INVALID_NAME', 'error', 'Vui lòng cung cấp họ tên người nhận.');
        END IF;

        v_clean_phone := REGEXP_REPLACE(COALESCE(p_shipping_phone, ''), '[\s.-]', '', 'g');
        IF NOT (v_clean_phone ~ '^(0|\+84)(3|5|7|8|9)[0-9]{8}$') THEN
            RETURN jsonb_build_object('ok', false, 'code', 'INVALID_PHONE', 'error', 'Số điện thoại nhận hàng không hợp lệ (10 chữ số tiêu chuẩn Việt Nam).');
        END IF;
        v_final_phone := v_clean_phone;

        -- Ghép địa chỉ 2 cấp nếu có thông tin tỉnh & xã, hoặc dùng shipping_address gốc
        IF p_province_name IS NOT NULL AND p_ward_name IS NOT NULL AND p_address_line IS NOT NULL THEN
            v_final_address := TRIM(p_address_line) || ', ' || TRIM(p_ward_name) || ', ' || TRIM(p_province_name);
        ELSE
            v_final_address := TRIM(COALESCE(p_shipping_address, ''));
        END IF;

        IF LENGTH(v_final_address) < 6 THEN
            RETURN jsonb_build_object('ok', false, 'code', 'INVALID_ADDRESS', 'error', 'Vui lòng nhập địa chỉ nhận hàng chi tiết (tối thiểu 6 ký tự).');
        END IF;

        v_snapshot := jsonb_build_object(
            'source', 'custom_input',
            'address_id', null,
            'label', COALESCE(p_address_label, 'other'),
            'recipient_name', v_final_name,
            'recipient_phone', v_final_phone,
            'province_code', p_province_code,
            'province_name', p_province_name,
            'ward_code', p_ward_code,
            'ward_name', p_ward_name,
            'address_line', COALESCE(p_address_line, v_final_address),
            'delivery_note', p_customer_note,
            'full_address_text', v_final_address
        );

        -- Tự động lưu vào sổ địa chỉ nếu khách chọn lưu
        IF p_save_address = TRUE THEN
            DECLARE
                v_has_any_address BOOLEAN;
            BEGIN
                SELECT EXISTS(SELECT 1 FROM public.customer_addresses WHERE user_id = v_user_id) INTO v_has_any_address;
                
                INSERT INTO public.customer_addresses (
                    user_id, label, recipient_name, recipient_phone,
                    province_code, province_name, ward_code, ward_name,
                    address_line, delivery_note, is_default
                ) VALUES (
                    v_user_id, COALESCE(p_address_label, 'home'), v_final_name, v_final_phone,
                    COALESCE(p_province_code, ''), COALESCE(p_province_name, ''),
                    COALESCE(p_ward_code, ''), COALESCE(p_ward_name, ''),
                    COALESCE(p_address_line, v_final_address), p_customer_note,
                    NOT v_has_any_address -- Tự động làm mặc định nếu là địa chỉ đầu tiên
                ) RETURNING id INTO v_saved_address_id;
            END;
        END IF;
    END IF;

    -- 5. Kiểm tra danh sách giỏ hàng
    IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
        RETURN jsonb_build_object('ok', false, 'code', 'EMPTY_CART', 'error', 'Giỏ hàng của bạn đang trống.');
    END IF;

    -- 6. Tính toán Subtotal dựa trên giá gốc từ bảng products (Chống can thiệp giá từ client)
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
        product_id TEXT, 
        quantity INT, 
        selected_options JSONB
    ) LOOP
        SELECT id, clean_title, price, status INTO v_prod 
        FROM public.products 
        WHERE id = v_item.product_id;

        IF v_prod.id IS NULL OR v_prod.status != 'active' THEN
            RETURN jsonb_build_object(
                'ok', false,
                'code', 'PRODUCT_UNAVAILABLE',
                'error', 'Sản phẩm mã "' || COALESCE(v_item.product_id, 'N/A') || '" hiện không khả dụng hoặc đã ngừng sản xuất.'
            );
        END IF;

        IF v_item.quantity IS NULL OR v_item.quantity <= 0 OR v_item.quantity > 50 THEN
            RETURN jsonb_build_object(
                'ok', false,
                'code', 'INVALID_QUANTITY',
                'error', 'Số lượng sản phẩm đặt mua không hợp lệ (từ 1 đến 50 mẫu).'
            );
        END IF;

        v_line_total := v_prod.price * v_item.quantity;
        v_subtotal := v_subtotal + v_line_total;
    END LOOP;

    -- 7. Validate mã giảm giá từ database
    IF p_coupon_code IS NOT NULL AND TRIM(p_coupon_code) != '' THEN
        SELECT * INTO v_coupon FROM public.coupons 
        WHERE code = UPPER(TRIM(p_coupon_code)) AND is_active = TRUE;

        IF v_coupon.id IS NOT NULL THEN
            IF (v_coupon.expires_at IS NULL OR v_coupon.expires_at > NOW()) AND 
               (v_coupon.usage_limit IS NULL OR v_coupon.used_count < v_coupon.usage_limit) AND
               (v_subtotal >= v_coupon.min_order_value) THEN
               
                IF v_coupon.discount_type = 'percent' THEN
                    v_discount := (v_subtotal * v_coupon.discount_value) / 100;
                    IF v_coupon.max_discount_cap IS NOT NULL AND v_discount > v_coupon.max_discount_cap THEN
                        v_discount := v_coupon.max_discount_cap;
                    END IF;
                ELSE
                    v_discount := v_coupon.discount_value;
                END IF;

                -- Tăng lượt sử dụng coupon
                UPDATE public.coupons SET used_count = used_count + 1 WHERE id = v_coupon.id;
            END IF;
        END IF;
    END IF;

    -- 8. Tính phí vận chuyển (Miễn phí toàn quốc khi đơn hàng sau giảm giá >= 300.000 đ)
    IF (v_subtotal - v_discount) >= 300000 THEN
        v_shipping_fee := 0;
    ELSE
        v_shipping_fee := 25000;
    END IF;

    v_total := (v_subtotal - v_discount) + v_shipping_fee;

    -- 9. Sinh mã đơn hàng dạng TT3D-YYMM-XXXXX (duy nhất và thanh lịch)
    v_order_number := 'TT3D-' || TO_CHAR(NOW(), 'YYMM') || '-' || UPPER(SUBSTRING(MD5(p_idempotency_key) FROM 1 FOR 5));

    -- 10. Giao dịch tạo đơn hàng (orders) kèm address_id & order_shipping_snapshot
    INSERT INTO public.orders (
        order_number, user_id, status, payment_method, payment_status,
        subtotal, discount_amount, shipping_fee, total, coupon_id,
        shipping_name, shipping_phone, shipping_address, customer_note,
        idempotency_key, address_id, order_shipping_snapshot
    ) VALUES (
        v_order_number, v_user_id, 'request_received', 
        COALESCE(p_payment_method, 'cod'), 'pending',
        v_subtotal, v_discount, v_shipping_fee, v_total, v_coupon.id,
        v_final_name, v_final_phone, v_final_address, 
        NULLIF(TRIM(p_customer_note), ''), p_idempotency_key,
        v_saved_address_id, v_snapshot
    ) RETURNING id INTO v_order_id;

    -- 11. Giao dịch tạo các dòng chi tiết (order_items)
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
        product_id TEXT, 
        quantity INT, 
        selected_options JSONB
    ) LOOP
        SELECT clean_title, price INTO v_prod FROM public.products WHERE id = v_item.product_id;
        
        INSERT INTO public.order_items (
            order_id, product_id, product_name_snapshot,
            unit_price_snapshot, quantity, selected_options, line_total
        ) VALUES (
            v_order_id, v_item.product_id, v_prod.clean_title,
            v_prod.price, v_item.quantity, COALESCE(v_item.selected_options, '{}'::jsonb),
            (v_prod.price * v_item.quantity)
        );
    END LOOP;

    -- 12. Ghi mốc lịch sử đầu tiên
    INSERT INTO public.order_status_history (
        order_id, old_status, new_status, changed_by, staff_name, note
    ) VALUES (
        v_order_id, NULL, 'request_received', v_user_id, 'Hệ thống tự động',
        'Khách hàng khởi tạo đơn hàng thành công qua One-Page Checkout'
    );

    -- 13. Cập nhật profile nếu chưa có phone hoặc shipping_address
    UPDATE public.profiles
    SET phone = v_final_phone,
        shipping_address = v_final_address
    WHERE id = v_user_id AND (phone IS NULL OR phone = '');

    -- 14. Trả kết quả thành công cho frontend
    RETURN jsonb_build_object(
        'ok', true,
        'order_id', v_order_id,
        'order_number', v_order_number,
        'subtotal', v_subtotal,
        'discount_amount', v_discount,
        'shipping_fee', v_shipping_fee,
        'total', v_total,
        'shipping_address', v_final_address,
        'shipping_name', v_final_name,
        'shipping_phone', v_final_phone,
        'snapshot', v_snapshot
    );
END;
$$;
