# Pure structure refactor

## Baseline / safety gates

- Branch: `refactor/structure`; starting implementation checkpoint: `7913d29` (preserves the previously uncommitted feature work separately).
- Baseline `php artisan test`: **90 passed, 833 assertions**. `npm run build`: PASS.
- Initial app JS: **123,561 bytes**; app CSS: **141,619 bytes** (production, uncompressed). Landing JS 4,623 / CSS 15,237 bytes. Existing dependencies and Vite entries stay unchanged.
- `REFACTOR_BASELINE.json` records every source file, exact line/byte counts, the largest 25, import edges, and every manifest chunk. Counts include blank lines (unlike PowerShell Measure-Object -Line).
- 72 deterministic before screenshots plus computed layouts are stored in ignored `storage/app/refactor-visual`: 390/768/1280, Light/Kawaii; all workspace pages, Profile, Continue, landing, login/register, 404. The independent review SQLite database is not the user's DB.
- No application behavior changes in baseline/map. Existing API/ownership/auth/stage/XP/settings tests already characterize backend behavior; browser checks cover every current interaction family.
- After each phase: build, PHP tests, whole-app browser regressions, and deterministic visual comparison. Commit only a passing phase. Expected HTTP 400/401/404/419 failure scenarios are distinguished from clean-load JS errors.

## Feature inventory (regression checklist)

- [x] Guest marketing page, four independent themes, menu, FAQ, local pet demo, no-JS fallback.
- [x] Login/register validation, Google auth routes, intended URL, Continue, protected routes, POST/CSRF logout confirmation.
- [x] Single owner-scoped task state/fetch; CSRF, 401/419 flows, offline prevention/no queue, navigation badges.
- [x] Tasks server priority/deadline sorting; URL/search/status/stage/priority/date filters; counts and removable chips.
- [x] Board/list preferences; four board stages, native DnD, accessible Move menu, optimistic rollback.
- [x] Shared create/edit/details/delete dialogs; deep links/Back, focus, changed-only edits, old deadlines, description maximum and discard guard.
- [x] Dashboard greeting/date, summaries, progress, seven-day chart/table, Quick add, persisted side-panel tabs/week filtering.
- [x] Calendar month/week navigation, local-date bucketing, keyboard grid, day popover, past-date create guard, Unscheduled.
- [x] Derived notifications, per-user/cross-tab read state, dropdown/All/Unread/mark-all, midnight IDs, local Welcome.
- [x] Settings appearance/preferences/profile/password/export CSV/JSON/completed bulk delete, inline errors and confirmations.
- [x] Pet adoption/species/rename, original SVG levels/moods, reward-once/cap/streak, celebrations, badges and visibility preferences.
- [x] Five app themes, per-theme accents, no flash, density/motion, keyboard focus, reduced motion and responsive shell.
- [x] Mobile Home/Tasks/Add/Edit/Details/Calendar/Profile/Settings/Notifications; shared sheets, swipe, keyboard viewport handling.
- [x] Error pages, retry/empty/loading states, safe text rendering, no client task sorting.

## File inventory / responsibilities

The full machine-readable inventory and import graph are `REFACTOR_BASELINE.json`. Largest application files:

| File | Lines | Responsibilities |
|---|---:|---|
| resources/css/tasks.css | 3133 | palettes, legacy/shared styles, shell, every feature and mobile override |
| modules/app-calendar.js | 312 | month/week rendering, agenda, interactions and controller state |
| modules/app-tasks.js | 282 | filtering, URL state, row/board rendering, menus, DnD and page boot |
| modules/app-dashboard.js | 249 | stats/progress/chart/side panel/quick add and page boot |
| GoogleAuthController.php | 239 | OAuth redirects, token/profile exchange, account resolution, sessions |
| modules/app-dialog.js | 210 | shared view/edit/create/deletion/history state |
| modules/app-pet.js | 196 | widget, page, rewards, forms and adoption |
| modules/app-notifications.js | 196 | global dropdown/badges, feed, read state, Welcome |
| TaskController.php | 173 | ownership, validation, query sort, CRUD and reward delegation |

## Duplicates and dead-code candidates

- Identical DOM builders (`appElement`, `appNode`, `appMobileElement`), ID lookups and SVG element creation: consolidate in core/dom.
- Date/calendar formatting already lives partly in app-dates/calendar-data/dashboard-data; move to core/features with named imports, retaining locale/date-only semantics.
- Raw localStorage try/catch patterns: centralize safe get/set/JSON primitives, retaining per-feature fallback/cache and storage key semantics.
- Toast currently shares app-api.js; split without changing queue/lifetime/modal placement.
- Shell currently mixes logout/unread counts/More; split feature helpers, preserving event order and original IDs.
- Dead candidates: legacy task-dialog partial, legacy welcome Blade, unused appMobileChipRow. Confirm references before removal. Broad old CSS cannot be deleted solely because a selector was absent in one screenshot; keep uncertain rules and report them.
- Existing bug/risk candidates are report-only; no silent fixes, validation changes, new UX or dependencies.

## Dependency direction / exact target areas

`tasks.js -> shell + dynamic pages -> features -> core`; `core/state -> core/api -> core/toast`; pure core/date/DOM/storage helpers do not import features. Current import edges are preserved in JSON; rewritten edges will be checked for cycles.

```
resources/js/
  tasks.js
  core/{api,state,dates,dom,storage,toast,constants}.js
  shell/{appearance,nav,logout-modal,search,offline,preferences,public-auth,mobile,bottom-nav}.js
  features/
    tasks/{row,list,filters,groups,url-state}.js
    task-dialog/{dialog,view-panel,edit-form,create-form}.js
    board/{board,dnd,move-menu}.js
    dashboard/{data,stats,progress,chart,side-panel,quick-add}.js
    calendar/{data,month,week-strip,day-list}.js
    notifications/{derive,read-state,welcome,page}.js
    pet/{art,data,widget,page}.js
    settings/{preferences,account,data-export,sections}.js
    mobile/{components,home,task-actions,task-screens,account}.js
  pages/{dashboard,tasks,calendar,notifications,pet,settings}.js
resources/css/
  tasks.css # ordered imports only; cascade-order sequence prefixes where necessary
  base/ themes/ layout/ components/ features/ mobile/
resources/views/
  layouts/ partials/ components/ tasks/ auth/ errors/ landing.blade.php
app/
  Http/Controllers/ Http/Requests/ Http/Resources/ Services/ Models/
tests/
  Feature/Api/ Feature/Pages/ Unit/ browser/
```

Adaptation rule: do not create empty/stub target files merely to match a suggested name. Existing pure submodules can stay together when splitting would create only pass-through wrappers. CSS files are extracted as consecutive top-level rule runs; never reorder a late override into an earlier thematic file.

## Commits / phase order

0–1 baseline/map → 2 core extraction → 3 order-preserving CSS → 4 feature modules/dynamic page boot → 5 Blade composition → 6 PHP/services/requests/resources/tests → 7 proven cleanup/documentation/final audit. Each phase is independently gated and committed.

## Completed verification

All phase gates passed and each phase is committed. Final PHP: **94 tests / 848 assertions**. Final build: PASS. Full browser interactions: PASS with zero baseline JS errors/warnings. Final visual check: **72/72 identical screenshots, zero geometry differences**. Original CSS hash and byte count are unchanged. See `REFACTOR_REPORT.md` for exact bundle/file measurements, feature results, adaptations and the explicitly retained long-initializer limitations; `REFACTOR_CHANGED_FILES.md` lists every changed path.
