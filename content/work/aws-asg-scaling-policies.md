# AWS Auto Scaling Policies & Capacity Scheduling

Several services use a mix of CloudWatch scaling policies, scheduled capacity changes, and Blue/Green Auto Scaling Groups. The key challenge was understanding how those controls interact: scheduled minimum and maximum capacity can constrain policies, a fixed-size group cannot scale horizontally, and historical synth records do not always match the current source snapshot or live AWS configuration.

## Architecture and design

- Use CPU step scaling to add capacity and a separate low-utilization alarm to remove one instance conservatively.
- Allow optional Network In/Out policies to scale out when per-instance throughput exceeds a measured target; network policies do not scale in.
- Use workload schedules to adjust ASG capacity ahead of expected demand, converting service-local times into UTC cron while accounting for day-boundary changes.
- Keep all dynamic changes inside ASG min/max boundaries and apply schedules to the deployment target expected to serve traffic.
- Use Mixed Instances Policy, ELB health checks, instance warm-up, and Capacity Rebalance as part of the capacity lifecycle.

### Workflow

1. CloudWatch metrics
2. Reactive scaling policies
3. Scheduled capacity changes
4. ASG boundaries & deployment target
5. EC2 instances & load-balancer health

## Policy and schedule details

### Scaling policy behavior

| Control | Signal | Adjustment | Guardrail |
| --- | --- | --- | --- |
| CPU scale out | Average CPU evaluated against tiered step ranges | Increment capacity by policy step | Warm-up and cooldown configured |
| CPU scale in | Sustained low utilization; missing data is non-breaching | Reduce capacity incrementally | Separate conservative alarm |
| Network scale out | Per-instance network throughput; service opt-in | Add capacity above configured target | Warm-up configured · no network scale-in |

### Scheduled capacity pattern

| Schedule | Capacity behavior | Intent |
| --- | --- | --- |
| Daily baseline | Adjust minimum and maximum capacity | Retain a planned low-demand service floor |
| Expected peak windows | Raise minimum capacity in advance | Pre-warm instances before recurring demand |
| Weekday / weekend variants | Use separate local-time schedules | Match different demand patterns without exposing exact hours |
| Deployment target | Apply scheduled bounds to the active target | Keep Blue/Green capacity aligned with traffic routing |

## Implementation

- Implemented CPU step scale-out and a separate conservative low-utilization alarm for scale-in, with instance warm-up and cooldown controls.
- Added optional per-instance Network In and Network Out scale-out policies. Network scaling is disabled by default and must be explicitly enabled; those policies do not scale in.
- Created daily and weekday/weekend capacity schedules for a production web workload, converting service-local times to UTC cron and adjusting the weekday for schedules that cross UTC dates.
- Added a deployment-time switch to suppress scheduled actions independently of reactive CPU policies.
- Configured Mixed Instances Policies to combine On-Demand and Spot capacity according to environment-specific allocation settings.
- Enabled ELB health checks and Capacity Rebalance, with service-specific health-check grace periods where configured.
- Kept Blue/Green targets separate so scheduled actions can follow the active deployment target; fixed min=max groups remain ineligible for horizontal scaling.

## Validation and impact

- Scheduled capacity changes have source and commit records, but historical changes were not all followed by synth, deployment, and metrics-based acceptance.
- Blue/Green capacity changes have TypeScript compile and CDK synth records. The currently readable source differs from historical results, so those records do not prove the live ASG state.
- A prior network-policy review found that the configured target could be too close to the burst capability of an evaluated instance family. This supports retuning from measured traffic; it does not establish that the target or instance family was changed in deployment.
- No complete CDK-to-Console drift review, production behavior verification, or measured latency, error-rate, scaling-time, or cost improvement is available.

## Limitations and next steps

- The readable helper uses CPU step scale-out plus CPU alarm scale-in; historical review notes describe Target Tracking. Treat these as different source snapshots, not one live configuration.
- Step bucket semantics depend on the associated alarm configuration. Verify the synthesized CloudFormation policy before interpreting buckets as absolute CPU thresholds.
- The shared network policy is disabled by default. Its reviewed target appeared too close to an evaluated instance family's burst ceiling, so any enabled target should be chosen from observed throughput and burst behavior.
- ASG policies cannot exceed min/max boundaries. A fixed-size group cannot scale out, and an inactive Blue/Green group with zero capacity cannot pre-warm through a scaling policy.
- The currently readable source differs from historical Blue/Green synth records. Confirm the target branch with CDK synth and AWS Console before describing live behavior.
- Schedules reserve capacity based on expected demand; they do not prove that the forecast matches traffic. Validate schedule-policy interactions, health checks, warm-up, network and storage I/O, request volume, and load-balancer latency/error signals.
- Mixed Instances allocation settings changed over time. Treat historical values as revision-specific, not as current production configuration.

## Engineering focus

Demonstrates capacity-control reasoning across reactive and scheduled scaling, Blue/Green constraints, Spot behavior, source-versus-live drift, and evidence-based policy tuning.
