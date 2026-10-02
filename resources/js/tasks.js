const API_URL = "/api/tasks";
const THEME_KEY = "task-tracker-theme";

const ICONS = {
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
    alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v6"/><path d="M12 17h.01"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
    clipboard:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>',
};

const EMPTY_MESSAGES = {
    "": ["No tasks yet", "Create your first task using the form."],
    pending: ["Nothing pending", "You're all caught up."],
    completed: ["No completed tasks", "Completed tasks will show up here."],
};

const taskList = document.getElementById("task-list");
const taskForm = document.getElementById("task-form");
const titleInput = document.getElementById("title");
const titleError = document.getElementById("title-error");
const titleCount = document.getElementById("title-count");
const descriptionInput = document.getElementById("description");
const formError = document.getElementById("form-error");
const listError = document.getElementById("list-error");
const submitButton = document.getElementById("submit-button");
const filterTabs = document.querySelectorAll(".tab");
const taskSearch = document.getElementById("task-search");
const toasts = document.getElementById("toasts");
const themeToggle = document.getElementById("theme-toggle");

const deleteModal = document.getElementById("delete-modal");
const deleteTaskTitle = document.getElementById("delete-task-title");
const confirmDeleteButton = document.getElementById("confirm-delete-button");
const editModal = document.getElementById("edit-modal");
const editTaskForm = document.getElementById("edit-task-form");
const editTitleInput = document.getElementById("edit-title");
const editDescriptionInput = document.getElementById("edit-description");
const editFormError = document.getElementById("edit-form-error");
const cancelEditButton = document.getElementById("cancel-edit-button");
const saveEditButton = document.getElementById("save-edit-button");

const statTotal = document.getElementById("stat-total");
const statPending = document.getElementById("stat-pending");
const statCompleted = document.getElementById("stat-completed");
const statRate = document.getElementById("stat-rate");
const progress = document.getElementById("progress");
const progressBar = document.getElementById("progress-bar");
const taskSummary = document.getElementById("task-summary");

const relativeFormat = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

let currentFilter = "";
let pendingDeleteId = null;
let editingTaskId = null;
let visibleTasks = [];
let latestRequestId = 0;
let searchQuery = "";

/* ---------- Helpers ---------- */

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatFullDate(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

function formatRelativeDate(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    // Never show future times, even if the server clock is slightly ahead.
    const seconds = Math.min(
        0,
        Math.round((date.getTime() - Date.now()) / 1000),
    );

    const units = [
        ["day", 86400],
        ["hour", 3600],
        ["minute", 60],
    ];

    for (const [unit, size] of units) {
        if (Math.abs(seconds) >= size) {
            const amount = Math.round(seconds / size);

            if (unit === "day" && Math.abs(amount) >= 7) {
                return date.toLocaleDateString(undefined, {
                    dateStyle: "medium",
                });
            }

            return relativeFormat.format(amount, unit);
        }
    }

    return "just now";
}

function getErrorMessage(body) {
    if (body && body.errors) {
        const firstField = Object.values(body.errors)[0];

        if (Array.isArray(firstField) && firstField.length > 0) {
            return firstField[0];
        }
    }

    return (body && body.message) || "Something went wrong. Please try again.";
}

function showError(element, message) {
    element.textContent = message;
    element.hidden = false;
}

function clearError(element) {
    element.textContent = "";
    element.hidden = true;
}

function showTitleError(message) {
    showError(titleError, message);
    titleInput.setAttribute("aria-invalid", "true");
}

function clearFormErrors() {
    clearError(titleError);
    clearError(formError);
    titleInput.removeAttribute("aria-invalid");
}

function setLoading(button, isLoading) {
    button.classList.toggle("is-loading", isLoading);
    button.disabled = isLoading;
}

function showToast(message, type = "success") {
    const toast = document.createElement("div");
    const icon = document.createElement("span");
    const text = document.createElement("span");

    toast.className = "toast toast-" + type;
    icon.className = "toast-icon";
    icon.innerHTML = type === "error" ? ICONS.alert : ICONS.check;
    text.textContent = message;

    toast.append(icon, text);
    toasts.appendChild(toast);

    setTimeout(function () {
        toast.classList.add("is-leaving");
    }, 2800);

    setTimeout(function () {
        toast.remove();
    }, 3100);
}

/* ---------- API ---------- */

class ApiError extends Error {
    constructor(message, errors = {}) {
        super(message);
        this.errors = errors;
    }
}

async function request(url, options = {}) {
    let response;

    try {
        response = await fetch(url, {
            ...options,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                ...options.headers,
            },
        });
    } catch {
        throw new ApiError(
            "Cannot reach the server. Check your connection and try again.",
        );
    }

    // DELETE may return an empty body, so a failed parse is not an error.
    const body = await response.json().catch(function () {
        return null;
    });

    if (!response.ok) {
        throw new ApiError(getErrorMessage(body), body?.errors ?? {});
    }

    return body;
}

async function fetchTasks(status) {
    const url = status
        ? API_URL + "?status=" + encodeURIComponent(status)
        : API_URL;

    const body = await request(url);

    return Array.isArray(body) ? body : body.data;
}

function createTask(data) {
    return request(API_URL, { method: "POST", body: JSON.stringify(data) });
}

function completeTask(id) {
    return request(API_URL + "/" + id + "/complete", { method: "PATCH" });
}

function deleteTask(id) {
    return request(API_URL + "/" + id, { method: "DELETE" });
}

function updateTask(id, data) {
    return request(API_URL + "/" + id, { method: "PATCH", body: JSON.stringify(data) });
}

/* ---------- Rendering ---------- */

function renderStats(tasks) {
    const total = tasks.length;
    const completed = tasks.filter(function (task) {
        return task.status === "completed";
    }).length;
    const pending = total - completed;
    const rate = total === 0 ? 0 : Math.round((completed / total) * 100);

    statTotal.textContent = total;
    statPending.textContent = pending;
    statCompleted.textContent = completed;
    statRate.textContent = rate + "%";

    progressBar.style.width = rate + "%";
    progress.setAttribute("aria-valuenow", rate);

    const pendingLabel = pending === 1 ? "task" : "tasks";
    const completedLabel = completed === 1 ? "task" : "tasks";
    taskSummary.textContent = `${pending} pending ${pendingLabel} \u00b7 ${completed} completed ${completedLabel}`;

    document.getElementById("count-all").textContent = total;
    document.getElementById("count-pending").textContent = pending;
    document.getElementById("count-completed").textContent = completed;
}

function renderSkeleton() {
    taskList.innerHTML = '<div class="skeleton"></div>'.repeat(3);
}

function renderEmptyState() {
    if (searchQuery !== "") {
        taskList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">${ICONS.clipboard}</div>
                <strong>No matching tasks</strong>
                Try a different title or description.
            </div>
        `;
        return;
    }

    const [title, message] = EMPTY_MESSAGES[currentFilter];

    taskList.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">${ICONS.clipboard}</div>
            <strong>${title}</strong>
            ${message}
        </div>
    `;
}

function filterTasksBySearch(tasks) {
    if (searchQuery === "") {
        return tasks;
    }

    return tasks.filter(function (task) {
        return `${task.title} ${task.description ?? ""}`
            .toLocaleLowerCase()
            .includes(searchQuery);
    });
}

function renderTask(task) {
    const isPending = task.status === "pending";
    const priority = escapeHtml(task.priority);
    const status = escapeHtml(task.status);
    const id = escapeHtml(task.id);

    return `
        <article class="task task-${priority}${isPending ? "" : " is-completed"}">
            <div class="task-main">
                <h3 class="task-title">${escapeHtml(task.title)}</h3>

                ${
                    task.description
                        ? `<p class="task-description">${escapeHtml(task.description)}</p>`
                        : ""
                }

                <div class="task-meta">
                    <span class="badge badge-${priority}">${priority} priority</span>
                    <span class="badge badge-${status}">${status}</span>
                    <time
                        class="task-date"
                        datetime="${escapeHtml(task.created_at)}"
                        title="${escapeHtml(formatFullDate(task.created_at))}"
                    >${escapeHtml(formatRelativeDate(task.created_at))}</time>
                </div>
            </div>

            <div class="task-actions">
                ${
                    isPending
                        ? `<button type="button" class="button button-success" data-action="complete" data-id="${id}">${ICONS.check} Complete</button>`
                        : ""
                }
                <button type="button" class="button button-ghost" data-action="edit" data-id="${id}">${ICONS.edit} Edit</button>
                <button type="button" class="button button-ghost-danger" data-action="delete" data-id="${id}">${ICONS.trash} Delete</button>
            </div>
        </article>
    `;
}

function renderTasks(tasks) {
    if (tasks.length === 0) {
        renderEmptyState();
        return;
    }

    const pendingTasks = tasks.filter(function (task) {
        return task.status === "pending";
    });
    const completedTasks = tasks.filter(function (task) {
        return task.status === "completed";
    });

    const completedSection = completedTasks.length === 0 || currentFilter === "completed"
        ? ""
        : `
            <div class="completed-divider" role="separator" aria-label="Completed tasks">
                <span class="completed-divider-line"></span>
                <span class="completed-divider-label">${ICONS.check} Completed tasks <strong>${completedTasks.length}</strong></span>
                <span class="completed-divider-line"></span>
            </div>
        `;

    taskList.innerHTML = [
        ...pendingTasks.map(renderTask),
        completedSection,
        ...completedTasks.map(renderTask),
    ].join("");
}

async function loadTasks(options = {}) {
    // Ignore responses that arrive after a newer request was started.
    const requestId = ++latestRequestId;

    if (options.showSkeleton) {
        renderSkeleton();
    }

    try {
        const [tasks, allTasks] = await Promise.all([
            fetchTasks(currentFilter),
            currentFilter ? fetchTasks("") : null,
        ]);

        if (requestId !== latestRequestId) {
            return;
        }

        visibleTasks = tasks;

        clearError(listError);
        renderStats(allTasks ?? tasks);
        renderTasks(filterTasksBySearch(tasks));
    } catch (error) {
        if (requestId !== latestRequestId) {
            return;
        }

        taskList.innerHTML = "";
        showError(listError, error.message);
    }
}

function setFilter(filter) {
    currentFilter = filter;

    filterTabs.forEach(function (tab) {
        const isActive = tab.dataset.filter === filter;

        tab.classList.toggle("is-active", isActive);
        tab.setAttribute("aria-pressed", isActive);
    });
}

/* ---------- Events ---------- */

titleInput.addEventListener("input", function () {
    titleCount.textContent = titleInput.value.length + "/255";

    if (!titleError.hidden) {
        clearError(titleError);
        titleInput.removeAttribute("aria-invalid");
    }
});

taskForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    clearFormErrors();

    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();

    if (title === "") {
        showTitleError("Title is required.");
        titleInput.focus();
        return;
    }

    setLoading(submitButton, true);

    try {
        await createTask({
            title: title,
            description: description === "" ? null : description,
            priority: taskForm.elements.priority.value,
        });

        taskForm.reset();
        titleCount.textContent = "0/255";
        showToast("Task added");

        // A new task is pending, so it would be hidden under "Completed".
        if (currentFilter === "completed") {
            setFilter("");
        }

        await loadTasks();
    } catch (error) {
        if (error.errors && error.errors.title) {
            showTitleError(error.errors.title[0]);
        } else {
            showError(formError, error.message);
        }
    } finally {
        setLoading(submitButton, false);
    }
});

taskList.addEventListener("click", async function (event) {
    const button = event.target.closest("button[data-action]");

    if (!button) {
        return;
    }

    const id = button.dataset.id;

    if (button.dataset.action === "edit") {
        const task = visibleTasks.find(function (item) {
            return String(item.id) === id;
        });

        if (!task) {
            showToast("Task details are no longer available. Refresh and try again.", "error");
            return;
        }

        editingTaskId = id;
        editTitleInput.value = task.title;
        editDescriptionInput.value = task.description ?? "";
        editTaskForm.elements["edit-priority"].value = task.priority;
        clearError(editFormError);
        editModal.showModal();
        editTitleInput.focus();
        return;
    }

    if (button.dataset.action === "delete") {
        const task = visibleTasks.find(function (item) {
            return String(item.id) === id;
        });

        pendingDeleteId = id;
        deleteTaskTitle.textContent = task
            ? "\u201C" + task.title + "\u201D"
            : "this task";
        deleteModal.showModal();
        return;
    }

    if (button.dataset.action === "complete") {
        button.disabled = true;

        try {
            await completeTask(id);
            showToast("Task marked as completed");
            await loadTasks();
        } catch (error) {
            button.disabled = false;
            showToast(error.message, "error");
        }
    }
});

confirmDeleteButton.addEventListener("click", async function () {
    if (!pendingDeleteId) {
        return;
    }

    setLoading(confirmDeleteButton, true);

    try {
        await deleteTask(pendingDeleteId);
        deleteModal.close();
        showToast("Task deleted");
    } catch (error) {
        deleteModal.close();
        showToast(error.message, "error");
    } finally {
        setLoading(confirmDeleteButton, false);
    }

    // Refresh either way, so a task already deleted elsewhere disappears too.
    loadTasks();
});

// Clicking the dark backdrop closes the modal.
deleteModal.addEventListener("click", function (event) {
    if (event.target === deleteModal) {
        deleteModal.close();
    }
});

deleteModal.addEventListener("close", function () {
    pendingDeleteId = null;
});

cancelEditButton.addEventListener("click", function () {
    editModal.close();
});

editTaskForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const title = editTitleInput.value.trim();

    if (title === "") {
        showError(editFormError, "Title is required.");
        editTitleInput.focus();
        return;
    }

    setLoading(saveEditButton, true);

    try {
        await updateTask(editingTaskId, {
            title: title,
            description: editDescriptionInput.value.trim() || null,
            priority: editTaskForm.elements["edit-priority"].value,
        });

        editModal.close();
        showToast("Task updated");
        await loadTasks();
    } catch (error) {
        showError(editFormError, error.message);
    } finally {
        setLoading(saveEditButton, false);
    }
});

editModal.addEventListener("click", function (event) {
    if (event.target === editModal) {
        editModal.close();
    }
});

editModal.addEventListener("close", function () {
    editingTaskId = null;
    clearError(editFormError);
});

filterTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
        setFilter(tab.dataset.filter);
        loadTasks();
    });
});

taskSearch.addEventListener("input", function () {
    searchQuery = taskSearch.value.trim().toLocaleLowerCase();
    renderTasks(filterTasksBySearch(visibleTasks));
});

document.addEventListener("keydown", function (event) {
    const target = event.target;
    const isTyping = target instanceof HTMLInputElement
        || target instanceof HTMLTextAreaElement
        || target instanceof HTMLSelectElement;

    if (event.key.toLowerCase() === "n" && !isTyping && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        titleInput.focus();
    }
});

/* ---------- Theme ---------- */

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;

    themeToggle.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
    );
}

themeToggle.addEventListener("click", function () {
    const next =
        document.documentElement.dataset.theme === "dark" ? "light" : "dark";

    applyTheme(next);

    try {
        localStorage.setItem(THEME_KEY, next);
    } catch {
        // Storage can be blocked (private mode); the theme still applies.
    }
});

/* ---------- Init ---------- */

applyTheme(document.documentElement.dataset.theme || "light");
loadTasks({ showSkeleton: true });
