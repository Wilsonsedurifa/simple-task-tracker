<x-mail::message>
# A little heads-up, {{ $username }}

Here are the tasks that need your attention. Dates follow {{ $timezone }}.

@foreach (['tomorrow' => 'Due tomorrow', 'today' => 'Due today', 'overdue' => 'One day overdue'] as $kind => $label)
@if (collect($tasks)->contains('kind', $kind))
## {{ $label }}

@foreach ($tasks as $task)
@if ($task['kind'] === $kind)
**{{ $task['title'] }}**

Due {{ $task['due_date'] }} · {{ ucfirst($task['priority']) }} priority

<x-mail::button :url="url('/tasks?task='.$task['id'])">Open task</x-mail::button>
@endif
@endforeach
@endif
@endforeach

You receive these reminders as a task owner or accepted collaborator.
[Manage email reminders]({{ url('/settings#account') }})
</x-mail::message>
