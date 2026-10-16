// settings/sections: existing UI behavior and lifecycle, initialized explicitly by the app boot.


export function appSettingsTabs() {
    const tabs = [...document.querySelectorAll('[data-app-settings-tab]')];
    function appSelect(tab, focus = false, updateUrl = true) {
        if (!tab) return;
        for (const item of tabs) {
            const selected = item === tab;
            item.setAttribute('aria-selected', String(selected)); item.tabIndex = selected ? 0 : -1;
            const panel = document.getElementById(item.getAttribute('aria-controls'));
            if (panel) panel.hidden = !selected;
        }
        if (updateUrl) history.replaceState(history.state, '', location.pathname + location.search + '#' + tab.dataset.appSettingsTab);
        dispatchEvent(new Event('app:settings-section'));
        if (focus) tab.focus();
    }
    for (const tab of tabs) {
        tab.addEventListener('click', () => appSelect(tab));
        tab.addEventListener('keydown', event => {
            const index = tabs.indexOf(tab), key = event.key;
            if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(key)) return;
            event.preventDefault(); appSelect(tabs[key === 'Home' ? 0 : key === 'End' ? tabs.length - 1 : (index + (key === 'ArrowDown' ? 1 : -1) + tabs.length) % tabs.length], true);
        });
    }
    const appFromHash = () => appSelect(tabs.find(tab => tab.dataset.appSettingsTab === location.hash.slice(1)) || tabs[0], false, location.hash !== '#profile');
    appFromHash(); addEventListener('hashchange', appFromHash);
}
