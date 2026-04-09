import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { classService, type Class, type AcademicYear } from '../services/class.service'
import { Input } from '../../../../shared/components/ui/Input'
import { Button } from '../../../../shared/components/ui/Button'

const schema = z.object({
  name_ar: z.string().min(2, 'اسم الفصل بالعربية مطلوب'),
  name_en: z.string().optional(),
  academic_year_id: z.string().min(1, 'السنة الدراسية مطلوبة'),
  grade_level: z.string().min(1, 'المرحلة الدراسية مطلوبة'),
  capacity: z.coerce.number().min(1).max(100),
  room: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface ClassFormProps {
  cls: Class | null
  years: AcademicYear[]
  onClose: () => void
}

export function ClassForm({ cls, years, onClose }: ClassFormProps) {
  const qc = useQueryClient()

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: cls ? {
      name_ar: cls.name_ar,
      name_en: cls.name_en ?? '',
      academic_year_id: cls.academic_year_id,
      grade_level: cls.grade_level,
      capacity: cls.capacity,
      room: cls.room ?? '',
    } : { capacity: 30 },
  })

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      cls ? classService.update(cls.id, values) : classService.create(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classes'] })
      onClose()
    },
  })

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="اسم الفصل (عربي) *" error={errors.name_ar?.message} {...register('name_ar')} />
        <Input label="Class Name (English)" error={errors.name_en?.message} {...register('name_en')} />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">السنة الدراسية *</label>
        <select
          {...register('academic_year_id')}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">اختر السنة...</option>
          {years.map((y) => (
            <option key={y.id} value={y.id}>{y.name} {y.is_current ? '(الحالية)' : ''}</option>
          ))}
        </select>
        {errors.academic_year_id && <p className="text-xs text-red-500">{errors.academic_year_id.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="المرحلة الدراسية *" placeholder="مثال: الصف الأول" error={errors.grade_level?.message} {...register('grade_level')} />
        <Input label="الطاقة الاستيعابية *" type="number" error={errors.capacity?.message} {...register('capacity')} />
        <Input label="رقم القاعة" placeholder="مثال: A101" {...register('room')} />
      </div>

      {mutation.isError && (
        <p className="text-sm text-red-500">{(mutation.error as Error).message}</p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onClose}>إلغاء</Button>
        <Button type="submit" size="sm" loading={mutation.isPending}>
          {cls ? 'حفظ' : 'إضافة'}
        </Button>
      </div>
    </form>
  )
}
