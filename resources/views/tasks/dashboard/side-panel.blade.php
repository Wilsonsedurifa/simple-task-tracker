    <aside class="app-dashboard-side app-dashboard-card" aria-label="Task activity">
        <div class="app-dashboard-heading"><h2>Keep things moving</h2></div>
        <div class="app-side-tabs" role="tablist" aria-label="Task activity">
            @foreach (['deadlines'=>'Deadlines','active'=>'Active','done'=>'Done'] as $key=>$label)
            <button id="app-tab-{{ $key }}" type="button" role="tab" aria-selected="{{ $key === 'deadlines' ? 'true' : 'false' }}" aria-controls="app-panel-{{ $key }}" tabindex="{{ $key === 'deadlines' ? '0' : '-1' }}" data-app-tab="{{ $key }}">{{ $label }} <span id="app-count-{{ $key }}">0</span></button>
            @endforeach
        </div>
        <section id="app-panel-deadlines" role="tabpanel" aria-labelledby="app-tab-deadlines" tabindex="0">
            <div id="app-week-strip" class="app-week-strip" role="group" aria-label="Filter deadlines by day"></div>
            <div id="app-week-actions" class="app-week-actions"></div>
            <div id="app-deadline-list" class="app-panel-list" aria-live="polite"></div>
            <a id="app-no-deadline" class="app-dashboard-link" href="{{ route('tasks', ['status'=>'pending','due'=>'none']) }}" hidden></a>
        </section>
        <section id="app-panel-active" role="tabpanel" aria-labelledby="app-tab-active" tabindex="0" hidden><div id="app-active-list" class="app-panel-list" aria-live="polite"></div></section>
        <section id="app-panel-done" role="tabpanel" aria-labelledby="app-tab-done" tabindex="0" hidden><p class="app-dashboard-hint">Eight latest completions, in your task order.</p><div id="app-done-list" class="app-panel-list" aria-live="polite"></div></section>
    </aside>
