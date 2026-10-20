import { appCollaborationApi } from '../../collaboration/api.js';
import { appElement } from '../../core/dom.js';

const labels = { todo: 'To do', in_progress: 'In progress', review: 'Review', completed: 'Done' };
export function appRenderDetailsPanel(task) {
    const dialog = document.querySelector('#app-task-dialog');
    const stage = task.status === 'completed' ? 'completed' : task.stage || 'todo';
    const owner = String(task.user_id) === document.body.dataset.appUserId;
    const role = owner ? 'owner' : task.collaboration_role;
    document.querySelectorAll('#app-status-stepper [data-stage]').forEach(button => { const target = button.dataset.stage; button.classList.toggle('is-current', target === stage); button.disabled = !['owner', 'editor'].includes(role) || target === stage; });
    const primary = document.querySelector('#detail-complete-btn'); const copy = document.querySelector('#detail-complete-text');
    const next = { todo: ['in_progress', 'Start task'], in_progress: ['review', 'Send to review'], review: ['completed', 'Mark as completed'], completed: ['todo', 'Reopen'] }[stage];
    if (primary) { primary.hidden = !['owner', 'editor'].includes(role); primary.dataset.nextStage = next[0]; copy.textContent = next[1]; }
    document.querySelector('#app-detail-menu')?.closest('.app-drawer-menu')?.toggleAttribute('data-owner', owner);
    for (const id of ['detail-edit-btn']) document.querySelector('#' + id)?.toggleAttribute('hidden', !['owner', 'editor'].includes(role));
    for (const id of ['app-share-task', 'detail-delete-btn', 'app-detail-invite']) document.querySelector('#' + id)?.toggleAttribute('hidden', !owner);
    const description = document.querySelector('#detail-description'); description?.classList.toggle('is-empty', !task.description);
    if (dialog) dialog.dataset.taskRole = role || 'viewer';
    appRenderCollaborators(task.id, owner);
}
async function appRenderCollaborators(taskId, owner) {
    const container = document.querySelector('#app-detail-collaborators'); if (!container) return;
    try { const users = await appCollaborationApi.collaborators(taskId); container.replaceChildren(); if (!users.length) { container.append(appElement('p', '', 'No collaborators yet.')); return; } users.forEach(user => { const row = appElement('div', 'app-detail-collaborator'); row.append(appElement('span', 'app-detail-avatar', user.name.slice(0, 1).toUpperCase()), appElement('span', '', user.name + ' · ' + user.role)); if (owner) { const remove = appElement('button', 'app-link-button', 'Remove'); remove.type = 'button'; remove.addEventListener('click', async () => { await appCollaborationApi.remove(taskId, user.id); appRenderCollaborators(taskId, owner); }); row.append(remove); } container.append(row); }); } catch (error) { const retry = appElement('button', 'app-link-button', 'Retry'); retry.type = 'button'; retry.addEventListener('click', () => appRenderCollaborators(taskId, owner)); container.replaceChildren(appElement('p', '', error.message || 'Collaborators could not be loaded.'), retry); }
}
export { labels };
