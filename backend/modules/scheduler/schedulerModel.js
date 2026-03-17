const db = require("../../data/db");

async function schedulerSchemaReady() {
  const r = await db.query(
    `
    SELECT
      to_regclass('public.rooms') AS rooms,
      to_regclass('public.time_slots') AS time_slots,
      to_regclass('public.professor_unavailability') AS professor_unavailability,
      to_regclass('public.schedule_runs') AS schedule_runs,
      to_regclass('public.schedule_run_assignments') AS schedule_run_assignments
    `,
  );
  const row = r.rows[0] || {};
  return !!(
    row.rooms &&
    row.time_slots &&
    row.professor_unavailability &&
    row.schedule_runs &&
    row.schedule_run_assignments
  );
}

async function hasUserFullNameColumn() {
  const r = await db.query(
    `
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = 'full_name'
    ) AS exists
    `,
  );
  return !!r.rows[0]?.exists;
}

async function listRooms() {
  const r = await db.query(
    "SELECT room_id, name, capacity FROM rooms ORDER BY name ASC",
  );
  return r.rows;
}

async function listTimeSlots() {
  const r = await db.query(
    "SELECT slot_id, day, start_time, end_time FROM time_slots ORDER BY day ASC, start_time ASC",
  );
  return r.rows;
}

async function listProfessors() {
  const hasFullName = await hasUserFullNameColumn();
  const r = await db.query(
    `
    SELECT p.professor_id, u.email,
           ${
             hasFullName
               ? "COALESCE(NULLIF(BTRIM(u.full_name), ''), u.email) AS name"
               : "u.email AS name"
           }
    FROM professors p
    JOIN users u ON u.user_id = p.user_id
    ORDER BY name ASC
    `,
  );
  return r.rows;
}

async function listProfessorUnavailability() {
  const r = await db.query(
    `
    SELECT u.unavailability_id, u.professor_id, u.slot_id, u.reason,
           ts.day, ts.start_time, ts.end_time
    FROM professor_unavailability u
    JOIN time_slots ts ON ts.slot_id = u.slot_id
    ORDER BY u.professor_id ASC, ts.day ASC, ts.start_time ASC
    `,
  );
  return r.rows;
}

async function createProfessorUnavailability({ professor_id, slot_id, reason }) {
  const r = await db.query(
    `
    INSERT INTO professor_unavailability (professor_id, slot_id, reason)
    VALUES ($1, $2, $3)
    ON CONFLICT (professor_id, slot_id)
    DO UPDATE SET reason = EXCLUDED.reason
    RETURNING unavailability_id, professor_id, slot_id, reason
    `,
    [professor_id, slot_id, reason || null],
  );
  return r.rows[0];
}

async function deleteProfessorUnavailability(unavailabilityId) {
  const r = await db.query(
    "DELETE FROM professor_unavailability WHERE unavailability_id = $1 RETURNING unavailability_id",
    [unavailabilityId],
  );
  return r.rows[0] || null;
}

async function createRoom({ name, capacity }) {
  const r = await db.query(
    "INSERT INTO rooms (name, capacity) VALUES ($1, $2) RETURNING room_id, name, capacity",
    [name, capacity],
  );
  return r.rows[0];
}

async function deleteRoom(roomId) {
  const r = await db.query(
    "DELETE FROM rooms WHERE room_id = $1 RETURNING room_id",
    [roomId],
  );
  return r.rows[0] || null;
}

async function createTimeSlot({ day, start_time, end_time }) {
  const r = await db.query(
    `
    INSERT INTO time_slots (day, start_time, end_time)
    VALUES ($1, $2, $3)
    RETURNING slot_id, day, start_time, end_time
    `,
    [day, start_time, end_time],
  );
  return r.rows[0];
}

async function deleteTimeSlot(slotId) {
  const r = await db.query(
    "DELETE FROM time_slots WHERE slot_id = $1 RETURNING slot_id",
    [slotId],
  );
  return r.rows[0] || null;
}

async function listSchedulableClasses({ semester, year }) {
  const filters = [];
  const params = [];
  if (semester) {
    params.push(semester);
    filters.push(`LOWER(c.semester) = LOWER($${params.length})`);
  }
  if (year) {
    params.push(Number(year));
    filters.push(`c.year = $${params.length}`);
  }
  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  const r = await db.query(
    `
    SELECT
      c.class_id,
      co.code AS course_code,
      c.professor_id,
      COALESCE(c.max_capacity, 0) AS size,
      c.semester,
      c.year
    FROM classes c
    JOIN courses co ON co.course_id = c.course_id
    ${where}
    ORDER BY c.class_id ASC
    `,
    params,
  );
  return r.rows;
}

async function createScheduleRun({ created_by, semester, year, best_score, meta }) {
  const r = await db.query(
    `
    INSERT INTO schedule_runs (created_by, semester, year, best_score, meta)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING run_id, created_at
    `,
    [created_by, semester || null, year || null, best_score, meta || {}],
  );
  return r.rows[0];
}

async function insertScheduleAssignments(runId, assignments) {
  if (!assignments.length) return;
  const values = [];
  const params = [];
  assignments.forEach((a, idx) => {
    const base = idx * 8;
    values.push(
      `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8})`,
    );
    params.push(
      runId,
      a.class_id,
      a.course_code || null,
      a.professor_id || null,
      a.room_id || null,
      a.room_name || null,
      a.day || null,
      a.start && a.end ? `${a.start}-${a.end}` : null,
    );
  });
  await db.query(
    `
    INSERT INTO schedule_run_assignments (
      run_id, class_id, course_code, professor_id, room_id, room_name, day, time_range
    )
    VALUES ${values.join(",")}
    `,
    params,
  );
}

async function listScheduleRuns() {
  const r = await db.query(
    `
    SELECT run_id, created_at, created_by, semester, year, best_score
    FROM schedule_runs
    ORDER BY created_at DESC
    LIMIT 20
    `,
  );
  return r.rows;
}

async function getScheduleRun(runId) {
  const run = await db.query(
    `
    SELECT run_id, created_at, created_by, semester, year, best_score, meta
    FROM schedule_runs
    WHERE run_id = $1
    `,
    [runId],
  );
  if (!run.rows[0]) return null;
  const assignments = await db.query(
    `
    SELECT class_id, course_code, professor_id, room_id, room_name, day, time_range
    FROM schedule_run_assignments
    WHERE run_id = $1
    `,
    [runId],
  );
  return { ...run.rows[0], assignments: assignments.rows };
}

async function applySchedule(assignments) {
  const updates = [];
  for (const a of assignments) {
    updates.push(
      db.query(
        `
        UPDATE classes
        SET day = $1,
            time_start = $2,
            time_end = $3,
            location = $4
        WHERE class_id = $5
        `,
        [a.day, a.start, a.end, a.room_name || a.location || null, a.class_id],
      ),
    );
  }
  await Promise.all(updates);
}

async function postAnnouncement({ title, body, createdBy }) {
  await db.query(
    `
    INSERT INTO announcements (title, body, created_by, is_published)
    VALUES ($1, $2, $3, TRUE)
    `,
    [title, body, createdBy],
  );
}

module.exports = {
  schedulerSchemaReady,
  listRooms,
  listTimeSlots,
  listProfessors,
  listProfessorUnavailability,
  createProfessorUnavailability,
  deleteProfessorUnavailability,
  createRoom,
  deleteRoom,
  createTimeSlot,
  deleteTimeSlot,
  listSchedulableClasses,
  applySchedule,
  createScheduleRun,
  insertScheduleAssignments,
  listScheduleRuns,
  getScheduleRun,
  postAnnouncement,
};
