// pet/data: existing UI behavior and lifecycle, initialized explicitly by the app boot.
import { appLocalDate } from '../../core/dates.js';

/** Pure local-calendar mood derivation. Precedence is proud > happy > sleepy > idle.
 * Never sorts or mutates the shared task array.
 * A temporary happy burst is presentation-only and is not part of this function.
 */
export function appPetMood(tasks, pet, now = new Date()) {
    const today = appLocalDate(now), open = tasks.filter(task => task.status === 'pending');
    const done = tasks.filter(task => task.status === 'completed');
    const overdue = open.filter(task => { const date = appLocalDate(task.due_date); return date && date < today; }).length;
    const completedToday = done.filter(task => appLocalDate(task.completed_at)?.getTime() === today.getTime()).length;
    const mood = !open.length && done.length ? 'proud' : completedToday ? 'happy' : !open.length ? 'sleepy' : 'idle';
    const reason = { proud: 'all your tasks are completed', happy: 'a little progress today', sleepy: 'a quiet moment', idle: 'ready for your next step' };
    const speech = { proud: 'You did it! Time for a well-earned break.', happy: 'Nice one! Small steps count.', sleepy: 'A quiet moment together. No rush.', idle: 'Ready for our next little adventure?' };
    return { mood, text: (pet?.name || 'Your pet') + ' is ' + mood + ': ' + reason[mood] + '.', speech: speech[mood], overdue, completedToday };
}

export function appPetBadges(tasks, pet, now = new Date()) {
    const completed = Number(pet.completed_count) || 0, streak = Number(pet.longest_streak) || 0;
    const overdue = appPetMood(tasks, pet, now).overdue;
    return [
        ['First task', completed, 1], ['5 tasks', completed, 5], ['3-day streak', streak, 3],
        ['7-day streak', streak, 7], ['Level 3', pet.level, 3], ['Cleared all overdue', completed > 0 && overdue === 0 ? 1 : 0, 1],
    ].map(([name, value, goal]) => ({ name, value: Math.min(value, goal), goal, unlocked: value >= goal }));
}
