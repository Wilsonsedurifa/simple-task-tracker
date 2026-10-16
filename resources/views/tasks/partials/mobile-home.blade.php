<section id="app-mobile-home" class="app-mobile-home" aria-label="Your day" aria-busy="true">
    <div id="app-mobile-home-error" class="app-mobile-home-error"></div>
    <div id="app-mobile-home-stats" class="app-mobile-home-stats" aria-label="Task summary" aria-live="polite"></div>
    <section aria-labelledby="app-mobile-actions-title">
        <h2 id="app-mobile-actions-title">Quick Actions</h2>
        <div class="app-mobile-home-actions">
            <button type="button" data-app-home-action="add" aria-haspopup="dialog"><span aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14 M5 12h14"/></svg></span>Add Task</button>
            <a href="{{ route('calendar') }}"><span aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 2v5 M16 2v5 M3 10h18 M5 5h14v16H5z"/></svg></span>Calendar</a>
            <a href="{{ route('tasks', ['filters'=>'priority']) }}"><span aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 5h18l-7 8v6l-4 2v-8z"/></svg></span>Filter</a>
            <button type="button" data-app-home-action="more" aria-haspopup="dialog"><span aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h2 M11 12h2 M17 12h2"/></svg></span>More</button>
        </div>
    </section>
    <div id="app-mobile-home-pet" class="app-mobile-home-pet"></div>
    <section class="app-mobile-home-tasks" aria-labelledby="app-mobile-today-title">
        <div class="app-mobile-section-header"><h2 id="app-mobile-today-title">Today's Tasks</h2><a href="{{ route('tasks', ['due'=>'today']) }}">View all →</a></div>
        <div id="app-mobile-home-loading" aria-label="Loading tasks"><div class="app-task-skeleton"></div><div class="app-task-skeleton"></div><div class="app-task-skeleton"></div></div>
        <details id="app-mobile-home-overdue" hidden><summary>Overdue <span id="app-mobile-overdue-count">0</span></summary><div id="app-mobile-overdue-list"></div></details>
        <div id="app-mobile-today-list"></div>
        <div id="app-mobile-home-empty" class="app-mobile-home-empty" hidden><h3 id="app-mobile-empty-title">Walang due ngayon</h3><p id="app-mobile-empty-copy">A little breathing room for your day.</p><button type="button" class="button button-primary" data-app-home-action="add">Add task</button></div>
    </section>
</section>
