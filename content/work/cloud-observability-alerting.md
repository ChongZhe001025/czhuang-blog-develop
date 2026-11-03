# Cloud Observability & Alerting Infrastructure

Reliable operations depend on detecting failures, delivering alerts, and retaining useful logs. These paths cross multiple systems, so availability, secret handling, and failure behavior need explicit design and validation.

## Architecture and design

- Protect monitoring components against disruption during maintenance.
- Reference notification secrets from AWS Secrets Manager instead of embedding tokens in source.
- For S3 log shipping, make source paths, scheduling, failure records, and shutdown flushing explicit.

## Implementation

- Adjusted Alertmanager replicas and PodDisruptionBudget and parsed the Kubernetes YAML for structural validity.
- Integrated selected EC2/database stop alerts and Lambda notification configuration through AWS CDK.
- Evaluated a chat-based notification channel and recommended referencing its credential from a managed secret store.
- Reviewed an EC2/VM log-to-S3 design, including log paths, S3 key partitioning, schedule, and error records.
- Identified risks around fixed service paths, missing scheduled-job output, shutdown flushing, and cron overlap.
- Proposed environment-based log paths, explicit execution records, and a systemd timer for follow-up.

## Validation and impact

- Some Alertmanager configuration changes have structural validation records.
- The AWS alert integration compiled, but notification delivery has not been confirmed end to end.
- The S3 log-shipping work is a design and risk review; production deployment is not evidenced.

## Limitations and next steps

- Alert delivery rate, monitoring coverage, log-transfer failure handling, S3 lifecycle policy, and monitoring availability during component failure need further validation.

## Engineering focus

Observability design, operational risk analysis, alert configuration, and reliability engineering practices.
