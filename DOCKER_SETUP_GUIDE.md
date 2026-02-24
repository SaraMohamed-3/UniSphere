# Docker Setup & Testing Guide for UniSphere Professor Features

## Prerequisites

- Docker Desktop installed and running
- Docker Compose installed (usually comes with Docker Desktop)
- Git (for version control)
- Terminal/Command Prompt access

## Quick Start

### 1. Environment Setup

```bash
cd /Users/hossammorsy/Desktop/UniSphere

# Ensure .env file exists in backend directory
cat backend/.env
```

Expected output:
```
DB_HOST=postgres
DB_PORT=5432
DB_USER=sis
DB_PASSWORD=12345
DB_NAME=sis_db
JWT_SECRET=my_super_secret_key_for_unisphere_sis
PORT=5000
NODE_ENV=development
```

### 2. Start Docker Containers

```bash
# Build and start all services
docker-compose up -d

# View logs to confirm everything started
docker-compose logs -f

# Expected output should show:
# - PostgreSQL is ready
# - Backend server running on port 5000
# - Frontend running on port 3000
```

### 3. Verify Containers Are Running

```bash
# Check status
docker-compose ps

# Expected output:
# CONTAINER ID   IMAGE                    STATUS
# ...            unisphere_postgres       Up (healthy)
# ...            unisphere_backend        Up
# ...            unisphere_frontend       Up
```

## Database Initialization

The database will automatically initialize when you first run `docker-compose up`. The initialization includes:

1. **schema.sql** - Core tables (users, students, professors, departments)
2. **001_announcements.sql** - Announcements table
3. **002_professor_features.sql** - Professor features (courses, classes, grades, attendance)
4. **admin_features.sql** - Admin-specific features

### Manual Database Access

```bash
# Access PostgreSQL container
docker-compose exec postgres psql -U sis -d sis_db

# In psql shell:
\dt                    # List all tables
\d classes             # Describe classes table
SELECT * FROM users;   # Query users

# Exit psql
\q
```

### Troubleshooting Database Issues

```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Rebuild database (warning: deletes all data)
docker-compose down -v
docker-compose up -d

# Manually run migrations
docker-compose exec postgres psql -U sis -d sis_db < backend/migrations/002_professor_features.sql
```

## Testing the Features

### Test 1: Create Test Data

```bash
# Access database
docker-compose exec postgres psql -U sis -d sis_db

# Run in psql:
-- Insert test data
INSERT INTO users (email, password_hash, role, is_active) 
VALUES ('prof1@example.com', '4232', 'professor', true);

INSERT INTO professors (user_id, department_id) 
VALUES (1, 1);

INSERT INTO courses (code, name, credits, department_id) 
VALUES ('CS101', 'Intro to Programming', 3, 1);

INSERT INTO classes (course_id, professor_id, semester, section, day, time_start, time_end, location, max_capacity)
VALUES (1, 1, 'Spring 2025', 'A', 'Monday', '10:00:00', '12:00:00', 'Lab 301', 50);

\q
```

### Test 2: Backend API Endpoints

Open Postman or use curl:

```bash
# 1. Test Dashboard Endpoint
curl -X GET http://localhost:5000/api/professor/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 2. Get Classes
curl -X GET http://localhost:5000/api/professor/classes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 3. Get Students
curl -X GET http://localhost:5000/api/professor/classes/1/students \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 4. Add Grade
curl -X POST http://localhost:5000/api/professor/grades \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "enrollmentId": 1,
    "assessmentType": "Midterm",
    "score": 85,
    "maxScore": 100
  }'

# 5. Mark Attendance
curl -X POST http://localhost:5000/api/professor/attendance \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "enrollmentId": 1,
    "classDate": "2025-02-24",
    "status": "Present"
  }'

# 6. Post Announcement
curl -X POST http://localhost:5000/api/professor/announcements \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "classId": 1,
    "title": "Welcome to CS101",
    "body": "This is your course announcement.",
    "isPublished": true
  }'
```

### Test 3: Frontend Pages

1. **Navigate to Frontend:**
   - http://localhost:3000

2. **Login Page:**
   - Login with a professor account
   - Email: prof@example.com
   - Password: (whatever password your user has)

3. **Test Each Page:**
   - Dashboard: http://localhost:3000/professor
   - Classes: http://localhost:3000/professor/classes
   - Grades: http://localhost:3000/professor/grades
   - Attendance: http://localhost:3000/professor/attendance
   - Announcements: http://localhost:3000/professor/announcements

### Test 4: Integration Flow

1. **Create Test Student & Enrollment**
   ```bash
   docker-compose exec postgres psql -U sis -d sis_db
   
   -- Create student user
   INSERT INTO users (email, password_hash, role) VALUES ('student@example.com', 'hash', 'student');
   
   -- Create student profile (user_id=2)
   INSERT INTO students (user_id, department_id) VALUES (2, 1);
   
   -- Enroll in class (class_id=1, student_id=1)
   INSERT INTO enrollments (class_id, student_id) VALUES (1, 1);
   
   \q
   ```

2. **Enter Grade via Frontend**
   - Go to http://localhost:3000/professor/grades
   - Select class CS101
   - Select student student@example.com
   - Enter grade: Midterm 85/100
   - Click Save

3. **Mark Attendance**
   - Go to http://localhost:3000/professor/attendance
   - Select class and date
   - Mark attendance as Present
   - Click Save

4. **Post Announcement**
   - Go to http://localhost:3000/professor/announcements
   - Select class CS101
   - Create announcement
   - Publish

5. **View in Database**
   ```bash
   docker-compose exec postgres psql -U sis -d sis_db
   
   SELECT * FROM grades;
   SELECT * FROM attendance;
   SELECT * FROM course_announcements;
   
   \q
   ```

## Docker Useful Commands

```bash
# View logs
docker-compose logs -f backend      # Backend logs
docker-compose logs -f postgres     # Database logs
docker-compose logs -f frontend     # Frontend logs
docker-compose logs                 # All logs

# Execute commands in container
docker-compose exec backend npm test
docker-compose exec postgres psql -U sis -d sis_db -c "SELECT version();"

# Rebuild containers
docker-compose build --no-cache

# Stop all containers
docker-compose stop

# Remove all containers and volumes
docker-compose down -v

# Restart containers
docker-compose restart

# View container stats
docker stats
```

## Troubleshooting

### Issue: "Connection refused" when accessing API

**Solution:**
```bash
# Check if backend is running
docker-compose ps backend

# Check backend logs
docker-compose logs backend

# Restart backend
docker-compose restart backend
```

### Issue: "ECONNREFUSED" in backend logs

**Solution:**
```bash
# Backend can't connect to database, wait for DB to be ready
docker-compose down -v
docker-compose up -d
docker-compose logs -f postgres  # Wait until "database system is ready"
```

### Issue: Frontend shows "Network Error"

**Solution:**
```bash
# Update API URL in frontend if needed
# Check browser console (F12) for exact error
docker-compose logs frontend
```

### Issue: Port already in use

**Solution:**
```bash
# Kill process using port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port in docker-compose.yml
# Change PORT=5000 to PORT=5001, etc.
```

## Monitoring & Performance

```bash
# CPU and Memory usage
docker stats unisphere_backend unisphere_postgres unisphere_frontend

# Container resource limits
docker inspect unisphere_backend | grep -A 5 "Memory"

# Network traffic
docker stats --no-stream
```

## Development Workflow

```bash
# Start development
docker-compose up -d

# Make code changes (files auto-reload in dev mode)
# Edit: frontend/src/pages/ProfessorClassesPage.jsx
# Automatic reload on http://localhost:3000

# Check logs for errors
docker-compose logs -f

# When done
docker-compose down

# To completely reset
docker-compose down -v  # Removes volumes too
```

## Production Considerations

Before deploying to production:

1. Update `.env` with production values
2. Set `NODE_ENV=production`
3. Use proper JWT secret (strong password)
4. Use proper database credentials
5. Enable HTTPS
6. Add proper error logging
7. Configure database backups
8. Set up monitoring and alerts

## Next Steps

1. ✅ Start Docker containers: `docker-compose up -d`
2. ✅ Verify all containers are running: `docker-compose ps`
3. ✅ Create test data in database
4. ✅ Test API endpoints with Postman or curl
5. ✅ Test frontend pages in browser
6. ✅ Verify all professor features work
7. ✅ Ready for team integration testing!

## Questions?

Check the logs:
```bash
docker-compose logs -f
```

Or access the database directly:
```bash
docker-compose exec postgres psql -U sis -d sis_db
```
