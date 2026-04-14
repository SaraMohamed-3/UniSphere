CREATE TABLE IF NOT EXISTS rooms (
  room_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  capacity INT NOT NULL DEFAULT 0 CHECK (capacity >= 0)
);

CREATE TABLE IF NOT EXISTS time_slots (
  slot_id SERIAL PRIMARY KEY,
  day TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  CHECK (start_time < end_time)
);

CREATE INDEX IF NOT EXISTS idx_time_slots_day_time
  ON time_slots (day, start_time);

CREATE TABLE IF NOT EXISTS professor_unavailability (
  unavailability_id SERIAL PRIMARY KEY,
  professor_id INT NOT NULL REFERENCES professors(professor_id) ON DELETE CASCADE,
  slot_id INT NOT NULL REFERENCES time_slots(slot_id) ON DELETE CASCADE,
  reason TEXT,
  UNIQUE (professor_id, slot_id)
);

CREATE TABLE IF NOT EXISTS schedule_runs (
  run_id SERIAL PRIMARY KEY,
  created_by INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  semester VARCHAR(20),
  year INT,
  best_score NUMERIC(12,2),
  meta JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS schedule_run_assignments (
  assignment_id SERIAL PRIMARY KEY,
  run_id INT NOT NULL REFERENCES schedule_runs(run_id) ON DELETE CASCADE,
  class_id INT NOT NULL REFERENCES classes(class_id) ON DELETE CASCADE,
  course_code VARCHAR(20),
  professor_id INT,
  room_id INT,
  room_name TEXT,
  day TEXT,
  time_range TEXT
);
