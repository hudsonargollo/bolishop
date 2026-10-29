#!/bin/sh
set -e

cat >/tmp/db-ready.js <<'NODE'
const net=require('net');
const s=net.createConnection(5432,'db',()=>process.exit(0));
s.on('error',()=>process.exit(1));
setTimeout(()=>process.exit(2),3000);
NODE

echo "Waiting for PostgreSQL..."
while ! node /tmp/db-ready.js; do
  sleep 1
done

echo "Running Prisma migrations..."
npx prisma migrate deploy || npx prisma db push

echo "Seeding database..."
npm run db:seed || true

echo "Starting Next.js..."
exec node server.js
