# Pet game backend

## API

All routes use the existing `web` + `auth` group, session authentication, and CSRF protection. JSON guests receive 401. Validation failures use 400 `{message, errors}`.

- `GET /api/pet`: `{ "pet": null }` before adoption; otherwise `{ "pet": { ...stored fields, level, stage, xp_into_level, xp_for_next, progress_pct, completed_count } }`. `streak_days` is derived as zero after a missed day without changing stored history.
- `POST /api/pet`: `{species, name}`, returns the same pet envelope with 201. Duplicate adoption returns 400. There is one unique pet per user, deleted when the user is deleted.
- `PATCH /api/pet`: optional `species` and/or `name`, returns the pet envelope with 200. Requires adoption first; otherwise 400. Reward fields and user IDs cannot be set through this endpoint.
- `PATCH /api/tasks/{id}/complete`: all existing task fields remain at the top level. When adopted, adds `pet: {xp_gained, level, leveled_up, new_stage, streak_days}`. Without a pet, this optional object is omitted. `new_stage` contains the current resulting stage even when no level-up occurred.

`xp_for_next` is the width of the current level (next cumulative threshold minus this level's threshold), not the remaining XP. `xp_into_level` is XP above the current threshold. At Legend, `xp_for_next` is null and progress is 100%; XP can continue increasing. `completed_count` counts the owner's currently completed tasks, including tasks completed before adoption; it is not a historical reward counter.

## Reward and concurrency rules

`PetService` owns a transaction containing both completion and reward persistence. Locks are acquired in user -> task -> pet order. The user lock serializes adoption and different task completions for one account; the task lock and persistent `xp_awarded_at` marker prevent duplicate awards. Transactions retry concurrency failures up to three times.

Priority amounts, bonus, cap, species, thresholds, and stage names come from `config/pets.php`. Dates are compared as calendar dates in the configured app timezone, currently Asia/Manila. Daily usage resets on the next eligible completion after the local date changes. Completing today or before the due date earns the on-time bonus; absent or overdue deadlines do not.

A first eligible completion at the daily cap earns zero but consumes its marker and counts toward the streak. Re-completing an already rewarded task cannot update XP, daily usage, or streak history. Reopen and delete operations remain unchanged: reopening retains the marker and deleting never subtracts XP.

Without a pet, completion leaves the marker null. Adoption never scans or backfills old completions and starts with zero XP. Replaying `/complete` on an already-completed pre-adoption task earns nothing. A pending task whose marker is still null is eligible when completed with an adopted pet, including an explicitly reopened task that has never received a reward.

Pure `progress()` and `streak()` calculations accept explicit configuration/dates and are covered independently from HTTP/database tests.

## Files changed in this phase

- `config/pets.php`: configurable species, seven levels, priority XP, bonus, cap.
- `database/migrations/2026_10_15_140000_create_pets_and_add_task_xp_awarded_at.php`: unique owner pet table/cascade and nullable task reward marker; reversible without resetting tasks.
- `app/Models/Pet.php`: pet casts, safe fillable fields, owner relationship.
- `app/Models/User.php`: one-to-one pet relationship.
- `app/Models/Task.php`: reward marker datetime cast; marker deliberately not mass assignable.
- `app/Services/PetService.php`: pure level/streak helpers, derived pet response, transactional completion and rewards.
- `app/Http/Controllers/PetController.php`: scoped adoption/read/rename/species switch with existing error format.
- `app/Http/Controllers/TaskController.php`: delegate the existing completion action to the transactional service; authorization and other actions retained.
- `routes/web.php`: add the three authenticated pet routes.
- `tests/Feature/PetTest.php`: adoption/validation, ownership, XP, cap/day rollover, streak, rollback, marker protection, cascade, and completion response compatibility.
- `tests/Unit/PetServiceTest.php`: configured boundaries/progress and calendar streak calculations.
- `docs/PET_BACKEND.md`: this implementation and verification record.

No frontend, dependencies, existing task validation rules, or sorting rules changed. The existing migration history was preserved; the additive migration was applied with `php artisan migrate --no-interaction` (no fresh/reset).

## Verification

- `php artisan test`: **81 passed, 708 assertions**. Every pre-existing test remains unchanged.
- `npm run build`: passed, 28 modules transformed.
- `php vendor/bin/pint --test` on the seven new PHP implementation/test/config/migration files: passed.
- `git diff --check`: passed.
- Route listing confirms `web` and `auth` for GET/POST/PATCH `/api/pet`.
- Full `node tests/browser/workspace.mjs` regression: passed against its isolated SQLite database, including Dashboard, Tasks, Calendar, Notifications, Settings, auth/public pages, five themes, widths 380/768/1024/1280/1920, keyboard, reduced motion, logout, session expiry, and zero baseline JS errors/console warnings.
- Tests prove both task status and XP roll back when reward persistence fails; a forged task update cannot clear the award marker; reward configuration changes affect actual completion amounts.

Unverified: live MySQL execution and real parallel MySQL requests (locking is implemented, but the automated database suite uses SQLite); other browser engines, physical touch devices, and screen-reader output. No pet UI was added because this request is server-side only.

Suggested commit: `feat: add pet adoption and transactional task XP rewards`
