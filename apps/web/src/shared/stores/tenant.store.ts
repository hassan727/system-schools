import { create } from 'zustand'
import { supabase } from '../services/supabase'

export interface TenantModules {
  academic: boolean
  hr: boolean
  finance: boolean
  scheduling: boolean
  reports: boolean
}

export interface TenantConfig {
  id: string
  nameAr: string
  nameEn: string
  slug: string
  subdomain: string
  logoUrl: string | null
  primaryColor: string
  secondaryColor: string
  defaultLanguage: 'ar' | 'en'
  timezone: string
  currency: string
  modulesEnabled: TenantModules
  status: string
}

interface TenantState {
  tenantConfig: TenantConfig | null
  subdomain: string
  isLoading: boolean
  error: string | null

  // Actions
  loadTenant: () => Promise<void>
  setTenantConfig: (config: TenantConfig) => void
  isModuleEnabled: (module: keyof TenantModules) => boolean
}

function extractSubdomain(): string {
  const hostname = window.location.hostname
  const parts = hostname.split('.')
  if (parts.length <= 1) return 'localhost'
  if (parts[0] === 'www' || parts[0] === 'main') return ''
  return parts[0]
}

export const useTenantStore = create<TenantState>((set, get) => ({
  tenantConfig: null,
  subdomain: extractSubdomain(),
  isLoading: false,
  error: null,

  loadTenant: async () => {
    const subdomain = extractSubdomain()
    if (!subdomain || subdomain === 'localhost') return

    set({ isLoading: true, error: null })

    const { data, error } = await supabase
      .from('tenants')
      .select('id, name_ar, name_en, slug, subdomain, logo_url, primary_color, secondary_color, default_language, timezone, currency, modules_enabled, status')
      .eq('subdomain', subdomain)
      .is('deleted_at', null)
      .single()

    if (error || !data) {
      set({ isLoading: false, error: 'المدرسة غير موجودة' })
      return
    }

    const config: TenantConfig = {
      id: data.id,
      nameAr: data.name_ar,
      nameEn: data.name_en,
      slug: data.slug,
      subdomain: data.subdomain,
      logoUrl: data.logo_url,
      primaryColor: data.primary_color,
      secondaryColor: data.secondary_color,
      defaultLanguage: data.default_language as 'ar' | 'en',
      timezone: data.timezone,
      currency: data.currency,
      modulesEnabled: data.modules_enabled as TenantModules,
      status: data.status,
    }

    // Apply tenant colors as CSS variables
    document.documentElement.style.setProperty('--color-primary', config.primaryColor)
    document.documentElement.style.setProperty('--color-secondary', config.secondaryColor)

    set({ tenantConfig: config, subdomain, isLoading: false })
  },

  setTenantConfig: (config) => set({ tenantConfig: config }),

  isModuleEnabled: (module) => {
    const { tenantConfig } = get()
    if (!tenantConfig) return false
    return tenantConfig.modulesEnabled[module] === true
  },
}))
