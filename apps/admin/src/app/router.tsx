import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '../shared/stores/auth.store'
import { AdminLayout } from '../shared/components/layout/AdminLayout'
import { Spinner } from '../shared/components/ui/Spinner'

const AdminLoginPage   = lazy(() => import('../features/auth/pages/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })))
const SystemDashboard  = lazy(() => import('../features/system/pages/SystemDashboard').then((m) => ({ default: m.SystemDashboard })))
const TenantsListPage  = lazy(() => import('../features/tenants/pages/TenantsListPage').then((m) => ({ default: m.TenantsListPage })))
const AuditLogsPage    = lazy(() => import('../features/audit/pages/AuditLogsPage').then((m) => ({ default: m.AuditLogsPage })))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  )
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore()
  if (isLoading) return <PageLoader />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

export function AdminRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<AdminLoginPage />} />

          <Route
            path="/*"
            element={
              <RequireAuth>
                <AdminLayout>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route index element={<Navigate to="/dashboard" replace />} />
                      <Route path="dashboard"  element={<SystemDashboard />} />
                      <Route path="tenants"    element={<TenantsListPage />} />
                      <Route path="audit-logs" element={<AuditLogsPage />} />
                      <Route path="*"          element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </Suspense>
                </AdminLayout>
              </RequireAuth>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
