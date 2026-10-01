export function createDeleteModal(onConfirm) {
    const modal = document.getElementById("delete-modal");
    const confirmButton = document.getElementById("confirm-delete-button");

    let taskId = null;

    confirmButton.addEventListener("click", async function () {
        if (taskId === null) {
            return;
        }

        await onConfirm(taskId);

        taskId = null;
        modal.close();
    });

    return {
        open(id) {
            taskId = id;
            modal.showModal();
        },
    };
}
