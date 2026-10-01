export async function getTasks(status = "") {
    let url = "/api/tasks";

    if (status) {
        url += "?status=" + status;
    }

    const response = await fetch(url);

    return response.json();
}

export async function createTask(task) {
    return fetch("/api/tasks", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(task),
    });
}

export async function completeTask(id) {
    return fetch("/api/tasks/" + id + "/complete", {
        method: "PATCH",
    });
}

export async function deleteTask(id) {
    return fetch("/api/tasks/" + id, {
        method: "DELETE",
    });
}
