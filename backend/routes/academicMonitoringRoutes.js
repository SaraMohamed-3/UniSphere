const express = require("express");

const db = require("../data/db");
const { verifyJWT, adminOnly, studentOnly } = require("../middleware/auth");

const router = express.Router();

function getUserId(req) {
  return req.user?.userId ?? req.user?.user_id ?? req.user?.id ?? null;
}

async function getThreshold() {
  const result = await db.query(
    `
    SELECT threshold
    FROM academic_monitoring_settings
    ORDER BY setting_id DESC
    LIMIT 1
    `,
  );
  return Number(result.rows[0]?.threshold ?? 60);
}

async function getStudentContextByUserId(userId) {
  const result = await db.query(
    `
    SELECT
      s.student_id,
      s.user_id,
      COALESCE(NULLIF(BTRIM(u.full_name), ''), u.email) AS student_name,
      u.email
    FROM students s
    JOIN users u ON u.user_id = s.user_id
    WHERE s.user_id = $1
    LIMIT 1
    `,
    [userId],
  );
  return result.rows[0] || null;
}

async function createNotification(client, userId, type, title, body, route) {
  await client.query(
    `
    INSERT INTO notifications (user_id, type, title, body, route)
    VALUES ($1, $2, $3, $4, $5)
    `,
    [userId, type, title, body, route],
  );
}

router.get("/threshold", verifyJWT, adminOnly, async (req, res) => {
  try {
    const threshold = await getThreshold();
    res.json({ threshold });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch threshold" });
  }
});

router.put("/threshold", verifyJWT, adminOnly, async (req, res) => {
  try {
    const threshold = Number(req.body?.threshold);
    const userId = getUserId(req);

    if (!Number.isFinite(threshold) || threshold < 0 || threshold > 100) {
      return res.status(400).json({ message: "threshold must be between 0 and 100" });
    }

    await db.query(
      `
      INSERT INTO academic_monitoring_settings (threshold, updated_by)
      VALUES ($1, $2)
      `,
      [threshold, userId],
    );

    res.json({ message: "Threshold updated", threshold });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update threshold" });
  }
});

router.post("/scan", verifyJWT, adminOnly, async (req, res) => {
  const adminUserId = getUserId(req);
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const threshold = await getThreshold();
    const gradesResult = await client.query(
      `
      SELECT
        g.grade_id,
        g.score,
        g.max_score,
        e.student_id,
        s.user_id,
        COALESCE(NULLIF(BTRIM(u.full_name), ''), u.email) AS student_name,
        co.code AS course_code,
        co.name AS course_name,
        ROUND(
          CASE
            WHEN COALESCE(g.max_score, 0) = 0 THEN g.score
            ELSE (g.score / g.max_score) * 100
          END
        , 2) AS percent_score
      FROM grades g
      JOIN enrollments e ON e.enrollment_id = g.enrollment_id
      JOIN students s ON s.student_id = e.student_id
      JOIN users u ON u.user_id = s.user_id
      JOIN classes c ON c.class_id = e.class_id
      JOIN courses co ON co.course_id = c.course_id
      WHERE
        CASE
          WHEN COALESCE(g.max_score, 0) = 0 THEN g.score
          ELSE (g.score / g.max_score) * 100
        END < $1
      ORDER BY percent_score ASC, g.grade_id ASC
      `,
      [threshold],
    );

    let inserted = 0;

    for (const grade of gradesResult.rows) {
      const existing = await client.query(
        `
        SELECT flag_id
        FROM academic_flags
        WHERE student_id = $1
          AND grade_id = $2
          AND status = 'active'
        LIMIT 1
        `,
        [grade.student_id, grade.grade_id],
      );

      if (existing.rows.length > 0) {
        continue;
      }

      const reason = `${grade.course_code} ${grade.course_name}: ${grade.percent_score}% is below the ${threshold}% monitoring threshold.`;

      await client.query(
        `
        INSERT INTO academic_flags (student_id, flagged_by, reason, grade_id)
        VALUES ($1, $2, $3, $4)
        `,
        [grade.student_id, adminUserId, reason, grade.grade_id],
      );

      await createNotification(
        client,
        grade.user_id,
        "academic_flag",
        "Academic monitoring alert",
        `You were placed under academic monitoring for ${grade.course_code} with a score of ${grade.percent_score}%.`,
        "/student/academic-status",
      );

      inserted += 1;
    }

    await client.query("COMMIT");
    res.json({
      message: `Scan complete. ${inserted} new flag${inserted === 1 ? "" : "s"} created.`,
      newFlags: inserted,
      threshold,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Scan failed" });
  } finally {
    client.release();
  }
});

router.get("/flags", verifyJWT, adminOnly, async (req, res) => {
  try {
    const status = String(req.query?.status || "active").toLowerCase();
    const values = [];
    const where = [];

    if (status !== "all") {
      values.push(status);
      where.push(`f.status = $${values.length}`);
    }

    const result = await db.query(
      `
      SELECT
        f.flag_id,
        f.student_id,
        f.flagged_by,
        f.reason,
        f.grade_id,
        f.status,
        f.resolved_by,
        f.resolved_at,
        f.notes,
        f.created_at,
        f.updated_at,
        COALESCE(NULLIF(BTRIM(su.full_name), ''), su.email) AS student_name,
        su.email AS student_email,
        COALESCE(NULLIF(BTRIM(ru.full_name), ''), ru.email) AS resolved_by_name,
        co.code AS course_code,
        co.name AS course_name,
        g.score,
        g.max_score,
        ROUND(
          CASE
            WHEN COALESCE(g.max_score, 0) = 0 THEN g.score
            ELSE (g.score / g.max_score) * 100
          END
        , 2) AS percent_score
      FROM academic_flags f
      JOIN students s ON s.student_id = f.student_id
      JOIN users su ON su.user_id = s.user_id
      LEFT JOIN users ru ON ru.user_id = f.resolved_by
      LEFT JOIN grades g ON g.grade_id = f.grade_id
      LEFT JOIN enrollments e ON e.enrollment_id = g.enrollment_id
      LEFT JOIN classes c ON c.class_id = e.class_id
      LEFT JOIN courses co ON co.course_id = c.course_id
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY
        CASE WHEN f.status = 'active' THEN 0 ELSE 1 END,
        f.created_at DESC
      `,
      values,
    );

    res.json({ flags: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch flags" });
  }
});

router.patch("/flags/:id", verifyJWT, adminOnly, async (req, res) => {
  const client = await db.connect();

  try {
    const action = String(req.body?.action || "").toLowerCase();
    const notes = req.body?.notes ? String(req.body.notes).trim() : null;
    const flagId = Number(req.params.id);
    const adminUserId = getUserId(req);

    if (!Number.isInteger(flagId) || flagId <= 0) {
      return res.status(400).json({ message: "Invalid flag id" });
    }
    if (!["resolved", "dismissed"].includes(action)) {
      return res.status(400).json({ message: "action must be resolved or dismissed" });
    }

    await client.query("BEGIN");

    const existing = await client.query(
      `
      SELECT
        f.flag_id,
        f.status,
        s.user_id,
        COALESCE(NULLIF(BTRIM(u.full_name), ''), u.email) AS student_name
      FROM academic_flags f
      JOIN students s ON s.student_id = f.student_id
      JOIN users u ON u.user_id = s.user_id
      WHERE f.flag_id = $1
      LIMIT 1
      `,
      [flagId],
    );

    if (!existing.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Flag not found" });
    }

    const flag = existing.rows[0];

    const updated = await client.query(
      `
      UPDATE academic_flags
      SET status = $1,
          resolved_by = $2,
          resolved_at = NOW(),
          notes = $3,
          updated_at = NOW()
      WHERE flag_id = $4
      RETURNING *
      `,
      [action, adminUserId, notes, flagId],
    );

    await createNotification(
      client,
      flag.user_id,
      "academic_flag",
      action === "resolved" ? "Academic monitoring resolved" : "Academic monitoring update",
      action === "resolved"
        ? "An administrator marked one of your academic monitoring flags as resolved."
        : "An administrator dismissed one of your academic monitoring flags.",
      "/student/academic-status",
    );

    await client.query("COMMIT");
    res.json({
      message: "Flag updated",
      flag: updated.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  } finally {
    client.release();
  }
});

router.get("/my-flags", verifyJWT, studentOnly, async (req, res) => {
  try {
    const userId = getUserId(req);
    const student = await getStudentContextByUserId(userId);

    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const result = await db.query(
      `
      SELECT
        f.flag_id,
        f.reason,
        f.status,
        f.notes,
        f.created_at,
        f.updated_at,
        f.resolved_at,
        co.code AS course_code,
        co.name AS course_name,
        g.score,
        g.max_score,
        ROUND(
          CASE
            WHEN COALESCE(g.max_score, 0) = 0 THEN g.score
            ELSE (g.score / g.max_score) * 100
          END
        , 2) AS percent_score
      FROM academic_flags f
      LEFT JOIN grades g ON g.grade_id = f.grade_id
      LEFT JOIN enrollments e ON e.enrollment_id = g.enrollment_id
      LEFT JOIN classes c ON c.class_id = e.class_id
      LEFT JOIN courses co ON co.course_id = c.course_id
      WHERE f.student_id = $1
      ORDER BY
        CASE WHEN f.status = 'active' THEN 0 ELSE 1 END,
        f.created_at DESC
      `,
      [student.student_id],
    );

    res.json({
      student,
      flags: result.rows,
      activeCount: result.rows.filter((flag) => flag.status === "active").length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch academic status" });
  }
});

module.exports = router;
