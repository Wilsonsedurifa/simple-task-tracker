<?php

namespace App\Services;

use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class TaskService
{
    public function listing(User $user, ?string $status, string $sort): Collection
    {
        return Task::forUser($user->id)
            ->when($status !== null, function (Builder $query) use ($status): void {
                $query->where('status', $status);
            })
            ->when($sort === 'deadline', function (Builder $query): void {
                $query->orderByRaw("CASE WHEN status = 'pending' AND due_date IS NOT NULL THEN 0 WHEN status = 'pending' THEN 1 ELSE 2 END")
                    ->orderByRaw("CASE WHEN status = 'pending' AND due_date IS NOT NULL THEN due_date END ASC");
            })
            ->orderByRaw("
                CASE status
                    WHEN 'pending' THEN 1
                    WHEN 'completed' THEN 2
                    ELSE 3
                END
            ")
            ->orderByRaw("
                CASE priority
                    WHEN 'high' THEN 1
                    WHEN 'medium' THEN 2
                    WHEN 'low' THEN 3
                    ELSE 4
                END
            ")
            ->when($sort === 'deadline', function (Builder $query): void {
                $query->orderByRaw("CASE WHEN status = 'completed' THEN completed_at END DESC");
            })
            ->orderBy('created_at', 'asc')
            ->get();

    }

    public function create(User $user, array $values): Task
    {
        return $user->tasks()->create($values + ['status' => 'pending']);
    }

    public function update(Task $task, array $values): Task
    {
        $task->update($values);

        return $task;
    }

    public function reopen(Task $task, array $values): Task
    {
        return $this->update($task, [
            'status' => 'pending',
            'completed_at' => null,
            'stage' => $values['stage'] ?? 'todo',
        ]);
    }

    public function deleteCompleted(User $user): int
    {
        return $user->tasks()->where('status', 'completed')->delete();
    }
}
