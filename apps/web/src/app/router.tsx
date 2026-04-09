import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthGuard } from '../shared/components/guards/AuthGuard'
import { AppLayout } from '../shared/components/layout/AppLayout'
import { ModuleGuard } from '../shared/components/guards/ModuleGuard'
import { PermissionGuard } from '../shared/components/guards/PermissionGuard'

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function S({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

// Auth
const LoginPage = lazy(() => import('../features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })))

// Dashboard placeholder
const DashboardPage = lazy(() =>
  import('../features/dashboard/pages/DashboardPage')
    .then((m) => ({ default: m.DashboardPage }))
    .catch(() => ({ default: () => <div className="p-8 text-gray-500">Dashboard — coming soon</div> }))
)

// Academic — Students
const StudentsListPage  = lazy(() => import('../features/academic/students/pages/StudentsListPage').then((m) => ({ default: m.StudentsListPage })))
const StudentFormPage   = lazy(() => import('../features/academic/students/pages/StudentFormPage').then((m) => ({ default: m.StudentFormPage })))
const StudentDetailPage = lazy(() => import('../features/academic/students/pages/StudentDetailPage').then((m) => ({ default: m.StudentDetailPage })))

// Academic — Classes
const ClassesListPage = lazy(() => import('../features/academic/classes/pages/ClassesListPage').then((m) => ({ default: m.ClassesListPage })))

// Academic — Subjects
const SubjectsListPage = lazy(() => import('../features/academic/subjects/pages/SubjectsListPage').then((m) => ({ default: m.SubjectsListPage })))

function Protected({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AppLayout>
        <S>{children}</S>
      </AppLayout>
    </AuthGuard>
  )
}

export const router = createBrowserRouter([
  // Public
  { path: '/auth/login', element: <S><LoginPage /></S> },
  { path: '/auth/callback', element: <Navigate to="/dashboard" replace /> },

  // Dashboard
  { path: '/', element: <Protected><DashboardPage /></Protected> },
  { path: '/dashboard', element: <Protected><DashboardPage /></Protected> },

  // Academic — Students
  {
    path: '/academic/students',
    element: (
      <Protected>
        <ModuleGuard module="academic">
          <PermissionGuard permission="academic.students.read">
            <StudentsListPage />
          </PermissionGuard>
        </ModuleGuard>
      </Protected>
    ),
  },
  {
    path: '/academic/students/new',
    element: (
      <Protected>
        <ModuleGuard module="academic">
          <PermissionGuard permission="academic.students.create">
            <StudentFormPage />
          </PermissionGuard>
        </ModuleGuard>
      </Protected>
    ),
  },
  {
    path: '/academic/students/:id',
    element: (
      <Protected>
        <ModuleGuard module="academic">
          <PermissionGuard permission="academic.students.read">
            <StudentDetailPage />
          </PermissionGuard>
        </ModuleGuard>
      </Protected>
    ),
  },
  {
    path: '/academic/students/:id/edit',
    element: (
      <Protected>
        <ModuleGuard module="academic">
          <PermissionGuard permission="academic.students.update">
            <StudentFormPage />
          </PermissionGuard>
        </ModuleGuard>
      </Protected>
    ),
  },

  // Academic — Classes
  {
    path: '/academic/classes',
    element: (
      <Protected>
        <ModuleGuard module="academic">
          <PermissionGuard permission="academic.classes.read">
            <ClassesListPage />
          </PermissionGuard>
        </ModuleGuard>
      </Protected>
    ),
  },

  // Academic — Subjects
  {
    path: '/academic/subjects',
    element: (
      <Protected>
        <ModuleGuard module="academic">
          <PermissionGuard permission="academic.subjects.read">
            <SubjectsListPage />
          </PermissionGuard>
        </ModuleGuard>
      </Protected>
    ),
  },

  // Upgrade page
  { path: '/upgrade', element: <Protected><div className="p-8 text-center text-gray-500">صفحة الترقية — قريباً</div></Protected> },

  // Catch-all
  { path: '*', element: <Navigate to="/dashboard" replace /> },
])
