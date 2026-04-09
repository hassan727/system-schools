import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Layers, PauseCircle, PlayCircle } from 'lucide-react'
import { tenantService, type Tenant } from '../services/tenant.service'
import { DataTable, type Column } from '../../../shared/components/ui/DataTable'
import { Badge } from '../../../shared/components/ui/Badge'
import { Button } from '../../../shared/components/ui/Button'
import { Modal } from '../../../shared/components/ui/Modal'
import { TenantForm } from '../components/TenantForm'
import { ModuleToggle } from '../components/ModuleToggle'

type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral'

const statusVariant: Record<string, BadgeVariant> = {
  active: 'success', trial: 'warning', suspended: 'danger', expired: 'neutral',
}

const statusLabel: Record<string, string> = {
  active: 'نشط', trial: 'تجريبي', suspended: 'معلق', expired: 'منتهي',
}

export function TenantsListPage() {
  const { t } = useTranslation('common')
  const qc = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)
  const [editTenant, setEditTenant] = useState<Tenant | null>(null)
  const [moduleTenant, setModuleTenant] = useState<Tenant | null>(null)

  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ['tenants'],
    queryFn: tenantService.list,
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'suspended' }) =>
      tenantService.setStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tenants'] }),
  })

  const columns: Column<Tenant>[] = [
    {
      key: 'name_ar',
      header: t('tenants.name'),
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{row.name_ar}</p>
          {row.name_en && <p className="text-xs text-gray-400">{row.name_en}</p>}
        </div>
      ),
    },
    {
      key: 'subdomain',
      header: t('tenants.subdomain'),
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
          {row.subdomain}
        </span>
      ),
    },
    {
      key: 'status',
      header: t('tenants.status'),
      render: (row) => (
        <Badge variant={statusVariant[row.status] ?? 'neutral'}>
          {statusLabel[row.status] ?? row.status}
        </Badge>
      ),
    },
    {
      key: 'modules_enabled',
      header: t('tenants.modules'),
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {(row.modules_enabled ?? []).map((m) => (
            <span key={m} className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">
              {m}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'id',
      header: 'إجراءات',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setEditTenant(row); setFormOpen(true) }}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition"
            title={t('actions.edit')}
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => setModuleTenant(row)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition"
            title="إدارة الوحدات"
          >
            <Layers className="w-4 h-4" />
          </button>
          {row.status === 'active' ? (
            <button
              onClick={() => statusMutation.mutate({ id: row.id, status: 'suspended' })}
              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition"
              title={t('actions.suspend')}
            >
              <PauseCircle className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => statusMutation.mutate({ id: row.id, status: 'active' })}
              className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-green-500 transition"
              title={t('actions.activate')}
            >
              <PlayCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{t('tenants.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {tenants.length} مستأجر مسجّل
          </p>
        </div>
        <Button
          onClick={() => { setEditTenant(null); setFormOpen(true) }}
          size="sm"
        >
          <Plus className="w-4 h-4" />
          {t('tenants.add')}
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
        <DataTable
          columns={columns}
          data={tenants as unknown as Record<string, unknown>[]}
          loading={isLoading}
          keyExtractor={(row) => row.id as string}
          emptyMessage="لا يوجد مستأجرون بعد"
        />
      </div>

      {/* Tenant Form Modal */}
      <Modal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditTenant(null) }}
        title={editTenant ? 'تعديل المستأجر' : 'إضافة مستأجر جديد'}
        size="lg"
      >
        <TenantForm
          tenant={editTenant}
          onClose={() => { setFormOpen(false); setEditTenant(null) }}
        />
      </Modal>

      {/* Module Toggle Modal */}
      <Modal
        open={!!moduleTenant}
        onClose={() => setModuleTenant(null)}
        title={`إدارة وحدات: ${moduleTenant?.name_ar ?? ''}`}
      >
        {moduleTenant && (
          <ModuleToggle
            tenantId={moduleTenant.id}
            enabledModules={moduleTenant.modules_enabled ?? []}
            onClose={() => setModuleTenant(null)}
          />
        )}
      </Modal>
    </div>
  )
}
