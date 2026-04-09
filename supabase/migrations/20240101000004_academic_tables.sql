-- ============================================================
-- Migration 004: Academic Tables
-- academic_years, students, classes, enrollments,
-- subjects, exams, grades, timetable, events
-- ============================================================

-- ============================================================
-- TABLE: academic_years
-- ============================================================
CREATE TABLE academic_years (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  start_date        DATE NOT NULL,
  end_date          DATE NOT NULL,
  is_current        BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);

CREATE INDEX idx_academic_years_tenant_id ON academic_years(tenant_id) WHERE deleted_at IS NULL;

-- ============================================================
-- TABLE: students
-- ============================================================
CREATE TABLE students (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  profile_id        UUID NOT NULL REFERENCES profiles(id),
  student_no        TEXT NOT NULL,
  parent_id         UUID REFERENCES users(id),
  academic_year_id  UUID REFERENCES academic_years(id),
  grade_level       TEXT,
  status            TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated', 'transferred')),
  enrollment_date   DATE DEFAULT CURRENT_DATE,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ,
  UNIQUE(tenant_id, student_no)
);

CREATE INDEX idx_students_tenant_id ON students(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_students_profile_id ON students(profile_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_students_student_no ON students(tenant_id, student_no) WHERE deleted_at IS NULL;

-- ============================================================
-- TABLE: classes
-- ============================================================
CREATE TABLE classes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name_ar           TEXT NOT NULL,
  name_en           TEXT,
  academic_year_id  UUID NOT NULL REFERENCES academic_years(id),
  grade_level       TEXT NOT NULL,
  capacity          INTEGER NOT NULL DEFAULT 30,
  teacher_id        UUID REFERENCES users(id),
  room              TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);

CREATE INDEX idx_classes_tenant_id ON classes(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_classes_academic_year ON classes(academic_year_id) WHERE deleted_at IS NULL;

-- ============================================================
-- TABLE: enrollments
-- ============================================================
CREATE TABLE enrollments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  student_id        UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id          UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  academic_year_id  UUID NOT NULL REFERENCES academic_years(id),
  status            TEXT DEFAULT 'active' CHECK (status IN ('active', 'withdrawn', 'transferred')),
  enrolled_at       TIMESTAMPTZ DEFAULT NOW(),
  withdrawn_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ,
  UNIQUE(student_id, class_id, academic_year_id)
);

CREATE INDEX idx_enrollments_tenant_id ON enrollments(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_enrollments_student_id ON enrollments(student_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_enrollments_class_id ON enrollments(class_id) WHERE deleted_at IS NULL;

-- ============================================================
-- TABLE: subjects
-- ============================================================
CREATE TABLE subjects (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name_ar           TEXT NOT NULL,
  name_en           TEXT,
  code              TEXT,
  class_id          UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id        UUID REFERENCES users(id),
  credits           NUMERIC(4,2) DEFAULT 1.0,
  passing_grade     NUMERIC(5,2) DEFAULT 60.0,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);

CREATE INDEX idx_subjects_tenant_id ON subjects(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_subjects_class_id ON subjects(class_id) WHERE deleted_at IS NULL;

-- ============================================================
-- TABLE: exams
-- ============================================================
CREATE TABLE exams (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  subject_id        UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  title_ar          TEXT,
  exam_type         TEXT DEFAULT 'quiz' CHECK (exam_type IN ('quiz', 'midterm', 'final', 'assignment', 'project')),
  max_score         NUMERIC(6,2) NOT NULL DEFAULT 100,
  weight            NUMERIC(5,2) DEFAULT 1.0,
  exam_date         DATE,
  created_by        UUID REFERENCES users(id),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);

CREATE INDEX idx_exams_tenant_id ON exams(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_exams_subject_id ON exams(subject_id) WHERE deleted_at IS NULL;

-- ============================================================
-- TABLE: grades
-- ============================================================
CREATE TABLE grades (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  student_id        UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  exam_id           UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  score             NUMERIC(6,2) NOT NULL,
  grade_letter      TEXT,
  notes             TEXT,
  entered_by        UUID REFERENCES users(id),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ,
  UNIQUE(student_id, exam_id)
);

CREATE INDEX idx_grades_tenant_id ON grades(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_grades_student_id ON grades(student_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_grades_exam_id ON grades(exam_id) WHERE deleted_at IS NULL;

-- ============================================================
-- TABLE: timetable
-- ============================================================
CREATE TABLE timetable (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  class_id          UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id        UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id        UUID NOT NULL REFERENCES users(id),
  day_of_week       day_of_week NOT NULL,
  start_time        TIME NOT NULL,
  end_time          TIME NOT NULL,
  room              TEXT,
  academic_year_id  UUID NOT NULL REFERENCES academic_years(id),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);

CREATE INDEX idx_timetable_tenant_id ON timetable(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_timetable_class_id ON timetable(class_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_timetable_teacher_id ON timetable(teacher_id) WHERE deleted_at IS NULL;

-- ============================================================
-- TABLE: events
-- ============================================================
CREATE TABLE events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title_ar          TEXT NOT NULL,
  title_en          TEXT,
  description_ar    TEXT,
  description_en    TEXT,
  event_type        TEXT DEFAULT 'general',
  start_datetime    TIMESTAMPTZ NOT NULL,
  end_datetime      TIMESTAMPTZ NOT NULL,
  location          TEXT,
  is_public         BOOLEAN DEFAULT TRUE,
  target_roles      TEXT[] DEFAULT '{}',
  created_by        UUID REFERENCES users(id),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);

CREATE INDEX idx_events_tenant_id ON events(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_events_start_datetime ON events(start_datetime) WHERE deleted_at IS NULL;
