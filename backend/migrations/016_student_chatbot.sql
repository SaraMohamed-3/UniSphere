CREATE TABLE IF NOT EXISTS student_chatbot_threads (
  thread_id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  title VARCHAR(120) NOT NULL DEFAULT 'Student AI Assistant',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (student_id)
);

CREATE TABLE IF NOT EXISTS student_chatbot_messages (
  message_id SERIAL PRIMARY KEY,
  thread_id INT NOT NULL REFERENCES student_chatbot_threads(thread_id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  provider VARCHAR(40),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_chatbot_messages_thread
  ON student_chatbot_messages(thread_id, created_at, message_id);
