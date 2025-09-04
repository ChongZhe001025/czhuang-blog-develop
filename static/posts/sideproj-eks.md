##  Overview

- **Frontend**: React + TypeScript served as static assets on port **3000** (container).  
- **Backend API**: Go Gin on port **8082** with JWT authentication and Swagger docs.  
- **Database**: MongoDB 6 (ephemeral demo; replace with production‑grade DB).  
- **GitOps**: Kustomize bases/overlays with Argo CD Applications and ApplicationSet.  
- **CI/CD**: GitHub Actions builds & pushes images to Harbor, validates GitOps manifests.  
- **IaC**: Terraform provisions EKS, VPC, GitHub OIDC for GitHub Actions, Argo CD, and AWS Load Balancer Controller.  

#### ![](../images/icons/github-black.png)  [TickBoard runs on GitOps & EKS](https://github.com/orgs/TickBoard/repositories)

---

##  Features

- **Authentication**: Register, Login, Logout with JWT (Authorization header or HttpOnly cookie).  
- **Task Management**: CRUD for tasks with user‑scoped dashboard aggregation.  
- **API Documentation**: Swagger UI under `/swagger/*` and `/api/swagger/*`.  
- **Protected Routes**: Client routes checked via `/api/me`.  
- **Ingress Routing**: Path‑based routing (`/api` → API; `/` → frontend).  
- **Cloud‑Native Delivery**: Images → Harbor → Argo CD syncs overlays to cluster.  

---

##  Architecture

```
User Browser
     │
   HTTPS
     ▼
 ALB Ingress
   ├── /api → gin-api Service :8082 → MongoDB :27017
   └── /    → frontend Service :3000
```

---

##  Tech Stack

- **Frontend**: React 19, TypeScript, React Router, TanStack Query, React Hook Form, Zod, Axios  
- **Backend**: Go 1.23, Gin, MongoDB Driver, golang-jwt, bcrypt, CORS, Swaggo (gin-swagger)  
- **GitOps/CI**: Kustomize, Argo CD, kubeconform, GitHub Actions, Harbor  
- **Infrastructure**: Terraform (AWS EKS, VPC, KMS, GitHub OIDC/IAM, ALB Controller, Argo CD via Helm)  

---

##  Repository Layout

- **Application** (`Application/`)  
  - API (Gin): `Application/gin-api/`  
  - Frontend (React): `Application/frontend/`  
  - Workflows: `Application/.github/workflows/`  
- **Deploy** (`Deploy/`)  
  - Kustomize bases/overlays, Ingress, Argo CD Root App and ApplicationSet  
  - GitOps CI validation and deploy workflows  
- **Infra** (`Infra/`)  
  - Terraform for EKS, VPC, OIDC/IAM, Argo CD, ALB Controller modules and variables  

---

##  API Summary

- **Health**: `GET /health`, `GET /api/health`  
- **Swagger**: `GET /swagger/*any`, `GET /api/swagger/*any`  
- **Auth**:  
  - `POST /api/auth/register`  
  - `POST /api/auth/login`  
  - `POST /api/auth/logout`  
  - `GET /api/me`  
- **Dashboard**: `GET /api/dashboard?userId=<id>`  
- **Tasks**:  
  - `GET /api/tasks?userId=<id>`  
  - `POST /api/tasks`  
  - `GET /api/tasks/:id`  
  - `PATCH /api/tasks/:id`  
  - `DELETE /api/tasks/:id`  
- **Users**:  
  - `GET /api/users/:id`  
  - `PATCH /api/users/:id`  
  - `DELETE /api/users/:id`  

> Notes: JWT accepted via **Authorization header** or **HttpOnly cookie**. CORS allows credentials (restrict in production).  

---

##  Configuration

### Backend (`Application/gin-api/.env`)
```ini
PORT=8082
MONGO_URI=mongodb://root:pass@mongo:27017
DB_NAME=TickBoard
JWT_SECRET=supersecret_change_me
```

### Frontend (`Application/frontend/.env`)
```ini
REACT_APP_GIN_API_BASE=/
# For external API endpoint:
# REACT_APP_GIN_API_BASE=https://your-api.example.com
```

### Kustomize overlay secrets (example only)
`Deploy/gitops/stacks/tickboard/overlays/dev/secret.yaml`
- `JWT_SECRET`, `DB_NAME`  
- `MONGO_ROOT_USER`, `MONGO_ROOT_PASSWORD`  
- `MONGO_URI` (defaults to in‑cluster `mongo` Service)  

> ⚠️ Do not commit real secrets. Use **Sealed Secrets** or **SOPS** in production.  

---

##  Deployment (GitOps)

**Prerequisites**:  
- Kubernetes cluster (EKS recommended) + Ingress controller (ALB Controller).  
- Argo CD installed.  
- Images available in registry (Harbor).  

**Images & Routing**:  
- Base images: `ghcr.io/OWNER/tickboard-*`  
- Dev overlay → Harbor:  
  - `harbor.czhuang.dev/tickboard/gin-api:<tag>`  
  - `harbor.czhuang.dev/tickboard/frontend:<tag>`  
- Ingress routes `/api` → API (8082) and `/` → frontend (3000).  

**Quick deploy (dev Application)**:
```bash
kubectl apply -f Deploy/gitops/stacks/tickboard/argocd/app-dev.yaml
```

**Bootstrap with Root App + ApplicationSet**:
```bash
kubectl apply -f Deploy/gitops/apps/projects/cluster.yaml
kubectl apply -f Deploy/gitops/apps/projects/apps.yaml
kubectl apply -f Deploy/gitops/apps/root-app.yaml
kubectl apply -f Deploy/gitops/apps/workloads-appset.yaml
```

> Update `repoURL` and `path` if repo is forked/renamed.  

---

##  CI/CD

### Application Images (Harbor Push)
- Builds both images on PR/branches.  
- Pushes on `main` or `v*` tags.  
- Tags: `latest`, short‑SHA (`sha-abc1234`), or version.  
- Secrets required: `HARBOR_REGISTRY`, `HARBOR_PROJECT`, `HARBOR_USERNAME`, `HARBOR_PASSWORD`.  

### GitOps Validation & Deploy
- Validate with **Kustomize + kubeconform** on PR/push.  
- On push to `main`:  
  - Assume AWS role via GitHub OIDC  
  - Set EKS context  
  - Apply AppProjects, Root App, ApplicationSet  
- Required in **Deploy repo**:  
  - Vars: `AWS_REGION`, `EKS_CLUSTER_NAME`  
  - Secret: `AWS_GHA_ROLE_ARN`  
  - Optional: `HARBOR_*` for image pull secrets  

---

##  Production Notes

- **CORS**: Restrict to trusted origins.  
- **MongoDB**: Replace demo `emptyDir` with StatefulSet + PVC or managed DB.  
- **Secrets**: Replace with secure values (Sealed Secrets / SOPS).  
- **Security**: Containers drop capabilities, disable privilege escalation; keep images minimal and updated.  

---

##  Roadmap

- Harden CORS allowlist & cookie settings.  
- Add unit/integration tests & frontend E2E tests.  
- Observability: Logging, metrics, alerts (Prometheus/Grafana).  
- Release promotion: staging/prod overlays + image tag pinning.  
