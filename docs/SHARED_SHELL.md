# Shared app shell

One layout now provides the desktop sidebar, tablet icon rail, mobile bottom tabs, shared top bar, account controls, Appearance picker, and per-page title area.

## Files changed for this shell task

- resources/views/layouts/app.blade.php — anti-flash theme/accent restoration, shared page-heading sections, shared dialogs/navigation.
- resources/views/tasks/partials/sidebar.blade.php — 260px desktop navigation, 20px SVGs, real route links, active indicator, open-task badge, account card.
- resources/views/tasks/partials/topbar.blade.php — global search, Tasks-only Board/List, New task, notification bell.
- resources/views/tasks/partials/appearance.blade.php — theme radio group and accent swatches.
- resources/views/tasks/partials/mobile-navigation.blade.php — four bottom tabs and More sheet.
- resources/views/tasks/index.blade.php — moves Board/List into shared top bar; supplies heading/subtitle sections.
- resources/views/tasks/dashboard.blade.php — supplies shared heading/subtitle/actions sections.
- resources/views/pages/placeholder.blade.php — supplies heading/subtitle without duplicate eyebrow/title.
- resources/css/tasks.css — shell tokens, layout breakpoints, controls, previews, focus, theme/accent colors, and safe-area padding.
- resources/js/tasks.js — independently guarded shell/appearance module initialization.
- resources/js/modules/app-appearance.js — radio behavior, live system theme, per-theme accent persistence, anti-leak validation, keyboard/focus handling.
- resources/js/modules/app-shell.js — More dialog, shared logout modal, appearance triggers, unread indicators.
- tests/browser/workspace.mjs — shell regression and existing flow checks.
- docs/SHARED_SHELL.md — this report.

## Behavior

- 1024px and wider: 260px sidebar with labels, user card, and active item indicator.
- 768–1023px: 80px icon rail. Labels are visually hidden, retained for assistive technology, with title tooltips.
- Under 768px: Dashboard/Tasks/Calendar/More bottom bar with safe-area padding. More contains Notifications, Settings, Appearance, and Log out.
- Appearance uses native theme/accent radios with checkmarks, visible selected rings, arrow-key selection, Escape/backdrop closing, and focus restoration.
- Light/Dark/System have neutral-friendly accents; Kawaii has candy pink/lavender/mint/peach/baby blue; Racing has red/amber/sky.
- Each theme remembers only its own valid accent. Saved preferences are applied by the head script before styles load.
- The task badge uses the existing shared task array and hides at zero.
- Board/List is present only on Tasks and retains its existing persistence.
- Each page provides heading/subtitle Blade sections; the layout renders one H1.

## Verification

- php artisan test: 51 passed, 294 assertions.
- npm run build: successful without build warnings.
- Browser regression: all five workspace pages and public Login/Register/landing pages; one initial task fetch each; no baseline JS errors or console warnings.
- Checked all five themes across widths 380, 768, 1024, 1280, and 1920, including reduced motion and keyboard controls. Every accent's shell text contrast was also measured at desktop width.
- Measured 4.5:1 or better contrast for primary shell button text, selected navigation text, account email text, and selected theme text for every accent.
- Verified selected checkmarks, theme/accent reload persistence, anti-flash head behavior with the app bundle disabled, blocked localStorage, zero/open badge, notification indicator updates, Escape/outside closing, focus return, and mobile logout confirmation.
- Existing create/edit/stage/complete/reopen/delete, deep links, intended URL, global search, 401/419, and task-state regression checks still pass.

## Deviations and manual checks

- Notifications remains the previously requested placeholder. No unread data is fabricated: indicators hide at zero. A server-provided unreadNotificationsCount or the app:notifications event with detail.unread updates them.
- The Appearance popover uses a native dialog so focus trapping and Escape remain reliable.
- Full screen-reader and real-device safe-area testing remain manual. Responsive dimensions and keyboard behavior were verified in Edge automation.
- Routes, task API shapes, validation, and sorting were not changed in this shell task.

Suggested commit: feat: build responsive shared app shell with theme accents
