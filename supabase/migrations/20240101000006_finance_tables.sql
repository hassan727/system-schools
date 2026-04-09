-- ============================================================
-- Migration 006: Finance Tables
-- fee_structures, invoices, payments, expenses
-- ============================================================

-- ============================================================
-- TABLE: fee_structures
-- ============================================================
CREATE TABLE fee_structures (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name_ar           TEXT NOT NULL,
  name_en           TEXT,
  fee_type          TEXT NOT NULL CHECK (fee_type IN ('annual', 'semester', 'monthly', 'one_time')),
  amount            NUMERIC(12,2) NOT NULL,
  academic_year_id  UUID REFERENCES academic_years(id),
  grade_level       TEXT,
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);

CREATE INDEX idx_fee_structures_tenant_id ON fee_structures(tenant_id) WHERE deleted_at IS NULL;

-- ============================================================
-- TABLE: invoices
-- ============================================================
CREATE TABLE invoices (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  invoice_no        TEXT NOT NULL,
  student_id        UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  fee_structure_id  UUID REFERENCES fee_structures(id),
  academic_year_id  UUID REFERENCES academic_years(id),
  fee_type          TEXT NOT NULL,
  total_amount      NUMERIC(12,2) NOT NULL,
  discount_amount   NUMERIC(12,2) DEFAULT 0,
  paid_amount       NUMERIC(12,2) DEFAULT 0,
  balance           NUMERIC(12,2) GENERATED ALWAYS AS (total_amount - discount_amount - paid_amount) STORED,
  due_date          DATE NOT NULL,
  status            invoice_status DEFAULT 'pending',
  notes             TEXT,
  created_by        UUID REFERENCES users(id),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ,
  UNIQUE(tenant_id, invoice_no)
);

CREATE INDEX idx_invoices_tenant_id ON invoices(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_invoices_student_id ON invoices(student_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_invoices_status ON invoices(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_invoices_due_date ON invoices(due_date) WHERE deleted_at IS NULL;

-- ============================================================
-- TABLE: payments
-- ============================================================
CREATE TABLE payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  invoice_id        UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount            NUMERIC(12,2) NOT NULL,
  payment_method    payment_method NOT NULL,
  receipt_no        TEXT NOT NULL,
  paid_by           TEXT NOT NULL,
  paid_at           TIMESTAMPTZ DEFAULT NOW(),
  reference_no      TEXT,
  notes             TEXT,
  created_by        UUID REFERENCES users(id),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);

CREATE INDEX idx_payments_tenant_id ON payments(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id) WHERE deleted_at IS NULL;

-- ============================================================
-- TABLE: expenses
-- ============================================================
CREATE TABLE expenses (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  category          TEXT NOT NULL,
  amount            NUMERIC(12,2) NOT NULL,
  description_ar    TEXT NOT NULL,
  description_en    TEXT,
  expense_date      DATE NOT NULL,
  attachment_url    TEXT,
  approved_by       UUID REFERENCES users(id),
  status            TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_by        UUID NOT NULL REFERENCES users(id),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);

CREATE INDEX idx_expenses_tenant_id ON expenses(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_expenses_expense_date ON expenses(expense_date) WHERE deleted_at IS NULL;
