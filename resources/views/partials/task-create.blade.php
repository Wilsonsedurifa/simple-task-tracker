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
