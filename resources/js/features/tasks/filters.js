// tasks/filters: existing UI behavior and lifecycle, initialized explicitly by the app boot.
import { appLocalDate } from '../../core/dates.js';

export function appFiltered(tasks, filters, appPhone) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return tasks.filter(task => {
        const date = appLocalDate(task.due_date);
        const appStage = task.stage || 'todo';
        const appStatusMatch = !filters.status || (filters.status === 'in_progress' ? task.status === 'pending' && ['in_progress', 'review'].includes(appStage) : task.status === filters.status && !(appPhone.matches && filters.status === 'pending' && !filters.stage && appStage !== 'todo'));
        const appWeekEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 8);
        const appTomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        return appStatusMatch
            && (!filters.stage || task.status === 'pending' && task.stage === filters.stage)
            && (!filters.priority || task.priority === filters.priority)
            && (!filters.q || (task.title + ' ' + (task.description || '') + ' ' + (task.collaborator_usernames || []).map(name => '@' + name).join(' ')).toLowerCase().includes(filters.q.toLowerCase()))
            && (!filters.due || task.status === 'pending' && (filters.due === 'none' ? !date : filters.due === 'today' ? date?.getTime() === today.getTime() : filters.due === 'week' ? date && date > appTomorrow && date <= appWeekEnd : date && date < today));
    });
}
