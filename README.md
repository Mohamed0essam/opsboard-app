# OpsBoard

OpsBoard is a realistic starter application for a DevOps portfolio project.

It includes:

- React + TypeScript frontend
- Express + TypeScript backend
- PostgreSQL database
- Redis cache
- Dockerfiles for frontend and backend
- docker-compose for local development
- starter Kubernetes manifests
- health and readiness endpoints
- Prometheus metrics endpoint
- JWT-based authentication

## Product concept

OpsBoard is a lightweight incident and project tracking tool for engineering teams.

Users can:
- register and log in
- create projects
- create incidents
- change incident status
- view a dashboard

This is intentionally **good enough to run** but **not production-finished**.
You will harden and improve it as part of your DevOps project.

## Repo layout

```text
opsboard-app/
├── apps/
│   ├── backend/
│   └── frontend/
├── k8s/
│   └── base/
├── docker-compose.yml
└── .github/
    └── workflows/
```

## Quick start

### 1) Copy env file

```bash
cp apps/backend/.env.example apps/backend/.env
```

### 2) Start locally with Docker Compose

```bash
docker compose up --build
```

### 3) Open the app

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api
- Backend health: http://localhost:8080/healthz
- Backend metrics: http://localhost:8080/metrics

## Demo flow

1. Register a user from the UI
2. Create a project
3. Create incidents and update their status

## Default architecture notes

- The frontend proxies `/api` requests to the backend through nginx
- Redis is used for project list caching
- PostgreSQL stores the application data
- JWT secret and DB password are env-driven so you can later move them to AWS Secrets Manager or Vault

## What you should improve next

- add tests
- add CI for linting/builds
- move secrets to an external secret manager
- replace the sample manifests with Helm or Kustomize overlays
- add Argo CD
- add Prometheus/Grafana/Loki
- add PostgreSQL backup/restore jobs
- add image scanning and rollout policies
