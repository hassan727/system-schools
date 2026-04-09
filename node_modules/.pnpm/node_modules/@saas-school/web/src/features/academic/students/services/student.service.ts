import { supabase } from '../../../../shared/services/supabase'
import { useAuthStore } from '../../../../shared/stores/auth.store'

export interface StudentProfile {
  id: string
  first_name_ar: string
  first_name_en: string | null
  last_name_ar: string
  last_name_en: string | null
  date_of_birth: string | null
  gender: 'male' | 'female' | null
  phone: string | null
  avatar_url: string | null
  national_id: string | null
  address: string | null
}

export interface Student {
  id: string
  tenant_id: string
  student_no: string
  grade_level: string | null
  status: 'active' | 'inactive' | 'graduated' | 'transferred'
  enrollment_date: string
  notes: string | null
  created_at: string
  profile: StudentProfile | null
  academic_year_id: string | null
  parent_id: string | null
}

export interface CreateStudentInput {
  // Profile fields
  first_name_ar: string
  first_name_en?: string
  last_name_ar: string
  last_name_en?: string
  date_of_birth?: string
  gender?: 'male' | 'female'
  phone?: string
  national_id?: string
  address?: string
  // Student fields
  grade_level?: string
  academic_year_id?: string
  parent_id?: string
  notes?: string
  enrollment_date?: string
}

export interface UpdateStudentInput extends Partial<CreateStudentInput> {
  status?: 'active' | 'inactive' | 'graduated' | 'transferred'
}

/** توليد رقم الطالب بصيغة {prefix}-{year}-{seq} */
async function generateStudentNo(tenantId: string): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = 'STU'

  // نحسب عدد الطلاب الحاليين لهذا المستأجر في هذه السنة
  const { count } = await supabase
    .from('students')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .like('student_no', `${prefix}-${year}-%`)
    .is('deleted_at', null)

  const seq = String((count ?? 0) + 1).padStart(4, '0')
  return `${prefix}-${year}-${seq}`
}

export const studentService = {
  async list(filters?: { status?: string; grade_level?: string; search?: string }) {
    const tenantId = useAuthStore.getState().user?.tenantId
    if (!tenantId) throw new Error('غير مصرح')

    let query = supabase
      .from('students')
      .select(`
        id, tenant_id, student_no, grade_level, status, enrollment_date, notes, created_at,
        academic_year_id, parent_id,
        profile:profiles(
          id, first_name_ar, first_name_en, last_name_ar, last_name_en,
          date_of_birth, gender, phone, avatar_url, national_id, address
        )
      `)
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (filters?.status) query = query.eq('status', filters.status)
    if (filters?.grade_level) query = query.eq('grade_level', filters.grade_level)

    const { data, error } = await query
    if (error) throw new Error(error.message)

    let students = (data ?? []) as unknown as Student[]

    // بحث نصي في الاسم أو رقم الطالب
    if (filters?.search) {
      const q = filters.search.toLowerCase()
      students = students.filter((s) =>
        s.student_no.toLowerCase().includes(q) ||
        s.profile?.first_name_ar.toLowerCase().includes(q) ||
        s.profile?.last_name_ar.toLowerCase().includes(q) ||
        (s.profile?.first_name_en ?? '').toLowerCase().includes(q)
      )
    }

    return students
  },

  async getById(id: string): Promise<Student> {
    const { data, error } = await supabase
      .from('students')
      .select(`
        id, tenant_id, student_no, grade_level, status, enrollment_date, notes, created_at,
        academic_year_id, parent_id,
        profile:profiles(
          id, first_name_ar, first_name_en, last_name_ar, last_name_en,
          date_of_birth, gender, phone, avatar_url, national_id, address
        )
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error) throw new Error(error.message)
    return data as unknown as Student
  },

  async create(input: CreateStudentInput): Promise<Student> {
    const tenantId = useAuthStore.getState().user?.tenantId
    const userId = useAuthStore.getState().user?.id
    if (!tenantId || !userId) throw new Error('غير مصرح')

    // 1. إنشاء profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        tenant_id: tenantId,
        first_name_ar: input.first_name_ar,
        first_name_en: input.first_name_en ?? null,
        last_name_ar: input.last_name_ar,
        last_name_en: input.last_name_en ?? null,
        date_of_birth: input.date_of_birth ?? null,
        gender: input.gender ?? null,
        phone: input.phone ?? null,
        national_id: input.national_id ?? null,
        address: input.address ?? null,
      })
      .select('id')
      .single()

    if (profileError) throw new Error(profileError.message)

    // 2. توليد رقم الطالب
    const studentNo = await generateStudentNo(tenantId)

    // 3. إنشاء student
    const { data: student, error: studentError } = await supabase
      .from('students')
      .insert({
        tenant_id: tenantId,
        profile_id: profile.id,
        student_no: studentNo,
        grade_level: input.grade_level ?? null,
        academic_year_id: input.academic_year_id ?? null,
        parent_id: input.parent_id ?? null,
        notes: input.notes ?? null,
        enrollment_date: input.enrollment_date ?? new Date().toISOString().split('T')[0],
        status: 'active',
      })
      .select('id')
      .single()

    if (studentError) throw new Error(studentError.message)

    return this.getById(student.id)
  },

  async update(id: string, input: UpdateStudentInput): Promise<Student> {
    // تحديث الـ profile أولاً
    const current = await this.getById(id)
    if (current.profile) {
      const profileUpdate: Record<string, unknown> = {}
      if (input.first_name_ar !== undefined) profileUpdate.first_name_ar = input.first_name_ar
      if (input.first_name_en !== undefined) profileUpdate.first_name_en = input.first_name_en
      if (input.last_name_ar !== undefined) profileUpdate.last_name_ar = input.last_name_ar
      if (input.last_name_en !== undefined) profileUpdate.last_name_en = input.last_name_en
      if (input.date_of_birth !== undefined) profileUpdate.date_of_birth = input.date_of_birth
      if (input.gender !== undefined) profileUpdate.gender = input.gender
      if (input.phone !== undefined) profileUpdate.phone = input.phone
      if (input.national_id !== undefined) profileUpdate.national_id = input.national_id
      if (input.address !== undefined) profileUpdate.address = input.address

      if (Object.keys(profileUpdate).length > 0) {
        const { error } = await supabase
          .from('profiles')
          .update(profileUpdate)
          .eq('id', current.profile.id)
        if (error) throw new Error(error.message)
      }
    }

    // تحديث بيانات الطالب
    const studentUpdate: Record<string, unknown> = {}
    if (input.grade_level !== undefined) studentUpdate.grade_level = input.grade_level
    if (input.academic_year_id !== undefined) studentUpdate.academic_year_id = input.academic_year_id
    if (input.status !== undefined) studentUpdate.status = input.status
    if (input.notes !== undefined) studentUpdate.notes = input.notes

    if (Object.keys(studentUpdate).length > 0) {
      const { error } = await supabase
        .from('students')
        .update({ ...studentUpdate, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw new Error(error.message)
    }

    return this.getById(id)
  },

  async softDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from('students')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw new Error(error.message)
  },
}
