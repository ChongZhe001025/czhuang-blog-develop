# TickBoard

TickBoard is a lightweight, full‑stack task board built with React (TypeScript) and Go (Gin) on MongoDB. The project showcases an end‑to‑end, cloud‑native workflow: containerized services, CI image builds and pushes to Harbor, GitOps deployment via Kustomize + Argo CD, and infrastructure provisioning with Terraform for AWS EKS.

## Overview

- Frontend: React + TypeScript served as static assets on port 3000 (container).
- Backend API: Go Gin on port 8082 with JWT authentication and Swagger docs.
- Database: MongoDB 6 (ephemeral example for demo; replace for production).
- GitOps: Kustomize bases/overlays with Argo CD Applications and ApplicationSet.
- CI/CD: GitHub Actions builds/pushes images to Harbor and validates GitOps manifests.
- IaC: Terraform provisions EKS, VPC, GitHub OIDC for GitHub Actions, Argo CD, and AWS Load Balancer Controller.

## Features

- Authentication: Register, Login, Logout with JWT (Authorization header or HttpOnly cookie).
- Task Management: CRUD for tasks with user‑scoped dashboard aggregation.
- API Documentation: Swagger UI available under `/swagger/*` and `/api/swagger/*`.
- Protected Routes: Client routes guarded by a session check against `/api/me`.
- Ingress Routing: Path‑based routing on a single host (`/api` → API; `/` → frontend).
- Cloud‑Native Delivery: Images built and pushed to Harbor; Argo CD syncs Kustomize overlays to the cluster.

## Architecture

```mermaid
flowchart LR
  U[User Browser] -->|HTTPS| I[ALB Ingress]
  I -->|/api| A[gin-api Service :8082]
  I -->|/| F[frontend Service :3000]
  A --> M[MongoDB Service :27017]

  subgraph Kubernetes: tickboard namespace
    F ---|ClusterIP| I
    A ---|ClusterIP| I
    M
  end
```

## Tech Stack

- Frontend: React 19, TypeScript, React Router, TanStack Query, React Hook Form, Zod, Axios
- Backend: Go 1.23, Gin, MongoDB Driver, golang-jwt, bcrypt, CORS, Swaggo (gin-swagger)
- GitOps/CI: Kustomize, Argo CD, kubeconform, GitHub Actions, Harbor
- Infrastructure: Terraform (AWS EKS, VPC, KMS, GitHub OIDC/IAM, ALB Controller, Argo CD via Helm)

## Repository Layout

- Application (services and build pipelines): `Application/`
  - API (Gin): `Application/gin-api/`
  - Frontend (React): `Application/frontend/`
  - GitHub Actions (Harbor images): `Application/.github/workflows/`
- Deploy (GitOps config and pipelines): `Deploy/`
  - Kustomize bases/overlays, Ingress, Argo CD Root App and ApplicationSet
  - GitOps CI validation and deploy workflows
- Infra (Terraform for AWS): `Infra/`
  - EKS, VPC, OIDC/IAM, Argo CD, ALB Controller modules and variables

## API Summary

- Health: `GET /health`, `GET /api/health`
- Swagger: `GET /swagger/*any`, `GET /api/swagger/*any`
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/me`
- Dashboard: `GET /api/dashboard?userId=<id>`
- Tasks: `GET /api/tasks?userId=<id>`, `POST /api/tasks`, `GET /api/tasks/:id`, `PATCH /api/tasks/:id`, `DELETE /api/tasks/:id`
- Users: `GET /api/users/:id`, `PATCH /api/users/:id`, `DELETE /api/users/:id`

Notes:
- JWT is accepted via `Authorization: Bearer <token>` or `token` HttpOnly cookie.
- CORS allows credentials; production should restrict allowed origins.

## Configuration

Backend (`Application/gin-api/.env`, loaded via `godotenv` when running the API):

```
PORT=8082
MONGO_URI=mongodb://root:pass@mongo:27017
DB_NAME=TickBoard
JWT_SECRET=supersecret_change_me
```

Frontend (`Application/frontend/.env`):

```
REACT_APP_GIN_API_BASE=/
# If building a variant that talks to a different host:
# REACT_APP_GIN_API_BASE=https://your-api.example.com
```

Kustomize overlay secrets (example values):

- `Deploy/gitops/stacks/tickboard/overlays/dev/secret.yaml` contains example values for:
  - `JWT_SECRET`, `DB_NAME`
  - `MONGO_ROOT_USER`, `MONGO_ROOT_PASSWORD`
  - `MONGO_URI` (pointing to the in‑cluster `mongo` Service by default)

Do not commit real secrets; use Sealed Secrets/SOPS for production.

## Deployment (GitOps)

Prerequisites:
- A Kubernetes cluster (EKS recommended) with `kubectl` access and an Ingress controller (AWS Load Balancer Controller if using ALB).
- Argo CD installed in the cluster.
- Container images available in your registry (Harbor recommended).

Images and routing:
- Default Kustomize base uses placeholder images `ghcr.io/OWNER/tickboard-*`.
- The `dev` overlay rewrites to Harbor:
  - `harbor.czhuang.dev/tickboard/gin-api:<tag>`
  - `harbor.czhuang.dev/tickboard/frontend:<tag>`
- Ingress (ALB) routes `/api` to the API Service (8082) and `/` to the frontend (3000). Update the host to your domain and configure DNS.

Apply a single dev Application (quick path):

```
kubectl apply -f Deploy/gitops/stacks/tickboard/argocd/app-dev.yaml
```

Or bootstrap via Root Application + ApplicationSet (recommended via CI):

```
kubectl apply -f Deploy/gitops/apps/projects/cluster.yaml
kubectl apply -f Deploy/gitops/apps/projects/apps.yaml
kubectl apply -f Deploy/gitops/apps/root-app.yaml
kubectl apply -f Deploy/gitops/apps/workloads-appset.yaml
```

If you fork/rename this repository or relocate the `Deploy/` path, update `repoURL` and `path` in the Argo CD manifests accordingly.

## CI/CD

Application images (Harbor push):
- Workflow builds both images on PR/branches and pushes on `main` or tags `v*`.
- Tags include `latest`, short‑SHA (e.g., `sha-abc1234`), or the tag version.
- Required secrets in the Application repository:
  - `HARBOR_REGISTRY`, `HARBOR_PROJECT`, `HARBOR_USERNAME`, `HARBOR_PASSWORD`

GitOps validation and deploy:
- Kustomize build + kubeconform schema validation on PR/push under `Deploy/gitops/**`.
- On push to `main`, after validation:
  - Assume AWS role via GitHub OIDC and set EKS context
  - Ensure namespace and Harbor pull secret (if configured)
  - Apply AppProjects, Root Application, and ApplicationSet
- Required configuration in the Deploy repository:
  - Variables: `AWS_REGION`, `EKS_CLUSTER_NAME`
  - Secrets: `AWS_GHA_ROLE_ARN` (IAM role for GitHub OIDC)
  - Optional: `HARBOR_*` for creating `harbor-pull-secret`

## Production Notes

- CORS: Current API config allows all origins (with credentials). Restrict to a trusted allowlist for production.
- MongoDB: Base uses `emptyDir` for demo. For production, use StatefulSet + PVC or a managed MongoDB service, and point `MONGO_URI` accordingly.
- Secrets: Replace example secrets with secure values; prefer Sealed Secrets or SOPS.
- Security: Containers drop capabilities and disable privilege escalation; keep images minimal and updated.

## Roadmap

- Harden CORS allowlist and cookie settings per environment.
- Add unit/integration tests for API and E2E tests for the frontend.
- Observability: Add logging/metrics/alerts (e.g., Prometheus/Grafana, structured logs).
- Promote releases via environment overlays (staging/prod) and image tag pinning.
