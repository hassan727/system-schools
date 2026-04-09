# Skill: إنشاء Migration جديدة

## متى تستخدم هذا الـ Skill؟
عندما تحتاج إنشاء جدول جديد أو تعديل جدول موجود في قاعدة البيانات.

## الخطوات

### 1. إنشاء ملف الـ Migration
```bash
# التسمية: YYYYMMDDHHMMSS_وصف_قصير.sql
# مثال:
supabase/migrations/20240615120000_add_student_notes.sql
```

### 2. قالب الجدول الجديد
```sql
-- ============================================================
-- TABLE: {table_name}
-- ============================================================
CREATE TABLE {table_name} (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- أعمدة الجدول هنا
  name_ar     TEXT NOT NULL,
  name_en     TEXT,
  
  -- أعمدة النظام (إلزامية في كل جدول)
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_{table_name}_tenant_id ON {table_name}(tenant_id) WHERE deleted_at IS NULL;

-- RLS (إلزامي)
ALTER TABLE {table_name} ENABLE ROW LEVEL SECURITY;

CREATE POLICY "{table_name}_tenant_isolation" ON {table_name}
  FOR ALL USING (
    tenant_id = get_tenant_id()
    OR has_role('super_admin')
  );

-- Audit Trigger
CREATE TRIGGER audit_{table_name}
  AFTER INSERT OR UPDATE OR DELETE ON {table_name}
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

### 3. تطبيق الـ Migration
```bash
supabase db push
```

### 4. تحديث ملف steering
بعد إنشاء الجدول، أضفه لقائمة الجداول في:
`.kiro/steering/02-database-conventions.md`

## قواعد لا تُكسر
- ❌ لا تعدل migration موجودة
- ❌ لا تحذف أعمدة — أضف `deleted_at` بدلاً من الحذف
- ✅ كل جدول يجب أن يحتوي على `tenant_id`
- ✅ RLS إلزامي على كل جدول جديد
- ✅ Audit trigger على الجداول الحساسة
