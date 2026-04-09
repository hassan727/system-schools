import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LoginForm } from '../components/LoginForm'
import { useAuthStore } from '../../../shared/stores/auth.store'
import { useTenantStore } from '../../../shared/stores/tenant.store'

export function LoginPage() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { tenantConfig } = useTenantStore()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleLoginSuccess = () => {
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
          {/* Logo & School Name */}
          <div className="flex flex-col items-center mb-8">
            {tenantConfig?.logoUrl ? (
              <img
                src={tenantConfig.logoUrl}
                alt={tenantConfig.nameAr}
                className="h-16 w-16 rounded-xl object-contain mb-3"
              />
            ) : (
              <div
                className="h-16 w-16 rounded-xl flex items-center justify-center mb-3 text-white text-2xl font-bold"
                style={{ backgroundColor: tenantConfig?.primaryColor ?? '#2563eb' }}
              >
                {tenantConfig?.nameAr?.[0] ?? 'S'}
              </div>
            )}
            <h1 className="text-xl font-bold text-gray-900 dark:text-white text-center">
              {tenantConfig?.nameAr ?? t('app.name')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t('auth.welcomeBack')}
            </p>
          </div>

          {/* Form */}
          <LoginForm onSuccess={handleLoginSuccess} />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
          {t('app.poweredBy')}
        </p>
      </div>
    </div>
  )
}
