# Calendar implementation

## Files changed for this request

- routes/web.php: point the existing authenticated /calendar route at tasks.calendar; its URL, name and auth middleware are unchanged.
- resources/views/tasks/calendar.blade.php: month navigation, ARIA grid, mobile agenda, loading/error/empty regions, Unscheduled details list and native day popover.
- resources/views/pages/placeholder.blade.php: add the missing browser-local Monday/Sunday preference on the existing Settings page; leave Notifications unchanged.
- resources/css/tasks.css: token-based calendar layout, task pills, day popover, mobile agenda, sidebar and preference styles.
- resources/js/tasks.js: initialize Calendar and Settings through the existing isolated appSafeInit wrapper.
- resources/js/modules/app-calendar.js: shared-array rendering, month URL, keyboard navigation, responsive agenda, native popover, existing drawer/create integration, retry and settings updates.
- resources/js/modules/app-calendar-data.js: local month/day/week arithmetic and server-ordered deadline buckets.
- resources/js/modules/app-settings.js: defensive storage and the week-start control.
- resources/js/modules/app-dates.js: preserve local calendar years (including 0001–0099), format four-digit years and accept numeric epoch timestamps correctly.
- resources/views/layouts/app.blade.php: expose the configured application timezone as escaped metadata.
- resources/js/modules/app-state.js: normalize Laravel ISO-serialized date-only deadlines back to YYYY-MM-DD before local-calendar use; completed/created timestamps are untouched.
- resources/js/modules/app-dialog.js: optional due-date prefill and creation minimum, plus focus return to visible calendar openers after refetch.
- tests/Feature/WorkspaceTest.php: authenticated Calendar/Settings markup contract coverage.
- tests/browser/workspace.mjs: integrate calendar interaction and contrast checks with earlier-page regression tests.
- tests/browser/calendar-checks.mjs: keyboard, popover, due-date creation, agenda, storage, responsive and failure-state tests.
- tests/browser/calendar-data.mjs: deterministic local-date, leap-year, week-start, year-boundary and ordering tests.
- docs/CALENDAR.md: this handoff.

## Scope and decisions

No new API, controller, schema, validation, backend setting or dependency was added. The only routing change swaps the existing Calendar placeholder view for its implementation.

Settings did not contain a week-start preference. The added control persists JSON under localStorage key app-settings, field weekStart (monday or sunday), defaulting to Monday. It preserves other fields in that settings object. Calendar listens for cross-tab storage changes. Storage access is guarded; if blocked, Calendar still works with Monday and Settings explains that saving failed. This is a browser-local preference, not an account-synchronized backend setting.

Calendar always renders six weeks (42 cells), including surrounding-month dates. Cell task contents are grouped from the original server-ordered array and never sorted. Month navigation updates ?month=YYYY-MM using replaceState without fetching again; existing task deep links remain intact.

The current backend date cast returns deadlines as ISO timestamps. Client normalization recovers the original date in the configured app timezone, then existing helpers split YYYY-MM-DD into a local date. The HTTP response shape is unchanged. This avoids deadline drift when the browser is in another timezone without changing backend validation or serialization.

Creation uses the later of browser-local today and the server's current calendar day as its minimum. This prevents offering a date that the unchanged API would reject when the two timezones are on different days. Both values are parsed as local date-only values for comparison; the Today highlight still follows the browser's local date.

Keyboard: one roving grid-cell tab stop; arrows move by day/week, Home/End move to week edges, PageUp/PageDown change month, Enter/Space opens the focused day. The day popover gives keyboard access to all tasks, including pills beyond the three-item preview. Esc/outside click closes it. Mouse users can click pills directly or an empty date to create. Past dates remain browsable, but creation is disabled.

Below 768px Calendar displays an agenda with a week strip, previous/next week controls and the selected day's server-ordered rows. Unscheduled is a native collapsible list, retaining its expanded/collapsed state during shared-state updates.

## Verification checklist

- Build and full PHP tests pass; all previous date/dashboard helpers still pass.
- Local-date helper tests cover leap day, year rollover, Monday/Sunday starts, ordering and local midnight across DST in America/New_York.
- Browser regression visits all five workspace pages and existing public auth/welcome pages with clean baseline console diagnostics.
- All five themes and accents; widths 380/768/1024/1280/1920; keyboard and reduced motion; no page-level horizontal overflow.
- Calendar month URL, previous/next/Today, exactly 42 cells, today indicator, surrounding dates and no navigation refetch.
- Arrow/Home/Enter/Esc focus, day popover, outside dismissal, three-pill cap, +N more, all-day list and escaped/truncated user titles.
- Creation prefills the exact selected local date, refuses past empty-date clicks, preserves sidebar collapse through refetch and returns focus to the originating date.
- Grid/agenda switch at 768px, seven-day strip, selected-day tasks and past-day disabled Add button.
- Unscheduled opens the shared drawer; existing edit/complete/delete/deep-link/logout flows remain covered by the full suite.
- Settings persist Monday/Sunday and Calendar applies live storage changes; blocked storage remains functional and reports failed persistence.
- Loading skeleton, retry after network failure and the empty-month message Walang deadline ngayong buwan.
- Fixture checks also run with browser timezone America/Los_Angeles to catch date-only UTC parsing mistakes.

Commands:

```powershell
php artisan test
npm run build
node tests/browser/calendar-data.mjs
node tests/browser/task-dates.mjs
node tests/browser/dashboard-data.mjs
$env:PLAYWRIGHT_MODULE_PATH='C:\Users\PITO\AppData\Local\Programs\Python\Python311\Lib\site-packages\playwright\driver\package'
node tests/browser/workspace.mjs
```

The browser suite uses an already-installed external Playwright runtime and an isolated SQLite database at storage/app/ui-review.sqlite on port 8137. It does not reset the real application database. Expected simulated HTTP/network errors are separated from clean-load console checks.

Unverified: MySQL execution, other browser engines, physical touch devices and screen-reader output. Native Popover API support is required for the day popover (verified in Edge).

Suggested commit: feat: add accessible calendar and mobile agenda from shared task state
