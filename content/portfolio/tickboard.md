# TickBoard

TickBoard is a full-stack task board delivered through Docker and GitOps. It combines a React frontend, a Go and Gin API, MongoDB persistence, Swagger documentation, and an optional HTTPS reverse proxy.

## Engineering challenge

A small application becomes a useful platform exercise when its delivery path, runtime boundaries, and operational behavior are documented alongside the code. TickBoard provides a concrete full-stack workload for practicing containerization, API design, infrastructure provisioning, and GitOps delivery.

## Architecture and design

- Use a React frontend and Go / Gin API as independently deployable services.
- Persist application data in MongoDB and expose a Swagger-documented API for inspection and integration.
- Package the stack with Docker Compose for local development and describe the Terraform, Kubernetes, and Argo CD path for cluster delivery.
- Place Nginx at the edge for HTTPS and route frontend, API, and database administration paths explicitly.

The application delivery path is:

1. React frontend
2. Gin API
3. MongoDB
4. Container stack
5. Kubernetes and GitOps delivery

## Implementation

- Built task, user, registration, and authentication flows across the React and Gin services.
- Added JWT-based authentication, Swagger documentation, health checks, and Dockerized local development.
- Documented Terraform infrastructure, Kubernetes manifests, Kustomize overlays, and Argo CD application synchronization.
- Recorded operational boundaries and called out development-only storage and secret handling decisions.

## Validation and impact

- The repository documents local startup, API health, Swagger, and production reverse-proxy checks.
- The project is presented as a demonstrable application and deployment exercise; production availability and service-level outcomes are not claimed.

## Limitations and next steps

- The documented MongoDB deployment uses emptyDir for development and should be replaced with durable storage for production.
- Secrets, image publishing, ingress, and cluster acceptance still require environment-specific configuration and verification.
- The repository is a small project, so the portfolio value comes from the end-to-end delivery path rather than application complexity.

## Engineering focus

This project shows how application code, container packaging, infrastructure as code, Kubernetes delivery, and operational documentation fit together in one small system.
