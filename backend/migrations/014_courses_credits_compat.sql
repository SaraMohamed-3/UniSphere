-- ===============================
-- Courses Credits Compatibility
-- ===============================

ALTER TABLE courses
ADD COLUMN IF NOT EXISTS credits INT;

UPDATE courses
SET credits = COALESCE(credits, credit_hours, 3)
WHERE credits IS NULL;
