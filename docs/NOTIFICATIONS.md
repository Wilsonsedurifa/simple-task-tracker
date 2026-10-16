# Derived task notifications

## Files changed for this request

- routes/web.php: replace the existing authenticated Notifications placeholder view with tasks.notifications; no URL/name/middleware or API change.
- resources/views/tasks/notifications.blade.php: grouped feed, All/Unread tabs, unread summary, mark-all action, storage warning and loading/error states.
- resources/views/tasks/partials/notification-dropdown.blade.php: shared-shell native bell popover, latest-five preview, close/mark-all controls and View all link.
- resources/views/tasks/partials/topbar.blade.php: convert the bell link to an accessible dropdown button with capped count.
- resources/views/tasks/partials/sidebar.blade.php: mirror the derived unread count.
- resources/views/tasks/partials/mobile-navigation.blade.php: mirror the count in the mobile More sheet.
- resources/views/layouts/app.blade.php: expose the authenticated user ID for storage isolation and include the dropdown; no server notification count is assumed.
- resources/css/tasks.css: token-based feed, icons, unread/read states, counters and responsive dropdown styles.
- resources/js/tasks.js: initialize notifications once on every shared-shell page through appSafeInit.
- resources/js/modules/app-notifications.js: shared-array subscription, UI rendering, read/filter actions, badge synchronization, accessible dropdown, refresh/retry and cross-tab updates.
- resources/js/modules/app-notification-data.js: pure derivation, daily IDs, local-date grouping and latest-five membership selection.
- resources/js/modules/app-notification-storage.js: user-scoped read-ID storage with malformed/blocked/quota failure handling and cross-tab merge-before-write.
- resources/js/modules/app-shell.js: extend the existing unread hook to show numbers capped at 9+ while aria-labels retain the actual count.
- resources/js/modules/app-task-components.js: extend the shared original SVG icon helper with calendar/clock/alert paths.
- tests/Feature/WorkspaceTest.php: Notifications page, authenticated identity and shell contract.
- tests/browser/workspace.mjs: integrate notification checks and theme contrast coverage with prior-page regressions.
- tests/browser/notification-checks.mjs: full notification workflow and resilience checks.
- tests/browser/notification-data.mjs: deterministic derivation, ID, time-window, grouping, ordering and storage tests.
- docs/NOTIFICATIONS.md: this handoff.

## Behavior and compatibility decisions

These are derived reminders, NOT pushed messages. There is no notification API, model, migration, delivery permission or server-persisted message history. No new dependency was added. One initial shared task request continues to serve each workspace page.

Each currently applicable task yields at most one reminder: overdue, due today, due tomorrow, or completed within the last 24 hours. Invalid/future completion timestamps and older completions are excluded. Date-only deadlines use the existing frontend normalization and local-date helpers; completion timestamps are bucketed in the browser's local timezone.

IDs are taskId:type:applicabilityDay (YYYY-MM-DD in local time). A still-applicable item gets a fresh ID on a new local day, including a completion still inside its 24-hour window. Completion text/time/grouping uses its actual timestamp, not the applicability day. Deadline reminders are grouped under the current applicability day and show Today rather than pretending they were pushed at a particular time.

The page groups Today / Yesterday / Earlier only when populated, retaining server task order within each group. Earlier can occur when a spring-DST 24-hour window spans two local date boundaries. Items disappear when their conditions no longer apply; read IDs are not an archived message list.

Latest five selects the five newest timestamps but filters the original item array for display. It does not chronologically sort tasks on the client. This follows the project's no-client-sorting rule.

Read IDs are JSON under localStorage key app-notifications-read:USER_ID, schema {version:1, ids:[...]}. Task titles/descriptions are not stored there. Reads survive reload, remain isolated between accounts, merge another tab's reads before writing, and react to storage events. Blocked storage or quota failures keep reads in memory for the current tab with an explicit warning; persistence is not falsely reported as successful.

Derivation refreshes on shared task changes, every minute while visible, and on window/tab return. No polling request is added. Optimistic completion/reopen and rollback immediately update reminder types, read counts, page and preview through the same shared state.

## Verification checklist

- Production build, full PHP suite, notification helper tests and earlier date/dashboard helper tests.
- Earlier workspace/public pages still load with clean baseline browser console diagnostics and one initial shared task request.
- All five theme modes/accents, widths 380/768/1024/1280/1920, keyboard and reduced motion; no page overflow and checked text/counter contrast.
- Four derived types; exact 24-hour cutoff; server order; escaped task titles; local-day IDs; actual Earlier group across spring DST.
- Page grouping, All/Unread keyboard tabs, single-read drawer opening, read-dot removal, mark-all, reload persistence and disabled empty-state actions.
- Bell/sidebar/mobile counts, 9+ cap with full aria-label count, latest-five membership, keyboard arrows, Esc/outside close, focus restoration and View all.
- Shared complete/reopen updates and failed-completion rollback update notifications without extra notification/task fetches for read/filter/dropdown actions.
- Cross-tab read synchronization and a second real registered user with the same browser storage but a separate auth session cannot reuse or overwrite the first user's read namespace.
- Fresh day IDs and 24-hour expiry under an accelerated browser clock.
- Loading skeleton, task-fetch failure/retry, preserved dropdown focus after recovery, empty state and blocked-storage in-memory fallback.

Commands:

```powershell
php artisan test
npm run build
node tests/browser/notification-data.mjs
node tests/browser/calendar-data.mjs
node tests/browser/task-dates.mjs
node tests/browser/dashboard-data.mjs
$env:PLAYWRIGHT_MODULE_PATH='C:\Users\PITO\AppData\Local\Programs\Python\Python311\Lib\site-packages\playwright\driver\package'
node tests/browser/workspace.mjs
```

The browser suite uses the already-installed external Playwright runtime and an isolated SQLite database on port 8137. It creates its test-only second account there and never resets the live application database. Expected simulated HTTP failures are separate from clean-load console checks.

Unverified: MySQL execution, non-Edge browser engines, physical touch devices, screen-reader output and a real browser-storage quota exhaustion event (blocked writes are exercised by unit tests). Native Popover API support is required for the bell dropdown.

Suggested commit: feat: add derived notifications with per-user reads and bell preview
