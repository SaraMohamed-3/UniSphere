# Backend Scalability Investigation

## Current Architecture
- Node.js + Express API
- PostgreSQL database
- Single backend instance (no clustering)

## Key Scalability Risks
1. **Monolithic API**
   All routes in one process; high load can bottleneck CPU/event loop.

2. **Database Hotspots**
   Repeated queries for dashboards (classes, enrollments, grades, attendance, announcements).

3. **Large Queries Without Indexes**
   Heavy joins can degrade performance without composite indexes.

4. **No Caching Layer**
   Dashboard pages can trigger many repeated reads.

5. **CPU‑Heavy Jobs**
   GA scheduling is compute‑intensive; running inline blocks the event loop.

## Current Mitigations (Existing)
- Reasonable limits on list endpoints.
- Some indexing in migrations (core tables).

## Recommended Improvements
### 1) Database Indexing
Add composite indexes for frequent joins:
- `classes (semester, year)`
- `enrollments (student_id, class_id)`
- `grades (enrollment_id)`
- `attendance_records (session_id, student_id)`
- `schedule_run_assignments (run_id, class_id)`

### 2) Caching
Add Redis (or in‑memory cache) for:
- `/admin/dashboard`
- `/student/dashboard`
- `/professor/dashboard`

### 3) API Process Scaling
- Use clustering (PM2 or Node cluster) behind a reverse proxy.
- Enable horizontal scaling once deployed.

### 4) Async Jobs
- Move GA scheduler to a background queue (BullMQ/RabbitMQ).
- API returns a job ID and a results endpoint.

### 5) DB Connection Pool
- Ensure pool size matches concurrency.
- Add timeouts and query cancellation for slow requests.

## Suggested Next Steps Before Demo
1. Add indexes for dashboards and scheduler history queries.
2. Add basic caching for dashboard payloads.
3. Restrict GA scheduler to admin only (already enforced) and consider async job queue for large datasets.

## Main Points 
- **Biggest risk today:** single Node process + heavy dashboard reads.
- **Tradeoff:** simple monolith is fast to build; scaling requires caching, indexes, and background jobs.
- **GA impact:** CPU‑heavy runs should not block API; queue + results endpoint is the clean fix.
- **Why focus on indexes:** low effort, immediate gains for join-heavy queries.
- **Deployment strategy:** start single instance, then scale horizontally behind a proxy if load grows.
