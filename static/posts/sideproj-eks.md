## Overview
The project showcases an end‑to‑end, cloud‑native workflow: containerized services, CI image builds and pushes to Harbor, GitOps deployment via Kustomize + Argo CD, and infrastructure provisioning with Terraform for AWS EKS.

#### ![](../images/icons/github-black.png)  [TickBoard runs on GitOps & EKS](https://github.com/orgs/TickBoard/repositories)

---

## Features
- **Authentication**: Register, Login, Logout with JWT.  
- **Task Management**: CRUD with user-scoped dashboard.  
- **API Documentation**: Swagger UI.  
- **Protected Routes**: Client session check.  
- **Ingress Routing**: Path-based routing (`/api` → API; `/` → frontend).  
- **Cloud-Native Delivery**: CI builds, Harbor registry, GitOps sync via Argo CD.  

---

## Architecture
```
User Browser → HTTPS → ALB Ingress
   ├── /api → gin-api :8082 → MongoDB :27017
   └── /    → frontend :3000
```

---

## Repository Layout
- **Application**: Gin API, React Frontend, CI workflows.  
- **Deploy**: Kustomize overlays, Ingress, Argo CD Root App & ApplicationSet.  
- **Infra**: Terraform for EKS, VPC, IAM, ALB Controller.  

---

## API Highlights
- **Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/me`.  
- **Tasks**: `/api/tasks`, `/api/tasks/:id` (CRUD).  

---

## Production Notes
- Uses IaC + GitOps for reproducible, automated deployments.  
- Secure, minimal containers and cloud-native design.  
- Scalable on AWS EKS with path-based ingress.  