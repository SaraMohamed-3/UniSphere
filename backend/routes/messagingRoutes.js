const express = require("express");

const db = require("../data/db");
const { verifyJWT } = require("../middleware/auth");

const router = express.Router();

function getUserId(req) {
  return req.user?.userId ?? req.user?.user_id ?? req.user?.id ?? null;
}

async function getUserRoles(userIds) {
  const result = await db.query(
    `
    SELECT user_id, role, email, COALESCE(NULLIF(BTRIM(full_name), ''), email) AS full_name, is_active
    FROM users
    WHERE user_id = ANY($1::int[])
    `,
    [userIds],
  );

  return new Map(result.rows.map((row) => [Number(row.user_id), row]));
}

async function assertMessagingAllowed(currentUserId, otherUserId) {
  if (!Number.isInteger(otherUserId) || otherUserId <= 0) {
    return { ok: false, status: 400, message: "Invalid user id" };
  }
  if (currentUserId === otherUserId) {
    return { ok: false, status: 400, message: "You cannot message yourself" };
  }

  const usersById = await getUserRoles([currentUserId, otherUserId]);
  const current = usersById.get(currentUserId);
  const other = usersById.get(otherUserId);

  if (!current || !other) {
    return { ok: false, status: 404, message: "User not found" };
  }
  if (!current.is_active || !other.is_active) {
    return { ok: false, status: 403, message: "Messaging is unavailable for inactive accounts" };
  }
  if (current.role === "student" && other.role === "student") {
    return { ok: false, status: 403, message: "Student-to-student messaging is not allowed" };
  }

  return { ok: true, current, other };
}

async function findConversation(userA, userB) {
  const result = await db.query(
    `
    SELECT conversation_id, participant_a, participant_b, created_at
    FROM conversations
    WHERE (participant_a = $1 AND participant_b = $2)
       OR (participant_a = $2 AND participant_b = $1)
    LIMIT 1
    `,
    [userA, userB],
  );

  if (result.rows.length > 0) {
    return result.rows[0];
  }

  const created = await db.query(
    `
    INSERT INTO conversations (participant_a, participant_b)
    VALUES ($1, $2)
    RETURNING conversation_id, participant_a, participant_b, created_at
    `,
    [userA, userB],
  );

  return created.rows[0];
}

router.get("/users", verifyJWT, async (req, res) => {
  try {
    const currentUserId = getUserId(req);
    const currentRole = String(req.user?.role || "").toLowerCase();
    const values = [currentUserId];
    let where = "WHERE is_active = TRUE AND user_id <> $1";

    if (currentRole === "student") {
      where += " AND role <> 'student'";
    }

    const result = await db.query(
      `
      SELECT user_id, email, role, COALESCE(NULLIF(BTRIM(full_name), ''), email) AS full_name
      FROM users
      ${where}
      ORDER BY role ASC, full_name ASC, email ASC
      `,
      values,
    );

    res.json({
      users: result.rows,
      myRole: currentRole,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load users" });
  }
});

router.get("/conversations", verifyJWT, async (req, res) => {
  try {
    const currentUserId = getUserId(req);
    const result = await db.query(
      `
      SELECT
        c.conversation_id,
        other.user_id AS other_user_id,
        COALESCE(NULLIF(BTRIM(other.full_name), ''), other.email) AS other_name,
        other.email AS other_email,
        other.role AS other_role,
        last_message.body AS last_message,
        last_message.sender_id AS last_sender_id,
        last_message.created_at AS last_message_at,
        COALESCE(unread.unread_count, 0) AS unread_count
      FROM conversations c
      JOIN users other
        ON other.user_id = CASE
          WHEN c.participant_a = $1 THEN c.participant_b
          ELSE c.participant_a
        END
      LEFT JOIN LATERAL (
        SELECT m.body, m.sender_id, m.created_at
        FROM messages m
        WHERE m.conversation_id = c.conversation_id
        ORDER BY m.created_at DESC, m.message_id DESC
        LIMIT 1
      ) AS last_message ON TRUE
      LEFT JOIN LATERAL (
        SELECT COUNT(*)::int AS unread_count
        FROM messages m
        WHERE m.conversation_id = c.conversation_id
          AND m.is_read = FALSE
          AND m.sender_id <> $1
      ) AS unread ON TRUE
      WHERE c.participant_a = $1 OR c.participant_b = $1
      ORDER BY last_message_at DESC NULLS LAST, c.created_at DESC
      `,
      [currentUserId],
    );

    res.json({ conversations: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load conversations" });
  }
});

router.get("/with/:userId", verifyJWT, async (req, res) => {
  try {
    const currentUserId = getUserId(req);
    const otherUserId = Number(req.params.userId);
    const access = await assertMessagingAllowed(currentUserId, otherUserId);

    if (!access.ok) {
      return res.status(access.status).json({ message: access.message });
    }

    const conversation = await findConversation(currentUserId, otherUserId);

    await db.query(
      `
      UPDATE messages
      SET is_read = TRUE
      WHERE conversation_id = $1
        AND sender_id <> $2
        AND is_read = FALSE
      `,
      [conversation.conversation_id, currentUserId],
    );

    const messagesResult = await db.query(
      `
      SELECT
        m.message_id,
        m.conversation_id,
        m.sender_id,
        m.body,
        m.is_read,
        m.created_at,
        COALESCE(NULLIF(BTRIM(u.full_name), ''), u.email) AS sender_name
      FROM messages m
      JOIN users u ON u.user_id = m.sender_id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at ASC, m.message_id ASC
      `,
      [conversation.conversation_id],
    );

    res.json({
      conversationId: conversation.conversation_id,
      messages: messagesResult.rows,
      otherUser: {
        user_id: access.other.user_id,
        full_name: access.other.full_name,
        email: access.other.email,
        role: access.other.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load conversation" });
  }
});

router.post("/send", verifyJWT, async (req, res) => {
  try {
    const senderId = getUserId(req);
    const recipientId = Number(req.body?.recipient_id);
    const body = String(req.body?.body || "").trim();
    const access = await assertMessagingAllowed(senderId, recipientId);

    if (!access.ok) {
      return res.status(access.status).json({ message: access.message });
    }
    if (!body) {
      return res.status(400).json({ message: "Message body is required" });
    }
    if (body.length > 2000) {
      return res.status(400).json({ message: "Message body must be 2000 characters or less" });
    }

    const conversation = await findConversation(senderId, recipientId);
    const result = await db.query(
      `
      INSERT INTO messages (conversation_id, sender_id, body)
      VALUES ($1, $2, $3)
      RETURNING message_id, conversation_id, sender_id, body, is_read, created_at
      `,
      [conversation.conversation_id, senderId, body],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Send failed" });
  }
});

module.exports = router;
