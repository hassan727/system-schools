import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { studentService } from '../services/student.service'
import { StudentForm } from '../components/StudentForm'
import { Skeleton } from '../../../../shared/components/ui/Skeleton'

export function StudentFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id

  const { data: student, isLoading } = useQuery({
    queryKey: ['student', id],
    queryFn: () => studentService.getById(id!),
    enabled: isEdit,
  })

  if (isEdit && isLoading) {
    return (
      <div className="flex flex-col gap-4 max-w-2xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        {isEdit ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد'}
      </h1>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <StudentForm student={isEdit ? student : null} />
      </div>
    </div>
  )
}
