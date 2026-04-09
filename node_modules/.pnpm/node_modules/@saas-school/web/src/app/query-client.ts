import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 5 minutes stale time for relatively static data
      staleTime: 5 * 60 * 1000,
      // 10 minutes cache time
      gcTime: 10 * 60 * 1000,
      // Retry once on failure
      retry: 1,
      // Don't refetch on window focus in development
      refetchOnWindowFocus: import.meta.env.PROD,
    },
    mutations: {
      retry: 0,
    },
  },
})

/** Stale times for different data types */
export const STALE_TIME = {
  /** Static data: roles, permissions, tenant config — 5 minutes */
  STATIC: 5 * 60 * 1000,
  /** Dynamic data: notifications, attendance — 30 seconds */
  DYNAMIC: 30 * 1000,
  /** Real-time data: never stale */
  REALTIME: 0,
} as const
