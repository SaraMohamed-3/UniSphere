#!/bin/bash
# Database initialization script for UniSphere SIS

echo "Initializing UniSphere Database..."

echo "PostgreSQL is ready!"

# Wait for PostgreSQL to be ready
until PGPASSWORD=12345 psql -h localhost -U sis -d sis_db -c '\q' 2>/dev/null; do
  echo "Waiting for PostgreSQL to be ready..."
  sleep 1
done

echo "PostgreSQL is ready!"

# Run schema initialization
echo "Running schema initialization..."
PGPASSWORD=12345 psql -h localhost -U sis -d sis_db < /docker-entrypoint-initdb.d/schema.sql

# Run migrations
echo "Running migrations..."
PGPASSWORD=12345 psql -h localhost -U sis -d sis_db < /docker-entrypoint-initdb.d/001_announcements.sql
PGPASSWORD=12345 psql -h localhost -U sis -d sis_db < /docker-entrypoint-initdb.d/002_professor_features.sql

# Run admin features
echo "Running admin features..."
PGPASSWORD=12345 psql -h localhost -U sis -d sis_db < /docker-entrypoint-initdb.d/admin_features.sql

echo "Database initialization complete!"
