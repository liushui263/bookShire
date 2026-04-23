#!/bin/sh
# alembic upgrade head
# exec uvicorn app.main:app --host 0.0.0.0 --port 8000

echo "Waiting for database..."

python wait_for_db.py

echo "Running migrations..."
alembic upgrade head

echo "Starting server..."
uvicorn app.main:app --host 0.0.0.0 --reload