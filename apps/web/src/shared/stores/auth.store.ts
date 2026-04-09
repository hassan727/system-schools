import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../services/supabase'

const MAX_FAILED_ATTEMPTS = 5
const LOCK_DURATION_MS = 15 * 60 * 1000 // 15 minutes

export interface AuthProfile {
  id: string
  firstName: string
  lastName: string
  avatarUrl: string | null
  phone: string | null
}

export interface AuthUser {
  id: string
  email: string
  tenantId: string
  tenantSlug: string
  roles: string[]
  permissions: string[]
  profile: AuthProfile | null
}

interface AuthState {
  user: AuthUser | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  failedAttempts: number
  lockedUntil: number | null

  // Actions
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
  setUser: (user: AuthUser | null) => void
  initialize: () => Promise<void>
}

function parseJwtClaims(accessToken: string) {
  try {
    const payload = accessToken.split('.')[1]
    return JSON.parse(atob(payload))
  } catch {
    return {}
  }
}

async function buildAuthUser(supabaseUser: User, session: Session): Promise<AuthUser> {
  const claims = parseJwtClaims(session.access_token)

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, first_name_ar, last_name_ar, avatar_url, phone')
    .eq('user_id', supabaseUser.id)
    .single()

  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? '',
    tenantId: claims.tenant_id ?? '',
    tenantSlug: claims.tenant_slug ?? '',
    roles: claims.roles ?? [],
    permissions: claims.permissions ?? [],
    profile: profile
      ? {
          id: profile.id,
          firstName: profile.first_name_ar,
          lastName: profile.last_name_ar,
          avatarUrl: profile.avatar_url,
          phone: profile.phone,
        }
      : null,
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,
      failedAttempts: 0,
      lockedUntil: null,

      initialize: async () => {
        set({ isLoading: true })
        const { data } = await supabase.auth.getSession()
        if (data.session) {
          try {
            const user = await buildAuthUser(data.session.user, data.session)
            set({ user, session: data.session, isAuthenticated: true, isLoading: false })
          } catch {
            set({ user: null, session: null, isAuthenticated: false, isLoading: false })
          }
        } else {
          set({ isLoading: false })
        }

        // Listen for auth state changes
        supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session) {
            const user = await buildAuthUser(session.user, session)
            set({ user, session, isAuthenticated: true })
          } else if (event === 'SIGNED_OUT') {
            set({ user: null, session: null, isAuthenticated: false })
          } else if (event === 'TOKEN_REFRESHED' && session) {
            const user = await buildAuthUser(session.user, session)
            set({ user, session })
          }
        })
      },

      login: async (email, password) => {
        const { lockedUntil, failedAttempts } = get()

        // Check if account is locked
        if (lockedUntil && Date.now() < lockedUntil) {
          const minutesLeft = Math.ceil((lockedUntil - Date.now()) / 60000)
          throw new Error(`الحساب مقفل. حاول مرة أخرى بعد ${minutesLeft} دقيقة`)
        }

        set({ isLoading: true })

        const { data, error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
          const newAttempts = failedAttempts + 1
          const newLockedUntil = newAttempts >= MAX_FAILED_ATTEMPTS
            ? Date.now() + LOCK_DURATION_MS
            : null

          set({
            isLoading: false,
            failedAttempts: newAttempts,
            lockedUntil: newLockedUntil,
          })

          if (newLockedUntil) {
            throw new Error('تم قفل الحساب بسبب محاولات دخول متعددة فاشلة. حاول مرة أخرى بعد 15 دقيقة')
          }

          throw new Error(error.message)
        }

        const user = await buildAuthUser(data.user, data.session)
        set({
          user,
          session: data.session,
          isAuthenticated: true,
          isLoading: false,
          failedAttempts: 0,
          lockedUntil: null,
        })
      },

      loginWithGoogle: async () => {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        if (error) throw new Error(error.message)
      },

      logout: async () => {
        await supabase.auth.signOut()
        set({ user: null, session: null, isAuthenticated: false, failedAttempts: 0, lockedUntil: null })
      },

      refreshSession: async () => {
        const { data } = await supabase.auth.refreshSession()
        if (data.session) {
          const user = await buildAuthUser(data.session.user, data.session)
          set({ user, session: data.session, isAuthenticated: true })
        }
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        failedAttempts: state.failedAttempts,
        lockedUntil: state.lockedUntil,
      }),
    }
  )
)
