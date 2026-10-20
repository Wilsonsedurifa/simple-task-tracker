import { appCollaborationApi } from './api.js';
import { appElement } from '../core/dom.js';
import { appToast } from '../core/toast.js';
import { appSetUnreadCount } from '../shell/nav.js';
import { appTaskState } from '../core/state.js';

export async function appInitInvitations() {
    const page = document.querySelector('#app-invitations');
    const preview = document.querySelector('#app-notification-preview');
    const dropdown = preview ? appElement('section', 'app-invitation-preview') : null;
    if (dropdown) { dropdown.setAttribute('aria-label', 'Task invitations'); preview.before(dropdown); }
    let known = null, pending = false;

    function card(invitation) {
        const article = appElement('article', 'app-invitation-card');
        article.append(appElement('strong', '', invitation.task_title), appElement('p', '', invitation.inviter_name + ' invited you as a ' + invitation.role + '.'));
        const actions = appElement('div', 'app-detail-secondary');
        for (const [label, action] of [['Accept', 'accept'], ['Decline', 'decline']]) {
            const button = appElement('button', 'button ' + (action === 'accept' ? 'button-primary' : 'button-secondary'), label);
            button.type = 'button';
            button.addEventListener('click', async () => {
                actions.querySelectorAll('button').forEach(node => { node.disabled = true; });
                try {
                    await appCollaborationApi[action](invitation.id);
                    appToast(action === 'accept' ? 'Invitation accepted.' : 'Invitation declined.');
                    await load();
                    if (action === 'accept') await appTaskState.load({ force: true });
                } catch (error) { appToast(error.message, 'error'); }
                finally { actions.querySelectorAll('button').forEach(node => { node.disabled = false; }); }
            });
            actions.append(button);
        }
        article.append(actions);
        return article;
    }

    async function load() {
        if (pending) return;
        pending = true;
        try {
            const invitations = await appCollaborationApi.invitations();
            const fresh = known === null ? [] : invitations.filter(item => !known.has(item.id));
            known = new Set(invitations.map(item => item.id));
            appSetUnreadCount(invitations.length, 'invitations');
            if (fresh.length) appToast(fresh.length === 1 ? fresh[0].inviter_name + ' invited you to “' + fresh[0].task_title + '”.' : 'You have ' + fresh.length + ' new task invitations.');
            if (page) {
                page.replaceChildren(...invitations.map(card));
                if (!invitations.length) page.append(appElement('p', 'app-dashboard-hint', 'No pending task invitations.'));
            }
            if (dropdown) {
                dropdown.replaceChildren();
                dropdown.hidden = !invitations.length;
                if (invitations.length) dropdown.append(appElement('h3', 'app-invitation-preview-title', 'Task invitations'), ...invitations.map(card));
            }
        } catch (error) {
            if (page && known === null) {
                const retry = appElement('button', 'button button-secondary', 'Retry');
                retry.type = 'button'; retry.addEventListener('click', load);
                page.replaceChildren(appElement('p', 'app-task-error', error.message), retry);
            }
        } finally { pending = false; }
    }

    const refresh = () => { if (!document.hidden) load(); };
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('focus', refresh);
    document.querySelector('#app-notification-bell')?.addEventListener('click', refresh);
    setInterval(refresh, 15000);
    await load();
}
