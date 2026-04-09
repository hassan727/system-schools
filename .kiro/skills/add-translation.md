# Skill: إضافة ترجمات جديدة

## متى تستخدم هذا الـ Skill؟
عند إضافة نصوص جديدة للواجهة تحتاج ترجمة عربي/إنجليزي.

## الخطوات

### 1. أضف المفتاح للملف العربي أولاً
```json
// src/i18n/ar/{namespace}.json
{
  "students": {
    "title": "الطلاب",
    "add": "إضافة طالب",
    "edit": "تعديل الطالب",
    "delete": "حذف الطالب",
    "search": "البحث عن طالب...",
    "fields": {
      "name": "الاسم",
      "studentNo": "رقم الطالب",
      "grade": "المرحلة الدراسية",
      "status": "الحالة"
    },
    "status": {
      "active": "نشط",
      "inactive": "غير نشط",
      "graduated": "متخرج",
      "transferred": "محوّل"
    },
    "messages": {
      "created": "تم إضافة الطالب بنجاح",
      "updated": "تم تحديث بيانات الطالب",
      "deleted": "تم حذف الطالب",
      "capacityExceeded": "الفصل وصل للطاقة الاستيعابية القصوى"
    }
  }
}
```

### 2. أضف نفس المفتاح للملف الإنجليزي
```json
// src/i18n/en/{namespace}.json
{
  "students": {
    "title": "Students",
    "add": "Add Student",
    "edit": "Edit Student",
    "delete": "Delete Student",
    "search": "Search students...",
    "fields": {
      "name": "Name",
      "studentNo": "Student Number",
      "grade": "Grade Level",
      "status": "Status"
    },
    "status": {
      "active": "Active",
      "inactive": "Inactive",
      "graduated": "Graduated",
      "transferred": "Transferred"
    },
    "messages": {
      "created": "Student added successfully",
      "updated": "Student data updated",
      "deleted": "Student deleted",
      "capacityExceeded": "Class has reached maximum capacity"
    }
  }
}
```

### 3. استخدام في الـ Component
```tsx
import { useTranslation } from 'react-i18next'

function StudentsPage() {
  const { t } = useTranslation('academic') // namespace

  return (
    <div>
      <h1>{t('students.title')}</h1>
      <button>{t('students.add')}</button>
      <input placeholder={t('students.search')} />
    </div>
  )
}
```

## Namespaces المتاحة
| Namespace | الملف | الاستخدام |
|-----------|-------|-----------|
| `common` | common.json | نصوص مشتركة (حفظ، إلغاء، بحث...) |
| `academic` | academic.json | الوحدة الأكاديمية |
| `hr` | hr.json | الموارد البشرية |
| `finance` | finance.json | المالية |
| `errors` | errors.json | رسائل الأخطاء |

## ملفات common.json الأساسية
```json
// ar/common.json
{
  "actions": {
    "save": "حفظ",
    "cancel": "إلغاء",
    "delete": "حذف",
    "edit": "تعديل",
    "add": "إضافة",
    "search": "بحث",
    "filter": "تصفية",
    "export": "تصدير",
    "import": "استيراد",
    "print": "طباعة",
    "close": "إغلاق",
    "confirm": "تأكيد",
    "back": "رجوع"
  },
  "status": {
    "active": "نشط",
    "inactive": "غير نشط",
    "pending": "قيد الانتظار",
    "approved": "معتمد",
    "rejected": "مرفوض"
  },
  "table": {
    "noData": "لا توجد بيانات",
    "loading": "جاري التحميل...",
    "showing": "عرض {{from}} - {{to}} من {{total}}"
  },
  "errors": {
    "required": "هذا الحقل مطلوب",
    "minLength": "يجب أن يكون {{min}} أحرف على الأقل",
    "invalidEmail": "البريد الإلكتروني غير صالح",
    "serverError": "حدث خطأ في الخادم، حاول مرة أخرى"
  }
}
```
