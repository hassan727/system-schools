import { supabase } from '../../../shared/services/supabase'

export type TenantStatus = 'active' | 'suspended' | 'trial' | 'expired'

export interface Tenant {
  id: string
  name_ar: string
  name_en: string | null
  slug: string
  subdomain: string
  status: TenantStatus
  logo_url: string | null
  primary_color: string | null
  modules_enabled: string[]
  max_students: number
  max_employees: number
  created_at: string
  // computed from joins
  student_count?: number
  employee_count?: number
}

export interface CreateTenantInput {
  name_ar: string
  name_en?: string
  slug: string
  subdomain: string
  status: TenantStatus
  modules_enabled: string[]
  max_students: number
  max_employees: number
  primary_color?: string
}

export const AVAILABLE_MODULES = [
  { key: 'academic',   labelAr: 'الأكاديمية',        labelEn: 'Academic' },
  { key: 'hr',         labelAr: 'الموارد البشرية',   labelEn: 'HR' },
  { key: 'finance',    labelAr: 'المالية',            labelEn: 'Finance' },
  { key: 'scheduling', labelAr: 'الجداول',            labelEn: 'Scheduling' },
  { key: 'reports',    labelAr: 'التقارير',           labelEn: 'Reports' },
]

export const tenantService = {
  async list(): Promise<Tenant[]> {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data ?? []
  },

  async getById(id: string): Promise<Tenant> {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  async create(input: CreateTenantInput): Promise<Tenant> {
    // Check uniqueness
    const { data: existing } = await supabase
      .from('tenants')
      .select('id')
      .or(`slug.eq.${input.slug},subdomain.eq.${input.subdomain}`)
      .is('deleted_at', null)
      .maybeSingle()

    if (existing) throw new Error('النطاق الفرعي أو المعرف مستخدم بالفعل')

    const { data, error } = await supabase
      .from('tenants')
      .insert(input)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  async update(id: string, input: Partial<CreateTenantInput>): Promise<Tenant> {
    // Check uniqueness if slug/subdomain changed
    if (input.slug || input.subdomain) {
      const conditions = []
      if (input.slug) conditions.push(`slug.eq.${input.slug}`)
      if (input.subdomain) conditions.push(`subdomain.eq.${input.subdomain}`)

      const { data: existing } = await supabase
        .from('tenants')
        .select('id')
        .or(conditions.join(','))
        .neq('id', id)
        .is('deleted_at', null)
        .maybeSingle()

      if (existing) throw new Error('النطاق الفرعي أو المعرف مستخدم بالفعل')
    }

    const { data, error } = await supabase
      .from('tenants')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  async setStatus(id: string, status: TenantStatus): Promise<void> {
    const { error } = await supabase
      .from('tenants')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw new Error(error.message)
  },

  async updateModules(id: string, modules: string[]): Promise<void> {
    const { error } = await supabase
      .from('tenants')
      .update({ modules_enabled: modules, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw new Error(error.message)
  },
}
