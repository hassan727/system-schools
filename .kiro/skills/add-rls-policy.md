# Skill: إضافة RLS Policy

## متى تستخدم هذا الـ Skill؟
عند إنشاء جدول جديد أو إضافة سياسة وصول خاصة.

## أنواع السياسات

### 1. عزل المستأجر الأساسي (الأكثر استخداماً)
```sql
ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;

CREATE POLICY "{table}_tenant_isolation" ON {table}
  FOR ALL USING (
    tenant_id = get_tenant_id()
    OR has_role('super_admin')
  );
```

### 2. المستخدم يرى بياناته فقط
```sql
CREATE POLICY "{table}_own_data" ON {table}
  FOR SELECT USING (
    tenant_id = get_tenant_id()
    AND user_id = auth.uid()
  );
```

### 3. صلاحية محددة مطلوبة
```sql
CREATE POLICY "{table}_requires_permission" ON {table}
  FOR ALL USING (
    tenant_id = get_tenant_id()
    AND (
      has_permission('{module}.{resource}.read')
      OR has_role('super_admin')
    )
  );
```

### 4. INSERT فقط (للـ audit logs)
```sql
CREATE POLICY "audit_logs_insert_only" ON audit_logs
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "audit_logs_read_admin" ON audit_logs
  FOR SELECT USING (
    (tenant_id = get_tenant_id() AND has_permission('system.audit_logs.read'))
    OR has_role('super_admin')
  );
```

### 5. الموظف يرى راتبه فقط
```sql
CREATE POLICY "employee_own_salary" ON salaries
  FOR SELECT USING (
    tenant_id = get_tenant_id()
    AND (
      has_permission('hr.salaries.read')
      OR employee_id IN (
        SELECT id FROM employees WHERE user_id = auth.uid()
      )
    )
  );
```

## اختبار RLS
```sql
-- اختبر بمستخدم محدد
SET LOCAL role = authenticated;
SET LOCAL request.jwt.claims = '{"sub": "user-uuid", "tenant_id": "tenant-uuid"}';

SELECT * FROM students; -- يجب أن يُعيد فقط طلاب هذا المستأجر
```

## قاعدة ذهبية
- كل جدول = سياسة واحدة على الأقل
- لا تعتمد على الكود للفلترة — RLS هي الضمان الوحيد
- اختبر دائماً بمستخدمين من مستأجرين مختلفين
