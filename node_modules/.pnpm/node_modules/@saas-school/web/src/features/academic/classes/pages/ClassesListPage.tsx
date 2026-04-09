import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Trash2, Users } from 'lucide-react'
import { classService, type Class } from '../services/class.service'
import { DataTable, type Column } from '../../../../shared/components/ui/DataTable'
import { Badge } from '../../../../shared/components/ui/Badge'
import { Button } from '../../../../shared/components/ui/Button'
import { Modal } from '../../../../shared/components/ui/Modal'
import { ClassForm } from '../components/ClassForm'
import { PermissionGuard } from '../../../../shared/components/guards/PermissionGuard'

export function ClassesListPage() {
  const { t, i18n } = useTranslation('common')
  const isAr = i18n.language === 'ar'
  const qc = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)
  const [editClass, setEditClass] = useState<Class | null>(null)
  const [yearFilter, setYearFilter] = useState('')

  const { data: years = [] } = useQuery({
    queryKey: ['academic-years'],
    queryFn: classService.listAcademicYears,
  })

  const { data: classes = [], isLoading } = useQuery({
    queryKey: ['classes', yearFilter],
    queryFn: () => classService.list(yearFilter || undefined),
  })

  const deleteMutation = useMutation({
    mutationFn: classService.softDelete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classes'] }),
  })

  const columns: Column<Class>[] = [
    {
      key: 'name_ar',
      header: 'الفصل',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {isAr ? row.name_ar : (row.name_en ?? row.name_ar)}
          </p>
          <p className="text-xs text-gray-400">{row.grade_level}</p>
        </div>
      ),
    },
    {
      key: 'academic_year',
      header: 'السنة الدراسية',
      render: (row) => <span className="text-sm">{(row.academic_year as { name: string } | undefined)?.name ?? '—'}</span>,
    },
    {
      key: 'enrollment_count',
      header: 'الطلاب',
      render: (row) => {
        const count = row.enrollment_count ?? 0
        const isFull = count >= row.capacity
        return (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className={`text-sm font-medium ${isFull ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
              {count} / {row.capacity}
            </span>
            {isFull && <Badge variant="danger">ممتلئ</Badge>}
          </div>
        )
      },
    },
    {
      key: 'room',
      header: 'القاعة',
      render: (row) => <span className="text-sm text-gray-500">{row.room ?? '—'}</span>,
    },
    {
      key: 'id',
      header: 'إجراءات',
      render: (row) => (
        <div className="flex items-center gap-1">
          <PermissionGuard permission="academic.classes.update">
            <button
              onClick={() => { setEditClass(row); setFormOpen(true) }}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition"
              title={t('actions.edit')}
            >
              <Pencil className="w-4 h-4" />
            </button>
          </PermissionGuard>
          <PermissionGuard permission="academic.classes.delete">
            <button
              onClick={() => { if (confirm('حذف هذا الفصل؟')) deleteMutation.mutate(row.id) }}
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
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">إدارة الفصول</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{classes.length} فصل</p>
        </div>
        <PermissionGuard permission="academic.classes.create">
          <Button size="sm" onClick={() => { setEditClass(null); setFormOpen(true) }}>
            <Plus className="w-4 h-4" />
            إضافة فصل
          </Button>
        </PermissionGuard>
      </div>

      {/* Year filter */}
      {years.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setYearFilter('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${yearFilter === '' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'}`}
          >
            كل السنوات
          </button>
          {years.map((y) => (
            <button
              key={y.id}
              onClick={() => setYearFilter(y.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${yearFilter === y.id ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'}`}
            >
              {y.name} {y.is_current && '(الحالية)'}
            </button>
          ))}
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
        <DataTable
          columns={columns}
          data={classes as unknown as Record<string, unknown>[]}
          loading={isLoading}
          keyExtractor={(row) => row.id as string}
          emptyTitle="لا توجد فصول"
          emptyDescription="ابدأ بإضافة فصل دراسي"
        />
      </div>

      <Modal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditClass(null) }}
        title={editClass ? 'تعديل الفصل' : 'إضافة فصل جديد'}
      >
        <ClassForm
          cls={editClass}
          years={years}
          onClose={() => { setFormOpen(false); setEditClass(null) }}
        />
      </Modal>
    </div>
  )
}
