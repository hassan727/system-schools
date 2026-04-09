import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: import.meta.env.PROD,
    },
    mutations: {
      retry: 0,
    },
  },
})

export const STALE_TIME = {
  STATIC: 5 * 60 * 1000,
  DYNAMIC: 30 * 1000,
  REALTIME: 0,
} as const
