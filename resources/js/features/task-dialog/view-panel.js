// task dialog/view panel: existing UI behavior and lifecycle, initialized explicitly by the app boot.
import { APP_MOBILE_QUERY } from '../../core/constants.js';
import { appGet, appText } from '../../core/dom.js';
import { appTaskState } from '../../core/state.js';
import { appDateInput, appDueLabel } from '../../core/dates.js';
const appLabels = { todo: 'To do', in_progress: 'In progress', review: 'Review' };
export function appRenderView(task) {
    appText('detail-title',task.title);appText('detail-description',task.description || 'No description added.');
    appGet('detail-title')?.setAttribute('title',task.title);
    const appPhone = matchMedia(APP_MOBILE_QUERY).matches;
    appText('detail-status-text',task.status==='completed'?'Completed':appPhone ? ({ todo:'Pending', in_progress:'In Progress', review:'Review' }[task.stage] || 'Pending') : appLabels[task.stage] || 'To do');
    appText('detail-priority-badge',task.priority);appText('detail-created-date',task.created_at?new Date(task.created_at).toLocaleString():'');
    const badge=appGet('detail-priority-badge');if(badge)badge.className='badge badge-'+task.priority;
    appText('detail-tag-badge',appDueLabel(task.due_date));
    appText('app-detail-priority',task.priority[0].toUpperCase()+task.priority.slice(1));
    appText('app-detail-stage',task.status==='completed'?'Completed':appLabels[task.stage] || 'To do');
    appText('app-detail-due',task.due_date?appDateInput(task.due_date)+(appPhone?' · '+appDueLabel(task.due_date):''):'No deadline');
    appGet('app-detail-completed')?.closest('div')?.classList.toggle('app-mobile-completed-empty', !task.completed_at);
    const appPriority = appGet('app-detail-priority'); if (appPriority) appPriority.className = appPhone ? 'badge badge-'+task.priority : '';
    appGet('app-task-dialog')?.setAttribute('data-app-task-stage', task.status === 'completed' ? 'completed' : task.stage || 'todo');
    appGet('app-task-dialog')?.querySelector('.app-mobile-detail-status svg path')?.setAttribute('d', task.status === 'completed' ? 'm5 12 4 4L19 6' : 'M12 7v5l3 2 M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18');
    appText('app-detail-completed',task.completed_at?new Date(task.completed_at).toLocaleString():'Not completed');
    for(const [id,stage] of [['app-detail-start','in_progress'],['app-detail-review','review']]){const button=appGet(id);if(button)button.hidden=task.status==='completed'||task.stage===stage;}
    appText('detail-complete-text',task.status==='completed'?(appPhone?'Reopen':'Reopen task'):(appPhone?'Mark as Completed':'Mark as completed'));
    appText('app-detail-start',appPhone?'Move to In Progress':'Start');
    const empty=appGet('detail-view-empty');if(empty)empty.hidden=true;
    const view=appGet('detail-view-active');if(view)view.hidden=false;
    appGet('app-task-dialog')?.setAttribute('aria-labelledby','detail-title');
    for(const id of ['detail-complete-btn','app-detail-start','app-detail-review','detail-edit-btn','detail-delete-btn']){const button=appGet(id);if(button)button.disabled=appTaskState.isMoving(task.id);}
}
