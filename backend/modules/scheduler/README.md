# Timetable GA Scheduler (WIP)

This module provides a minimal Genetic Algorithm scheduler for generating a timetable.

## Endpoints (Admin-only)

1. `POST /api/scheduler/ga`
   - Body: `{ classes, rooms, timeSlots, populationSize, generations, mutationRate }`

2. `POST /api/scheduler/score`
   - Body: `{ classes, rooms, timeSlots, assignments }`

3. `GET /api/scheduler/sample`
   - Returns a sample input payload.

## Data Shape

1. `classes`: array of `{ class_id, course_code, professor_id, size }`
2. `rooms`: array of `{ room_id, name, capacity }`
3. `timeSlots`: array of `{ slot_id, day, start, end }`

## Scoring (Current)

- Room conflict (same room + slot): +10 per extra class
- Professor conflict (same professor + slot): +10 per extra class
- Capacity exceeded: +5 per class

Lower penalties are better (score = `-penalty`).

