# Self-Hosted GitHub Actions Runner Platform

Multiple engineers needed independent development sites without provisioning a separate host and data stack for each person. In parallel, the self-hosted runner platform needed clearer environment boundaries, easier scheduling diagnostics, faster image builds, and traceability from image back to CI execution.

## Architecture and design

- Manage Kubernetes runner resources through Terraform and GitOps, with development and production runner scopes separated.
- Split independent image builds into schedulable runner jobs and attach CI run metadata to artifacts for traceability.

### CI runner workflow

1. GitHub Actions workflow
2. Kubernetes runner scale set
3. Parallel build jobs
4. Container image
5. OCI run metadata

## Shared development environment

A single shared Docker host reduces per-engineer infrastructure overhead while hostname-based routing and branch-specific container stacks keep development sites distinct.

- Use a shared development host with one HTTPS ingress and reverse proxy; route each engineer's hostname to the matching branch-specific container stack.
- Give each branch stack its own service containers and published ports so multiple sites can run on the same host without port collisions or cross-site request routing.
- Share the PostgreSQL service while separating databases by branch. The topology shows a shared Redis service but does not document per-engineer keyspace or ACL boundaries, so full cache-data isolation is not claimed.
- Keep developer access on the application and deployment path; privileged host administration uses a separate operator-only route rather than direct engineer SSH.

### Request path

1. Engineer-specific hostname
2. Shared HTTPS ingress
3. Host-based reverse-proxy route
4. Branch-specific containers & ports
5. Shared PostgreSQL / Redis services

## Implementation

- Managed GitHub Actions runner resources using Terraform and GitOps.
- Separated development and production runner namespace configuration.
- Reviewed the ARC controller, listener, runner scale sets, runner groups, and workflow labels to diagnose unscheduled jobs.
- Confirmed the scale-to-zero behavior of idle runners and investigated label and runner-group matching.
- Split Docker component builds into separate GitHub Actions jobs while preserving the existing workflow conditions.
- Added GitHub Run ID and Run Attempt as OCI image labels for build traceability.
- Used host-based Nginx routing to direct service hostnames to branch-specific container ports on the shared development machine.
- Kept PostgreSQL as a shared service with a database per branch; the topology does not establish equivalent per-engineer Redis isolation.
- Reserved direct host administration for infrastructure operators and kept engineers on the application / CI deployment path.
- Checked workflow changes with a YAML parser, Actionlint, and diff review.

## Validation and impact

- The development runner Terraform plan showed only the expected namespace addition and no destroy operations.
- Workflow syntax and static checks have successful validation records.
- Production runner planning was blocked in part by a missing local Kubernetes context, so it is not represented as fully validated.

## Limitations and next steps

- Automatic Beta deployment, image updater, Git write-back, and rollback are follow-up design work, not part of the completed runner changes.
- Production runner changes still need environment-level validation.
- The shared-host topology supports site-level separation through host routing and per-branch containers/databases, but it is not a separate VM or network boundary for every engineer.
- The topology places multiple sites on shared runtime and data networks. It does not document per-engineer Redis ACL/keyspace isolation, so do not claim cache-data isolation without further evidence.
- The available records describe the runner platform and the shared development-host architecture as complementary workflow components; they do not establish that the runner platform directly provisions or deploys every site.

## Engineering focus

Demonstrates CI platform operations alongside pragmatic multi-developer environment design: shared infrastructure with explicit site, data, and operator-access boundaries.
