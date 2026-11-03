# AutoSEL

AutoSEL is a master's thesis project for automating SELinux policy generation and enforcement for Docker containers. It monitors container events and configuration, then generates, updates, and applies policies for container-specific security controls.

## Engineering challenge

Managing SELinux policies for changing container workloads involves inspecting container settings, generating appropriate rules, and keeping enforcement aligned as containers change. AutoSEL explores how to automate this lifecycle as a master's thesis project.

## Architecture and design

- Monitor Docker container events and inspect container configuration when workloads start or change.
- Parse container settings to prepare policy inputs for the policy-generation component.
- Generate and load SELinux policies, then apply them to containers using customized SELinux labels.
- Re-run policy generation and replace affected containers when monitored events require an updated policy.

The container policy lifecycle is:

1. Docker events
2. Container inspection
3. Policy generation
4. SELinux policy load
5. Container enforcement

## Implementation

- Built separate components for container monitoring, configuration parsing, policy creation, and policy application.
- Automated policy generation and reload in response to Docker container events.
- Documented the container replacement flow used to apply generated policies and SELinux labels.
- Demonstrated policy controls for privileged containers, device and host mounts, and system capabilities.

## Validation and impact

- The project documentation includes demonstrations of automatic policy generation and reload as well as restrictions on privileged operations, mounts, and capabilities.
- These are documented project demonstrations; no production rollout, scale benchmark, or operational impact measurement is claimed.

## Limitations and next steps

- Applying regenerated policies can require stopping and replacing a container, so workload interruption and data handling need to be considered.
- The available project notes do not report large-scale performance results or production deployment validation.

## Engineering focus

This master's thesis combines Linux security, Docker lifecycle events, SELinux policy generation, and container enforcement in an automation workflow.
