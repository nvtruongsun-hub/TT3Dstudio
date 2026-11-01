-- =========================================================================
-- T&T 3D LABS - SECURE ECOMMERCE & RBAC DATABASE MIGRATION
-- Migration: 20261031_ecommerce_upgrade.sql
-- Description: 9 Relational Tables, RLS Policies, Triggers & Secure Order RPC
-- =========================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================================
-- 2. TABLE DEFINITIONS
-- =========================================================================

-- A. PROFILES (Extends auth.users with public customer attributes)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    shipping_address TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);

-- B. USER ROLES (RBAC strictly controlled at Database Kernel)
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT CHECK (role IN ('customer', 'staff', 'admin')) DEFAULT 'customer' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    PRIMARY KEY (user_id, role)
);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- C. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY, -- E.g. 'Trang_Diem_Vanity', 'Hoa_Decor_Kim_Loai'
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT DEFAULT 'fa-cube',
    accent_color TEXT DEFAULT '#141413',
    accent_bg TEXT DEFAULT '#F4F4F5',
    badge_text TEXT,
    hero_id TEXT,
    description TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- D. PRODUCTS (Single Source of Truth for Pricing and Catalog)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY, -- 'mw-cn-2595057'
    model_id TEXT NOT NULL,
    title TEXT NOT NULL,
    clean_title TEXT NOT NULL,
    original_title TEXT,
    category_id TEXT REFERENCES public.categories(id) ON DELETE RESTRICT NOT NULL,
    price INT NOT NULL CHECK (price >= 0), -- Verified Ground-Truth Unit Price
    original_price INT,
    badge TEXT,
    archetype_badge TEXT,
    use_case_eyebrow TEXT,
    sub_category TEXT,
    sub_category_name TEXT,
    micro_specs TEXT,
    badge_theme TEXT,
    image TEXT NOT NULL,
    image_alt TEXT,
    author TEXT,
    makerworld_url TEXT,
    downloads INT DEFAULT 0,
    likes INT DEFAULT 0,
    prints INT DEFAULT 0,
    weight_grams INT DEFAULT 0,
    print_time_seconds INT DEFAULT 0,
    selection_score NUMERIC DEFAULT 0,
    material_recommendation TEXT,
    headline_benefit TEXT,
    description TEXT,
    specs JSONB DEFAULT '{}'::jsonb,
    colors JSONB DEFAULT '[]'::jsonb,
    materials JSONB DEFAULT '[]'::jsonb,
    is_hero BOOLEAN DEFAULT FALSE,
    status TEXT CHECK (status IN ('active', 'draft', 'archived')) DEFAULT 'active' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);

-- E. COUPONS
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT CHECK (discount_type IN ('percent', 'fixed')) NOT NULL,
    discount_value INT NOT NULL CHECK (discount_value > 0),
    min_order_value INT DEFAULT 0 CHECK (min_order_value >= 0),
    max_discount_cap INT,
    usage_limit INT,
    used_count INT DEFAULT 0 CHECK (used_count >= 0),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);

-- F. ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL, -- Format: TT3D-YYMM-XXXXX
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
    status TEXT CHECK (status IN (
        'handoff_ready', 'request_received', 'confirmed',
        'in_production', 'quality_check', 'ready_to_pack',
        'shipped', 'delivered', 'awaiting_customer',
        'on_hold', 'cancelled'
    )) DEFAULT 'request_received' NOT NULL,
    payment_method TEXT CHECK (payment_method IN ('cod', 'zalo', 'bank_transfer', 'momo')) NOT NULL,
    payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')) DEFAULT 'pending' NOT NULL,
    subtotal INT NOT NULL CHECK (subtotal >= 0),
    discount_amount INT DEFAULT 0 CHECK (discount_amount >= 0),
    shipping_fee INT DEFAULT 0 CHECK (shipping_fee >= 0),
    total INT NOT NULL CHECK (total >= 0),
    coupon_id UUID REFERENCES public.coupons(id) ON DELETE SET NULL,
    shipping_name TEXT NOT NULL,
    shipping_phone TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    customer_note TEXT,
    internal_admin_note TEXT,
    carrier_name TEXT,
    carrier_tracking_code TEXT,
    carrier_tracking_url TEXT,
    idempotency_key TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- G. ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id TEXT REFERENCES public.products(id) ON DELETE RESTRICT NOT NULL,
    product_name_snapshot TEXT NOT NULL,
    unit_price_snapshot INT NOT NULL CHECK (unit_price_snapshot >= 0),
    quantity INT NOT NULL CHECK (quantity > 0),
    selected_options JSONB DEFAULT '{}'::jsonb,
    line_total INT NOT NULL CHECK (line_total >= 0),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- H. ORDER STATUS HISTORY
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    staff_name TEXT DEFAULT 'Hệ thống tự động',
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_status_history_order ON public.order_status_history(order_id);

-- I. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);

-- =========================================================================
-- 3. TRIGGERS & AUTOMATION FUNCTIONS
-- =========================================================================

-- Trigger auto-updating updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger creating profile and default role on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, phone, shipping_address)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        COALESCE(NEW.raw_user_meta_data->>'shipping_address', '')
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'customer')
    ON CONFLICT (user_id, role) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if current authenticated user has 'admin' role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper function: Check if user has 'staff' or 'admin' role
CREATE OR REPLACE FUNCTION public.is_staff_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role IN ('staff', 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- PROFILES POLICIES
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id OR public.is_staff_or_admin());

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- USER_ROLES POLICIES (Strictly Read-Only for regular users; Mutations restricted to backend/SuperAdmin)
CREATE POLICY "Users can view own role"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id OR public.is_admin());

-- CATEGORIES POLICIES
CREATE POLICY "Anyone can view categories"
ON public.categories FOR SELECT
USING (true);

CREATE POLICY "Only Admin can manage categories"
ON public.categories FOR ALL
USING (public.is_admin());

-- PRODUCTS POLICIES
CREATE POLICY "Anyone can view active products"
ON public.products FOR SELECT
USING (status = 'active' OR public.is_staff_or_admin());

CREATE POLICY "Only Admin can insert products"
ON public.products FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "Only Admin can update products"
ON public.products FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Only Admin can delete products"
ON public.products FOR DELETE
USING (public.is_admin());

-- COUPONS POLICIES
CREATE POLICY "Anyone can view active coupons for validation"
ON public.coupons FOR SELECT
USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "Only Admin can manage coupons"
ON public.coupons FOR ALL
USING (public.is_admin());

-- ORDERS POLICIES
CREATE POLICY "Customers can view their own orders"
ON public.orders FOR SELECT
USING (auth.uid() = user_id OR public.is_staff_or_admin());

CREATE POLICY "Staff and Admin can update order status and notes"
ON public.orders FOR UPDATE
USING (public.is_staff_or_admin())
WITH CHECK (public.is_staff_or_admin());

-- (Note: Regular clients cannot directly INSERT into public.orders; they MUST call create_order RPC)
CREATE POLICY "Admin can insert orders directly"
ON public.orders FOR INSERT
WITH CHECK (public.is_admin());

-- ORDER ITEMS POLICIES
CREATE POLICY "Customers can view items of their own orders"
ON public.order_items FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.orders
        WHERE orders.id = order_items.order_id
        AND (orders.user_id = auth.uid() OR public.is_staff_or_admin())
    )
);

-- ORDER STATUS HISTORY POLICIES
CREATE POLICY "Customers can view history of their own orders"
ON public.order_status_history FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.orders
        WHERE orders.id = order_status_history.order_id
        AND (orders.user_id = auth.uid() OR public.is_staff_or_admin())
    )
);

CREATE POLICY "Staff and Admin can insert order status history"
ON public.order_status_history FOR INSERT
WITH CHECK (public.is_staff_or_admin());

-- AUDIT LOGS POLICIES
CREATE POLICY "Only Admin can view audit logs"
ON public.audit_logs FOR SELECT
USING (public.is_admin());

-- =========================================================================
-- 5. SECURE ORDER CREATION & STATUS RPC FUNCTIONS (BACKEND ENFORCEMENT)
-- =========================================================================

/**
 * create_order()
 * Mandate: Customers MUST be logged in AND email verified to place orders.
 * Ground-truth pricing read from products table.
 * All computations performed on server side inside an ACID transaction.
 */
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
    v_line_total INT;
    v_existing_id UUID;
    v_existing_order_number TEXT;
    v_clean_phone TEXT;
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

    -- 2. Kiểm tra email đã xác minh chưa (Bắt buộc theo quyết định kinh doanh)
    SELECT email_confirmed_at INTO v_email_confirmed 
    FROM auth.users 
    WHERE id = v_user_id;

    IF v_email_confirmed IS NULL THEN
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

    -- 4. Validate thông tin người nhận
    IF p_shipping_name IS NULL OR TRIM(p_shipping_name) = '' THEN
        RETURN jsonb_build_object('ok', false, 'code', 'INVALID_NAME', 'error', 'Vui lòng cung cấp họ tên người nhận.');
    END IF;

    v_clean_phone := REGEXP_REPLACE(COALESCE(p_shipping_phone, ''), '[\s.-]', '', 'g');
    IF NOT (v_clean_phone ~ '^(0|\+84)(3|5|7|8|9)[0-9]{8}$') THEN
        RETURN jsonb_build_object('ok', false, 'code', 'INVALID_PHONE', 'error', 'Số điện thoại nhận hàng không hợp lệ (10 chữ số tiêu chuẩn Việt Nam).');
    END IF;

    IF p_shipping_address IS NULL OR LENGTH(TRIM(p_shipping_address)) < 6 THEN
        RETURN jsonb_build_object('ok', false, 'code', 'INVALID_ADDRESS', 'error', 'Vui lòng nhập địa chỉ nhận hàng chi tiết (tối thiểu 6 ký tự).');
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

    -- 10. Giao dịch tạo đơn hàng (orders)
    INSERT INTO public.orders (
        order_number, user_id, status, payment_method, payment_status,
        subtotal, discount_amount, shipping_fee, total, coupon_id,
        shipping_name, shipping_phone, shipping_address, customer_note,
        idempotency_key
    ) VALUES (
        v_order_number, v_user_id, 'request_received', 
        COALESCE(p_payment_method, 'cod'), 'pending',
        v_subtotal, v_discount, v_shipping_fee, v_total, v_coupon.id,
        TRIM(p_shipping_name), v_clean_phone, TRIM(p_shipping_address), 
        NULLIF(TRIM(p_customer_note), ''), p_idempotency_key
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
        'Khách hàng đã xác minh email và khởi tạo đơn hàng thành công qua website'
    );

    -- 13. Cập nhật thông tin địa chỉ và SĐT mới nhất vào profile người dùng để tiện cho lần mua sau
    UPDATE public.profiles
    SET phone = v_clean_phone,
        shipping_address = TRIM(p_shipping_address)
    WHERE id = v_user_id AND (phone IS NULL OR phone = '');

    -- 14. Trả kết quả thành công cho frontend
    RETURN jsonb_build_object(
        'ok', true,
        'order_id', v_order_id,
        'order_number', v_order_number,
        'subtotal', v_subtotal,
        'discount_amount', v_discount,
        'shipping_fee', v_shipping_fee,
        'total', v_total
    );
END;
$$;

/**
 * update_order_status_admin()
 * RPC dành riêng cho Admin cập nhật tiến độ sản xuất 3D
 */
CREATE OR REPLACE FUNCTION public.update_order_status_admin(
    p_order_id UUID,
    p_new_status TEXT,
    p_note TEXT,
    p_carrier_name TEXT DEFAULT NULL,
    p_carrier_tracking_code TEXT DEFAULT NULL,
    p_carrier_tracking_url TEXT DEFAULT NULL,
    p_internal_admin_note TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_admin_id UUID;
    v_old_status TEXT;
    v_order_number TEXT;
    v_staff_name TEXT;
BEGIN
    v_admin_id := auth.uid();
    IF NOT public.is_staff_or_admin() THEN
        RETURN jsonb_build_object(
            'ok', false,
            'code', 'FORBIDDEN',
            'error', 'Từ chối truy cập: Bạn không có quyền quản trị xưởng in 3D.'
        );
    END IF;

    SELECT status, order_number INTO v_old_status, v_order_number
    FROM public.orders WHERE id = p_order_id;

    IF v_old_status IS NULL THEN
        RETURN jsonb_build_object('ok', false, 'code', 'NOT_FOUND', 'error', 'Không tìm thấy đơn hàng.');
    END IF;

    SELECT full_name INTO v_staff_name FROM public.profiles WHERE id = v_admin_id;

    UPDATE public.orders
    SET status = p_new_status,
        carrier_name = COALESCE(p_carrier_name, carrier_name),
        carrier_tracking_code = COALESCE(p_carrier_tracking_code, carrier_tracking_code),
        carrier_tracking_url = COALESCE(p_carrier_tracking_url, carrier_tracking_url),
        internal_admin_note = COALESCE(p_internal_admin_note, internal_admin_note)
    WHERE id = p_order_id;

    INSERT INTO public.order_status_history (
        order_id, old_status, new_status, changed_by, staff_name, note
    ) VALUES (
        p_order_id, v_old_status, p_new_status, v_admin_id, 
        COALESCE(v_staff_name, 'Quản trị xưởng'), p_note
    );

    INSERT INTO public.audit_logs (
        actor_id, action, entity_type, entity_id, payload
    ) VALUES (
        v_admin_id, 'UPDATE_ORDER_STATUS', 'order', p_order_id::text,
        jsonb_build_object('old_status', v_old_status, 'new_status', p_new_status, 'note', p_note)
    );

    RETURN jsonb_build_object(
        'ok', true,
        'order_id', p_order_id,
        'order_number', v_order_number,
        'old_status', v_old_status,
        'new_status', p_new_status
    );
END;
$$;
