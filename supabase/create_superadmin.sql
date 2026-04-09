-- إنشاء super_admin من بريد المالك
DO $$
DECLARE
  v_user_id UUID;
  v_tenant_id UUID;
BEGIN
  -- جلب المستخدم
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'hassanafford@gmail.com' LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'المستخدم غير موجود في auth.users';
    RETURN;
  END IF;

  -- جلب أي tenant موجود (أو إنشاء tenant للمنصة)
  SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'al-noor' LIMIT 1;

  IF v_tenant_id IS NULL THEN
    INSERT INTO tenants (name_ar, name_en, slug, subdomain, status, modules_enabled, max_students, max_employees)
    VALUES ('مدرسة النور', 'Al-Noor School', 'al-noor', 'al-noor', 'active',
      '{"academic":true,"hr":true,"finance":true,"scheduling":true,"reports":true}'::jsonb, 1000, 100)
    RETURNING id INTO v_tenant_id;
  END IF;

  -- ربط المستخدم
  INSERT INTO users (id, tenant_id, email, status)
  VALUES (v_user_id, v_tenant_id, 'hassanafford@gmail.com', 'active')
  ON CONFLICT (id) DO NOTHING;

  -- إنشاء profile
  INSERT INTO profiles (user_id, tenant_id, first_name_ar, last_name_ar, first_name_en, last_name_en)
  VALUES (v_user_id, v_tenant_id, 'حسن', 'المدير', 'Hassan', 'Admin')
  ON CONFLICT DO NOTHING;

  -- إعطاء دور super_admin
  INSERT INTO user_roles (user_id, role_id, tenant_id)
  VALUES (v_user_id, '00000000-0000-0000-0000-000000000001', v_tenant_id)
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'تم! user_id=% tenant_id=%', v_user_id, v_tenant_id;
END $$;
