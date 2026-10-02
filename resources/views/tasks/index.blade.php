<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Simple Task Tracker</title>

    <script>
        // Set the theme before first paint so dark mode does not flash.
        (function () {
            var theme = null;

            try {
                theme = localStorage.getItem('task-tracker-theme');
            } catch (e) {}

            if (!theme) {
                theme = window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? 'dark'
                    : 'light';
            }

            document.documentElement.dataset.theme = theme;
        })();
    </script>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

    @vite(['resources/css/tasks.css', 'resources/js/tasks.js'])
</head>

<body>
    <header class="app-header">
        <div class="app-header-inner">
            <div class="brand">
                <span class="brand-logo" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                </span>

                <div class="brand-text">
                    <h1 class="brand-title">Simple Task Tracker</h1>
                    <p class="brand-subtitle">Create, manage, and track your tasks.</p>
                </div>
            </div>

            <button
                type="button"
                id="theme-toggle"
                class="icon-button theme-toggle"
                aria-label="Switch to dark mode"
            >
                <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
            </button>
        </div>
    </header>

    <main class="container">

        <section class="stats" aria-label="Task statistics">
            <div class="stat stat-total">
                <div class="stat-head">
                    <span class="stat-label">Total tasks</span>
                    <span class="stat-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                    </span>
                </div>
                <span class="stat-value" id="stat-total">0</span>
            </div>

            <div class="stat stat-pending">
                <div class="stat-head">
                    <span class="stat-label">Pending</span>
                    <span class="stat-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    </span>
                </div>
                <span class="stat-value" id="stat-pending">0</span>
            </div>

            <div class="stat stat-completed">
                <div class="stat-head">
                    <span class="stat-label">Completed</span>
                    <span class="stat-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
                    </span>
                </div>
                <span class="stat-value" id="stat-completed">0</span>
            </div>

            <div class="stat stat-rate">
                <div class="stat-head">
                    <span class="stat-label">Completion rate</span>
                    <span class="stat-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 7l-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/></svg>
                    </span>
                </div>
                <span class="stat-value" id="stat-rate">0%</span>
                <div
                    id="progress"
                    class="progress"
                    role="progressbar"
                    aria-label="Completion rate"
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-valuenow="0"
                >
                    <div id="progress-bar" class="progress-bar"></div>
                </div>
            </div>
        </section>

        <div class="layout">

            <section class="panel panel-sticky" aria-labelledby="create-heading">
                <h2 class="panel-title" id="create-heading">Create task</h2>
                <p class="panel-subtitle">Add something new to your list.</p>

                <div id="form-error" class="alert alert-error" role="alert" hidden></div>

                <form id="task-form" novalidate>

                    <div class="field">
                        <div class="field-label-row">
                            <label class="label" for="title">Title</label>
                            <span class="field-hint" id="title-count">0/255</span>
                        </div>

                        <input
                            type="text"
                            id="title"
                            name="title"
                            class="input"
                            placeholder="e.g. Finish API documentation"
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
                            id="description"
                            name="description"
                            class="input"
                            placeholder="Add more details..."
                        ></textarea>
                    </div>

                    <fieldset class="field">
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

                    <button
                        type="submit"
                        id="submit-button"
                        class="button button-primary button-block"
                    >
                        Add task
                    </button>

                </form>
            </section>

            <section class="panel" aria-labelledby="tasks-heading">
                <div class="panel-header">
                    <div>
                        <h2 class="panel-title" id="tasks-heading">Tasks</h2>
                        <p id="task-summary" class="task-summary" aria-live="polite">Loading your workspace...</p>
                    </div>

                    <div class="task-controls">
                        <label class="task-search" for="task-search">
                            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="6"/><path d="m20 20-4.35-4.35"/></svg>
                            <input id="task-search" type="search" placeholder="Search tasks" autocomplete="off">
                        </label>

                        <div class="tabs" role="group" aria-label="Filter tasks">
                            <button type="button" class="tab is-active" aria-pressed="true" data-filter="">
                                All <span class="tab-count" id="count-all">0</span>
                            </button>

                            <button type="button" class="tab" aria-pressed="false" data-filter="pending">
                                Pending <span class="tab-count" id="count-pending">0</span>
                            </button>

                            <button type="button" class="tab" aria-pressed="false" data-filter="completed">
                                Completed <span class="tab-count" id="count-completed">0</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div id="list-error" class="alert alert-error" role="alert" hidden></div>

                <div id="task-list" class="task-list" aria-live="polite"></div>
            </section>

        </div>
    </main>

    <dialog id="delete-modal" class="modal" aria-labelledby="delete-heading">
        <form method="dialog" class="modal-body">

            <div class="modal-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></svg>
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

    <dialog id="edit-modal" class="modal" aria-labelledby="edit-heading">
        <form id="edit-task-form" class="edit-modal-body" novalidate>
            <div class="edit-modal-heading">
                <p class="eyebrow">TASK DETAILS</p>
                <h2 class="modal-title" id="edit-heading">Edit task</h2>
                <p class="modal-text">Update the details without changing its completion status.</p>
            </div>

            <div id="edit-form-error" class="alert alert-error" role="alert" hidden></div>

            <div class="field">
                <label class="label" for="edit-title">Title</label>
                <input id="edit-title" class="input" type="text" maxlength="255" required>
            </div>

            <div class="field">
                <label class="label" for="edit-description">Description <span class="optional">(optional)</span></label>
                <textarea id="edit-description" class="input" placeholder="Add more details..."></textarea>
            </div>

            <fieldset class="field">
                <legend class="label">Priority</legend>

                <div class="priority-picker">
                    <label class="priority-option priority-option-low">
                        <input type="radio" name="edit-priority" value="low">
                        <span>Low</span>
                    </label>

                    <label class="priority-option priority-option-medium">
                        <input type="radio" name="edit-priority" value="medium">
                        <span>Medium</span>
                    </label>

                    <label class="priority-option priority-option-high">
                        <input type="radio" name="edit-priority" value="high">
                        <span>High</span>
                    </label>
                </div>
            </fieldset>

            <div class="modal-actions">
                <button type="button" id="cancel-edit-button" class="button button-secondary">Cancel</button>
                <button type="submit" id="save-edit-button" class="button button-primary">Save changes</button>
            </div>
        </form>
    </dialog>

    <div id="toasts" class="toasts" aria-live="polite"></div>
</body>
</html>
