# Mobile Home (M2)

Phone-only dashboard projection (up to 767px); tablet/desktop dashboard markup and behavior are retained. The original pet and error widgets move to phone slots and return to comment anchors on resize. There is one task request and one authoritative task array. Existing dashboard event delegation handles task rows, optimistic completion, rollback, drawer and toasts.

## Changed files

- `resources/views/tasks/dashboard.blade.php`: include the phone-only Home partial.
- `resources/views/tasks/partials/mobile-home.blade.php`: stats, Quick Actions, pet/error slots, collapsible overdue group, Today list, skeleton and first-run/empty states.
- `resources/js/modules/app-mobile-home.js`: shared-state projection, server-order date filtering, stat links, responsive widget movement and focus recovery.
- `resources/js/modules/app-mobile-components.js`: allow the existing StatCard factory to create links.
- `resources/js/modules/app-mobile.js`: English phone greeting and one-shot `?filters=priority` picker shortcut.
- `resources/js/tasks.js`: isolated mobile Home initialization.
- `resources/css/tasks.css`: phone-only styling and hiding desktop dashboard widgets.
- `tests/Feature/MobileHomeTest.php`: rendered Home and unique IDs.
- `tests/browser/mobile-home-checks.mjs`: Home states, task order, single fetch, completion/rollback, sheets, responsive restoration and retry.
- `tests/browser/dashboard-checks.mjs`: replace obsolete phone side-panel expectation with the new Home layout.
- `tests/browser/workspace.mjs`: include Home browser coverage.

## Regression checklist

- At 380px, check greeting, profile link, shared search, 2×2 linked stats and four Quick Actions.
- Open/close Add, More and Filter with keyboard, Escape and browser Back; check nav hiding and focus.
- Check Today task order, collapsible Overdue, no-due-today copy and first-run CTA.
- Complete a task successfully and with a failed request; counts, badge and rows update/roll back.
- Check loading, error/Try again and pet failure do not block tasks.
- Resize to 768, 1024, 1280 and 1920; original dashboard/pet return, no additional task fetch.
- Check all five themes, visible focus, reduced motion, no horizontal page overflow.

No dependencies, routes, backend validation or API response changes. Filter uses the existing priority picker rather than introducing a second filter UI. Add uses the existing M1 create sheet, as requested until M3.

Suggested commit: `feat: add shared-state mobile dashboard home`
