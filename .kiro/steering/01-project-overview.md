# نظرة عامة على المشروع - SaaS School System

## ما هذا المشروع؟
منصة SaaS متعددة المستأجرين (Multi-Tenant) لإدارة المدارس، تشبه Odoo/SAP/Oracle.
- كل مدرسة = Tenant مستقل
- أنا (المطور) = مالك المنصة (Super Admin)
- المدارس تشترك في وحدات معينة وتدفع فقط مقابل ما تستخدمه

## المكدس التقني (Tech Stack)
| الطبقة | التقنية |
|--------|---------|
| Frontend | React + Vite + TypeScript + Tailwind CSS |
| State | Zustand + TanStack Query |
| Backend | Supabase (Auth + PostgreSQL + RLS + Edge Functions + Storage) |
| Hosting | Vercel |
| Monorepo | pnpm + Turborepo |
| i18n | i18next (عربي + إنجليزي) |
| Testing | fast-check (Property-Based Testing) |
| Forms | React Hook Form + Zod |

## ⚠️ قاعدة مهمة جداً
- Supabase CLI محلياً **بدون Docker** — لا تقترح Docker أبداً
- استخدم `supabase functions serve` لتشغيل Edge Functions محلياً
- استخدم `supabase db push` لتطبيق الـ migrations

## ملفات الـ Spec
- المتطلبات: `.kiro/specs/saas-school-system/requirements.md`
- التصميم: `.kiro/specs/saas-school-system/design.md`
- المهام: `.kiro/specs/saas-school-system/tasks.md`
