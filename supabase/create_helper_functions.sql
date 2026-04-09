-- دالة للتحقق من دور super_admin بدون RLS
CREATE OR REPLACE FUNCTION has_super_admin_role(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = p_user_id
    AND role_id = '00000000-0000-0000-0000-000000000001'
    AND deleted_at IS NULL
  );
$$;

-- منح صلاحية التنفيذ للمستخدمين المصادق عليهم
GRANT EXECUTE ON FUNCTION has_super_admin_role(UUID) TO authenticated;
