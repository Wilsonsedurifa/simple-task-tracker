import { appRequest } from '../core/api.js';

export const appCollaborationApi = {
    invite: (taskId, values) => appRequest('/api/tasks/' + taskId + '/invitations', { method: 'POST', body: JSON.stringify(values) }),
    collaborators: taskId => appRequest('/api/tasks/' + taskId + '/collaborators'),
    remove: (taskId, userId) => appRequest('/api/tasks/' + taskId + '/collaborators/' + userId, { method: 'DELETE' }),
    invitations: () => appRequest('/api/invitations'),
    accept: id => appRequest('/api/invitations/' + id + '/accept', { method: 'POST', body: '{}' }),
    decline: id => appRequest('/api/invitations/' + id + '/decline', { method: 'POST', body: '{}' }),
};
