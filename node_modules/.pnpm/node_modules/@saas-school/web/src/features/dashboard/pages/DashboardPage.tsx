import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../../shared/stores/auth.store'
import { GraduationCap, Users, BookOpen, LayoutDashboard } from 'lucide-react'

function StatCard({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{value}</p>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { i18n } = useTranslation()
  const { user } = useAuthStore()
  const isAr = i18n.language === 'ar'

  const greeting = isAr ? 'مرحباً' : 'Welcome'
  const name = user?.profile
    ? `${user.profile.firstName} ${user.profile.lastName}`
    : user?.email ?? ''

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-1">
          <LayoutDashboard className="w-5 h-5 opacity-80" />
          <span className="text-sm opacity-80">{isAr ? 'لوحة التحكم' : 'Dashboard'}</span>
        </div>
        <h1 className="text-2xl font-bold">{greeting}، {name}</h1>
        <p className="text-sm opacity-80 mt-1">
          {isAr ? 'مرحباً بك في نظام إدارة المدرسة' : 'Welcome to the School Management System'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title={isAr ? 'إجمالي الطلاب' : 'Total Students'}
          value="—"
          icon={<GraduationCap className="w-6 h-6 text-blue-600" />}
          color="bg-blue-50 dark:bg-blue-900/20"
        />
        <StatCard
          title={isAr ? 'الموظفون' : 'Employees'}
          value="—"
          icon={<Users className="w-6 h-6 text-purple-600" />}
          color="bg-purple-50 dark:bg-purple-900/20"
        />
        <StatCard
          title={isAr ? 'الفصول الدراسية' : 'Classes'}
          value="—"
          icon={<BookOpen className="w-6 h-6 text-green-600" />}
          color="bg-green-50 dark:bg-green-900/20"
        />
      </div>

      {/* Quick links */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          {isAr ? 'روابط سريعة' : 'Quick Links'}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: isAr ? 'الطلاب' : 'Students', path: '/academic/students', icon: <GraduationCap className="w-5 h-5" /> },
            { label: isAr ? 'الفصول' : 'Classes', path: '/academic/classes', icon: <BookOpen className="w-5 h-5" /> },
            { label: isAr ? 'المواد' : 'Subjects', path: '/academic/subjects', icon: <BookOpen className="w-5 h-5" /> },
            { label: isAr ? 'الموظفون' : 'Employees', path: '/hr/employees', icon: <Users className="w-5 h-5" /> },
          ].map((item) => (
            <a
              key={item.path}
              href={item.path}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              {item.icon}
              <span className="text-xs font-medium">{item.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
