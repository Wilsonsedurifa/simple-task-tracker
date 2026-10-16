# Structure refactor report

Branch: `refactor/structure`. Initial implementation checkpoint: `7913d29`. Changes are isolated in passing phase commits; the existing dirty implementation was preserved in its own checkpoint before refactoring.

## Verification

- Baseline: 90 PHP tests / 833 assertions. Final: 94 / 848; four contract characterization tests passed against the original controllers before extraction.
- `npm run build`: PASS. No package/Composer dependencies or lockfiles changed.
- Whole-app browser regression: **PASS, exit code 0**, including every page, all five themes, mobile screens, intended URL/Continue, logout, optimistic rollback, keyboard DnD alternative, deep links and 401/419. Zero baseline page errors or console warnings.
- Deterministic visuals: **72/72 byte-identical PNGs, zero geometry differences** after core, CSS, features, Blade, PHP and final cleanup. Screens: 390/768/1280 × Light/Kawaii, all authenticated pages/Profile/Continue and public landing/login/register/404. Captures and JSON are local in ignored `storage/app/refactor-visual`.
- Interaction regression also covers 380/768/1024/1280/1920, all five app themes, keyboard menus/dialogs/filters, reduced motion, blocked storage, offline mode, intentional API failures, 401/419 flows and rollback.
- Route comparison: methods, URIs, names, actions and middleware identical (only route source-file locations differ).
- Source graph: 57 JS files checked, zero circular imports. No client task sorting, unsafe user HTML rendering or date-only UTC conversion introduced.
- Existing `TaskSorter`, migrations, database columns, validation text, ownership rules, Google intents, Continue flow and API status/response shapes preserved.

## Feature inventory results

| Feature family | Result | Evidence |
|---|---|---|
| Public landing, themes, menu, FAQ, pet demo, no-JS links | PASS | Browser landing checks |
| Session auth, Google intents, Continue/intended URL, CSRF logout | PASS | PHP feature tests + browser global flow |
| One owner-scoped task store, offline/CSRF/401/419/retry | PASS | API tests + single-fetch/failure browser checks |
| Tasks counts, URL filters, server sorting, Board/List, DnD/Move | PASS | Task API/stage tests + desktop/touch checks |
| Create/Edit/Details/Delete, changed-only overdue edits, Back/focus | PASS | Contract/API tests + drawer/mobile checks |
| Dashboard stats/progress/chart/table/side tabs/Quick add | PASS | Browser + pure dashboard data tests |
| Calendar local dates/month/week/keyboard/swipe/Unscheduled | PASS | Browser + pure calendar/date tests |
| Derived notifications, badges/read state/Welcome/cross-tab | PASS | Browser + pure notification tests |
| Settings theme/preferences/account/password/export/bulk delete | PASS | PHP + browser + CSV/blocked storage checks |
| Pet adoption/moods/XP/cap/streak/roadmap/rewards/settings | PASS | Pet PHP tests + browser + pure mood/badge tests |
| Responsive mobile Home/Tasks/sheets/Calendar/Profile/Notifications | PASS | Mobile M1–M5 browser checks |
| Five app themes/accents, focus/reduced motion, error states | PASS | Whole-app browser matrix + 72 visual comparisons |

## Largest 25 original files: before → current owner

Counts include blank lines; these are physical line counts, not compressed one-line statement counts. Extracted responsibilities live in the new feature/partial/service files; a smaller owner count is not the sum of its extracted code.

| Original file | Before | After | Current owner |
|---|---:|---:|---|
| resources/css/tasks.css | 3133 | 55 | unchanged path |
| tests/browser/workspace.mjs | 427 | 428 | unchanged path |
| resources/js/modules/app-calendar.js | 312 | 191 | resources/js/pages/calendar.js |
| resources/js/modules/app-tasks.js | 282 | 203 | resources/js/pages/tasks.js |
| tests/Feature/PetTest.php | 279 | 279 | tests/Feature/Api/PetTest.php |
| resources/js/modules/app-dashboard.js | 249 | 176 | resources/js/pages/dashboard.js |
| app/Http/Controllers/GoogleAuthController.php | 239 | 102 | unchanged path |
| config/session.php | 233 | 233 | unchanged path |
| tests/Feature/TaskApiTest.php | 224 | 224 | tests/Feature/Api/TaskApiTest.php |
| tests/browser/notification-checks.mjs | 214 | 214 | unchanged path |
| resources/js/modules/app-dialog.js | 210 | 188 | resources/js/features/task-dialog/dialog.js |
| resources/js/modules/app-pet.js | 198 | 201 | resources/js/features/pet/widget.js |
| resources/js/modules/app-notifications.js | 197 | 194 | resources/js/features/notifications/page.js |
| tests/browser/settings-checks.mjs | 190 | 201 | unchanged path |
| config/database.php | 184 | 184 | unchanged path |
| tests/browser/calendar-checks.mjs | 175 | 175 | unchanged path |
| app/Http/Controllers/TaskController.php | 174 | 77 | unchanged path |
| resources/css/landing.css | 171 | 171 | unchanged path |
| resources/views/tasks/partials/workspace-dialogs.blade.php | 163 | 3 | unchanged path |
| resources/js/modules/app-settings.js | 151 | 10 | resources/js/pages/settings.js |
| config/logging.php | 140 | 140 | unchanged path |
| tests/Feature/GoogleAuthIntentTest.php | 137 | 137 | tests/Feature/Pages/GoogleAuthIntentTest.php |
| config/cache.php | 136 | 136 | unchanged path |
| config/queue.php | 129 | 129 | unchanged path |
| tests/browser/pet-checks.mjs | 128 | 130 | unchanged path |

The complete after inventory (including the **current** largest 25, every source size and import edge) is `REFACTOR_AFTER.json`; original data is `REFACTOR_BASELINE.json`.

## Production bundles

Uncompressed bytes from Vite's manifest/output:

| Entry/chunk | Final bytes |
|---|---:|
| _storage-BZrz1osv.js | 6,130 |
| resources/css/landing.css | 15,237 |
| resources/css/tasks.css | 141,619 |
| resources/js/app.js | 0 |
| resources/js/auth.js | 1,373 |
| resources/js/features/mobile/home.js | 3,218 |
| resources/js/landing.js | 4,623 |
| resources/js/pages/calendar.js | 16,503 |
| resources/js/pages/dashboard.js | 11,397 |
| resources/js/pages/settings.js | 6,692 |
| resources/js/pages/tasks.js | 12,679 |
| resources/js/tasks.js | 69,512 |

- Original app JS: **123,561** bytes. Final entry: **69,512**; its static shared chunk: **6,130**; initial shared JS total: **75,642** (38.8% lower). A page additionally requests only its active controller chunk. Dashboard also requests its 3,218-byte mobile adapter (the adapter contains its own viewport guards).
- All app chunks together: **126,131** bytes, versus 123,561 before; code splitting adds a small total overhead but reduces per-page transfer. Do not confuse entry-only size with the initial shared total.
- App CSS is **141,619** bytes, identical hashed output `tasks-sWIqW6SK.css` before/after. This verifies the CSS split did not reorder/minify into different rules.
- Landing remains 4,623 JS / 15,237 CSS bytes; separate entries and behavior unchanged.

## Consolidation and removals

- Consolidated safe DOM creation, ID lookup, text setters, SVG creation/icons, local date helpers, guarded storage primitives, fetch/CSRF/errors, singleton task state and toast.
- Extracted calendar month/week/day renderers, task filters/list/board/DnD/Move menu, dashboard chart/side rows/Quick add, settings section/preferences/account/errors/data behavior; dynamically load Tasks/Dashboard/Calendar/Settings.
- Blade now composes shared create/delete/detail/logout dialogs, page title/toast partials, Dashboard cards/side panel and Settings sections. Every existing hook and accessible attribute was retained.
- Extracted exact task/settings/pet validation into Form Requests, task serialization into an unwrapped Resource, sort/mutations into TaskService and Google account/auth processing into two services. Tests are grouped under Api/Pages.
- Removed **`resources/views/welcome.blade.php`** (no route/view references; public routes already render `landing`).
- Removed **`resources/views/tasks/partials/task-dialog.blade.php`** (unreferenced legacy panel; active shared drawer is now `resources/views/partials/task-dialog.blade.php`).
- Removed unused **`appMobileChipRow`**, 45 unused import declarations/specifier groups after extraction, and unused stage/status constant exports introduced during this refactor. Centralized the used API/storage/breakpoint constants.
- Removed API's temporary toast re-export after redirecting callers to `core/toast.js`.
- Deletions are recoverable from Git. No application/user data was deleted; browser harnesses used separate SQLite files.

## Deliberate adaptations / remaining target exceptions

- CSS uses 54 numbered **consecutive cascade segments**, not one arbitrarily reordered file per topic. Late token/theme/mobile rules remain late. Initial theme files contain tokens; the original cascade wins over directory aesthetics.
- No speculative CSS pruning: the audit found no adjacent identical declarations. Old selectors are shared with current class hooks and dynamic states; screenshot absence is not proof of dead CSS. Uncertain legacy rules remain.
- Existing Vite legacy app/auth entries are preserved, rather than silently removing possible external/dev consumers; workspace/auth Blade layouts still use only tasks.css/tasks.js. Landing stays independent.
- Notifications and pet modules remain shared initializers because their bell/badges/rewards/adoption/settings subscriptions run on every workspace page. They were not replaced with empty page wrappers or loaded twice merely to match a suggested filename.
- Current JS files top out at **203 / 201** lines (Tasks controller / pet widget); CSS app partials at 200 lines, Blade views at 90, controllers at 102. These fit the approximate file-size targets.
- The approximate **40-line function target is not fully met**: several existing closure-based page/mobile/notification initializers remain 47–186 lines, plus dashboard render (65), notification render (42), pet render (57), Quick add (44) and data settings (45). They retain cohesive state/event ordering rather than hiding it in pass-through files. This is an explicit remaining structure limitation, not claimed as completed.
- Kept existing IDs/data-attribute strings and vocabulary literals as component contracts instead of mechanically converting every string to an export. API paths, reused storage prefixes and the mobile breakpoint are centralized.
- Reused existing Blade components; did not invent generic wrapper components that would alter the rendered tree or duplicate feature code.
- Browser tests now await async page readiness/network responses before asserting state; the screenshot harness waits for page chunks/network idle. Assertions and expected app behavior are unchanged.

## Bugs/risks not silently fixed; unverified integrations

- No reproducible functional regression remains in the exercised flows. Async page readiness and native-dialog Back races in older browser assertions required explicit waits. The isolated Settings run and final complete run passed; a general network-idle experiment was reverted because loading tests intentionally hold an API response. This is not exhaustive concurrency proof.
- Real external Google OAuth redirects/token exchange are **not** verified against Google credentials/network; the existing mocked intent/security tests pass.
- SQLite is exercised; a live MySQL server was not tested. No SQL sorting expressions were changed.
- Chromium/Edge desktop emulation was used. Physical iOS/Android keyboards, Safari/Firefox and every OS font-rendering combination are not verified.
- Pixel parity proves the requested 390/768/1280 Light/Kawaii matrix, not every possible theme/viewport; other themes/sizes use the interaction/overflow/reduced-motion checks.
- CSS pruning and further closure decomposition are follow-ups, not opportunities to add features or alter validation in this branch.

Exact changed/renamed/deleted paths and reasons: [REFACTOR_CHANGED_FILES.md](REFACTOR_CHANGED_FILES.md).

## Final source tree

This lists application/test source files (generated assets, vendor, node_modules, secrets and local databases omitted).

```text
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/
│   │   │   │   ├── EmailVerificationController.php
│   │   │   │   ├── LoginController.php
│   │   │   │   └── RegisterController.php
│   │   │   ├── AuthController.php
│   │   │   ├── Controller.php
│   │   │   ├── GoogleAuthController.php
│   │   │   ├── PetController.php
│   │   │   ├── SettingsController.php
│   │   │   └── TaskController.php
│   │   ├── Requests/
│   │   │   ├── IndexTaskRequest.php
│   │   │   ├── JsonFormRequest.php
│   │   │   ├── LoginRequest.php
│   │   │   ├── RegisterRequest.php
│   │   │   ├── ReopenTaskRequest.php
│   │   │   ├── SavePetRequest.php
│   │   │   ├── StoreTaskRequest.php
│   │   │   ├── UpdatePasswordRequest.php
│   │   │   ├── UpdateProfileRequest.php
│   │   │   └── UpdateTaskRequest.php
│   │   └── Resources/
│   │       └── TaskResource.php
│   ├── Models/
│   │   ├── Pet.php
│   │   ├── Task.php
│   │   └── User.php
│   ├── Notifications/
│   │   └── QueuedVerifyEmail.php
│   ├── Providers/
│   │   └── AppServiceProvider.php
│   └── Services/
│       ├── GoogleAccountService.php
│       ├── GoogleLoginService.php
│       ├── PetService.php
│       └── TaskService.php
├── resources/
│   ├── css/
│   │   ├── app.css
│   │   ├── auth.css
│   │   ├── base/
│   │   │   ├── 007-reset.css
│   │   │   ├── 028-tokens.css
│   │   │   ├── 032-tokens.css
│   │   │   ├── 037-tokens.css
│   │   │   ├── 040-tokens.css
│   │   │   ├── 045-tokens.css
│   │   │   ├── 047-tokens.css
│   │   │   ├── 048-public-auth.css
│   │   │   └── 050-tokens.css
│   │   ├── base.css
│   │   ├── components/
│   │   │   ├── 012-stat-cards.css
│   │   │   ├── 015-badges.css
│   │   │   ├── 016-empty-and-skeleton.css
│   │   │   ├── 017-view-switcher.css
│   │   │   ├── 022-buttons.css
│   │   │   ├── 023-forms.css
│   │   │   ├── 024-alerts.css
│   │   │   ├── 025-dialog.css
│   │   │   └── 026-toast.css
│   │   ├── features/
│   │   │   ├── 005-legacy-dashboard.css
│   │   │   ├── 006-legacy-dashboard.css
│   │   │   ├── 013-legacy-task-list.css
│   │   │   ├── 014-legacy-task-list.css
│   │   │   ├── 018-legacy-board.css
│   │   │   ├── 019-legacy-board.css
│   │   │   ├── 020-legacy-inspector.css
│   │   │   ├── 021-legacy-inspector.css
│   │   │   ├── 034-task-list.css
│   │   │   ├── 035-drawer.css
│   │   │   ├── 036-dashboard.css
│   │   │   ├── 038-calendar.css
│   │   │   ├── 039-notifications.css
│   │   │   ├── 041-pet.css
│   │   │   ├── 044-pet.css
│   │   │   └── 046-settings.css
│   │   ├── landing.css
│   │   ├── layout/
│   │   │   ├── 008-shell.css
│   │   │   ├── 009-sidebar.css
│   │   │   ├── 010-sidebar.css
│   │   │   ├── 011-topbar.css
│   │   │   ├── 027-legacy-responsive.css
│   │   │   ├── 030-shell-modern.css
│   │   │   ├── 031-shell-modern.css
│   │   │   └── 033-shell-modern.css
│   │   ├── mobile/
│   │   │   ├── 049-foundation.css
│   │   │   ├── 051-account.css
│   │   │   ├── 052-calendar.css
│   │   │   ├── 053-tasks.css
│   │   │   └── 054-home.css
│   │   ├── tasks.css
│   │   └── themes/
│   │       ├── 001-light.css
│   │       ├── 002-dark.css
│   │       ├── 003-kawaii.css
│   │       ├── 004-racing.css
│   │       ├── 029-accent-and-species-tokens.css
│   │       ├── 042-kawaii.css
│   │       └── 043-accent-and-species-tokens.css
│   ├── js/
│   │   ├── app.js
│   │   ├── auth.js
│   │   ├── core/
│   │   │   ├── api.js
│   │   │   ├── constants.js
│   │   │   ├── dates.js
│   │   │   ├── dom.js
│   │   │   ├── state.js
│   │   │   ├── storage.js
│   │   │   └── toast.js
│   │   ├── features/
│   │   │   ├── board/
│   │   │   │   ├── board.js
│   │   │   │   ├── dnd.js
│   │   │   │   └── move-menu.js
│   │   │   ├── calendar/
│   │   │   │   ├── data.js
│   │   │   │   ├── day-list.js
│   │   │   │   ├── labels.js
│   │   │   │   ├── month.js
│   │   │   │   └── week-strip.js
│   │   │   ├── dashboard/
│   │   │   │   ├── chart.js
│   │   │   │   ├── data.js
│   │   │   │   ├── quick-add.js
│   │   │   │   └── side-row.js
│   │   │   ├── mobile/
│   │   │   │   ├── account.js
│   │   │   │   ├── components.js
│   │   │   │   ├── home.js
│   │   │   │   ├── task-actions.js
│   │   │   │   └── task-screens.js
│   │   │   ├── notifications/
│   │   │   │   ├── derive.js
│   │   │   │   ├── page.js
│   │   │   │   ├── read-state.js
│   │   │   │   └── welcome.js
│   │   │   ├── pet/
│   │   │   │   ├── art.js
│   │   │   │   ├── data.js
│   │   │   │   └── widget.js
│   │   │   ├── settings/
│   │   │   │   ├── account.js
│   │   │   │   ├── data-export.js
│   │   │   │   ├── data.js
│   │   │   │   ├── errors.js
│   │   │   │   ├── preferences.js
│   │   │   │   └── sections.js
│   │   │   ├── task-dialog/
│   │   │   │   ├── dialog.js
│   │   │   │   └── view-panel.js
│   │   │   └── tasks/
│   │   │       ├── filters.js
│   │   │       ├── list.js
│   │   │       └── row.js
│   │   ├── landing.js
│   │   ├── pages/
│   │   │   ├── calendar.js
│   │   │   ├── dashboard.js
│   │   │   ├── settings.js
│   │   │   └── tasks.js
│   │   ├── shell/
│   │   │   ├── appearance.js
│   │   │   ├── mobile.js
│   │   │   ├── nav.js
│   │   │   ├── offline.js
│   │   │   ├── preferences.js
│   │   │   ├── public-auth.js
│   │   │   └── search.js
│   │   └── tasks.js
│   └── views/
│       ├── auth/
│       │   ├── continue.blade.php
│       │   ├── login.blade.php
│       │   ├── partials/
│       │   │   └── sorting-mockup.blade.php
│       │   ├── register.blade.php
│       │   ├── verify-email.blade.php
│       │   └── verify-invalid.blade.php
│       ├── components/
│       │   └── google-button.blade.php
│       ├── emails/
│       │   ├── verify-text.blade.php
│       │   └── verify.blade.php
│       ├── errors/
│       │   ├── 404.blade.php
│       │   └── 419.blade.php
│       ├── landing.blade.php
│       ├── layouts/
│       │   ├── app.blade.php
│       │   ├── auth.blade.php
│       │   ├── error.blade.php
│       │   └── partials/
│       │       ├── offline.blade.php
│       │       └── theme-boot.blade.php
│       ├── pages/
│       │   └── placeholder.blade.php
│       ├── partials/
│       │   ├── logout-modal.blade.php
│       │   ├── page-title.blade.php
│       │   ├── task-create.blade.php
│       │   ├── task-delete.blade.php
│       │   ├── task-dialog.blade.php
│       │   └── toast-container.blade.php
│       └── tasks/
│           ├── calendar.blade.php
│           ├── dashboard/
│           │   ├── quick-add.blade.php
│           │   ├── side-panel.blade.php
│           │   ├── stats.blade.php
│           │   └── summary.blade.php
│           ├── dashboard.blade.php
│           ├── index.blade.php
│           ├── notifications.blade.php
│           ├── partials/
│           │   ├── appearance.blade.php
│           │   ├── mobile-header.blade.php
│           │   ├── mobile-home.blade.php
│           │   ├── mobile-navigation.blade.php
│           │   ├── mobile-profile.blade.php
│           │   ├── notification-dropdown.blade.php
│           │   ├── pet-adoption.blade.php
│           │   ├── pet-widget.blade.php
│           │   ├── sidebar.blade.php
│           │   ├── topbar.blade.php
│           │   └── workspace-dialogs.blade.php
│           ├── pet.blade.php
│           ├── settings/
│           │   ├── account.blade.php
│           │   ├── appearance.blade.php
│           │   ├── data.blade.php
│           │   └── preferences.blade.php
│           └── settings.blade.php
├── routes/
│   ├── api.php
│   ├── auth.php
│   ├── console.php
│   ├── pets.php
│   ├── tasks.php
│   └── web.php
└── tests/
    ├── browser/
    │   ├── calendar-checks.mjs
    │   ├── calendar-data.mjs
    │   ├── dashboard-checks.mjs
    │   ├── dashboard-data.mjs
    │   ├── landing-checks.mjs
    │   ├── mobile-account-checks.mjs
    │   ├── mobile-calendar-checks.mjs
    │   ├── mobile-checks.mjs
    │   ├── mobile-desktop-baseline.mjs
    │   ├── mobile-home-checks.mjs
    │   ├── mobile-task-checks.mjs
    │   ├── notification-checks.mjs
    │   ├── notification-data.mjs
    │   ├── pet-checks.mjs
    │   ├── pet-data.mjs
    │   ├── refactor-inventory.mjs
    │   ├── refactor-visual.mjs
    │   ├── settings-checks.mjs
    │   ├── task-dates.mjs
    │   └── workspace.mjs
    ├── Feature/
    │   ├── Api/
    │   │   ├── PetTest.php
    │   │   ├── SettingsTest.php
    │   │   ├── TaskApiTest.php
    │   │   ├── TaskContractTest.php
    │   │   └── TaskStagesTest.php
    │   └── Pages/
    │       ├── AccessControlTest.php
    │       ├── ExampleTest.php
    │       ├── GoogleAuthIntentTest.php
    │       ├── LandingPageTest.php
    │       ├── MobileAccountTest.php
    │       ├── MobileCalendarTest.php
    │       ├── MobileFoundationTest.php
    │       ├── MobileHomeTest.php
    │       ├── MobileTasksTest.php
    │       ├── PageFlowTest.php
    │       ├── PetPageTest.php
    │       └── WorkspaceTest.php
    ├── TaskSorterTest.php
    ├── TestCase.php
    └── Unit/
        ├── ExampleTest.php
        └── PetServiceTest.php
```

Suggested commit summary: `refactor: organize tracker core features views and backend without behavior changes`.
