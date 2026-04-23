# BookShire

BookShire is a containerized book management API built with FastAPI, PostgreSQL/PostGIS, SQLAlchemy, Alembic, and Docker.

## Quick Start

```bash
git clone <your-repo>
cd bookshire
docker compose up --build
```

Access the app at:

- API: http://localhost:8000/
- Docs: http://localhost:8000/docs

## Tech Stack

- Backend: FastAPI
- Database: PostgreSQL + PostGIS
- ORM: SQLAlchemy
- Migrations: Alembic
- Containers: Docker Compose

## Compose Files

- `docker-compose.yml`: quick-start local stack with `db` and `backend`
- `docker-compose-dev.yml`: dev stack with code mounts plus the `worker`
- `docker-compose-prod.yml`: production-style stack with the backend exposed on port `8000`

## Database Migrations

Migrations run automatically during backend startup.

You can also run them manually:

```bash
docker compose exec backend alembic upgrade head
```

## API Endpoints

- `GET /` health check
- `GET /books/` list books
- `GET /books/{book_id}` fetch a single book
- `POST /books/` create a book

Example request:

```json
{
  "title": "The Left Hand of Darkness",
  "subtitle": "A Novel",
  "original_language": "English"
}
```

## Project Structure

```text
bookshire/
├── backend/
│   ├── alembic/
│   ├── app/
│   ├── Dockerfile
│   ├── Dockerfile.prod
│   ├── entrypoint.sh
│   └── requirements.txt
├── worker/
├── docker-compose.yml
├── docker-compose-dev.yml
├── docker-compose-prod.yml
└── docs/README.pdf
```

## Common Issues

1. `alembic: not found`
   Rebuild the backend image so `backend/requirements.txt` is reinstalled.
2. `database does not exist` or connection failures during startup
   Wait for the `db` healthcheck and rerun the stack; `wait_for_db.py` handles retries before migrations run.
3. `http://localhost:8000/docs` does not load
   Confirm the backend service publishes `8000:8000` in the compose file you started.

## Run Variants

```bash
docker compose up --build
docker compose -f docker-compose-dev.yml up --build
docker compose -f docker-compose-prod.yml up --build
```
