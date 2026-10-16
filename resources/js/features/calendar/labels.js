// calendar/labels: existing UI behavior and lifecycle, initialized explicitly by the app boot.
import { appCalendarDate } from './data.js';
import { appLocalDate, appMinimumDueDate } from '../../core/dates.js';
export function appToday() { const now = new Date(); return appCalendarDate(now.getFullYear(), now.getMonth(), now.getDate()); }
export function appMinimumDate() { return appLocalDate(appMinimumDueDate(document.querySelector('meta[name="app-timezone"]')?.content || 'UTC')); }
export function appCanCreate(date) { return date && date >= appMinimumDate() && date.getFullYear() >= 1 && date.getFullYear() <= 9999; }
export function appDateLabel(date) { return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }); }
export function appTaskCount(number) { return number + (number === 1 ? ' task' : ' tasks'); }
