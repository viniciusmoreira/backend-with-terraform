#!/bin/sh
set -e

echo "Waiting for database to be ready..."
# docker-compose healthcheck ensures postgres is ready, but add small buffer
sleep 2

echo "Running database migrations..."
npx prisma migrate deploy

echo "Starting development server..."
exec npm run dev
