function randInt(max) {
  return Math.floor(Math.random() * max);
}

function cloneAssignments(assignments) {
  return assignments.map((a) => ({ ...a }));
}

function resolveClass(a, classes, classById) {
  if (a.class_idx != null && classes[a.class_idx]) return classes[a.class_idx];
  if (a.class_id != null) return classById.get(a.class_id);
  return null;
}

function getSlotInfo(slot) {
  if (!slot) return null;
  return {
    day: slot.day ?? slot.day_of_week ?? null,
    start: slot.start_time ?? slot.start ?? null,
    end: slot.end_time ?? slot.end ?? null,
  };
}

function getTimeKey(slot) {
  const info = getSlotInfo(slot);
  if (!info) return null;
  return `${info.day}__${info.start}__${info.end}`;
}

function isValidAssignment(input, assignments, index, candidate) {
  const { classes, rooms, timeSlots } = input;

  const classById = new Map(classes.map((c) => [c.class_id, c]));
  const roomById = new Map(rooms.map((r) => [r.room_id, r]));
  const slotById = new Map(timeSlots.map((s) => [s.slot_id, s]));
  const unavailable = input.constraints?.professorUnavailable || new Set();

  const cls = resolveClass(candidate, classes, classById);
  const room = roomById.get(candidate.room_id);
  const slot = slotById.get(candidate.slot_id);

  if (!cls || !room || !slot) return false;

  const size = Number(cls.size || 0);
  const cap = Number(room.capacity || 0);

  // Capacity hard constraint
  if (cap > 0 && size > cap) return false;

  // Professor unavailable hard constraint
  if (
    cls.professor_id != null &&
    unavailable.has(`${cls.professor_id}__${candidate.slot_id}`)
  ) {
    return false;
  }

  const candidateTimeKey = getTimeKey(slot);
  if (!candidateTimeKey) return false;

  for (let i = 0; i < assignments.length; i += 1) {
    if (i === index) continue;

    const other = assignments[i];
    if (!other || other.room_id == null || other.slot_id == null) continue;

    const otherCls = resolveClass(other, classes, classById);
    const otherSlot = slotById.get(other.slot_id);

    if (!otherCls || !otherSlot) continue;

    const otherTimeKey = getTimeKey(otherSlot);
    if (candidateTimeKey !== otherTimeKey) continue;

    // Room conflict hard constraint
    if (other.room_id === candidate.room_id) return false;

    // Professor conflict hard constraint
    if (
      cls.professor_id != null &&
      otherCls.professor_id != null &&
      cls.professor_id === otherCls.professor_id
    ) {
      return false;
    }
  }

  return true;
}

function repairAssignments(input, assignments) {
  const { rooms, timeSlots, classes } = input;
  const repaired = cloneAssignments(assignments);

  for (let i = 0; i < repaired.length; i += 1) {
    const current = repaired[i];
    if (isValidAssignment(input, repaired, i, current)) continue;

    const cls = classes[current.class_idx];
    const validRooms = rooms.filter(
      (r) => Number(cls?.size || 0) <= Number(r.capacity || 0),
    );
    const roomPool = validRooms.length ? validRooms : rooms;

    let fixed = false;

    // Try random valid-looking candidates first
    for (let tries = 0; tries < 80; tries += 1) {
      const candidate = {
        ...current,
        room_id: roomPool[randInt(roomPool.length)]?.room_id ?? null,
        slot_id: timeSlots[randInt(timeSlots.length)]?.slot_id ?? null,
      };

      if (isValidAssignment(input, repaired, i, candidate)) {
        repaired[i] = candidate;
        fixed = true;
        break;
      }
    }

    // Fallback exhaustive scan
    if (!fixed) {
      for (const room of roomPool) {
        for (const slot of timeSlots) {
          const candidate = {
            ...current,
            room_id: room.room_id,
            slot_id: slot.slot_id,
          };

          if (isValidAssignment(input, repaired, i, candidate)) {
            repaired[i] = candidate;
            fixed = true;
            break;
          }
        }
        if (fixed) break;
      }
    }
  }

  return repaired;
}

function scoreSchedule(input, assignments) {
  const { classes, rooms, timeSlots } = input;

  const classById = new Map(classes.map((c) => [c.class_id, c]));
  const roomById = new Map(rooms.map((r) => [r.room_id, r]));
  const slotById = new Map(timeSlots.map((s) => [s.slot_id, s]));
  const unavailable = input.constraints?.professorUnavailable || new Set();

  let hardPenalty = 0;

  const roomUsage = new Map();
  const professorUsage = new Map();

  for (const a of assignments) {
    const cls = resolveClass(a, classes, classById);
    if (!cls) {
      hardPenalty += 10000;
      continue;
    }

    const room = roomById.get(a.room_id);
    const slot = slotById.get(a.slot_id);

    if (!room || !slot) {
      hardPenalty += 10000;
      continue;
    }

    const timeKey = getTimeKey(slot);
    if (!timeKey) {
      hardPenalty += 10000;
      continue;
    }

    const roomKey = `${a.room_id}__${timeKey}`;
    roomUsage.set(roomKey, (roomUsage.get(roomKey) || 0) + 1);

    if (cls.professor_id != null) {
      const profKey = `${cls.professor_id}__${timeKey}`;
      professorUsage.set(profKey, (professorUsage.get(profKey) || 0) + 1);

      if (unavailable.has(`${cls.professor_id}__${a.slot_id}`)) {
        hardPenalty += 10000;
      }
    }

    const classSize = Number(cls.size || 0);
    const roomCapacity = Number(room.capacity || 0);

    if (roomCapacity > 0 && classSize > roomCapacity) {
      hardPenalty += 10000 + (classSize - roomCapacity);
    }
  }

  for (const count of roomUsage.values()) {
    if (count > 1) hardPenalty += (count - 1) * 10000;
  }

  for (const count of professorUsage.values()) {
    if (count > 1) hardPenalty += (count - 1) * 10000;
  }

  return -hardPenalty;
}

function randomIndividual(input) {
  const { classes, rooms, timeSlots } = input;

  const assignments = classes.map((cls, idx) => {
    const validRooms = rooms.filter(
      (r) => Number(cls.size || 0) <= Number(r.capacity || 0),
    );
    const roomPool = validRooms.length ? validRooms : rooms;

    return {
      class_idx: idx,
      room_id: roomPool[randInt(roomPool.length)]?.room_id ?? null,
      slot_id: timeSlots[randInt(timeSlots.length)]?.slot_id ?? null,
    };
  });

  const repaired = repairAssignments(input, assignments);

  return { assignments: repaired, score: scoreSchedule(input, repaired) };
}

function tournament(pop, k = 4) {
  let best = null;
  for (let i = 0; i < k; i += 1) {
    const cand = pop[randInt(pop.length)];
    if (!best || cand.score > best.score) best = cand;
  }
  return best;
}

function crossover(a, b) {
  const len = a.assignments.length;
  const cut1 = randInt(len || 1);
  const cut2 = randInt(len || 1);
  const start = Math.min(cut1, cut2);
  const end = Math.max(cut1, cut2);

  const child = [];
  for (let i = 0; i < len; i += 1) {
    child.push(
      i >= start && i <= end
        ? { ...b.assignments[i] }
        : { ...a.assignments[i] },
    );
  }

  return child;
}

function mutate(input, assignments, rate = 0.1) {
  const { rooms, timeSlots } = input;
  const next = cloneAssignments(assignments);

  for (let i = 0; i < next.length; i += 1) {
    if (Math.random() < rate) {
      const cls = input.classes[next[i].class_idx];
      const validRooms = rooms.filter(
        (r) => Number(cls?.size || 0) <= Number(r.capacity || 0),
      );
      const roomPool = validRooms.length ? validRooms : rooms;

      if (Math.random() < 0.5) {
        next[i].room_id = roomPool[randInt(roomPool.length)]?.room_id ?? null;
      } else {
        next[i].slot_id = timeSlots[randInt(timeSlots.length)]?.slot_id ?? null;
      }
    }
  }

  return repairAssignments(input, next);
}

function runGeneticScheduler(input, options = {}) {
  const populationSize = Math.max(20, Number(options.populationSize || 100));
  const generations = Math.max(20, Number(options.generations || 200));
  const mutationRate = Math.max(
    0.01,
    Math.min(0.5, Number(options.mutationRate || 0.08)),
  );

  let population = Array.from({ length: populationSize }, () =>
    randomIndividual(input),
  );

  let best = population.reduce(
    (a, b) => (a.score > b.score ? a : b),
    population[0],
  );

  for (let g = 0; g < generations; g += 1) {
    const next = [];

    // Elitism
    next.push({
      assignments: cloneAssignments(best.assignments),
      score: best.score,
    });

    while (next.length < populationSize) {
      const p1 = tournament(population);
      const p2 = tournament(population);

      const crossed = crossover(p1, p2);
      const mutated = mutate(input, crossed, mutationRate);
      const child = {
        assignments: mutated,
        score: scoreSchedule(input, mutated),
      };

      next.push(child);

      if (child.score > best.score) {
        best = {
          assignments: cloneAssignments(child.assignments),
          score: child.score,
        };
      }
    }

    population = next;

    // Stop early if perfect hard-constraint solution found
    if (best.score === 0) break;
  }

  return {
    bestScore: best.score,
    assignments: best.assignments,
    meta: {
      populationSize,
      generations,
      mutationRate,
    },
  };
}

module.exports = {
  runGeneticScheduler,
  scoreSchedule,
};
