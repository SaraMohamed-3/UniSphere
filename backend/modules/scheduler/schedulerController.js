const schedulerService = require("./schedulerService");
const sampleInput = require("./sampleInput.json");

async function runGA(req, res) {
  try {
    const payload = req.body || {};
    const options = {
      populationSize: payload.populationSize,
      generations: payload.generations,
      mutationRate: payload.mutationRate,
    };
    const result = schedulerService.generateSchedule(payload, options);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function score(req, res) {
  try {
    const payload = req.body || {};
    const assignments = payload.assignments || [];
    const result = schedulerService.evaluateSchedule(payload, assignments);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function sample(req, res) {
  res.json(sampleInput);
}

async function resources(req, res) {
  try {
    const filters = {
      semester: req.query.semester || undefined,
      year: req.query.year ? Number(req.query.year) : undefined,
    };
    const result = await schedulerService.getResources(filters);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function runDb(req, res) {
  try {
    const payload = req.body || {};
    const filters = {
      semester: payload.semester || undefined,
      year: payload.year ? Number(payload.year) : undefined,
    };
    const options = {
      populationSize: payload.populationSize,
      generations: payload.generations,
      mutationRate: payload.mutationRate,
      createdBy: req.user?.id,
    };
    const result = await schedulerService.generateFromDb(filters, options);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function apply(req, res) {
  try {
    const payload = req.body || {};
    const result = await schedulerService.applySchedule(payload.assignments || []);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function listRooms(req, res) {
  try {
    const result = await schedulerService.listRooms();
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function createRoom(req, res) {
  try {
    const result = await schedulerService.addRoom(req.body || {});
    res.status(201).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function deleteRoom(req, res) {
  try {
    const result = await schedulerService.removeRoom(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function listTimeSlots(req, res) {
  try {
    const result = await schedulerService.listTimeSlots();
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function createTimeSlot(req, res) {
  try {
    const result = await schedulerService.addTimeSlot(req.body || {});
    res.status(201).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function deleteTimeSlot(req, res) {
  try {
    const result = await schedulerService.removeTimeSlot(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function listUnavailability(req, res) {
  try {
    const result = await schedulerService.getResources({});
    res.json(result.unavailability || []);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function createUnavailability(req, res) {
  try {
    const { professor_id, slot_id, reason } = req.body || {};
    const result = await schedulerService.addProfessorUnavailability({
      professor_id,
      slot_id,
      reason,
    });
    res.status(201).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function deleteUnavailability(req, res) {
  try {
    const result = await schedulerService.removeProfessorUnavailability(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function listRuns(req, res) {
  try {
    const result = await schedulerService.listScheduleRuns();
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function getRun(req, res) {
  try {
    const result = await schedulerService.getScheduleRun(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function applyRun(req, res) {
  try {
    const run = await schedulerService.getScheduleRun(req.params.id);
    const assignments = (run.assignments || []).map((a) => ({
      class_id: a.class_id,
      day: a.day,
      start: a.time_range ? String(a.time_range).split("-")[0] : null,
      end: a.time_range ? String(a.time_range).split("-")[1] : null,
      room_name: a.room_name,
    }));
    const result = await schedulerService.applySchedule(assignments);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function announceSchedule(req, res) {
  try {
    const { title, body } = req.body || {};
    if (!title || !body) {
      return res.status(400).json({ message: "title and body are required" });
    }
    const createdBy = req.user?.id;
    await schedulerService.postAnnouncement({ title, body, createdBy });
    res.json({ message: "Announcement posted" });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

module.exports = {
  runGA,
  score,
  sample,
  resources,
  runDb,
  apply,
  listRooms,
  createRoom,
  deleteRoom,
  listTimeSlots,
  createTimeSlot,
  deleteTimeSlot,
  listUnavailability,
  createUnavailability,
  deleteUnavailability,
  listRuns,
  getRun,
  applyRun,
  announceSchedule,
};
