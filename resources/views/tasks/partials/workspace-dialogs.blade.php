<dialog id="create-modal" class="modal" aria-labelledby="create-heading">
        <div class="modal-body modal-body-md">
            <div class="modal-header-row">
                <div>
                    <h2 class="modal-title" id="create-heading">Add New Task</h2>
                    <p class="modal-text">Create and schedule a task for your workspace.</p>
                </div>
                <button type="button" id="close-create-modal" class="modal-close-icon" aria-label="Close modal">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>

            <div id="form-error" class="alert alert-error" role="alert" hidden></div>

            <form id="task-form" novalidate>
                <div class="field">
                    <div class="field-label-row">
                        <label class="label" for="title">Title *</label>
                        <span class="field-hint" id="title-count">0/255</span>
                    </div>

                    <input
                        type="text"
                        id="title"
                        name="title"
                        class="input"
                        placeholder="e.g. Design mobile UI improvements"
                        maxlength="255"
                        autocomplete="off"
                        aria-describedby="title-error"
                        required
                    >

                    <p id="title-error" class="field-error" role="alert" hidden></p>
                </div>

                <div class="field">
                    <label class="label" for="description">
                        Description <span class="optional">(optional)</span>
                    </label>

                    <textarea
                        maxlength="1000" id="description" aria-describedby="app-create-description-count"
                        name="description"
                        class="input"
                        rows="3"
                        placeholder="Add more details, objectives, or instructions..."
                    ></textarea>
                </div>

                <div class="field"><div class="app-create-date-label"><label class="label" for="app-create-due">Due date</label><button type="button" id="app-clear-create-due" class="app-clear-filters app-mobile-only">Clear</button></div><input id="app-create-due" class="input" type="date"></div><div class="field"><label class="label" for="app-create-stage">Stage</label><select id="app-create-stage" class="input"><option value="todo">To do</option><option value="in_progress">In progress</option><option value="review">Review</option></select></div><p id="app-create-description-count" class="field-hint" aria-live="polite">0/1000</p><fieldset class="field">
                    <legend class="label">Priority</legend>

                    <div class="priority-picker">
                        <label class="priority-option priority-option-low">
                            <input type="radio" name="priority" value="low">
                            <span>Low</span>
                        </label>

                        <label class="priority-option priority-option-medium">
                            <input type="radio" name="priority" value="medium" checked>
                            <span>Medium</span>
                        </label>

                        <label class="priority-option priority-option-high">
                            <input type="radio" name="priority" value="high">
                            <span>High</span>
                        </label>
                    </div>
                </fieldset>

                <div class="modal-actions">
                    <button type="button" id="cancel-create-button" class="button button-secondary">
                        Cancel
                    </button>

                    <button
                        type="submit"
                        id="submit-button"
                        class="button button-primary"
                    >
                        Create Task
                    </button>
                </div>
            </form>
        </div>
    </dialog>

    <!-- Delete Confirmation Modal -->
    <dialog id="delete-modal" class="modal" aria-labelledby="delete-heading">
        <form method="dialog" class="modal-body">
            <div class="modal-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 6h18"/>
                    <path d="M8 6V4h8v2"/>
                    <path d="M19 6l-1 14H6L5 6"/>
                </svg>
            </div>

            <h2 class="modal-title" id="delete-heading">Delete task?</h2>

            <p class="modal-text">
                Are you sure you want to delete
                <strong id="delete-task-title">this task</strong>?
                This action cannot be undone.
            </p>

            <div class="modal-actions">
                <button type="submit" class="button button-secondary" autofocus>
                    Cancel
                </button>

                <button
                    id="confirm-delete-button"
                    type="button"
                    class="button button-danger"
                >
                    Yes, delete
                </button>
            </div>
        </form>
    </dialog>

    <dialog id="app-task-dialog" class="modal app-task-drawer" aria-labelledby="detail-title">
        <header class="app-drawer-header">
            <div class="app-drawer-heading"><div><span class="app-drawer-eyebrow">Task details</span><h2 id="detail-title">Task details</h2></div><button type="button" id="detail-close-btn" class="app-task-action" aria-label="Close details"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 6 12 12 M18 6 6 18"/></svg></button></div>
            <div class="app-drawer-chips"><span id="detail-status-text" class="app-detail-chip">To do</span><span id="detail-priority-badge" class="badge">Medium</span><span id="detail-tag-badge" class="app-detail-chip">No deadline</span></div>
        </header>
        <div class="app-drawer-body">
            <section id="app-view-panel" aria-label="Task information">
                <h3>Description</h3><p id="detail-description" class="app-detail-description"></p>
                <h3>Properties</h3>
                <dl class="app-detail-properties">
                    <div><dt>Priority</dt><dd id="app-detail-priority"></dd></div>
                    <div><dt>Stage / Status</dt><dd id="app-detail-stage"></dd></div>
                    <div><dt>Due date</dt><dd id="app-detail-due"></dd></div>
                    <div><dt>Created</dt><dd id="detail-created-date"></dd></div>
                    <div><dt>Completed</dt><dd id="app-detail-completed"></dd></div>
                </dl>
                <div class="app-detail-stage-actions"><button type="button" id="app-detail-start" class="button button-secondary">Start</button><button type="button" id="app-detail-review" class="button button-secondary">Send to review</button></div>
                <button type="button" id="detail-complete-btn" class="button button-primary button-block"><span id="detail-complete-text">Mark complete</span></button>
                <div class="app-detail-secondary"><button type="button" id="detail-edit-btn" class="button button-secondary">Edit task</button><button type="button" id="detail-delete-btn" class="button button-danger-outline">Delete</button></div>
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
    </dialog>
