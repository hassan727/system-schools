import { supabase } from '../../../../shared/services/supabase'
import { useAuthStore } from '../../../../shared/stores/auth.store'

export interface AcademicYear {
  id: string
  tenant_id: string
  name: string
  start_date: string
  end_date: string
  is_current: boolean
  created_at: string
}

export interface Class {
  id: string
  tenant_id: string
  name_ar: string
  name_en: string | null
  academic_year_id: string
  grade_level: string
  capacity: number
  teacher_id: string | null
  room: string | null
  created_at: string
  enrollment_count?: number
  academic_year?: Pick<AcademicYear, 'id' | 'name'>
}

export interface CreateClassInput {
  name_ar: string
  name_en?: string
  academic_year_id: string
  grade_level: string
  capacity: number
  teacher_id?: string
  room?: string
}

export const classService = {
  // ===== Academic Years =====
  async listAcademicYears(): Promise<AcademicYear[]> {
    const tenantId = useAuthStore.getState().user?.tenantId
    const { data, error } = await supabase
      .from('academic_years')
      .select('*')
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .order('start_date', { ascending: false })

    if (error) throw new Error(error.message)
    return data ?? []
  },

  async createAcademicYear(input: { name: string; start_date: string; end_date: string; is_current?: boolean }): Promise<AcademicYear> {
    const tenantId = useAuthStore.getState().user?.tenantId
    if (!tenantId) throw new Error('غير مصرح')

    // إذا كانت السنة الحالية، نلغي الحالية الأخرى
    if (input.is_current) {
      await supabase
        .from('academic_years')
        .update({ is_current: false })
        .eq('tenant_id', tenantId)
    }

    const { data, error } = await supabase
      .from('academic_years')
      .insert({ ...input, tenant_id: tenantId })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // ===== Classes =====
  async list(academicYearId?: string): Promise<Class[]> {
    const tenantId = useAuthStore.getState().user?.tenantId
    let query = supabase
      .from('classes')
      .select(`
        id, tenant_id, name_ar, name_en, academic_year_id, grade_level,
        capacity, teacher_id, room, created_at,
        academic_year:academic_years(id, name)
      `)
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .order('grade_level')

    if (academicYearId) query = query.eq('academic_year_id', academicYearId)

    const { data, error } = await query
    if (error) throw new Error(error.message)

    // نحسب عدد الطلاب المسجلين لكل فصل
    const classes = (data ?? []) as unknown as Class[]
    const classIds = classes.map((c) => c.id)

    if (classIds.length > 0) {
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('class_id')
        .in('class_id', classIds)
        .eq('status', 'active')
        .is('deleted_at', null)

      const countMap: Record<string, number> = {}
      for (const e of enrollments ?? []) {
        countMap[e.class_id] = (countMap[e.class_id] ?? 0) + 1
      }
      classes.forEach((c) => { c.enrollment_count = countMap[c.id] ?? 0 })
    }

    return classes
  },

  async getById(id: string): Promise<Class> {
    const { data, error } = await supabase
      .from('classes')
      .select(`
        id, tenant_id, name_ar, name_en, academic_year_id, grade_level,
        capacity, teacher_id, room, created_at,
        academic_year:academic_years(id, name)
      `)
      .eq('id', id)
      .single()

    if (error) throw new Error(error.message)
    return data as unknown as Class
  },

  async create(input: CreateClassInput): Promise<Class> {
    const tenantId = useAuthStore.getState().user?.tenantId
    if (!tenantId) throw new Error('غير مصرح')

    const { data, error } = await supabase
      .from('classes')
      .insert({ ...input, tenant_id: tenantId })
      .select('id')
      .single()

    if (error) throw new Error(error.message)
    return this.getById(data.id)
  },

  async update(id: string, input: Partial<CreateClassInput>): Promise<Class> {
    const { error } = await supabase
      .from('classes')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw new Error(error.message)
    return this.getById(id)
  },

  async softDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from('classes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw new Error(error.message)
  },

  /** التحقق من الطاقة الاستيعابية قبل التسجيل */
  async checkCapacity(classId: string): Promise<{ available: boolean; current: number; capacity: number }> {
    const cls = await this.getById(classId)
    const { count } = await supabase
      .from('enrollments')
      .select('id', { count: 'exact', head: true })
      .eq('class_id', classId)
      .eq('status', 'active')
      .is('deleted_at', null)

    const current = count ?? 0
    return { available: current < cls.capacity, current, capacity: cls.capacity }
  },

  /** تسجيل طالب في فصل مع التحقق من الطاقة */
  async enrollStudent(studentId: string, classId: string, academicYearId: string): Promise<void> {
    const tenantId = useAuthStore.getState().user?.tenantId
    if (!tenantId) throw new Error('غير مصرح')

    const cap = await this.checkCapacity(classId)
    if (!cap.available) {
      throw new Error(`الفصل ممتلئ (${cap.current}/${cap.capacity} طالب)`)
    }

    const { error } = await supabase
      .from('enrollments')
      .insert({
        tenant_id: tenantId,
        student_id: studentId,
        class_id: classId,
        academic_year_id: academicYearId,
        status: 'active',
      })

    if (error) {
      if (error.code === '23505') throw new Error('الطالب مسجّل في هذا الفصل بالفعل')
      throw new Error(error.message)
    }
  },
}
