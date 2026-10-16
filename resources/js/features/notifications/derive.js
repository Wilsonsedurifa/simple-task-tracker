// notifications/derive: existing UI behavior and lifecycle, initialized explicitly by the app boot.
import { appLocalDate, appDateInput } from '../../core/dates.js';
import { appRelativeTime } from '../dashboard/data.js';

export const appNotificationTypes = {
    welcome: { label: 'Welcome', icon: 'check' },
    overdue: { label: 'Overdue', icon: 'alert' },
    due_today: { label: 'Due today', icon: 'calendar' },
    due_tomorrow: { label: 'Due tomorrow', icon: 'clock' },
    completed: { label: 'Recently completed', icon: 'check' },
};

// These notifications are DERIVED from the shared task array, not pushed.
// No notification backend or persisted message history exists; only read IDs are saved.
export function appDeriveNotifications(tasks, now = new Date()) {
    const today = appLocalDate(now), day = appDateInput(today), result = [];
    for (const task of tasks) {
        let type = null, appliesOn = day, timestamp = today.getTime(), message = '';
        if (task.status === 'completed') {
            const completed = task.completed_at == null ? NaN : new Date(task.completed_at).getTime();
            if (!Number.isFinite(completed) || completed > now.getTime() || completed < now.getTime() - 86400000) continue;
            type = 'completed'; timestamp = completed;
            message = "'" + task.title + "' was completed";
        } else if (task.status === 'pending') {
            const due = appLocalDate(task.due_date); if (!due) continue;
            const days = Math.round((due - today) / 86400000);
            if (days < 0) { type = 'overdue'; message = "'" + task.title + "' is " + Math.abs(days) + (days === -1 ? ' day overdue' : ' days overdue'); }
            else if (days === 0) { type = 'due_today'; message = "'" + task.title + "' is due today"; }
            else if (days === 1) { type = 'due_tomorrow'; message = "'" + task.title + "' is due tomorrow"; }
        }
        if (type) result.push({ id: String(task.id) + ':' + type + ':' + appliesOn, taskId: task.id, type, timestamp, appliesOn, message });
    }
    return result;
}

export function appNotificationGroup(item, now = new Date()) {
    const date = appLocalDate(item.timestamp), today = appLocalDate(now), yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return date >= today ? 'Today' : date >= yesterday ? 'Yesterday' : 'Earlier';
}

export function appNotificationRelative(item, now = new Date()) {
    return item.type === 'completed' ? appRelativeTime(item.timestamp, now.getTime()) : appNotificationGroup(item, now);
}

// Choose latest membership only. Display stays in source/server task order.
export function appLatestNotifications(items, limit = 5) {
    const selected = new Set();
    for (let index = 0; index < limit; index++) {
        let candidate = null;
        for (const item of items) if (!selected.has(item.id) && (!candidate || item.timestamp > candidate.timestamp)) candidate = item;
        if (!candidate) break;
        selected.add(candidate.id);
    }
    return items.filter(item => selected.has(item.id));
}
