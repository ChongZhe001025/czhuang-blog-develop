# MQTT Infrastructure & WebSocket Architecture Assessment

Browser clients cannot use a raw TCP socket for MQTT. Browser access therefore requires MQTT over secure WebSockets, while the existing EMQX deployment also needed a hosting review that considered persistence and operational ownership.

## Architecture and design

- Define a browser-to-EMQX WSS path with TLS, authentication, and topic ACLs.
- Specify client ID, keepalive, reconnect, subscription, and backend-publish verification behavior.
- Compare GKE Autopilot and VM hosting against persistence, backup, updates, networking, monitoring, and maintenance responsibility.
- Analyze application startup probes separately from the hosting decision.

## Implementation

- Inventoried EMQX image versions by environment.
- Designed the WSS listener and browser client requirements, including TLS certificate and topic access controls.
- Evaluated the work needed to move EMQX from GKE Autopilot to a VM.
- Investigated an early Kubernetes liveness probe that restarted the application before initialization completed.
- Traced the restart behavior to an identity-discovery dependency timeout and separated that root cause from the MQTT hosting assessment.

## Validation and impact

- EMQX versions, connection requirements, and part of the Kubernetes startup issue have investigation records.
- The evidence supports a WSS design and migration assessment, not a completed WSS deployment or VM migration.

## Limitations and next steps

- WSS connectivity, certificate rotation, authentication, and the full backend-to-browser message path still require validation.
- The hosting choice remains open and should account for availability, cost, persistence, and maintenance responsibilities.

## Engineering focus

Messaging architecture, protocol understanding, Kubernetes troubleshooting, and infrastructure trade-off analysis.
