import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Pencil, ArrowRight, ArrowLeft } from 'lucide-react'
import { studentService } from '../services/student.service'
import { Badge } from '../../../../shared/components/ui/Badge'
import { Button } from '../../../../shared/components/ui/Button'
import { Avatar } from '../../../../shared/components/ui/Avatar'
import { Skeleton } from '../../../../shared/components/ui/Skeleton'
import { PermissionGuard } from '../../../../shared/components/guards/PermissionGuard'

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  active: 'success', inactive: 'neutral', graduated: 'neutral', transferred: 'warning',
}
const statusLabel: Record<string, string> = {
  active: 'نشط', inactive: 'غير نشط', graduated: 'متخرج', transferred: 'محوّل',
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-sm text-gray-900 dark:text-white">{value ?? '—'}</span>
    </div>
  )
}

export function StudentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const isAr = i18n.language === 'ar'

  const { data: student, isLoading } = useQuery({
    queryKey: ['student', id],
    queryFn: () => studentService.getById(id!),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 max-w-3xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (!student) return null

  const fullName = isAr
    ? `${student.profile?.first_name_ar ?? ''} ${student.profile?.last_name_ar ?? ''}`
    : `${student.profile?.first_name_en ?? student.profile?.first_name_ar ?? ''} ${student.profile?.last_name_en ?? student.profile?.last_name_ar ?? ''}`

  const BackIcon = isAr ? ArrowRight : ArrowLeft

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/academic/students')}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition"
        >
          <BackIcon className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{fullName}</h1>
          <p className="text-sm text-gray-400">{student.student_no}</p>
        </div>
        <PermissionGuard permission="academic.students.update">
          <Button size="sm" variant="outline" onClick={() => navigate(`/academic/students/${id}/edit`)}>
            <Pencil className="w-4 h-4" />
            تعديل
          </Button>
        </PermissionGuard>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-start gap-4 mb-6">
          <Avatar src={student.profile?.avatar_url} name={fullName} size="lg" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{fullName}</h2>
            <p className="text-sm text-gray-400 mt-0.5">{student.student_no}</p>
            <div className="mt-2">
              <Badge variant={statusVariant[student.status] ?? 'neutral'}>
                {statusLabel[student.status] ?? student.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <InfoRow label="المرحلة الدراسية" value={student.grade_level} />
          <InfoRow
            label="تاريخ الميلاد"
            value={student.profile?.date_of_birth
              ? new Date(student.profile.date_of_birth).toLocaleDateString(isAr ? 'ar-SA' : 'en-US')
              : null}
          />
          <InfoRow
            label="الجنس"
            value={student.profile?.gender === 'male' ? 'ذكر' : student.profile?.gender === 'female' ? 'أنثى' : null}
          />
          <InfoRow label="رقم الهاتف" value={student.profile?.phone} />
          <InfoRow label="رقم الهوية" value={student.profile?.national_id} />
          <InfoRow
            label="تاريخ التسجيل"
            value={new Date(student.enrollment_date).toLocaleDateString(isAr ? 'ar-SA' : 'en-US')}
          />
          <InfoRow label="العنوان" value={student.profile?.address} />
          {student.notes && <InfoRow label="ملاحظات" value={student.notes} />}
        </div>
      </div>
    </div>
  )
}
