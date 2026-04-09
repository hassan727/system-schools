# قواعد الفرونت اند - Frontend Conventions

## هيكل المجلدات (Feature-Based)
```
src/
├── app/              # router, providers, query-client
├── features/         # كل وحدة في مجلد مستقل
│   ├── auth/
│   ├── academic/
│   │   ├── students/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── pages/
│   │   │   └── services/   # business logic هنا فقط
│   ├── hr/
│   ├── finance/
│   └── reports/
├── shared/
│   ├── components/
│   │   ├── layout/   # AppLayout, Sidebar, Header
│   │   ├── ui/       # Button, Input, Modal, DataTable...
│   │   └── guards/   # AuthGuard, PermissionGuard, ModuleGuard
│   ├── hooks/
│   ├── stores/       # Zustand stores
│   ├── services/     # supabase.ts, api.service.ts
│   └── utils/
└── i18n/
    ├── ar/           # ملفات الترجمة العربية
    └── en/           # ملفات الترجمة الإنجليزية
```

## قواعد الكود

### 1. Business Logic
- **لا** business logic في الـ components
- كل منطق عمل في `services/` داخل كل feature
- استخدم `BaseService` كـ base class لكل service

### 2. Zustand Stores
- `auth.store.ts` — المستخدم، الجلسة، الصلاحيات
- `tenant.store.ts` — إعدادات المستأجر، الوحدات المفعّلة
- `ui.store.ts` — theme، language، sidebarCollapsed
- `notification.store.ts` — الإشعارات

### 3. Guards (إلزامية)
```tsx
// كل route محمية تحتاج AuthGuard
<AuthGuard>
  <ModuleGuard module="finance">
    <PermissionGuard permission="finance.invoices.read">
      <InvoicesPage />
    </PermissionGuard>
  </ModuleGuard>
</AuthGuard>
```

### 4. Validation
- استخدم **Zod** + **React Hook Form** في كل نموذج
- لا تُرسل بيانات للـ API بدون validation

### 5. Error Handling
- كل page تُلف بـ `ErrorBoundary`
- استخدم `Loading` skeleton أثناء جلب البيانات
- عرض رسائل خطأ واضحة باللغة العربية

### 6. Lazy Loading
```tsx
const StudentsPage = lazy(() => import('./features/academic/students/pages/StudentsListPage'))
```
- كل page = lazy loaded
- استخدم `<Suspense fallback={<PageLoader />}>`

### 7. TanStack Query
- كل API call عبر `useQuery` أو `useMutation`
- لا تستخدم `useEffect` لجلب البيانات
- stale time: 5 دقائق للبيانات الثابتة، 30 ثانية للبيانات المتغيرة
