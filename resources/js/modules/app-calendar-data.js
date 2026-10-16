import { appDateInput } from './app-dates.js';

export function appCalendarDate(year, month, day = 1) {
    const date = new Date(0);
    date.setFullYear(year, month, day);
    date.setHours(0, 0, 0, 0);
    return date;
}

export function appCalendarMonth(value, fallback = new Date()) {
    if (/^\d{4}-(0[1-9]|1[0-2])$/.test(value || '')) {
        const [year, month] = value.split('-').map(Number);
        if (year >= 1) return appCalendarDate(year, month - 1);
    }
    return appCalendarDate(fallback.getFullYear(), fallback.getMonth());
}

export function appCalendarMonthKey(date) {
    return String(date.getFullYear()).padStart(4, '0') + '-' + String(date.getMonth() + 1).padStart(2, '0');
}

export function appCalendarDays(month, weekStart = 1) {
    const offset = (month.getDay() - weekStart + 7) % 7;
    return Array.from({ length: 42 }, (_, index) => appCalendarDate(month.getFullYear(), month.getMonth(), 1 - offset + index));
}

export function appCalendarWeek(day, weekStart = 1) {
    const offset = (day.getDay() - weekStart + 7) % 7;
    return Array.from({ length: 7 }, (_, index) => appCalendarDate(day.getFullYear(), day.getMonth(), day.getDate() - offset + index));
}

export function appCalendarBuckets(tasks) {
    const buckets = new Map();
    for (const task of tasks) {
        const key = appDateInput(task.due_date);
        if (!key) continue;
        if (!buckets.has(key)) buckets.set(key, []);
        buckets.get(key).push(task);
    }
    return buckets;
}
