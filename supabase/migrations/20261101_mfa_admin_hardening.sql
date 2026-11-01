-- =========================================================================
-- T&T 3D STUDIO - ADMIN & STAFF MULTI-FACTOR AUTHENTICATION (MFA / AAL2) HARDENING
-- Migration: 20261101_mfa_admin_hardening.sql
-- Target: Enforce AAL2 for Admin & Staff operations & Emergency Recovery Codes
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. BẢNG MÃ DỰ PHÒNG KHÔI PHỤC ADMIN & STAFF (EMERGENCY RECOVERY CODES)
CREATE TABLE IF NOT EXISTS public.admin_recovery_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    code_hash TEXT NOT NULL,
    is_used BOOLEAN DEFAULT FALSE NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE public.admin_recovery_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff and Admin can view own recovery codes" ON public.admin_recovery_codes;
CREATE POLICY "Staff and Admin can view own recovery codes"
ON public.admin_recovery_codes FOR SELECT
USING (auth.uid() = user_id AND public.is_staff_or_admin());

DROP POLICY IF EXISTS "Staff and Admin can insert own recovery codes" ON public.admin_recovery_codes;
CREATE POLICY "Staff and Admin can insert own recovery codes"
ON public.admin_recovery_codes FOR INSERT
WITH CHECK (auth.uid() = user_id AND public.is_staff_or_admin());

-- 2. HẠN CHẾ RLS UPDATE TRÊN PUBLIC.ORDERS (BẮT BUỘC AAL2 ĐỐI VỚI CẢ STAFF VÀ ADMIN)
DROP POLICY IF EXISTS "Staff and Admin can update order status and notes" ON public.orders;
DROP POLICY IF EXISTS "Staff and Admin can update order status and notes with AAL2" ON public.orders;

CREATE POLICY "Staff and Admin can update order status and notes with AAL2"
ON public.orders FOR UPDATE
USING (
    public.is_staff_or_admin()
    AND COALESCE(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
)
WITH CHECK (
    public.is_staff_or_admin()
    AND COALESCE(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
);

-- 3. HÀM CẬP NHẬT TIẾN ĐỘ ĐƠN HÀNG (YÊU CẦU AAL2 CHO CẢ ADMIN VÀ STAFF)
CREATE OR REPLACE FUNCTION public.update_order_status_admin(
    p_order_id UUID,
    p_new_status TEXT,
    p_note TEXT DEFAULT NULL,
    p_carrier_name TEXT DEFAULT NULL,
    p_carrier_tracking_code TEXT DEFAULT NULL,
    p_carrier_tracking_url TEXT DEFAULT NULL,
    p_internal_admin_note TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_actor_id UUID;
    v_old_status TEXT;
    v_order_number TEXT;
    v_actor_name TEXT;
    v_aal TEXT;
BEGIN
    v_actor_id := auth.uid();
    
    -- Kiểm tra quyền: Bắt buộc phải là staff hoặc admin
    IF NOT public.is_staff_or_admin() THEN
        RETURN jsonb_build_object(
            'ok', false,
            'code', 'FORBIDDEN',
            'error', 'Từ chối truy cập: Bạn không có quyền quản trị hoặc nhân viên xưởng in 3D.'
        );
    END IF;

    -- KIỂM TRA BẢO VỆ MFA AAL2 CHO CẢ ADMIN VÀ STAFF (Codex Security Directive)
    v_aal := COALESCE(auth.jwt() ->> 'aal', 'aal1');
    IF v_aal != 'aal2' THEN
        RETURN jsonb_build_object(
            'ok', false,
            'code', 'MFA_REQUIRED',
            'error', 'Yêu cầu xác thực 2 bước (MFA / AAL2) cho quản trị viên và nhân viên. Vui lòng hoàn tất mã xác thực 6 số trên ứng dụng Authenticator trước khi thực hiện thao tác này.'
        );
    END IF;

    SELECT status, order_number INTO v_old_status, v_order_number
    FROM public.orders WHERE id = p_order_id;

    IF v_old_status IS NULL THEN
        RETURN jsonb_build_object('ok', false, 'code', 'ORDER_NOT_FOUND', 'error', 'Không tìm thấy đơn hàng.');
    END IF;

    SELECT COALESCE(raw_user_meta_data->>'full_name', email) INTO v_actor_name
    FROM auth.users WHERE id = v_actor_id;

    UPDATE public.orders
    SET 
        status = p_new_status,
        carrier_name = COALESCE(p_carrier_name, carrier_name),
        carrier_tracking_code = COALESCE(p_carrier_tracking_code, carrier_tracking_code),
        carrier_tracking_url = COALESCE(p_carrier_tracking_url, carrier_tracking_url),
        internal_admin_note = COALESCE(p_internal_admin_note, internal_admin_note),
        updated_at = NOW()
    WHERE id = p_order_id;

    INSERT INTO public.order_status_history (
        order_id, old_status, new_status, changed_by, staff_name, note
    ) VALUES (
        p_order_id, v_old_status, p_new_status, v_actor_id, 
        COALESCE(v_actor_name, 'Quản trị xưởng'), p_note
    );

    INSERT INTO public.audit_logs (
        actor_id, action, entity_type, entity_id, payload
    ) VALUES (
        v_actor_id, 'UPDATE_ORDER_STATUS', 'orders', p_order_id::text,
        jsonb_build_object(
            'old_status', v_old_status,
            'new_status', p_new_status,
            'carrier', p_carrier_name,
            'note', p_note,
            'aal', v_aal
        )
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

-- 4. HÀM TẠO BỘ MÃ DỰ PHÒNG KHÔI PHỤC (CHỈ GỌI ĐƯỢC KHI ĐÃ CÓ AAL2)
CREATE OR REPLACE FUNCTION public.generate_recovery_codes_admin()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_user_id UUID;
    v_aal TEXT;
    v_codes TEXT[] := '{}';
    v_code TEXT;
    v_hash TEXT;
    i INT;
BEGIN
    v_user_id := auth.uid();

    IF NOT public.is_staff_or_admin() THEN
        RETURN jsonb_build_object('ok', false, 'code', 'FORBIDDEN', 'error', 'Chỉ Staff hoặc Admin mới có quyền tạo mã dự phòng.');
    END IF;

    v_aal := COALESCE(auth.jwt() ->> 'aal', 'aal1');
    IF v_aal != 'aal2' THEN
        RETURN jsonb_build_object('ok', false, 'code', 'MFA_REQUIRED', 'error', 'Bắt buộc phải đạt xác thực MFA (AAL2) mới được phép tạo bộ mã dự phòng.');
    END IF;

    -- Vô hiệu hóa các mã cũ chưa sử dụng
    DELETE FROM public.admin_recovery_codes
    WHERE user_id = v_user_id AND is_used = FALSE;

    -- Tạo 8 mã dự phòng ngẫu nhiên định dạng TT3D-XXXX-XXXX
    FOR i IN 1..8 LOOP
        v_code := 'TT3D-' || UPPER(SUBSTRING(encode(gen_random_bytes(4), 'hex') FROM 1 FOR 4)) || '-' || UPPER(SUBSTRING(encode(gen_random_bytes(4), 'hex') FROM 5 FOR 4));
        v_hash := encode(digest(v_code, 'sha256'), 'hex');
        
        INSERT INTO public.admin_recovery_codes (user_id, code_hash, is_used)
        VALUES (v_user_id, v_hash, FALSE);

        v_codes := array_append(v_codes, v_code);
    END LOOP;

    INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, payload)
    VALUES (v_user_id, 'GENERATE_MFA_RECOVERY_CODES', 'admin_recovery_codes', v_user_id::text, jsonb_build_object('count', 8));

    RETURN jsonb_build_object(
        'ok', true,
        'codes', to_jsonb(v_codes),
        'warning', 'Mã dự phòng chỉ hiển thị một lần duy nhất. Vui lòng sao lưu an toàn.'
    );
END;
$$;

-- 5. HÀM SỬ DỤNG MÃ DỰ PHÒNG KHẨN CẤP (REDEEM RECOVERY CODE)
CREATE OR REPLACE FUNCTION public.redeem_recovery_code_admin(p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_user_id UUID;
    v_hash TEXT;
    v_rec_id UUID;
BEGIN
    v_user_id := auth.uid();

    IF NOT public.is_staff_or_admin() THEN
        RETURN jsonb_build_object('ok', false, 'code', 'FORBIDDEN', 'error', 'Chỉ Staff hoặc Admin mới có quyền sử dụng mã dự phòng.');
    END IF;

    IF p_code IS NULL OR TRIM(p_code) = '' THEN
        RETURN jsonb_build_object('ok', false, 'code', 'INVALID_CODE', 'error', 'Mã dự phòng không được để trống.');
    END IF;

    v_hash := encode(digest(TRIM(p_code), 'sha256'), 'hex');

    SELECT id INTO v_rec_id
    FROM public.admin_recovery_codes
    WHERE user_id = v_user_id AND code_hash = v_hash AND is_used = FALSE;

    IF v_rec_id IS NULL THEN
        RETURN jsonb_build_object(
            'ok', false,
            'code', 'INVALID_RECOVERY_CODE',
            'error', 'Mã dự phòng không chính xác hoặc đã được sử dụng trước đó.'
        );
    END IF;

    -- Đánh dấu mã đã sử dụng
    UPDATE public.admin_recovery_codes
    SET is_used = TRUE, used_at = NOW()
    WHERE id = v_rec_id;

    INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, payload)
    VALUES (v_user_id, 'REDEEM_MFA_RECOVERY_CODE', 'admin_recovery_codes', v_rec_id::text, jsonb_build_object('used_at', NOW()));

    RETURN jsonb_build_object(
        'ok', true,
        'message', 'Xác thực mã dự phòng thành công! Bạn có thể thao tác khẩn cấp hoặc cấp lại thiết bị Authenticator mới.'
    );
END;
$$;

-- Phân quyền thực thi
REVOKE EXECUTE ON FUNCTION public.update_order_status_admin(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.update_order_status_admin(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.generate_recovery_codes_admin() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.generate_recovery_codes_admin() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.redeem_recovery_code_admin(TEXT) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.redeem_recovery_code_admin(TEXT) TO authenticated;
