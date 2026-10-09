# Debugging Argo CD OutOfSync: CRDs, Hooks and Finalizers

An Argo CD application marked `OutOfSync` or `Degraded` is a symptom, not a diagnosis. In a HomeLab cluster, similar status messages came from distinct causes: a custom resource was applied before its CRD existed, a hook was still waiting, a finalizer affected deletion, or a resource was managed from the wrong layer.

The fastest way to resolve these cases is to identify which reconciliation boundary failed before changing the manifest.

## Case 1: A custom resource has no API definition

One sync reported `PrometheusRule` resources as missing because the destination API server could not find the corresponding CRD. A custom resource is only valid after its CRD has registered the API kind. Applying the object first produces a sync error even when the YAML itself is valid.

The first useful evidence is the API discovery result: if `kubectl get crd` and `kubectl api-resources --api-group=monitoring.coreos.com` do not show the type, the child manifest cannot be fixed by editing its fields. Resolve the Prometheus Operator/CRD installation or ordering first, then retry the dependent app.

Check the API server before editing the application:

```bash
kubectl get crd | grep -i prometheus
kubectl api-resources --api-group=monitoring.coreos.com
kubectl get prometheusrules -A
```

If the CRD is absent, find the owning platform application or chart and verify that it completed installation. Then establish ordering between the CRD provider and applications that create custom resources. Depending on how the platform is structured, this may mean separate Argo CD applications with an explicit dependency, sync waves, or waiting for the CRD to become Established before applying dependent resources.

Do not repeatedly sync the child application while the API definition is missing. That only repeats the same failed request.

## Case 2: A namespace is owned by the wrong layer

The cluster also surfaced a design question: should a platform namespace be created by an application-level GitOps directory, or by the Terraform stack responsible for that platform layer? The chosen direction was to manage the namespace alongside its observability platform resources.

The explicit decision was not to introduce a separate GitOps `01-namespaces` application. Terraform's observability stack owns that namespace. This is a resource ownership decision and should be kept distinct from the CRD ordering incident.

The general rule is more important than the tool choice: give each namespace one owner. If Terraform creates it while Argo CD also declares it, differences in labels, annotations or lifecycle can produce drift and make deletion behavior unclear. If Argo CD owns it, ensure the owning application exists before namespaced resources are synced.

## Case 3: A sync is waiting on a hook or finalizer

Hooks run at specific points in a sync lifecycle and may block later resources until they complete. Finalizers delay deletion while a controller performs cleanup. Both can leave an application looking stuck even though the underlying resource is present.

The hook-wait and finalizer warnings came from separate conversations and were not shown to share the missing `PrometheusRule` CRD root cause. Use the Job status for hook progression and inspect the resource's owning controller before considering finalizer removal. Removing a finalizer can bypass cleanup and should not be the default way to make the Argo CD page green.

Inspect the application conditions, hook Job status, resource events and finalizers before removing anything:

```bash
argocd app get <application>
kubectl get events -A --sort-by=.lastTimestamp
kubectl get jobs,pods -n <namespace>
kubectl get <resource> <name> -n <namespace> -o yaml
```

Removing a finalizer by hand can bypass cleanup that protects persistent data. First confirm which controller owns it and whether its cleanup has completed or is blocked.

## A repeatable investigation sequence

1. Read the exact Argo CD condition and identify the resource and API group.
2. Ask the destination API server whether that kind exists.
3. Check the owning application, chart and sync ordering.
4. Inspect events and hook Job status.
5. For deletion, inspect the finalizer and the controller responsible for it.
6. Check whether Terraform and GitOps both claim ownership of the same object.
7. Sync again only after the missing dependency or ownership conflict is corrected.

`Synced` and `Healthy` are useful end states, but the resolution should also explain why the desired and live states diverged. For the CRD case, verify the API is discoverable and the dependent resource exists; for hooks, verify the Job completed; for deletion, verify controller cleanup and the resource lifecycle. Treating CRD ordering, hook waits, finalizers and ownership as separate failure modes makes the runbook safer and the next incident easier to diagnose.
