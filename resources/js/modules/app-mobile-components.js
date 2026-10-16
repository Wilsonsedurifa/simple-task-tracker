import { appElement as appMobileElement } from '../core/dom.js';
import { appIcon, appTaskNode } from './app-task-components.js';
import { appCloseOnBackdrop } from './app-appearance.js';

export { appElement as appMobileElement } from '../core/dom.js';
export function appMobileStatCard({ label, value, tone = 'accent', icon = 'check', action, href }) {
    const card = appMobileElement(href ? 'a' : action ? 'button' : 'div', 'app-mobile-stat-card');
    if (href) card.setAttribute('href', href);
    if (action) { card.type = 'button'; card.addEventListener('click', action); }
    card.dataset.appTone = tone; const circle = appMobileElement('span', 'app-mobile-stat-icon'); circle.setAttribute('aria-hidden', 'true'); circle.append(appIcon(icon));
    const text = appMobileElement('span'); text.append(appMobileElement('span', '', label), appMobileElement('strong', '', value)); card.append(circle, text); return card;
}
export function appMobileChipRow(label) { const row = appMobileElement('div', 'app-mobile-chip-row'); row.setAttribute('role', 'group'); row.setAttribute('aria-label', label); return row; }
export function appMobileTaskRow(task) { return appTaskNode(task, false); }
export function appMobileSectionHeader(title, href, linkText = 'View all →') {
    const header = appMobileElement('div', 'app-mobile-section-header'); header.append(appMobileElement('h2', '', title));
    if (href) { const link = appMobileElement('a', '', linkText); link.setAttribute('href', href); header.append(link); } return header;
}
export function appMobileSheet(id, title, fullScreen = false) {
    const dialog = appMobileElement('dialog', fullScreen ? 'app-mobile-full-sheet' : 'app-mobile-bottom-sheet'); dialog.id = id; dialog.dataset.appMobileSheet = '';
    const header = appMobileElement('header', 'app-mobile-sheet-header'), heading = appMobileElement('h2', '', title); heading.id = id + '-heading'; dialog.setAttribute('aria-labelledby', heading.id);
    const close = appMobileElement('button', 'app-mobile-icon-button'); close.type = 'button'; close.setAttribute('aria-label', 'Close ' + title);
    const icon = appIcon('reopen'); icon.querySelector('path')?.setAttribute('d', 'm15 5-7 7 7 7'); close.append(icon); close.addEventListener('click', () => dialog.close()); header.append(close, heading);
    const body = appMobileElement('div', 'app-mobile-sheet-body'), footer = appMobileElement('footer', 'app-mobile-sheet-footer'); dialog.append(header, body, footer); appCloseOnBackdrop(dialog);
    let trigger;
    dialog.addEventListener('close', () => { if (trigger?.isConnected) trigger.focus(); });
    return { dialog, body, footer, open(opener = document.activeElement) { if (dialog.open) return; trigger = opener; dialog.showModal(); (body.querySelector('input:checked,button,a') || close).focus(); } };
}
export function appMobilePickerSheet(select, opener) {
    const title = select.id === 'priority-filter' ? 'Priority' : select.id === 'due-filter' ? 'Due date' : select.id === 'sort-filter' ? 'Sort by' : select.getAttribute('aria-label') || 'Choose an option';
    const sheet = appMobileSheet('app-mobile-picker', title);
    const group = appMobileElement('fieldset', 'app-mobile-radio-list'), legend = appMobileElement('legend', 'app-sr-only', title);
    group.append(legend);
    for (const option of select.options) {
        const label = appMobileElement('label'), radio = document.createElement('input'); radio.type = 'radio'; radio.name = 'app-mobile-picker-choice'; radio.value = option.value; radio.checked = select.value === option.value; radio.disabled = option.disabled;
        label.append(radio, appMobileElement('span', '', option.textContent)); group.append(label);
        radio.addEventListener('change', () => { if (!select.disabled && radio.checked) { select.value = radio.value; select.dispatchEvent(new Event('change', { bubbles: true })); } });
    }
    const done = appMobileElement('button', 'button button-primary', 'Done'); done.type = 'button'; done.addEventListener('click', () => sheet.dialog.close()); sheet.body.append(group, done);
    sheet.dialog.addEventListener('close', () => setTimeout(() => sheet.dialog.remove(), 0), { once: true }); document.body.append(sheet.dialog); sheet.open(opener); return sheet;
}
