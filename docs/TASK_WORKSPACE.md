# Tasks workspace

## Files changed in this implementation

- resources/views/tasks/index.blade.php: Tasks heading, filterable statistics, toolbar, active filters, board/list containers and page states.
- resources/views/tasks/partials/workspace-dialogs.blade.php: replace the old details panel with the single shared right drawer; retain existing create and standalone delete dialogs.
- resources/css/tasks.css: token-based workspace, cards, rows, menus, skeletons and responsive drawer styles; larger mobile actions and navigation-safe toasts.
- resources/js/modules/app-tasks.js: server-ordered rendering, URL filters, saved server sort/view, statistics, keyboard move menus, native drag/drop, announcements and retry states.
- resources/js/modules/app-state.js: shared optimistic move/rollback and initial server-sort selection.
- resources/js/modules/app-dates.js: shared local-calendar grouping helper.
- resources/js/modules/app-dialog.js: drawer actions, inline delete confirmation, changed-only edits, description growth/counter, field errors and unsaved-change/focus/history handling.
- tests/Feature/WorkspaceTest.php: Tasks page contract coverage.
- tests/browser/workspace.mjs: expanded isolated Edge regression coverage.
- tests/browser/task-dates.mjs: local dates and day 8/day 9 grouping boundary tests.
- docs/TASK_WORKSPACE.md: this handoff.

No routes, API response shapes, validation, database schema, server sorting, dependencies or existing entry points changed for this task.

## Verification

Run `php artisan test` and `npm run build`.
Run `node tests/browser/task-dates.mjs` for standalone local-date boundary checks.

Browser checks use an existing external Playwright installation, not a project dependency:

```powershell
$env:PLAYWRIGHT_MODULE_PATH='C:\Users\PITO\AppData\Local\Programs\Python\Python311\Lib\site-packages\playwright\driver\package'
node tests/browser/workspace.mjs
```

The browser suite starts Laravel on port 8137 with a separate SQLite database at storage/app/ui-review.sqlite. It resets only that fixture user's tasks in that isolated database, never the application database.

Checklist exercised:

- Five workspace pages and public login/register/welcome without baseline console errors or warnings; one initial shared task GET per workspace page.
- Widths 380, 768, 1024, 1280 and 1920; five theme modes and every supported accent; no page-level horizontal overflow.
- Appearance persistence, anti-flash restore, blocked storage, keyboard controls, reduced motion and theme text/priority contrast against 4.5:1.
- Stats filter, live subtitle, removable URL filter chips, clear filters, saved board/list view and server sort.
- Deadline group insertion without changing API array order.
- Keyboard move menu, native drag-and-drop, touch fallback, optimistic move and failure rollback.
- Shared creation, title/description search, deep links, Back, changed-only editing and overdue-task editing.
- Description maxlength/counter, unsaved-change guard, drawer geometry and focus-safe close.
- Complete/reopen/delete, inline drawer confirmation, count refresh and logout confirmation.
- Loading error/retry, empty state, edit validation 400, missing task 404, expired session 401 and CSRF 419.

Expected simulated HTTP/network failures are checked separately from clean page-load console diagnostics.

## Deliberate layout adjustment

At 1280px, four 260px columns plus the existing 260px sidebar, padding and gaps cannot fit. At 1280px and above columns share the available width equally; they reach 260px naturally as the viewport widens. Below 1280px columns retain a 260px minimum with horizontal scroll-snap, visible scrollbar and edge shade. The shared sidebar remains unchanged.

The drawer is 440px on desktop and full width below 640px. Very long titles use a three-line visual header preview with complete text retained in the accessible heading/title attribute; only the body scrolls.

Not verified: MySQL execution, physical touch devices, non-Edge browser engines and screen-reader output. Automated touch/keyboard checks do not replace real-device assistive-technology testing.

Suggested commit: feat: build shared task board, list filters and accessible detail drawer
