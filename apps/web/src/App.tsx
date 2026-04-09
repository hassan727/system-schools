import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Providers } from './app/providers'
import { router } from './app/router'
import { useAuthStore } from './shared/stores/auth.store'
import { useTenantStore } from './shared/stores/tenant.store'

function AppContent() {
  const { i18n } = useTranslation()
  const { initialize } = useAuthStore()
  const { loadTenant } = useTenantStore()

  useEffect(() => {
    initialize()
    loadTenant()
  }, [initialize, loadTenant])

  // Apply RTL/LTR direction to document
  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = i18n.language
  }, [i18n.language])

  return <RouterProvider router={router} />
}

function App() {
  return (
    <Providers>
      <AppContent />
    </Providers>
  )
}

export default App
