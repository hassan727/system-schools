# Skill: إنشاء وحدة (Feature Module) جديدة

## متى تستخدم هذا الـ Skill؟
عند إضافة وحدة جديدة للنظام (مثل: academic, hr, finance).

## هيكل الوحدة الكامل
```
src/features/{module}/
├── {resource}/
│   ├── components/
│   │   ├── {Resource}Form.tsx      # نموذج الإنشاء/التعديل
│   │   ├── {Resource}Card.tsx      # بطاقة عرض
│   │   └── {Resource}Filters.tsx   # فلاتر البحث
│   ├── hooks/
│   │   ├── use{Resource}List.ts    # جلب القائمة
│   │   ├── use{Resource}Detail.ts  # جلب سجل واحد
│   │   └── use{Resource}Mutations.ts # create/update/delete
│   ├── pages/
│   │   ├── {Resource}ListPage.tsx  # صفحة القائمة
│   │   ├── {Resource}DetailPage.tsx # صفحة التفاصيل
│   │   └── {Resource}FormPage.tsx  # صفحة النموذج
│   └── services/
│       └── {resource}.service.ts   # Business Logic
└── index.ts                        # exports
```

## قالب الـ Service
```typescript
// src/features/{module}/{resource}/services/{resource}.service.ts
import { z } from 'zod'
import { supabase } from '../../../../shared/services/supabase'
import { BaseService, ApiError } from '../../../../shared/services/api.service'

// 1. Zod Schema للتحقق
export const Create{Resource}Schema = z.object({
  nameAr: z.string().min(2, 'الاسم مطلوب'),
  nameEn: z.string().optional(),
  // ... باقي الحقول
})

export type Create{Resource}Input = z.infer<typeof Create{Resource}Schema>

// 2. Interface للنتيجة
export interface {Resource} {
  id: string
  tenantId: string
  nameAr: string
  nameEn: string | null
  createdAt: string
}

// 3. Service Class
class {Resource}Service extends BaseService {
  async list(params = {}) {
    const { data, error, count } = await supabase
      .from('{table_name}')
      .select('*', { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) throw new ApiError(error.message, error.code)
    return { data: data || [], count: count || 0 }
  }

  async create(input: Create{Resource}Input) {
    const validated = this.validate(Create{Resource}Schema, input)
    const { data, error } = await supabase
      .from('{table_name}')
      .insert({ name_ar: validated.nameAr, name_en: validated.nameEn })
      .select()
      .single()

    if (error) throw new ApiError(error.message, error.code)
    return data
  }

  async update(id: string, input: Partial<Create{Resource}Input>) {
    const { data, error } = await supabase
      .from('{table_name}')
      .update({ name_ar: input.nameAr, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new ApiError(error.message, error.code)
    return data
  }

  async delete(id: string) {
    // Soft delete دائماً
    const { error } = await supabase
      .from('{table_name}')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw new ApiError(error.message, error.code)
  }
}

export const {resource}Service = new {Resource}Service()
```

## قالب الـ Hook
```typescript
// hooks/use{Resource}List.ts
import { useQuery } from '@tanstack/react-query'
import { {resource}Service } from '../services/{resource}.service'

export function use{Resource}List(params = {}) {
  return useQuery({
    queryKey: ['{resource}s', params],
    queryFn: () => {resource}Service.list(params),
    staleTime: 5 * 60 * 1000, // 5 دقائق
  })
}
```

## قالب الـ ListPage
```tsx
// pages/{Resource}ListPage.tsx
import { useTranslation } from 'react-i18next'
import { PermissionGuard } from '../../../../shared/components/guards/PermissionGuard'
import { DataTable } from '../../../../shared/components/ui/DataTable'
import { use{Resource}List } from '../hooks/use{Resource}List'

export default function {Resource}ListPage() {
  const { t, i18n } = useTranslation('{module}')
  const { data, isLoading } = use{Resource}List()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('{resource}s.title')}
        </h1>
        <PermissionGuard permission="{module}.{resource}s.create">
          <button className="btn-primary">{t('common.add')}</button>
        </PermissionGuard>
      </div>

      {/* DataTable */}
      <DataTable
        data={data?.data || []}
        isLoading={isLoading}
        columns={[
          {
            key: 'name',
            label: t('{resource}s.name'),
            render: (row) => i18n.language === 'ar' ? row.name_ar : row.name_en,
          },
        ]}
      />
    </div>
  )
}
```

## إضافة Route للـ Router
```typescript
// في src/app/router.tsx
{
  path: '{module}/{resource}s',
  element: (
    <ModuleGuard module="{module}">
      <PermissionGuard permission="{module}.{resource}s.read">
        {withSuspense(lazy(() => import('../features/{module}/{resource}s/pages/{Resource}ListPage')))}
      </PermissionGuard>
    </ModuleGuard>
  ),
}
```

## إضافة للـ Sidebar
```typescript
// في sidebar.config.ts أضف للـ SIDEBAR_CONFIG
{
  id: '{resource}s',
  labelAr: 'اسم الوحدة',
  labelEn: 'Module Name',
  icon: 'IconName',
  path: '/{module}/{resource}s',
  permission: '{module}.{resource}s.read',
  module: '{module}',
}
```
