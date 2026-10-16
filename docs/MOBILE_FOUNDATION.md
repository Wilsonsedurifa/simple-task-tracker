# M1: mobile foundation

## Delivered

Phone workspace rules are scoped to `@media (max-width: 767px)`. Existing sidebar/top bar remain authoritative at 768px and above. New phone-only elements are hidden outside that range. `matchMedia` moves the existing search/view controls between headers and restores their original DOM positions on resize; there are no duplicate IDs or additional task fetches.

The five bottom tabs are Home, Calendar, raised Add, Tasks, Profile. Labels stay visible, targets are at least 44px, safe-area padding is included, and native modal sheets hide the nav. Add opens the existing create form, styled full-screen on phones; it does not introduce another form or API shape. The footer stays visible within the visual viewport when the keyboard reduces available space. Toasts sit above the nav and are moved into an active phone dialog's top layer when necessary.

Home has a local-time greeting, menu, and initials avatar. Inner pages have a left-aligned title with menu/avatar controls. Search uses the original input and existing event handlers. The hamburger reuses the native More dialog with Notifications/shared unread badge, Settings, My pet when available/enabled, Appearance, and the existing POST+CSRF logout confirmation. Profile and the avatar link to `/settings#account`, reusing the current account UI rather than duplicating it.

Reusable factories in `app-mobile-components.js` provide a tinted stat card, scrolling chip row, shared task row, section header, bottom/full-screen native sheet with body/footer, and radio-list picker. Mobile filter pickers update the original selects and dispatch their existing change events. Task rows reuse `appTaskNode`; phone-only More actions open the existing task drawer/edit/delete workflows. Dates and server order remain governed by the existing shared code.

Native sheets support focus containment, Esc, backdrop dismissal, Back, and focus restoration. Sheet history preserves URL filters and waits for cleanup before following a rapid navigation click. Full-screen sheets use `100dvh`, visualViewport sizing, scroll containment, sticky headers/footers, 16px input text, and reduced-motion-aware scrolling.

`/` now returns the welcome page with 200 for guests and still redirects authenticated users to Dashboard. The welcome screen has a dark navy gradient, CSS waves, original checkmark tile, working Register/Login links, and the requested tagline. Login/Register are restyled at all widths, retain server-side validation and password toggles, and keep the existing login/register -> Continue -> intended destination flow (Dashboard by default). Public/auth pages use tasks.css/tasks.js and never request private task/pet data. Existing theme choices are honored; new phone sessions default to Light/blue. The previous desktop default is retained.

Offline events show the banner and an explanatory toast. Mutating controls expose `aria-disabled`, and attempted activation/submission is blocked. The shared API guard prevents programmatic writes; task moves check connectivity before optimistic state changes. Reconnection enables controls but never queues or replays a mutation. Reading/filtering local state remains available.

## Files changed in this phase

- `routes/web.php`: guest root welcome response; authenticated root behavior unchanged.
- `resources/views/welcome.blade.php`: new public welcome screen.
- `resources/views/layouts/app.blade.php`: phone header/offline inclusion, safe-area viewport, phone default theme boot.
- `resources/views/layouts/auth.blade.php`: unified public/auth shell using the shared entry points.
- `resources/views/layouts/partials/theme-boot.blade.php`: public pre-CSS theme restoration; the existing anti-flash inline-script exception is retained.
- `resources/views/layouts/partials/offline.blade.php`: shared offline status region/toast inclusion.
- `resources/views/auth/login.blade.php`, `register.blade.php`: visible primary H1 headings; existing forms/routes retained.
- `resources/views/tasks/partials/mobile-header.blade.php`: Home/inner header patterns and profile avatar.
- `resources/views/tasks/partials/mobile-navigation.blade.php`: five tabs and reused menu sheet.
- `resources/css/tasks.css`: M1 token block, public/auth styling, phone-only shell/components/touch rules.
- `resources/js/tasks.js`: independent initializers and public/workspace initialization gating.
- `resources/js/modules/app-mobile.js`: responsive control relocation, pickers, task actions, sheet history, visual viewport/lifecycle handling.
- `resources/js/modules/app-mobile-components.js`: reusable native mobile component factories.
- `resources/js/modules/app-offline.js`: offline banner, disabled-state management, click/submit safeguards.
- `resources/js/modules/app-public-auth.js`: existing auth interactions, inline error semantics, public theme metadata.
- `resources/js/modules/app-api.js`: offline write guard and phone native-dialog toast placement.
- `resources/js/modules/app-state.js`: connectivity check before optimistic task moves.
- `resources/js/modules/app-task-components.js`: mobile-only row menu/calendar icon without duplicating tasks.
- `resources/js/modules/app-settings.js`: refresh the additional phone avatar after a profile save.
- `tests/Feature/PageFlowTest.php`: root welcome expectation.
- `tests/Feature/MobileFoundationTest.php`: welcome/auth shell, shared IDs, five-tab structure.
- `tests/browser/mobile-checks.mjs`: dedicated phone foundation and public/auth checks.
- `tests/browser/mobile-desktop-baseline.mjs`: settled tablet/desktop comparison harness.
- `tests/browser/workspace.mjs`: mobile scenarios, phone navigation assertions, deterministic isolated fixture restoration, and history settlement.
- `tests/browser/notification-checks.mjs`, `calendar-checks.mjs`, `pet-checks.mjs`: adapt phone navigation and await native history cleanup where appropriate.
- `docs/MOBILE_FOUNDATION.md`: this implementation/verification record.

No dependencies, backend task endpoints, validation, sorting, database schema, or task response shapes changed. Existing unrelated worktree changes were preserved. There are no new image files: welcome waves are CSS and the logo/icons are inline SVG.

## Verification

- `php artisan test`: **84 passed, 779 assertions**.
- `npm run build`: passed, 35 modules transformed.
- `git diff --check`: passed.
- Full `tests/browser/workspace.mjs`: passed in headless Edge against isolated SQLite; clean page loads have zero JS errors or console warnings.
- Welcome/auth checked at 380, 768, 1024, 1280, 1920; visible input heights at least 48px, fonts at least 16px, and zero private API reads. Public theme restoration checked for all five modes.
- All six workspace routes checked with phone headers/nav, unique IDs, one shared task fetch per page, and no task fetch on resize.
- Hamburger Back/Esc/focus, rotating across the 767/768 boundary, picker URL preservation, task action sheet/shared drawer, and full-screen create/nav hiding passed.
- Simulated visualViewport height of 420px keeps the primary create action visible above the keyboard area. Actual iOS keyboard behavior remains a device follow-up.
- Offline completion and form attempts send zero mutation requests. The toast remains in the active dialog top layer; reconnection sends no queued writes.
- Existing dashboard, board/list, filters, drawer, pet, calendar, notifications, settings, auth, logout, themes, keyboard, and reduced-motion scenarios regress successfully across the established widths/theme matrix.
- Pure local-date and pet mood/badge tests passed.

### Tablet/desktop preservation check

24 geometry/style snapshots compare six workspace routes at 768, 1024, 1280, and 1920. All match, including shell position/dimensions, content/title geometry, padding/gaps, font, colors, and radius at the measured anchors. The initial pre-edit capture could resolve before zero-task skeletons settled; the stable harness reconstructs the unchanged pre-M1 stylesheet by removing the clearly delimited M1 block, hides only additive phone-only nodes, waits for loaded content/fonts, and then compares against the final build. This is a measured geometry/style comparison, not a pixel-perfect screenshot diff of every element.

Commands (uses the already-installed external browser runtime, no dependency added):

```powershell
php artisan test
npm run build
$env:PLAYWRIGHT_MODULE_PATH='C:\Users\PITO\AppData\Local\Programs\Python\Python311\Lib\site-packages\playwright\driver\package'
node tests/browser/mobile-desktop-baseline.mjs --record-stable
node tests/browser/mobile-desktop-baseline.mjs
node tests/browser/workspace.mjs
```

Review screenshots in `storage/app/ui-review/`: `mobile-welcome.png`, `mobile-login.png`, `mobile-register.png`, `mobile-foundation-tasks.png`, plus the existing regression captures. Generated references/screenshots are not source assets.

## Scope notes / deviations

- Profile maps to the existing Settings account section; no duplicate `/profile` route or account backend was created.
- M1 reuses the existing create form inside the phone full-screen shell. The later M2-M5 screen-content redesigns are not claimed as completed here.
- Public/auth styling intentionally changes all widths, and offline safeguards apply globally, as explicitly requested. Workspace appearance changes remain phone-only.
- The legacy `/welcome` informational landing page remains available unchanged; the new splash is the guest `/` route requested in this specification.
- Navigation hides for any native phone modal, not only full-screen modals, so inert background controls are not presented as available.

Unverified: physical iOS/Android devices, real software-keyboard/browser chrome/safe-area behavior, screen-reader output, non-Edge engines, full pixel-by-pixel desktop identity, and MySQL execution. Visual viewport, reduced motion, native keyboard navigation, and online/offline behavior are exercised in automation.

Suggested commit: `feat: add phone app foundation, welcome flow and offline safeguards`
