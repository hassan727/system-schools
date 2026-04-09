# نظام الصلاحيات والوحدات - RBAC & Modules

## الأدوار الافتراضية
| الدور | الوصف | النطاق |
|-------|-------|--------|
| `super_admin` | مالك المنصة | كل المستأجرين |
| `school_owner` | مالك المدرسة | مستأجر واحد |
| `admin` | مدير المدرسة | مستأجر واحد |
| `teacher` | معلم | مستأجر واحد |
| `employee` | موظف | مستأجر واحد |
| `student` | طالب | مستأجر واحد |
| `parent` | ولي أمر | مستأجر واحد |

## الوحدات القابلة للاشتراك
| الوحدة | المفتاح | الوصف |
|--------|---------|-------|
| الأكاديمية | `academic` | طلاب، فصول، درجات |
| الموارد البشرية | `hr` | موظفون، حضور، رواتب |
| المالية | `finance` | فواتير، مدفوعات |
| الجداول | `scheduling` | جدول دراسي، أحداث |
| التقارير | `reports` | تحليلات، تقارير |

## قواعد التحقق من الصلاحيات

### في الـ Frontend
```tsx
// Hook
const { hasPermission, hasRole } = usePermissions()

// Component Guard
<PermissionGuard permission="academic.students.create">
  <AddStudentButton />
</PermissionGuard>

// Module Guard
<ModuleGuard module="finance">
  <FinancePage />
</ModuleGuard>
```

### في الـ Service Layer
```typescript
// تحقق دائماً قبل تنفيذ أي عملية
if (!hasPermission(user.permissions, 'academic.students.create')) {
  throw new ApiError('غير مصرح', 'FORBIDDEN', 403)
}
```

### في قاعدة البيانات (RLS)
```sql
-- RLS تتحقق تلقائياً من tenant_id
-- لا حاجة لفلترة يدوية في الكود
```

## قائمة الصلاحيات الكاملة
```
academic.students.{create|read|update|delete}
academic.classes.{create|read|update|delete}
academic.subjects.{create|read|update|delete}
academic.exams.{create|read|update|delete}
academic.grades.{create|read|update}
academic.timetable.{create|read|update}
academic.enrollments.{create|read}
hr.employees.{create|read|update|delete}
hr.attendance.{create|read|update}
hr.salaries.{create|read|approve}
hr.leaves.{create|read|approve}
finance.invoices.{create|read|update}
finance.payments.{create|read}
finance.expenses.{create|read|approve}
finance.reports.read
reports.academic.read
reports.financial.read
reports.hr.read
system.roles.manage
system.users.manage
system.audit_logs.read
system.notifications.read
system.settings.manage
system.custom_fields.manage
```

## قاعدة Upgrade Prompt
إذا حاول مستخدم الوصول لوحدة غير مفعّلة:
- أعد توجيهه لـ `/upgrade?module={module_name}`
- لا تعرض رسالة خطأ تقنية
- اعرض صفحة ترقية جميلة مع مميزات الوحدة
