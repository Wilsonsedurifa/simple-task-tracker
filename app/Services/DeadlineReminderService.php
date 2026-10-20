<?php

namespace App\Services;

use App\Models\Task;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class DeadlineReminderService
{
    public function candidates(User $user, CarbonImmutable $now): Collection
    {
        $local = $now->setTimezone($user->timezone);
        if (! $user->deadline_emails || $local->hour < 8) {
            return collect();
        }
        $dates = [
            $local->addDay()->toDateString() => 'tomorrow',
            $local->toDateString() => 'today',
            $local->subDay()->toDateString() => 'overdue',
        ];

        return Task::query()->where('status', 'pending')
            ->where(function ($query) use ($dates): void {
                foreach (array_keys($dates) as $date) {
                    $query->orWhereDate('due_date', $date);
                }
            })
            ->where(fn ($query) => $query->where('user_id', $user->id)
                ->orWhereHas('collaborators', fn ($people) => $people->whereKey($user->id)))
            ->orderBy('due_date')->orderBy('id')->get()
            ->map(fn (Task $task) => [
                'id' => $task->id, 'title' => $task->title, 'priority' => $task->priority,
                'due_date' => $task->due_date->toDateString(), 'kind' => $dates[$task->due_date->toDateString()],
            ])->reject(fn (array $task) => DB::table('deadline_reminders')->where([
                'user_id' => $user->id, 'task_id' => $task['id'], 'due_date' => $task['due_date'], 'kind' => $task['kind'],
            ])->exists())->values();
    }
}
