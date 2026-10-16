        <section class="app-dashboard-card app-quick-card" aria-labelledby="app-quick-heading">
            <div class="app-dashboard-heading"><h2 id="app-quick-heading">Quick add</h2><span class="app-dashboard-hint">One small next step.</span></div>
            <form id="app-quick-form" class="app-quick-form" novalidate>
                <div class="app-quick-title"><label class="label" for="app-quick-title">Title</label><input id="app-quick-title" name="title" class="input" required maxlength="255" autocomplete="off" placeholder="What needs your attention?"></div>
                <div><label class="label" for="app-quick-priority">Priority</label><select id="app-quick-priority" name="priority" class="input"><option value="high">High</option><option value="medium" selected>Medium</option><option value="low">Low</option></select></div>
                <div><label class="label" for="app-quick-due">Due date (optional)</label><input id="app-quick-due" name="due_date" type="date" class="input"></div>
                <div id="app-quick-details" class="app-quick-title" hidden><label class="label" for="app-quick-description">Description</label><textarea id="app-quick-description" name="description" class="input" rows="3" maxlength="1000" aria-describedby="app-quick-count"></textarea><span id="app-quick-count" class="field-hint">0/1000</span></div>
                <div id="app-quick-error" class="app-quick-title" role="alert" hidden></div>
                <div class="app-quick-actions"><button type="button" id="app-quick-toggle" class="app-clear-filters" aria-expanded="false" aria-controls="app-quick-details">Add details</button><button type="submit" id="app-quick-submit" class="button button-primary">Add task</button></div>
            </form>
        </section>
