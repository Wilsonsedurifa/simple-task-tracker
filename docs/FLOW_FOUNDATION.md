# Flow foundation

Existing Dashboard and My tasks UI is retained. Calendar, Notifications, and Settings are placeholders for the next phase. No dependencies were added.

## Behavior

- Root redirects authenticated users to Dashboard and guests to Login.
- Login/register lead to Continue, which consumes the intended URL including its query string; Dashboard is the default.
- Fetch 401 displays Session expired and preserves the current path/query for login. A 419 opens a themed reload page.
- One shared task array loads GET /api/tasks?sort=deadline once per workspace page. An explicit sort change requests server order; mutations quietly refetch and publish.
- All workspace pages share New task, details/edit/delete, search, appearance, and logout. Details support ?task=ID, browser Back, and an unsaved-change guard.
- The nav badge counts pending tasks. Board columns use persisted stage instead of guessing from titles or priority.
- Valid pending stages: todo, in_progress, review. Completed tasks must be reopened before changing stage; reopen defaults to todo.

## Changed files in this phase

Backend:

- routes/web.php — redirects, placeholders, reopen endpoint, error/fallback routes.
- app/Http/Controllers/Auth/LoginController.php — safe return-path capture.
- app/Http/Controllers/TaskController.php — stage validation and owner-scoped reopen.
- app/Models/Task.php — stage default/fillable/cast.
- database/migrations/2026_10_15_130000_add_stage_to_tasks_table.php — additive stage migration.
- app/Providers/AppServiceProvider.php — tests use built assets independently of the dev server.

Frontend:

- resources/js/tasks.js — guarded initialization, shell, shortcuts.
- resources/js/modules/app-api.js — CSRF, errors, session expiry, toast.
- resources/js/modules/app-state.js — observable task array and quiet refetch.
- resources/js/modules/app-dates.js — local dates and date-input formatting.
- resources/js/modules/app-dialog.js — shared task actions, deep links, unsaved guard.
- resources/js/modules/app-tasks.js — existing board/list integration without client sorting.
- resources/js/modules/app-dashboard.js — dashboard state subscription.
- resources/css/tasks.css — placeholder/error/dialog integration and responsive fixes.
- resources/views/layouts/app.blade.php — global top bar and dialogs.
- resources/views/layouts/error.blade.php — themed standalone error shell.
- resources/views/tasks/partials/topbar.blade.php — global search/New task.
- resources/views/tasks/partials/workspace-dialogs.blade.php — reused create/edit/details/delete markup.
- resources/views/tasks/partials/sidebar.blade.php — real workspace route links.
- resources/views/tasks/index.blade.php — global dialog integration and stage filters.
- resources/views/tasks/dashboard.blade.php — shared top bar.
- resources/views/auth/continue.blade.php — workspace wording.
- resources/views/pages/placeholder.blade.php — placeholder pages.
- resources/views/errors/404.blade.php and resources/views/errors/419.blade.php.
- vite.config.js — disable optional font fallback optimization instead of installing Fontaine.

Tests:

- tests/Feature/TaskStagesTest.php — default stage, validation, change, completed guard, reopen, ownership, guests.
- tests/Feature/PageFlowTest.php — routes, intended login/register/Continue, safe return paths, error pages.
- tests/Feature/AccessControlTest.php and tests/Feature/ExampleTest.php — expectations for explicitly changed root/Continue behavior.
- tests/Feature/WorkspaceTest.php — global dialogs available on Dashboard.
- tests/browser/workspace.mjs — isolated SQLite browser regression.
- Existing TaskApiTest tests were not changed.

## Verification

- php artisan test: 51 passed, 294 assertions.
- npm run build: passed, without build warnings.
- Browser: intended login/Continue; five workspace pages, one initial fetch each; five themes at 380/768/1024/1280/1920; reduced motion; global create/search; keyboard-opened details; deep links and Back; unsaved guard; changed-only overdue edit; stage change; complete/reopen/delete; logout; simulated 401/419; Login/Register/public landing regression.
- Clean page loads had no JS page errors or console warnings. Expected simulated HTTP errors were checked separately.
- Migration applied with php artisan migrate; existing application records were preserved.
- Browser tests use storage/app/ui-review.sqlite, a separate test database.

## Scope and remaining checks

- Existing public landing page retained at /welcome; root follows the requested redirects.
- Task creation also accepts an optional valid stage for the global form.
- Calendar, Notifications, Settings are intentionally placeholders.
- SQLite was executed; MySQL and a real Google OAuth round-trip were not exercised.
- Keyboard automation covers shortcuts, task opening, Back, Escape, and dialogs. A complete screen-reader audit remains manual.

## Commands

Run php artisan migrate, npm run build, php artisan test, and php artisan serve.
The optional browser suite uses an existing Playwright runtime via PLAYWRIGHT_MODULE_PATH and adds no dependency.

Suggested commit: feat: add task stages and restore shared workspace flows
