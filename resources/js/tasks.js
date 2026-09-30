async function loadTasks() {
    const filter = document.getElementById("status-filter").value;

    let url = "/api/tasks";

    if (filter) {
        url += "?status=" + filter;
    }

    const response = await fetch(url);
    const tasks = await response.json();

    const taskList = document.getElementById("task-list");

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
            " priority" +
            "</span>" +
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

async function completeTask(id) {
    const response = await fetch("/api/tasks/" + id + "/complete", {
        method: "PATCH",
    });

    if (response.ok) {
        loadTasks();
    }
}

async function deleteTask(id) {
    const response = await fetch("/api/tasks/" + id, {
        method: "DELETE",
    });

    if (response.ok) {
        loadTasks();
    }
}

document
    .getElementById("task-list")
    .addEventListener("click", function (event) {
        if (event.target.classList.contains("complete-button")) {
            const id = event.target.dataset.id;

            completeTask(id);
        }

        if (event.target.classList.contains("delete-button")) {
            const id = event.target.dataset.id;

            deleteTask(id);
        }
    });

document
    .getElementById("status-filter")
    .addEventListener("change", function () {
        loadTasks();
    });

document
    .getElementById("task-form")
    .addEventListener("submit", async function (event) {
        event.preventDefault();

        const title = document.getElementById("title").value;

        const description = document.getElementById("description").value;

        const priority = document.getElementById("priority").value;

        const response = await fetch("/api/tasks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title: title,
                description: description,
                priority: priority,
            }),
        });

        if (response.ok) {
            document.getElementById("task-form").reset();

            loadTasks();
        }
    });

loadTasks();
