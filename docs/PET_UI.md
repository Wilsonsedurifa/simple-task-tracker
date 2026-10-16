# Pet game UI

## Features

- Dashboard adoption dialog with six original SVG radio-card previews, server validation, a 20-character name field, Later/Esc/backdrop dismissal, and focus restoration. Later is remembered per user so dashboard visits do not repeatedly interrupt task work; the pet card always offers adoption again.
- Compact fixed-height dashboard companion beside Your progress; the seven-day chart remains available below. Hiding the pet restores the existing two-card summary arrangement.
- Authenticated `/pet` page with the shared shell, room, stats, unlock preview, seven-stage roadmap, six derived badges, rename/species controls, and rate-limited click-to-pet. Petting never calls a reward endpoint or grants XP.
- One original parametric SVG rig per species in a shared factory. Species colors are CSS tokens; growth uses `--pet-scale` from 0.6 to 1.3. Face/posture classes distinguish happy, idle, sleepy, worried, sad, and proud. Bell/scarf/crown appear at levels 3/5/7. No raster assets, copyrighted characters, or dependencies were introduced.
- Pure `appPetMood(tasks, pet, now?)` uses local calendar dates without sorting or mutating tasks. Precedence is proud, happy, worried/sad, sleepy, idle. A successful XP award temporarily presents a three-second happy burst separately from the derived mood. Text always states the mood and reason; messages remain encouraging.
- Shared task state now publishes completion reward metadata, covering `move()` and direct completion `mutate()` calls. Pet refresh/effects are independent subscribers; their network requests never delay task completion or rollback its success. Reopened/already-awarded tasks emit no XP chip when their reward is zero.
- XP text/progress, floating chips, transform/opacity confetti, level-up banner, and polite announcements. Per-user last-seen level prevents navigation/reload replay. The in-memory high-water mark also guards overlapping responses when storage is unavailable.
- Show pet and Reduce pet animations in Settings, using the existing per-user preference store. Show pet hides dashboard/page widgets, pet navigation, and pet reward chips without disabling backend XP. The directly opened Pet page explains how to re-enable it.
- Native keyboard controls, visible focus rings, decorative aria-hidden SVG, labelled pet buttons, capped particles, reduced-motion support, and hidden-tab animation pause. Failed pet loading offers retry without blocking tasks; 401 uses the shared session-expired handling.

## Implementation notes

- Pages without a pet widget use the existing toast system for XP/level notices; a floating chip cannot be placed beside a widget that is not on that page.
- The adoption invitation is remembered after Later rather than shown on every dashboard visit. Manual adoption remains available.
- Badges are derived only from current task data and pet records: First task / 5 tasks use current completed count, streak badges use longest streak, Level 3 uses current level, and Cleared all overdue requires at least one completed task and zero overdue tasks. Deleting completed tasks may therefore change completion-count badges; no badge-history backend was added.
- Existing backend validation, reward rules, task sorting, API shapes, and authentication flow remain unchanged. The only server addition is the authenticated `/pet` view route.

## Files changed

- `routes/web.php`: authenticated Pet page route.
- `resources/views/layouts/app.blade.php`: shared adoption dialog/announcement inclusion.
- `resources/views/tasks/partials/sidebar.blade.php`: Pet item between Calendar and Notifications.
- `resources/views/tasks/partials/mobile-navigation.blade.php`: Pet in More and correct active state.
- `resources/views/tasks/dashboard.blade.php`: shared compact pet card.
- `resources/views/tasks/pet.blade.php`: full pet page.
- `resources/views/tasks/partials/pet-widget.blade.php`: reusable fixed-height widget and failure/empty/loading states.
- `resources/views/tasks/partials/pet-adoption.blade.php`: accessible adoption picker and polite announcement region.
- `resources/views/tasks/settings.blade.php`: pet visibility and motion controls.
- `resources/css/tasks.css`: token palettes, original art styling, growth/moods/accessories, room/cards, responsive layout, motion safeguards.
- `resources/js/tasks.js`: independently guarded pet initialization.
- `resources/js/modules/app-state.js`: isolated shared reward subscription for all completion entry points.
- `resources/js/modules/app-preferences.js`: per-user pet preference defaults/validation.
- `resources/js/modules/app-pet.js`: adoption/load/render/forms, rewards, persistence, click-to-pet, failure handling.
- `resources/js/modules/app-pet-art.js`: original SVG rigs.
- `resources/js/modules/app-pet-data.js`: pure documented mood and badge calculations.
- `tests/Feature/PetPageTest.php`: guest protection and shared Pet page structure.
- `tests/browser/workspace.mjs`: pet checks and Later dismissal for unrelated task regressions.
- `tests/browser/calendar-checks.mjs`: wait for responsive media updates before asserting agenda visibility.
- `tests/browser/pet-checks.mjs`: dedicated pet browser scenarios using a separate test account.
- `tests/browser/pet-data.mjs`: pure local-date/mood/badge/order tests.
- `docs/PET_UI.md`: this record.

No new standalone image/SVG files; artwork is original inline SVG created with `createElementNS`. Build outputs and review screenshots are in their existing ignored directories.

## Verification

- `php artisan test`: **82 passed, 719 assertions**; existing tests unchanged except responsive timing in the browser harness.
- `npm run build`: passed, 31 modules transformed.
- `node tests/browser/pet-data.mjs`: passed mood precedence, local-day comparisons, immutable order, safe text names, and six badge conditions.
- `node tests/browser/workspace.mjs`: full headless Edge regression against isolated SQLite, including all existing pages and the new Pet page.
- Pet adoption/Later/focus/validation, all six species, actual backend XP reward from the board, drawer level-up banner, no reload replay, no second reward after reopen, and no XP from petting checked.
- Bell/scarf/crown unlock visibility checked from the roadmap.
- Pet page checked at 380, 768, 1024, 1280, 1920 under Light, Dark, System, Kawaii, Racing; no horizontal overflow.
- Keyboard focus and reduced-motion transition disabling checked.
- Show pet persistence/navigation/card hiding and Reduce pet animations checked.
- Pet API 500 does not block task rendering; retry recovers. Pet API 401 redirects through the existing login/session-expired flow.
- Existing task creation, filters, board/list, drawer, rollback, dashboard, calendar, notifications, settings, logout, theme persistence, public/auth pages, and clean-load console diagnostics regress successfully.
- `git diff --check` passed; `/pet` route listing confirms `web` and `auth`.

Review screenshot: `storage/app/ui-review/pet-page.png`.

## Manual follow-up checklist

- Open dashboard with an unadopted account; dismiss with Later/Esc/backdrop, reopen, adopt using only the keyboard.
- Switch every species, rename with punctuation/non-ASCII text, and confirm XP is kept.
- Inspect all seven growth stages and accessory unlocks; verify sad/worried/sleepy/happy/proud faces match the text.
- Complete or reschedule overdue work and watch the mood recover immediately. Complete from dashboard, board, list, drawer, and calendar; check reward handling remains shared.
- Toggle all themes and check mood/XP/speech contrast, focus rings, and mobile navigation at the five required widths.
- Turn on device reduced motion and the separate pet override; switch away from the tab during animation.
- Hide the pet, navigate/reload, re-enable in Settings, and confirm no XP was lost.
- Simulate pet API failure while using tasks; retry and check session expiry separately.

Unverified: physical touch devices, screen-reader output, non-Edge browser engines, real concurrent browser stress/load, and live MySQL execution. Automated reduced-motion and responsive checks do not replace testing on those devices.

Suggested commit: `feat: add original pet companions with adoption, growth and shared task rewards`
