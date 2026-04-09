# قواعد اللغة والـ RTL - i18n & RTL Rules

## القاعدة الأساسية
النظام يدعم اللغتين **العربية (RTL)** و**الإنجليزية (LTR)** بالكامل.
اللغة الافتراضية: **العربية**

## قواعد الكود

### 1. لا تكتب نصاً مباشراً في الـ JSX
```tsx
// ❌ خطأ
<h1>الطلاب</h1>
<button>حفظ</button>

// ✅ صح
const { t } = useTranslation('academic')
<h1>{t('students.title')}</h1>
<button>{t('common.save')}</button>
```

### 2. اتجاه الصفحة
```tsx
// في App.tsx أو AppLayout.tsx
const { i18n } = useTranslation()
<div dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
```

### 3. Tailwind RTL
```tsx
// استخدم logical properties بدل left/right
// ❌ خطأ
className="ml-4 pl-3 text-left border-l"

// ✅ صح (يعمل مع RTL/LTR تلقائياً)
className="ms-4 ps-3 text-start border-s"
```

### 4. هيكل ملفات الترجمة
```
src/i18n/
├── ar/
│   ├── common.json      # مشترك (حفظ، إلغاء، بحث...)
│   ├── academic.json    # الوحدة الأكاديمية
│   ├── hr.json          # الموارد البشرية
│   ├── finance.json     # المالية
│   └── errors.json      # رسائل الأخطاء
└── en/
    ├── common.json
    ├── academic.json
    ├── hr.json
    ├── finance.json
    └── errors.json
```

### 5. حقول قاعدة البيانات الثنائية
كل حقل نصي يظهر للمستخدم يجب أن يكون ثنائياً:
```sql
name_ar TEXT NOT NULL,   -- الاسم بالعربية (إلزامي)
name_en TEXT,            -- الاسم بالإنجليزية (اختياري)
```

### 6. عرض الاسم حسب اللغة
```tsx
const { i18n } = useTranslation()
const displayName = i18n.language === 'ar' 
  ? (item.name_ar || item.name_en) 
  : (item.name_en || item.name_ar)
```

### 7. الأرقام والتواريخ
```tsx
// الأرقام
new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-SA' : 'en-US').format(amount)

// التواريخ
new Intl.DateTimeFormat(i18n.language === 'ar' ? 'ar-SA' : 'en-US').format(date)
```

### 8. الخطوط
```css
/* في index.css */
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');

body {
  font-family: 'Cairo', 'Inter', sans-serif;
}
```
