<header class="top-header app-topbar {{ request()->routeIs('tasks') ? 'app-topbar-tasks' : '' }}">
    <div class="search-box app-global-search">
        <svg class="search-icon app-shell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/></svg>
        <input id="task-search" class="search-input" type="search" aria-label="Search tasks and descriptions" placeholder="Search tasks, descriptions..." value="{{ request('q','') }}">
        <kbd class="search-kbd" aria-hidden="true">Ctrl K</kbd>
    </div>
    <div class="app-toolbar-actions">
        @if(request()->routeIs('tasks'))
        <div class="view-switcher app-view-switcher" role="group" aria-label="Task view">
            <button id="view-mode-board" type="button" class="view-btn is-active" data-view="board" aria-pressed="true" title="Board view"><svg class="app-shell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="5" height="16" rx="1"/><rect x="10" y="4" width="5" height="16" rx="1"/><rect x="17" y="4" width="4" height="16" rx="1"/></svg><span>Board</span></button>
            <button id="view-mode-list" type="button" class="view-btn" data-view="list" aria-pressed="false" title="List view"><svg class="app-shell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13M3 6h1M3 12h1M3 18h1"/></svg><span>List</span></button>
        </div>
        @endif
        <button id="open-create-modal-btn" type="button" class="button button-primary button-header-add app-new-task"><svg class="app-shell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 4v16M4 12h16"/></svg><span>New task</span></button>
        <button id="app-notification-bell" type="button" data-app-notifications class="app-shell-button app-notification-bell" aria-label="Notifications" title="Notifications" aria-haspopup="dialog" aria-expanded="false" aria-controls="app-notification-dropdown"><svg class="app-shell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21h4"/></svg><span class="app-unread-dot app-notification-count" data-app-unread hidden aria-hidden="true"></span></button>
    </div>
</header>
