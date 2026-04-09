-- ============================================================
-- Migration 001: Extensions and Enum Types
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUM TYPES
-- ============================================================
CREATE TYPE tenant_status AS ENUM ('active', 'suspended', 'trial', 'expired');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'pending');
CREATE TYPE gender_type AS ENUM ('male', 'female');
CREATE TYPE field_type AS ENUM ('text', 'number', 'date', 'dropdown', 'boolean');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'excused');
CREATE TYPE invoice_status AS ENUM ('pending', 'partial', 'paid', 'overdue', 'cancelled');
CREATE TYPE payment_method AS ENUM ('cash', 'bank_transfer', 'card', 'cheque');
CREATE TYPE leave_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE notification_type AS ENUM ('fee_reminder', 'exam_result', 'absence', 'event', 'schedule_change', 'general');
CREATE TYPE day_of_week AS ENUM ('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday');
