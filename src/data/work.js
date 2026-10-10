module.exports = [
    {
        id: "01",
        slug: "schema-compatibility-ci",
        title: "Cross-Repository Schema Compatibility CI",
        category: "Implementation",
        discipline: "CI/CD · Database Reliability · Automation",
        technologies: ["GitHub Actions", "Python", "Go Modules", "SQL", "Git"],
        status: "Implemented & tested",
        statusDetail: "Merge gate coverage pending",
        summary: "A CI validation workflow for shared-module alignment, migration integrity, and database schema compatibility across repositories.",
        challenge: "Several application repositories consume database migrations from a shared Go module. A build or unit-test pass alone may not reveal that a branch references an older module version, changes a previously published migration, or introduces a schema change that is unsafe for existing application versions.",
        architecture: [
            "Compare the shared module version referenced by the working branch with the develop baseline.",
            "Inspect migration history and new schema changes before allowing code integration.",
            "Report validation through CI so repository owners can review failures before merge."
        ],
        diagram: ["Application repositories", "Shared Go module", "Migration integrity checks", "Schema compatibility checks", "CI status"],
        implementation: [
            "Added a cross-repository version check for the shared Go module.",
            "Used Git history and migration deltas to detect deleted or modified existing migrations.",
            "Added migration naming, duplicate numeric version, and published-file immutability checks.",
            "Built compatibility checks for cases such as new nullable columns and required columns with defaults.",
            "Added Python unit tests for valid changes, invalid migrations, and SQL-comment parsing edge cases.",
            "Scoped the private Go module SSH URL rewrite to the relevant repository instead of changing global Git configuration."
        ],
        validation: [
            "The checker and its unit tests have successful execution records.",
            "A branch that referenced a shared-module version older than develop was rejected when migrations appeared to be missing. This confirmed the guard worked and exposed the comparison's version-alignment precondition."
        ],
        limitations: [
            "Full Branch Protection, Merge Queue, all branch triggers, and private-repository permission coverage are not yet confirmed.",
            "The current comparison assumes the working branch's shared module is not older than the selected baseline."
        ],
        portfolioValue: "Preventive engineering across repository boundaries, with explicit checks for dependency alignment and database change safety.",
        featured: true
    },
    {
        id: "02",
        slug: "aws-asg-scaling-policies",
        title: "AWS Auto Scaling Policies & Capacity Scheduling",
        category: "Implementation",
        discipline: "AWS Infrastructure · Reliability Engineering · Capacity Management",
        technologies: ["AWS CDK", "EC2 Auto Scaling", "CloudWatch", "Mixed Instances Policy", "Spot"],
        status: "Implemented & partially validated",
        statusDetail: "Production state not verified",
        summary: "A CDK-based EC2 Auto Scaling design combining reactive CPU and network controls with scheduled capacity planning.",
        challenge: "Several services use a mix of CloudWatch scaling policies, scheduled capacity changes, and Blue/Green Auto Scaling Groups. The key challenge was understanding how those controls interact: scheduled minimum and maximum capacity can constrain policies, a fixed-size group cannot scale horizontally, and historical synth records do not always match the current source snapshot or live AWS configuration.",
        architecture: [
            "Use CPU step scaling to add capacity and a separate low-utilization alarm to remove one instance conservatively.",
            "Allow optional Network In/Out policies to scale out when per-instance throughput exceeds a measured target; network policies do not scale in.",
            "Use workload schedules to adjust ASG capacity ahead of expected demand, converting service-local times into UTC cron while accounting for day-boundary changes.",
            "Keep all dynamic changes inside ASG min/max boundaries and apply schedules to the deployment target expected to serve traffic.",
            "Use Mixed Instances Policy, ELB health checks, instance warm-up, and Capacity Rebalance as part of the capacity lifecycle."
        ],
        diagram: ["CloudWatch metrics", "Reactive scaling policies", "Scheduled capacity changes", "ASG boundaries & deployment target", "EC2 instances & load-balancer health"],
        implementation: [
            "Implemented CPU step scale-out and a separate conservative low-utilization alarm for scale-in, with instance warm-up and cooldown controls.",
            "Added optional per-instance Network In and Network Out scale-out policies. Network scaling is disabled by default and must be explicitly enabled; those policies do not scale in.",
            "Created daily and weekday/weekend capacity schedules for a production web workload, converting service-local times to UTC cron and adjusting the weekday for schedules that cross UTC dates.",
            "Added a deployment-time switch to suppress scheduled actions independently of reactive CPU policies.",
            "Configured Mixed Instances Policies to combine On-Demand and Spot capacity according to environment-specific allocation settings.",
            "Enabled ELB health checks and Capacity Rebalance, with service-specific health-check grace periods where configured.",
            "Kept Blue/Green targets separate so scheduled actions can follow the active deployment target; fixed min=max groups remain ineligible for horizontal scaling."
        ],
        dataTables: [
            {
                title: "Scaling policy behavior",
                headers: ["Control", "Signal", "Adjustment", "Guardrail"],
                rows: [
                    ["CPU scale out", "Average CPU evaluated against tiered step ranges", "Increment capacity by policy step", "Warm-up and cooldown configured"],
                    ["CPU scale in", "Sustained low utilization; missing data is non-breaching", "Reduce capacity incrementally", "Separate conservative alarm"],
                    ["Network scale out", "Per-instance network throughput; service opt-in", "Add capacity above configured target", "Warm-up configured · no network scale-in"]
                ]
            },
            {
                title: "Scheduled capacity pattern",
                headers: ["Schedule", "Capacity behavior", "Intent"],
                rows: [
                    ["Daily baseline", "Adjust minimum and maximum capacity", "Retain a planned low-demand service floor"],
                    ["Expected peak windows", "Raise minimum capacity in advance", "Pre-warm instances before recurring demand"],
                    ["Weekday / weekend variants", "Use separate local-time schedules", "Match different demand patterns without exposing exact hours"],
                    ["Deployment target", "Apply scheduled bounds to the active target", "Keep Blue/Green capacity aligned with traffic routing"]
                ]
            }
        ],
        validation: [
            "Scheduled capacity changes have source and commit records, but historical changes were not all followed by synth, deployment, and metrics-based acceptance.",
            "Blue/Green capacity changes have TypeScript compile and CDK synth records. The currently readable source differs from historical results, so those records do not prove the live ASG state.",
            "A prior network-policy review found that the configured target could be too close to the burst capability of an evaluated instance family. This supports retuning from measured traffic; it does not establish that the target or instance family was changed in deployment.",
            "No complete CDK-to-Console drift review, production behavior verification, or measured latency, error-rate, scaling-time, or cost improvement is available."
        ],
        limitations: [
            "The readable helper uses CPU step scale-out plus CPU alarm scale-in; historical review notes describe Target Tracking. Treat these as different source snapshots, not one live configuration.",
            "Step bucket semantics depend on the associated alarm configuration. Verify the synthesized CloudFormation policy before interpreting buckets as absolute CPU thresholds.",
            "The shared network policy is disabled by default. Its reviewed target appeared too close to an evaluated instance family's burst ceiling, so any enabled target should be chosen from observed throughput and burst behavior.",
            "ASG policies cannot exceed min/max boundaries. A fixed-size group cannot scale out, and an inactive Blue/Green group with zero capacity cannot pre-warm through a scaling policy.",
            "The currently readable source differs from historical Blue/Green synth records. Confirm the target branch with CDK synth and AWS Console before describing live behavior.",
            "Schedules reserve capacity based on expected demand; they do not prove that the forecast matches traffic. Validate schedule-policy interactions, health checks, warm-up, network and storage I/O, request volume, and load-balancer latency/error signals.",
            "Mixed Instances allocation settings changed over time. Treat historical values as revision-specific, not as current production configuration."
        ],
        portfolioValue: "Demonstrates capacity-control reasoning across reactive and scheduled scaling, Blue/Green constraints, Spot behavior, source-versus-live drift, and evidence-based policy tuning.",
        featured: true
    },
    {
        id: "03",
        slug: "self-hosted-github-runners",
        title: "Self-Hosted GitHub Actions Runner Platform",
        category: "Implementation",
        discipline: "Platform Engineering · CI/CD · Kubernetes",
        technologies: ["GitHub Actions", "Actions Runner Controller", "Kubernetes", "Terraform", "Docker", "Nginx", "PostgreSQL", "Redis", "Google Compute Engine"],
        status: "Implemented & partially validated",
        statusDetail: "Production validation incomplete",
        summary: "Platform work spanning self-hosted runners and a shared development host that routes engineers to separate branch sites over common ingress and data services.",
        challenge: "Multiple engineers needed independent development sites without provisioning a separate host and data stack for each person. In parallel, the self-hosted runner platform needed clearer environment boundaries, easier scheduling diagnostics, faster image builds, and traceability from image back to CI execution.",
        architecture: [
            "Manage Kubernetes runner resources through Terraform and GitOps, with development and production runner scopes separated.",
            "Split independent image builds into schedulable runner jobs and attach CI run metadata to artifacts for traceability."
        ],
        diagramCaption: "CI runner workflow",
        diagram: ["GitHub Actions workflow", "Kubernetes runner scale set", "Parallel build jobs", "Container image", "OCI run metadata"],
        sharedEnvironment: {
            summary: "A single shared Docker host reduces per-engineer infrastructure overhead while hostname-based routing and branch-specific container stacks keep development sites distinct.",
            controls: [
                "Use a shared development host with one HTTPS ingress and reverse proxy; route each engineer's hostname to the matching branch-specific container stack.",
                "Give each branch stack its own service containers and published ports so multiple sites can run on the same host without port collisions or cross-site request routing.",
                "Share the PostgreSQL service while separating databases by branch. The topology shows a shared Redis service but does not document per-engineer keyspace or ACL boundaries, so full cache-data isolation is not claimed.",
                "Keep developer access on the application and deployment path; privileged host administration uses a separate operator-only route rather than direct engineer SSH."
            ],
            diagram: ["Engineer-specific hostname", "Shared HTTPS ingress", "Host-based reverse-proxy route", "Branch-specific containers & ports", "Shared PostgreSQL / Redis services"]
        },
        implementation: [
            "Managed GitHub Actions runner resources using Terraform and GitOps.",
            "Separated development and production runner namespace configuration.",
            "Reviewed the ARC controller, listener, runner scale sets, runner groups, and workflow labels to diagnose unscheduled jobs.",
            "Confirmed the scale-to-zero behavior of idle runners and investigated label and runner-group matching.",
            "Split Docker component builds into separate GitHub Actions jobs while preserving the existing workflow conditions.",
            "Added GitHub Run ID and Run Attempt as OCI image labels for build traceability.",
            "Used host-based Nginx routing to direct service hostnames to branch-specific container ports on the shared development machine.",
            "Kept PostgreSQL as a shared service with a database per branch; the topology does not establish equivalent per-engineer Redis isolation.",
            "Reserved direct host administration for infrastructure operators and kept engineers on the application / CI deployment path.",
            "Checked workflow changes with a YAML parser, Actionlint, and diff review."
        ],
        validation: [
            "The development runner Terraform plan showed only the expected namespace addition and no destroy operations.",
            "Workflow syntax and static checks have successful validation records.",
            "Production runner planning was blocked in part by a missing local Kubernetes context, so it is not represented as fully validated."
        ],
        limitations: [
            "Automatic Beta deployment, image updater, Git write-back, and rollback are follow-up design work, not part of the completed runner changes.",
            "Production runner changes still need environment-level validation.",
            "The shared-host topology supports site-level separation through host routing and per-branch containers/databases, but it is not a separate VM or network boundary for every engineer.",
            "The topology places multiple sites on shared runtime and data networks. It does not document per-engineer Redis ACL/keyspace isolation, so do not claim cache-data isolation without further evidence.",
            "The available records describe the runner platform and the shared development-host architecture as complementary workflow components; they do not establish that the runner platform directly provisions or deploys every site."
        ],
        portfolioValue: "Demonstrates CI platform operations alongside pragmatic multi-developer environment design: shared infrastructure with explicit site, data, and operator-access boundaries.",
        featured: true
    },
    {
        id: "04",
        slug: "bigquery-cdc-architecture",
        title: "BigQuery Infrastructure as Code & CDC Architecture",
        category: "Architecture & Design",
        discipline: "Data Infrastructure · Cloud Architecture · Infrastructure as Code",
        technologies: ["BigQuery", "Terraform", "Datastream", "AlloyDB", "Private Service Connect"],
        status: "Architecture implemented in code",
        statusDetail: "Deployment validation pending",
        summary: "Scope-aware BigQuery and CDC infrastructure design with regional ownership, private connectivity, and reusable Terraform compositions.",
        challenge: "As systems expanded across regions, analytical datasets, IAM, CDC, and Terraform state needed clear ownership. Unclear boundaries could lead to inconsistent deployments, cross-region responsibility gaps, or data synchronization risk.",
        architecture: [
            "Separate global and regional ownership while keeping BigQuery data location explicit.",
            "Organize datasets into Raw / Landing, Shared, Curated, and Mart layers.",
            "Connect AlloyDB to BigQuery through Datastream and private connectivity components.",
            "Keep Datastream optional and disabled by default until source-side prerequisites are ready."
        ],
        diagram: ["AlloyDB", "Private Service Connect", "Datastream", "Regional BigQuery datasets", "Curated data layers"],
        implementation: [
            "Built reusable Terraform modules for BigQuery datasets, IAM members, and authorized views.",
            "Composed regional BigQuery resources with the matching database infrastructure scope.",
            "Designed private CDC connectivity using PSC endpoints, forwarding rules, network attachments, and Datastream connection profiles.",
            "Documented remote state contracts and corrected state key and output dependencies across scopes.",
            "Iterated through Terraform plans in test environments and adjusted resource composition and configuration sources."
        ],
        validation: [
            "The BigQuery module and scope-based Terraform composition have implementation records.",
            "A sample regional scope plan was checked; other scopes were rechecked after remote-state dependency corrections.",
            "A Datastream data-completeness issue informed the follow-up validation design."
        ],
        limitations: [
            "There is no evidence that every scope has completed Apply or that Datastream is broadly enabled and has passed production data acceptance.",
            "Full recovery after database reset, cross-region query cost, historical backfill, and data governance still need validation."
        ],
        portfolioValue: "Multi-region data architecture, Terraform composition, private connectivity, and data-pipeline reliability planning."
    },
    {
        id: "05",
        slug: "aws-ec2-ami-automation",
        title: "AWS EC2 Deployment & AMI Automation",
        category: "Implementation",
        discipline: "AWS Infrastructure · Deployment Automation",
        technologies: ["EC2", "AMI", "AWS CLI", "Bash", "AWS CDK", "IAM", "SSM"],
        status: "Scripts implemented",
        statusDetail: "End-to-end rollout pending",
        summary: "A two-stage EC2 and AMI workflow that discovers launch settings from an active Auto Scaling Group, hands image-build parameters between scripts, and screens old images before cleanup.",
        challenge: "Creating a temporary EC2 builder and capturing an AMI required repeated lookups and manual parameter transfer. Reusing the wrong source settings could introduce launch drift, while separate scripts made it easy to lose the instance ID or confuse the two dry-run controls. Operational investigation also surfaced encrypted-volume KMS access, SSM connectivity, and the need to retire old images without removing referenced ones.",
        architecture: [
            "Treat builder-instance creation and AMI capture as separate stages, with the created Instance ID as the explicit handoff between them.",
            "Use a service's active Auto Scaling Group and its InService instances as the source for launch configuration, including the base AMI, instance type, subnet, security groups, key pair, and instance profile.",
            "Emit a shell-safe parameter bundle for region, Instance ID, service, environment, date, reboot behavior, AMI dry-run, and wait behavior; persist it locally only after a real builder launch.",
            "Keep image cleanup separate from image creation: collect references from EC2 instances, Launch Template default/latest versions, and Launch Configurations before applying an age threshold to candidates."
        ],
        diagram: ["Active Auto Scaling Group", "Builder EC2 with inherited settings", "Parameter handoff", "AMI capture and tagging", "Reference and age-based cleanup"],
        implementation: [
            "Added a service allowlist and derived the candidate Auto Scaling Group names from a shared naming rule. The script stops when it cannot identify one unambiguous active group.",
            "Read launch inputs from active instances instead of duplicating environment-specific values in the command. When multiple subnets were found, the script surfaced a warning and selected the first; this behavior remains an operator decision point.",
            "Made the builder output all inputs needed by the AMI script and write a local .ec2_env handoff file only for a real EC2 launch, keeping generated instance state out of version control.",
            "Kept EC2 launch dry-run and AMI creation dry-run as independent controls, alongside explicit no-reboot and wait options, so each stage can be reviewed separately.",
            "Kept the shell implementation compatible with macOS's Bash 3.2 by avoiding Bash 4 associative arrays.",
            "Built an AMI cleanup workflow that unions image references from EC2, Launch Template default/latest versions, and Launch Configurations, then filters unreferenced images older than one year. Associated snapshots are handled separately because snapshots can be shared by more than one image.",
            "In adjacent CDK-managed Ubuntu bootstrap work, added SSM diagnostics for snap-managed and package-installed agents, IMDSv2 region lookup, attached-role visibility, regional endpoint reachability, and agent service state."
        ],
        operationalLessons: [
            "An EC2 instance can launch successfully while AMI capture still fails: encrypted EBS volumes require an enabled KMS key and matching key-policy/grant access, including kms:CreateGrant, kms:Decrypt, kms:DescribeKey, kms:GenerateDataKeyWithoutPlaintext, and kms:ReEncrypt.",
            "SSM reachability is a separate identity, bootstrap, and network path. A running instance needs a compatible agent service, instance-profile permissions, metadata access, and outbound access to the regional SSM messaging endpoints.",
            "AMI deregistration does not remove its EBS snapshots. Before deleting snapshots, check whether another retained AMI still references them, then verify both image and snapshot state after cleanup."
        ],
        validation: [
            "Shell syntax and help output were checked for the automation scripts.",
            "An AWS EC2 dry-run for an added service returned Request would have succeeded without launching an instance.",
            "A real builder instance was created, confirming the launch path, but its AMI attempt stopped at a KMS access error on an attached encrypted volume. This is evidence of partial execution, not a completed image-release workflow.",
            "One AMI and snapshot cleanup run finished with post-run AWS queries reporting no remaining targeted objects and no deregistration or deletion errors."
        ],
        limitations: [
            "The KMS-blocked AMI attempt has no recorded successful end-to-end retry; Auto Scaling rollout, target-group health checks, and rollback drills are also not confirmed for every service.",
            "When source instances span multiple subnets, the current builder chooses the first one after warning. Availability Zone, subnet capacity, and network-path suitability should be confirmed or selected explicitly.",
            "The cleanup reference scan covers EC2 instances, Launch Template default/latest versions, and Launch Configurations. There is no evidence it checks every explicitly pinned Launch Template version or every external/account-level image reference, so the candidate set needs review before destructive cleanup.",
            "The SSM bootstrap changes passed shell syntax validation, but their behavior was not confirmed by a live instance acceptance test.",
            "No measured deployment-time, image-build-time, cost, or failure-rate improvement is available."
        ],
        portfolioValue: "AWS automation, practical shell engineering, deployment workflow standardization, and cloud troubleshooting."
    },
    {
        id: "06",
        slug: "multi-country-gcp-architecture",
        title: "Multi-Country GCP Infrastructure Architecture",
        category: "Architecture & Design",
        discipline: "Cloud Architecture · Infrastructure as Code",
        technologies: ["GCP", "GKE", "AlloyDB", "VPC", "Terraform", "PostgreSQL", "Redis"],
        status: "Architecture design & incremental implementation",
        statusDetail: "Rollout scope not fully validated",
        summary: "A multi-country GCP design that separates global control functions from country runtime, paired with staged Terraform rollouts in selected non-production regions.",
        challenge: "The existing GCP production diagram showed the main services, but left key operating boundaries open: whether global configuration could become a synchronous dependency for transactions, which services belonged on public versus private ingress, and how each country's network, data, and release failures should be contained. At the same time, live resources and Terraform state differed across regional test scopes. The work had to turn a logical service map into an operational target while distinguishing proposed boundaries from infrastructure that had actually been rolled out.",
        architecture: [
            "Keep the current production topology separate from the multi-country target, and label existing, proposed, and simulated components so a diagram does not imply an unverified deployment.",
            "Keep the global control plane responsible for identity, configuration management and distribution, release coordination, and shared analytics. Resolve country or tenant routing at the edge from cached mappings; POS, order, and public API transactions should not synchronously query a global configuration API or database.",
            "Model each country as an intended fault domain with its own project, VPC, private GKE cluster, regional database, cache, storage, secrets, and observability boundary. This is the target isolation model, not a claim that every current test environment already has a separate project and VPC.",
            "Split ingress by trust and protocol: public L7 for web, API, and webhooks; private or IAP-protected access for console and operations; and a dedicated L4 path for POS or device messaging.",
            "Distribute reference configuration asynchronously as a versioned bundle, CDC feed, or export/import snapshot, then let country services read local data. Keep FDW and materialized-view refreshes out of application request paths and treat their remaining cross-region database dependency as a transition concern.",
            "Promote immutable artifacts through country and environment release lanes. Track the application image, deployment manifest / infrastructure version, and configuration version together, with country-scoped approval and rollback.",
            "Show multi-zone placement, database failover, rollback, and degraded-mode expectations in the target topology, while leaving RTO/RPO and detailed recovery behavior explicit as work still requiring validation."
        ],
        diagramCaption: "Target-state control, traffic, and country-runtime boundaries",
        diagram: ["Production baseline and shared dependencies", "Global identity, configuration, and release control", "Edge routing from cached country mappings", "Public L7 · private operations · dedicated device ingress", "Private country runtime and regional data services", "Asynchronous versioned configuration and local snapshots", "Country release, observability, rollback, and degraded mode"],
        implementation: [
            "Reviewed the production GCP diagram and supporting architecture documents, then separated current-state components from the proposed global control plane and country runtime planes.",
            "Updated the multi-country draw.io topology and its written review material to make request-path boundaries, ingress classes, regional ownership, asynchronous configuration distribution, release lanes, and degraded-mode semantics reviewable.",
            "Mapped the Terraform layout into shared-network and regional scopes with remote-state contracts, so dependencies and resource ownership could be checked before a regional plan or apply.",
            "Compared Terraform state and plans with read-only GCP inventory across multiple non-production scopes. Classified resources as already managed, present but unmanaged, partially configured, or not yet provisioned before proposing changes.",
            "Applied and checked foundational networking, identity, storage / artifact, and compute resources for a selected non-production regional cell; its GKE cluster reached the RUNNING state.",
            "Kept the regional advanced-ingress / load-balancer work as Terraform configuration and plan material only; it was not applied as part of the validated rollout.",
            "Preserved environment-specific resource identities and owners during standardization reviews. Where live resources differed from Terraform, the next step was import or state reconciliation and a narrowly reviewed plan, not replacing resources to make names look uniform.",
            "Documented the existing FDW and materialized-view reference-data path as a background synchronization mechanism with remaining cross-region coupling; the recorded work does not show it replaced by a fully operational asynchronous distribution service."
        ],
        operationalLessons: [
            "A stateless, multi-zone API tier does not prove the whole global control plane has no single point of failure. Global databases, identity, routing/configuration distribution, DNS, and cross-region links each need their own recovery design.",
            "A logical country boundary is not an isolation boundary by itself. Validate project and VPC ownership, private-cluster access, IAM, secrets, data stores, release permissions, and monitoring independently.",
            "A global-to-country configuration feed should fail independently of transaction traffic. Local snapshots and cached routing let a country continue on its last known-good configuration while the control plane is unavailable.",
            "FDW-backed materialized views can keep application reads local, but their refresh still depends on a reachable global database, database credentials, and cross-region connectivity. That dependency belongs in the recovery model.",
            "Terraform state is not a complete inventory of live infrastructure until every backend is initialized and existing resources are reconciled. Compare state, plan, and cloud API before applying to a partially managed environment."
        ],
        validation: [
            "The standalone multi-country draw.io file and its page in the infrastructure diagram were structurally checked after the target-state edits; a component-and-relationship inventory was also prepared for review.",
            "Terraform formatting, validation, and selected regional plans were recorded. One non-production regional foundation was applied and checked; its GKE cluster reported RUNNING.",
            "The live-resource and Terraform comparison found mixed readiness: some regional foundations already existed, some resources were not yet represented in initialized Terraform state, and some planned ingress or country services had not been applied.",
            "The review confirmed that the target design must not be reported as a production rollout: country-wide traffic cutover, full environment convergence, and cross-region recovery were not demonstrated."
        ],
        limitations: [
            "The one-project / one-VPC country fault domain is a target design; existing test scopes still include shared infrastructure and do not prove complete country isolation.",
            "The asynchronous configuration-distribution path, separated ingress policies, complete country release lanes, and degraded-mode behavior are design boundaries rather than fully validated production capabilities.",
            "FDW and materialized-view synchronization remains in the documented architecture; a completed migration to versioned asynchronous snapshots or another decoupled transport is not evidenced.",
            "The advanced ingress plan was not applied, and the available records do not show all country projects and Terraform backends converged or a multi-country production cutover completed.",
            "Global and country-level HA/DR still need explicit SSO and database failover, backup / PITR, DNS failover, RTO/RPO, country outage, and degraded-mode drills. Canary promotion, rollback gates, and per-country audit / observability views also need end-to-end validation."
        ],
        portfolioValue: "Demonstrates infrastructure architecture review and staged GCP delivery: separating control and transaction paths, defining country fault domains and ingress boundaries, reconciling Terraform with live resources, and stating clearly what remains a target rather than a production guarantee."
    },
    {
        id: "07",
        slug: "datastream-cdc-consistency",
        title: "Datastream CDC Reliability & Data Consistency Investigation",
        category: "Reliability & Operations",
        discipline: "Data Reliability · Incident Investigation",
        technologies: ["Datastream", "BigQuery", "PostgreSQL", "CDC"],
        status: "Incident investigated",
        statusDetail: "Full historical recovery unverified",
        summary: "A CDC reliability investigation comparing stream health, backfill signals, source access, and destination data to reason about end-to-end completeness.",
        challenge: "Operational status and destination checks did not provide the same evidence of synchronization completeness, while source access depended on consistent identity and grant configuration. The investigation needed to distinguish healthy control-plane signals from verified data outcomes.",
        architecture: [
            "Evaluate the source grant and connection-profile identity as one permission path.",
            "Compare stream state and backfill progress with data observed in the destination.",
            "Treat destination completeness as a separate validation signal from stream health."
        ],
        implementation: [
            "Compared stream state and backfill progress with data observed at the destination.",
            "Reviewed the source grants alongside the identity configured for the connection profile.",
            "Investigated a source-access configuration mismatch across environments and separated it from destination completeness checks.",
            "Documented why stream health and backfill status need independent data-level verification."
        ],
        validation: [
            "The investigation distinguished control-plane status from destination data checks and identified source identity configuration as a separate validation point.",
            "The findings show that stream state and backfill status alone are insufficient evidence of end-to-end data completeness."
        ],
        limitations: [
            "A repeatable automated audit is not yet evidenced.",
            "Row-count comparison, freshness checks, lag monitoring, principal consistency checks, and historical recovery remain follow-up validation work."
        ],
        portfolioValue: "Production-style investigation, data consistency reasoning, CDC troubleshooting, and reliability-oriented verification design."
    },
    {
        id: "08",
        slug: "vendor-environment-design",
        title: "Secure Vendor Development Environment Design",
        category: "Architecture & Design",
        discipline: "Infrastructure Security · Developer Platform",
        technologies: ["GCP", "GitHub", "Terraform", "IAM", "CI/CD", "PostgreSQL", "Redis"],
        status: "Architecture designed",
        statusDetail: "Partial IAM implementation",
        summary: "An isolation and access-governance design for external developers, with only part of the IAM configuration implemented and statically validated.",
        challenge: "External collaborators need repository and service access, but shared development infrastructure can create data exposure, environment interference, and weak change traceability if boundaries are unclear.",
        architecture: [
            "Give each external developer a separately scoped runtime and service endpoint.",
            "Tie endpoint setup to reusable DNS, TLS, and health-check configuration.",
            "Use repository controls, cloud identity, network policy, and test-data boundaries as layers of the access model.",
            "Treat logging, monitoring, masking, and audit as planned operational controls, not completed platform features."
        ],
        implementation: [
            "Reviewed GitHub repositories, CI/CD, DNS, service endpoints, IAM, and GCP infrastructure.",
            "Designed a reusable vendor runtime template and an isolated external-developer environment model.",
            "Outlined repository teams or outside-collaborator access, branch protection, required checks, and deployment boundaries.",
            "Designed scoped PostgreSQL, Redis, and GCS test-data access, plus log, monitoring, masking, and audit requirements.",
            "Implemented part of the Terraform IAM configuration and ran static validation.",
            "Identified cloud access changes that remained in Terraform configuration and had not been applied."
        ],
        validation: [
            "GCP IAM configuration changes, Terraform validation, and external collaborator access work have implementation records.",
            "The available evidence supports an architecture and partial IAM implementation, not a complete vendor platform rollout."
        ],
        limitations: [
            "The independent runtimes, complete CI/CD, UAT, and security acceptance are not confirmed as complete.",
            "Some Terraform permission changes were not applied."
        ],
        portfolioValue: "Developer environment architecture, least-privilege access planning, external collaboration governance, and operational isolation.",
        detailUrl: "/vendor-collaboration-environment/"
    },
    {
        id: "09",
        slug: "cloud-observability-alerting",
        title: "Cloud Observability & Alerting Infrastructure",
        category: "Reliability & Operations",
        discipline: "Reliability Engineering · Observability",
        technologies: ["Prometheus", "Alertmanager", "Grafana", "AWS Lambda", "Secrets Manager", "S3"],
        status: "Partially implemented",
        statusDetail: "End-to-end validation pending",
        summary: "Monitoring changes and design reviews for alert delivery and centralized logs across Kubernetes and AWS.",
        challenge: "Reliable operations depend on detecting failures, delivering alerts, and retaining useful logs. These paths cross multiple systems, so availability, secret handling, and failure behavior need explicit design and validation.",
        architecture: [
            "Protect monitoring components against disruption during maintenance.",
            "Reference notification secrets from AWS Secrets Manager instead of embedding tokens in source.",
            "For S3 log shipping, make source paths, scheduling, failure records, and shutdown flushing explicit."
        ],
        implementation: [
            "Adjusted Alertmanager replicas and PodDisruptionBudget and parsed the Kubernetes YAML for structural validity.",
            "Integrated selected EC2/database stop alerts and Lambda notification configuration through AWS CDK.",
            "Evaluated a chat-based notification channel and recommended referencing its credential from a managed secret store.",
            "Reviewed an EC2/VM log-to-S3 design, including log paths, S3 key partitioning, schedule, and error records.",
            "Identified risks around fixed service paths, missing scheduled-job output, shutdown flushing, and cron overlap.",
            "Proposed environment-based log paths, explicit execution records, and a systemd timer for follow-up."
        ],
        validation: [
            "Some Alertmanager configuration changes have structural validation records.",
            "The AWS alert integration compiled, but notification delivery has not been confirmed end to end.",
            "The S3 log-shipping work is a design and risk review; production deployment is not evidenced."
        ],
        limitations: [
            "Alert delivery rate, monitoring coverage, log-transfer failure handling, S3 lifecycle policy, and monitoring availability during component failure need further validation."
        ],
        portfolioValue: "Observability design, operational risk analysis, alert configuration, and reliability engineering practices."
    },
    {
        id: "10",
        slug: "mqtt-wss-architecture-assessment",
        title: "MQTT Infrastructure & WebSocket Architecture Assessment",
        category: "Reliability & Operations",
        discipline: "Messaging Infrastructure · Cloud Architecture",
        technologies: ["EMQX", "MQTT", "WebSocket Secure", "TLS", "Kubernetes", "GKE", "VM"],
        status: "Architecture evaluation & troubleshooting",
        statusDetail: "WSS deployment and migration not confirmed",
        summary: "An assessment of secure browser MQTT connectivity, EMQX hosting trade-offs, and Kubernetes startup dependencies.",
        challenge: "Browser clients cannot use a raw TCP socket for MQTT. Browser access therefore requires MQTT over secure WebSockets, while the existing EMQX deployment also needed a hosting review that considered persistence and operational ownership.",
        architecture: [
            "Define a browser-to-EMQX WSS path with TLS, authentication, and topic ACLs.",
            "Specify client ID, keepalive, reconnect, subscription, and backend-publish verification behavior.",
            "Compare GKE Autopilot and VM hosting against persistence, backup, updates, networking, monitoring, and maintenance responsibility.",
            "Analyze application startup probes separately from the hosting decision."
        ],
        implementation: [
            "Inventoried EMQX image versions by environment.",
            "Designed the WSS listener and browser client requirements, including TLS certificate and topic access controls.",
            "Evaluated the work needed to move EMQX from GKE Autopilot to a VM.",
            "Investigated an early Kubernetes liveness probe that restarted the application before initialization completed.",
            "Traced the restart behavior to an identity-discovery dependency timeout and separated that root cause from the MQTT hosting assessment."
        ],
        validation: [
            "EMQX versions, connection requirements, and part of the Kubernetes startup issue have investigation records.",
            "The evidence supports a WSS design and migration assessment, not a completed WSS deployment or VM migration."
        ],
        limitations: [
            "WSS connectivity, certificate rotation, authentication, and the full backend-to-browser message path still require validation.",
            "The hosting choice remains open and should account for availability, cost, persistence, and maintenance responsibilities."
        ],
        portfolioValue: "Messaging architecture, protocol understanding, Kubernetes troubleshooting, and infrastructure trade-off analysis."
    }
];
