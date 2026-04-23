# BookShire

BookShire is a containerized book management API built with FastAPI, PostgreSQL/PostGIS, SQLAlchemy, Alembic, and Docker.

## Features

- FastAPI backend with interactive Swagger docs
- PostgreSQL + PostGIS database
- SQLAlchemy data layer
- Alembic migrations
- Docker Compose based local and production-style workflows

## Quick Start

```bash
git clone <your-repo>
cd bookshire
docker compose up --build
```

Access:

- API: http://localhost:8000/
- Docs: http://localhost:8000/docs

## Run Modes

```bash
docker compose up --build
docker compose -f docker-compose-dev.yml up --build
docker compose -f docker-compose-prod.yml up --build
```

## Database Migration

```bash
docker compose exec backend alembic upgrade head
```

Migrations also run automatically during backend startup.

## API Endpoints

- `GET /`
- `GET /books/`
- `GET /books/{book_id}`
- `POST /books/`

Example payload:

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
   Rebuild the backend image.
2. `database does not exist`
   Wait for the DB healthcheck and retry startup.
3. `localhost:8000/docs` cannot connect
   Make sure the compose file you launched publishes port `8000`.
