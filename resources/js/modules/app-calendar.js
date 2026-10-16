import { appTaskState } from './app-state.js';
import { appDateInput, appLocalDate, appMinimumDueDate } from './app-dates.js';
import { appReadWeekStart } from './app-preferences.js';
import { appCalendarDate, appCalendarMonth, appCalendarMonthKey, appCalendarDays, appCalendarWeek, appCalendarBuckets } from './app-calendar-data.js';
import { appOpenTask, appOpenCreate, appOpenDelete } from './app-dialog.js';
import { appTaskNode, appIcon } from './app-task-components.js';
import { appToast } from './app-api.js';

const appGet = id => document.getElementById(id);
function appNode(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = String(text);
    return node;
}
function appToday() { const now = new Date(); return appCalendarDate(now.getFullYear(), now.getMonth(), now.getDate()); }
function appMinimumDate() { return appLocalDate(appMinimumDueDate(document.querySelector('meta[name="app-timezone"]')?.content || 'UTC')); }
function appCanCreate(date) { return date && date >= appMinimumDate() && date.getFullYear() >= 1 && date.getFullYear() <= 9999; }
function appDateLabel(date) { return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }); }
function appTaskCount(number) { return number + (number === 1 ? ' task' : ' tasks'); }

export function appInitCalendar() {
    const root = appGet('app-calendar'), grid = appGet('app-calendar-grid'), popover = appGet('app-calendar-day');
    if (!root || !grid || !popover) return;
    const mobile = matchMedia('(max-width: 767px)');
    let month = appCalendarMonth(new URL(location.href).searchParams.get('month'));
    let selected = appCalendarMonthKey(month) === appCalendarMonthKey(appToday()) ? appToday() : new Date(month);
    let weekStart = appReadWeekStart(), buckets = new Map(), dayKey = '', dayTrigger = null;
    let appMonthExpanded = false;
    const appUnscheduled = appGet('app-calendar-unscheduled');
    let appDesktopUnscheduled = appUnscheduled?.open ?? true, appMobileUnscheduled = false;
    function appUrl() {
        const url = new URL(location.href); url.searchParams.set('month', appCalendarMonthKey(month));
        history.replaceState(history.state, '', url);
    }
    function appViews() {
        const ready = appTaskState.loaded;
        if (appGet('app-calendar-desktop')) appGet('app-calendar-desktop').hidden = !ready || mobile.matches;
        if (appGet('app-calendar-agenda')) appGet('app-calendar-agenda').hidden = !ready || !mobile.matches;
    }
    function appRestoreDayFocus() {
        if (document.querySelector('dialog[open]')) return;
        const key = dayTrigger?.dataset.appDate || dayKey;
        const target = dayTrigger?.isConnected ? dayTrigger : [...root.querySelectorAll('[data-app-date="' + CSS.escape(key) + '"]')].find(node => node.getClientRects().length);
        target?.focus({ preventScroll: true });
    }
    function appCloseDay() { if (popover.matches(':popover-open')) popover.hidePopover(); }
    function appCreateDay(key, trigger) {
        const date = appLocalDate(key); if (!appCanCreate(date)) return;
        appCloseDay();
        appOpenCreate('todo', { due_date: key, trigger });
    }
    function appEmpty(copy, date = null) {
        const empty = appNode('div', 'app-designed-empty app-calendar-day-empty');
        empty.append(appIcon('check'), appNode('h3', '', copy), appNode('p', '', date && !appCanCreate(date) ? 'This date is view-only. Choose an available date for your next task.' : 'A little room to plan your next step.'));
        return empty;
    }
    function appPill(task) {
        const completed = task.status === 'completed', overdue = !completed && appLocalDate(task.due_date) < appToday();
        const button = appNode('button', 'app-calendar-pill' + (completed ? ' app-calendar-completed' : overdue ? ' app-calendar-overdue' : ''));
        button.type = 'button'; button.tabIndex = -1; button.dataset.taskId = task.id;
        const label = task.title + ', ' + task.priority + ' priority, ' + (completed ? 'Completed' : overdue ? 'Overdue' : 'Pending');
        button.setAttribute('aria-label', label); button.setAttribute('title', label);
        const dot = appNode('span', 'app-priority-dot app-calendar-priority-' + task.priority); dot.setAttribute('aria-hidden', 'true');
        button.append(dot, appNode('span', 'app-calendar-pill-title', task.title)); return button;
    }
    function appGrid() {
        const days = appCalendarDays(month, weekStart), today = appDateInput(appToday()), key = appDateInput(selected);
        grid.replaceChildren();
        const headings = appNode('div', 'app-calendar-row app-calendar-weekdays'); headings.setAttribute('role', 'row'); headings.setAttribute('aria-rowindex', '1');
        for (const date of days.slice(0, 7)) {
            const heading = appNode('div', '', date.toLocaleDateString(undefined, { weekday: 'short' }));
            heading.setAttribute('role', 'columnheader'); heading.setAttribute('aria-label', date.toLocaleDateString(undefined, { weekday: 'long' })); headings.append(heading);
        }
        grid.append(headings);
        for (let week = 0; week < 6; week++) {
            const row = appNode('div', 'app-calendar-row'); row.setAttribute('role', 'row'); row.setAttribute('aria-rowindex', String(week + 2));
            for (let column = 0; column < 7; column++) {
                const date = days[week * 7 + column], dateKey = appDateInput(date), tasks = buckets.get(dateKey) || [];
                const outside = appCalendarMonthKey(date) !== appCalendarMonthKey(month), past = !appCanCreate(date);
                const cell = appNode('div', 'app-calendar-cell' + (outside ? ' app-calendar-outside' : '') + (past ? ' app-calendar-past' : '') + (dateKey === today ? ' app-calendar-is-today' : ''));
                cell.dataset.appDate = dateKey; cell.setAttribute('role', 'gridcell'); cell.setAttribute('aria-colindex', String(column + 1)); cell.tabIndex = dateKey === key ? 0 : -1;
                cell.setAttribute('aria-label', appDateLabel(date) + ', ' + appTaskCount(tasks.length) + (past ? '. View-only date; adding tasks is disabled.' : '. Enter to view day.'));
                cell.setAttribute('aria-selected', String(dateKey === key));
                if (dateKey === today) cell.setAttribute('aria-current', 'date');
                const number = appNode('button', 'app-calendar-day-number', date.getDate()); number.type = 'button'; number.tabIndex = -1;
                number.dataset.appOpenDay = dateKey; number.dataset.appDate = dateKey;
                number.setAttribute('aria-label', 'Open ' + appDateLabel(date)); cell.append(number);
                const pills = appNode('div', 'app-calendar-pills'); pills.append(...tasks.slice(0, 3).map(appPill)); cell.append(pills);
                if (tasks.length > 3) {
                    const more = appNode('button', 'app-calendar-more', '+' + (tasks.length - 3) + ' more'); more.type = 'button'; more.tabIndex = -1;
                    more.dataset.appOpenDay = dateKey; more.dataset.appDate = dateKey; more.setAttribute('aria-label', 'View all ' + appTaskCount(tasks.length) + ' on ' + appDateLabel(date)); cell.append(more);
                }
                row.append(cell);
            }
            grid.append(row);
        }
    }
    function appAgenda() {
        const strip = appGet('app-calendar-week'), list = appGet('app-agenda-tasks'), key = appDateInput(selected), tasks = buckets.get(key) || [];
        if (!strip || !list) return;
        strip.replaceChildren();
        for (const date of appCalendarWeek(selected, weekStart)) {
            const dateKey = appDateInput(date), count = (buckets.get(dateKey) || []).length;
            const button = appNode('button', 'app-week-day' + (dateKey === appDateInput(appToday()) ? ' app-week-today' : ''));
            button.type = 'button'; button.dataset.appDate = dateKey; button.setAttribute('aria-pressed', String(dateKey === key));
            button.setAttribute('aria-label', appDateLabel(date) + ', ' + appTaskCount(count));
            if (dateKey === appDateInput(appToday())) button.setAttribute('aria-current', 'date');
            const dot = appNode('span', 'app-week-count' + (count ? ' app-week-has-tasks' : ''), count ? '•' : ''); dot.setAttribute('aria-hidden', 'true');
            button.append(appNode('small', '', date.toLocaleDateString(undefined, { weekday: 'short' })), appNode('strong', '', date.getDate()), dot);
            button.addEventListener('click', () => appSelectDate(date, false, true)); strip.append(button);
        }
        if (appGet('app-agenda-date')) appGet('app-agenda-date').textContent = appMobileDateLabel(selected);
        if (appGet('app-agenda-count')) appGet('app-agenda-count').textContent = appTaskCount(tasks.length);
        const add = appGet('app-agenda-add'); if (add) { add.disabled = !appCanCreate(selected); add.dataset.appDate = key; }
        if (appGet('app-agenda-past')) appGet('app-agenda-past').hidden = appCanCreate(selected);
        if (appGet('app-agenda-past')) appGet('app-agenda-past').textContent = 'View-only date. New tasks need ' + appDateLabel(appMinimumDate()) + ' or later.';
        list.replaceChildren(...tasks.map(appMobileCalendarRow));
        if (!tasks.length) list.append(appEmpty('Walang task sa araw na ito', selected));
        const end = appCalendarDate(selected.getFullYear(), selected.getMonth(), selected.getDate() + 7);
        let previous = null;
        // Walk the server array, inserting headers at date boundaries. Never sort
        // or regroup tasks: a repeated date keeps its original server position.
        for (const task of appTaskState.tasks) {
            const date = appLocalDate(task.due_date); if (!date || date <= selected || date > end) continue;
            const taskKey = appDateInput(date);
            if (previous !== taskKey) {
                const heading = appNode('h3', 'app-mobile-agenda-heading' + (date < appToday() && (buckets.get(taskKey) || []).some(item => item.status === 'pending') ? ' app-mobile-calendar-overdue' : ''), appMobileDateLabel(date));
                list.append(heading); previous = taskKey;
            }
            list.append(appMobileCalendarRow(task));
        }
        const heading = appGet('app-agenda-date'); if (heading) heading.classList.toggle('app-mobile-calendar-overdue', selected < appToday() && tasks.some(task => task.status === 'pending'));
        appMobileMonth();
    }
    function appMobileDateLabel(date) {
        const today = appToday(), tomorrow = appCalendarDate(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        const prefix = +date === +today ? 'Today' : +date === +tomorrow ? 'Tomorrow' : date.toLocaleDateString(undefined, { weekday:'long' });
        return prefix + ' · ' + date.toLocaleDateString(undefined, { month:'short', day:'numeric', year:'numeric' });
    }
    function appMobileCalendarRow(task) {
        const row = appTaskNode(task, false), stage = task.status === 'completed' ? 'Completed' : ({ todo:'Pending', in_progress:'In Progress', review:'Review' }[task.stage] || 'Pending');
        row.querySelector('.app-task-copy')?.append(appNode('span', 'app-mobile-calendar-stage', stage)); return row;
    }
    function appMobileMonth() {
        const container = appGet('app-calendar-mobile-month'); if (!container) return;
        container.hidden = !appMonthExpanded; container.replaceChildren();
        const days = appCalendarDays(month, weekStart), today = appDateInput(appToday()), selectedKey = appDateInput(selected);
        for (const date of days.slice(0, 7)) container.append(appNode('span', 'app-mobile-calendar-weekday', date.toLocaleDateString(undefined, { weekday:'short' })));
        for (const date of days) {
            const key = appDateInput(date), count = (buckets.get(key) || []).length;
            const button = appNode('button', 'app-mobile-calendar-date' + (appCalendarMonthKey(date) !== appCalendarMonthKey(month) ? ' app-mobile-calendar-outside' : ''));
            button.type = 'button'; button.dataset.appMobileDate = key; button.setAttribute('aria-pressed', String(key === selectedKey));
            button.setAttribute('aria-label', date.toLocaleDateString(undefined, { weekday:'short', month:'short', day:'numeric' }) + ', ' + appTaskCount(count));
            if (key === today) button.setAttribute('aria-current', 'date');
            const dot = appNode('span', 'app-mobile-calendar-dot', count ? '•' : ''); dot.setAttribute('aria-hidden', 'true');
            button.append(appNode('span', 'app-mobile-date-number', date.getDate()), dot);
            button.addEventListener('click', () => { appSelectDate(date); appGet('app-calendar-mobile-month')?.querySelector('[data-app-mobile-date="' + CSS.escape(key) + '"]')?.focus({ preventScroll:true }); });
            container.append(button);
        }
    }
    function appRenderDay() {
        if (!dayKey) return;
        const date = appLocalDate(dayKey), tasks = buckets.get(dayKey) || [], list = appGet('app-day-tasks'); if (!date || !list) return;
        const active = document.activeElement, id = active?.closest('[data-task-id]')?.dataset.taskId, action = active?.dataset.action;
        const scroll = list.scrollTop;
        if (appGet('app-day-heading')) appGet('app-day-heading').textContent = appDateLabel(date);
        if (appGet('app-day-count')) appGet('app-day-count').textContent = appTaskCount(tasks.length);
        list.replaceChildren(...tasks.map(task => appTaskNode(task, false)));
        if (!tasks.length) list.append(appEmpty('No tasks on this day', date));
        const add = appGet('app-day-add'); if (add) { add.disabled = !appCanCreate(date); add.dataset.appDate = dayKey; }
        if (appGet('app-day-past')) appGet('app-day-past').hidden = appCanCreate(date);
        if (appGet('app-day-past')) appGet('app-day-past').textContent = 'View-only date. New tasks need ' + appDateLabel(appMinimumDate()) + ' or later.';
        list.scrollTop = scroll;
        if (id && popover.matches(':popover-open') && !document.querySelector('dialog[open]')) {
            const row = list.querySelector('[data-task-id="' + CSS.escape(id) + '"]');
            (action ? row?.querySelector('[data-action="' + action + '"]') : row)?.focus({ preventScroll: true });
        }
    }
    function appOpenDay(key, trigger) {
        dayKey = key; selected = appLocalDate(key) || selected; dayTrigger = trigger;
        root.querySelectorAll('[role="gridcell"]').forEach(cell => { cell.tabIndex = cell.dataset.appDate === key ? 0 : -1; cell.setAttribute('aria-selected', String(cell.dataset.appDate === key)); });
        appRenderDay();
        const rect = trigger?.getBoundingClientRect(), width = Math.min(460, innerWidth - 32);
        const left = Math.max(16, Math.min(innerWidth - width - 16, rect ? rect.right - width : (innerWidth - width) / 2));
        const top = Math.max(16, Math.min(innerHeight - 340, rect ? rect.bottom + 8 : 100));
        popover.style.setProperty('--app-day-left', left + 'px'); popover.style.setProperty('--app-day-top', top + 'px'); popover.style.setProperty('--app-day-height', innerHeight - top - 16 + 'px');
        if (!popover.matches(':popover-open')) popover.showPopover();
        appGet('app-day-close')?.focus();
    }
    function appRender(tasks) {
        const active = document.activeElement, source = active?.closest('#app-agenda-tasks,#app-unscheduled-list')?.id;
        const id = active?.closest('[data-task-id]')?.dataset.taskId, action = active?.dataset.action;
        const dateKey = active?.closest('[role="gridcell"]')?.dataset.appDate || (active?.closest('#app-calendar-week') ? active.dataset.appDate : null);
        const list = appGet('app-unscheduled-list'), scroll = list?.scrollTop || 0;
        buckets = appCalendarBuckets(tasks);
        const monthTasks = tasks.filter(task => appDateInput(task.due_date).slice(0, 7) === appCalendarMonthKey(month));
        const unscheduled = tasks.filter(task => !task.due_date);
        if (appGet('app-calendar-month')) appGet('app-calendar-month').textContent = month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
        if (appGet('app-calendar-summary')) appGet('app-calendar-summary').textContent = appTaskCount(monthTasks.length) + ' with deadlines · ' + unscheduled.length + ' unscheduled';
        if (appGet('app-calendar-empty')) appGet('app-calendar-empty').hidden = !appTaskState.loaded || Boolean(monthTasks.length);
        if (appGet('app-unscheduled-count')) appGet('app-unscheduled-count').textContent = unscheduled.length;
        if (list) {
            list.replaceChildren(...unscheduled.map(task => {
                const row = appMobileCalendarRow(task); row.classList.add('app-calendar-unscheduled-row'); row.setAttribute('role', 'button');
                row.querySelector('.app-task-actions')?.remove(); row.querySelector('.app-action-toggle-check')?.remove(); row.querySelector('.app-task-due')?.remove(); return row;
            }));
            if (!unscheduled.length && appTaskState.loaded) list.append(appEmpty('Everything has its place'));
            list.scrollTop = scroll;
        }
        appGrid(); appAgenda();
        if (popover.matches(':popover-open')) appRenderDay();
        if (appGet('app-calendar-prev')) appGet('app-calendar-prev').disabled = month.getFullYear() === 1 && month.getMonth() === 0;
        if (appGet('app-calendar-next')) appGet('app-calendar-next').disabled = month.getFullYear() === 9999 && month.getMonth() === 11;
        if (appGet('app-calendar-loading')) appGet('app-calendar-loading').hidden = appTaskState.loaded;
        if (appGet('app-calendar-error')) appGet('app-calendar-error').hidden = true;
        root.setAttribute('aria-busy', String(!appTaskState.loaded)); appViews();
        if (!document.querySelector('dialog[open]') && !popover.matches(':popover-open')) {
            if (source && id) { const row = appGet(source)?.querySelector('[data-task-id="' + CSS.escape(id) + '"]'); (action ? row?.querySelector('[data-action="' + action + '"]') : row)?.focus({ preventScroll: true }); }
            else if (dateKey) appFocusDate(mobile.matches);
        }
    }
    function appFocusDate(agenda = false, reveal = false) {
        const container = agenda ? appGet('app-calendar-week') : grid;
        const target = container?.querySelector('[data-app-date="' + CSS.escape(appDateInput(selected)) + '"]');
        target?.focus({ preventScroll: true });
        if (reveal) target?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
    }
    function appSelectDate(date, focusGrid = false, focusWeek = false) {
        if (!date || date.getFullYear() < 1 || date.getFullYear() > 9999) return;
        selected = date;
        if (appCalendarMonthKey(date) !== appCalendarMonthKey(month)) month = appCalendarDate(date.getFullYear(), date.getMonth());
        appUrl(); appRender(appTaskState.tasks);
        if (focusGrid || focusWeek) appFocusDate(focusWeek, true);
    }
    function appChangeMonth(delta, focus = false) {
        const next = appCalendarDate(month.getFullYear(), month.getMonth() + delta), last = appCalendarDate(next.getFullYear(), next.getMonth() + 1, 0);
        appCloseDay(); appSelectDate(appCalendarDate(next.getFullYear(), next.getMonth(), Math.min(selected.getDate(), last.getDate())), focus);
        if (appGet('app-calendar-announcement')) appGet('app-calendar-announcement').textContent = month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    }
    grid.addEventListener('keydown', event => {
        const cell = event.target.closest('[role="gridcell"]'); if (!cell) return;
        const date = appLocalDate(cell.dataset.appDate);
        const offsets = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
        if (Object.hasOwn(offsets, event.key)) { event.preventDefault(); appSelectDate(appCalendarDate(date.getFullYear(), date.getMonth(), date.getDate() + offsets[event.key]), true); }
        else if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); const offset = (date.getDay() - weekStart + 7) % 7; appSelectDate(appCalendarDate(date.getFullYear(), date.getMonth(), date.getDate() + (event.key === 'Home' ? -offset : 6 - offset)), true); }
        else if (event.key === 'PageUp' || event.key === 'PageDown') { event.preventDefault(); appChangeMonth(event.key === 'PageUp' ? -1 : 1, true); }
        else if ((event.key === 'Enter' || event.key === ' ') && event.target === cell) { event.preventDefault(); appOpenDay(cell.dataset.appDate, cell); }
    });
    async function appClick(event) {
        const pill = event.target.closest('.app-calendar-pill');
        if (pill) { appCloseDay(); appOpenTask(pill.dataset.taskId, { trigger: pill }); return; }
        const openDay = event.target.closest('[data-app-open-day]');
        if (openDay) { appOpenDay(openDay.dataset.appOpenDay, openDay); return; }
        const row = event.target.closest('[data-task-id]');
        if (row) {
            const action = event.target.closest('[data-action]'), id = row.dataset.taskId;
            if (action?.dataset.action === 'toggle-check') {
                const task = appTaskState.tasks.find(task => String(task.id) === id); if (!task || appTaskState.isMoving(id)) return;
                try { await appTaskState.move(id, task.status === 'completed' ? 'todo' : 'completed'); appToast(task.status === 'completed' ? 'Task reopened.' : 'Task completed.'); } catch (error) { appToast(error.message, 'error'); }
            } else { const trigger = popover.contains(row) ? dayTrigger || row : action || row; appCloseDay(); if (action?.dataset.action === 'delete') appOpenDelete(id); else appOpenTask(id, { edit: action?.dataset.action === 'edit', trigger }); }
            return;
        }
        const cell = event.target.closest('[role="gridcell"]'); if (cell) { selected = appLocalDate(cell.dataset.appDate) || selected; appCreateDay(cell.dataset.appDate, cell); }
    }
    for (const container of [root, popover]) {
        container.addEventListener('click', appClick);
        container.addEventListener('keydown', event => { if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[data-task-id]:not(button)')) { event.preventDefault(); const trigger = popover.contains(event.target) ? dayTrigger || event.target : event.target; appCloseDay(); appOpenTask(event.target.dataset.taskId, { trigger }); } });
    }
    function appChangeWeek(delta) { appSelectDate(appCalendarDate(selected.getFullYear(), selected.getMonth(), selected.getDate() + delta * 7), false, true); if (appGet('app-calendar-announcement')) appGet('app-calendar-announcement').textContent = 'Week of ' + appDateLabel(appCalendarWeek(selected, weekStart)[0]); }
    appGet('app-calendar-prev')?.addEventListener('click', () => mobile.matches ? appChangeWeek(-1) : appChangeMonth(-1));
    appGet('app-calendar-next')?.addEventListener('click', () => mobile.matches ? appChangeWeek(1) : appChangeMonth(1));
    appGet('app-calendar-today')?.addEventListener('click', () => { appCloseDay(); appSelectDate(appToday()); });
    appGet('app-agenda-prev')?.addEventListener('click', () => appSelectDate(appCalendarDate(selected.getFullYear(), selected.getMonth(), selected.getDate() - 7), false, true));
    appGet('app-agenda-next')?.addEventListener('click', () => appSelectDate(appCalendarDate(selected.getFullYear(), selected.getMonth(), selected.getDate() + 7), false, true));
    appGet('app-agenda-add')?.addEventListener('click', event => appCreateDay(appDateInput(selected), event.currentTarget));
    appGet('app-day-add')?.addEventListener('click', () => appCreateDay(dayKey, dayTrigger));
    appGet('app-day-close')?.addEventListener('click', appCloseDay);
    popover.addEventListener('toggle', event => { if (event.newState === 'closed' && (document.activeElement === document.body || popover.contains(document.activeElement))) appRestoreDayFocus(); });
    function appMobileCalendarMode() {
        root.querySelector('.app-calendar-navigation')?.setAttribute('aria-label', mobile.matches ? 'Calendar week' : 'Calendar month');
        for (const [id, text] of [['app-calendar-prev','Previous'], ['app-calendar-next','Next']]) appGet(id)?.setAttribute('aria-label', text + (mobile.matches ? ' week' : ' month'));
        if (appUnscheduled) appUnscheduled.open = mobile.matches ? appMobileUnscheduled : appDesktopUnscheduled;
        appCloseDay(); appViews();
    }
    appUnscheduled?.addEventListener('toggle', () => { if (mobile.matches) appMobileUnscheduled = appUnscheduled.open; else appDesktopUnscheduled = appUnscheduled.open; });
    mobile.addEventListener('change', appMobileCalendarMode); appMobileCalendarMode();
    appGet('app-calendar-expand')?.addEventListener('click', event => {
        appMonthExpanded = !appMonthExpanded; event.currentTarget.setAttribute('aria-expanded', String(appMonthExpanded));
        const text = event.currentTarget.firstChild; if (text) text.textContent = appMonthExpanded ? 'Hide month ' : 'Show month '; appMobileMonth();
    });
    let appTouch = null;
    appGet('app-calendar-week')?.addEventListener('touchstart', event => { appTouch = event.touches.length === 1 ? { x:event.touches[0].clientX, y:event.touches[0].clientY } : null; }, { passive:true });
    appGet('app-calendar-week')?.addEventListener('touchend', event => {
        const touch = event.changedTouches[0], start = appTouch; appTouch = null; if (!mobile.matches || !start || !touch) return;
        const x = touch.clientX - start.x, y = touch.clientY - start.y; if (Math.abs(x) >= 48 && Math.abs(x) > Math.abs(y) * 1.5) appChangeWeek(x < 0 ? 1 : -1);
    }, { passive:true });
    appGet('app-calendar-week')?.addEventListener('touchcancel', () => { appTouch = null; }, { passive:true });
    const appSettingsChanged = () => { const next = appReadWeekStart(); if (next !== weekStart) { weekStart = next; appCloseDay(); appRender(appTaskState.tasks); } };
    window.addEventListener('app:settings', appSettingsChanged);
    window.addEventListener('popstate', () => { month = appCalendarMonth(new URL(location.href).searchParams.get('month')); if (appCalendarMonthKey(selected) !== appCalendarMonthKey(month)) selected = new Date(month); appCloseDay(); appRender(appTaskState.tasks); });
    document.addEventListener('visibilitychange', () => { if (!document.hidden && appTaskState.loaded) appRender(appTaskState.tasks); });
    appUrl(); appRender(appTaskState.tasks); appTaskState.subscribe(appRender);
    appTaskState.onError(error => {
        const box = appGet('app-calendar-error'); if (!box) return;
        box.hidden = false; box.replaceChildren(appNode('p', '', error.message));
        if (appGet('app-calendar-loading')) appGet('app-calendar-loading').hidden = true;
        root.setAttribute('aria-busy', 'false');
        const retry = appNode('button', 'button button-secondary', 'Try again'); retry.type = 'button';
        retry.addEventListener('click', async () => { retry.disabled = true; try { await appTaskState.load({ force: true }); } catch {} finally { if (retry.isConnected) retry.disabled = false; } }); box.append(retry);
    });
}
