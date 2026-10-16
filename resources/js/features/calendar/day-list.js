// calendar/day list: existing UI behavior and lifecycle, initialized explicitly by the app boot.
import { appGet } from '../../core/dom.js';
import { appLocalDate } from '../../core/dates.js';
import { appMinimumDate, appCanCreate, appDateLabel, appTaskCount } from './labels.js';
import { appTaskNode } from '../tasks/row.js';

export function appRenderDay(context) {
    const { dayKey, buckets, popover, appEmpty } = context;
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
