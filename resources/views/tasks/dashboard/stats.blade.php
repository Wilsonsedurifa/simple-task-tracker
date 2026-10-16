<section class="app-task-stats app-dashboard-stats" aria-label="Task summary" aria-live="polite">
    @php
        $metrics = [
            ['key'=>'pending','label'=>'Open','path'=>'M5 4h14v17H5z M9 9h6 M9 13h6 M9 17h4','params'=>['status'=>'pending']],
            ['key'=>'today','label'=>'Due today','path'=>'M8 2v5 M16 2v5 M3 10h18 M5 5h14v16H5z','params'=>['status'=>'pending','due'=>'today']],
            ['key'=>'overdue','label'=>'Overdue','path'=>'M12 8v5 M12 17h.01 M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18','params'=>['status'=>'pending','due'=>'overdue']],
            ['key'=>'completed','label'=>'Completed','path'=>'m5 12 4 4L19 6','params'=>['status'=>'completed']],
        ];
    @endphp
    @foreach ($metrics as $metric)
    <a class="app-task-stat app-dashboard-stat" data-app-metric="{{ $metric['key'] }}" href="{{ route('tasks', $metric['params']) }}">
        <span class="app-stat-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="{{ $metric['path'] }}"/></svg></span>
        <span><span class="app-stat-label">{{ $metric['label'] }}</span><strong id="db-summary-{{ $metric['key'] }}">0</strong></span>
    </a>
    @endforeach
</section>
