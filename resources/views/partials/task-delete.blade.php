    <!-- Delete Confirmation Modal -->
    <dialog id="delete-modal" class="modal" aria-labelledby="delete-heading">
        <form method="dialog" class="modal-body">
            <div class="modal-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 6h18"/>
                    <path d="M8 6V4h8v2"/>
                    <path d="M19 6l-1 14H6L5 6"/>
                </svg>
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
