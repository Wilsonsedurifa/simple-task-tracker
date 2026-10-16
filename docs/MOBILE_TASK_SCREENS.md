# M3: mobile Tasks, Add/Edit and Details

Phone-only layouts use the original task state, forms, rows, drawer, request client, toasts and appearance settings. Tablet/desktop views retain their layout and view preference. Phones always show List; no extra task request is made for filters or resizing.

## Files changed in this task

- `resources/views/tasks/index.blade.php`: phone In Progress chip and Due date filter options.
- `resources/views/tasks/partials/workspace-dialogs.blade.php`: create due-date Clear and description-counter accessibility association.
- `resources/css/tasks.css`: M3 phone-only list, filter, form, footer, details and action-sheet styles; desktop helpers hidden.
- `resources/js/tasks.js`: independently guarded mobile task-screen initialization.
- `resources/js/modules/app-tasks.js`: mobile stage buckets, This week visibility, URL sort, responsive List projection and picker synchronization.
- `resources/js/modules/app-mobile.js`: shared Due date picker and reusable task action-sheet entry point.
- `resources/js/modules/app-mobile-components.js`: Due date picker title.
- `resources/js/modules/app-mobile-task-actions.js`: Edit, move, complete/reopen and in-sheet delete confirmation, using shared mutations.
- `resources/js/modules/app-mobile-task-screens.js`: reparent real form/footer/title/status nodes on phones and restore their desktop positions; priority adapter and detail menu.
- `resources/js/modules/app-dialog.js`: phone wording/properties, create auto-grow, edit date minimum and responsive presentation refresh. Existing changed-only edit and discard/history safeguards are retained.
- `resources/js/modules/app-notifications.js`: regression fix: preserve dropdown focus before disabling Retry.
- `tests/Feature/MobileTasksTest.php`: shared forms and unique IDs.
- `tests/browser/mobile-task-checks.mjs`: focused phone workflows, filters, API payloads, sheets, keyboard-height simulation and themes.
- `tests/browser/workspace.mjs`: include M3 checks; update phone expectations and keep touch Board coverage on tablet. `--mobile-tasks-only` runs focused checks.
- `docs/MOBILE_TASK_SCREENS.md`: this handoff.

No routes, backend/API shapes, validation, sort rules, dependencies or image assets changed. Icons reuse the original inline SVG system.

## Filter semantics

On phones, Pending means pending/todo; In Progress combines pending/in_progress and pending/review. Desktop Pending keeps its existing all-open meaning. An explicit `stage` URL filter remains supported. This week uses the existing group definition: the seven dates after Tomorrow (days 2–8). `sort=priority|deadline` controls the existing server request and is persisted using existing preferences. Filters only filter the returned array; group headings are inserted while walking it.

## Manual regression checklist

- At 380px, inspect Tasks title/search, four status counts, three picker buttons and Clear all. Check all status/priority/due combinations and share/reload URLs.
- In deadline sort, confirm group headings and row order match the server array, including completed tasks and no deadline.
- Open row actions: move to each stage, complete, reopen, cancel/confirm Delete; simulate failures and verify rollback/error toasts.
- Add from bottom navigation: required-title error, description auto-grow/1000-character maximum, priority/status, clear date, Enter and Ctrl/Cmd+Enter.
- Details: deep link, Back/Escape, long title/description, local timestamps, completed-only property, action menu and in-sheet deletion.
- Edit an overdue task's title only: confirm PATCH does not include due_date; unchanged Save is disabled. Check 400/404/401 and close/Back/discard/keep-editing focus behavior.
- At simulated keyboard height, Create and Save remain visible. Verify on a physical iOS/Android keyboard too (not covered by desktop emulation).
- Resize 380 → 768 → 1024 → 1280 → 1920: original desktop/tablet views and controls return with no task refetch. Verify touch Move menu on tablet.
- Test Light, Dark, System, Kawaii and Racing, visible focus, reduced motion, loading/error/retry, empty and no-results states.
- Recheck Home, Calendar, Notifications, Settings, Pet, auth, logout and offline behavior.

Suggested commit: `feat: add mobile task list and full-screen task sheets`

## Kawaii Add form regression

Corrected the legacy DOM order on phones (Title, Description, Priority, Status, Due date), restoring desktop anchors on resize. This prevents Stage in column two from forcing Priority onto the next grid row, and makes keyboard order match the visual layout. The form has a shrinkable scroll area above the fixed footer; Clear lives in the date label row instead of overlapping the input. Browser assertions cover 380px and 500px alignment, full date-input reachability, Clear spacing, and Candy pink button/focus colors. Other valid Kawaii accents, including Baby blue, remain selectable.
