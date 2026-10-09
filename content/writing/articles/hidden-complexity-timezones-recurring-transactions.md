# The Hidden Complexity of Timezones in Recurring Transactions

When a server prints UTC and a user reads local time, the displayed clock can look wrong even when both clocks describe the same instant. That confusion showed up while diagnosing FinTrack's server time: the container's UTC timestamp was several hours behind the Taiwan wall clock, but the offset explained the difference.

The harder problem was recurring transactions. They combine two kinds of time that should not be treated as interchangeable: an instant on a global timeline and a calendar date in the user's timezone.

## First distinguish clock drift from timezone display

Compare timestamps in a common timezone before changing the host clock. If the server reports `2026-04-09 23:54 UTC`, that is approximately `2026-04-10 07:54` in Taipei. The date changes because the timezone offset crosses midnight; it does not prove that the server is late.

Use UTC for machine-to-machine timestamps and logs where possible. Convert to the user's timezone at the application boundary for display and business-calendar calculations. Changing a server's system timezone can alter scheduled jobs and log interpretation without fixing the underlying date model.

## Model an instant and a calendar date differently

An audit timestamp such as “updated at” identifies a moment and is naturally stored as an instant. A recurring transaction due on a particular local day is a calendar rule. If the application converts that date to UTC too early, midnight can move to the previous or next local date.

For Go, make the business timezone explicit:

```go
loc, err := time.LoadLocation("Asia/Taipei")
if err != nil {
    return err
}

localStart := time.Date(year, month, day, 0, 0, 0, 0, loc)
localEnd := localStart.AddDate(0, 0, 1)

queryStart := localStart.UTC()
queryEnd := localEnd.UTC()
```

Use a half-open interval `[queryStart, queryEnd)` for database queries. It includes every instant in the local day without relying on a fragile “23:59:59.999” value.

For a recurring transaction, generate the next occurrence from its calendar rule and timezone, not by adding a fixed number of seconds to the previous UTC timestamp. Months have different lengths, daylight-saving regions can have irregular days, and local midnight is not always a fixed offset worldwide.

FinTrack's follow-up implementation made the ledger the timezone boundary. `Ledger.Timezone` stores an IANA timezone; fixed transactions belong to a ledger, so they do not duplicate a timezone field. Existing ledgers with an empty timezone are backfilled to `Asia/Taipei`, matching the earlier application behavior. Existing `nextRunAt` values are not forcibly recalculated during that backfill.

```go
loc, err := config.LocationForTimezone(ledger.Timezone)
if err != nil {
    return err // invalid IANA timezone is rejected at the ledger boundary
}
nextRunAt := calculateNextRunAt(dayOfMonth, from, loc).UTC()
```

The scheduler still compares the stored UTC instant with `time.Now().UTC()`. When it materializes the transaction, it uses midnight in the ledger's timezone and then converts that instant to UTC. For a day-of-month value of 31, the documented behavior clamps to the last day of a shorter month.

## Validate dates before calculating the next occurrence

The API should reject impossible dates instead of allowing silent normalization. A date such as February 31 must fail validation. For monthly recurrence, define what happens when a month has fewer days than the requested day: clamp to the final day, skip that month, or use another explicit product rule.

The stored recurrence needs enough information to reproduce the user's intent:

- the recurrence rule;
- the relevant local calendar date or day-of-month;
- the timezone used to interpret that date;
- the resulting UTC instant, if the system materializes occurrences.

Do not infer the timezone later from the server's current setting.

## Test the boundaries that caused the confusion

Use cases around midnight, month-end, leap day and timezone conversion. Also test create, edit and list flows together: a date can be saved correctly but displayed on the wrong day, or displayed correctly while a query excludes it.

The implementation also changed transaction list and report boundaries to use each selected ledger's location and a half-open interval, `occurredAt >= startUTC && occurredAt < endExclusiveUTC`. Stats, category stats, comparisons, yearly reports and budget status follow the same ledger calendar. A query for `ledgerId=all` still falls back to the application timezone because combining ledgers with different business calendars needs per-ledger aggregation.

The server-time investigation showed `2026-04-09 23:54 UTC` was the same instant as about `2026-04-10 07:54` in Taipei. Later tests covered UTC, US Pacific time, daylight-saving conversion, day 31 month-end clamping, and exclusive query end boundaries. The project record reports `go test ./...`, selected ledger/fixed-transaction UI tests, and the client build passed. A fixed-transaction scheduler integration flow remained a follow-up, so keep that limitation visible.

## A compact review checklist

- Is the field an instant or a calendar date?
- Which timezone defines a recurring user's day?
- Are day boundaries converted once and consistently?
- Are date-only inputs validated before conversion?
- Does monthly recurrence define short-month behavior?
- Do API, database query and UI tests cover midnight and month-end?

Explicit time semantics prevent a one-day shift from turning into duplicate transactions, missing reports or confusing audit history.
