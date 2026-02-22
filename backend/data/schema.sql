-- ===============================
-- UniSphere SIS Database Schema
-- ===============================

-- -------------------------------
-- Departments Table
-- -------------------------------
CREATE TABLE IF NOT EXISTS departments (
  department_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- -------------------------------
-- Users Table (Auth + Roles)
-- -------------------------------
CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL
    CHECK (role IN ('admin', 'student', 'professor')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- -------------------------------
-- Students Table
-- -------------------------------
CREATE TABLE IF NOT EXISTS students (
  student_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  department_id INT NOT NULL,
  enrollment_year INTEGER,
  CONSTRAINT fk_student_user
    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE,
  CONSTRAINT fk_student_department
    FOREIGN KEY (department_id)
    REFERENCES departments(department_id)
    ON DELETE CASCADE
);

-- -------------------------------
-- Professors Table
-- -------------------------------
CREATE TABLE IF NOT EXISTS professors (
  professor_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  department_id INT NOT NULL,
  office_hours TEXT,
  CONSTRAINT fk_prof_user
    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE,
  CONSTRAINT fk_prof_department
    FOREIGN KEY (department_id)
    REFERENCES departments(department_id)
    ON DELETE CASCADE
);

-- -------------------------------
-- Courses Table
-- -------------------------------
CREATE TABLE IF NOT EXISTS courses (
    course_id SERIAL PRIMARY KEY,
    course_code VARCHAR(20) NOT NULL UNIQUE,
    course_name VARCHAR(100) NOT NULL,
    credits INTEGER,
    department_id INTEGER REFERENCES departments(department_id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- -------------------------------
-- Classes (Sections) Table
-- -------------------------------
CREATE TABLE IF NOT EXISTS classes (
    class_id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    professor_id INTEGER REFERENCES professors(professor_id) ON DELETE SET NULL,
    semester VARCHAR(20) NOT NULL,
    year INTEGER NOT NULL,
    schedule VARCHAR(100),
    room VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(course_id, professor_id, semester, year)
);

-- -------------------------------
-- Enrollments Table (students in classes)
-- -------------------------------
CREATE TABLE IF NOT EXISTS enrollments (
    enrollment_id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    class_id INTEGER NOT NULL REFERENCES classes(class_id) ON DELETE CASCADE,
    enrollment_date TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'dropped', 'completed')),
    UNIQUE(student_id, class_id)
);

-- -------------------------------
-- Grades Table
-- -------------------------------
CREATE TABLE IF NOT EXISTS grades (
    grade_id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    class_id INTEGER NOT NULL REFERENCES classes(class_id) ON DELETE CASCADE,
    grade_component VARCHAR(50) NOT NULL,
    score DECIMAL(5,2),
    max_score DECIMAL(5,2) DEFAULT 100,
    weight DECIMAL(3,2),
    date_recorded DATE DEFAULT CURRENT_DATE,
    recorded_by INTEGER REFERENCES professors(professor_id) ON DELETE SET NULL,
    UNIQUE(student_id, class_id, grade_component)
);

-- -------------------------------
-- Attendance Table
-- -------------------------------
CREATE TABLE IF NOT EXISTS attendance (
    attendance_id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    class_id INTEGER NOT NULL REFERENCES classes(class_id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
    recorded_by INTEGER REFERENCES professors(professor_id) ON DELETE SET NULL,
    notes TEXT,
    UNIQUE(student_id, class_id, date)
);

-- -------------------------------
-- Announcements Table
-- -------------------------------
CREATE TABLE IF NOT EXISTS announcements (
    announcement_id SERIAL PRIMARY KEY,
    class_id INTEGER REFERENCES classes(class_id) ON DELETE CASCADE,
    professor_id INTEGER REFERENCES professors(professor_id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    posted_date TIMESTAMP DEFAULT NOW(),
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- -------------------------------
-- Indexes for Performance
-- -------------------------------
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_class ON enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_grades_student ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_class ON grades(class_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_class ON attendance(class_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_announcements_class ON announcements(class_id);

-- -------------------------------
-- Default Departments Seed Data
-- -------------------------------
INSERT INTO departments (name)
VALUES
  ('Computer Engineering'),
  ('Electrical Engineering'),
  ('Mechanical Engineering')
ON CONFLICT (name) DO NOTHING;