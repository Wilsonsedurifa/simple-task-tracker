# Settings implementation

## Features

Authenticated `/settings` now has keyboard-operated Appearance, Preferences, Account, and Data tabs. The navigation stacks above the panel on mobile. Appearance reuses the existing theme/accent implementation rather than maintaining a second theme state. Both pickers remain synchronized, including their selected checkmarks. The existing pre-CSS anti-flash script is unchanged.

Preferences are stored under `app-settings:USER_ID`, validated against known choices, and have an in-memory fallback when storage is unavailable. Density uses `--app-density-space` and `--app-density-gap`; reduced motion respects both the device setting and the explicit Reduce override. Calendar reads the per-user week start. Tasks reads the default view/sort and hides the Completed board column when requested. Explicit `status=completed` links override that visibility preference so the filter never appears broken. List view and task totals still include completed tasks.

Profile and password forms show the existing `{message, errors}` validation format inline, focus the first invalid field, and display success toasts. Password updates verify the current password, require confirmation and at least eight characters, hash the update, rotate the remember token, and regenerate the session ID. Email is read-only and cannot be changed through the profile endpoint. Bcrypt-specific byte-length and NUL checks prevent hashing failures or silent truncation.

Exports fetch a fresh copy through the shared task state, preserve server order, and download JSON or UTF-8 CSV. CSV quotes every cell, doubles embedded quotes, preserves multiline content, and prefixes formula-like cells (including whitespace-prefixed formulas) with an apostrophe. Bulk deletion requires an inline confirmation, deletes only the authenticated user's completed tasks, returns `deleted_count`, and quietly refreshes all shared subscribers. Failures keep confirmation available for retry.

## Files changed in this phase

- `app/Http/Controllers/SettingsController.php`: authenticated profile/password updates.
- `app/Http/Controllers/TaskController.php`: owner-scoped bulk completed-task deletion.
- `routes/web.php`: real Settings view and the three new write endpoints.
- `routes/api.php`: remove redundant declarations; the session/CSRF-protected routes remain in web.php.
- `resources/views/tasks/settings.blade.php`: four complete settings sections and accessible forms/confirmation.
- `resources/css/tasks.css`: token-based Settings styling, shared picker styles, density, and reduced-motion overrides.
- `resources/js/tasks.js`: initialize global preferences independently of page-specific settings.
- `resources/js/modules/app-preferences.js`: per-user persistence, validation, fallback, global application, and cross-tab updates.
- `resources/js/modules/app-settings.js`: tabs, preference controls, account forms, downloads, and deletion workflow.
- `resources/js/modules/app-export.js`: reusable CSV escaping and formula protection.
- `resources/js/modules/app-appearance.js`: share theme/accent behavior between Settings and the existing Appearance dialog.
- `resources/js/modules/app-tasks.js`: user-specific view/sort defaults, completed-column preference, reduced-motion number animation.
- `resources/js/modules/app-calendar.js`: consume shared per-user preferences.
- `tests/Feature/SettingsTest.php`: authentication, validation, profile isolation, password hashing, and bulk-delete ownership tests.
- `tests/browser/settings-checks.mjs`: Settings end-to-end coverage and CSV safety assertions.
- `tests/browser/calendar-checks.mjs`: exercise the real Preferences tab and per-user storage; wait for responsive media updates.
- `tests/browser/workspace.mjs`: run Settings checks within the full regression suite.
- `docs/SETTINGS.md`: this implementation and verification record.

Production build assets and review screenshots were regenerated in their existing ignored output directories. No dependency, migration, task validation rule, task response shape, or task sorting rule was changed.

## Verification

`php artisan test`: **62 passed, 406 assertions**.

`npm run build`: **passed**, 28 modules transformed.

`node tests/browser/workspace.mjs`: **passed** using the already-installed external Playwright runtime and headless Edge. Uses an isolated SQLite database, not the live application database.

- All five workspace pages, public/auth pages, and existing shared shell flows regress successfully.
- Settings' four sections checked at 380, 768, 1024, 1280, and 1920 in all five themes.
- All Settings themes/accents, synchronized selected states, reload persistence, and existing anti-flash checks passed.
- Keyboard tab navigation, focus on account errors, delete cancellation/Esc, drawer/logout flows, and reduced motion passed.
- Real profile/password saves, wrong-current-password handling, JSON/CSV downloads, and bulk delete passed.
- Per-user isolation exercised using a separately registered account with the first account's browser storage copied in.
- Blocked localStorage gracefully applies temporary preferences and explains that saving failed.
- Bulk delete failure preserves data and allows retry. A successful delete updates the count and shared state.
- CSV formula prefixes, comma/quote/newline escaping, and Unicode output checked against the production helper.
- Zero baseline console errors/warnings and runtime exceptions; intentional HTTP-error simulations are excluded from clean-load diagnostics.
- Existing notification, calendar, task-date, and dashboard Node data tests passed.
- `git diff --check` passed. Route listing confirms `web` and `auth` on Settings and all task endpoints.
- Desktop/mobile Settings screenshots reviewed in `storage/app/ui-review/`.

## Implementation notes / deviations

- Removed duplicate API declarations because their dynamic task route interfered with `/api/tasks/completed`. The canonical existing URLs remain unchanged and use the authenticated web middleware group, including CSRF.
- Previous global preference keys are deliberately not imported into an account-specific namespace: their owner cannot be established safely. Defaults apply until that account saves preferences. Existing theme/accent keys are preserved.
- Added password safety validation for NUL characters and bcrypt's 72-byte limit. These return normal field errors rather than hashing exceptions or truncated passwords.
- Completed-filter links explicitly reveal the Completed column even when the default preference hides it; the helper text documents this behavior.

Unverified: MySQL execution, other browser engines, physical touch devices, screen-reader output, and actual browser storage quota exhaustion (blocked storage is tested). Exports use browser downloads; no server-side export files are retained.

Suggested commit: `feat: implement settings with per-user preferences, account updates and safe task exports`
