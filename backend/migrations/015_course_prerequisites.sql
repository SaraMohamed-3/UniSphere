CREATE TABLE IF NOT EXISTS prerequisites (
  prerequisite_id SERIAL PRIMARY KEY,
  course_id INT NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
  required_course_id INT NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (course_id, required_course_id),
  CHECK (course_id <> required_course_id)
);

CREATE INDEX IF NOT EXISTS idx_prerequisites_course_id
  ON prerequisites(course_id);

CREATE INDEX IF NOT EXISTS idx_prerequisites_required_course_id
  ON prerequisites(required_course_id);
