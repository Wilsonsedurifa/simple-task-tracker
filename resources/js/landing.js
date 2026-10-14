const tasks = [
    { t: 'Archive old notes', p: 'low', d: 6 },
    { t: 'Send the weekly update', p: 'medium', d: 4 },
    { t: 'Fix checkout validation', p: 'high', d: 3 },
    { t: 'Review project handoff', p: 'medium', d: 1 },
    { t: 'Update the README', p: 'low', d: 0, done: true },
];

const rank = { high: 0, medium: 1, low: 2 };
let filter = 'all';
const $ = (selector) => document.querySelector(selector);

function render() {
    const list = $('#list');
    list.innerHTML = '';
    const rows = tasks.map((task, index) => ({ ...task, index }))
        .sort((a, b) => rank[a.p] - rank[b.p] || b.d - a.d)
        .filter((task) => filter === 'all' || task.p === filter);

    if (!rows.length) list.innerHTML = '<li class="empty">No tasks here yet.</li>';

    rows.forEach((task) => {
        const item = document.createElement('li');
        item.className = `row${task.done ? ' done' : ''}`;
        const check = document.createElement('button');
        check.className = 'chk'; check.dataset.i = task.index; check.setAttribute('aria-label', 'Toggle complete');
        const title = document.createElement('span'); title.className = 'row__t'; title.textContent = task.t;
        const age = document.createElement('span'); age.className = 'row__age'; age.textContent = task.d ? `${task.d}d` : 'today';
        const priority = document.createElement('span'); priority.className = `pill p-${task.p}`; priority.textContent = task.p[0].toUpperCase() + task.p.slice(1);
        item.append(check, title, age, priority); list.append(item);
    });

    ['all', 'high', 'medium', 'low'].forEach((kind) => { $(`#c-${kind}`).textContent = kind === 'all' ? tasks.length : tasks.filter((task) => task.p === kind).length; });
    $('#count').textContent = `${tasks.filter((task) => !task.done).length} open`;
}

$('#list').addEventListener('click', (event) => { const check = event.target.closest('.chk'); if (check) { tasks[check.dataset.i].done = !tasks[check.dataset.i].done; render(); } });
document.querySelectorAll('.chip').forEach((chip) => chip.addEventListener('click', () => { filter = chip.dataset.f; document.querySelectorAll('.chip').forEach((item) => item.classList.toggle('is-on', item === chip)); render(); }));
$('#add').addEventListener('submit', (event) => { event.preventDefault(); const title = $('#title').value.trim(); if (!title) return; tasks.push({ t: title, p: $('#prio').value, d: 0 }); $('#title').value = ''; render(); });
render();
