# Debugging Self-Hosted GitHub Actions Runners on Kubernetes

A GitHub Actions job waiting for a runner is not automatically a Kubernetes capacity problem. With Actions Runner Controller (ARC), the job passes through several boundaries: GitHub selects a runner group and labels, ARC observes the request, a runner Pod is created, and the Pod registers and accepts the job.

HomeLab runner incidents included jobs waiting, only one active runner appearing, and production runners not receiving work. The reliable fix was to diagnose the boundary where the request stopped.

The recorded incidents included a dev scale set pointing at a different namespace from the Terraform-managed runner credentials, production runner Pods Pending near the worker CPU quota, and a workflow that built multiple images serially despite a scale-set limit of two. The capacity proposal was not applied in the recorded session.

## Follow the request from GitHub to the Pod

### 1. Read the job's requested labels

Inspect the workflow's `runs-on` value and the runner group restrictions. Compare them with the labels and group advertised by the ARC runner scale set. A mismatch can leave a healthy cluster with no eligible runner.

### 2. Check whether GitHub has assigned a runner

Distinguish a queued job from one that has been assigned but whose runner has not started. The job state tells you whether to focus on matching, scale-up, registration or execution.

### 3. Inspect ARC's control path

Check the controller and listener Pods, their logs and the scale-set status. Confirm that the GitHub App or registration configuration is valid without printing its credential values. If ARC never observes the queued job, investigate the controller-to-GitHub path before changing Pod resources.

### 4. Inspect runner Pods and node capacity

If ARC creates a runner, check whether the Pod is Pending, unable to pull its image, failing startup or registering successfully. Then inspect node pressure, Pod events and scheduling constraints.

In the production case, the listener received jobs and ARC requested runner Pods, but the Pods remained Pending. Worker CPU requests were approximately 1939m/1950m and 1934m/1950m. This was a scheduling/quota problem, not evidence of a GitHub token or Argo CD failure. Increasing worker vCPU was proposed as the next capacity change; there was no apply confirmation.

```bash
kubectl get pods -A -o wide | grep -i runner
kubectl describe pod <runner-pod> -n <namespace>
kubectl logs <runner-pod> -n <namespace>
kubectl get events -n <namespace> --sort-by=.lastTimestamp
```

## Why only one runner can be active

An active count of one can be expected if only one job is eligible, concurrency is limited, or the scale-set configuration caps replicas. First determine whether multiple jobs are actually queued with compatible labels. Then compare the queue with the scale-set limits and Pod scheduling.

When several independent Docker components are built in one serial job, splitting them into separate jobs can increase parallelism. Keep tests, dependencies and publication conditions explicit: parallel execution should shorten the workflow without allowing a partial build to publish an invalid release.

The workflow in question built two images inside a single Docker job. ARC's `maxRunners: 2` cannot parallelize steps inside that one job; the workflow must expose independent jobs for GitHub to dispatch concurrently.

## Namespace and secret mismatch

In a development runner incident, the scale set targeted `github-runner-dev`, while Terraform defaults and the required token/Harbor secrets were in `github-runner`. The listener could not find the expected secret in its target namespace. The fix was to align the overlay with the namespace that owns the resources in that separate cluster, then check the rendered manifests and listener events. Do not copy secret values between namespaces just to make a Pod start; establish one namespace/ownership contract and keep secret references there.

## Common failure signatures

| Symptom | First checks |
|---|---|
| Job waits, no runner Pod appears | `runs-on`, runner group, ARC listener and scale-set limits |
| Runner Pod is Pending | node capacity, affinity, taints and resource requests |
| Pod starts but never becomes a runner | registration path, permissions and runner logs |
| One runner receives all jobs | labels, concurrency, max replicas and queued-job count |
| Runner is online but a workflow never selects it | exact label/group match in the workflow |

## A safe troubleshooting order

1. Record the job state and requested labels.
2. Confirm whether ARC observed the job and requested a runner.
3. Inspect controller, listener and scale-set status.
4. Inspect the runner Pod and scheduling events.
5. Confirm registration and label matching.
6. Change capacity only after the previous checks show a capacity bottleneck.

This order avoids restarting a healthy controller when the actual problem is a label mismatch. It also separates runner infrastructure from workflow design, so the fix addresses the layer that owns the failure.
