#!/bin/sh
set -e

echo "Waiting for PostgreSQL..."
until pg_isready -h db -U bolishop 2>/dev/null; do
  sleep 1
done

echo "Running Prisma migrations..."
npx prisma migrate deploy || npx prisma db push

echo "Seeding database..."
npm run db:seed || true

echo "Starting Next.js..."
exec node server.js
