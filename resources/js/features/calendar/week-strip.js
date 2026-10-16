// calendar/week strip: existing UI behavior and lifecycle, initialized explicitly by the app boot.
import { appGet, appElement as appNode } from '../../core/dom.js';
import { appTaskState } from '../../core/state.js';
import { appDateInput, appLocalDate } from '../../core/dates.js';
import { appCalendarDate, appCalendarMonthKey, appCalendarDays, appCalendarWeek } from './data.js';
import { appToday, appMinimumDate, appCanCreate, appDateLabel, appTaskCount } from './labels.js';
import { appTaskNode } from '../tasks/row.js';

export function appAgenda(context) {
    const { month, weekStart, selected, buckets, appMonthExpanded, appSelectDate, appEmpty } = context;
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
    appMobileMonth(context);
}

function appMobileDateLabel(date) {
    const today = appToday(), tomorrow = appCalendarDate(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const prefix = +date === +today ? 'Today' : +date === +tomorrow ? 'Tomorrow' : date.toLocaleDateString(undefined, { weekday:'long' });
    return prefix + ' · ' + date.toLocaleDateString(undefined, { month:'short', day:'numeric', year:'numeric' });
}

export function appMobileCalendarRow(task) {
    const row = appTaskNode(task, false), stage = task.status === 'completed' ? 'Completed' : ({ todo:'Pending', in_progress:'In Progress', review:'Review' }[task.stage] || 'Pending');
    row.querySelector('.app-task-copy')?.append(appNode('span', 'app-mobile-calendar-stage', stage)); return row;
}

export function appMobileMonth(context) {
    const { month, weekStart, selected, buckets, appMonthExpanded, appSelectDate, appEmpty } = context;
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
