import { completeTask, createTask, getTasks, deleteTask } from "./task-api";

import { createDeleteModal } from "./delete-modal";

const taskList = document.getElementById("task-list");
const taskForm = document.getElementById("task-form");
const statusFilter = document.getElementById("status-filter");

async function loadTasks() {
    const tasks = await getTasks(statusFilter.value);

    taskList.innerHTML = "";

    if (tasks.length === 0) {
        taskList.innerHTML = '<div class="empty-state">No tasks found.</div>';
        return;
    }

    tasks.forEach(function (task) {
        const taskItem = document.createElement("div");

        taskItem.className = "task";

        taskItem.innerHTML =
            '<div class="task-top">' +
            '<div class="task-title">' +
            task.title +
            "</div>" +
            "</div>" +
            '<div class="task-description">' +
            (task.description || "No description provided.") +
            "</div>" +
            '<div class="task-info">' +
            '<span class="badge priority-' +
            task.priority +
            '">' +
            task.priority +
            " priority</span>" +
            '<span class="badge status-' +
            task.status +
            '">' +
            task.status +
            "</span>" +
            "</div>" +
            '<div class="task-actions">' +
            (task.status === "pending"
                ? '<button class="button button-success complete-button" data-id="' +
                  task.id +
                  '">Complete</button>'
                : "") +
            '<button class="button button-danger delete-button" data-id="' +
            task.id +
            '">Delete</button>' +
            "</div>";

        taskList.appendChild(taskItem);
    });
}

const deleteModal = createDeleteModal(async function (id) {
    const response = await deleteTask(id);

    if (response.ok) {
        loadTasks();
    }
});

taskList.addEventListener("click", async function (event) {
    const id = event.target.dataset.id;

    if (event.target.classList.contains("complete-button")) {
        const response = await completeTask(id);

        if (response.ok) {
            loadTasks();
        }
    }

    if (event.target.classList.contains("delete-button")) {
        deleteModal.open(id);
    }
});

statusFilter.addEventListener("change", loadTasks);

taskForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const response = await createTask({
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        priority: document.getElementById("priority").value,
    });

    if (response.ok) {
        taskForm.reset();
        loadTasks();
    }
});

loadTasks();
