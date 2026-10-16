# M5: mobile Profile, Settings and Notifications

Profile is a phone-only view at `/settings#profile`. The bottom Profile tab and initials avatar link there; Settings and its four existing sections stay at `/settings#appearance`, `#preferences`, `#account`, and `#data`. No route/backend/dependency was added. Tablet/desktop continue to display existing Settings.

## Files changed

- `resources/views/tasks/partials/mobile-profile.blade.php`: original server-escaped identity/initials, shortcut groups, stat slots, shared Appearance/logout triggers.
- `resources/views/tasks/settings.blade.php`: include phone Profile.
- `resources/views/tasks/partials/mobile-header.blade.php`: Profile avatar target and mirrored hamburger unread count.
- `resources/views/tasks/partials/mobile-navigation.blade.php`: Profile tab target.
- `resources/js/modules/app-mobile-account.js`: hash/breakpoint projection, back links, grouped section chevrons and stats from the shared array.
- `resources/js/modules/app-settings.js`: preserve Profile hash; update both profile/sidebar identities after existing account saves.
- `resources/js/modules/app-shell.js`: shared Profile logout trigger, focus return and accessible hamburger badge count.
- `resources/js/modules/app-appearance.js`: return focus to the visible opener, including Profile.
- `resources/js/modules/app-notification-welcome.js`: per-user one-time local Welcome and compact relative time helpers.
- `resources/js/modules/app-notification-data.js`: Welcome presentation metadata; existing task derivation unchanged.
- `resources/js/modules/app-notifications.js`: phone-only Welcome projection, acknowledgment, user-scoped storage synchronization and relative-time markup.
- `resources/js/tasks.js`: independently guarded mobile account initialization.
- `resources/css/tasks.css`: M5 phone layout and token-based notification accents. Existing desktop layouts retain their styles.
- `tests/Feature/MobileAccountTest.php`: shared controls and unique IDs.
- `tests/browser/mobile-account-checks.mjs`: Profile navigation/stats, Settings, appearance/logout focus, Welcome reload suppression, read state, task Details, badges, themes and resize.
- `tests/browser/workspace.mjs`: include focused/full account checks (`--mobile-account-only`); wait for responsive handlers before layout assertions.
- `docs/MOBILE_ACCOUNT_NOTIFICATIONS.md`: this handoff.

## Welcome semantics and assumptions

Task notifications remain derived, not pushed. IDs and read state reuse the existing user-scoped notification storage. The phone Welcome is created on the first phone Notifications visit and kept until clicked or marked read. Its timestamp is saved under `app-notifications-welcome:USER_ID`; its read ID is saved with the other notification read IDs, so it never replays after acknowledgment. Pending Welcome is included in phone badges and survives reloads. Desktop task-only notifications are unchanged.

Welcome has no task and therefore acknowledges itself instead of opening a nonexistent Details drawer. All task-backed rows mark read and open the existing drawer. If storage is blocked, the existing temporary-state notice applies; persistence across reloads cannot be guaranteed. Clearing browser storage resets these local preferences/read state.

Profile In progress combines pending `in_progress` and `review`, matching the mobile Tasks chip. No assigned-by-Admin items exist.

## Manual regression checklist

- At 380px open Profile from bottom nav and avatar; check initials centered, display-only capitalization, email ellipsis, gear, all shortcuts and optional pet visibility.
- Verify Quick Stats against the shared task array; no additional task fetch when switching Settings/Profile hashes.
- Open Appearance from Profile: all themes/per-theme accents, selected states, persistence, Escape/Back and focus return.
- Open/cancel logout and verify POST+CSRF on confirmation through the existing modal.
- Check Settings section navigation, keyboard operation, labeled 44px controls, preference persistence and account/data forms.
- Notifications: back link, Mark all, All/Unread, red overdue/green completed/purple reminder/star Welcome, compact relative times and unread dots.
- Check task notification opens Details and returns focus; check Welcome acknowledgment and no replay after reload. Inspect hamburger, Profile and navigation counts.
- Test per-user and cross-tab read-state isolation; blocked/malformed localStorage must not block tasks.
- Test empty/loading/error/retry, reduced motion, all five themes, and widths 380/768/1024/1280/1920. Existing desktop pages must remain unchanged.
- Recheck Home, Tasks/Add/Edit/Details, Calendar, Pet, auth, offline and logout.

Physical iOS/Android devices remain outside browser-emulation coverage.

Suggested commit: `feat: add mobile profile settings and notification polish`
