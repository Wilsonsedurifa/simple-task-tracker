<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Simple Task Tracker</title>

    @vite(['resources/css/tasks.css', 'resources/js/tasks.js'])
</head>

<body>
    <div class="container">

        <header class="header">
            <h1>Simple Task Tracker</h1>
            <p>Create, manage, and track your tasks.</p>
        </header>

        <section class="card">
            <h2>Create Task</h2>

            <form id="task-form">

                <div class="form-group">
                    <label for="title">Title</label>

                    <input
                        type="text"
                        id="title"
                        placeholder="Enter task title"
                        required
                    >
                </div>

                <div class="form-group">
                    <label for="description">Description</label>

                    <textarea
                        id="description"
                        placeholder="Enter task description"
                    ></textarea>
                </div>

                <div class="form-row">

                    <div class="form-group">
                        <label for="priority">Priority</label>

                        <select id="priority">
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="status-filter">Filter Tasks</label>

                        <select id="status-filter">
                            <option value="">All</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                </div>

                <button
                    type="submit"
                    class="button button-primary"
                >
                    Add Task
                </button>

            </form>
        </section>

        <section class="card">
            <div class="tasks-header">
                <h2>Tasks</h2>
            </div>

            <div id="task-list"></div>
        </section>

    </div>

    <dialog id="delete-modal" class="delete-modal">
        <form method="dialog" class="delete-modal-content">

            <h2>Delete Task?</h2>

            <p>
                Are you sure you want to delete this task?
                This action cannot be undone.
            </p>

            <div class="modal-actions">
                <button
                    type="submit"
                    class="button button-secondary"
                >
                    Cancel
                </button>

                <button
                    id="confirm-delete-button"
                    type="button"
                    class="button button-danger"
                >
                    Yes, Delete
                </button>
            </div>

        </form>
    </dialog>
</body>
</html>

