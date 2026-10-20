<?php

namespace App\Jobs;

use App\Mail\DeadlineDigest;
use App\Models\User;
use App\Services\DeadlineReminderService;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class SendDeadlineDigest implements ShouldBeUnique, ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $timeout = 60;

    public int $uniqueFor = 3600;

    public function __construct(public int $userId) {}

    public function uniqueId(): string
    {
        return (string) $this->userId;
    }

    public function backoff(): array
    {
        return [60, 300, 900];
    }

    public function handle(DeadlineReminderService $service): void
    {
        $user = User::find($this->userId);
        if (! $user) {
            return;
        }
        // Re-evaluate at delivery: preferences, task access, completion and due dates may have changed.
        $tasks = $service->candidates($user, CarbonImmutable::now());
        if ($tasks->isEmpty()) {
            return;
        }
        Mail::to($user->email)->send(new DeadlineDigest($user->username ?? $user->name, $user->timezone, $tasks->all()));
        foreach ($tasks as $task) {
            DB::table('deadline_reminders')->insertOrIgnore([
                'user_id' => $user->id, 'task_id' => $task['id'], 'due_date' => $task['due_date'],
                'kind' => $task['kind'], 'sent_at' => now(),
            ]);
        }
    }
}
