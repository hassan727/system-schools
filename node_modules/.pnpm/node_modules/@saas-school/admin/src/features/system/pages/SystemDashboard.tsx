import { useQuery } from '@tanstack/react-query'
import { Building2, Users, GraduationCap, Activity } from 'lucide-react'
import { supabase } from '../../../shared/services/supabase'
import { Spinner } from '../../../shared/components/ui/Spinner'
import { Badge } from '../../../shared/components/ui/Badge'

interface SystemStats {
  totalTenants: number
  activeTenants: number
  trialTenants: number
  suspendedTenants: number
  totalStudents: number
  totalEmployees: number
}

async function fetchStats(): Promise<SystemStats> {
  const [tenantsRes, studentsRes, employeesRes] = await Promise.all([
    supabase.from('tenants').select('status').is('deleted_at', null),
    supabase.from('students').select('id', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('employees').select('id', { count: 'exact', head: true }).is('deleted_at', null),
  ])

  const tenants = tenantsRes.data ?? []
  return {
    totalTenants: tenants.length,
    activeTenants: tenants.filter((t) => t.status === 'active').length,
    trialTenants: tenants.filter((t) => t.status === 'trial').length,
    suspendedTenants: tenants.filter((t) => t.status === 'suspended').length,
    totalStudents: studentsRes.count ?? 0,
    totalEmployees: employeesRes.count ?? 0,
  }
}

interface StatCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  color: string
  sub?: React.ReactNode
}

function StatCard({ title, value, icon, color, sub }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{value}</p>
        {sub && <div className="mt-1">{sub}</div>}
      </div>
    </div>
  )
}

export function SystemDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['system-stats'],
    queryFn: fetchStats,
    refetchInterval: 60_000,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">لوحة التحكم</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">نظرة عامة على حالة المنصة</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="إجمالي المستأجرين"
          value={stats?.totalTenants ?? 0}
          icon={<Building2 className="w-6 h-6 text-blue-600" />}
          color="bg-blue-50 dark:bg-blue-900/20"
          sub={
            <div className="flex flex-wrap gap-1">
              <Badge variant="success">{stats?.activeTenants} نشط</Badge>
              <Badge variant="warning">{stats?.trialTenants} تجريبي</Badge>
              {(stats?.suspendedTenants ?? 0) > 0 && (
                <Badge variant="danger">{stats?.suspendedTenants} معلق</Badge>
              )}
            </div>
          }
        />
        <StatCard
          title="إجمالي الطلاب"
          value={stats?.totalStudents ?? 0}
          icon={<GraduationCap className="w-6 h-6 text-purple-600" />}
          color="bg-purple-50 dark:bg-purple-900/20"
        />
        <StatCard
          title="إجمالي الموظفين"
          value={stats?.totalEmployees ?? 0}
          icon={<Users className="w-6 h-6 text-green-600" />}
          color="bg-green-50 dark:bg-green-900/20"
        />
        <StatCard
          title="حالة النظام"
          value="يعمل"
          icon={<Activity className="w-6 h-6 text-emerald-600" />}
          color="bg-emerald-50 dark:bg-emerald-900/20"
          sub={<Badge variant="success">جميع الخدمات تعمل</Badge>}
        />
      </div>

      {/* Recent activity placeholder */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">توزيع المستأجرين حسب الحالة</h2>
        <div className="flex flex-col gap-3">
          {[
            { label: 'نشط', count: stats?.activeTenants ?? 0, total: stats?.totalTenants ?? 1, color: 'bg-green-500' },
            { label: 'تجريبي', count: stats?.trialTenants ?? 0, total: stats?.totalTenants ?? 1, color: 'bg-yellow-500' },
            { label: 'معلق', count: stats?.suspendedTenants ?? 0, total: stats?.totalTenants ?? 1, color: 'bg-red-500' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-400 w-16 shrink-0">{item.label}</span>
              <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.color} transition-all`}
                  style={{ width: `${item.total > 0 ? (item.count / item.total) * 100 : 0}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-8 text-end">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
