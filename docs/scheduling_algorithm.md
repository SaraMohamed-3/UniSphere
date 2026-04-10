# Scheduling Algorithm (Genetic Algorithm) — Pseudocode

## Overview
We model the timetable as an optimization problem:
- Each **class** must be assigned a **room** and **time slot**.
- We minimize conflicts and constraint violations via penalties.
- We use a Genetic Algorithm (GA) to search for a high‑quality schedule.

## Key Data Structures
- `Classes`: list of `{ class_id, course_code, professor_id, size }`
- `Rooms`: list of `{ room_id, name, capacity }`
- `TimeSlots`: list of `{ slot_id, day, start_time, end_time }`
- `ProfessorUnavailability`: set of `(professor_id, slot_id)` pairs

## Schedule Encoding
A schedule (chromosome) is an array of assignments, one per class:
```
assignment = { class_id, room_id, slot_id }
chromosome = [assignment1, assignment2, ... assignmentN]
```

## Fitness Penalties
Penalty points (lower is better):
- Room conflict (same room + same slot): +10 per extra class
- Professor conflict (same professor + same slot): +10 per extra class
- Capacity exceeded (class size > room capacity): +5
- Professor unavailable slot (hard constraint): +1000
- Missing assignment (room/slot): +20

Fitness score = `-penalty`. Higher score means a better schedule.

## Pseudocode
```
function GA_Schedule(classes, rooms, timeSlots, unavailableSet):
    population = []
    for i in 1..POPULATION_SIZE:
        population.append(random_schedule(classes, rooms, timeSlots))

    best = argmax(population, fitness)

    for generation in 1..GENERATIONS:
        next_population = []
        next_population.append(best)  // elitism

        while size(next_population) < POPULATION_SIZE:
            parent1 = tournament_select(population)
            parent2 = tournament_select(population)
            child = crossover(parent1, parent2)
            child = mutate(child, rooms, timeSlots, MUTATION_RATE)
            next_population.append(child)

            if fitness(child) > fitness(best):
                best = child

        population = next_population

    return best

function random_schedule(classes, rooms, timeSlots):
    assignments = []
    for each class in classes:
        assignments.append({
            class_id: class.id,
            room_id: random(rooms).id,
            slot_id: random(timeSlots).id
        })
    return assignments

function fitness(assignments):
    penalty = 0
    // build lookup maps to count conflicts
    roomSlotCounts = map()        // key: room_id + slot_id
    professorSlotCounts = map()   // key: professor_id + slot_id

    for each assignment in assignments:
        if assignment has missing room or slot:
            penalty += 20
            continue

        roomSlotCounts[room_id + slot_id] += 1
        professorSlotCounts[professor_id + slot_id] += 1

        if class size > room capacity:
            penalty += 5

        if (professor_id, slot_id) in unavailableSet:
            penalty += 1000

    for each key in roomSlotCounts:
        if roomSlotCounts[key] > 1:
            penalty += 10 * (roomSlotCounts[key] - 1)

    for each key in professorSlotCounts:
        if professorSlotCounts[key] > 1:
            penalty += 10 * (professorSlotCounts[key] - 1)

    return -penalty
```

## Conflict Summary (UI)
We also compute counts for reporting:
- `room_conflicts`
- `professor_conflicts`
- `capacity_violations`
- `unavailability_violations`

These counts help explain why a run score is low.

## Notes
- This GA is **heuristic** (good schedules quickly, not guaranteed optimal).
- Hard constraints are enforced via heavy penalties (e.g., +1000).
- The best schedule is saved in `schedule_runs` with assignments for rollback.
