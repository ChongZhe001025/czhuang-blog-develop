# Managing a Proxmox HomeLab with Terraform

Terraform makes a HomeLab reproducible only when its resource boundaries match how the environment is operated. In the Proxmox work, production resources were split by responsibility, development resources were rebuilt, and Kubernetes provider operations exposed the difference between a valid plan and a reachable cluster.

This article describes a practical workflow for managing Proxmox-backed infrastructure without treating `terraform apply` as a routine repair command.

## Organize resources around ownership

Separate reusable base configuration from environment-specific composition. Group resources by their operational responsibility—such as networking, cluster foundation and observability—so a change to one layer has a reviewable scope.

An environment should make clear:

- which state owns each resource;
- which outputs are consumed by another stack;
- which provider credentials and endpoints are required;
- which cluster or VM is affected by a plan.

Avoid managing one Kubernetes object from both Terraform and GitOps. Terraform can provision the cluster foundation and selected platform dependencies; Argo CD can reconcile application and platform manifests. Pick one owner for each object and document the handoff.

## Treat `plan` as a safety boundary

Before applying a change, initialize the intended working directory and inspect its environment, backend and provider configuration. Then create and review a plan:

```bash
terraform init
terraform plan -out=tfplan
terraform show tfplan
```

Look for unexpected replacement or destruction, especially around control-plane VMs, network dependencies and persistent storage. If the plan cannot refresh a Kubernetes provider because the cluster is unreachable, fix the access or provider context first. A timeout is not evidence that the desired infrastructure change is safe to apply.

The HomeLab sessions encountered Terraform plan timeouts, Kubernetes authentication failures and a development environment that needed rebuilding. Those are different cases:

- **Timeout:** confirm the target API is reachable and determine which provider operation is hanging.
- **Authentication failure:** verify that the selected kubeconfig and credentials belong to the intended cluster.
- **Environment rebuild:** compare the current state and the desired environment before deciding whether to recreate or import resources.

The production refactor was explicitly to split resources into responsibility-focused modules. A separate development rebuild followed later; these were different change sets. In one plan incident the Terraform process stalled while refreshing Kubernetes-provider resources. The safe next step was to repair the cluster context/API access and rerun the plan, because a failed refresh cannot establish the remote state needed for a safe apply.

Do not solve all three by deleting state or applying with automatic approval.

## Rebuild an environment deliberately

When development resources must be recreated, first inventory what exists in Proxmox and Kubernetes. Compare that inventory with Terraform state and configuration. Decide explicitly whether each resource should be imported, replaced, or removed. Protect persistent data and access paths before changing compute resources.

The conversations also show why the environment name alone is not enough to identify scope: a local provider context can point nowhere or point to the wrong cluster, while the Terraform backend still selects a valid state. Record the intended backend key and Kubernetes context together before planning. Review destroy/replace counts, state outputs consumed by other modules, and any persistent volume dependencies before accepting a rebuild plan.

After applying, verify the result at multiple layers:

1. Terraform state contains the expected resources.
2. Proxmox reports the expected VMs and network configuration.
3. Kubernetes nodes register and become Ready.
4. GitOps controllers can reach the API and reconcile platform applications.
5. Critical storage and workloads recover.

The fifth check matters: a successful Terraform apply proves the provider completed its operation, not that applications are healthy.

The recorded work included module reorganization, development rebuild planning/apply work and repeated provider troubleshooting. One production plan was blocked because the local Kubernetes context was missing, so the records do not support a claim that every production module was applied. Report the result per environment and per run: plan generated, plan applied, provider refresh failed, or runtime verification completed.

## Plan for safe node maintenance

Infrastructure changes and node reboots can affect stateful workloads. Check PodDisruptionBudgets, storage replicas, controller availability and GitOps health before maintenance. Operate one node at a time where the architecture permits it, and wait for the node and workloads to recover before continuing.

## Operational principles

- Keep environment ownership and provider context explicit.
- Review plans before apply and investigate provider timeouts separately.
- Preserve persistent data during environment rebuilds.
- Keep Terraform and GitOps ownership boundaries clear.
- Verify cluster and application health after infrastructure changes.
- Record whether an action was planned, applied or independently validated.

The value of Terraform in a HomeLab is not simply that it can create resources. It is that changes can be scoped, reviewed and repeated while keeping stateful services recoverable.
