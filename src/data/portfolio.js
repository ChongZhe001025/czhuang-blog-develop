module.exports = [
    {
        id: "01",
        slug: "fluxseer-rca",
        title: "FluxSeer RCA",
        subtitle: "Evidence-linked incident investigation for Kubernetes.",
        category: "Open-source project",
        discipline: "SRE · Kubernetes · Open Source",
        technologies: ["Go", "Kubernetes CRDs", "controller-runtime", "Prometheus", "Loki", "Helm"],
        status: "Published beta",
        statusDetail: "v0.4.0-beta.3",
        summary: "A Kubernetes-native RCA control plane that turns an incident question into a bounded, evidence-linked investigation, with read-only operation as the default.",
        collectionPath: "/portfolio/",
        collectionLabel: "Portfolio",
        repositoryUrl: "https://github.com/FluxSeer/fluxseer-rca",
        challenge: "Incident investigations often end as chat messages, screenshots, or command history. That makes it difficult to see which evidence informed a conclusion, which claims were verified, whether a data source degraded, or what information was sent to an external model. FluxSeer makes the investigation itself a governed, inspectable workflow in Kubernetes.",
        architecture: [
            "Represent each investigation as an InvestigationRequest, the durable entry point for an operator question or a request created by an external integration.",
            "Collect bounded evidence from Kubernetes Events and workload state; Prometheus and Loki can be added through declared DataSource integrations.",
            "Check evidence sufficiency before producing a verdict, redact evidence before any hosted-provider call, and verify claims against their evidence references.",
            "Store the structured result, evidence references, missing evidence, degradation state, and execution lineage in Kubernetes resource status."
        ],
        diagramCaption: "Read-only investigation flow",
        diagram: ["Investigation request", "Bounded evidence", "Sufficiency & redaction", "Reasoning & claim checks", "Auditable RCA status"],
        implementation: [
            "Built the control plane with Go, controller-runtime reconcilers, and Kubernetes CRDs for investigation requests, data sources, and model providers.",
            "Separated evidence collection, provider reasoning, and claim verification so a model response cannot bypass evidence checks.",
            "Kept a local heuristic provider as the no-secret default. Hosted OpenAI, Claude, and Gemini providers require explicit configuration and credentials.",
            "Added compact evidence references, alternative hypotheses, missing-evidence and degradation reporting, deterministic identities, and provider execution audit data to the structured RCA status.",
            "Packaged 21 built-in detection patterns: 6 Kubernetes patterns are available by default; 8 Prometheus and 7 Loki patterns require their data-source integrations and explicit enablement."
        ],
        validation: [
            "The repository documents v0.4.0-beta.3 as the current published release and identifies broader real-cluster validation as ongoing work.",
            "Repository validation reports 15/15 P0 runtime scenarios, 2/2 canonical-workload scenarios, 5/5 request-rate-surge cases, and 10/10 high-error/high-latency pattern cases passing. These are project validation results, not production service-level outcomes.",
            "The default Helm path is read-only and uses the heuristic provider without external model credentials. Hosted providers and mutation permissions are opt-in."
        ],
        limitations: [
            "The project is in beta; broader real-cluster coverage and production hardening for adapter authentication, retries, and backoff remain open.",
            "Prometheus and Loki rule patterns need their corresponding integrations and explicit enablement; the full set of 21 patterns is not enabled by default.",
            "Guarded remediation is experimental. The current development slice allows only an approval- and policy-gated Deployment rollout restart with separate experimental executor permissions; a GitOps pull-request executor remains planned.",
            "The project does not provide a general-purpose shell or cluster agent, nor does it claim that an RCA verdict guarantees a confirmed root cause or a remediated workload."
        ],
        portfolioValue: "This project brings together Kubernetes API design, evidence governance, model-provider boundaries, security defaults, and validation maturity in one operational workflow."
    },
    {
        id: "02",
        slug: "autosel",
        title: "AutoSEL",
        subtitle: "A master's thesis project for automating SELinux policy generation and enforcement for Docker containers.",
        category: "Master's thesis",
        discipline: "Container security · Linux",
        technologies: ["Go", "Docker", "SELinux"],
        status: "Thesis project",
        summary: "AutoSEL monitors Docker container events and configuration, then generates, updates, and applies SELinux policies for container-specific security controls.",
        collectionPath: "/portfolio/",
        collectionLabel: "Portfolio",
        repositoryUrl: "https://github.com/ChongZhe001025/AutoSEL",
        challenge: "Managing SELinux policies for changing container workloads involves inspecting container settings, generating appropriate rules, and keeping enforcement aligned as containers change. AutoSEL explores how to automate this lifecycle as a master's thesis project.",
        architecture: [
            "Monitor Docker container events and inspect container configuration when workloads start or change.",
            "Parse container settings to prepare policy inputs for the policy-generation component.",
            "Generate and load SELinux policies, then apply them to containers using customized SELinux labels.",
            "Re-run policy generation and replace affected containers when monitored events require an updated policy."
        ],
        diagramCaption: "Container policy lifecycle",
        diagram: ["Docker events", "Container inspection", "Policy generation", "SELinux policy load", "Container enforcement"],
        implementation: [
            "Built separate components for container monitoring, configuration parsing, policy creation, and policy application.",
            "Automated policy generation and reload in response to Docker container events.",
            "Documented the container replacement flow used to apply generated policies and SELinux labels.",
            "Demonstrated policy controls for privileged containers, device and host mounts, and system capabilities."
        ],
        validation: [
            "The project documentation includes demonstrations of automatic policy generation and reload as well as restrictions on privileged operations, mounts, and capabilities.",
            "These are documented project demonstrations; no production rollout, scale benchmark, or operational impact measurement is claimed."
        ],
        limitations: [
            "Applying regenerated policies can require stopping and replacing a container, so workload interruption and data handling need to be considered.",
            "The available project notes do not report large-scale performance results or production deployment validation."
        ],
        portfolioValue: "This master's thesis combines Linux security, Docker lifecycle events, SELinux policy generation, and container enforcement in an automation workflow."
    }
];
