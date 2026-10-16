# Simple Task Tracker

A lightweight task management web application built with Laravel. The application allows users to create, edit, complete, delete, filter, and search tasks while displaying basic task statistics.

## Features

* Create tasks with:

  * Title
  * Description
  * Priority
* Task priorities:

  * High
  * Medium
  * Low
* Task statuses:

  * Pending
  * Completed
* Edit existing tasks
* Mark tasks as completed without a full-page refresh
* Delete tasks without a full-page refresh
* Filter tasks by:

  * All Tasks
  * Pending
  * Completed
* Search task titles and descriptions
* Display task statistics:

  * Total tasks
  * Pending tasks
  * Completed tasks
  * Completion rate
* Light and dark mode
* Responsive frontend interface
* Task sorting by priority and creation date

## Technology Stack

### Backend

* PHP 8.5+
* Laravel
* MySQL
* RESTful API

### Frontend

* Blade
* HTML
* CSS
* JavaScript
* Vite

### Testing

* PHPUnit
* Laravel Feature Tests

## Requirements

Before running the application, make sure the following are installed:

* PHP 8.5 or later
* Composer
* Node.js and npm
* MySQL
* Git

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Wilsonsedurifa/simple-task-tracker.git
cd simple-task-tracker
```

### 2. Install PHP dependencies

```bash
composer install
```

### 3. Install frontend dependencies

```bash
npm install
```

### 4. Create the environment file

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Or on Git Bash/Linux/macOS:

```bash
cp .env.example .env
```

### 5. Generate the Laravel application key

```bash
php artisan key:generate
```

### 6. Configure the database

Create a MySQL database for the application.

Then update the database settings in `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

Replace the values with your local MySQL credentials.

### 7. Run database migrations

```bash
php artisan migrate
```

### 8. Start the Laravel development server

Open a terminal and run:

```bash
php artisan serve
```

The application will normally be available at:

```text
http://127.0.0.1:8000
```

### 9. Start Vite

Open another terminal in the project directory:

```bash
npm run dev
```

Then access the task tracker:

```text
http://127.0.0.1:8000/tasks
```

## API Endpoints

The application provides the following RESTful API endpoints.

| Method | Endpoint                      | Description              |
| ------ | ----------------------------- | ------------------------ |
| GET    | `/api/tasks`                  | Get all tasks            |
| GET    | `/api/tasks?status=pending`   | Get pending tasks        |
| GET    | `/api/tasks?status=completed` | Get completed tasks      |
| POST   | `/api/tasks`                  | Create a new task        |
| PATCH  | `/api/tasks/{id}`             | Update a task            |
| PATCH  | `/api/tasks/{id}/complete`    | Mark a task as completed |
| DELETE | `/api/tasks/{id}`             | Delete a task            |

### Create Task

`POST /api/tasks`

Example request:

```json
{
    "title": "Complete assessment",
    "description": "Finish the Simple Task Tracker assessment",
    "priority": "high"
}
```

The title is required and the priority must be one of:

```text
low
medium
high
```

### Complete Task

`PATCH /api/tasks/{id}/complete`

This changes the selected task's status to:

```text
completed
```

### Delete Task

`DELETE /api/tasks/{id}`

Deletes the selected task from the database.

## HTTP Status Codes

The API uses the following response codes:

| Status Code | Meaning                        |
| ----------- | ------------------------------ |
| 200         | Request completed successfully |
| 201         | Resource created successfully  |
| 400         | Invalid input                  |
| 404         | Task not found                 |

## Core PHP Logic

The required standalone sorting logic is located in:

```text
src/TaskSorter.php
```

The class provides:

```php
public function sortTasks(array $tasks): array
```

Tasks are sorted using the following rules:

1. High priority comes before medium priority.
2. Medium priority comes before low priority.
3. When two tasks have the same priority, the older `created_at` timestamp comes first.

This sorting logic is implemented independently from Laravel framework helpers as required by the assessment.

## Testing

Run the complete test suite with:

```bash
php artisan test
```

The project includes tests for the required task sorting logic and API behavior.

The core sorter tests are located at:

```text
tests/TaskSorterTest.php
```

The API feature tests are located at:

```text
tests/Feature/Api/TaskApiTest.php
```

The tests cover functionality including:

* Priority sorting
* Date-based secondary sorting
* Task creation
* Input validation
* Task filtering
* Task editing
* Task completion
* Task deletion
* Handling missing tasks

## Task Sorting Rules

The application follows this priority order:

```text
High
  ↓
Medium
  ↓
Low
```

When tasks have the same priority, the task with the older creation timestamp is displayed first.

## Project structure

```text
resources/js/
  tasks.js                   app boot + dynamic active-page imports
  core/                      API/CSRF, single task state, dates, DOM/icons, storage, toast, constants
  shell/                     appearance, navigation/logout, preferences, search, mobile shell, offline/auth
  pages/                     Tasks, Dashboard, Calendar and Settings controllers
  features/
    board/                   ordered columns, native drag/drop, keyboard Move menu
    tasks/                   rows, list grouping, visibility filters
    task-dialog/             shared task lifecycle and view rendering
    dashboard/               data, chart, side rows, Quick add
    calendar/                data, local-date labels, month/week/day rendering
    notifications/           shared bell/feed, derived items and per-user read/Welcome state
    pet/                     shared widgets, original SVG art and pure mood/badge data
    settings/                sections, preferences, field errors, account, exports and bulk actions
    mobile/                  reusable sheets/cards and screen adapters
resources/css/
  tasks.css                  ordered @imports ONLY; numeric prefixes preserve the original cascade
  base/ themes/ layout/ components/ features/ mobile/
resources/views/
  layouts/                   workspace, auth and error layouts
  partials/                  page title, toast and shared create/delete/details/logout dialogs
  tasks/                     page composition + dashboard/settings section partials
  tasks/partials/            shell, mobile, appearance, notification and pet markup
  auth/ errors/ components/  existing public views and reusable components
app/
  Http/Controllers/          HTTP orchestration
  Http/Requests/             validation; JsonFormRequest preserves the existing 400 payload
  Http/Resources/            unwrapped TaskResource, retaining every model field and cast
  Services/                  task ordering/mutations, pet XP, Google account/auth processing
  Models/                    existing models; task owner scope
routes/
  web.php                    public/authenticated page groups, flow and error routes
  auth.php tasks.php pets.php feature route definitions loaded within the original middleware groups
tests/
  Feature/Api/ Feature/Pages/ organized, unchanged existing feature tests + contract characterization
  Unit/ TaskSorterTest.php   existing unit coverage
  browser/                   whole-app interactions, pure helpers, inventory and pixel comparisons
```

Conventions:

- Add a page's Blade view to the existing workspace layout, then register its named initializer in `tasks.js` only when page-specific JS is needed. Keep shared notifications, pet rewards and dialogs subscribed to the same task store; do not fetch tasks again from a widget.
- Put reusable behavior in the matching feature directory and import named exports. Modules must not query DOM or fetch on import; initialize explicitly, null-guard page hooks and isolate initialization failures. Do not introduce `window` globals or circular imports.
- Reuse `core/api.js` for CSRF/auth/offline behavior, `core/toast.js` for feedback, `core/storage.js` for guarded persistence, and `core/dom.js` for safe text/DOM/SVG construction. Never render user input as HTML or sort the server task array in the client.
- Parse date-only values through `core/dates.js`; timestamps and date-only values intentionally have different local-time semantics.
- Add styles to an appropriate partial, with colors/fonts/radii/shadows through existing tokens. Keep the numbered import order, including late overrides: moving a rule to an earlier conceptual category can change the cascade. No inline Blade styling or extra CSS/JS app entries.
- Keep Blade IDs/classes/data hooks intact; extract a partial/component rather than duplicating a dialog. Preserve auth flow and exact API serialization/validation messages when editing PHP.
- Prefer focused files around 200 JS / 250 CSS / 150 Blade / 120 controller lines. Several closure-based initializers still exceed the approximate 40-line function target; see the explicit audit exceptions in `docs/REFACTOR_REPORT.md`.
- Legacy Vite app/auth entries are retained unchanged for compatibility; the workspace/auth layouts use only `tasks.css` and `tasks.js`. Marketing keeps its separate landing entries. No dependencies changed.

Verification:

```powershell
npm run build
php artisan test
node tests/browser/task-dates.mjs
node tests/browser/dashboard-data.mjs
node tests/browser/calendar-data.mjs
node tests/browser/notification-data.mjs
node tests/browser/pet-data.mjs
# With an already-installed Playwright runtime (no npm dependency added):
node tests/browser/workspace.mjs
$env:REFACTOR_PHASE='review'
node tests/browser/refactor-visual.mjs
```

The optional browser scripts accept `PLAYWRIGHT_MODULE_PATH`. They use isolated SQLite databases under ignored `storage/app`, not the development database. Visual comparison needs the local before screenshots; use `--record` only when deliberately establishing a new baseline, never to hide a regression. Inventory: `node tests/browser/refactor-inventory.mjs docs/REFACTOR_AFTER.json`.

See [refactor plan](docs/REFACTOR_PLAN.md), [baseline inventory](docs/REFACTOR_BASELINE.json), [after inventory](docs/REFACTOR_AFTER.json), and [refactor report](docs/REFACTOR_REPORT.md).

## AI Disclosure

AI tools were used during the development of this project.

### AI Tool Used

* OpenAI Codex

### Areas Assisted by AI

AI assistance was used for selected development and documentation tasks, including:

* Reviewing and explaining Laravel code
* Assisting with Laravel API implementation and validation
* Reviewing route and controller logic
* Assisting with the task model and factory
* Assisting with PHPUnit and Laravel feature tests
* Reviewing the `TaskSorter` test implementation
* Debugging development errors
* Reviewing frontend Blade and JavaScript implementation
* Improving and organizing project documentation
* Reviewing code structure and suggesting improvements

AI assistance was used as a development aid and code-review tool rather than as a replacement for understanding the submitted project.

### Human Review and Changes

AI-generated or AI-assisted suggestions were reviewed and adapted to the actual project requirements.

The following were performed during development:

* Reviewed the generated code before including it in the project
* Tested the application locally
* Tested API endpoints and validation behavior
* Verified the task sorting behavior
* Ran the automated test suite
* Fixed development and implementation issues
* Adjusted API responses to follow the assessment's required HTTP status codes
* Checked the implementation against the provided assessment requirements
* Reviewed the frontend behavior and user interactions
* Updated the README to accurately describe the final implementation

### Developer Responsibility

I understand the submitted code and remain responsible for the implementation.

AI-generated suggestions were not treated as automatically correct. Code was reviewed, tested, modified where necessary, and integrated into the project based on the assessment requirements.

I am prepared to explain the implementation, including:

* The `TaskSorter` sorting logic
* Laravel API routes
* Request validation
* Database persistence
* Task status updates
* Frontend API requests
* PHPUnit tests
* Task filtering and statistics

## Notes

This project is intended to be run locally for assessment purposes.

No production hosting or deployment is required by the project setup instructions.

## Repository

GitHub Repository:

https://github.com/Wilsonsedurifa/simple-task-tracker
