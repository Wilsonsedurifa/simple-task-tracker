# M4: mobile Calendar

Uses the existing calendar controller and shared task array. No new API, backend, dependencies or image assets. Desktop month navigation, grid, day popover and sidebar layout are retained.

## Files changed

- `resources/views/tasks/calendar.blade.php`: accessible month-expansion control/container and selected-day Add wording.
- `resources/js/modules/app-calendar.js`: touch week navigation, mobile month buttons, selected-date/today/dots, local date labels, seven-day lookahead, stage labels, past-date guard and per-breakpoint Unscheduled collapse state. Existing task/dialog/mutation code is reused.
- `resources/css/tasks.css`: M4 phone-only styling, using existing theme tokens. Stage text stays hidden in desktop rows.
- `tests/Feature/MobileCalendarTest.php`: shared controls, expansion accessibility and unique IDs.
- `tests/browser/mobile-calendar-checks.mjs`: mobile navigation, real touch events, server ordering, create/deep-link flow, Unscheduled, settings, themes and empty state.
- `tests/browser/calendar-checks.mjs`: phone week-navigation and lookahead expectations.
- `tests/browser/workspace.mjs`: M4 regression integration; `--mobile-calendar-only` runs focused checks.
- `docs/MOBILE_CALENDAR.md`: this handoff.

## Ordering and date semantics

The selected day appears first. Upcoming sections cover the following seven local calendar dates (selected +1 through +7). They are inserted while walking the original server array; if a date recurs later in server order, its header recurs too. Tasks are never sorted or regrouped on the client. All date-only comparisons use the existing split-y/m/d local parser.

Phone prev/next buttons change weeks; desktop buttons still change months. Expanding the phone month shows six weeks with native date buttons, selected/today state and task dots. Dates in the past remain selectable for viewing, but Add is disabled with a visible explanation.

## Manual checklist

- At 380px, check Calendar title, month label, week navigation, selected circle, today ring and dots.
- Swipe horizontally both ways; vertical scrolling/multi-touch must not advance the week. Prev/next/Today work with keyboard only.
- Expand/collapse the month and choose an outside-month date; week/month/agenda selection stays synchronized.
- Change week start in Settings to Sunday/Monday and revisit Calendar.
- Check selected-day empty state and the following seven days against server order, including repeated date headers, completed tasks and overdue open tasks.
- Add preloads the selected date; past dates disable Add and explain why. Rows open the existing Details drawer and Back returns.
- Unscheduled is collapsible at the bottom and its tasks open Details.
- Simulate loading/error, retry, no tasks and an account with only unscheduled tasks.
- Test five themes, reduced motion and visible focus; verify no horizontal overflow.
- Resize through 380, 768, 1024, 1280 and 1920. Tablet/desktop grid/sidebar remain unchanged and navigation causes no extra task fetch.
- Recheck Home, Tasks, Add/Edit/Details, Notifications, Settings, Pet, auth, logout and offline behavior.

No specification deviations. Physical iOS/Android touch and keyboard behavior requires device testing; browser emulation covers synthetic native touch events and viewport sizing.

Suggested commit: `feat: add mobile calendar week and agenda views`
