import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { subjectService, type Subject } from '../services/subject.service'
import { classService } from '../../classes/services/class.service'
import { DataTable, type Column } from '../../../../shared/components/ui/DataTable'
import { Button } from '../../../../shared/components/ui/Button'
import { Modal } from '../../../../shared/components/ui/Modal'
import { SubjectForm } from '../components/SubjectForm'
import { PermissionGuard } from '../../../../shared/components/guards/PermissionGuard'

export function SubjectsListPage() {
  const { t, i18n } = useTranslation('common')
  const isAr = i18n.language === 'ar'
  const qc = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)
  const [editSubject, setEditSubject] = useState<Subject | null>(null)
  const [classFilter, setClassFilter] = useState('')

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classService.list(),
  })

  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ['subjects', classFilter],
    queryFn: () => subjectService.list(classFilter || undefined),
  })

  const deleteMutation = useMutation({
    mutationFn: subjectService.softDelete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subjects'] }),
  })

  const columns: Column<Subject>[] = [
    {
      key: 'name_ar',
      header: 'المادة',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {isAr ? row.name_ar : (row.name_en ?? row.name_ar)}
          </p>
          {row.code && <p className="text-xs text-gray-400">{row.code}</p>}
        </div>
      ),
    },
    {
      key: 'class',
      header: 'الفصل',
      render: (row) => {
        const cls = row.class as { name_ar: string; name_en: string | null; grade_level: string } | undefined
        return (
          <div>
            <p className="text-sm">{isAr ? cls?.name_ar : (cls?.name_en ?? cls?.name_ar)}</p>
            <p className="text-xs text-gray-400">{cls?.grade_level}</p>
          </div>
        )
      },
    },
    {
      key: 'credits',
      header: 'الوحدات',
      render: (row) => <span className="text-sm">{row.credits}</span>,
    },
    {
      key: 'passing_grade',
      header: 'درجة النجاح',
      render: (row) => <span className="text-sm">{row.passing_grade}%</span>,
    },
    {
      key: 'id',
      header: 'إجراءات',
      render: (row) => (
        <div className="flex items-center gap-1">
          <PermissionGuard permission="academic.subjects.update">
            <button
              onClick={() => { setEditSubject(row); setFormOpen(true) }}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition"
              title={t('actions.edit')}
            >
              <Pencil className="w-4 h-4" />
            </button>
          </PermissionGuard>
          <PermissionGuard permission="academic.subjects.delete">
            <button
              onClick={() => { if (confirm('حذف هذه المادة؟')) deleteMutation.mutate(row.id) }}
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
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">إدارة المواد الدراسية</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subjects.length} مادة</p>
        </div>
        <PermissionGuard permission="academic.subjects.create">
          <Button size="sm" onClick={() => { setEditSubject(null); setFormOpen(true) }}>
            <Plus className="w-4 h-4" />
            إضافة مادة
          </Button>
        </PermissionGuard>
      </div>

      {classes.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setClassFilter('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${classFilter === '' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'}`}
          >
            كل الفصول
          </button>
          {classes.map((c) => (
            <button
              key={c.id}
              onClick={() => setClassFilter(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${classFilter === c.id ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'}`}
            >
              {isAr ? c.name_ar : (c.name_en ?? c.name_ar)}
            </button>
          ))}
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
        <DataTable
          columns={columns}
          data={subjects as unknown as Record<string, unknown>[]}
          loading={isLoading}
          keyExtractor={(row) => row.id as string}
          emptyTitle="لا توجد مواد دراسية"
          emptyDescription="ابدأ بإضافة مادة دراسية"
        />
      </div>

      <Modal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditSubject(null) }}
        title={editSubject ? 'تعديل المادة' : 'إضافة مادة جديدة'}
      >
        <SubjectForm
          subject={editSubject}
          classes={classes}
          onClose={() => { setFormOpen(false); setEditSubject(null) }}
        />
      </Modal>
    </div>
  )
}
