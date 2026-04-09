import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../services/supabase'

const MAX_FAILED_ATTEMPTS = 5
const LOCK_DURATION_MS = 15 * 60 * 1000

export interface AdminUser {
  id: string
  email: string
  roles: string[]
  permissions: string[]
}

interface AuthState {
  user: AdminUser | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  failedAttempts: number
  lockedUntil: number | null

  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  initialize: () => Promise<void>
}

function parseJwtClaims(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return {}
  }
}

function buildAdminUser(supabaseUser: User, session: Session): AdminUser {
  const claims = parseJwtClaims(session.access_token)
  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? '',
    roles: claims.roles ?? [],
    permissions: claims.permissions ?? [],
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
      failedAttempts: 0,
      lockedUntil: null,

      initialize: async () => {
        set({ isLoading: true })
        try {
          const { data } = await supabase.auth.getSession()
          if (data.session) {
            const user = buildAdminUser(data.session.user, data.session)
            set({ user, session: data.session, isAuthenticated: true, isLoading: false })
          } else {
            set({ isLoading: false })
          }
        } catch {
          set({ isLoading: false })
        }

        supabase.auth.onAuthStateChange((_event, session) => {
          if (session) {
            const user = buildAdminUser(session.user, session)
            set({ user, session, isAuthenticated: true })
          } else {
            set({ user: null, session: null, isAuthenticated: false })
          }
        })
      },

      login: async (email, password) => {
        const { lockedUntil, failedAttempts } = get()
        if (lockedUntil && Date.now() < lockedUntil) {
          const mins = Math.ceil((lockedUntil - Date.now()) / 60000)
          throw new Error(`الحساب مقفل. حاول بعد ${mins} دقيقة`)
        }

        set({ isLoading: true })
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
          const attempts = failedAttempts + 1
          set({
            isLoading: false,
            failedAttempts: attempts,
            lockedUntil: attempts >= MAX_FAILED_ATTEMPTS ? Date.now() + LOCK_DURATION_MS : null,
          })
          throw new Error(error.message)
        }

        const user = buildAdminUser(data.user, data.session)

        // التحقق من دور super_admin من قاعدة البيانات مباشرة (service role bypass RLS)
        const { data: roleCheck } = await supabase
          .rpc('has_super_admin_role', { p_user_id: data.user.id })

        const isSuperAdmin = roleCheck === true || user.roles.includes('super_admin')

        if (!isSuperAdmin) {
          await supabase.auth.signOut()
          set({ isLoading: false })
          throw new Error('غير مصرح. هذه اللوحة للمشرفين العامين فقط.')
        }

        if (!user.roles.includes('super_admin')) user.roles.push('super_admin')
        set({ user, session: data.session, isAuthenticated: true, isLoading: false, failedAttempts: 0, lockedUntil: null })
      },

      logout: async () => {
        await supabase.auth.signOut()
        set({ user: null, session: null, isAuthenticated: false, failedAttempts: 0, lockedUntil: null })
      },
    }),
    {
      name: 'admin-auth',
      partialize: (s) => ({ user: s.user, failedAttempts: s.failedAttempts, lockedUntil: s.lockedUntil }),
    }
  )
)
