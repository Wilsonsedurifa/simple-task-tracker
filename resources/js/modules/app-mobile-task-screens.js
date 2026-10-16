import { appMobileElement } from './app-mobile-components.js';
import { appIcon } from './app-task-components.js';
import { appRefreshTaskPresentation } from './app-dialog.js';

// Adapt the real forms and detail nodes; never create a second task or form state.
export function appInitMobileTaskScreens() {
    const appMedia = matchMedia('(max-width: 767px)'), appMoves = [];
    function appMove(node, destination, first = false) {
        if (!node || !destination) return;
        const marker = document.createComment('task screen desktop position'); node.before(marker);
        appMoves.push({ node, destination, first, marker });
    }
    for (const prefix of ['create', 'edit']) {
        const form = document.getElementById(prefix === 'create' ? 'task-form' : 'edit-task-form'); if (!form) continue;
        const priority = form.querySelector('fieldset'), group = priority?.querySelector('.priority-picker');
        if (priority && group) {
            priority.classList.add('app-mobile-form-priority');
            const select = appMobileElement('select', 'input app-mobile-only'); select.id = 'app-mobile-' + prefix + '-priority'; select.setAttribute('aria-label', 'Priority');
            for (const value of ['low', 'medium', 'high']) { const option = appMobileElement('option', '', value[0].toUpperCase() + value.slice(1)); option.value = value; select.append(option); }
            priority.append(select);
            select.addEventListener('change', () => { const radio = group.querySelector('input[value="' + select.value + '"]'); if (radio) { radio.checked = true; radio.dispatchEvent(new Event('input', { bubbles: true })); } });
            const appSyncPriority = () => { select.value = group.querySelector('input:checked')?.value || 'medium'; select.disabled = Boolean(group.querySelector('input:checked')?.disabled); };
            form.addEventListener('input', event => { if (event.target !== select) appSyncPriority(); }); form.addEventListener('reset', () => queueMicrotask(appSyncPriority));
            const dialog = form.closest('dialog'); if (dialog) new MutationObserver(appSyncPriority).observe(dialog, { attributes: true, attributeFilter: ['open', 'data-app-task-mode'] });
            appSyncPriority();
        }
        const description = document.getElementById(prefix === 'create' ? 'description' : 'edit-description');
        appMove(document.getElementById('app-' + prefix + '-description-count'), description?.closest('.field'));
        for (const key of ['due', 'stage']) document.getElementById('app-' + prefix + '-' + key)?.closest('.field')?.classList.add('app-mobile-form-' + key);
        form.querySelector('.field:has(input[type="text"])')?.classList.add('app-mobile-form-title');
        description?.closest('.field')?.classList.add('app-mobile-form-description');
        // Keep keyboard/DOM order identical to the phone's visual field order.
        // Stage precedes Priority in the legacy markup; auto-placement otherwise
        // starts Priority on a new grid row after placing Stage in column two.
        for (const field of [form.querySelector('.app-mobile-form-title'), description?.closest('.field'), priority, document.getElementById('app-' + prefix + '-stage')?.closest('.field'), document.getElementById('app-' + prefix + '-due')?.closest('.field')]) appMove(field, form);
        const footer = form.querySelector(prefix === 'create' ? '.modal-actions' : '.app-edit-actions');
        if (footer) {
            footer.classList.add('app-mobile-task-footer');
            footer.querySelector('button[type="submit"]')?.setAttribute('form', form.id);
            appMove(footer, prefix === 'create' ? form.closest('.modal-body') : form.closest('dialog'));
        }
        const stage = document.getElementById('app-' + prefix + '-stage');
        const label = form.querySelector('label[for="app-' + prefix + '-stage"]');
        if (stage && label) {
            const original = label.textContent;
            appMoves.push({ sync() { label.textContent = appMedia.matches ? 'Status' : original; const option = stage.querySelector('option[value="todo"]'); if (option) option.textContent = appMedia.matches ? 'Pending' : 'To do'; } });
        }
    }
    const appCreateHeading = document.getElementById('create-heading'), appOriginalHeading = appCreateHeading?.textContent;
    const appView = document.getElementById('app-task-dialog'), appPanel = document.getElementById('app-view-panel'), appHeader = appView?.querySelector('.app-drawer-heading');
    const appMobileHead = appMobileElement('span', 'app-mobile-only app-mobile-task-heading', 'Task details'); appMobileHead.id = 'app-mobile-task-heading';
    const appStatus = appMobileElement('div', 'app-mobile-detail-status'); appStatus.append(appIcon('clock'));
    if (appPanel && appHeader) {
        appPanel.prepend(appStatus); appHeader.append(appMobileHead);
        appMove(document.getElementById('detail-title'), appPanel, true);
        appMove(document.getElementById('detail-status-text'), appStatus);
        // The title is large in the body; the stable sheet header is never clipped.
        const button = appMobileElement('button', 'app-mobile-only app-mobile-icon-button'); button.type = 'button'; button.id = 'app-mobile-detail-menu'; button.setAttribute('aria-label', 'More task actions'); button.setAttribute('aria-expanded', 'false'); button.setAttribute('aria-controls', 'app-mobile-detail-actions');
        const icon = appIcon('move'); icon.querySelector('path')?.setAttribute('d', 'M5 12h2 M11 12h2 M17 12h2'); button.append(icon);
        const menu = appMobileElement('div', 'app-mobile-detail-actions'); menu.id = 'app-mobile-detail-actions'; menu.hidden = true; menu.setAttribute('role', 'group'); menu.setAttribute('aria-label', 'Task actions');
        function appCloseMenu(focus = false) { menu.hidden = true; button.setAttribute('aria-expanded', 'false'); if (focus) button.focus(); }
        for (const [text, id] of [['Edit', 'detail-edit-btn'], ['Delete', 'detail-delete-btn']]) {
            const item = appMobileElement('button', 'app-mobile-menu-action', text); item.type = 'button'; item.addEventListener('click', () => { appCloseMenu(); document.getElementById(id)?.click(); }); menu.append(item);
        }
        button.addEventListener('click', () => { const open = menu.hidden; menu.hidden = !open; button.setAttribute('aria-expanded', String(open)); if (open) menu.querySelector('button')?.focus(); });
        appView.addEventListener('keydown', event => { if (event.key === 'Escape' && !menu.hidden) { event.preventDefault(); event.stopPropagation(); appCloseMenu(true); } });
        appView.addEventListener('click', event => { if (!menu.contains(event.target) && !button.contains(event.target)) appCloseMenu(); });
        appView.addEventListener('close', () => appCloseMenu()); appHeader.append(button); appView.querySelector('.app-drawer-header')?.append(menu);
    }
    document.getElementById('app-clear-create-due')?.addEventListener('click', () => { const field = document.getElementById('app-create-due'); if (field) { field.value = ''; field.dispatchEvent(new Event('input', { bubbles: true })); } });
    function appResizeTaskScreens() {
        for (const move of appMoves) {
            if (move.sync) { move.sync(); continue; }
            if (appMedia.matches) { if (move.first) move.destination.prepend(move.node); else move.destination.append(move.node); }
            else move.marker.after(move.node);
        }
        if (appCreateHeading) appCreateHeading.textContent = appMedia.matches ? 'Add Task' : appOriginalHeading;
        if (appMedia.matches) document.getElementById('detail-title')?.before(appStatus);
        appRefreshTaskPresentation();
    }
    appMedia.addEventListener('change', appResizeTaskScreens); appResizeTaskScreens();
}
