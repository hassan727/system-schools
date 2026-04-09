// ============================================================
// Core Types
// ============================================================

export type UUID = string
export type Timestamp = string // ISO 8601

export type Language = 'ar' | 'en'
export type Gender = 'male' | 'female'

// ============================================================
// Tenant
// ============================================================

export type TenantStatus = 'active' | 'suspended' | 'trial' | 'expired'

export interface TenantModules {
  academic: boolean
  hr: boolean
  finance: boolean
  scheduling: boolean
  reports: boolean
}

export interface Tenant {
  id: UUID
  name_ar: string
  name_en: string
  slug: string
  subdomain: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
  default_language: Language
  timezone: string
  currency: string
  status: TenantStatus
  modules_enabled: TenantModules
  settings: Record<string, unknown>
  max_students: number
  max_employees: number
  trial_ends_at: Timestamp | null
  created_at: Timestamp
  updated_at: Timestamp
  deleted_at: Timestamp | null
}

// ============================================================
// User
// ============================================================

export type UserStatus = 'active' | 'inactive' | 'pending'

export interface User {
  id: UUID
  tenant_id: UUID
  email: string
  status: UserStatus
  last_login_at: Timestamp | null
  failed_login_count: number
  locked_until: Timestamp | null
  created_at: Timestamp
  updated_at: Timestamp
  deleted_at: Timestamp | null
}

// ============================================================
// Profile
// ============================================================

export interface EmergencyContact {
  name?: string
  phone?: string
  relation?: string
}

export interface Profile {
  id: UUID
  user_id: UUID
  tenant_id: UUID
  first_name_ar: string
  first_name_en: string | null
  last_name_ar: string
  last_name_en: string | null
  phone: string | null
  avatar_url: string | null
  national_id: string | null
  date_of_birth: string | null // DATE
  gender: Gender | null
  address: string | null
  emergency_contact: EmergencyContact
  created_at: Timestamp
  updated_at: Timestamp
  deleted_at: Timestamp | null
}

// ============================================================
// RBAC — Role
// ============================================================

export interface Role {
  id: UUID
  tenant_id: UUID | null // null = system role
  name: string
  name_ar: string
  description: string | null
  description_ar: string | null
  is_system: boolean
  created_at: Timestamp
  updated_at: Timestamp
  deleted_at: Timestamp | null
}

// ============================================================
// RBAC — Permission
// ============================================================

export type PermissionModule =
  | 'academic'
  | 'hr'
  | 'finance'
  | 'reports'
  | 'system'

export type PermissionAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'approve'
  | 'manage'

/** Format: {module}.{resource}.{action} */
export type PermissionName = string

export interface Permission {
  id: UUID
  name: PermissionName
  module: PermissionModule
  resource: string
  action: PermissionAction
  description: string | null
  description_ar: string | null
  created_at: Timestamp
}

// ============================================================
// Student
// ============================================================

export type StudentStatus = 'active' | 'inactive' | 'graduated' | 'transferred'

export interface Student {
  id: UUID
  tenant_id: UUID
  profile_id: UUID
  student_no: string
  parent_id: UUID | null
  academic_year_id: UUID | null
  grade_level: string | null
  status: StudentStatus
  enrollment_date: string // DATE
  notes: string | null
  created_at: Timestamp
  updated_at: Timestamp
  deleted_at: Timestamp | null
}

// ============================================================
// Employee
// ============================================================

export type ContractType = 'full_time' | 'part_time' | 'contract'
export type EmployeeStatus = 'active' | 'inactive' | 'terminated'

export interface Employee {
  id: UUID
  tenant_id: UUID
  user_id: UUID
  profile_id: UUID
  employee_no: string
  job_title_ar: string
  job_title_en: string | null
  department_ar: string | null
  department_en: string | null
  basic_salary: number
  hire_date: string // DATE
  contract_type: ContractType
  status: EmployeeStatus
  bank_account: string | null
  iban: string | null
  created_at: Timestamp
  updated_at: Timestamp
  deleted_at: Timestamp | null
}

// ============================================================
// Invoice
// ============================================================

export type InvoiceStatus = 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled'
export type FeeType = 'annual' | 'semester' | 'monthly' | 'one_time'

export interface Invoice {
  id: UUID
  tenant_id: UUID
  invoice_no: string
  student_id: UUID
  fee_structure_id: UUID | null
  academic_year_id: UUID | null
  fee_type: FeeType
  total_amount: number
  discount_amount: number
  paid_amount: number
  balance: number // computed: total - discount - paid
  due_date: string // DATE
  status: InvoiceStatus
  notes: string | null
  created_by: UUID | null
  created_at: Timestamp
  updated_at: Timestamp
  deleted_at: Timestamp | null
}

// ============================================================
// JWT Claims (custom)
// ============================================================

export interface JwtClaims {
  sub: UUID
  tenant_id: UUID
  tenant_slug: string
  roles: string[]
  permissions: PermissionName[]
}

// ============================================================
// API Response helpers
// ============================================================

export interface ApiSuccess<T> {
  data: T
  error: null
}

export interface ApiError {
  data: null
  error: {
    message: string
    code: string
    status: number
  }
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

// ============================================================
// Pagination
// ============================================================

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
