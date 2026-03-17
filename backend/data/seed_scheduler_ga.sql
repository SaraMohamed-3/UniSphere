-- Seed data for GA scheduler (rooms + time slots + classes if present)
-- Safe to run multiple times.

BEGIN;

-- Rooms
INSERT INTO rooms (name, capacity)
VALUES
  ('Lab 301', 40),
  ('Hall B-201', 50),
  ('Hall C-105', 35),
  ('Project Studio', 30)
ON CONFLICT (name) DO UPDATE
SET capacity = EXCLUDED.capacity;

-- Time slots (one-hour blocks)
INSERT INTO time_slots (day, start_time, end_time)
VALUES
  ('Saturday', '08:30', '09:30'),
  ('Saturday', '09:30', '10:30'),
  ('Saturday', '10:30', '11:30'),
  ('Sunday', '08:30', '09:30'),
  ('Sunday', '09:30', '10:30'),
  ('Sunday', '10:30', '11:30'),
  ('Monday', '10:30', '11:30'),
  ('Monday', '11:30', '12:30'),
  ('Tuesday', '11:30', '12:30'),
  ('Tuesday', '12:30', '13:30'),
  ('Wednesday', '12:30', '13:30'),
  ('Thursday', '13:30', '14:30')
ON CONFLICT DO NOTHING;

COMMIT;

