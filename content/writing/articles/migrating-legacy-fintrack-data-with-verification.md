# Migrating Legacy FinTrack Data with Verification

A database migration is not complete when the import command exits successfully. It is complete when the new schema preserves the meaning of the old records and the application can use the migrated data correctly.

The FinTrack migration work began with a deliberate pause: inspect the old backup and the development database schema first, and do not import until ambiguous fields have an agreed mapping. Later conversations continued with local copies and import work. That progression is a useful model for separating discovery from mutation.

The first destination survey found one ledger, seven categories and one profile; the transaction, budget, fixed-expense and ledger-rebase collections were empty. The old archive was restored into a local temporary MongoDB for inspection. The request at that stage was explicitly read-only: no restore or import into the dev database. This gives the article a concrete before-state while preserving the boundary between local inspection and a remote write.

## Phase 1: Inventory both schemas without writing

Start by identifying the source version, destination version, collections or tables, field types, identifiers and relationships. Compare representative records rather than assuming that matching field names have matching meanings.

Create a mapping table before importing:

| Source concept | Destination concept | Conversion | Open question |
|---|---|---|---|
| Legacy identifier | New identifier | Preserve or remap | Are references external? |
| Date or timestamp | New time field | Normalize explicitly | Which timezone defines the date? |
| Optional field | New default or nullable field | Apply documented rule | Is absence meaningful? |

If a field cannot be mapped confidently, stop and ask the product owner. Guessing can silently attach a transaction to the wrong account or change its date.

## Phase 2: Protect the source and make the import repeatable

Keep the original backup immutable and work from a separate copy. Record the source version and expected record counts. Build the import so it can be run in a staging database and repeated without duplicating records. A dry-run should report how many records will be inserted, updated, skipped or rejected.

Use an explicit environment allowlist in the importer and print the selected database name before any write. The migration conversation's initial “do not import” instruction is a useful guardrail: discovery commands should not silently become restore commands, and a local Mongo restore must not reuse the development connection string.

An import should be explicit about:

- identifier preservation and collision handling;
- date and numeric conversions;
- required fields and defaults;
- relationship ordering;
- records that do not match the agreed mapping.

Do not run destructive cleanup as part of an initial migration. If replacement is required, define a backup and rollback procedure first.

## Phase 3: Reconcile the result

After import, compare source and destination counts by entity and by relevant status. Then validate representative records at both the database and application levels:

1. Confirm record counts and identifiers.
2. Compare key fields and relationships for sampled records.
3. Check dates, currency precision and optional values.
4. Open the migrated data through the application APIs and UI.
5. Verify reports and recurring behavior that depend on migrated fields.
6. Record rejected records and resolve them before declaring completion.

An aggregate count can reveal missing data, but it cannot detect a wrong account reference or a shifted date. Reconciliation needs both totals and semantic checks.

## Keep the phases separate

The read-only schema survey, local backup copy and destination import are separate operations with different risk. The first migration request explicitly deferred import while field mappings were unclear. Later import sessions show that the work continued, but each migration run should still have its own input, mapping version and verification result.

Later local-copy/import work is evidence that migration implementation continued, but the early destination counts are not post-import reconciliation results. Do not compare the source archive to those empty destination collections as if they were measured after migration. A publishable migration report needs a timestamped before/after count table, sampled relationships and application-level checks for the specific run.

Use a staged sequence:

```text
backup -> schema inventory -> approved mapping -> dry run
       -> staging import -> reconciliation -> application checks
       -> production plan and rollback point -> production import
```

Never use a production database connection while still discovering field meanings.

## Migration completion checklist

- The source backup is preserved and checksummed.
- The destination schema and mapping rules are documented.
- Ambiguous fields have an explicit decision.
- The import is repeatable or safely resumable.
- Counts and sampled records reconcile.
- Core application flows work with migrated data.
- A rollback point and owner approval exist for production.

The central lesson from the FinTrack migration is simple: inspect first, agree on semantics, then import. Verification must prove that the application still understands the data, not just that the database accepted it.
