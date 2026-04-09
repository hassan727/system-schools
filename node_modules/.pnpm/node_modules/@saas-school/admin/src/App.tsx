import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Providers } from './app/providers'
import { AdminRouter } from './app/router'
import { useAuthStore } from './shared/stores/auth.store'
import { useUIStore } from './shared/stores/ui.store'

function AppContent() {
  const { i18n } = useTranslation()
  const { initialize } = useAuthStore()
  const { theme } = useUIStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = i18n.language
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [i18n.language, theme])

  return <AdminRouter />
}

function App() {
  return (
    <Providers>
      <AppContent />
    </Providers>
  )
}

export default App
