-- ============================================================
-- Migration 008: RLS Policies and Helper Functions
-- ============================================================

-- ============================================================
-- HELPER FUNCTION: استخراج tenant_id من JWT
-- ============================================================
CREATE OR REPLACE FUNCTION get_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN (auth.jwt() ->> 'tenant_id')::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- HELPER FUNCTION: التحقق من صلاحية معينة
-- ============================================================
CREATE OR REPLACE FUNCTION has_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_permissions JSONB;
BEGIN
  user_permissions := (auth.jwt() -> 'permissions');
  RETURN user_permissions ? permission_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- HELPER FUNCTION: التحقق من دور معين
-- ============================================================
CREATE OR REPLACE FUNCTION has_role(role_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_roles_json JSONB;
BEGIN
  user_roles_json := (auth.jwt() -> 'roles');
  RETURN user_roles_json ? role_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- تفعيل RLS على جميع الجداول
-- ============================================================
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES: tenants
-- ============================================================
CREATE POLICY "super_admin_all_tenants" ON tenants
  FOR ALL USING (has_role('super_admin'));

CREATE POLICY "tenant_isolation" ON tenants
  FOR SELECT USING (id = get_tenant_id());

-- ============================================================
-- RLS POLICIES: users
-- ============================================================
CREATE POLICY "users_tenant_isolation" ON users
  FOR ALL USING (
    tenant_id = get_tenant_id()
    OR has_role('super_admin')
  );

-- ============================================================
-- RLS POLICIES: profiles
-- ============================================================
CREATE POLICY "profiles_tenant_isolation" ON profiles
  FOR ALL USING (
    tenant_id = get_tenant_id()
    OR has_role('super_admin')
  );

-- ============================================================
-- RLS POLICIES: roles
-- ============================================================
CREATE POLICY "roles_tenant_isolation" ON roles
  FOR ALL USING (
    tenant_id = get_tenant_id()
    OR tenant_id IS NULL  -- system roles visible to all
    OR has_role('super_admin')
  );

-- ============================================================
-- RLS POLICIES: permissions (read-only for all authenticated)
-- ============================================================
CREATE POLICY "permissions_read_all" ON permissions
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- ============================================================
-- RLS POLICIES: role_permissions
-- ============================================================
CREATE POLICY "role_permissions_tenant_isolation" ON role_permissions
  FOR ALL USING (
    tenant_id = get_tenant_id()
    OR tenant_id IS NULL
    OR has_role('super_admin')
  );

-- ============================================================
-- RLS POLICIES: user_roles
-- ============================================================
CREATE POLICY "user_roles_tenant_isolation" ON user_roles
  FOR ALL USING (
    tenant_id = get_tenant_id()
    OR has_role('super_admin')
  );

-- ============================================================
-- RLS POLICIES: academic_years
-- ============================================================
CREATE POLICY "academic_years_tenant_isolation" ON academic_years
  FOR ALL USING (
    tenant_id = get_tenant_id()
    OR has_role('super_admin')
  );

-- ============================================================
-- RLS POLICIES: students
-- ============================================================
CREATE POLICY "students_tenant_isolation" ON students
  FOR ALL USING (
    tenant_id = get_tenant_id()
    OR has_role('super_admin')
  );

CREATE POLICY "parent_sees_own_children" ON students
  FOR SELECT USING (
    tenant_id = get_tenant_id()
    AND (
      has_permission('academic.students.read')
      OR parent_id = auth.uid()
    )
  );

-- ============================================================
-- RLS POLICIES: classes, enrollments, subjects, exams
-- ============================================================
CREATE POLICY "classes_tenant_isolation" ON classes
  FOR ALL USING (tenant_id = get_tenant_id() OR has_role('super_admin'));

CREATE POLICY "enrollments_tenant_isolation" ON enrollments
  FOR ALL USING (tenant_id = get_tenant_id() OR has_role('super_admin'));

CREATE POLICY "subjects_tenant_isolation" ON subjects
  FOR ALL USING (tenant_id = get_tenant_id() OR has_role('super_admin'));

CREATE POLICY "exams_tenant_isolation" ON exams
  FOR ALL USING (tenant_id = get_tenant_id() OR has_role('super_admin'));

-- ============================================================
-- RLS POLICIES: grades
-- ============================================================
CREATE POLICY "grades_tenant_isolation" ON grades
  FOR ALL USING (
    tenant_id = get_tenant_id()
    OR has_role('super_admin')
  );

CREATE POLICY "student_sees_own_grades" ON grades
  FOR SELECT USING (
    tenant_id = get_tenant_id()
    AND (
      has_permission('academic.grades.read')
      OR student_id IN (
        SELECT id FROM students WHERE profile_id IN (
          SELECT id FROM profiles WHERE user_id = auth.uid()
        )
      )
    )
  );

-- ============================================================
-- RLS POLICIES: timetable, events
-- ============================================================
CREATE POLICY "timetable_tenant_isolation" ON timetable
  FOR ALL USING (tenant_id = get_tenant_id() OR has_role('super_admin'));

CREATE POLICY "events_tenant_isolation" ON events
  FOR ALL USING (tenant_id = get_tenant_id() OR has_role('super_admin'));

-- ============================================================
-- RLS POLICIES: employees & salaries
-- ============================================================
CREATE POLICY "employees_tenant_isolation" ON employees
  FOR ALL USING (
    tenant_id = get_tenant_id()
    OR has_role('super_admin')
  );

CREATE POLICY "employee_sees_own_data" ON employees
  FOR SELECT USING (
    tenant_id = get_tenant_id()
    AND (
      has_permission('hr.employees.read')
      OR user_id = auth.uid()
    )
  );

CREATE POLICY "attendance_tenant_isolation" ON attendance
  FOR ALL USING (tenant_id = get_tenant_id() OR has_role('super_admin'));

CREATE POLICY "salaries_tenant_isolation" ON salaries
  FOR ALL USING (
    tenant_id = get_tenant_id()
    OR has_role('super_admin')
  );

CREATE POLICY "employee_sees_own_salary" ON salaries
  FOR SELECT USING (
    tenant_id = get_tenant_id()
    AND (
      has_permission('hr.salaries.read')
      OR employee_id IN (
        SELECT id FROM employees WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "leave_requests_tenant_isolation" ON leave_requests
  FOR ALL USING (tenant_id = get_tenant_id() OR has_role('super_admin'));

-- ============================================================
-- RLS POLICIES: finance
-- ============================================================
CREATE POLICY "fee_structures_tenant_isolation" ON fee_structures
  FOR ALL USING (tenant_id = get_tenant_id() OR has_role('super_admin'));

CREATE POLICY "invoices_tenant_isolation" ON invoices
  FOR ALL USING (
    tenant_id = get_tenant_id()
    OR has_role('super_admin')
  );

CREATE POLICY "payments_tenant_isolation" ON payments
  FOR ALL USING (tenant_id = get_tenant_id() OR has_role('super_admin'));

CREATE POLICY "expenses_tenant_isolation" ON expenses
  FOR ALL USING (tenant_id = get_tenant_id() OR has_role('super_admin'));

-- ============================================================
-- RLS POLICIES: audit_logs
-- ============================================================
CREATE POLICY "audit_logs_read_admin" ON audit_logs
  FOR SELECT USING (
    (tenant_id = get_tenant_id() AND has_permission('system.audit_logs.read'))
    OR has_role('super_admin')
  );

CREATE POLICY "audit_logs_insert_all" ON audit_logs
  FOR INSERT WITH CHECK (TRUE);

-- ============================================================
-- RLS POLICIES: notifications
-- ============================================================
CREATE POLICY "notifications_own_user" ON notifications
  FOR ALL USING (
    tenant_id = get_tenant_id()
    AND user_id = auth.uid()
  );

CREATE POLICY "notifications_admin_read" ON notifications
  FOR SELECT USING (
    tenant_id = get_tenant_id()
    AND has_permission('system.notifications.read')
  );

-- ============================================================
-- RLS POLICIES: system tables
-- ============================================================
CREATE POLICY "custom_fields_tenant_isolation" ON custom_fields
  FOR ALL USING (tenant_id = get_tenant_id() OR has_role('super_admin'));

CREATE POLICY "custom_field_values_tenant_isolation" ON custom_field_values
  FOR ALL USING (tenant_id = get_tenant_id() OR has_role('super_admin'));

CREATE POLICY "module_subscriptions_tenant_isolation" ON module_subscriptions
  FOR ALL USING (
    tenant_id = get_tenant_id()
    OR has_role('super_admin')
  );

CREATE POLICY "workflows_tenant_isolation" ON workflows
  FOR ALL USING (tenant_id = get_tenant_id() OR has_role('super_admin'));

CREATE POLICY "approvals_tenant_isolation" ON approvals
  FOR ALL USING (tenant_id = get_tenant_id() OR has_role('super_admin'));
