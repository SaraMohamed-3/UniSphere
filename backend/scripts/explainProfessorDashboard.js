const fs = require("fs");
const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });
require("dotenv").config({ path: path.resolve(__dirname, "..", "..", ".env") });

const db = require("../data/db");

const professorEmail = process.env.EXPLAIN_PROFESSOR_EMAIL || process.env.BENCHMARK_PROFESSOR_EMAIL || "t000@itc.local";
const resultsDir = path.resolve(__dirname, "..", "benchmark-results");

function timestamp() {
  const now = new Date();
  const parts = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0"),
  ];
  return `${parts[0]}${parts[1]}${parts[2]}-${parts[3]}${parts[4]}${parts[5]}`;
}

function currentDayName() {
  return new Date().toLocaleDateString("en-US", { weekday: "long" });
}

async function getProfessorContext(email) {
  const result = await db.query(
    `
    SELECT p.professor_id, u.user_id, u.email
    FROM professors p
    JOIN users u ON u.user_id = p.user_id
    WHERE u.email = $1
    `,
    [email],
  );

  if (!result.rows.length) {
    throw new Error(`Professor not found for email: ${email}`);
  }

  return result.rows[0];
}

async function explain(label, sql, params) {
  const result = await db.query(`EXPLAIN (ANALYZE, BUFFERS, VERBOSE, FORMAT TEXT) ${sql}`, params);
  return {
    label,
    params,
    plan: result.rows.map((row) => row["QUERY PLAN"]).join("\n"),
  };
}

function writeResultsFile(payload) {
  fs.mkdirSync(resultsDir, { recursive: true });
  const filePath = path.join(resultsDir, `professor-dashboard-explain-${timestamp()}.txt`);
  const sections = [
    `Professor email: ${payload.professorEmail}`,
    `Professor ID: ${payload.professorId}`,
    `Generated at: ${payload.generatedAt}`,
    "",
  ];

  for (const item of payload.items) {
    sections.push(`===== ${item.label} =====`);
    sections.push(`Params: ${JSON.stringify(item.params)}`);
    sections.push(item.plan);
    sections.push("");
  }

  fs.writeFileSync(filePath, sections.join("\n"), "utf8");
  return filePath;
}

async function main() {
  const professor = await getProfessorContext(professorEmail);
  const professorId = professor.professor_id;
  const dayName = currentDayName();

  const items = [];
  items.push(
    await explain(
      "active_courses",
      `
      SELECT COUNT(*)::int as count
      FROM classes
      WHERE professor_id = $1
      `,
      [professorId],
    ),
  );

  items.push(
    await explain(
      "total_students",
      `
      SELECT COUNT(DISTINCT e.student_id)::int as count
      FROM enrollments e
      JOIN classes c ON e.class_id = c.class_id
      WHERE c.professor_id = $1
      `,
      [professorId],
    ),
  );

  items.push(
    await explain(
      "pending_grading",
      `
      SELECT COUNT(*)::int AS count
      FROM enrollments e
      JOIN classes c ON c.class_id = e.class_id
      WHERE c.professor_id = $1
        AND NOT EXISTS (
          SELECT 1
          FROM grades g
          WHERE g.enrollment_id = e.enrollment_id
        )
      `,
      [professorId],
    ),
  );

  items.push(
    await explain(
      "today_schedule",
      `
      SELECT c.class_id, co.name, co.code, c.time_start, c.time_end, c.location, COUNT(e.student_id) as enrolled
      FROM classes c
      JOIN courses co ON c.course_id = co.course_id
      LEFT JOIN enrollments e ON c.class_id = e.class_id
      WHERE c.professor_id = $1 AND c.day = $2
      GROUP BY c.class_id, co.name, co.code, c.time_start, c.time_end, c.location
      ORDER BY c.time_start
      `,
      [professorId, dayName],
    ),
  );

  items.push(
    await explain(
      "recent_activity",
      `
      SELECT *
      FROM (
        SELECT
          g.graded_at AS ts,
          'grade'::text AS kind,
          co.code AS course_code,
          co.name AS course_name,
          u.email AS student_email
        FROM grades g
        JOIN enrollments e ON e.enrollment_id = g.enrollment_id
        JOIN classes c ON c.class_id = e.class_id
        JOIN courses co ON co.course_id = c.course_id
        JOIN students s ON s.student_id = e.student_id
        JOIN users u ON u.user_id = s.user_id
        WHERE c.professor_id = $1

        UNION ALL

        SELECT
          a.recorded_at AS ts,
          'attendance'::text AS kind,
          co.code AS course_code,
          co.name AS course_name,
          u.email AS student_email
        FROM attendance a
        JOIN enrollments e ON e.enrollment_id = a.enrollment_id
        JOIN classes c ON c.class_id = e.class_id
        JOIN courses co ON co.course_id = c.course_id
        JOIN students s ON s.student_id = e.student_id
        JOIN users u ON u.user_id = s.user_id
        WHERE c.professor_id = $1
      ) x
      ORDER BY ts DESC
      LIMIT 8
      `,
      [professorId],
    ),
  );

  items.push(
    await explain(
      "course_performance",
      `
      SELECT
        c.class_id,
        co.code AS course_code,
        co.name AS course_name,
        COUNT(DISTINCT e.student_id)::int AS students,
        COALESCE(
          ROUND(AVG((g.score::numeric / NULLIF(g.max_score, 0)) * 100), 2),
          0
        ) AS avg_grade_percent,
        COALESCE(
          ROUND(
            CASE WHEN COUNT(a.attendance_id) = 0 THEN 0
            ELSE (SUM(CASE WHEN LOWER(a.status) = 'present' THEN 1 ELSE 0 END)::numeric / COUNT(a.attendance_id)) * 100
            END
          , 2),
          0
        ) AS avg_attendance_percent
      FROM classes c
      JOIN courses co ON co.course_id = c.course_id
      LEFT JOIN enrollments e ON e.class_id = c.class_id
      LEFT JOIN grades g ON g.enrollment_id = e.enrollment_id
      LEFT JOIN attendance a ON a.enrollment_id = e.enrollment_id
      WHERE c.professor_id = $1
      GROUP BY c.class_id, co.code, co.name
      ORDER BY co.code ASC
      `,
      [professorId],
    ),
  );

  items.push(
    await explain(
      "pending_attendance",
      `
      SELECT COUNT(*)::int AS count
      FROM enrollments e
      JOIN classes c ON c.class_id = e.class_id
      WHERE c.professor_id = $1
        AND c.day = $2
        AND NOT EXISTS (
          SELECT 1
          FROM attendance a
          WHERE a.enrollment_id = e.enrollment_id
            AND a.class_date = CURRENT_DATE
        )
      `,
      [professorId, dayName],
    ),
  );

  items.push(
    await explain(
      "pending_announcements",
      `
      SELECT COUNT(*)::int AS count
      FROM course_announcements ca
      JOIN classes c ON c.class_id = ca.class_id
      WHERE c.professor_id = $1
        AND ca.is_published = FALSE
      `,
      [professorId],
    ),
  );

  items.push(
    await explain(
      "pending_assignment_reviews",
      `
      SELECT COUNT(*)::int AS count
      FROM assignment_submissions s
      JOIN assignments a ON a.assignment_id = s.assignment_id
      JOIN classes c ON c.class_id = a.class_id
      WHERE c.professor_id = $1
        AND LOWER(COALESCE(s.status, 'submitted')) = 'submitted'
      `,
      [professorId],
    ),
  );

  items.push(
    await explain(
      "recent_assignment_submissions",
      `
      SELECT
        s.submitted_at AS ts,
        co.code AS course_code,
        co.name AS course_name,
        u.email AS student_email,
        a.title AS assignment_title
      FROM assignment_submissions s
      JOIN assignments a ON a.assignment_id = s.assignment_id
      JOIN classes c ON c.class_id = a.class_id
      JOIN courses co ON co.course_id = c.course_id
      JOIN students st ON st.student_id = s.student_id
      JOIN users u ON u.user_id = st.user_id
      WHERE c.professor_id = $1
      ORDER BY s.submitted_at DESC
      LIMIT 8
      `,
      [professorId],
    ),
  );

  const outputPath = writeResultsFile({
    professorEmail,
    professorId,
    generatedAt: new Date().toISOString(),
    items,
  });

  process.stdout.write(`Saved EXPLAIN ANALYZE output to ${outputPath}\n`);
}

main()
  .catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  })
  .finally(async () => {
    await db.end();
  });
