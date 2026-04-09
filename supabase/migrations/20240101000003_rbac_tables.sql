-- ============================================================
-- Migration 003: RBAC Tables (roles, permissions, role_permissions, user_roles)
-- ============================================================

-- ============================================================
-- TABLE: roles
-- ============================================================
CREATE TABLE roles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID REFERENCES tenants(id) ON DELETE CASCADE,
  -- NULL tenant_id = system role (super_admin, etc.)
  name              TEXT NOT NULL,
  name_ar           TEXT NOT NULL,
  description       TEXT,
  description_ar    TEXT,
  is_system         BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ,
  UNIQUE(tenant_id, name)
);

CREATE INDEX idx_roles_tenant_id ON roles(tenant_id) WHERE deleted_at IS NULL;

-- ============================================================
-- TABLE: permissions
-- ============================================================
CREATE TABLE permissions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL UNIQUE,
  -- format: {module}.{resource}.{action}
  -- e.g.: academic.students.create
  module            TEXT NOT NULL,
  resource          TEXT NOT NULL,
  action            TEXT NOT NULL,
  description       TEXT,
  description_ar    TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_permissions_module ON permissions(module);
CREATE INDEX idx_permissions_name ON permissions(name);

-- ============================================================
-- TABLE: role_permissions
-- ============================================================
CREATE TABLE role_permissions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id           UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id     UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  tenant_id         UUID REFERENCES tenants(id) ON DELETE CASCADE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);

-- ============================================================
-- TABLE: user_roles
-- ============================================================
CREATE TABLE user_roles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id           UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  assigned_by       UUID REFERENCES users(id),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ,
  UNIQUE(user_id, role_id, tenant_id)
);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_user_roles_tenant_id ON user_roles(tenant_id) WHERE deleted_at IS NULL;
