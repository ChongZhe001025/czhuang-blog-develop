# BigQuery Infrastructure as Code & CDC Architecture

As systems expanded across regions, analytical datasets, IAM, CDC, and Terraform state needed clear ownership. Unclear boundaries could lead to inconsistent deployments, cross-region responsibility gaps, or data synchronization risk.

## Architecture and design

- Separate global and regional ownership while keeping BigQuery data location explicit.
- Organize datasets into Raw / Landing, Shared, Curated, and Mart layers.
- Connect AlloyDB to BigQuery through Datastream and private connectivity components.
- Keep Datastream optional and disabled by default until source-side prerequisites are ready.

### Workflow

1. AlloyDB
2. Private Service Connect
3. Datastream
4. Regional BigQuery datasets
5. Curated data layers

## Implementation

- Built reusable Terraform modules for BigQuery datasets, IAM members, and authorized views.
- Composed regional BigQuery resources with the matching database infrastructure scope.
- Designed private CDC connectivity using PSC endpoints, forwarding rules, network attachments, and Datastream connection profiles.
- Documented remote state contracts and corrected state key and output dependencies across scopes.
- Iterated through Terraform plans in test environments and adjusted resource composition and configuration sources.

## Validation and impact

- The BigQuery module and scope-based Terraform composition have implementation records.
- A sample regional scope plan was checked; other scopes were rechecked after remote-state dependency corrections.
- A Datastream data-completeness issue informed the follow-up validation design.

## Limitations and next steps

- There is no evidence that every scope has completed Apply or that Datastream is broadly enabled and has passed production data acceptance.
- Full recovery after database reset, cross-region query cost, historical backfill, and data governance still need validation.

## Engineering focus

Multi-region data architecture, Terraform composition, private connectivity, and data-pipeline reliability planning.
