import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard, Users, BookOpen, GraduationCap, ClipboardList,
  Calendar, UserCheck, DollarSign, FileText, BarChart2,
  Settings, ChevronLeft, ChevronRight, X,
} from 'lucide-react'
import { useUIStore } from '../../stores/ui.store'
import { useTenantStore } from '../../stores/tenant.store'
import { usePermissions } from '../../hooks/usePermissions'
import { useModules } from '../../hooks/useModules'

interface NavItem {
  labelKey: string
  icon: React.ReactNode
  path: string
  permission?: string
  module?: string
}

const NAV_ITEMS: NavItem[] = [
  { labelKey: 'nav.dashboard',  icon: <LayoutDashboard className="w-5 h-5" />, path: '/dashboard' },
  // Academic
  { labelKey: 'nav.students',   icon: <Users className="w-5 h-5" />,           path: '/academic/students',  permission: 'academic.students.read',  module: 'academic' },
  { labelKey: 'nav.classes',    icon: <BookOpen className="w-5 h-5" />,         path: '/academic/classes',   permission: 'academic.classes.read',   module: 'academic' },
  { labelKey: 'nav.subjects',   icon: <GraduationCap className="w-5 h-5" />,   path: '/academic/subjects',  permission: 'academic.subjects.read',  module: 'academic' },
  { labelKey: 'nav.exams',      icon: <ClipboardList className="w-5 h-5" />,   path: '/academic/exams',     permission: 'academic.exams.read',     module: 'academic' },
  { labelKey: 'nav.timetable',  icon: <Calendar className="w-5 h-5" />,        path: '/scheduling/timetable', permission: 'academic.timetable.read', module: 'scheduling' },
  // HR
  { labelKey: 'nav.employees',  icon: <UserCheck className="w-5 h-5" />,       path: '/hr/employees',       permission: 'hr.employees.read',       module: 'hr' },
  { labelKey: 'nav.attendance', icon: <ClipboardList className="w-5 h-5" />,   path: '/hr/attendance',      permission: 'hr.attendance.read',      module: 'hr' },
  { labelKey: 'nav.salaries',   icon: <DollarSign className="w-5 h-5" />,      path: '/hr/salaries',        permission: 'hr.salaries.read',        module: 'hr' },
  // Finance
  { labelKey: 'nav.invoices',   icon: <FileText className="w-5 h-5" />,        path: '/finance/invoices',   permission: 'finance.invoices.read',   module: 'finance' },
  { labelKey: 'nav.payments',   icon: <DollarSign className="w-5 h-5" />,      path: '/finance/payments',   permission: 'finance.payments.read',   module: 'finance' },
  // Reports
  { labelKey: 'nav.reports',    icon: <BarChart2 className="w-5 h-5" />,       path: '/reports',            permission: 'reports.academic.read',   module: 'reports' },
  // Settings
  { labelKey: 'nav.settings',   icon: <Settings className="w-5 h-5" />,        path: '/settings',           permission: 'system.settings.manage' },
]

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const { t, i18n } = useTranslation('common')
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const { tenantConfig } = useTenantStore()
  const { hasPermission } = usePermissions()
  const { isModuleEnabled } = useModules()
  const isRTL = i18n.language === 'ar'

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.module && !isModuleEnabled(item.module as never)) return false
    if (item.permission && !hasPermission(item.permission)) return false
    return true
  })

  const CollapseIcon = isRTL
    ? (sidebarCollapsed ? ChevronLeft : ChevronRight)
    : (sidebarCollapsed ? ChevronRight : ChevronLeft)

  return (
    <aside
      className={[
        'flex flex-col h-full bg-white dark:bg-gray-900 border-e border-gray-200 dark:border-gray-800 transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-64',
      ].join(' ')}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2 min-w-0">
            {tenantConfig?.logoUrl ? (
              <img src={tenantConfig.logoUrl} alt="" className="w-8 h-8 rounded-lg object-contain shrink-0" />
            ) : (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
                style={{ backgroundColor: tenantConfig?.primaryColor ?? '#2563eb' }}
              >
                {tenantConfig?.nameAr?.[0] ?? 'S'}
              </div>
            )}
            <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {tenantConfig?.nameAr ?? t('app.name')}
            </span>
          </div>
        )}

        {/* Mobile close */}
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Desktop collapse toggle */}
        {!onClose && (
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
            aria-label={sidebarCollapsed ? 'توسيع القائمة' : 'طي القائمة'}
          >
            <CollapseIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white',
                sidebarCollapsed ? 'justify-center' : '',
              ].join(' ')
            }
            title={sidebarCollapsed ? t(item.labelKey) : undefined}
          >
            <span className="shrink-0">{item.icon}</span>
            {!sidebarCollapsed && <span className="truncate">{t(item.labelKey)}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
