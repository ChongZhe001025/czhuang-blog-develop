# Cross-Repository Schema Compatibility CI

Several application repositories consume database migrations from a shared Go module. A build or unit-test pass alone may not reveal that a branch references an older module version, changes a previously published migration, or introduces a schema change that is unsafe for existing application versions.

## Architecture and design

- Compare the shared module version referenced by the working branch with the develop baseline.
- Inspect migration history and new schema changes before allowing code integration.
- Report validation through CI so repository owners can review failures before merge.

### Workflow

1. Application repositories
2. Shared Go module
3. Migration integrity checks
4. Schema compatibility checks
5. CI status

## Implementation

- Added a cross-repository version check for the shared Go module.
- Used Git history and migration deltas to detect deleted or modified existing migrations.
- Added migration naming, duplicate numeric version, and published-file immutability checks.
- Built compatibility checks for cases such as new nullable columns and required columns with defaults.
- Added Python unit tests for valid changes, invalid migrations, and SQL-comment parsing edge cases.
- Scoped the private Go module SSH URL rewrite to the relevant repository instead of changing global Git configuration.

## Validation and impact

- The checker and its unit tests have successful execution records.
- A branch that referenced a shared-module version older than develop was rejected when migrations appeared to be missing. This confirmed the guard worked and exposed the comparison's version-alignment precondition.

## Limitations and next steps

- Full Branch Protection, Merge Queue, all branch triggers, and private-repository permission coverage are not yet confirmed.
- The current comparison assumes the working branch's shared module is not older than the selected baseline.

## Engineering focus

Preventive engineering across repository boundaries, with explicit checks for dependency alignment and database change safety.
