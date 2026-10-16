import { APP_MOBILE_QUERY, APP_API } from '../core/constants.js';
import { appGet } from '../core/dom.js';
import { appTaskState } from '../core/state.js';
import { appToast } from '../core/api.js';
import { appDateInput, appDueLabel, appMinimumDueDate } from '../core/dates.js';

const appLabels = { todo: 'To do', in_progress: 'In progress', review: 'Review' };
let appActive = null;
let appSnapshot = null;
let appTrigger = null;
let appSaving = false;
let appCreatedStage = 'todo';
let appDiscardAction = null;
let appKeepAction = null;
let appMode = 'view';
function appText(id, text) { const element = appGet(id); if (element) element.textContent = text; }
function appValues(prefix) {
    const form = appGet(prefix === 'create' ? 'task-form' : 'edit-task-form');
    return {
        title: appGet(prefix === 'create' ? 'title' : 'edit-title')?.value.trim() || '',
        description: appGet(prefix === 'create' ? 'description' : 'edit-description')?.value || '',
        priority: form?.elements[prefix === 'create' ? 'priority' : 'edit-priority']?.value || 'medium',
        due_date: appGet('app-'+prefix+'-due')?.value || '',
        stage: appGet('app-'+prefix+'-stage')?.value || 'todo',
    };
}
function appChanges() {
    if (!appSnapshot) return {};
    return Object.fromEntries(Object.entries(appValues('edit')).filter(([key,value]) => value !== appSnapshot[key]).map(([key,value])=>[key,key==='due_date' ? value || null : value]));
}
function appCounter(prefix) {
    const area = appGet(prefix === 'create' ? 'description' : 'edit-description');
    const count = appGet('app-'+prefix+'-description-count');
    if (area && count) { count.textContent=area.value.length+'/1000'; count.classList.toggle('app-limit',area.value.length===1000); }
    if (area && (prefix==='edit' || matchMedia(APP_MOBILE_QUERY).matches)) { area.style.setProperty('--app-textarea-height','auto'); area.style.setProperty('--app-textarea-height',area.scrollHeight+'px'); }
    if (prefix==='edit') { const save=appGet('save-edit-button'); if(save)save.disabled=appSaving||!Object.keys(appChanges()).length; }
}
function appError(prefix, error = null) {
    const form = appGet(prefix==='create' ? 'task-form' : 'edit-task-form');
    const box = appGet(prefix==='create' ? 'form-error' : 'edit-form-error');
    if(box){box.hidden=!error;box.textContent=error?.message || '';}
    form?.querySelectorAll('[aria-invalid]').forEach(field=>{
        field.removeAttribute('aria-invalid');
        const described=(field.getAttribute('aria-describedby') || '').split(' ').filter(id=>id&&!id.startsWith('app-error-'));
        if(described.length)field.setAttribute('aria-describedby',described.join(' '));else field.removeAttribute('aria-describedby');
    });
    form?.querySelectorAll('.app-field-error').forEach(field=>field.remove());
    let first;
    for(const [name,messages] of Object.entries(error?.errors || {})){
        const id = name==='title' ? (prefix==='create'?'title':'edit-title') : name==='description' ? (prefix==='create'?'description':'edit-description') : 'app-'+prefix+'-'+(name==='due_date'?'due':name);
        const field=appGet(id) || (name==='priority'?form?.querySelector('input[type="radio"]:checked'):null);
        if(!field)continue;
        const message=document.createElement('p');message.className='app-field-error';message.id='app-error-'+prefix+'-'+name;message.setAttribute('role','alert');message.textContent=messages[0];
        field.setAttribute('aria-invalid','true');field.setAttribute('aria-describedby',((field.getAttribute('aria-describedby') || '')+' '+message.id).trim());
        if(name==='priority')field.closest('fieldset')?.append(message);else field.after(message);first ||= field;
    }
    first?.focus();
}
function appFocusReturn() {
    if(appTrigger?.isConnected&&appTrigger.getClientRects().length){appTrigger.focus();return;}
    const row=[...document.querySelectorAll('[data-task-id="'+CSS.escape(String(appActive || ''))+'"]')].find(node=>node.getClientRects().length);
    const date=appTrigger?.dataset.appDate;
    const calendar=date?[...document.querySelectorAll('[data-app-date="'+CSS.escape(date)+'"]')].find(node=>node.getClientRects().length):null;
    const action=appTrigger?.dataset.action;
    (calendar || (action?row?.querySelector('[data-action="'+action+'"]') || row:row || appGet('open-create-modal-btn')))?.focus();
}
function appRenderView(task) {
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
function appUpdateUrl(id, push=false) {
    const url=new URL(location.href);
    if(id)url.searchParams.set('task',id);else url.searchParams.delete('task');
    if(push)history.pushState({...history.state,appTaskOverlay:true},'',url);else history.replaceState(history.state,'',url);
}
function appSetMode(mode) {
    appMode=mode;
    appGet('app-task-dialog')?.setAttribute('data-app-task-mode', mode);
    appText('app-mobile-task-heading',mode === 'edit' ? 'Edit Task' : 'Task details');
    const view=appGet('app-view-panel'), form=appGet('edit-task-form');
    if(view)view.hidden=mode!=='view';if(form)form.hidden=mode!=='edit';
    const confirmation=appGet('app-drawer-delete');if(confirmation)confirmation.hidden=true;
    const discard=appGet('app-discard');if(discard)discard.hidden=true;
}
export function appOpenTask(id, { edit=false, fromUrl=false, trigger=document.activeElement } = {}) {
    const task=appTaskState.tasks.find(task=>String(task.id)===String(id));
    if(!task){appToast('That task is unavailable.','error');appUpdateUrl(null);return;}
    appActive=task.id;appTrigger=trigger;appRenderView(task);appSetMode('view');
    const modal=appGet('app-task-dialog');
    if(!modal)return;
    if(!fromUrl)appUpdateUrl(task.id,!modal.open&&!new URL(location.href).searchParams.has('task'));
    if(!modal.open)modal.showModal();
    if(edit)appEditTask();else appGet('detail-edit-btn')?.focus();
}
function appCloseTask() {
    if(appSaving&&appMode==='edit')return;
    appGet('app-task-dialog')?.close();
    if(history.state?.appTaskOverlay&&new URL(location.href).searchParams.has('task'))history.back();
    else appUpdateUrl(null);
}
function appGuard(action, keepAction = null) {
    if(appSaving&&appMode==='edit')return;
    if(appMode!=='edit'||!Object.keys(appChanges()).length){action();return;}
    appDiscardAction=action;
    appKeepAction=keepAction;
    const bar=appGet('app-discard');if(bar)bar.hidden=false;
    appGet('app-keep-editing')?.focus();
}
function appEditTask() {
    const task=appTaskState.tasks.find(task=>task.id===appActive);if(!task)return;
    appSnapshot={title:task.title.trim(),description:task.description || '',priority:task.priority,due_date:appDateInput(task.due_date),stage:task.stage || 'todo'};
    for(const [key,value] of Object.entries(appSnapshot)){
        const field=appGet(key==='title'?'edit-title':key==='description'?'edit-description':'app-edit-'+(key==='due_date'?'due':key));
        if(field)field.value=value;
    }
    const form=appGet('edit-task-form');if(form?.elements['edit-priority'])form.elements['edit-priority'].value=task.priority;
    const stage=appGet('app-edit-stage');if(stage)stage.disabled=task.status==='completed';
    appError('edit');appSetMode('edit');appCounter('edit');
    const appDue = appGet('app-edit-due'); if (appDue) appDue.min = appMinimumDueDate(document.querySelector('meta[name="app-timezone"]')?.content || 'UTC');
    appGet('app-task-dialog')?.setAttribute('aria-labelledby','edit-heading');appGet('edit-title')?.focus();appCounter('edit');
}
export function appOpenCreate(stage='todo', { due_date=null, trigger=document.activeElement }={}) {
    const form=appGet('task-form'),modal=appGet('create-modal');if(!form||!modal)return;
    form.reset();appCreatedStage=stage;
    const select=appGet('app-create-stage');if(select)select.value=stage==='completed'?'todo':stage;
    const due=appGet('app-create-due');if(due){due.min=appMinimumDueDate(document.querySelector('meta[name="app-timezone"]')?.content || 'UTC');due.value=due_date || '';}
    appTrigger=trigger;appError('create');appCounter('create');appText('title-count','0/255');
    if(!modal.open)modal.showModal();appGet('title')?.focus();appCounter('create');
}
export function appOpenDelete(id) {
    const task=appTaskState.tasks.find(task=>String(task.id)===String(id));if(!task)return;
    appActive=task.id;appTrigger=document.activeElement;appText('delete-task-title',task.title);appGet('delete-modal')?.showModal();
}
export async function appToggleTask(id) {
    const task=appTaskState.tasks.find(task=>String(task.id)===String(id));if(!task)return;
    await appTaskState.move(id,task.status==='completed'?'todo':'completed');
    appToast(task.status==='completed'?'Task reopened.':'Task completed.');
}
export function appRefreshTaskPresentation() {
    const task = appTaskState.tasks.find(task => task.id === appActive);
    if (!task || !appGet('app-task-dialog')?.open) return;
    appRenderView(task);
    if (appMode === 'edit') appGet('app-task-dialog')?.setAttribute('aria-labelledby', 'edit-heading');
}
export function appInitDialogs() {
    const view=appGet('app-task-dialog'),create=appGet('create-modal');
    appGet('open-create-modal-btn')?.addEventListener('click',()=>appOpenCreate());
    for(const id of ['cancel-create-button','close-create-modal'])appGet(id)?.addEventListener('click',()=>create?.close());
    appGet('task-form')?.addEventListener('input',()=>{appText('title-count',(appGet('title')?.value.length || 0)+'/255');appCounter('create');});
    appGet('task-form')?.addEventListener('submit',async event=>{
        event.preventDefault();if(appSaving)return;
        const values=appValues('create'), button=appGet('submit-button');appSaving=true;if(button)button.disabled=true;appError('create');
        try{
            const task=await appTaskState.mutate(APP_API.tasks,'POST',{...values,description:values.description || null,due_date:values.due_date || null});
            if(appCreatedStage==='completed')await appTaskState.mutate('/api/tasks/'+task.id+'/complete','PATCH');
            create?.close();appToast('Task created.');
        }catch(error){appError('create',error);}finally{appSaving=false;if(button)button.disabled=false;}
    });
    appGet('edit-task-form')?.addEventListener('input',()=>appCounter('edit'));
    appGet('edit-task-form')?.addEventListener('submit',async event=>{
        event.preventDefault();const changes=appChanges();if(appSaving||!Object.keys(changes).length)return;
        appSaving=true;appCounter('edit');appError('edit');
        try{await appTaskState.mutate('/api/tasks/'+appActive,'PATCH',changes);appSetMode('view');const task=appTaskState.tasks.find(task=>task.id===appActive);if(task)appRenderView(task);appToast('Changes saved.');appGet('detail-edit-btn')?.focus();}
        catch(error){if(error.status===404){view?.close();appUpdateUrl(null);appToast('This task was deleted or is no longer available.','error');await appTaskState.load({force:true}).catch(()=>{});}else appError('edit',error);}
        finally{appSaving=false;appCounter('edit');}
    });
    appGet('cancel-edit-button')?.addEventListener('click',()=>appGuard(()=>{appSetMode('view');const task=appTaskState.tasks.find(task=>task.id===appActive);if(task)appRenderView(task);appGet('detail-edit-btn')?.focus();}));
    appGet('detail-edit-btn')?.addEventListener('click',appEditTask);
    appGet('detail-close-btn')?.addEventListener('click',()=>appGuard(appCloseTask));
    appGet('detail-delete-btn')?.addEventListener('click',()=>{const bar=appGet('app-drawer-delete');if(bar)bar.hidden=false;appGet('app-cancel-drawer-delete')?.focus();});
    appGet('app-cancel-drawer-delete')?.addEventListener('click',()=>{const bar=appGet('app-drawer-delete');if(bar)bar.hidden=true;appGet('detail-delete-btn')?.focus();});
    appGet('app-confirm-drawer-delete')?.addEventListener('click',async event=>{if(appSaving)return;appSaving=true;event.currentTarget.disabled=true;try{await appTaskState.mutate('/api/tasks/'+appActive,'DELETE');view?.close();appUpdateUrl(null);appToast('Task deleted.');}catch(error){appToast(error.message,'error');}finally{appSaving=false;appGet('app-confirm-drawer-delete')?.removeAttribute('disabled');}});
    for(const [id,stage] of [['app-detail-start','in_progress'],['app-detail-review','review']])appGet(id)?.addEventListener('click',async event=>{if(appSaving)return;appSaving=true;event.currentTarget.disabled=true;try{await appTaskState.move(appActive,stage);appToast('Moved to '+appLabels[stage]+'.');}catch(error){appToast(error.message,'error');}finally{appSaving=false;appGet(id)?.removeAttribute('disabled');}});
    appGet('app-clear-due')?.addEventListener('click',()=>{const field=appGet('app-edit-due');if(field)field.value='';appCounter('edit');});
    appGet('detail-complete-btn')?.addEventListener('click',async event=>{if(appSaving)return;appSaving=true;event.currentTarget.disabled=true;try{await appToggleTask(appActive);}catch(error){appToast(error.message,'error');}finally{appSaving=false;appGet('detail-complete-btn')?.removeAttribute('disabled');}});
    appGet('confirm-delete-button')?.addEventListener('click',async event=>{if(appSaving)return;appSaving=true;event.currentTarget.disabled=true;try{await appTaskState.mutate('/api/tasks/'+appActive,'DELETE');appGet('delete-modal')?.close();view?.close();appUpdateUrl(null);appToast('Task deleted.');}catch(error){appToast(error.message,'error');}finally{appSaving=false;appGet('confirm-delete-button')?.removeAttribute('disabled');}});
    view?.addEventListener('cancel',event=>{event.preventDefault();appGuard(appCloseTask);});
    let backdrop=false;view?.addEventListener('pointerdown',event=>{backdrop=event.target===view;});
    view?.addEventListener('click',event=>{const rect=view.getBoundingClientRect();if(backdrop&&event.target===view&&(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom))appGuard(appCloseTask);backdrop=false;});
    for(const modal of [view,create,appGet('delete-modal')])modal?.addEventListener('close',appFocusReturn);
    create?.addEventListener('click',event=>{if(event.target===create&&!appSaving)create.close();});
    for(const id of ['description','edit-description'])appGet(id)?.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key==='Enter'){event.preventDefault();event.currentTarget.closest('form')?.requestSubmit();}});
    const bar=document.createElement('div');bar.id='app-discard';bar.className='app-discard';bar.hidden=true;
    const text=document.createElement('p');text.textContent='You have unsaved changes. Discard them?';
    const keep=document.createElement('button'),discard=document.createElement('button');keep.id='app-keep-editing';keep.type=discard.type='button';keep.className='button button-secondary';discard.className='button button-danger';keep.textContent='Keep editing';discard.textContent='Discard changes';
    keep.onclick=()=>{bar.hidden=true;appKeepAction?.();appGet('edit-title')?.focus();};discard.onclick=()=>{bar.hidden=true;appDiscardAction?.();};bar.append(text,keep,discard);appGet('edit-task-form')?.append(bar);
    appTaskState.subscribe(tasks=>{if(!view?.open)return;const task=tasks.find(task=>task.id===appActive);if(task&&appMode==='view')appRenderView(task);else if(!task&&!appSaving){view.close();appUpdateUrl(null);appToast('This task is no longer available.','error');}});
    const sync=()=>{const id=new URL(location.href).searchParams.get('task');if(id&&appTaskState.loaded){if(!view?.open)appOpenTask(id,{fromUrl:true});else if(String(id)!==String(appActive))appGuard(()=>appOpenTask(id,{fromUrl:true}),()=>appUpdateUrl(appActive,true));}else if(!id&&view?.open)appGuard(()=>view.close(),()=>appUpdateUrl(appActive,true));};
    window.addEventListener('popstate',sync);
    let first=true;appTaskState.subscribe(()=>{if(first){first=false;sync();}});
}
