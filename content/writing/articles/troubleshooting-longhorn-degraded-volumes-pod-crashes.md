# Troubleshooting Longhorn Degraded Volumes and Pod Crashes

Two `longhorn-manager` Pods in `CrashLoopBackOff` can make an Argo CD platform application appear degraded. In one HomeLab incident, the manager log exposed the direct cause: the Talos host could not run `iscsiadm` because the executable was missing. The driver deployer waiting for the Longhorn backend was a consequence of the manager failure, not the first problem to fix.

This case shows why storage incidents should be traced from the failing component's own error, through its node dependency, and back to the declared node image.

## Start with the component that is actually unhealthy

Check the manager Pods, their node placement, restart counts, events and logs:

```bash
kubectl -n longhorn-system get pods -o wide
kubectl -n longhorn-system describe pod <manager-pod>
kubectl -n longhorn-system logs <manager-pod> --previous
kubectl get nodes -o wide
```

The initial evidence showed both managers crashing. The driver deployer was waiting for the backend service, while the UI Pods were not the direct cause. Following the manager's startup log led to the missing `iscsiadm` utility.

Longhorn requires host-level iSCSI tooling for relevant storage operations. On Talos, that dependency is supplied through a system extension in the machine image; installing a package inside an ordinary application container is not an equivalent fix.

## Compare the declared image with the running nodes

The repository already declared a Talos installer image intended to include the iSCSI tools extension. However, the running nodes still lacked `iscsiadm`. That difference means the desired image configuration and the actual node runtime were out of sync.

Verify the extension in both places:

1. Inspect the Talos Image Factory or installer image definition.
2. Confirm the nodes have actually been upgraded or reinstalled with that image.
3. Check the Talos runtime extension status through a current, valid Talos configuration.
4. Run the expected host command on each node and confirm it is available.
5. Only then restart or roll out the affected Longhorn workloads.

A stale Talos client configuration produced a certificate-authority mismatch during the investigation. That error did not disprove the Kubernetes evidence; it meant that particular client configuration could not be used to verify the runtime extension state. The current configuration was retrieved from the managed state before continuing.

## Repair nodes without turning recovery into a second incident

Before restarting a node, check workload placement, PodDisruptionBudgets and storage health. Drain one node at a time when the workload permits it, remove only stale failed Pods that are safe to recreate, and wait for the node and critical services to recover before continuing.

After the node image is corrected, verify:

- the node is `Ready`;
- `iscsiadm` is available on the host;
- Longhorn manager and driver deployer Pods are healthy;
- volumes and replicas return to their expected state;
- Argo CD can regenerate manifests and reports the platform application as healthy.

During the incident, a node/Cilium restart was followed by a transient Argo CD DNS comparison error. DNS lookup to `argocd-repo-server` later succeeded and the applications returned to `Synced / Healthy`. That transient symptom was separate from the original missing iSCSI tools and should not be folded into the Longhorn root cause.

## What to remember

- Read the failing manager's previous logs before restarting components.
- Treat downstream “waiting for backend” messages as possible symptoms.
- For Talos, verify that declared system extensions are present on running nodes.
- A valid Kubernetes kubeconfig does not guarantee that the Talos client configuration is current.
- Recover one node at a time and re-check storage health after each step.
- Separate the original storage failure from transient DNS or GitOps errors during maintenance.

The root cause in this incident was missing host iSCSI tooling. The method is broader: follow the first concrete startup error, verify the host dependency, and confirm the running node image matches the declared configuration.
