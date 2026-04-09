# كيف تعمل على هذا المشروع - دليل الوكيل

## 📌 اقرأ هذا أولاً في كل محادثة جديدة

هذا المشروع هو **SaaS School System** — منصة متعددة المستأجرين لإدارة المدارس.
جميع التفاصيل موثقة في ملفات الـ Steering وSpecs. لا تطلب من المستخدم إعادة الشرح.

---

## 📂 خريطة الملفات المهمة

### Steering Files (تُقرأ تلقائياً في كل محادثة)
```
.kiro/steering/
├── 00-how-to-work.md          ← أنت هنا
├── 01-project-overview.md     ← المشروع والمكدس التقني
├── 02-database-conventions.md ← قواعد قاعدة البيانات
├── 03-security-rules.md       ← قواعد الأمان (RLS, JWT, RBAC)
├── 04-frontend-conventions.md ← قواعد الفرونت اند
├── 05-i18n-rtl.md             ← قواعد اللغة والـ RTL
├── 06-rbac-modules.md         ← الأدوار والصلاحيات والوحدات
├── 07-ui-design-system.md     ← نظام التصميم (Layout, Components)
├── 08-edge-functions-supabase.md ← Supabase بدون Docker
└── 09-deployment-vercel.md    ← النشر على Vercel
```

### Spec Files (التصميم والمتطلبات والمهام)
```
.kiro/specs/saas-school-system/
├── requirements.md  ← 16 متطلب كامل
├── design.md        ← التصميم التقني الكامل (SQL, Architecture, Code)
└── tasks.md         ← 22 مهمة مرتبة للتنفيذ
```

### Skills (استدعِها عند الحاجة)
```
.kiro/skills/
├── create-migration.md        ← إنشاء migration جديدة
├── create-feature-module.md   ← إنشاء وحدة جديدة
├── add-rls-policy.md          ← إضافة RLS policy
├── create-edge-function.md    ← إنشاء Edge Function
├── property-based-testing.md  ← كتابة PBT tests
└── add-translation.md         ← إضافة ترجمات
```

---

## ⚡ القواعد الذهبية (لا تنساها أبداً)

| # | القاعدة |
|---|---------|
| 1 | **بدون Docker** — Supabase CLI محلياً فقط |
| 2 | **كل جدول = tenant_id + RLS** — بدون استثناء |
| 3 | **Soft Delete فقط** — لا تستخدم DELETE أبداً |
| 4 | **Zod لكل مدخل** — لا تثق بالـ frontend |
| 5 | **لا نص مباشر في JSX** — استخدم i18next دائماً |
| 6 | **Tailwind logical properties** — ms/me/ps/pe بدل ml/mr/pl/pr |
| 7 | **Business logic في services فقط** — لا في components |
| 8 | **كل route = AuthGuard + PermissionGuard + ModuleGuard** |

---

## 🚀 كيف تبدأ تنفيذ مهمة؟

1. اقرأ `tasks.md` لمعرفة المهمة التالية
2. اقرأ `design.md` للتفاصيل التقنية
3. استخدم الـ Skill المناسب من `.kiro/skills/`
4. طبّق القواعد من ملفات الـ Steering
5. حدّث حالة المهمة في `tasks.md`

---

## 🏗️ هيكل المشروع الحالي
```
saas-school-system/          ← جذر المشروع
├── apps/
│   ├── web/                 ← React + Vite (للمدارس)
│   └── admin/               ← React + Vite (Super Admin)
├── packages/
│   ├── shared-types/        ← TypeScript types مشتركة
│   └── ui/                  ← مكتبة UI مشتركة
├── supabase/
│   ├── migrations/          ← SQL migrations
│   ├── functions/           ← Edge Functions
│   └── seed.sql
├── .kiro/
│   ├── steering/            ← قواعد العمل (هنا)
│   ├── skills/              ← مهارات قابلة للاستدعاء
│   └── specs/saas-school-system/
├── vercel.json
├── turbo.json
└── pnpm-workspace.yaml
```
