# Designing Safe Kubernetes Automation with FluxSeer

An automation system that can inspect a Kubernetes incident should not automatically be trusted to change the cluster. Before a proposed action can be considered, the system needs to establish that its inputs are valid, its target is supported, and the action fits an explicit risk policy.

FluxSeer RCA development explored that boundary through runtime validation, risk rules and user-facing scenarios. The goal was to reject ambiguous or unsupported requests early, then make the evidence and decision visible to a human operator.

## Validate before investigating or acting

Validation belongs at the runtime boundary, not only in documentation or a user interface. A request can be malformed even when it passes through a valid API endpoint. At minimum, validate:

- the target exists and is of a supported kind;
- the requested investigation mode is supported;
- the data source is configured and reachable;
- query templates are valid for the selected adapter;
- required fields and security-related settings satisfy the API contract.

If a request fails one of these checks, return a structured reason and stop before producing an investigation or action. This prevents a downstream component from guessing what the user intended.

## Make risk policy explicit

Risk rules turn operational boundaries into reviewable policy. A useful rule should make clear which signal it evaluates, which target types it applies to, how severity is determined, and whether a proposed remediation is allowed, blocked or requires approval.

Defaults matter. If a rule has no explicit match or a required data source is unavailable, the system should not silently widen its permissions. The safer behavior is to return an explainable “not eligible” result and preserve the evidence that led to it.

For each proposed action, keep the decision traceable:

```text
request
  -> validated target and data sources
  -> evidence-backed finding
  -> matching risk rules
  -> eligibility / approval decision
  -> bounded action, if permitted
  -> recorded result
```

An analysis result and an action result are different things. A credible root-cause finding does not itself authorize a change.

## Test rejection paths, not just the happy path

The datasource validation work recorded a matrix of 12 scenarios, all passing. It covered invalid targets, unsupported investigation modes and target kinds, invalid query templates, and invalid specification cases. These negative tests are valuable because unsafe behavior often appears at the edges where an input is incomplete or a capability is unsupported.

A robust matrix should assert more than the HTTP status. For each invalid case, verify that the response identifies the failing field or capability, that no action is created, and that no write reaches the cluster.

Also test the successful read-only path: the requested source is selected, evidence is returned with its provenance, and the report makes uncertainty visible. User-facing tests should confirm that the operator can understand why a request was accepted or rejected.

## Keep action lifecycle separate from action eligibility

An action may be eligible but still need approval, execution, observation and expiry handling. The development conversations treated AgentAction TTL as a planned lifecycle improvement; it should be described as a design concern until its implementation and tests are confirmed.

This separation avoids a common safety mistake: treating “the action passed validation” as equivalent to “the action is complete and harmless.” Systems need explicit states, bounded execution and a clear record of what happened.

## Practical safety properties

- Fail closed when target identity, data source or policy evaluation is ambiguous.
- Keep investigation evidence separate from permission to mutate the cluster.
- Use structured validation errors that identify the rejected capability.
- Test both accepted requests and every important rejection path.
- Record which policy and inputs produced the decision.
- Require bounded execution and a human review boundary for risky changes.
- Do not claim broad Kubernetes coverage from a finite validation matrix.

Safe automation is built by making the limits executable and testable. The most useful result is not a system that always says “yes”; it is one that can explain what it knows, what it cannot verify, and why an action is or is not allowed.
