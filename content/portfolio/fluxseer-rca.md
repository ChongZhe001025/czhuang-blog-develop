# FluxSeer RCA

FluxSeer is a Kubernetes-native root-cause analysis control plane. It turns an incident question into a bounded investigation with linked evidence, explicit sufficiency checks, and an auditable result. Read-only operation is the default.

## Engineering challenge

Incident investigations often end as chat messages, screenshots, or command history. That makes it difficult to see which evidence informed a conclusion, which claims were verified, whether a data source degraded, or what information was sent to an external model.

FluxSeer treats the investigation itself as a governed and inspectable Kubernetes workflow.

## Architecture and design

- Represent each investigation as an InvestigationRequest, the durable entry point for an operator question or an external integration request.
- Collect bounded evidence from Kubernetes Events and workload state; Prometheus and Loki can be added through declared DataSource integrations.
- Check evidence sufficiency before producing a verdict, redact evidence before any hosted-provider call, and verify claims against their evidence references.
- Store the structured result, evidence references, missing evidence, degradation state, and execution lineage in Kubernetes resource status.

The read-only investigation flow is:

1. Investigation request
2. Bounded evidence
3. Sufficiency and redaction
4. Reasoning and claim checks
5. Auditable RCA status

## Implementation

- Built the control plane with Go, controller-runtime reconcilers, and Kubernetes CRDs for investigation requests, data sources, and model providers.
- Separated evidence collection, provider reasoning, and claim verification so a model response cannot bypass evidence checks.
- Kept a local heuristic provider as the no-secret default. Hosted OpenAI, Claude, and Gemini providers require explicit configuration and credentials.
- Added compact evidence references, alternative hypotheses, missing-evidence and degradation reporting, deterministic identities, and provider execution audit data to the structured RCA status.
- Packaged 21 built-in detection patterns: 6 Kubernetes patterns are available by default; 8 Prometheus and 7 Loki patterns require their data-source integrations and explicit enablement.

## Validation and impact

- The repository documents v0.4.0-beta.3 as the current published release and identifies broader real-cluster validation as ongoing work.
- Repository validation reports 15/15 P0 runtime scenarios, 2/2 canonical-workload scenarios, 5/5 request-rate-surge cases, and 10/10 high-error/high-latency pattern cases passing. These are project validation results, not production service-level outcomes.
- The default Helm path is read-only and uses the heuristic provider without external model credentials. Hosted providers and mutation permissions are opt-in.

## Limitations and next steps

- The project is in beta; broader real-cluster coverage and production hardening for adapter authentication, retries, and backoff remain open.
- Prometheus and Loki rule patterns need their corresponding integrations and explicit enablement; the full set of 21 patterns is not enabled by default.
- Guarded remediation is experimental. The current development slice allows only an approval- and policy-gated Deployment rollout restart with separate experimental executor permissions; a GitOps pull-request executor remains planned.
- The project does not provide a general-purpose shell or cluster agent, nor does it claim that an RCA verdict guarantees a confirmed root cause or a remediated workload.

## Engineering focus

This project brings together Kubernetes API design, evidence governance, model-provider boundaries, security defaults, and validation maturity in one operational workflow.
