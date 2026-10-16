import assert from 'node:assert/strict';
import { appDeriveNotifications, appLatestNotifications, appNotificationGroup, appNotificationRelative } from '../../resources/js/features/notifications/derive.js';
import { appNotificationReadKey, appReadNotificationState, appSaveNotificationState } from '../../resources/js/features/notifications/read-state.js';

const now = new Date(2026, 9, 15, 12);
const tasks = [
    { id: 5, title: 'Tomorrow', status: 'pending', due_date: '2026-10-16' },
    { id: 3, title: 'Buy rice', status: 'pending', due_date: '2026-10-13' },
    { id: 1, title: '<b>Today</b>', status: 'pending', due_date: '2026-10-15' },
    { id: 4, title: 'Done', status: 'completed', completed_at: now.getTime() - 23 * 3600000 },
    { id: 7, title: 'Old', status: 'completed', completed_at: now.getTime() - 25 * 3600000 },
    { id: 8, title: 'Unscheduled', status: 'pending', due_date: null },
    { id: 9, title: 'Later', status: 'pending', due_date: '2026-10-20' },
    { id: 10, title: 'Future completion', status: 'completed', completed_at: now.getTime() + 1000 },
];
const items = appDeriveNotifications(tasks, now);
assert.deepEqual(items.map(item => item.taskId), [5, 3, 1, 4]);
assert.deepEqual(items.map(item => item.type), ['due_tomorrow', 'overdue', 'due_today', 'completed']);
assert.equal(items[1].message, "'Buy rice' is 2 days overdue");
assert.equal(items[2].message, "'<b>Today</b>' is due today");
assert.equal(new Set(items.map(item => item.id)).size, 4);
assert.ok(items.every(item => item.id.endsWith(':2026-10-15')));
assert.equal(appNotificationGroup(items[1], now), 'Today');
assert.equal(appNotificationGroup(items[3], now), 'Yesterday');
assert.equal(appNotificationGroup({ timestamp: new Date(2026, 9, 12).getTime() }, now), 'Earlier');
assert.equal(appNotificationRelative(items[3], now), '23 hours ago');
const nextDay = appDeriveNotifications(tasks, new Date(2026, 9, 16, 12));
assert.notEqual(nextDay.find(item => item.taskId === 3).id, items[1].id);
assert.equal(appDeriveNotifications([{ id: 11, title: 'Exact boundary', status: 'completed', completed_at: now.getTime() - 86400000 }], now).length, 1);
const late = { id: 12, title: 'Late win', status: 'completed', completed_at: new Date(2026, 9, 15, 23, 50).getTime() };
assert.notEqual(appDeriveNotifications([late], new Date(2026, 9, 15, 23, 55))[0].id, appDeriveNotifications([late], new Date(2026, 9, 16, 0, 5))[0].id);
const ordered = [7, 3, 10, 2, 9, 1, 8, 6, 5, 4].map(timestamp => ({ id: String(timestamp), timestamp }));
assert.deepEqual(appLatestNotifications(ordered).map(item => item.timestamp), [7, 10, 9, 8, 6]);
assert.equal(ordered[0].timestamp, 7, 'latest selection never sorts the source');
assert.deepEqual(appDeriveNotifications([], now), []);

const store = new Map();
globalThis.localStorage = { getItem: key => store.get(key) || null, setItem: (key, value) => store.set(key, value) };
assert.notEqual(appNotificationReadKey('1'), appNotificationReadKey('2'));
assert.equal(appNotificationReadKey(''), null);
let saved = appSaveNotificationState('1', new Set(), [items[0].id]);
assert.equal(saved.available, true);
assert.ok(appReadNotificationState('1').ids.has(items[0].id));
assert.equal(appReadNotificationState('2').ids.size, 0);
appSaveNotificationState('1', new Set(), [items[1].id]);
saved = appSaveNotificationState('1', saved.ids, [items[2].id]);
assert.equal(saved.ids.size, 3, 'merges reads from another tab before writing');
store.set(appNotificationReadKey('2'), '{bad json');
assert.equal(appReadNotificationState('2').ids.size, 0);
store.set(appNotificationReadKey('2'), JSON.stringify({ ids: [null, 7, items[0].id] }));
assert.deepEqual([...appReadNotificationState('2').ids], [items[0].id]);
globalThis.localStorage = { getItem: () => { throw Error('Blocked'); }, setItem: () => { throw Error('Quota'); } };
assert.equal(appReadNotificationState('1').available, false);
saved = appSaveNotificationState('1', new Set([items[0].id]), [items[1].id]);
assert.equal(saved.available, false);
assert.equal(saved.ids.size, 2, 'blocked storage retains in-memory reads');
delete globalThis.localStorage;
console.log('PASS: derived types, stable daily IDs, 24-hour boundary, local groups, latest-five membership without sorting, per-user reads, cross-tab merge, malformed and blocked storage.');
