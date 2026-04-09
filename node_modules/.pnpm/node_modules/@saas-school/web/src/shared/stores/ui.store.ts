import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'
type Language = 'ar' | 'en'

interface UIState {
  theme: Theme
  language: Language
  sidebarCollapsed: boolean
  sidebarOpen: boolean // mobile

  // Actions
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setLanguage: (lang: Language) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else if (theme === 'light') {
    root.classList.remove('dark')
  } else {
    // system
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.classList.toggle('dark', prefersDark)
  }
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      language: 'ar',
      sidebarCollapsed: false,
      sidebarOpen: false,

      setTheme: (theme) => {
        applyTheme(theme)
        set({ theme })
      },

      toggleTheme: () => {
        const current = get().theme
        const next: Theme = current === 'light' ? 'dark' : 'light'
        applyTheme(next)
        set({ theme: next })
      },

      setLanguage: (language) => {
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
        document.documentElement.lang = language
        set({ language })
      },

      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme)
      },
    }
  )
)
