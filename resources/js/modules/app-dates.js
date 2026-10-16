export function appLocalDate(value) {
    if (value === null || value === undefined || value === '') return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split('-').map(Number);
        const date = new Date(0);
        date.setFullYear(year, month - 1, day);
        date.setHours(0, 0, 0, 0);
        return date;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    date.setHours(0, 0, 0, 0);
    return date;
}
export function appDateInput(value) {
    const date = appLocalDate(value);
    return date ? [String(date.getFullYear()).padStart(4,'0'), String(date.getMonth()+1).padStart(2,'0'), String(date.getDate()).padStart(2,'0')].join('-') : '';
}

// A Laravel date cast can arrive as UTC ISO midnight in the app timezone.
// Recover the original date-only value before interpreting it as a local day.
const appDateFormatters = new Map();
export function appDateOnly(value, timeZone = 'UTC') {
    if (!value || /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    if (!appDateFormatters.has(timeZone)) appDateFormatters.set(timeZone, new Intl.DateTimeFormat('en', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }));
    const parts = appDateFormatters.get(timeZone).formatToParts(date);
    const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
    return [values.year.padStart(4, '0'), values.month, values.day].join('-');
}

export function appMinimumDueDate(timeZone = 'UTC', now = new Date()) {
    const local = appLocalDate(now), server = appLocalDate(appDateOnly(now, timeZone));
    return appDateInput(server > local ? server : local);
}
export function appDueLabel(value) {
    const date = appLocalDate(value);
    if (!date) return 'No deadline';
    const today = new Date(); today.setHours(0,0,0,0);
    const days = Math.round((date-today)/86400000);
    return days < 0 ? Math.abs(days)+(days === -1 ? ' day overdue' : ' days overdue') : days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : date.toLocaleDateString(undefined,{month:'short',day:'numeric'});
}

export function appTaskGroup(task, today = new Date()) {
    if (task.status === 'completed') return 'Completed';
    const date = appLocalDate(task.due_date);
    if (!date) return 'No deadline';
    const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const days = Math.round((date - midnight) / 86400000);
    return days < 0 ? 'Overdue' : days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : days <= 8 ? 'This week' : 'Later';
}
