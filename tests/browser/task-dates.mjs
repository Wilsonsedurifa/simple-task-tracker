import assert from 'node:assert/strict';
import { appDateInput, appLocalDate, appTaskGroup } from '../../resources/js/core/dates.js';

const today = new Date(2026, 9, 15, 23, 59);
const task = due_date => ({ status: 'pending', due_date });
for (const [date, group] of [
    ['2026-10-14', 'Overdue'], ['2026-10-15', 'Today'], ['2026-10-16', 'Tomorrow'],
    ['2026-10-17', 'This week'], ['2026-10-23', 'This week'], ['2026-10-24', 'Later'],
    [null, 'No deadline'],
]) assert.equal(appTaskGroup(task(date), today), group);
assert.equal(appTaskGroup({ ...task('2026-10-14'), status: 'completed' }, today), 'Completed');
const plain = appLocalDate('2026-10-15');
assert.equal(plain.getFullYear(), 2026);
assert.equal(plain.getMonth(), 9);
assert.equal(plain.getDate(), 15);
assert.equal(plain.getHours(), 0);
assert.equal(appDateInput('2026-10-15'), '2026-10-15');
const timestamp = new Date(2026, 9, 15, 23, 59).getTime();
assert.equal(appDateInput(timestamp), '2026-10-15');
console.log('PASS: local date parsing, timestamp bucketing, and deadline groups including day 8/day 9 boundaries.');
