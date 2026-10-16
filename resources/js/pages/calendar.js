import { appMobileCalendarRow } from '../features/calendar/week-strip.js';
import { appToday, appMinimumDate, appCanCreate, appDateLabel, appTaskCount } from '../features/calendar/labels.js';
import { APP_MOBILE_QUERY } from '../core/constants.js';
import { appGet, appElement as appNode } from '../core/dom.js';
import { appTaskState } from '../core/state.js';
import { appDateInput, appLocalDate, appMinimumDueDate } from '../core/dates.js';
import { appReadWeekStart } from '../shell/preferences.js';
import { appCalendarDate, appCalendarMonth, appCalendarMonthKey, appCalendarDays, appCalendarWeek, appCalendarBuckets } from '../features/calendar/data.js';
import { appOpenTask, appOpenCreate, appOpenDelete } from '../features/task-dialog/dialog.js';
import { appTaskNode, appIcon } from '../features/tasks/row.js';
import { appToast } from '../core/api.js';

import { appGrid } from '../features/calendar/month.js';

import { appRenderDay } from '../features/calendar/day-list.js';

import { appAgenda } from '../features/calendar/week-strip.js';

import { appMobileMonth } from '../features/calendar/week-strip.js';

export function appInitCalendar() {
    const root = appGet('app-calendar'), grid = appGet('app-calendar-grid'), popover = appGet('app-calendar-day');
    if (!root || !grid || !popover) return;
    const mobile = matchMedia(APP_MOBILE_QUERY);
    let month = appCalendarMonth(new URL(location.href).searchParams.get('month'));
    let selected = appCalendarMonthKey(month) === appCalendarMonthKey(appToday()) ? appToday() : new Date(month);
    let weekStart = appReadWeekStart(), buckets = new Map(), dayKey = '', dayTrigger = null;
    let appMonthExpanded = false;
    const appUnscheduled = appGet('app-calendar-unscheduled');
    let appDesktopUnscheduled = appUnscheduled?.open ?? true, appMobileUnscheduled = false;
    function appContext() { return { grid, month, weekStart, selected, buckets, appMonthExpanded, appSelectDate, appEmpty, dayKey, popover }; }
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
    function appOpenDay(key, trigger) {
        dayKey = key; selected = appLocalDate(key) || selected; dayTrigger = trigger;
        root.querySelectorAll('[role="gridcell"]').forEach(cell => { cell.tabIndex = cell.dataset.appDate === key ? 0 : -1; cell.setAttribute('aria-selected', String(cell.dataset.appDate === key)); });
        appRenderDay(appContext());
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
        appGrid(appContext()); appAgenda(appContext());
        if (popover.matches(':popover-open')) appRenderDay(appContext());
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
        const text = event.currentTarget.firstChild; if (text) text.textContent = appMonthExpanded ? 'Hide month ' : 'Show month '; appMobileMonth(appContext());
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
