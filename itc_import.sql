BEGIN;

-- 1) Make sure department 1 exists
INSERT INTO departments (department_id, name)
VALUES (1, 'ITC Department')
ON CONFLICT (department_id) DO NOTHING;

-- 2) Teacher users
INSERT INTO users (email, password_hash, role, is_active)
VALUES
  ('t000@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t001@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t002@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t003@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t004@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t005@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t006@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t007@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t008@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t009@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t010@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t011@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t012@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t013@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t014@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t015@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t016@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t017@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t018@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t019@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t020@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t021@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t022@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t023@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t024@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t025@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t026@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t027@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t028@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t029@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t030@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t031@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t032@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t033@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t034@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t035@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t036@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t037@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t038@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t039@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t040@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t041@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t042@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t043@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t044@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t045@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t046@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t047@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t048@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE),
  ('t049@itc.local', '$2b$10$IgEYE3nrNedKfWPOGx4KJuh.TXs1Jnbj8Wnkx7KxlPTo92V1C/BIO', 'professor', TRUE)
ON CONFLICT (email) DO NOTHING;

-- 3) Professors
INSERT INTO professors (user_id, department_id)
SELECT user_id, 1
FROM users
WHERE email LIKE 't___@itc.local'
ON CONFLICT (user_id) DO NOTHING;

-- 4) Courses
INSERT INTO courses (code, name, department_id, credit_hours)
VALUES
  ('c0007','c0007',1,3),
  ('c0009','c0009',1,3),
  ('c0015','c0015',1,3),
  ('c0019','c0019',1,3),
  ('c0020','c0020',1,3),
  ('c0023','c0023',1,3),
  ('c0024','c0024',1,3),
  ('c0044','c0044',1,3),
  ('c0047','c0047',1,3),
  ('c0049','c0049',1,3),
  ('c0053','c0053',1,3),
  ('c0056','c0056',1,3),
  ('c0058','c0058',1,3),
  ('c0061','c0061',1,3),
  ('c0062','c0062',1,3),
  ('c0069','c0069',1,3),
  ('c0072','c0072',1,3),
  ('c0074','c0074',1,3),
  ('c0088','c0088',1,3),
  ('c0095','c0095',1,3),
  ('c0103','c0103',1,3),
  ('c0106','c0106',1,3),
  ('c0108','c0108',1,3),
  ('c0110','c0110',1,3),
  ('c0113','c0113',1,3),
  ('c0115','c0115',1,3),
  ('c0118','c0118',1,3),
  ('c0127','c0127',1,3),
  ('c0129','c0129',1,3),
  ('c0131','c0131',1,3),
  ('c0132','c0132',1,3),
  ('c0133','c0133',1,3),
  ('c0152','c0152',1,3),
  ('c0153','c0153',1,3),
  ('c0162','c0162',1,3),
  ('c0178','c0178',1,3),
  ('c0191','c0191',1,3),
  ('c0193','c0193',1,3),
  ('c0195','c0195',1,3),
  ('c0201','c0201',1,3),
  ('c0203','c0203',1,3),
  ('c0206','c0206',1,3),
  ('c0211','c0211',1,3),
  ('c0213','c0213',1,3),
  ('c0217','c0217',1,3),
  ('c0219','c0219',1,3),
  ('c0221','c0221',1,3),
  ('c0225','c0225',1,3),
  ('c0230','c0230',1,3),
  ('c0232','c0232',1,3),
  ('c0238','c0238',1,3),
  ('c0252','c0252',1,3),
  ('c0253','c0253',1,3),
  ('c0257','c0257',1,3),
  ('c0279','c0279',1,3),
  ('c0411','c0411',1,3),
  ('c0412','c0412',1,3)
ON CONFLICT (code) DO NOTHING;

-- 5) Classes
INSERT INTO classes (course_id, professor_id, semester, year, section, max_capacity, day, time_start, time_end, location)
SELECT c.course_id, p.professor_id, 'Spring', 2026, 'A', v.size, NULL, NULL, NULL, NULL
FROM (
  VALUES
    ('c0007','t000',12),
    ('c0009','t001',16),
    ('c0015','t002',15),
    ('c0019','t003',31),
    ('c0020','t004',12),
    ('c0023','t005',111),
    ('c0024','t006',38),
    ('c0044','t007',110),
    ('c0047','t008',100),
    ('c0049','t009',55),
    ('c0053','t010',60),
    ('c0056','t011',110),
    ('c0058','t012',100),
    ('c0061','t013',55),
    ('c0062','t014',55),
    ('c0069','t010',110),
    ('c0072','t015',127),
    ('c0074','t016',13),
    ('c0088','t017',85),
    ('c0095','t018',90),
    ('c0103','t019',80),
    ('c0106','t020',147),
    ('c0108','t021',90),
    ('c0110','t012',160),
    ('c0113','t022',125),
    ('c0115','t023',136),
    ('c0118','t024',33),
    ('c0127','t025',90),
    ('c0129','t026',105),
    ('c0131','t027',105),
    ('c0132','t027',105),
    ('c0133','t028',100),
    ('c0152','t029',105),
    ('c0153','t030',105),
    ('c0162','t031',102),
    ('c0178','t032',90),
    ('c0191','t033',80),
    ('c0193','t034',106),
    ('c0195','t011',90),
    ('c0201','t035',105),
    ('c0203','t029',75),
    ('c0206','t036',90),
    ('c0211','t037',130),
    ('c0213','t038',130),
    ('c0217','t001',98),
    ('c0219','t039',83),
    ('c0221','t031',98),
    ('c0225','t040',83),
    ('c0230','t041',113),
    ('c0232','t042',50),
    ('c0238','t043',130),
    ('c0252','t044',120),
    ('c0253','t045',85),
    ('c0257','t046',157),
    ('c0279','t047',105),
    ('c0411','t048',57),
    ('c0412','t049',20)
) AS v(course_code, teacher_code, size)
JOIN courses c ON c.code = v.course_code
JOIN users u ON u.email = v.teacher_code || '@itc.local'
JOIN professors p ON p.user_id = u.user_id
WHERE NOT EXISTS (
  SELECT 1
  FROM classes x
  WHERE x.course_id = c.course_id
    AND x.professor_id = p.professor_id
    AND x.semester = 'Spring'
    AND x.year = 2026
    AND x.section = 'A'
);

-- 6) ITC rooms
INSERT INTO rooms (name, capacity)
VALUES
  ('25',40),
  ('36',42),
  ('37',42),
  ('38',48),
  ('34',50),
  ('27',65),
  ('51',78),
  ('B',216),
  ('D',216),
  ('F',216),
  ('G',216),
  ('A',312),
  ('L',336),
  ('50',75),
  ('52',60),
  ('DS1',100),
  ('DS2',60),
  ('N',30),
  ('Er1',70),
  ('Er2',70)
ON CONFLICT (name) DO UPDATE
SET capacity = EXCLUDED.capacity;

-- 7) Time slots
INSERT INTO time_slots (day, start_time, end_time)
VALUES
  ('Monday','08:30','09:30'),
  ('Monday','09:30','10:30'),
  ('Monday','10:30','11:30'),
  ('Monday','11:30','12:30'),
  ('Monday','12:30','13:30'),
  ('Tuesday','08:30','09:30'),
  ('Tuesday','09:30','10:30'),
  ('Tuesday','10:30','11:30'),
  ('Tuesday','11:30','12:30'),
  ('Tuesday','12:30','13:30'),
  ('Wednesday','08:30','09:30'),
  ('Wednesday','09:30','10:30'),
  ('Wednesday','10:30','11:30'),
  ('Wednesday','11:30','12:30'),
  ('Wednesday','12:30','13:30'),
  ('Thursday','08:30','09:30'),
  ('Thursday','09:30','10:30'),
  ('Thursday','10:30','11:30'),
  ('Thursday','11:30','12:30'),
  ('Thursday','12:30','13:30'),
  ('Friday','08:30','09:30'),
  ('Friday','09:30','10:30'),
  ('Friday','10:30','11:30'),
  ('Friday','11:30','12:30'),
  ('Friday','12:30','13:30')
ON CONFLICT DO NOTHING;

COMMIT;