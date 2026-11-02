# Reports date filtering

The frontend uses the date parameter names accepted by
`ReportsAnalyticsController::resolveRange()`:

```text
GET /reports-analytics?from=2026-10-01&to=2026-10-28
GET /reports-analytics/pdf?from=2026-10-01&to=2026-10-28
```

Both dates are required together. With both inputs empty, the backend returns its
default last-30-days period. The page waits for both dates before applying a custom
range. Reset dates returns to the default period. PDF downloads use the displayed
report's effective range, including when the inputs are empty.

## Confirmed backend behavior

The local backend controller and route definitions were inspected:

- `ReportsAnalyticsController` handles both endpoints. Its range resolver reads
  `from` / `to` or `from_date` / `to_date`. It does **not** read `date_from` /
  `date_to`, which the frontend previously sent. Those parameters silently fell
  back to the default reporting period.
- The resolver validates date order and includes the full From and To days using
  `startOfDay()` and `endOfDay()`.
- Summary totals, daily collection, participating students, material and section
  breakdowns, recycler rankings, redemptions, and historical compartment logs
  already apply the resolved range before aggregation.
- JSON analytics and PDF generation share `resolveRange()` and `buildPayload()`.
- `AnalyticsReportController` manages saved report records; it does not supply
  the Reports page's analytics or PDF download.

No backend changes are required for filtering historical reports by both dates.
Accepting a single date boundary or keeping the old `date_from` / `date_to` names
would require changes to the backend range resolver.

## Current readings and forecasts

`compartments.current` displays live fullness regardless of the selected period.
Historical compartment logs and the historical portions of predictive charts do
follow the reporting range.

Stored forecasts are selected from today's date onward, independently of the
reporting range. Selecting dates does not retrain Prophet. Making forecasts follow
a selected historical or future period requires a separate backend change to
`buildPredictivePayload()` and an agreed forecast-window policy.

## Verification

The production build and Reports ESLint check passed. Direct checks of the actual
backend range resolver passed for custom, same-day, default, reversed, and
incomplete ranges, and reproduced the old parameter-name bug without database
access. Full analytics and PDF generation against database records were not run.

To verify against actual records,
compare two date ranges with known different activity, a same-day range, and a
range without activity. Confirm the displayed historical totals and downloaded
PDF contents match, and confirm Reset dates restores the default period.
