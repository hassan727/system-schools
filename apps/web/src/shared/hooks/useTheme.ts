import { useUIStore } from '../stores/ui.store'

export function useTheme() {
  const { theme, setTheme, toggleTheme } = useUIStore()
  return { theme, setTheme, toggleTheme, isDark: theme === 'dark' }
}
