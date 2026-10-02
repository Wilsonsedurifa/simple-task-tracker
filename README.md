# Simple Task Tracker

A lightweight Laravel task manager for creating tasks, assigning a priority, completing work, filtering by status, and viewing completion statistics.

## Features

- Create tasks with a required title, optional description, and low, medium, or high priority.
- Edit a task's title, description, and priority without changing its completion status.
- View tasks ordered by priority, then oldest creation date.
- Complete and delete tasks without a full-page refresh.
- Filter the list by all, pending, or completed tasks.
- Search task titles and descriptions within the selected status filter.
- View total, pending, completed, and completion-rate statistics.
- Use light or dark mode; the selected theme is remembered in the browser.

## Requirements

- PHP 8.5+
- Composer
- Node.js and npm
- MySQL

## Local setup

1. Clone the repository and enter it.

   ```bash
   git clone <repository-url>
   cd simple-task-tracker
   ```

2. Install the PHP and JavaScript dependencies.

   ```bash
   composer install
   npm install
   ```

3. Copy the environment file and create an application key.

   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

   On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp`.

4. Set the `DB_*` values in `.env` for a MySQL database, then run the migrations.

   ```bash
   php artisan migrate
   ```

5. Start the app and Vite in separate terminals.

   ```bash
   php artisan serve
   npm run dev
   ```

6. Open `http://127.0.0.1:8000/tasks`.

For a production asset build, run `npm run build`.

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/tasks?status=pending` | Lists tasks; `status` is optional (`pending` or `completed`). |
| POST | `/api/tasks` | Creates a task with `title`, optional `description`, and `priority`. |
| PATCH | `/api/tasks/{id}` | Updates a task's title, description, and priority. |
| PATCH | `/api/tasks/{id}/complete` | Marks a task as completed. |
| DELETE | `/api/tasks/{id}` | Deletes a task. |

The API returns `201` for a created task, `200` for successful reads/updates/deletes, `400` for invalid task input, and `404` when a task does not exist.

## Tests

```bash
php artisan test --compact
```

`tests/TaskSorterTest.php` verifies the required `TaskSorter::sortTasks()` priority and date ordering. `tests/Feature/TaskApiTest.php` covers task creation, editing, validation, filtering, completion, deletion, and missing-task responses.

## Technical decisions

- Pending tasks are ordered before completed tasks so the next actionable work stays visible first. Within each group, high-priority tasks appear before medium and low priorities, then older tasks come first.
- Completed tasks are visually separated and subdued instead of removed, preserving task history without distracting from active work.
- The API returns `400` for invalid input to match the assessment specification. Validated data is the only data passed to the model for persistence.
- Task text is escaped before it is rendered in the browser, preventing task titles and descriptions from being interpreted as HTML.
- The UI works without a page refresh. Search is client-side because this lightweight tracker already loads its task list, while the `N` keyboard shortcut focuses the new-task title field when the user is not typing in another control.

## AI Disclosure

AI assistance was used through OpenAI Codex to review and refine this project.

- Assisted areas: Laravel API validation and route model binding, the `Task` factory and feature tests, sorter-test naming/registration, README documentation, and a review of the existing Blade/vanilla-JavaScript UI.
- Human review and changes: the generated suggestions were checked against Laravel 13 documentation and the existing project structure; the API behavior was aligned to the assignment's required status codes; the existing UI was retained as the active `/tasks` experience; and the resulting PHP code was formatted and tested.
- Responsibility: every submitted file should be reviewed and understood by the repository owner before submission.
