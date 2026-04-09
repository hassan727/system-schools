# نظام التصميم - UI Design System

## المبدأ العام
التصميم يشبه Odoo/SAP — احترافي، نظيف، responsive كامل على الموبايل.

## Layout الرئيسي
```
┌─────────────────────────────────────────────┐
│  Header (h-16): Logo | Breadcrumb | Actions  │
├──────────┬──────────────────────────────────┤
│          │                                   │
│ Sidebar  │   Main Content Area               │
│ (w-64)   │   (flex-1, overflow-y-auto)       │
│          │                                   │
│ collapsed│                                   │
│ → w-16   │                                   │
└──────────┴──────────────────────────────────┘
```

## ألوان النظام (Tailwind)
```
Primary:   blue-600  (#2563eb)
Secondary: purple-600 (#9333ea)
Success:   green-500  (#22c55e)
Warning:   yellow-500 (#eab308)
Danger:    red-500    (#ef4444)
```
- الألوان الأساسية تُحمَّل من إعدادات المستأجر (CSS variables)

## مكونات UI الأساسية (في shared/components/ui/)
| المكون | الوصف |
|--------|-------|
| `Button` | primary, secondary, danger, ghost, sizes: sm/md/lg |
| `Input` | text, number, date, مع label وerror message |
| `Select` | قائمة منسدلة مع بحث |
| `Modal` | dialog مع backdrop |
| `DataTable` | جدول مع pagination, sort, filter, search |
| `Badge` | حالات: active/inactive/pending |
| `Avatar` | صورة مستخدم مع fallback بالحرف الأول |
| `Spinner` | loading indicator |
| `EmptyState` | حالة فارغة مع icon ورسالة |
| `FileUpload` | رفع ملفات مع preview |
| `DatePicker` | منتقي تاريخ يدعم RTL |

## قواعد Responsive
```
Mobile:  < 768px  → Sidebar مخفي، يظهر بـ hamburger menu
Tablet:  768-1024px → Sidebar collapsed (w-16)
Desktop: > 1024px → Sidebar كامل (w-64)
```

## قواعد Dark Mode
- استخدم `dark:` prefix في Tailwind
- الخلفية: `bg-white dark:bg-gray-900`
- النص: `text-gray-900 dark:text-white`
- الحدود: `border-gray-200 dark:border-gray-700`
- Cards: `bg-white dark:bg-gray-800`

## Sidebar Items
كل item في الـ Sidebar:
```tsx
{
  id: string
  labelAr: string      // الاسم بالعربية
  labelEn: string      // الاسم بالإنجليزية
  icon: string         // اسم أيقونة من lucide-react
  path: string         // المسار
  permission?: string  // الصلاحية المطلوبة
  module?: string      // الوحدة المطلوبة
  children?: SidebarItem[]  // عناصر فرعية
}
```

## Stats Cards (Dashboard)
```tsx
<StatsCard
  titleAr="إجمالي الطلاب"
  titleEn="Total Students"
  value={1250}
  icon={<Users />}
  trend="+12%"
  trendUp={true}
/>
```

## DataTable Standard
كل جدول بيانات يجب أن يدعم:
- بحث نصي
- فلترة بالحالة
- ترتيب بالأعمدة
- pagination (20 عنصر/صفحة افتراضياً)
- تصدير (PDF/Excel) إذا كانت الوحدة تدعمه
- أزرار: عرض، تعديل، حذف (حسب الصلاحيات)
