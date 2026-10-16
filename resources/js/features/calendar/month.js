// calendar/month: existing UI behavior and lifecycle, initialized explicitly by the app boot.
import { appElement as appNode } from '../../core/dom.js';
import { appDateInput, appLocalDate } from '../../core/dates.js';
import { appCalendarMonthKey, appCalendarDays } from './data.js';
import { appToday, appCanCreate, appDateLabel, appTaskCount } from './labels.js';

function appPill(task) {
    const completed = task.status === 'completed', overdue = !completed && appLocalDate(task.due_date) < appToday();
    const button = appNode('button', 'app-calendar-pill' + (completed ? ' app-calendar-completed' : overdue ? ' app-calendar-overdue' : ''));
    button.type = 'button'; button.tabIndex = -1; button.dataset.taskId = task.id;
    const label = task.title + ', ' + task.priority + ' priority, ' + (completed ? 'Completed' : overdue ? 'Overdue' : 'Pending');
    button.setAttribute('aria-label', label); button.setAttribute('title', label);
    const dot = appNode('span', 'app-priority-dot app-calendar-priority-' + task.priority); dot.setAttribute('aria-hidden', 'true');
    button.append(dot, appNode('span', 'app-calendar-pill-title', task.title)); return button;
}

export function appGrid(context) {
    const { grid, month, weekStart, selected, buckets } = context;
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
