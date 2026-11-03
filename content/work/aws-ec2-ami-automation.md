# AWS EC2 Deployment & AMI Automation

Creating a temporary EC2 builder and capturing an AMI required repeated lookups and manual parameter transfer. Reusing the wrong source settings could introduce launch drift, while separate scripts made it easy to lose the instance ID or confuse the two dry-run controls. Operational investigation also surfaced encrypted-volume KMS access, SSM connectivity, and the need to retire old images without removing referenced ones.

## Architecture and design

- Treat builder-instance creation and AMI capture as separate stages, with the created Instance ID as the explicit handoff between them.
- Use a service's active Auto Scaling Group and its InService instances as the source for launch configuration, including the base AMI, instance type, subnet, security groups, key pair, and instance profile.
- Emit a shell-safe parameter bundle for region, Instance ID, service, environment, date, reboot behavior, AMI dry-run, and wait behavior; persist it locally only after a real builder launch.
- Keep image cleanup separate from image creation: collect references from EC2 instances, Launch Template default/latest versions, and Launch Configurations before applying an age threshold to candidates.

### Workflow

1. Active Auto Scaling Group
2. Builder EC2 with inherited settings
3. Parameter handoff
4. AMI capture and tagging
5. Reference and age-based cleanup

## Implementation

- Added a service allowlist and derived the candidate Auto Scaling Group names from a shared naming rule. The script stops when it cannot identify one unambiguous active group.
- Read launch inputs from active instances instead of duplicating environment-specific values in the command. When multiple subnets were found, the script surfaced a warning and selected the first; this behavior remains an operator decision point.
- Made the builder output all inputs needed by the AMI script and write a local .ec2_env handoff file only for a real EC2 launch, keeping generated instance state out of version control.
- Kept EC2 launch dry-run and AMI creation dry-run as independent controls, alongside explicit no-reboot and wait options, so each stage can be reviewed separately.
- Kept the shell implementation compatible with macOS's Bash 3.2 by avoiding Bash 4 associative arrays.
- Built an AMI cleanup workflow that unions image references from EC2, Launch Template default/latest versions, and Launch Configurations, then filters unreferenced images older than one year. Associated snapshots are handled separately because snapshots can be shared by more than one image.
- In adjacent CDK-managed Ubuntu bootstrap work, added SSM diagnostics for snap-managed and package-installed agents, IMDSv2 region lookup, attached-role visibility, regional endpoint reachability, and agent service state.

## Operational findings

- An EC2 instance can launch successfully while AMI capture still fails: encrypted EBS volumes require an enabled KMS key and matching key-policy/grant access, including kms:CreateGrant, kms:Decrypt, kms:DescribeKey, kms:GenerateDataKeyWithoutPlaintext, and kms:ReEncrypt.
- SSM reachability is a separate identity, bootstrap, and network path. A running instance needs a compatible agent service, instance-profile permissions, metadata access, and outbound access to the regional SSM messaging endpoints.
- AMI deregistration does not remove its EBS snapshots. Before deleting snapshots, check whether another retained AMI still references them, then verify both image and snapshot state after cleanup.

## Validation and impact

- Shell syntax and help output were checked for the automation scripts.
- An AWS EC2 dry-run for an added service returned Request would have succeeded without launching an instance.
- A real builder instance was created, confirming the launch path, but its AMI attempt stopped at a KMS access error on an attached encrypted volume. This is evidence of partial execution, not a completed image-release workflow.
- One AMI and snapshot cleanup run finished with post-run AWS queries reporting no remaining targeted objects and no deregistration or deletion errors.

## Limitations and next steps

- The KMS-blocked AMI attempt has no recorded successful end-to-end retry; Auto Scaling rollout, target-group health checks, and rollback drills are also not confirmed for every service.
- When source instances span multiple subnets, the current builder chooses the first one after warning. Availability Zone, subnet capacity, and network-path suitability should be confirmed or selected explicitly.
- The cleanup reference scan covers EC2 instances, Launch Template default/latest versions, and Launch Configurations. There is no evidence it checks every explicitly pinned Launch Template version or every external/account-level image reference, so the candidate set needs review before destructive cleanup.
- The SSM bootstrap changes passed shell syntax validation, but their behavior was not confirmed by a live instance acceptance test.
- No measured deployment-time, image-build-time, cost, or failure-rate improvement is available.

## Engineering focus

AWS automation, practical shell engineering, deployment workflow standardization, and cloud troubleshooting.
