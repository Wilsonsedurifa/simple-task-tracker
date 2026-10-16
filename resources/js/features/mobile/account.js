import { APP_MOBILE_QUERY } from '../../core/constants.js';
import { appTaskState } from '../../core/state.js';
import { appLocalDate } from '../../core/dates.js';
import { appMobileElement, appMobileStatCard } from './components.js';
import { appIcon } from '../tasks/row.js';

export function appInitMobileAccount() {
    const profile = document.getElementById('app-mobile-profile'), settings = document.getElementById('app-settings');
    const media = matchMedia(APP_MOBILE_QUERY), page = document.body.dataset.page;
    for (const tab of document.querySelectorAll('[data-app-settings-tab]')) { const icon = appIcon('reopen'); icon.classList.add('app-mobile-only','app-profile-chevron'); icon.querySelector('path')?.setAttribute('d','m9 5 7 7-7 7'); tab.append(icon); }
    const heading = document.querySelector('.app-mobile-heading-row');
    let back;
    if (heading && ['settings','notifications'].includes(page)) {
        back = appMobileElement('a', 'app-mobile-page-back app-mobile-icon-button');
        const icon = appIcon('reopen'); icon.querySelector('path')?.setAttribute('d','m15 5-7 7 7 7'); back.append(icon); heading.prepend(back);
    }
    function appMobileAccountMode() {
        const active = page === 'settings' && location.hash === '#profile' && media.matches;
        document.body.dataset.appProfile = String(active);
        if (profile) profile.hidden = !active;
        if (settings) settings.hidden = active;
        if (page === 'settings') { const title = document.getElementById('app-mobile-title'); if (title) title.textContent = active ? 'Profile' : 'Settings'; }
        if (back) { back.setAttribute('href', page === 'settings' && !active ? '/settings#profile' : '/dashboard'); back.setAttribute('aria-label', page === 'settings' && !active ? 'Back to Profile' : 'Back to Home'); }
    }
    media.addEventListener('change', appMobileAccountMode); addEventListener('hashchange', appMobileAccountMode); addEventListener('app:settings-section', appMobileAccountMode); appMobileAccountMode();
    const container = document.getElementById('app-profile-stats');
    if (!container) return;
    const cards = [['total','Total','accent','calendar','/tasks'],['completed','Completed','success','check','/tasks?status=completed'],['progress','In progress','warning','clock','/tasks?status=in_progress'],['overdue','Overdue','danger','alert','/tasks?due=overdue']].map(([key,label,tone,icon,href]) => {
        const node = appMobileStatCard({label,value:'—',tone,icon,href}); node.dataset.appProfileStat = key; container.append(node); return { key,node,tone };
    });
    appTaskState.subscribe(tasks => {
        const today = new Date(); today.setHours(0,0,0,0);
        const values = { total:tasks.length, completed:tasks.filter(task=>task.status==='completed').length, progress:tasks.filter(task=>task.status==='pending' && ['in_progress','review'].includes(task.stage)).length, overdue:tasks.filter(task=>task.status==='pending' && task.due_date && appLocalDate(task.due_date)<today).length };
        for (const {key,node,tone} of cards) { const value = node.querySelector('strong'); if (value) value.textContent = String(values[key]); node.dataset.appTone = key === 'overdue' && !values[key] ? 'accent' : tone; }
    });
}
