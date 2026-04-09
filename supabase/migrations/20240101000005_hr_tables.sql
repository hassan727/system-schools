-- ============================================================
-- Migration 005: HR Tables
-- employees, attendance, salaries, leave_requests
-- ============================================================

-- ============================================================
-- TABLE: employees
-- ============================================================
CREATE TABLE employees (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profile_id        UUID NOT NULL REFERENCES profiles(id),
  employee_no       TEXT NOT NULL,
  job_title_ar      TEXT NOT NULL,
  job_title_en      TEXT,
  department_ar     TEXT,
  department_en     TEXT,
  basic_salary      NUMERIC(12,2) NOT NULL DEFAULT 0,
  hire_date         DATE NOT NULL,
  contract_type     TEXT DEFAULT 'full_time' CHECK (contract_type IN ('full_time', 'part_time', 'contract')),
  status            TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
  bank_account      TEXT,
  iban              TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ,
  UNIQUE(tenant_id, employee_no)
);

CREATE INDEX idx_employees_tenant_id ON employees(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_employees_user_id ON employees(user_id) WHERE deleted_at IS NULL;

-- ============================================================
-- TABLE: attendance
-- ============================================================
CREATE TABLE attendance (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id       UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date              DATE NOT NULL,
  check_in          TIME,
  check_out         TIME,
  status            attendance_status DEFAULT 'present',
  worked_hours      NUMERIC(5,2),
  notes             TEXT,
  approved_by       UUID REFERENCES users(id),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ,
  UNIQUE(employee_id, date)
);

CREATE INDEX idx_attendance_tenant_id ON attendance(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_attendance_employee_id ON attendance(employee_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_attendance_date ON attendance(date) WHERE deleted_at IS NULL;

-- ============================================================
-- TABLE: salaries
-- ============================================================
CREATE TABLE salaries (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id       UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  month             INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year              INTEGER NOT NULL,
  basic_salary      NUMERIC(12,2) NOT NULL,
  allowances        NUMERIC(12,2) DEFAULT 0,
  deductions        NUMERIC(12,2) DEFAULT 0,
  overtime_pay      NUMERIC(12,2) DEFAULT 0,
  net_salary        NUMERIC(12,2) NOT NULL,
  working_days      INTEGER,
  present_days      INTEGER,
  absent_days       INTEGER,
  status            TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'paid')),
  paid_at           TIMESTAMPTZ,
  notes             TEXT,
  created_by        UUID REFERENCES users(id),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ,
  UNIQUE(employee_id, month, year)
);

CREATE INDEX idx_salaries_tenant_id ON salaries(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_salaries_employee_id ON salaries(employee_id) WHERE deleted_at IS NULL;

-- ============================================================
-- TABLE: leave_requests
-- ============================================================
CREATE TABLE leave_requests (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id       UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type        TEXT NOT NULL CHECK (leave_type IN ('annual', 'sick', 'emergency', 'unpaid', 'maternity', 'paternity')),
  start_date        DATE NOT NULL,
  end_date          DATE NOT NULL,
  days_count        INTEGER NOT NULL,
  reason            TEXT,
  status            leave_status DEFAULT 'pending',
  reviewed_by       UUID REFERENCES users(id),
  reviewed_at       TIMESTAMPTZ,
  review_notes      TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);

CREATE INDEX idx_leave_requests_tenant_id ON leave_requests(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_leave_requests_employee_id ON leave_requests(employee_id) WHERE deleted_at IS NULL;
