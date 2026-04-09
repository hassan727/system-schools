import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react'
import { studentService, type Student } from '../services/student.service'
import { DataTable, type Column } from '../../../../shared/components/ui/DataTable'
import { Badge } from '../../../../shared/components/ui/Badge'
import { Button } from '../../../../shared/components/ui/Button'
import { Avatar } from '../../../../shared/components/ui/Avatar'
import { PermissionGuard } from '../../../../shared/components/guards/PermissionGuard'

type StatusVariant = 'success' | 'warning' | 'danger' | 'neutral'

const statusVariant: Record<string, StatusVariant> = {
  active: 'success', inactive: 'neutral', graduated: 'info' as StatusVariant, transferred: 'warning',
}
const statusLabel: Record<string, string> = {
  active: 'نشط', inactive: 'غير نشط', graduated: 'متخرج', transferred: 'محوّل',
}

export function StudentsListPage() {
  const { t, i18n } = useTranslation('common')
  const navigate = useNavigate()
  const qc = useQueryClient()
  const isAr = i18n.language === 'ar'
  const [statusFilter, setStatusFilter] = useState('')

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students', statusFilter],
    queryFn: () => studentService.list({ status: statusFilter || undefined }),
  })

  const deleteMutation = useMutation({
    mutationFn: studentService.softDelete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }),
  })

  const columns: Column<Student>[] = [
    {
      key: 'profile',
      header: 'الطالب',
      render: (row) => {
        const name = isAr
          ? `${row.profile?.first_name_ar ?? ''} ${row.profile?.last_name_ar ?? ''}`
          : `${row.profile?.first_name_en ?? row.profile?.first_name_ar ?? ''} ${row.profile?.last_name_en ?? row.profile?.last_name_ar ?? ''}`
        return (
          <div className="flex items-center gap-3">
            <Avatar src={row.profile?.avatar_url} name={name} size="sm" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{name}</p>
              <p className="text-xs text-gray-400">{row.student_no}</p>
            </div>
          </div>
        )
      },
    },
    {
      key: 'grade_level',
      header: 'المرحلة',
      sortable: true,
      render: (row) => <span className="text-sm">{row.grade_level ?? '—'}</span>,
    },
    {
      key: 'enrollment_date',
      header: 'تاريخ التسجيل',
      sortable: true,
      render: (row) => (
        <span className="text-sm text-gray-500">
          {new Date(row.enrollment_date).toLocaleDateString(isAr ? 'ar-SA' : 'en-US')}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'الحالة',
      render: (row) => (
        <Badge variant={statusVariant[row.status] ?? 'neutral'}>
          {statusLabel[row.status] ?? row.status}
        </Badge>
      ),
    },
    {
      key: 'id',
      header: 'إجراءات',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(`/academic/students/${row.id}`)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition"
            title={t('actions.view')}
          >
            <Eye className="w-4 h-4" />
          </button>
          <PermissionGuard permission="academic.students.update">
            <button
              onClick={() => navigate(`/academic/students/${row.id}/edit`)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition"
              title={t('actions.edit')}
            >
              <Pencil className="w-4 h-4" />
            </button>
          </PermissionGuard>
          <PermissionGuard permission="academic.students.delete">
            <button
              onClick={() => {
                if (confirm('هل أنت متأكد من حذف هذا الطالب؟')) {
                  deleteMutation.mutate(row.id)
                }
              }}
              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition"
              title={t('actions.delete')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </PermissionGuard>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">إدارة الطلاب</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{students.length} طالب مسجّل</p>
        </div>
        <PermissionGuard permission="academic.students.create">
          <Button size="sm" onClick={() => navigate('/academic/students/new')}>
            <Plus className="w-4 h-4" />
            إضافة طالب
          </Button>
        </PermissionGuard>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['', 'active', 'inactive', 'graduated', 'transferred'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={[
              'px-3 py-1.5 rounded-lg text-xs font-medium transition border',
              statusFilter === s
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400',
            ].join(' ')}
          >
            {s === '' ? 'الكل' : statusLabel[s]}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
        <DataTable
          columns={columns}
          data={students as unknown as Record<string, unknown>[]}
          loading={isLoading}
          keyExtractor={(row) => row.id as string}
          emptyTitle="لا يوجد طلاب"
          emptyDescription="ابدأ بإضافة طالب جديد"
        />
      </div>
    </div>
  )
}
