import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { studentService, type Student } from '../services/student.service'
import { Input } from '../../../../shared/components/ui/Input'
import { Button } from '../../../../shared/components/ui/Button'

const schema = z.object({
  first_name_ar: z.string().min(2, 'الاسم الأول بالعربية مطلوب'),
  first_name_en: z.string().optional(),
  last_name_ar: z.string().min(2, 'اسم العائلة بالعربية مطلوب'),
  last_name_en: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female']).optional(),
  phone: z.string().optional(),
  national_id: z.string().optional(),
  address: z.string().optional(),
  grade_level: z.string().optional(),
  enrollment_date: z.string().optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface StudentFormProps {
  student?: Student | null
}

export function StudentForm({ student }: StudentFormProps) {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: student ? {
      first_name_ar: student.profile?.first_name_ar ?? '',
      first_name_en: student.profile?.first_name_en ?? '',
      last_name_ar: student.profile?.last_name_ar ?? '',
      last_name_en: student.profile?.last_name_en ?? '',
      date_of_birth: student.profile?.date_of_birth ?? '',
      gender: student.profile?.gender ?? undefined,
      phone: student.profile?.phone ?? '',
      national_id: student.profile?.national_id ?? '',
      address: student.profile?.address ?? '',
      grade_level: student.grade_level ?? '',
      enrollment_date: student.enrollment_date ?? '',
      notes: student.notes ?? '',
    } : {
      enrollment_date: new Date().toISOString().split('T')[0],
    },
  })

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      student
        ? studentService.update(student.id, values)
        : studentService.create(values),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['students'] })
      navigate(`/academic/students/${data.id}`)
    },
  })

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="flex flex-col gap-6">
      {/* بيانات الهوية */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">البيانات الشخصية</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="الاسم الأول (عربي) *" error={errors.first_name_ar?.message} {...register('first_name_ar')} />
          <Input label="First Name (English)" error={errors.first_name_en?.message} {...register('first_name_en')} />
          <Input label="اسم العائلة (عربي) *" error={errors.last_name_ar?.message} {...register('last_name_ar')} />
          <Input label="Last Name (English)" error={errors.last_name_en?.message} {...register('last_name_en')} />
          <Input label="تاريخ الميلاد" type="date" {...register('date_of_birth')} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">الجنس</label>
            <select
              {...register('gender')}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">اختر...</option>
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
            </select>
          </div>
          <Input label="رقم الهاتف" type="tel" {...register('phone')} />
          <Input label="رقم الهوية الوطنية" {...register('national_id')} />
        </div>
        <div className="mt-4">
          <Input label="العنوان" {...register('address')} />
        </div>
      </div>

      {/* بيانات أكاديمية */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">البيانات الأكاديمية</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="المرحلة الدراسية" placeholder="مثال: الصف الأول" {...register('grade_level')} />
          <Input label="تاريخ التسجيل" type="date" {...register('enrollment_date')} />
        </div>
        <div className="mt-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">ملاحظات</label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>
      </div>

      {mutation.isError && (
        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
          {(mutation.error as Error).message}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => navigate(-1)}>إلغاء</Button>
        <Button type="submit" loading={mutation.isPending}>
          {student ? 'حفظ التعديلات' : 'إضافة الطالب'}
        </Button>
      </div>
    </form>
  )
}
