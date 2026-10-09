# Harbor Registry Troubleshooting: Authentication, Scanning and Image Tags

Harbor problems often appear as one vague symptom—“the image did not deploy”—even though the failure may be in CI authentication, image push, scanning, tag selection or Kubernetes pull access. HomeLab pipeline work encountered several of these stages independently, including a missing push credential reference, registry authentication failures during scanning, scan timeouts and duplicate image tags.

Two concrete configuration errors help make the boundaries clear: Harbor's external endpoint still advertised an internal HTTP URL while the tunnel catch-all did not set the expected host header; separately, a report-fetch request returned `401` because a robot username containing `$` was expanded by the shell.

The useful troubleshooting rule is to identify which client is making the failing request. A GitHub Actions runner, Harbor scanner, Argo CD updater and Kubernetes node do not necessarily share the same credentials or network path.

## Map the operation before changing credentials

Draw the failing path:

```text
CI runner -> Harbor API -> image repository
scanner   -> Harbor API -> image manifest/layers
cluster   -> Harbor API -> image pull
```

For the failing operation, record the job stage, repository, tag, HTTP status and timestamp. Keep the credential value masked. Confirm which secret reference the job resolved and whether the principal is authorized for the specific project and operation.

## Separate common failure types

### Push authentication

If the build succeeds but push fails, confirm that the job logs into the same registry hostname used in the image name. Check that the CI job receives the expected secret reference and that the account has push permission to the target project. Do not copy a token into shell output while testing.

In one workflow review, the push stage referred to an outdated Harbor secret name. Reconcile the secret reference in the actual job environment with the image registry and target project, then check the masked login/push response. A secret stored in GitHub settings but never passed to that job is functionally absent.

### Scanner authentication or timeout

A successful push does not prove that the scanner can read the image. Scan jobs may use a different service account, robot credential or network path. For an authentication error, verify read access to the project. For a timeout, check scanner job status, Harbor job service logs, registry connectivity and whether the scan is waiting on vulnerability database updates.

Do not “fix” a timeout by granting broader registry permissions. Authentication and availability are different failure classes.

For the report-fetch `401`, the secret value itself was present; the shell command construction corrupted the username. The fix was to pass username and token as environment variables and reference variables from the script for trigger, status polling and report retrieval. YAML parsing and `git diff --check` passed. The recorded work did not include actionlint (unavailable then) or a complete live report-fetch confirmation, so validate both before describing the integration as resolved.

For the external route issue, compare Harbor's configured external endpoint, Tunnel ingress service, host header and scheme. The source configuration showed an internal `http://` endpoint and a catch-all route without `httpHostHeader`. The remedy belongs in GitOps source so reconciliation preserves it. The session did not verify a live Helm apply, so describe this as a diagnosed configuration mismatch and proposed source fix, not a confirmed external recovery.

### Tag and update mismatch

Repeated tags can make the wrong image appear current. Use a traceable tag tied to the source revision or build run, and verify the digest behind it. If Image Updater watches a tag pattern or update strategy, confirm the published tag matches that rule. Then check whether the resulting desired-state change reached Argo CD.

## Diagnose from the job outward

1. Identify whether the failing operation is login, push, scan, pull or update discovery.
2. Check the exact registry hostname, project and image reference.
3. Inspect the relevant job's status and masked error output.
4. Confirm that the job has the narrow permission needed for that operation.
5. Check Harbor's project, scan and job state.
6. Verify the image manifest and digest exist.
7. Follow the image through Image Updater, Argo CD and the running Pod.

For Kubernetes pull failures, inspect the Pod event and image-pull secret in the workload namespace. A registry login that works on the CI runner does not prove the node can pull the same image.

## Keep a clean security boundary

- Use separate credentials or permissions for publishing and pulling where practical.
- Give scanners read access instead of reusing a broad push identity.
- Keep secret values out of logs, screenshots and example commands.
- Prefer immutable image identities for release traceability.
- Retain scan results with the image digest they describe.

This method turns “Harbor is broken” into a specific question about one operation, one principal and one image identity. That makes the fix narrower and the release chain easier to audit.
