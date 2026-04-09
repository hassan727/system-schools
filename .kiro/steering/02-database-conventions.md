# قواعد قاعدة البيانات - Database Conventions

## القواعد الإلزامية

### 1. كل جدول يجب أن يحتوي على:
```sql
tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW(),
deleted_at TIMESTAMPTZ  -- soft delete, لا تحذف أبداً بـ DELETE
```

### 2. RLS إلزامي على كل جدول جديد
```sql
ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON my_table
  FOR ALL USING (
    tenant_id = get_tenant_id()
    OR has_role('super_admin')
  );
```

### 3. Helper Functions الموجودة في قاعدة البيانات
```sql
get_tenant_id()      -- يستخرج tenant_id من JWT
has_permission(name) -- يتحقق من صلاحية معينة
has_role(name)       -- يتحقق من دور معين
```

### 4. تسمية الجداول والأعمدة
- الجداول: `snake_case` جمع (students, employees, invoices)
- الأعمدة: `snake_case` (first_name_ar, created_at)
- الحقول الثنائية: `name_ar` و `name_en` لكل حقل نصي يدعم اللغتين
- المفاتيح الأجنبية: `{table_singular}_id` (student_id, tenant_id)

### 5. Migrations
- المسار: `supabase/migrations/`
- التسمية: `YYYYMMDDHHMMSS_description.sql`
- لا تعدل migration موجودة — أنشئ migration جديدة
- تطبيق: `supabase db push` (بدون Docker)

### 6. Soft Delete
```sql
-- لا تستخدم DELETE أبداً
UPDATE my_table SET deleted_at = NOW() WHERE id = $1;

-- كل query تستثني المحذوفات
WHERE deleted_at IS NULL
```

### 7. الجداول الموجودة حالياً
Core: `tenants`, `users`, `profiles`
RBAC: `roles`, `permissions`, `role_permissions`, `user_roles`
Academic: `academic_years`, `students`, `classes`, `enrollments`, `subjects`, `exams`, `grades`, `timetable`, `events`
HR: `employees`, `attendance`, `salaries`, `leave_requests`
Finance: `fee_structures`, `invoices`, `payments`, `expenses`
System: `audit_logs`, `notifications`, `custom_fields`, `custom_field_values`, `module_subscriptions`, `workflows`, `approvals`
