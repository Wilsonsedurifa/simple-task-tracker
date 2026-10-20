import { appCollaborationApi } from './api.js';
import { appElement } from '../core/dom.js';
import { appToast } from '../core/toast.js';
import { appRequest } from '../core/api.js';
import { initPeopleSearch } from './peopleSearch.js';

export function appInitShareModal() {
    const modal = document.querySelector('#app-share-modal'), trigger = document.querySelector('#app-share-task');
    if (!modal || !trigger) return;
    const form = modal.querySelector('#app-share-form'), email = modal.querySelector('#app-share-email'), role = modal.querySelector('#app-share-role'), error = modal.querySelector('#app-share-error'), list = modal.querySelector('#app-collaborators');
    let taskId = null;
    const search = initPeopleSearch(email, modal.querySelector('#app-people-results'));
    async function pendingInvitations() {
        const container = modal.querySelector('#app-pending-invitations');
        container.textContent = 'Loading invitations…';
        try {
            const invitations = await appRequest('/api/tasks/' + taskId + '/invitations');
            container.replaceChildren();
            if (!invitations.length) container.textContent = 'No pending invitations.';
            invitations.forEach(person => container.append(appElement('p', 'app-pending-person', person.name + ' · @' + person.username + ' · ' + person.role)));
        } catch (failure) { container.textContent = failure.message; }
    }
    modal.addEventListener('close', () => search.reset());
    trigger.addEventListener('click', () => { role.value = 'viewer'; queueMicrotask(pendingInvitations); });
    const showError = message => { error.hidden = !message; error.textContent = message || ''; };
    async function renderCollaborators() {
        const people = await appCollaborationApi.collaborators(taskId); list.replaceChildren();
        if (!people.length) { list.append(appElement('p', '', 'No collaborators yet.')); return; }
        const owner = document.querySelector('#app-task-dialog')?.dataset.ownerId === document.body.dataset.appUserId;
        people.forEach(person => { const row = appElement('div', 'app-collaborator-row'); row.append(appElement('span', 'app-collaborator-avatar', person.name.slice(0, 1).toUpperCase()), appElement('span', 'app-collaborator-name', person.name + ' · ' + person.role)); if (owner) { const remove = appElement('button', 'button button-secondary', 'Remove'); remove.type = 'button'; remove.addEventListener('click', async () => { try { await appCollaborationApi.remove(taskId, person.id); await renderCollaborators(); } catch (failure) { showError(failure.message); } }); row.append(remove); } list.append(row); });
    }
    trigger.addEventListener('click', async () => { const taskDialog = document.querySelector('#app-task-dialog'); taskId = taskDialog?.dataset.taskId; if (!taskId) return; form.querySelector('button[type="submit"]').hidden = taskDialog.dataset.ownerId !== document.body.dataset.appUserId; email.closest('.field').hidden = taskDialog.dataset.ownerId !== document.body.dataset.appUserId; role.closest('.field').hidden = taskDialog.dataset.ownerId !== document.body.dataset.appUserId; showError(); modal.showModal(); try { await renderCollaborators(); } catch (failure) { showError(failure.message); } });
    form.addEventListener('submit', async event => {
        event.preventDefault(); showError();
        const person = search.value();
        if (!person) { showError('Select a person from the search results first.'); return; }
        const submit = form.querySelector('[type="submit"]'); submit.disabled = true;
        try { await appCollaborationApi.invite(taskId, { user_id: person.id, role: role.value }); search.reset(); await pendingInvitations(); appToast('Invitation sent.'); }
        catch (failure) { showError(failure.message); }
        finally { submit.disabled = false; }
    });
    modal.querySelector('[data-app-share-close]').addEventListener('click', () => modal.close());
}
