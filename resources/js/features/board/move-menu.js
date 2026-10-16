import { appElement } from '../../core/dom.js';

export function appInitMoveMenu(appMove, appStageLabels) {
    let appMenu = null;
    function appCloseMenu(focus = false) {
        if (!appMenu) return;
        const { menu, trigger } = appMenu; menu.remove(); trigger.setAttribute('aria-expanded', 'false'); appMenu = null;
        if (focus && trigger.isConnected) trigger.focus();
    }

    function appOpenMenu(trigger, id) {
        appCloseMenu();
        const menu = appElement('div', 'app-move-menu'); menu.setAttribute('role', 'menu'); menu.setAttribute('aria-label', 'Move task to');
        for (const [stage, label] of Object.entries(appStageLabels)) {
            const item = appElement('button', '', label); item.type = 'button'; item.setAttribute('role', 'menuitem'); item.tabIndex = -1;
            item.addEventListener('click', event => { event.stopPropagation(); appMove(id, stage); }); menu.append(item);
        }
        menu.addEventListener('keydown', event => {
            const items = [...menu.querySelectorAll('button')], index = items.indexOf(document.activeElement);
            if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); appCloseMenu(true); }
            else if (['ArrowDown', 'ArrowUp', 'Home', 'End', 'Tab'].includes(event.key)) {
                if (event.key === 'Tab') { appCloseMenu(true); return; }
                event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length; items[next]?.focus();
            }
        });
        const rect = trigger.getBoundingClientRect();
        menu.setAttribute('popover', 'manual');
        menu.style.setProperty('--app-menu-left', Math.max(8, Math.min(innerWidth - 190, rect.right - 180)) + 'px');
        menu.style.setProperty('--app-menu-top', Math.max(8, Math.min(innerHeight - 200, rect.bottom + 6)) + 'px');
        document.body.append(menu); menu.showPopover();
        trigger.setAttribute('aria-expanded', 'true'); appMenu = { menu, trigger }; menu.firstElementChild?.focus();
    }

    document.addEventListener('click', event => { if (appMenu && !appMenu.menu.contains(event.target) && event.target !== appMenu.trigger && !appMenu.trigger.contains(event.target)) appCloseMenu(); });
    return { appCloseMenu, appOpenMenu };
}
