-- ===============================
-- In-App Messaging System
-- ===============================

-- Conversations (thread between two users)
CREATE TABLE IF NOT EXISTS conversations (
  conversation_id SERIAL PRIMARY KEY,
  participant_a INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  participant_b INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT no_self_conversation CHECK (participant_a <> participant_b)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_pair
ON conversations (
  LEAST(participant_a, participant_b),
  GREATEST(participant_a, participant_b)
);

CREATE INDEX IF NOT EXISTS idx_conversations_a ON conversations(participant_a);
CREATE INDEX IF NOT EXISTS idx_conversations_b ON conversations(participant_b);

-- Legacy messages table compatibility
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS conversation_id INT;

ALTER TABLE messages
ADD COLUMN IF NOT EXISTS body TEXT;

ALTER TABLE messages
ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE messages
SET body = content
WHERE body IS NULL AND content IS NOT NULL;

-- Create conversations for legacy direct messages
INSERT INTO conversations (participant_a, participant_b)
SELECT DISTINCT
  LEAST(sender_id, receiver_id) AS participant_a,
  GREATEST(sender_id, receiver_id) AS participant_b
FROM messages
WHERE sender_id IS NOT NULL
  AND receiver_id IS NOT NULL
  AND sender_id <> receiver_id
  AND conversation_id IS NULL
ON CONFLICT DO NOTHING;

UPDATE messages m
SET conversation_id = c.conversation_id
FROM conversations c
WHERE m.conversation_id IS NULL
  AND m.sender_id IS NOT NULL
  AND m.receiver_id IS NOT NULL
  AND LEAST(m.sender_id, m.receiver_id) = LEAST(c.participant_a, c.participant_b)
  AND GREATEST(m.sender_id, m.receiver_id) = GREATEST(c.participant_a, c.participant_b);

ALTER TABLE messages
ALTER COLUMN body SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'messages'
      AND constraint_name = 'fk_messages_conversation'
  ) THEN
    ALTER TABLE messages
    ADD CONSTRAINT fk_messages_conversation
    FOREIGN KEY (conversation_id)
    REFERENCES conversations(conversation_id)
    ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(is_read);
