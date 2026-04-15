-- ===============================
-- Academic Monitoring & Flagging
-- ===============================

-- Settings table for admin-configurable thresholds
CREATE TABLE IF NOT EXISTS academic_monitoring_settings (
  setting_id SERIAL PRIMARY KEY,
  threshold NUMERIC(5,2) NOT NULL DEFAULT 60.00,  -- percentage below which student is flagged
  updated_by INT REFERENCES users(user_id) ON DELETE SET NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Insert default threshold of 60%
INSERT INTO academic_monitoring_settings (threshold)
SELECT 60.00
WHERE NOT EXISTS (SELECT 1 FROM academic_monitoring_settings);

-- Flagged students table
CREATE TABLE IF NOT EXISTS academic_flags (
  flag_id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  flagged_by INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  reason TEXT,                          -- e.g. "Score 45% in CS101 < threshold 60%"
  grade_id INT REFERENCES grades(grade_id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'resolved', 'dismissed')),
  resolved_by INT REFERENCES users(user_id) ON DELETE SET NULL,
  resolved_at TIMESTAMP,
  notes TEXT,                           -- admin notes when resolving
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_academic_flags_student ON academic_flags(student_id);
CREATE INDEX IF NOT EXISTS idx_academic_flags_status  ON academic_flags(status);
