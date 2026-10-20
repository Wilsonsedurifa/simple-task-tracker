    <dialog id="app-task-dialog" class="modal app-task-drawer" aria-labelledby="detail-title">
        <header class="app-drawer-header">
            <div class="app-drawer-heading"><div><span class="app-drawer-eyebrow">Task details</span><h2 id="detail-title">Task details</h2></div><button type="button" id="detail-close-btn" class="app-task-action" aria-label="Close details"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 6 12 12 M18 6 6 18"/></svg></button></div>
            <div class="app-drawer-menu"><button type="button" id="app-detail-menu" class="app-task-action" aria-label="Task actions" aria-expanded="false">•••</button><div id="app-detail-menu-items" class="app-detail-menu-items" hidden><button type="button" id="detail-edit-btn">Edit task</button><button type="button" id="app-share-task">Share</button><button type="button" id="detail-delete-btn" class="app-detail-delete">Delete task</button></div></div>
        </header>
        <div class="app-drawer-body">
            <section id="app-view-panel" aria-label="Task information">
                <div id="app-status-stepper" class="app-status-stepper" role="group" aria-label="Task progress"><button type="button" data-stage="todo">To do</button><button type="button" data-stage="in_progress">In progress</button><button type="button" data-stage="review">Review</button><button type="button" data-stage="completed">Done</button></div>
                <section class="app-detail-section"><h3>Description</h3><p id="detail-description" class="app-detail-description"></p></section>
                <section class="app-detail-section">
                <h3>Properties</h3>
                <dl class="app-detail-properties">
                    <div><dt>Priority</dt><dd id="app-detail-priority"></dd></div>
                    <div><dt>Due date</dt><dd id="app-detail-due"></dd></div>
                    <div><dt>Created</dt><dd id="detail-created-date"></dd></div>
                    <div><dt>Completed</dt><dd id="app-detail-completed"></dd></div>
                </dl>
                </section>
                <section class="app-detail-section"><div class="app-section-heading"><h3>Collaborators</h3><button type="button" id="app-detail-invite" class="app-link-button">Invite</button></div><div id="app-detail-collaborators" class="app-detail-collaborators"><p>Loading collaborators…</p></div></section>
                <section id="app-drawer-delete" class="app-drawer-confirm" aria-labelledby="app-drawer-delete-heading" hidden><h3 id="app-drawer-delete-heading">Delete this task?</h3><p>This cannot be undone.</p><button type="button" id="app-cancel-drawer-delete" class="button button-secondary">Keep task</button><button type="button" id="app-confirm-drawer-delete" class="button button-danger">Yes, delete</button></section>
            </section>
            <form id="edit-task-form" hidden novalidate>
                <h3 id="edit-heading">Edit task</h3>
                <div id="edit-form-error" class="alert alert-error" role="alert" hidden></div>
                <div class="field"><label class="label" for="edit-title">Title</label><input id="edit-title" class="input" type="text" maxlength="255" required></div>
                <div class="field"><label class="label" for="edit-description">Description (optional)</label><textarea id="edit-description" maxlength="1000" class="input app-auto-grow" rows="4" aria-describedby="app-edit-description-count"></textarea><span id="app-edit-description-count" class="field-hint">0/1000</span></div>
                <fieldset class="field"><legend class="label">Priority</legend><div class="priority-picker">
                    @foreach (['low' => 'Low', 'medium' => 'Medium', 'high' => 'High'] as $value => $label)
                    <label class="priority-option priority-option-{{ $value }}"><input type="radio" name="edit-priority" value="{{ $value }}"><span>{{ $label }}</span></label>
                    @endforeach
                </div></fieldset>
                <div class="field"><div class="field-label-row"><label class="label" for="app-edit-due">Due date</label><button type="button" id="app-clear-due" class="app-clear-filters">Clear</button></div><input id="app-edit-due" class="input" type="date"></div>
                <div class="field"><label class="label" for="app-edit-stage">Stage</label><select id="app-edit-stage" class="input"><option value="todo">To do</option><option value="in_progress">In progress</option><option value="review">Review</option></select><p class="field-hint">Reopen a completed task before changing its stage.</p></div>
                <div class="app-edit-actions"><button type="button" id="cancel-edit-button" class="button button-secondary">Cancel</button><button type="submit" id="save-edit-button" class="button button-primary" disabled>Save changes</button></div>
            </form>
        </div>
        <footer id="app-detail-footer" class="app-detail-footer"><button type="button" id="detail-complete-btn" class="button button-primary button-block"><span id="detail-complete-text">Start task</span></button></footer>
    </dialog>
