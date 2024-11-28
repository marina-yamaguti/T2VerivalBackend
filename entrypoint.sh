#!/bin/sh

# Wait for the database to be ready
until pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER; do
  echo "Waiting for database..."
  sleep 2
done

# npx prisma generate
echo ">>> Migrating Database <<<"
npx prisma migrate dev --name init

echo ">>> Inserting Seed <<<"
npx prisma migrate reset --force

# Run the main container command
exec "$@"
