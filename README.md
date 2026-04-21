# OpsBoard

OpsBoard is a starter full-stack app for DevOps portfolio work.

## Stack

- Frontend: React + TypeScript + Vite + Nginx
- Backend: Express + TypeScript
- Database: PostgreSQL
- Cache: Redis
- Orchestration: Docker Compose
- Kubernetes: kubeadm cluster (staging namespace)
- CI: GitHub Actions (manual dispatch)
- Registry: Docker Hub private repository

## What It Does

- user registration and login (JWT)
- project creation and listing
- incident creation and status updates
- health/readiness and metrics endpoints

## Local Quick Start

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

## Kubernetes Staging

Staging manifests are under `k8s/staging`.

They deploy:

- PostgreSQL (StatefulSet + PVC)
- Redis
- Backend
- Frontend
- Services + Ingress

## Project Progress (April 2026)

- Phase 1: completed (app runs with Docker Compose)
- Phase 2: completed (containerization fixes applied)
- Phase 3: completed (manual GitHub Actions CI builds and pushes images to Docker Hub)
- Phase 4: completed (manual Kubernetes deployment to `staging` validated)
- Phase 5: next (GitOps repo split + Argo CD flow)

## Notes

- Ingress on kubeadm can work even when `EXTERNAL-IP` is pending (using NodePort access).
- For this learning phase, secrets are bootstrap-level and will be improved in later phases.
