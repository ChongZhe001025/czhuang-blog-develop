# Multi-Country GCP Infrastructure Architecture

The existing GCP production diagram showed the main services, but left key operating boundaries open: whether global configuration could become a synchronous dependency for transactions, which services belonged on public versus private ingress, and how each country's network, data, and release failures should be contained. At the same time, live resources and Terraform state differed across regional test scopes. The work had to turn a logical service map into an operational target while distinguishing proposed boundaries from infrastructure that had actually been rolled out.

## Architecture and design

- Keep the current production topology separate from the multi-country target, and label existing, proposed, and simulated components so a diagram does not imply an unverified deployment.
- Keep the global control plane responsible for identity, configuration management and distribution, release coordination, and shared analytics. Resolve country or tenant routing at the edge from cached mappings; POS, order, and public API transactions should not synchronously query a global configuration API or database.
- Model each country as an intended fault domain with its own project, VPC, private GKE cluster, regional database, cache, storage, secrets, and observability boundary. This is the target isolation model, not a claim that every current test environment already has a separate project and VPC.
- Split ingress by trust and protocol: public L7 for web, API, and webhooks; private or IAP-protected access for console and operations; and a dedicated L4 path for POS or device messaging.
- Distribute reference configuration asynchronously as a versioned bundle, CDC feed, or export/import snapshot, then let country services read local data. Keep FDW and materialized-view refreshes out of application request paths and treat their remaining cross-region database dependency as a transition concern.
- Promote immutable artifacts through country and environment release lanes. Track the application image, deployment manifest / infrastructure version, and configuration version together, with country-scoped approval and rollback.
- Show multi-zone placement, database failover, rollback, and degraded-mode expectations in the target topology, while leaving RTO/RPO and detailed recovery behavior explicit as work still requiring validation.

### Target-state control, traffic, and country-runtime boundaries

1. Production baseline and shared dependencies
2. Global identity, configuration, and release control
3. Edge routing from cached country mappings
4. Public L7 · private operations · dedicated device ingress
5. Private country runtime and regional data services
6. Asynchronous versioned configuration and local snapshots
7. Country release, observability, rollback, and degraded mode

## Implementation

- Reviewed the production GCP diagram and supporting architecture documents, then separated current-state components from the proposed global control plane and country runtime planes.
- Updated the multi-country draw.io topology and its written review material to make request-path boundaries, ingress classes, regional ownership, asynchronous configuration distribution, release lanes, and degraded-mode semantics reviewable.
- Mapped the Terraform layout into shared-network and regional scopes with remote-state contracts, so dependencies and resource ownership could be checked before a regional plan or apply.
- Compared Terraform state and plans with read-only GCP inventory across multiple non-production scopes. Classified resources as already managed, present but unmanaged, partially configured, or not yet provisioned before proposing changes.
- Applied and checked foundational networking, identity, storage / artifact, and compute resources for a selected non-production regional cell; its GKE cluster reached the RUNNING state.
- Kept the regional advanced-ingress / load-balancer work as Terraform configuration and plan material only; it was not applied as part of the validated rollout.
- Preserved environment-specific resource identities and owners during standardization reviews. Where live resources differed from Terraform, the next step was import or state reconciliation and a narrowly reviewed plan, not replacing resources to make names look uniform.
- Documented the existing FDW and materialized-view reference-data path as a background synchronization mechanism with remaining cross-region coupling; the recorded work does not show it replaced by a fully operational asynchronous distribution service.

## Operational findings

- A stateless, multi-zone API tier does not prove the whole global control plane has no single point of failure. Global databases, identity, routing/configuration distribution, DNS, and cross-region links each need their own recovery design.
- A logical country boundary is not an isolation boundary by itself. Validate project and VPC ownership, private-cluster access, IAM, secrets, data stores, release permissions, and monitoring independently.
- A global-to-country configuration feed should fail independently of transaction traffic. Local snapshots and cached routing let a country continue on its last known-good configuration while the control plane is unavailable.
- FDW-backed materialized views can keep application reads local, but their refresh still depends on a reachable global database, database credentials, and cross-region connectivity. That dependency belongs in the recovery model.
- Terraform state is not a complete inventory of live infrastructure until every backend is initialized and existing resources are reconciled. Compare state, plan, and cloud API before applying to a partially managed environment.

## Validation and impact

- The standalone multi-country draw.io file and its page in the infrastructure diagram were structurally checked after the target-state edits; a component-and-relationship inventory was also prepared for review.
- Terraform formatting, validation, and selected regional plans were recorded. One non-production regional foundation was applied and checked; its GKE cluster reported RUNNING.
- The live-resource and Terraform comparison found mixed readiness: some regional foundations already existed, some resources were not yet represented in initialized Terraform state, and some planned ingress or country services had not been applied.
- The review confirmed that the target design must not be reported as a production rollout: country-wide traffic cutover, full environment convergence, and cross-region recovery were not demonstrated.

## Limitations and next steps

- The one-project / one-VPC country fault domain is a target design; existing test scopes still include shared infrastructure and do not prove complete country isolation.
- The asynchronous configuration-distribution path, separated ingress policies, complete country release lanes, and degraded-mode behavior are design boundaries rather than fully validated production capabilities.
- FDW and materialized-view synchronization remains in the documented architecture; a completed migration to versioned asynchronous snapshots or another decoupled transport is not evidenced.
- The advanced ingress plan was not applied, and the available records do not show all country projects and Terraform backends converged or a multi-country production cutover completed.
- Global and country-level HA/DR still need explicit SSO and database failover, backup / PITR, DNS failover, RTO/RPO, country outage, and degraded-mode drills. Canary promotion, rollback gates, and per-country audit / observability views also need end-to-end validation.

## Engineering focus

Demonstrates infrastructure architecture review and staged GCP delivery: separating control and transaction paths, defining country fault domains and ingress boundaries, reconciling Terraform with live resources, and stating clearly what remains a target rather than a production guarantee.
