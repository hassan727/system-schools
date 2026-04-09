import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { useUIStore } from '../../stores/ui.store'
import { AdminSidebar } from './AdminSidebar'
import { AdminHeader } from './AdminHeader'

export function AdminLayout({ children }: { children: ReactNode }) {
  const { sidebarOpen, setSidebarOpen } = useUIStore()

  // أغلق الـ mobile sidebar لما الشاشة تكبر لـ desktop
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const handler = (e: MediaQueryListEvent) => { if (e.matches) setSidebarOpen(false) }
    mq.addEventListener('change', handler)
    // أغلق عند أول تحميل لو الشاشة desktop
    if (mq.matches) setSidebarOpen(false)
    return () => mq.removeEventListener('change', handler)
  }, [setSidebarOpen])

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex shrink-0">
        <AdminSidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
          <div className="fixed inset-y-0 start-0 z-40 lg:hidden">
            <AdminSidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
