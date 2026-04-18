# References & Technologies Used

## Backend
- **Node.js** — runtime
- **Express.js** — HTTP server framework
- **PostgreSQL** — relational database
- **pg** — PostgreSQL driver
- **JWT** — authentication tokens
- **bcryptjs** — password hashing

## Frontend
- **React** — UI library
- **React Router** — routing
- **Axios** — HTTP client

## Scheduling Feature (GA)
- **Genetic Algorithm (GA)** — custom implementation (no external GA libraries)
- **Tournament Selection**, **Crossover**, **Mutation**
- Penalty‑based fitness for conflicts and hard constraints

## Database Schema Additions
- `tuition_rules`, `fee_components`, `student_financial_profiles`
- `registration_windows`
- `rooms`, `time_slots`, `professor_unavailability`
- `schedule_runs`, `schedule_run_assignments`

## References
- Standard GA concepts (selection, crossover, mutation, fitness penalties).
- University SIS scope and requirements.

**Note:** The scheduling module was implemented in‑house in `backend/modules/scheduler`. No GitHub or third‑party scheduling engine was used.

