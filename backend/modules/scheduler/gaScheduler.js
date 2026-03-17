function randInt(max) {
  return Math.floor(Math.random() * max);
}

function cloneAssignments(assignments) {
  return assignments.map((a) => ({ ...a }));
}

function scoreSchedule(input, assignments) {
  const { classes, rooms, timeSlots, constraints } = input;
  const roomById = new Map(rooms.map((r) => [r.room_id, r]));

  let penalty = 0;
  const roomSlot = new Map();
  const profSlot = new Map();
  const unavailable = constraints?.professorUnavailable || new Set();

  assignments.forEach((a) => {
    if (a.room_id == null || a.slot_id == null) {
      penalty += 20;
      return;
    }

    const roomKey = `${a.room_id}__${a.slot_id}`;
    roomSlot.set(roomKey, (roomSlot.get(roomKey) || 0) + 1);

    const cls = classes[a.class_idx];
    if (cls?.professor_id != null) {
      const profKey = `${cls.professor_id}__${a.slot_id}`;
      profSlot.set(profKey, (profSlot.get(profKey) || 0) + 1);
      if (unavailable.has(profKey)) penalty += 1000;
    }

    const room = roomById.get(a.room_id);
    const size = Number(cls?.size || 0);
    const cap = Number(room?.capacity || 0);
    if (cap > 0 && size > cap) penalty += 5;
  });

  roomSlot.forEach((count) => {
    if (count > 1) penalty += (count - 1) * 10;
  });
  profSlot.forEach((count) => {
    if (count > 1) penalty += (count - 1) * 10;
  });

  return -penalty;
}

function randomIndividual(input) {
  const { classes, rooms, timeSlots } = input;
  const assignments = classes.map((_, idx) => ({
    class_idx: idx,
    room_id: rooms[randInt(rooms.length)]?.room_id ?? null,
    slot_id: timeSlots[randInt(timeSlots.length)]?.slot_id ?? null,
  }));
  return { assignments, score: scoreSchedule(input, assignments) };
}

function tournament(pop, k = 3) {
  let best = null;
  for (let i = 0; i < k; i += 1) {
    const cand = pop[randInt(pop.length)];
    if (!best || cand.score > best.score) best = cand;
  }
  return best;
}

function crossover(a, b) {
  const cut = randInt(a.assignments.length || 1);
  const child = [
    ...a.assignments.slice(0, cut),
    ...b.assignments.slice(cut),
  ].map((x) => ({ ...x }));
  return child;
}

function mutate(input, assignments, rate = 0.1) {
  const { rooms, timeSlots } = input;
  const next = cloneAssignments(assignments);
  for (let i = 0; i < next.length; i += 1) {
    if (Math.random() < rate) {
      if (Math.random() < 0.5) {
        next[i].room_id = rooms[randInt(rooms.length)]?.room_id ?? null;
      } else {
        next[i].slot_id = timeSlots[randInt(timeSlots.length)]?.slot_id ?? null;
      }
    }
  }
  return next;
}

function runGeneticScheduler(input, options = {}) {
  const populationSize = Math.max(10, Number(options.populationSize || 60));
  const generations = Math.max(5, Number(options.generations || 80));
  const mutationRate = Math.max(0.01, Math.min(0.5, Number(options.mutationRate || 0.12)));

  let population = Array.from({ length: populationSize }, () => randomIndividual(input));
  let best = population.reduce((a, b) => (a.score > b.score ? a : b), population[0]);

  for (let g = 0; g < generations; g += 1) {
    const next = [];
    next.push(best);
    while (next.length < populationSize) {
      const p1 = tournament(population);
      const p2 = tournament(population);
      const childAssignments = mutate(input, crossover(p1, p2), mutationRate);
      const child = { assignments: childAssignments, score: scoreSchedule(input, childAssignments) };
      next.push(child);
      if (child.score > best.score) best = child;
    }
    population = next;
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
