import { appGet, appElement as appNode } from '../../core/dom.js';
import { appLocalDate } from '../../core/dates.js';
import { appCompletionDays, appRelativeTime } from './data.js';
import { appTaskNode, appIcon } from '../tasks/row.js';

function appText(id, text) { const node = appGet(id); if (node) node.textContent = String(text); }
export function appChart(tasks) {
    const days = appCompletionDays(tasks), maximum = Math.max(1, ...days.map(day => day.count));
    const total = days.reduce((sum, day) => sum + day.count, 0);
    const chart = appGet('db-summary-chart'), table = appGet('app-chart-table');
    if (!chart || !table) return;
    chart.replaceChildren(); table.replaceChildren();
    for (const [index, { date, count }] of days.entries()) {
        const column = appNode('div', 'db-chart-column app-chart-column' + (index === 6 ? ' is-today' : ''));
        const track = appNode('div', 'app-chart-track'), bar = appNode('span', 'app-chart-bar');
        bar.style.setProperty('--h', count ? count / maximum * 100 + '%' : '0%'); track.append(bar);
        column.append(appNode('span', 'app-chart-value', count), track, appNode('small', '', date.toLocaleDateString(undefined, { weekday: 'short' })));
        if (index === 6) column.setAttribute('aria-current', 'date');
        chart.append(column);
        const row = appNode('tr'), heading = appNode('th', '', date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }));
        heading.setAttribute('scope', 'row'); row.append(heading, appNode('td', '', count)); table.append(row);
    }
    chart.setAttribute('aria-label', total + ' completed in the last 7 days. Today is highlighted.');
    appText('db-chart-total', total + ' completed in the last 7 days');
}
