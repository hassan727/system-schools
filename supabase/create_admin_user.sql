-- ============================================================
-- إنشاء مستخدم admin تجريبي مع tenant كامل
-- ============================================================

DO $$
DECLARE
  v_tenant_id UUID := gen_random_uuid();
  v_user_id   UUID;
BEGIN

  -- 1. إنشاء tenant تجريبي
  INSERT INTO tenants (
    id, name_ar, name_en, slug, subdomain, status,
    modules_enabled, max_students, max_employees
  ) VALUES (
    v_tenant_id,
    'مدرسة النور',
    'Al-Noor School',
    'al-noor',
    'al-noor',
    'active',
    '{"academic": true, "hr": true, "finance": true, "scheduling": true, "reports": true}'::jsonb,
    1000,
    100
  ) ON CONFLICT (slug) DO UPDATE SET id = tenants.id RETURNING id INTO v_tenant_id;

  -- إعادة جلب الـ id في حالة conflict
  SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'al-noor';

  -- 2. جلب المستخدم من auth.users (يجب إنشاؤه أولاً من Dashboard)
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'admin@school.com' LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'المستخدم غير موجود. أنشئه أولاً من Supabase Dashboard > Authentication > Users';
    RETURN;
  END IF;

  -- 3. ربط المستخدم بالـ tenant
  INSERT INTO users (id, tenant_id, email, status)
  VALUES (v_user_id, v_tenant_id, 'admin@school.com', 'active')
  ON CONFLICT (id) DO NOTHING;

  -- 4. إنشاء profile
  INSERT INTO profiles (user_id, tenant_id, first_name_ar, last_name_ar, first_name_en, last_name_en)
  VALUES (v_user_id, v_tenant_id, 'مدير', 'النظام', 'Admin', 'User')
  ON CONFLICT DO NOTHING;

  -- 5. إعطاءه دور admin
  INSERT INTO user_roles (user_id, role_id, tenant_id)
  VALUES (v_user_id, '00000000-0000-0000-0000-000000000003', v_tenant_id)
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'تم إنشاء المستخدم بنجاح! tenant_id = %', v_tenant_id;
END $$;
