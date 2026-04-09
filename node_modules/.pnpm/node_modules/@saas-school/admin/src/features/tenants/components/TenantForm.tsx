import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tenantService, AVAILABLE_MODULES, type Tenant } from '../services/tenant.service'
import { Input } from '../../../shared/components/ui/Input'
import { Button } from '../../../shared/components/ui/Button'

const schema = z.object({
  name_ar: z.string().min(2, 'الاسم العربي مطلوب'),
  name_en: z.string().optional(),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'أحرف إنجليزية صغيرة وأرقام وشرطة فقط'),
  subdomain: z.string().min(2).regex(/^[a-z0-9-]+$/, 'أحرف إنجليزية صغيرة وأرقام وشرطة فقط'),
  status: z.enum(['active', 'trial', 'suspended', 'expired']),
  max_students: z.coerce.number().min(1),
  max_employees: z.coerce.number().min(1),
  primary_color: z.string().optional(),
  modules_enabled: z.array(z.string()),
})

type FormValues = z.infer<typeof schema>

interface TenantFormProps {
  tenant: Tenant | null
  onClose: () => void
}

export function TenantForm({ tenant, onClose }: TenantFormProps) {
  const qc = useQueryClient()

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: tenant ? {
      name_ar: tenant.name_ar,
      name_en: tenant.name_en ?? '',
      slug: tenant.slug,
      subdomain: tenant.subdomain,
      status: tenant.status,
      max_students: tenant.max_students,
      max_employees: tenant.max_employees,
      primary_color: tenant.primary_color ?? '#2563eb',
      modules_enabled: tenant.modules_enabled ?? [],
    } : {
      status: 'trial',
      max_students: 500,
      max_employees: 50,
      primary_color: '#2563eb',
      modules_enabled: ['academic'],
    },
  })

  const selectedModules = watch('modules_enabled')

  const toggleModule = (key: string) => {
    const current = selectedModules ?? []
    setValue('modules_enabled', current.includes(key) ? current.filter((k) => k !== key) : [...current, key])
  }

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      tenant ? tenantService.update(tenant.id, values) : tenantService.create(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenants'] })
      onClose()
    },
  })

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="اسم المدرسة (عربي)" error={errors.name_ar?.message} {...register('name_ar')} />
        <Input label="School Name (English)" error={errors.name_en?.message} {...register('name_en')} />
        <Input label="المعرف (slug)" placeholder="my-school" error={errors.slug?.message} {...register('slug')} />
        <Input label="النطاق الفرعي" placeholder="my-school" error={errors.subdomain?.message} {...register('subdomain')} />
        <Input label="الحد الأقصى للطلاب" type="number" error={errors.max_students?.message} {...register('max_students')} />
        <Input label="الحد الأقصى للموظفين" type="number" error={errors.max_employees?.message} {...register('max_employees')} />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">الحالة</label>
        <select
          {...register('status')}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="trial">تجريبي</option>
          <option value="active">نشط</option>
          <option value="suspended">معلق</option>
          <option value="expired">منتهي</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">الوحدات المفعّلة</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {AVAILABLE_MODULES.map((mod) => {
            const active = (selectedModules ?? []).includes(mod.key)
            return (
              <button
                key={mod.key}
                type="button"
                onClick={() => toggleModule(mod.key)}
                className={[
                  'rounded-lg border px-3 py-2 text-xs font-medium transition',
                  active
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300',
                ].join(' ')}
              >
                {mod.labelAr}
              </button>
            )
          })}
        </div>
      </div>

      {mutation.isError && (
        <p className="text-sm text-red-500">{(mutation.error as Error).message}</p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onClose}>إلغاء</Button>
        <Button type="submit" size="sm" loading={mutation.isPending}>
          {tenant ? 'حفظ التعديلات' : 'إنشاء المستأجر'}
        </Button>
      </div>
    </form>
  )
}
