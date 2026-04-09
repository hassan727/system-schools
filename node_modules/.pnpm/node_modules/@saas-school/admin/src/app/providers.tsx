import { QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode, Suspense } from 'react'
import { queryClient } from './query-client'

interface ProvidersProps {
  children: ReactNode
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    </QueryClientProvider>
  )
}
