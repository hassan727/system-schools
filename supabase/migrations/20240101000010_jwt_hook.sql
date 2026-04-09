-- ============================================================
-- Migration 010: Custom JWT Access Token Hook
-- يضيف tenant_id والأدوار والصلاحيات للـ JWT تلقائياً
-- ============================================================

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event JSONB)
RETURNS JSONB AS $$
DECLARE
  claims JSONB;
  user_tenant_id UUID;
  user_tenant_slug TEXT;
  user_roles_arr TEXT[];
  user_permissions_arr TEXT[];
BEGIN
  -- جلب tenant_id و slug
  SELECT u.tenant_id, t.slug
  INTO user_tenant_id, user_tenant_slug
  FROM public.users u
  JOIN public.tenants t ON t.id = u.tenant_id
  WHERE u.id = (event->>'user_id')::UUID
    AND u.deleted_at IS NULL
    AND t.deleted_at IS NULL;

  -- جلب الأدوار
  SELECT ARRAY_AGG(DISTINCT r.name)
  INTO user_roles_arr
  FROM public.user_roles ur
  JOIN public.roles r ON r.id = ur.role_id
  WHERE ur.user_id = (event->>'user_id')::UUID
    AND ur.deleted_at IS NULL
    AND r.deleted_at IS NULL;

  -- جلب الصلاحيات
  SELECT ARRAY_AGG(DISTINCT p.name)
  INTO user_permissions_arr
  FROM public.user_roles ur
  JOIN public.role_permissions rp ON rp.role_id = ur.role_id
  JOIN public.permissions p ON p.id = rp.permission_id
  WHERE ur.user_id = (event->>'user_id')::UUID
    AND ur.deleted_at IS NULL;

  -- استخدم COALESCE عشان لو claims كانت null نبدأ بـ object فاضي
  claims := COALESCE(event->'claims', '{}'::JSONB);
  claims := jsonb_set(claims, '{tenant_id}',    COALESCE(to_jsonb(user_tenant_id), 'null'::JSONB));
  claims := jsonb_set(claims, '{tenant_slug}',  COALESCE(to_jsonb(user_tenant_slug), 'null'::JSONB));
  claims := jsonb_set(claims, '{roles}',        to_jsonb(COALESCE(user_roles_arr, '{}'::TEXT[])));
  claims := jsonb_set(claims, '{permissions}',  to_jsonb(COALESCE(user_permissions_arr, '{}'::TEXT[])));

  RETURN jsonb_set(event, '{claims}', claims);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- منح صلاحية التنفيذ لـ supabase_auth_admin
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;
