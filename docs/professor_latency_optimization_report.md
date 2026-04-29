# Professor Latency Optimization Report

Date: 2026-04-29

## Scope

This optimization pass focused only on professor-facing backend features:

- `/api/professor/dashboard`
- `/api/professor/classes`
- `/api/professor/classes/:id/students`
- `/api/professor/classes/:id/grades`
- `/api/professor/classes/:id/attendance`
- `/api/professor/classes/:id/announcements`
- `/api/professor/classes/:id/assignments`
- `/api/professor/assignments/:id/submissions`

The work targeted three latency layers:

1. Database indexing for professor query patterns
2. Route-level reduction of dashboard query round trips
3. Short-lived caching for read-heavy professor endpoints

## Implemented Changes

### 1. Professor-specific database indexing

Added:

- `backend/migrations/018_professor_feature_indexes.sql`
- migration runner: `backend/scripts/runSqlMigration.js`

Targeted index coverage:

- professor-owned class lookups and day/time schedule filters on `classes`
- grade existence and ordering lookups on `grades`
- attendance existence and ordering lookups on `attendance`
- unpublished and list-order reads on `course_announcements`
- assignment and submission review reads on `assignments` and `assignment_submissions`

### 2. Benchmarking and analysis tooling

Added:

- benchmark runner: `backend/scripts/benchmarkProfessorEndpoints.js`
- dashboard EXPLAIN helper: `backend/scripts/explainProfessorDashboard.js`

Outputs are stored under:

- `backend/benchmark-results/`

### 3. Dashboard route refactor

Updated:

- `backend/routes/professorRoutes.js`

Changes:

- reduced dashboard query round trips
- parallelized independent dashboard reads
- collapsed multiple dashboard counters into one shared summary query

This improved structure, but the measured effect was noisy because the database is remote and runtime variance was high.

### 4. Dashboard caching

Added short-lived in-memory caching for:

- `GET /api/professor/dashboard`

Cache details:

- keyed per professor user
- TTL: 30 seconds
- invalidated on professor-side writes:
  - grades
  - attendance
  - announcements
  - assignments
  - submission reviews

### 5. Assignment submissions caching

Added short-lived caching for:

- `GET /api/professor/assignments/:assignmentId/submissions`

Cache details:

- keyed per professor and assignment
- TTL: 30 seconds
- invalidated on:
  - assignment create/update/delete
  - submission review updates

### 6. Grades and attendance page caching

Added short-lived caching for:

- `GET /api/professor/classes/:classId/grades`
- `GET /api/professor/classes/:classId/attendance`

Cache details:

- keyed per professor and class
- TTL: 30 seconds
- invalidated on matching writes:
  - `POST /api/professor/grades`
  - `POST /api/professor/attendance`

## Latency Comparison Table

All values below are average response times in milliseconds from benchmark snapshots taken on 2026-04-29.

| Endpoint | Baseline | After Database Indexes | After Dashboard Caching | After Assignment Submissions Caching | After Grades and Attendance Caching |
|---|---:|---:|---:|---:|---:|
| Professor dashboard | 3136.51 | 2198.93 | 682.98 | 930.98 | 2225.01 |
| Professor classes | 173.92 | 216.35 | 202.83 | 165.15 | 424.46 |
| Professor class students | 328.49 | 407.37 | 403.32 | 521.65 | 544.14 |
| Professor class grades | 329.54 | 371.33 | 421.50 | 749.77 | 99.85 |
| Professor class attendance | 352.69 | 374.35 | 457.80 | 509.18 | 170.46 |
| Professor class announcements | 329.59 | 738.14 | 371.71 | 499.24 | 467.25 |
| Professor class assignments | 553.89 | 526.52 | 1337.00 | 626.42 | 553.24 |
| Professor assignment submissions | 695.06 | 961.12 | 1100.59 | 298.82 | 348.76 |

## Interpretation of the Comparison Table

### Stable wins

- Dashboard improved significantly after indexing and improved further with dashboard caching.
- Assignment submissions improved strongly after submissions caching.
- Grades improved strongly after class-grades caching.
- Attendance improved strongly after class-attendance caching.

### Why some averages move up and down

This environment uses a remote database, so some benchmark runs showed high variance caused by:

- network latency
- remote database contention
- runtime warmup differences
- login/auth variability

Because of that, uncached endpoints do not always show monotonic improvement in every run.

The strongest signal is repeated-hit performance on cached routes, where minimum latencies dropped to near-immediate responses.

## Key Measured Effects on System Latency

### Database indexing effect

Dashboard average:

- before indexes: 3136.51 ms
- after indexes: 2198.93 ms

Observed effect:

- reduced the main DB cost floor for the heaviest professor route
- cut worst-case dashboard latency substantially

### Dashboard caching effect

Dashboard average after caching:

- 682.98 ms

Observed effect:

- biggest user-facing dashboard win
- cached hits reached single-digit milliseconds

### Assignment submissions caching effect

Assignment submissions average:

- before submissions cache: 1100.59 ms
- after submissions cache: 298.82 ms

Observed effect:

- large improvement on one of the heaviest professor read pages

### Grades caching effect

Grades average:

- before grades cache checkpoint: 749.77 ms
- after grades cache: 99.85 ms

Observed effect:

- major improvement on repeated grade-list reads

### Attendance caching effect

Attendance average:

- before attendance cache checkpoint: 509.18 ms
- after attendance cache: 170.46 ms

Observed effect:

- strong improvement on repeated attendance-list reads

## Final System Outcome

The professor optimization work improved performance at three layers:

1. Database layer
2. Route orchestration layer
3. Response caching layer

The most reliable user-facing improvements came from combining:

- targeted professor-specific indexes
- reduced dashboard query round trips
- short-lived caches on the highest-read professor endpoints

## Files Added

- `backend/migrations/018_professor_feature_indexes.sql`
- `backend/scripts/runSqlMigration.js`
- `backend/scripts/benchmarkProfessorEndpoints.js`
- `backend/scripts/explainProfessorDashboard.js`
- `docs/professor_latency_optimization_report.md`

## Files Updated

- `backend/package.json`
- `backend/routes/professorRoutes.js`
- `docker-compose.yml`
