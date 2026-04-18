-- ===============================
-- Classes Fields For Registration
-- ===============================

ALTER TABLE classes
ADD COLUMN IF NOT EXISTS section VARCHAR(10);

ALTER TABLE classes
ADD COLUMN IF NOT EXISTS max_capacity INT DEFAULT 50;

ALTER TABLE classes
ADD COLUMN IF NOT EXISTS day TEXT;

ALTER TABLE classes
ADD COLUMN IF NOT EXISTS time_start TIME;

ALTER TABLE classes
ADD COLUMN IF NOT EXISTS time_end TIME;

ALTER TABLE classes
ADD COLUMN IF NOT EXISTS location TEXT;

UPDATE classes
SET max_capacity = COALESCE(max_capacity, 50)
WHERE max_capacity IS NULL;
