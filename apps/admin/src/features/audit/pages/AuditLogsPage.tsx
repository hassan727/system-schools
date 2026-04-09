import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../shared/services/supabase'
import { DataTable, type Column } from '../../../shared/components/ui/DataTable'
import { Badge } from '../../../shared/components/ui/Badge'

interface AuditLog {
  id: string
  tenant_id: string
  user_id: string
  action: string
  resource_type: string
  resource_id: string | null
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
  // joined
  tenant_name?: string
  user_email?: string
}

type ActionVariant = 'success' | 'danger' | 'warning' | 'info' | 'neutral'

const actionVariant = (action: string): ActionVariant => {
  if (action.includes('DELETE') || action.includes('delete')) return 'danger'
  if (action.includes('CREATE') || action.includes('insert')) return 'success'
  if (action.includes('UPDATE') || action.includes('update')) return 'warning'
  return 'info'
}

async function fetchAuditLogs(filters: { tenantId: string; action: string; from: string; to: string }) {
  let query = supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500)

  if (filters.tenantId) query = query.eq('tenant_id', filters.tenantId)
  if (filters.action) query = query.ilike('action', `%${filters.action}%`)
  if (filters.from) query = query.gte('created_at', filters.from)
  if (filters.to) query = query.lte('created_at', filters.to + 'T23:59:59')

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []) as AuditLog[]
}

export function AuditLogsPage() {
  const [tenantId, setTenantId] = useState('')
  const [action, setAction] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['audit-logs', tenantId, action, from, to],
    queryFn: () => fetchAuditLogs({ tenantId, action, from, to }),
  })

  const columns: Column<AuditLog>[] = [
    {
      key: 'created_at',
      header: 'التاريخ',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-gray-500 whitespace-nowrap">
          {new Date(row.created_at).toLocaleString('ar-SA')}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'الإجراء',
      render: (row) => (
        <Badge variant={actionVariant(row.action)}>
          {row.action}
        </Badge>
      ),
    },
    {
      key: 'resource_type',
      header: 'المورد',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-medium text-gray-700 dark:text-gray-300">{row.resource_type}</span>
          {row.resource_id && (
            <p className="text-xs text-gray-400 font-mono">{row.resource_id}</p>
          )}
        </div>
      ),
    },
    {
      key: 'user_id',
      header: 'المستخدم',
      render: (row) => (
        <span className="font-mono text-xs text-gray-500">{row.user_id?.slice(0, 8)}…</span>
      ),
    },
    {
      key: 'ip_address',
      header: 'IP',
      render: (row) => (
        <span className="font-mono text-xs text-gray-400">{row.ip_address ?? '—'}</span>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">سجلات التدقيق</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">مراقبة جميع العمليات الحساسة في النظام</p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">معرف المستأجر</label>
            <input
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              placeholder="UUID..."
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">نوع الإجراء</label>
            <input
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="INSERT, UPDATE..."
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">من تاريخ</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">إلى تاريخ</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
        <DataTable
          columns={columns}
          data={logs as unknown as Record<string, unknown>[]}
          loading={isLoading}
          keyExtractor={(row) => row.id as string}
          emptyMessage="لا توجد سجلات تدقيق"
          searchable={false}
        />
      </div>
    </div>
  )
}
