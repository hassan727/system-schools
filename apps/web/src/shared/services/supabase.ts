import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required')
}

function getTenantSubdomain(): string {
  const hostname = window.location.hostname
  const parts = hostname.split('.')
  // localhost or IP → no subdomain
  if (parts.length <= 1) return ''
  // main.com or www.main.com → super admin
  if (parts[0] === 'www' || parts[0] === 'main') return ''
  return parts[0]
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage,
  },
  global: {
    headers: {
      'x-tenant-subdomain': getTenantSubdomain(),
    },
  },
})
