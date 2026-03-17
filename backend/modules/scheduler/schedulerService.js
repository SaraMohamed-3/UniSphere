const { runGeneticScheduler, scoreSchedule } = require("./gaScheduler");
const schedulerModel = require("./schedulerModel");

function normalizeInput(payload) {
  const classes = Array.isArray(payload.classes) ? payload.classes : [];
  const rooms = Array.isArray(payload.rooms) ? payload.rooms : [];
  const timeSlots = Array.isArray(payload.timeSlots) ? payload.timeSlots : [];

  if (classes.length === 0 || rooms.length === 0 || timeSlots.length === 0) {
    const err = new Error("classes, rooms, and timeSlots are required and cannot be empty");
    err.status = 400;
    throw err;
  }

  return { classes, rooms, timeSlots };
}

function buildScheduleOutput(input, result) {
  const roomById = new Map(input.rooms.map((r) => [r.room_id, r]));
  const slotById = new Map(input.timeSlots.map((s) => [s.slot_id, s]));
  const profById = new Map(
    (input.professors || []).map((p) => [p.professor_id, p.name]),
  );

  const assigned = result.assignments.map((a) => {
    const cls = input.classes[a.class_idx] || {};
    const room = roomById.get(a.room_id) || {};
    const slot = slotById.get(a.slot_id) || {};
    return {
      class_id: cls.class_id ?? a.class_idx,
      course_code: cls.course_code,
      professor_id: cls.professor_id,
      professor_name: profById.get(cls.professor_id) || null,
      room_id: a.room_id,
      room_name: room.name,
      slot_id: a.slot_id,
      day: slot.day,
      start: slot.start_time || slot.start,
      end: slot.end_time || slot.end,
      score: result.bestScore,
    };
  });

  return {
    bestScore: result.bestScore,
    assignments: assigned,
    meta: result.meta,
  };
}

function generateSchedule(payload, options) {
  const input = normalizeInput(payload);
  const result = runGeneticScheduler(input, options);
  return buildScheduleOutput(input, result);
}

function evaluateSchedule(payload, assignments) {
  const input = normalizeInput(payload);
  const score = scoreSchedule(input, assignments);
  return { score };
}

async function getResources(filters) {
  const ready = await schedulerModel.schedulerSchemaReady();
  if (!ready) {
    const err = new Error("Scheduler schema not initialized. Run migration 008_scheduler_core.sql");
    err.status = 400;
    throw err;
  }

  const [rooms, timeSlots, classes, professors, unavailability] = await Promise.all([
    schedulerModel.listRooms(),
    schedulerModel.listTimeSlots(),
    schedulerModel.listSchedulableClasses(filters),
    schedulerModel.listProfessors(),
    schedulerModel.listProfessorUnavailability(),
  ]);
  return { rooms, timeSlots, classes, professors, unavailability };
}

async function listRooms() {
  const ready = await schedulerModel.schedulerSchemaReady();
  if (!ready) {
    const err = new Error("Scheduler schema not initialized. Run migration 008_scheduler_core.sql");
    err.status = 400;
    throw err;
  }
  return schedulerModel.listRooms();
}

async function listTimeSlots() {
  const ready = await schedulerModel.schedulerSchemaReady();
  if (!ready) {
    const err = new Error("Scheduler schema not initialized. Run migration 008_scheduler_core.sql");
    err.status = 400;
    throw err;
  }
  return schedulerModel.listTimeSlots();
}

async function addRoom(payload) {
  const ready = await schedulerModel.schedulerSchemaReady();
  if (!ready) {
    const err = new Error("Scheduler schema not initialized. Run migration 008_scheduler_core.sql");
    err.status = 400;
    throw err;
  }
  const name = String(payload?.name || "").trim();
  const capacity = Number(payload?.capacity);
  if (!name) {
    const err = new Error("Room name is required");
    err.status = 400;
    throw err;
  }
  if (!Number.isFinite(capacity) || capacity < 0) {
    const err = new Error("Capacity must be a number >= 0");
    err.status = 400;
    throw err;
  }
  return schedulerModel.createRoom({ name, capacity });
}

async function removeRoom(roomId) {
  const ready = await schedulerModel.schedulerSchemaReady();
  if (!ready) {
    const err = new Error("Scheduler schema not initialized. Run migration 008_scheduler_core.sql");
    err.status = 400;
    throw err;
  }
  const id = Number(roomId);
  if (!Number.isInteger(id) || id <= 0) {
    const err = new Error("Invalid room id");
    err.status = 400;
    throw err;
  }
  const deleted = await schedulerModel.deleteRoom(id);
  if (!deleted) {
    const err = new Error("Room not found");
    err.status = 404;
    throw err;
  }
  return { message: "Room deleted" };
}

async function addTimeSlot(payload) {
  const ready = await schedulerModel.schedulerSchemaReady();
  if (!ready) {
    const err = new Error("Scheduler schema not initialized. Run migration 008_scheduler_core.sql");
    err.status = 400;
    throw err;
  }
  const day = String(payload?.day || "").trim();
  const start_time = payload?.start_time;
  const end_time = payload?.end_time;
  if (!day) {
    const err = new Error("Day is required");
    err.status = 400;
    throw err;
  }
  if (!start_time || !end_time) {
    const err = new Error("start_time and end_time are required");
    err.status = 400;
    throw err;
  }
  return schedulerModel.createTimeSlot({ day, start_time, end_time });
}

async function removeTimeSlot(slotId) {
  const ready = await schedulerModel.schedulerSchemaReady();
  if (!ready) {
    const err = new Error("Scheduler schema not initialized. Run migration 008_scheduler_core.sql");
    err.status = 400;
    throw err;
  }
  const id = Number(slotId);
  if (!Number.isInteger(id) || id <= 0) {
    const err = new Error("Invalid slot id");
    err.status = 400;
    throw err;
  }
  const deleted = await schedulerModel.deleteTimeSlot(id);
  if (!deleted) {
    const err = new Error("Time slot not found");
    err.status = 404;
    throw err;
  }
  return { message: "Time slot deleted" };
}

async function addProfessorUnavailability(payload) {
  const ready = await schedulerModel.schedulerSchemaReady();
  if (!ready) {
    const err = new Error("Scheduler schema not initialized. Run migration 008_scheduler_core.sql");
    err.status = 400;
    throw err;
  }
  const professor_id = Number(payload?.professor_id);
  const slot_id = Number(payload?.slot_id);
  if (!Number.isInteger(professor_id) || professor_id <= 0) {
    const err = new Error("professor_id is required");
    err.status = 400;
    throw err;
  }
  if (!Number.isInteger(slot_id) || slot_id <= 0) {
    const err = new Error("slot_id is required");
    err.status = 400;
    throw err;
  }
  return schedulerModel.createProfessorUnavailability({
    professor_id,
    slot_id,
    reason: payload?.reason,
  });
}

async function removeProfessorUnavailability(unavailabilityId) {
  const ready = await schedulerModel.schedulerSchemaReady();
  if (!ready) {
    const err = new Error("Scheduler schema not initialized. Run migration 008_scheduler_core.sql");
    err.status = 400;
    throw err;
  }
  const id = Number(unavailabilityId);
  if (!Number.isInteger(id) || id <= 0) {
    const err = new Error("Invalid unavailability id");
    err.status = 400;
    throw err;
  }
  const deleted = await schedulerModel.deleteProfessorUnavailability(id);
  if (!deleted) {
    const err = new Error("Unavailability not found");
    err.status = 404;
    throw err;
  }
  return { message: "Unavailability deleted" };
}

async function generateFromDb(filters, options) {
  const ready = await schedulerModel.schedulerSchemaReady();
  if (!ready) {
    const err = new Error("Scheduler schema not initialized. Run migration 008_scheduler_core.sql");
    err.status = 400;
    throw err;
  }

  const [rooms, timeSlots, classes, professors, unavailability] = await Promise.all([
    schedulerModel.listRooms(),
    schedulerModel.listTimeSlots(),
    schedulerModel.listSchedulableClasses(filters),
    schedulerModel.listProfessors(),
    schedulerModel.listProfessorUnavailability(),
  ]);
  if (!classes.length) {
    const err = new Error("No classes available for scheduling");
    err.status = 400;
    throw err;
  }

  const unavailableSet = new Set(
    unavailability.map((u) => `${u.professor_id}__${u.slot_id}`),
  );
  const input = {
    rooms,
    timeSlots,
    classes,
    professors,
    constraints: { professorUnavailable: unavailableSet },
  };
  const result = runGeneticScheduler(input, options);
  const output = buildScheduleOutput(input, result);
  const conflicts = buildConflictReport(input, result.assignments);
  const run = await schedulerModel.createScheduleRun({
    created_by: options.createdBy,
    semester: filters.semester || null,
    year: filters.year || null,
    best_score: output.bestScore,
    meta: output.meta,
  });
  await schedulerModel.insertScheduleAssignments(run.run_id, output.assignments);
  return { ...output, conflicts, run_id: run.run_id };
}

async function applySchedule(assignments) {
  if (!Array.isArray(assignments) || assignments.length === 0) {
    const err = new Error("assignments array is required");
    err.status = 400;
    throw err;
  }
  await schedulerModel.applySchedule(assignments);
  return { message: "Schedule applied to classes" };
}

function buildConflictReport(input, assignments) {
  const roomSlot = new Map();
  const profSlot = new Map();
  const conflicts = [];
  const roomById = new Map(input.rooms.map((r) => [r.room_id, r]));
  const slotById = new Map(input.timeSlots.map((s) => [s.slot_id, s]));
  const unavailable = input.constraints?.professorUnavailable || new Set();

  assignments.forEach((a) => {
    const cls = input.classes[a.class_idx];
    const roomKey = `${a.room_id}__${a.slot_id}`;
    const profKey = `${cls?.professor_id}__${a.slot_id}`;

    roomSlot.set(roomKey, (roomSlot.get(roomKey) || 0) + 1);
    profSlot.set(profKey, (profSlot.get(profKey) || 0) + 1);

    if (unavailable.has(profKey)) {
      conflicts.push({
        type: "PROFESSOR_UNAVAILABLE",
        class_id: cls?.class_id,
        professor_id: cls?.professor_id,
        slot_id: a.slot_id,
      });
    }

    const room = roomById.get(a.room_id);
    if (room && Number(cls?.size || 0) > Number(room.capacity || 0)) {
      conflicts.push({
        type: "CAPACITY_EXCEEDED",
        class_id: cls?.class_id,
        room_id: a.room_id,
        needed: cls?.size,
        capacity: room.capacity,
      });
    }
  });

  roomSlot.forEach((count, key) => {
    if (count > 1) conflicts.push({ type: "ROOM_CONFLICT", key, count });
  });
  profSlot.forEach((count, key) => {
    if (count > 1) conflicts.push({ type: "PROFESSOR_CONFLICT", key, count });
  });

  return conflicts;
}

async function listScheduleRuns() {
  return schedulerModel.listScheduleRuns();
}

async function getScheduleRun(runId) {
  const run = await schedulerModel.getScheduleRun(runId);
  if (!run) {
    const err = new Error("Schedule run not found");
    err.status = 404;
    throw err;
  }
  return run;
}

async function postAnnouncement({ title, body, createdBy }) {
  if (!createdBy) {
    const err = new Error("createdBy is required");
    err.status = 400;
    throw err;
  }
  await schedulerModel.postAnnouncement({ title, body, createdBy });
}

module.exports = {
  generateSchedule,
  evaluateSchedule,
  getResources,
  generateFromDb,
  applySchedule,
  listRooms,
  listTimeSlots,
  addRoom,
  removeRoom,
  addTimeSlot,
  removeTimeSlot,
  listScheduleRuns,
  getScheduleRun,
  buildConflictReport,
  addProfessorUnavailability,
  removeProfessorUnavailability,
  postAnnouncement,
};
