#!/bin/bash
set -e

echo "Waiting for postgres..."
while ! nc -z postgres 5432; do
  sleep 0.5
done
echo "PostgreSQL is up"

if [ "$1" = "daphne" ]; then
  echo "Running migrations..."
  python manage.py migrate --noinput
fi

echo "Starting: $@"
exec "$@"
