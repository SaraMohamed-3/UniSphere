-- ===============================
-- Registration Load Policy
-- ===============================

CREATE TABLE IF NOT EXISTS registration_load_policies (
  policy_id SERIAL PRIMARY KEY,
  halfload_gpa_threshold NUMERIC(3,2) NOT NULL DEFAULT 2.00,
  halfload_max_credits INT NOT NULL DEFAULT 9,
  regular_max_credits INT NOT NULL DEFAULT 18,
  overload_gpa_threshold NUMERIC(3,2) NOT NULL DEFAULT 3.30,
  overload_max_credits INT NOT NULL DEFAULT 21,
  updated_by INT REFERENCES users(user_id) ON DELETE SET NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CHECK (halfload_gpa_threshold >= 0 AND halfload_gpa_threshold <= 4.00),
  CHECK (overload_gpa_threshold >= 0 AND overload_gpa_threshold <= 4.00),
  CHECK (halfload_max_credits > 0),
  CHECK (regular_max_credits >= halfload_max_credits),
  CHECK (overload_max_credits >= regular_max_credits),
  CHECK (overload_gpa_threshold >= halfload_gpa_threshold)
);

INSERT INTO registration_load_policies (
  halfload_gpa_threshold,
  halfload_max_credits,
  regular_max_credits,
  overload_gpa_threshold,
  overload_max_credits
)
SELECT 2.00, 9, 18, 3.30, 21
WHERE NOT EXISTS (SELECT 1 FROM registration_load_policies);
