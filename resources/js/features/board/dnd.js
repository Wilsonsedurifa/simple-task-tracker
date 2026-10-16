// board/dnd: existing UI behavior and lifecycle, initialized explicitly by the app boot.
export function appInitDnd(board, appMove) {
    let appDragId = null;
    board.addEventListener('dragstart', event => {
        const card = event.target.closest('[data-task-id]');
        if (!card || matchMedia('(pointer: coarse)').matches || event.target.closest('button')) { event.preventDefault(); return; }
        appDragId = card.dataset.taskId; event.dataTransfer?.setData('text/plain', appDragId); if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
        card.classList.add('app-dragging');
    });
    board.addEventListener('dragover', event => {
        const column = event.target.closest('[data-column]'); if (!column || !appDragId) return;
        event.preventDefault(); if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
        board.querySelectorAll('.app-drop-target').forEach(node => node.classList.remove('app-drop-target')); column.classList.add('app-drop-target');
    });
    board.addEventListener('drop', event => {
        const column = event.target.closest('[data-column]'); if (!column || !appDragId) return;
        event.preventDefault(); const id = appDragId; appDragId = null;
        board.querySelectorAll('.app-drop-target,.app-dragging').forEach(node => node.classList.remove('app-drop-target', 'app-dragging'));
        appMove(id, column.dataset.column === 'inprogress' ? 'in_progress' : column.dataset.column);
    });
    board.addEventListener('dragend', () => { appDragId = null; board.querySelectorAll('.app-drop-target,.app-dragging').forEach(node => node.classList.remove('app-drop-target', 'app-dragging')); });
}
