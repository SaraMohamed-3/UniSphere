-- =====================================================
-- Professor feature indexing
-- Focused on professor dashboard, class management,
-- grading, attendance, announcements, and assignments.
-- =====================================================

-- Fast path for professor-owned class lists and today's schedule.
CREATE INDEX IF NOT EXISTS idx_classes_professor_semester_course
  ON classes(professor_id, semester DESC, course_id);

CREATE INDEX IF NOT EXISTS idx_classes_professor_day_time
  ON classes(professor_id, day, time_start);

-- Supports grade existence checks and professor grade listings.
CREATE INDEX IF NOT EXISTS idx_grades_enrollment_assessment
  ON grades(enrollment_id, assessment_type);

CREATE INDEX IF NOT EXISTS idx_grades_enrollment_graded_at
  ON grades(enrollment_id, graded_at DESC);

-- Supports attendance timelines and daily attendance existence checks.
CREATE INDEX IF NOT EXISTS idx_attendance_enrollment_recorded_at
  ON attendance(enrollment_id, recorded_at DESC);

-- Speeds professor announcement lists and unpublished counts.
CREATE INDEX IF NOT EXISTS idx_course_announcements_class_created_at
  ON course_announcements(class_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_course_announcements_unpublished_class
  ON course_announcements(class_id)
  WHERE is_published = FALSE;

-- Speeds professor assignment lists ordered by newest first.
CREATE INDEX IF NOT EXISTS idx_assignments_class_created_at
  ON assignments(class_id, created_at DESC);

-- Supports professor submission inbox, recent submissions,
-- and status-based review queues.
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment_submitted_at
  ON assignment_submissions(assignment_id, submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment_status
  ON assignment_submissions(assignment_id, status);
