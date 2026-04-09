import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard, Building2, ShieldCheck, Settings, ChevronLeft, ChevronRight, X,
} from 'lucide-react'
import { useUIStore } from '../../stores/ui.store'

interface NavItem {
  labelKey: string
  icon: React.ReactNode
  path: string
}

const NAV_ITEMS: NavItem[] = [
  { labelKey: 'nav.dashboard',  icon: <LayoutDashboard className="w-5 h-5" />, path: '/dashboard' },
  { labelKey: 'nav.tenants',    icon: <Building2 className="w-5 h-5" />,       path: '/tenants' },
  { labelKey: 'nav.auditLogs',  icon: <ShieldCheck className="w-5 h-5" />,     path: '/audit-logs' },
  { labelKey: 'nav.settings',   icon: <Settings className="w-5 h-5" />,        path: '/settings' },
]

interface AdminSidebarProps {
  onClose?: () => void
}

export function AdminSidebar({ onClose }: AdminSidebarProps) {
  const { t, i18n } = useTranslation('common')
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const isRTL = i18n.language === 'ar'

  const CollapseIcon = isRTL
    ? (sidebarCollapsed ? ChevronLeft : ChevronRight)
    : (sidebarCollapsed ? ChevronRight : ChevronLeft)

  return (
    <aside className={[
      'flex flex-col h-full bg-white dark:bg-gray-900 border-e border-gray-200 dark:border-gray-800 transition-all duration-300',
      sidebarCollapsed ? 'w-16' : 'w-64',
    ].join(' ')}>
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
              S
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {t('app.name')}
            </span>
          </div>
        )}

        {onClose ? (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
            <X className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
          >
            <CollapseIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) => [
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
              isActive
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white',
              sidebarCollapsed ? 'justify-center' : '',
            ].join(' ')}
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
