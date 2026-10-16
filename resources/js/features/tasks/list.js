// tasks/list: existing UI behavior and lifecycle, initialized explicitly by the app boot.
import { appElement } from '../../core/dom.js';
import { appTaskGroup as appGroup } from '../../core/dates.js';
import { appTaskNode } from './row.js';
export function appRenderList(list, filtered, sort) {
    list.replaceChildren();
    const counts = new Map();
    for (const task of filtered) counts.set(appGroup(task), (counts.get(appGroup(task)) || 0) + 1);
    let previous = null;
    for (const task of filtered) {
        const group = appGroup(task);
        if (sort === 'deadline' && group !== previous) {
            const heading = appElement('h3', 'app-list-group', group); heading.append(appElement('span', '', counts.get(group))); list.append(heading); previous = group;
        }
        list.append(appTaskNode(task, false));
    }
}
