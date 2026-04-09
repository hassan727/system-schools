import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Cairo', 'Inter', 'sans-serif'],
        arabic: ['Cairo', 'sans-serif'],
        latin: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: 'var(--color-primary, #2563eb)',
        secondary: 'var(--color-secondary, #9333ea)',
      },
    },
  },
  plugins: [forms],
}

export default config
