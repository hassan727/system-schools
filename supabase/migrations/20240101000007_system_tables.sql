-- ============================================================
-- Migration 007: System Tables
-- audit_logs, notifications, custom_fields, custom_field_values,
-- module_subscriptions, workflows, approvals
-- ============================================================

-- ============================================================
-- TABLE: audit_logs
-- ============================================================
CREATE TABLE audit_logs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID REFERENCES tenants(id),
  user_id           UUID REFERENCES users(id),
  action            TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'ACCESS_DENIED')),
  table_name        TEXT,
  record_id         UUID,
  old_values        JSONB,
  new_values        JSONB,
  ip_address        INET,
  user_agent        TEXT,
  metadata          JSONB DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ DEFAULT NOW()
  -- لا يوجد updated_at أو deleted_at — سجلات التدقيق غير قابلة للتعديل
);

CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- ============================================================
-- TABLE: notifications
-- ============================================================
CREATE TABLE notifications (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type              notification_type NOT NULL,
  title_ar          TEXT NOT NULL,
  title_en          TEXT,
  body_ar           TEXT NOT NULL,
  body_en           TEXT,
  data              JSONB DEFAULT '{}'::jsonb,
  is_read           BOOLEAN DEFAULT FALSE,
  read_at           TIMESTAMPTZ,
  sent_via_email    BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);

CREATE INDEX idx_notifications_tenant_id ON notifications(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_notifications_user_id ON notifications(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_notifications_is_read ON notifications(user_id, is_read) WHERE deleted_at IS NULL;

-- ============================================================
-- TABLE: custom_fields
-- ============================================================
CREATE TABLE custom_fields (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  entity_type       TEXT NOT NULL CHECK (entity_type IN ('student', 'employee', 'class')),
  field_name        TEXT NOT NULL,
  field_name_ar     TEXT NOT NULL,
  field_type        field_type NOT NULL,
  is_required       BOOLEAN DEFAULT FALSE,
  options           JSONB,
  sort_order        INTEGER DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ,
  UNIQUE(tenant_id, entity_type, field_name)
);

CREATE INDEX idx_custom_fields_tenant_id ON custom_fields(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_custom_fields_entity_type ON custom_fields(entity_type) WHERE deleted_at IS NULL;

-- ============================================================
-- TABLE: custom_field_values
-- ============================================================
CREATE TABLE custom_field_values (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  field_id          UUID NOT NULL REFERENCES custom_fields(id) ON DELETE CASCADE,
  entity_id         UUID NOT NULL,
  value             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ,
  UNIQUE(field_id, entity_id)
);

CREATE INDEX idx_custom_field_values_tenant_id ON custom_field_values(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_custom_field_values_field_id ON custom_field_values(field_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_custom_field_values_entity_id ON custom_field_values(entity_id) WHERE deleted_at IS NULL;

-- ============================================================
-- TABLE: module_subscriptions
-- ============================================================
CREATE TABLE module_subscriptions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  module_name       TEXT NOT NULL,
  is_active         BOOLEAN DEFAULT TRUE,
  activated_at      TIMESTAMPTZ DEFAULT NOW(),
  deactivated_at    TIMESTAMPTZ,
  activated_by      UUID REFERENCES users(id),
  plan_type         TEXT DEFAULT 'basic' CHECK (plan_type IN ('basic', 'standard', 'premium')),
  expires_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ,
  UNIQUE(tenant_id, module_name)
);

CREATE INDEX idx_module_subscriptions_tenant_id ON module_subscriptions(tenant_id) WHERE deleted_at IS NULL;

-- ============================================================
-- TABLE: workflows
-- ============================================================
CREATE TABLE workflows (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  name_ar           TEXT NOT NULL,
  trigger_event     TEXT NOT NULL,
  conditions        JSONB DEFAULT '[]'::jsonb,
  actions           JSONB DEFAULT '[]'::jsonb,
  is_active         BOOLEAN DEFAULT TRUE,
  created_by        UUID REFERENCES users(id),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);

CREATE INDEX idx_workflows_tenant_id ON workflows(tenant_id) WHERE deleted_at IS NULL;

-- ============================================================
-- TABLE: approvals
-- ============================================================
CREATE TABLE approvals (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workflow_id       UUID REFERENCES workflows(id),
  entity_type       TEXT NOT NULL,
  entity_id         UUID NOT NULL,
  status            TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_by      UUID NOT NULL REFERENCES users(id),
  reviewed_by       UUID REFERENCES users(id),
  reviewed_at       TIMESTAMPTZ,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);

CREATE INDEX idx_approvals_tenant_id ON approvals(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_approvals_entity ON approvals(entity_type, entity_id) WHERE deleted_at IS NULL;
