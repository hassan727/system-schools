-- ============================================================
-- Migration 009: Database Triggers and Functions
-- ============================================================

-- ============================================================
-- FUNCTION: تسجيل التغييرات تلقائياً (Audit Log)
-- ============================================================
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  old_data JSONB;
  new_data JSONB;
  action_type TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    old_data := NULL;
    new_data := to_jsonb(NEW);
    action_type := 'INSERT';
  ELSIF TG_OP = 'UPDATE' THEN
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);
    action_type := 'UPDATE';
  ELSIF TG_OP = 'DELETE' THEN
    old_data := to_jsonb(OLD);
    new_data := NULL;
    action_type := 'DELETE';
  END IF;

  INSERT INTO audit_logs (
    tenant_id,
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values,
    ip_address
  ) VALUES (
    COALESCE(
      (NEW.tenant_id)::UUID,
      (OLD.tenant_id)::UUID,
      get_tenant_id()
    ),
    auth.uid(),
    action_type,
    TG_TABLE_NAME,
    COALESCE((NEW.id)::UUID, (OLD.id)::UUID),
    old_data,
    new_data,
    inet_client_addr()
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- تطبيق الـ Trigger على الجداول الحساسة
CREATE TRIGGER audit_students
  AFTER INSERT OR UPDATE OR DELETE ON students
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_employees
  AFTER INSERT OR UPDATE OR DELETE ON employees
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_invoices
  AFTER INSERT OR UPDATE OR DELETE ON invoices
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_payments
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_salaries
  AFTER INSERT OR UPDATE OR DELETE ON salaries
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_grades
  AFTER INSERT OR UPDATE OR DELETE ON grades
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON user_roles
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- ============================================================
-- FUNCTION: تحديث updated_at تلقائياً
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- تطبيق على جميع الجداول التي تحتوي على updated_at
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_academic_years_updated_at
  BEFORE UPDATE ON academic_years FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_classes_updated_at
  BEFORE UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_enrollments_updated_at
  BEFORE UPDATE ON enrollments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_subjects_updated_at
  BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_exams_updated_at
  BEFORE UPDATE ON exams FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_grades_updated_at
  BEFORE UPDATE ON grades FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_timetable_updated_at
  BEFORE UPDATE ON timetable FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_attendance_updated_at
  BEFORE UPDATE ON attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_salaries_updated_at
  BEFORE UPDATE ON salaries FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_leave_requests_updated_at
  BEFORE UPDATE ON leave_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_fee_structures_updated_at
  BEFORE UPDATE ON fee_structures FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_custom_fields_updated_at
  BEFORE UPDATE ON custom_fields FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_custom_field_values_updated_at
  BEFORE UPDATE ON custom_field_values FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_module_subscriptions_updated_at
  BEFORE UPDATE ON module_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_workflows_updated_at
  BEFORE UPDATE ON workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_approvals_updated_at
  BEFORE UPDATE ON approvals FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- FUNCTION: حساب GPA للطالب
-- ============================================================
CREATE OR REPLACE FUNCTION calculate_student_gpa(p_student_id UUID, p_tenant_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  gpa NUMERIC;
BEGIN
  SELECT
    ROUND(
      SUM(
        CASE
          WHEN (g.score / e.max_score * 100) >= 90 THEN 4.0 * s.credits
          WHEN (g.score / e.max_score * 100) >= 80 THEN 3.0 * s.credits
          WHEN (g.score / e.max_score * 100) >= 70 THEN 2.0 * s.credits
          WHEN (g.score / e.max_score * 100) >= 60 THEN 1.0 * s.credits
          ELSE 0.0
        END
      ) / NULLIF(SUM(s.credits), 0),
      2
    )
  INTO gpa
  FROM grades g
  JOIN exams e ON g.exam_id = e.id
  JOIN subjects s ON e.subject_id = s.id
  WHERE g.student_id = p_student_id
    AND g.tenant_id = p_tenant_id
    AND g.deleted_at IS NULL;

  RETURN COALESCE(gpa, 0.0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: التحقق من تعارض الجدول الدراسي
-- ============================================================
CREATE OR REPLACE FUNCTION check_timetable_conflict()
RETURNS TRIGGER AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  -- التحقق من تعارض المعلم
  SELECT COUNT(*) INTO conflict_count
  FROM timetable
  WHERE tenant_id = NEW.tenant_id
    AND teacher_id = NEW.teacher_id
    AND day_of_week = NEW.day_of_week
    AND academic_year_id = NEW.academic_year_id
    AND id != COALESCE(NEW.id, gen_random_uuid())
    AND deleted_at IS NULL
    AND (
      (NEW.start_time, NEW.end_time) OVERLAPS (start_time, end_time)
    );

  IF conflict_count > 0 THEN
    RAISE EXCEPTION 'تعارض في جدول المعلم: المعلم لديه حصة في نفس الوقت'
      USING ERRCODE = 'P0001';
  END IF;

  -- التحقق من تعارض القاعة
  IF NEW.room IS NOT NULL THEN
    SELECT COUNT(*) INTO conflict_count
    FROM timetable
    WHERE tenant_id = NEW.tenant_id
      AND room = NEW.room
      AND day_of_week = NEW.day_of_week
      AND academic_year_id = NEW.academic_year_id
      AND id != COALESCE(NEW.id, gen_random_uuid())
      AND deleted_at IS NULL
      AND (
        (NEW.start_time, NEW.end_time) OVERLAPS (start_time, end_time)
      );

    IF conflict_count > 0 THEN
      RAISE EXCEPTION 'تعارض في القاعة: القاعة % محجوزة في نفس الوقت', NEW.room
        USING ERRCODE = 'P0002';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_timetable_conflict_trigger
  BEFORE INSERT OR UPDATE ON timetable
  FOR EACH ROW EXECUTE FUNCTION check_timetable_conflict();

-- ============================================================
-- FUNCTION: تحديث رصيد الفاتورة عند تسجيل دفعة
-- ============================================================
CREATE OR REPLACE FUNCTION update_invoice_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE invoices
  SET
    paid_amount = paid_amount + NEW.amount,
    status = CASE
      WHEN (paid_amount + NEW.amount) >= (total_amount - discount_amount) THEN 'paid'::invoice_status
      WHEN (paid_amount + NEW.amount) > 0 THEN 'partial'::invoice_status
      ELSE 'pending'::invoice_status
    END,
    updated_at = NOW()
  WHERE id = NEW.invoice_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_invoice_after_payment
  AFTER INSERT ON payments
  FOR EACH ROW EXECUTE FUNCTION update_invoice_on_payment();
