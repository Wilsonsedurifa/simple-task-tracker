import { appLocalDate } from '../../core/dates.js';

export function appGreeting(date, name = '') {
    const hour = date.getHours();
    const greeting = hour >= 5 && hour < 12 ? 'Magandang umaga' : hour >= 12 && hour < 18 ? 'Magandang hapon' : 'Magandang gabi';
    return greeting + (name ? ', ' + name : '');
}

export function appCompletionDays(tasks, today = new Date()) {
    return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6 + index);
        const count = tasks.filter(task => task.status === 'completed' && appLocalDate(task.completed_at)?.getTime() === date.getTime()).length;
        return { date, count };
    });
}

// Select membership by time, then filter the original array: never reorder tasks.
export function appRecentCompleted(tasks, limit = 8) {
    const selected = new Set();
    for (let index = 0; index < limit; index++) {
        let candidate = null, latest = -Infinity;
        for (const task of tasks) {
            if (task.status !== 'completed' || selected.has(task.id)) continue;
            const timestamp = task.completed_at == null ? -Infinity : new Date(task.completed_at).getTime();
            const time = Number.isFinite(timestamp) ? timestamp : -Infinity;
            if (!candidate || time > latest) { candidate = task; latest = time; }
        }
        if (!candidate) break;
        selected.add(candidate.id);
    }
    return tasks.filter(task => selected.has(task.id));
}

export function appRelativeTime(timestamp, now = Date.now()) {
    if (timestamp == null) return 'Completion time unavailable';
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return 'Completion time unavailable';
    const minutes = Math.max(0, Math.floor((now - date.getTime()) / 60000));
    if (!minutes) return 'Just now';
    if (minutes < 60) return minutes + (minutes === 1 ? ' minute ago' : ' minutes ago');
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + (hours === 1 ? ' hour ago' : ' hours ago');
    const days = Math.floor(hours / 24);
    return days + (days === 1 ? ' day ago' : ' days ago');
}
