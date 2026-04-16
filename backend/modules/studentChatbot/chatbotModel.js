const db = require("../../data/db");

async function ensureChatbotSchema() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS student_chatbot_threads (
      thread_id SERIAL PRIMARY KEY,
      student_id INT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
      title VARCHAR(120) NOT NULL DEFAULT 'Student AI Assistant',
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
      UNIQUE (student_id)
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS student_chatbot_messages (
      message_id SERIAL PRIMARY KEY,
      thread_id INT NOT NULL REFERENCES student_chatbot_threads(thread_id) ON DELETE CASCADE,
      role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
      content TEXT NOT NULL,
      provider VARCHAR(40),
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await db.query(
    "CREATE INDEX IF NOT EXISTS idx_student_chatbot_messages_thread ON student_chatbot_messages(thread_id, created_at, message_id)",
  );
}

async function getOrCreateThread(studentId) {
  await ensureChatbotSchema();

  const existing = await db.query(
    `
    SELECT thread_id, student_id, title, created_at, updated_at
    FROM student_chatbot_threads
    WHERE student_id = $1
    LIMIT 1
    `,
    [studentId],
  );

  if (existing.rows[0]) {
    return existing.rows[0];
  }

  const created = await db.query(
    `
    INSERT INTO student_chatbot_threads (student_id)
    VALUES ($1)
    RETURNING thread_id, student_id, title, created_at, updated_at
    `,
    [studentId],
  );

  return created.rows[0];
}

async function getMessages(threadId) {
  await ensureChatbotSchema();

  const result = await db.query(
    `
    SELECT message_id, thread_id, role, content, provider, created_at
    FROM student_chatbot_messages
    WHERE thread_id = $1
    ORDER BY created_at ASC, message_id ASC
    `,
    [threadId],
  );

  return result.rows;
}

async function addMessage(threadId, role, content, provider = null) {
  await ensureChatbotSchema();

  const inserted = await db.query(
    `
    INSERT INTO student_chatbot_messages (thread_id, role, content, provider)
    VALUES ($1, $2, $3, $4)
    RETURNING message_id, thread_id, role, content, provider, created_at
    `,
    [threadId, role, content, provider],
  );

  await db.query(
    `
    UPDATE student_chatbot_threads
    SET updated_at = NOW()
    WHERE thread_id = $1
    `,
    [threadId],
  );

  return inserted.rows[0];
}

async function clearMessages(threadId) {
  await ensureChatbotSchema();

  await db.query(
    `
    DELETE FROM student_chatbot_messages
    WHERE thread_id = $1
    `,
    [threadId],
  );

  await db.query(
    `
    UPDATE student_chatbot_threads
    SET updated_at = NOW()
    WHERE thread_id = $1
    `,
    [threadId],
  );
}

async function getStudentProfile(studentId, userId) {
  const result = await db.query(
    `
    SELECT
      s.student_id,
      s.department_id,
      d.name AS department_name,
      u.user_id,
      u.email,
      COALESCE(NULLIF(BTRIM(u.full_name), ''), u.email) AS full_name
    FROM students s
    JOIN users u ON u.user_id = s.user_id
    LEFT JOIN departments d ON d.department_id = s.department_id
    WHERE s.student_id = $1 AND s.user_id = $2
    LIMIT 1
    `,
    [studentId, userId],
  );

  return result.rows[0] || null;
}

async function getRecentGradeSummary(studentId) {
  const result = await db.query(
    `
    SELECT
      co.code AS course_code,
      co.name AS course_name,
      c.semester,
      c.year,
      COUNT(g.grade_id)::int AS graded_items,
      COALESCE(
        ROUND(AVG((g.score::numeric / NULLIF(g.max_score, 0)) * 100), 2),
        0
      ) AS avg_percent
    FROM enrollments e
    JOIN classes c ON c.class_id = e.class_id
    JOIN courses co ON co.course_id = c.course_id
    LEFT JOIN grades g ON g.enrollment_id = e.enrollment_id
    WHERE e.student_id = $1
    GROUP BY co.code, co.name, c.semester, c.year, e.enrollment_id
    ORDER BY c.year DESC NULLS LAST, c.semester DESC, co.code ASC
    LIMIT 6
    `,
    [studentId],
  );

  return result.rows;
}

async function getActiveFlagCount(studentId) {
  const result = await db.query(
    `
    SELECT COUNT(*)::int AS count
    FROM academic_flags
    WHERE student_id = $1
      AND status = 'active'
    `,
    [studentId],
  );

  return Number(result.rows[0]?.count || 0);
}

async function getRecentAnnouncements() {
  const result = await db.query(
    `
    SELECT title, body, created_at
    FROM announcements
    WHERE is_published = TRUE
    ORDER BY created_at DESC
    LIMIT 3
    `,
  );

  return result.rows;
}

module.exports = {
  ensureChatbotSchema,
  getOrCreateThread,
  getMessages,
  addMessage,
  clearMessages,
  getStudentProfile,
  getRecentGradeSummary,
  getActiveFlagCount,
  getRecentAnnouncements,
};
