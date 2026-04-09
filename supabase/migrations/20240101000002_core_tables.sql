-- ============================================================
-- Migration 002: Core Tables (tenants, users, profiles)
-- ============================================================

-- ============================================================
-- TABLE: tenants
-- ============================================================
CREATE TABLE tenants (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar           TEXT NOT NULL,
  name_en           TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  subdomain         TEXT NOT NULL UNIQUE,
  logo_url          TEXT,
  primary_color     TEXT DEFAULT '#1a56db',
  secondary_color   TEXT DEFAULT '#7e3af2',
  default_language  TEXT DEFAULT 'ar' CHECK (default_language IN ('ar', 'en')),
  timezone          TEXT DEFAULT 'Asia/Riyadh',
  currency          TEXT DEFAULT 'SAR',
  status            tenant_status DEFAULT 'trial',
  modules_enabled   JSONB DEFAULT '{"academic": true, "hr": false, "finance": false, "scheduling": false, "reports": false}'::jsonb,
  settings          JSONB DEFAULT '{}'::jsonb,
  max_students      INTEGER DEFAULT 500,
  max_employees     INTEGER DEFAULT 50,
  trial_ends_at     TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);

CREATE INDEX idx_tenants_slug ON tenants(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_tenants_subdomain ON tenants(subdomain) WHERE deleted_at IS NULL;
CREATE INDEX idx_tenants_status ON tenants(status) WHERE deleted_at IS NULL;

-- ============================================================
-- TABLE: users (extends Supabase auth.users)
-- ============================================================
CREATE TABLE users (
  id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email             TEXT NOT NULL,
  status            user_status DEFAULT 'pending',
  last_login_at     TIMESTAMPTZ,
  failed_login_count INTEGER DEFAULT 0,
  locked_until      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);

CREATE INDEX idx_users_tenant_id ON users(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_users_email_tenant ON users(email, tenant_id) WHERE deleted_at IS NULL;

-- ============================================================
-- TABLE: profiles
-- ============================================================
CREATE TABLE profiles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  first_name_ar     TEXT NOT NULL,
  first_name_en     TEXT,
  last_name_ar      TEXT NOT NULL,
  last_name_en      TEXT,
  phone             TEXT,
  avatar_url        TEXT,
  national_id       TEXT,
  date_of_birth     DATE,
  gender            gender_type,
  address           TEXT,
  emergency_contact JSONB DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_profiles_tenant_id ON profiles(tenant_id) WHERE deleted_at IS NULL;
