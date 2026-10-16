# Dashboard implementation

## Files changed for this request

- resources/views/tasks/dashboard.blade.php: local greeting/date hooks, four linked statistics, quick add, progress track, seven-day chart/table, in-progress cards and tabbed activity panel.
- resources/css/tasks.css: token-based responsive dashboard layout, 340px sticky side panel, chart, form, tabs, week strip, shared compact rows and focus-safe scrolling.
- resources/js/modules/app-dashboard.js: dashboard subscription/rendering, quick-add validation, accessible persisted tabs, day filters, shared drawer actions, local greeting refresh and retry handling.
- resources/js/modules/app-dashboard-data.js: local-time greeting/chart helpers, relative completion text and latest-eight membership selection without reordering tasks.
- resources/js/modules/app-task-components.js: extracted existing row/card/icon components, reused by both Tasks and Dashboard.
- resources/js/modules/app-tasks.js: import those shared components instead of duplicating them.
- resources/js/modules/app-state.js: shared mutation locks, optimistic completion timestamps, pending-overlay protection during concurrent refetches and rollback.
- resources/js/modules/app-dialog.js: disable drawer actions while that same task is being updated elsewhere.
- tests/Feature/WorkspaceTest.php: dashboard markup/accessibility contract.
- tests/browser/workspace.mjs: integrate dashboard checks with the earlier page regression suite.
- tests/browser/dashboard-checks.mjs: dashboard interactions, responsive geometry, optimistic completion/rollback, first-run and validation checks.
- tests/browser/dashboard-data.mjs: deterministic greeting, seven-day buckets, relative times and latest-eight selection tests.
- docs/DASHBOARD.md: this handoff.

No backend routes, validation, response shapes, database schema, sort rules, dependencies or entry points were changed for this request.

## Design decisions

- Quick add is first in the main column so the whole default form is visible at 1280x800 without scrolling; Description expands on demand.
- The side panel is 340px and sticky at viewport widths 1200px and above. Below that it stacks after the main column. Its lists scroll within a content-sized card rather than stretching into an empty full-height box.
- Done selects the eight latest completions by timestamp, then filters the original array for those IDs. Display order remains server order, not a client-side chronological sort. This reconciles the latest-eight requirement with the hard no-client-sorting rule.
- The chart counts local calendar dates of completed_at. Optimistic completion uses a numeric current timestamp, so chart/progress/counts change together and roll back together.
- The week strip covers today plus six days. Deadline group labels use the shared Tasks grouping helper: This week means the seven days after Tomorrow (days 2 through 8).
- Greeting/date/relative labels refresh each minute while visible and when the tab becomes visible, without another task request.

## Regression checklist

- Build and PHP tests; standalone dashboard/date helper tests.
- Clean-load console diagnostics for Dashboard, Tasks, Calendar, Notifications, Settings, Login, Register and Welcome.
- All five themes and their accents, widths 380/768/1024/1280/1920, keyboard and reduced motion.
- Exactly one initial shared task request on each workspace page.
- Quick add visible at 1280x800; optional details; Ctrl+Enter; escaped user content; API 400 field errors and CSRF header.
- Seven chart columns and seven accessible table rows, including first-run zero data; correct progress and neutral zero-value stat tones.
- Week-day and overdue filters, server-ordered deadline groups, no-deadline link, keyboard tabs and remembered selection.
- Four-card in-progress limit; first-eight Active limit; latest-eight Done membership and relative labels.
- Open the existing drawer from a dashboard item; Start; optimistic Complete updates all widgets; failure restores all widgets; delete refreshes the same state.
- Earlier Board/List, server sorting, move menus, native drag/drop, touch fallback, URL filters/deep links, editing, unsaved guard, logout and session/CSRF handling.

## Commands

```powershell
php artisan test
npm run build
node tests/browser/dashboard-data.mjs
node tests/browser/task-dates.mjs
$env:PLAYWRIGHT_MODULE_PATH='C:\Users\PITO\AppData\Local\Programs\Python\Python311\Lib\site-packages\playwright\driver\package'
node tests/browser/workspace.mjs
```

Browser tests use an existing external Playwright installation and an isolated SQLite database at storage/app/ui-review.sqlite on port 8137. No project browser dependency is added and the application database is not reset. Expected simulated HTTP failures are separated from clean-load console checks.

Unverified: MySQL execution, non-Edge browser engines, physical mobile devices and screen-reader output.

Suggested commit: feat: build interactive dashboard with quick add and task activity
