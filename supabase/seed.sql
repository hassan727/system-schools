-- ============================================================
-- Seed Data: Permissions and System Roles
-- ============================================================

-- ============================================================
-- PERMISSIONS: جميع الصلاحيات بصيغة {module}.{resource}.{action}
-- ============================================================
INSERT INTO permissions (name, module, resource, action, description_ar) VALUES
-- Academic Module
('academic.students.create',    'academic', 'students',    'create', 'إضافة طالب جديد'),
('academic.students.read',      'academic', 'students',    'read',   'عرض بيانات الطلاب'),
('academic.students.update',    'academic', 'students',    'update', 'تعديل بيانات الطالب'),
('academic.students.delete',    'academic', 'students',    'delete', 'حذف طالب'),
('academic.classes.create',     'academic', 'classes',     'create', 'إنشاء فصل دراسي'),
('academic.classes.read',       'academic', 'classes',     'read',   'عرض الفصول الدراسية'),
('academic.classes.update',     'academic', 'classes',     'update', 'تعديل الفصل الدراسي'),
('academic.classes.delete',     'academic', 'classes',     'delete', 'حذف فصل دراسي'),
('academic.subjects.create',    'academic', 'subjects',    'create', 'إضافة مادة دراسية'),
('academic.subjects.read',      'academic', 'subjects',    'read',   'عرض المواد الدراسية'),
('academic.subjects.update',    'academic', 'subjects',    'update', 'تعديل المادة الدراسية'),
('academic.subjects.delete',    'academic', 'subjects',    'delete', 'حذف مادة دراسية'),
('academic.exams.create',       'academic', 'exams',       'create', 'إنشاء امتحان'),
('academic.exams.read',         'academic', 'exams',       'read',   'عرض الامتحانات'),
('academic.exams.update',       'academic', 'exams',       'update', 'تعديل الامتحان'),
('academic.grades.create',      'academic', 'grades',      'create', 'إدخال الدرجات'),
('academic.grades.read',        'academic', 'grades',      'read',   'عرض الدرجات'),
('academic.grades.update',      'academic', 'grades',      'update', 'تعديل الدرجات'),
('academic.timetable.create',   'academic', 'timetable',   'create', 'إنشاء جدول دراسي'),
('academic.timetable.read',     'academic', 'timetable',   'read',   'عرض الجدول الدراسي'),
('academic.timetable.update',   'academic', 'timetable',   'update', 'تعديل الجدول الدراسي'),
('academic.enrollments.create', 'academic', 'enrollments', 'create', 'تسجيل طالب في فصل'),
('academic.enrollments.read',   'academic', 'enrollments', 'read',   'عرض التسجيلات'),
-- HR Module
('hr.employees.create',         'hr', 'employees',  'create', 'إضافة موظف'),
('hr.employees.read',           'hr', 'employees',  'read',   'عرض بيانات الموظفين'),
('hr.employees.update',         'hr', 'employees',  'update', 'تعديل بيانات الموظف'),
('hr.employees.delete',         'hr', 'employees',  'delete', 'حذف موظف'),
('hr.attendance.create',        'hr', 'attendance', 'create', 'تسجيل الحضور'),
('hr.attendance.read',          'hr', 'attendance', 'read',   'عرض سجلات الحضور'),
('hr.attendance.update',        'hr', 'attendance', 'update', 'تعديل سجل الحضور'),
('hr.salaries.create',          'hr', 'salaries',   'create', 'إنشاء كشف راتب'),
('hr.salaries.read',            'hr', 'salaries',   'read',   'عرض الرواتب'),
('hr.salaries.approve',         'hr', 'salaries',   'approve','اعتماد الرواتب'),
('hr.leaves.create',            'hr', 'leaves',     'create', 'طلب إجازة'),
('hr.leaves.read',              'hr', 'leaves',     'read',   'عرض طلبات الإجازة'),
('hr.leaves.approve',           'hr', 'leaves',     'approve','الموافقة على الإجازات'),
-- Finance Module
('finance.invoices.create',     'finance', 'invoices',  'create', 'إنشاء فاتورة'),
('finance.invoices.read',       'finance', 'invoices',  'read',   'عرض الفواتير'),
('finance.invoices.update',     'finance', 'invoices',  'update', 'تعديل الفاتورة'),
('finance.payments.create',     'finance', 'payments',  'create', 'تسجيل دفعة'),
('finance.payments.read',       'finance', 'payments',  'read',   'عرض المدفوعات'),
('finance.expenses.create',     'finance', 'expenses',  'create', 'إضافة مصروف'),
('finance.expenses.read',       'finance', 'expenses',  'read',   'عرض المصروفات'),
('finance.expenses.approve',    'finance', 'expenses',  'approve','اعتماد المصروفات'),
('finance.reports.read',        'finance', 'reports',   'read',   'عرض التقارير المالية'),
-- Reports Module
('reports.academic.read',       'reports', 'academic',  'read',   'عرض التقارير الأكاديمية'),
('reports.financial.read',      'reports', 'financial', 'read',   'عرض التقارير المالية'),
('reports.hr.read',             'reports', 'hr',        'read',   'عرض تقارير الموارد البشرية'),
-- System
('system.roles.manage',         'system', 'roles',        'manage', 'إدارة الأدوار والصلاحيات'),
('system.users.manage',         'system', 'users',        'manage', 'إدارة المستخدمين'),
('system.audit_logs.read',      'system', 'audit_logs',   'read',   'عرض سجلات التدقيق'),
('system.notifications.read',   'system', 'notifications','read',   'عرض الإشعارات'),
('system.settings.manage',      'system', 'settings',     'manage', 'إدارة إعدادات النظام'),
('system.custom_fields.manage', 'system', 'custom_fields','manage', 'إدارة الحقول المخصصة')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- SYSTEM ROLES: الأدوار الافتراضية للنظام
-- ============================================================
INSERT INTO roles (id, tenant_id, name, name_ar, is_system) VALUES
  ('00000000-0000-0000-0000-000000000001', NULL, 'super_admin',  'مشرف عام',   TRUE),
  ('00000000-0000-0000-0000-000000000002', NULL, 'school_owner', 'مالك المدرسة', TRUE),
  ('00000000-0000-0000-0000-000000000003', NULL, 'admin',        'مدير',        TRUE),
  ('00000000-0000-0000-0000-000000000004', NULL, 'teacher',      'معلم',        TRUE),
  ('00000000-0000-0000-0000-000000000005', NULL, 'employee',     'موظف',        TRUE),
  ('00000000-0000-0000-0000-000000000006', NULL, 'student',      'طالب',        TRUE),
  ('00000000-0000-0000-0000-000000000007', NULL, 'parent',       'ولي أمر',     TRUE)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ROLE PERMISSIONS: Admin يملك كل الصلاحيات
-- ============================================================
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000003', id FROM permissions
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- School Owner يملك كل الصلاحيات أيضاً
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', id FROM permissions
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Teacher permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000004', id FROM permissions
WHERE name IN (
  'academic.students.read',
  'academic.classes.read',
  'academic.subjects.read',
  'academic.exams.create',
  'academic.exams.read',
  'academic.exams.update',
  'academic.grades.create',
  'academic.grades.read',
  'academic.grades.update',
  'academic.timetable.read',
  'academic.enrollments.read'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Employee permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000005', id FROM permissions
WHERE name IN (
  'hr.attendance.read',
  'hr.leaves.create',
  'hr.leaves.read',
  'hr.salaries.read'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Student permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000006', id FROM permissions
WHERE name IN (
  'academic.grades.read',
  'academic.timetable.read',
  'academic.subjects.read'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Parent permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000007', id FROM permissions
WHERE name IN (
  'academic.grades.read',
  'academic.timetable.read',
  'finance.invoices.read',
  'finance.payments.read'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;
