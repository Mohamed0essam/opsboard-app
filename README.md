# OpsBoard

OpsBoard is a starter full-stack app for DevOps portfolio work.

## Stack

- Frontend: React + TypeScript + Vite + Nginx
- Backend: Express + TypeScript
- Database: PostgreSQL
- Cache: Redis
- Orchestration: Docker Compose

## What It Does

- user registration and login (JWT)
- project creation and listing
- incident creation and status updates
- health/readiness and metrics endpoints

## Quick Start

```bash
cp apps/backend/.env.example apps/backend/.env
docker compose up --build -d
docker compose ps
```

## Access

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api
- Health: http://localhost:8080/healthz
- Readiness: http://localhost:8080/readyz
- Metrics: http://localhost:8080/metrics

## Current Status (April 2026)

The current code in this repo builds and runs successfully with Docker Compose.

Applied updates:

- fixed frontend TypeScript header typing issue in API requests
- added missing backend `@types/pg` for TypeScript build
- fixed backend Docker runtime migration path
- removed obsolete `version` key from `docker-compose.yml`

## Next Improvements

- add automated tests
- add CI/CD pipeline for build, push, and smoke checks
- move secrets to a dedicated secret manager
- add observability and image scanning
