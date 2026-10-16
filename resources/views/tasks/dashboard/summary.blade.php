        <div class="app-dashboard-summary">
            <section class="app-dashboard-card app-progress-card" aria-labelledby="app-progress-heading">
                <div class="app-dashboard-heading"><h2 id="app-progress-heading">Your progress</h2><strong id="db-summary-percent">0%</strong></div>
                <div id="db-summary-progress" class="app-dashboard-progress" role="progressbar" aria-label="Task completion" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span></span></div>
                <p id="db-summary-label"><span id="app-dashboard-done">0</span> of <span id="db-summary-total">0</span> completed</p>
                <p id="app-dashboard-first-run" hidden>Add a task to get started</p>
                <a class="app-dashboard-link" href="{{ route('tasks') }}">View all tasks <span aria-hidden="true">→</span></a>
            </section>
            @include('tasks.partials.pet-widget', ['appPetCompact' => true])
            <section class="app-dashboard-card app-weekly-card" aria-labelledby="app-chart-heading">
                <div class="app-dashboard-heading"><h2 id="app-chart-heading">Last 7 days</h2><span class="app-dashboard-hint">Completed</span></div>
                <div id="db-summary-chart" class="app-seven-chart" role="img" aria-label="Daily task completions"></div>
                <p id="db-chart-total" class="app-chart-caption">0 completed in the last 7 days</p>
                <table class="app-sr-only"><caption>Tasks completed in the last 7 days</caption><thead><tr><th scope="col">Date</th><th scope="col">Completed</th></tr></thead><tbody id="app-chart-table"></tbody></table>
            </section>
        </div>
