## Project status

**Architecture designed · Partial IAM implementation.** The available records do not confirm that the isolated runtimes, complete CI/CD workflow, UAT, or security acceptance were finished. This page describes the design and the implementation that can be evidenced.

## Engineering challenge

External developers need access to repositories, test services, and deployment workflows. Reusing internal development resources without clear boundaries can expose data, cause environment interference, and make access or changes difficult to review.

The work began with an inventory of GitHub repositories, CI/CD, DNS, service endpoints, IAM, and GCP infrastructure. The goal was to design a repeatable collaboration path with separately scoped developer environments.

## Architecture and design

- Give each external developer an individually scoped runtime and service endpoint.
- Use a reusable runtime template to define service endpoints, DNS, TLS, and health checks.
- Bound source access with GitHub team or outside-collaborator permissions, branch protection, required checks, and deployment restrictions.
- Scope access to PostgreSQL, Redis, and GCS test data.
- Include GCP IAM, IAP, IP allowlisting, and firewall controls in the access model.
- Define logging, monitoring, sensitive-data masking, and access audit as operational requirements.

The intended workflow ties repository access, deployment checks, and a developer's runtime together. Network and IAM rules define the access boundary; observability and audit controls support review. These are design goals, not evidence that every component was deployed.

## Implementation

- Reviewed the existing CI, GitHub, DNS, deployment settings, IAM, and GCP resources.
- Designed the vendor runtime template and an isolated external-developer environment model.
- Implemented part of the Terraform IAM configuration and ran static validation.
- Identified cloud access changes that remained in Terraform configuration and had not been applied.

## Validation and impact

GCP IAM changes, Terraform validation, and external collaborator access work have implementation records. The confirmed result is a documented environment and access-governance design with partial IAM implementation.

The available evidence does not establish that the independent runtimes, complete CI/CD, pilot, UAT, or security review were completed. For that reason, this case does not claim a fully delivered vendor platform.

## Limitations and next steps

- Apply and review the remaining Terraform IAM changes.
- Provision and verify isolated developer runtimes and service endpoints.
- Validate repository controls, test-data boundaries, and the complete CI/CD path.
- Run the planned pilot, UAT, and security review before reporting end-to-end acceptance.

## Scope and confidentiality

This public write-up describes the design at a high level. It omits organization-specific resource names, network values, credentials, internal architecture details, and vendor-identifying information.

**Technologies:** GCP · GitHub · Terraform · IAM · CI/CD · PostgreSQL · Redis
