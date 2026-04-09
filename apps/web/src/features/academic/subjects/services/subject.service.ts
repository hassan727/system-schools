import { supabase } from '../../../../shared/services/supabase'
import { useAuthStore } from '../../../../shared/stores/auth.store'

export interface Subject {
  id: string
  tenant_id: string
  name_ar: string
  name_en: string | null
  code: string | null
  class_id: string
  teacher_id: string | null
  credits: number
  passing_grade: number
  created_at: string
  class?: { id: string; name_ar: string; name_en: string | null; grade_level: string }
}

export interface CreateSubjectInput {
  name_ar: string
  name_en?: string
  code?: string
  class_id: string
  teacher_id?: string
  credits?: number
  passing_grade?: number
}

export const subjectService = {
  async list(classId?: string): Promise<Subject[]> {
    const tenantId = useAuthStore.getState().user?.tenantId
    let query = supabase
      .from('subjects')
      .select(`
        id, tenant_id, name_ar, name_en, code, class_id, teacher_id, credits, passing_grade, created_at,
        class:classes(id, name_ar, name_en, grade_level)
      `)
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .order('name_ar')

    if (classId) query = query.eq('class_id', classId)

    const { data, error } = await query
    if (error) throw new Error(error.message)
    return (data ?? []) as unknown as Subject[]
  },

  async getById(id: string): Promise<Subject> {
    const { data, error } = await supabase
      .from('subjects')
      .select(`
        id, tenant_id, name_ar, name_en, code, class_id, teacher_id, credits, passing_grade, created_at,
        class:classes(id, name_ar, name_en, grade_level)
      `)
      .eq('id', id)
      .single()

    if (error) throw new Error(error.message)
    return data as unknown as Subject
  },

  async create(input: CreateSubjectInput): Promise<Subject> {
    const tenantId = useAuthStore.getState().user?.tenantId
    if (!tenantId) throw new Error('غير مصرح')

    const { data, error } = await supabase
      .from('subjects')
      .insert({
        tenant_id: tenantId,
        name_ar: input.name_ar,
        name_en: input.name_en ?? null,
        code: input.code ?? null,
        class_id: input.class_id,
        teacher_id: input.teacher_id ?? null,
        credits: input.credits ?? 1.0,
        passing_grade: input.passing_grade ?? 60.0,
      })
      .select('id')
      .single()

    if (error) throw new Error(error.message)
    return this.getById(data.id)
  },

  async update(id: string, input: Partial<CreateSubjectInput>): Promise<Subject> {
    const { error } = await supabase
      .from('subjects')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw new Error(error.message)
    return this.getById(id)
  },

  async softDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from('subjects')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw new Error(error.message)
  },
}
