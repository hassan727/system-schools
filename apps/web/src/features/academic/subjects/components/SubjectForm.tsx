import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { subjectService, type Subject } from '../services/subject.service'
import type { Class } from '../../classes/services/class.service'
import { Input } from '../../../../shared/components/ui/Input'
import { Button } from '../../../../shared/components/ui/Button'

const schema = z.object({
  name_ar: z.string().min(2, 'اسم المادة بالعربية مطلوب'),
  name_en: z.string().optional(),
  code: z.string().optional(),
  class_id: z.string().min(1, 'الفصل مطلوب'),
  credits: z.coerce.number().min(0.5).max(10),
  passing_grade: z.coerce.number().min(0).max(100),
})

type FormValues = z.infer<typeof schema>

interface SubjectFormProps {
  subject: Subject | null
  classes: Class[]
  onClose: () => void
}

export function SubjectForm({ subject, classes, onClose }: SubjectFormProps) {
  const { i18n } = useTranslation()
  const isAr = i18n.language === 'ar'
  const qc = useQueryClient()

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: subject ? {
      name_ar: subject.name_ar,
      name_en: subject.name_en ?? '',
      code: subject.code ?? '',
      class_id: subject.class_id,
      credits: subject.credits,
      passing_grade: subject.passing_grade,
    } : { credits: 1, passing_grade: 60 },
  })

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      subject ? subjectService.update(subject.id, values) : subjectService.create(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subjects'] })
      onClose()
    },
  })

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="اسم المادة (عربي) *" error={errors.name_ar?.message} {...register('name_ar')} />
        <Input label="Subject Name (English)" {...register('name_en')} />
        <Input label="الرمز (Code)" placeholder="مثال: MATH101" {...register('code')} />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">الفصل الدراسي *</label>
        <select
          {...register('class_id')}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">اختر الفصل...</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {isAr ? c.name_ar : (c.name_en ?? c.name_ar)} — {c.grade_level}
            </option>
          ))}
        </select>
        {errors.class_id && <p className="text-xs text-red-500">{errors.class_id.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="عدد الوحدات" type="number" step="0.5" error={errors.credits?.message} {...register('credits')} />
        <Input label="درجة النجاح (%)" type="number" error={errors.passing_grade?.message} {...register('passing_grade')} />
      </div>

      {mutation.isError && (
        <p className="text-sm text-red-500">{(mutation.error as Error).message}</p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onClose}>إلغاء</Button>
        <Button type="submit" size="sm" loading={mutation.isPending}>
          {subject ? 'حفظ' : 'إضافة'}
        </Button>
      </div>
    </form>
  )
}
