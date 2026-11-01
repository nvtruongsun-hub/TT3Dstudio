-- =========================================================================
-- T&T 3D STUDIO - ADMIN MULTI-FACTOR AUTHENTICATION (MFA / AAL2) HARDENING
-- Migration: 20261101_mfa_admin_hardening.sql
-- Target: Enforce AAL2 for Admin operations & Emergency Backup Recovery Codes
-- =========================================================================

-- 1. BẢNG MÃ DỰ PHÒNG KHÔI PHỤC ADMIN (EMERGENCY RECOVERY CODES)
CREATE TABLE IF NOT EXISTS public.admin_recovery_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    code_hash TEXT NOT NULL,
    is_used BOOLEAN DEFAULT FALSE NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE public.admin_recovery_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view own recovery codes" ON public.admin_recovery_codes;
CREATE POLICY "Admins can view own recovery codes"
ON public.admin_recovery_codes FOR SELECT
USING (auth.uid() = user_id AND public.is_admin());

DROP POLICY IF EXISTS "Admins can insert own recovery codes" ON public.admin_recovery_codes;
CREATE POLICY "Admins can insert own recovery codes"
ON public.admin_recovery_codes FOR INSERT
WITH CHECK (auth.uid() = user_id AND public.is_admin());

-- 2. HÀM CẬP NHẬT TIẾN ĐỘ ĐƠN HÀNG ADMIN (YÊU CẦU AAL2 NẾU USER LÀ ADMIN)
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
SET search_path = public, auth
AS $$
DECLARE
    v_admin_id UUID;
    v_old_status TEXT;
    v_order_number TEXT;
    v_staff_name TEXT;
    v_aal TEXT;
BEGIN
    v_admin_id := auth.uid();
    
    -- Kiểm tra quyền: Bắt buộc phải là staff hoặc admin
    IF NOT public.is_staff_or_admin() THEN
        RETURN jsonb_build_object(
            'ok', false,
            'code', 'FORBIDDEN',
            'error', 'Từ chối truy cập: Bạn không có quyền quản trị xưởng in 3D.'
        );
    END IF;

    -- KIỂM TRA BẢO VỆ MFA AAL2 CHO VAI TRÒ ADMIN (Codex Directive 2026-11-01)
    -- Nếu user có role admin, bắt buộc phiên làm việc phải đạt cấp độ AAL2
    IF public.is_admin() THEN
        v_aal := COALESCE(auth.jwt() ->> 'aal', 'aal1');
        IF v_aal != 'aal2' THEN
            RETURN jsonb_build_object(
                'ok', false,
                'code', 'MFA_REQUIRED',
                'error', 'Yêu cầu xác thực 2 bước (MFA / AAL2). Vui lòng hoàn tất mã xác thực 6 số trên ứng dụng Authenticator trước khi thực hiện thao tác quản trị.'
            );
        END IF;
    END IF;

    SELECT status, order_number INTO v_old_status, v_order_number
    FROM public.orders WHERE id = p_order_id;

    IF v_old_status IS NULL THEN
        RETURN jsonb_build_object('ok', false, 'code', 'ORDER_NOT_FOUND', 'error', 'Không tìm thấy đơn hàng.');
    END IF;

    SELECT COALESCE(raw_user_meta_data->>'full_name', email) INTO v_staff_name
    FROM auth.users WHERE id = v_admin_id;

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
        p_order_id, v_old_status, p_new_status, v_admin_id, 
        COALESCE(v_staff_name, 'Quản trị xưởng'), p_note
    );

    INSERT INTO public.audit_logs (
        actor_id, action, entity_type, entity_id, payload
    ) VALUES (
        v_admin_id, 'UPDATE_ORDER_STATUS', 'orders', p_order_id::text,
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

-- Phân quyền tối thiểu
REVOKE EXECUTE ON FUNCTION public.update_order_status_admin(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.update_order_status_admin(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
