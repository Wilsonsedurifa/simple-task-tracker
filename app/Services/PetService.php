<?php

namespace App\Services;

use App\Models\Pet;
use App\Models\Task;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

class PetService
{
    private array $settings;

    public function __construct(?array $settings = null)
    {
        $this->settings = $settings ?? config('pets');
    }

    /** Pure calculation; the final level has no next-level target. */
    public function progress(int $xp): array
    {
        $levels = $this->settings['levels'];
        $index = 0;
        foreach ($levels as $key => $level) {
            if ($xp >= $level['xp']) {
                $index = $key;
            }
        }
        $into = max(0, $xp - $levels[$index]['xp']);
        $required = isset($levels[$index + 1]) ? $levels[$index + 1]['xp'] - $levels[$index]['xp'] : null;

        return [
            'level' => $index + 1,
            'stage' => $levels[$index]['stage'],
            'xp_into_level' => $into,
            'xp_for_next' => $required,
            'progress_pct' => $required === null ? 100 : round($into / $required * 100, 2),
        ];
    }

    /** Pure calendar-day calculation, independent of elapsed hours / DST. */
    public function streak(?string $lastDate, int $days, int $longest, CarbonImmutable $today): array
    {
        $days = $lastDate === $today->toDateString() ? $days
            : ($lastDate === $today->subDay()->toDateString() ? $days + 1 : 1);

        return ['streak_days' => $days, 'longest_streak' => max($longest, $days)];
    }

    public function describe(Pet $pet): array
    {
        $yesterday = CarbonImmutable::now(config('app.timezone'))->subDay()->toDateString();
        $last = $pet->last_streak_date?->toDateString();

        return array_merge($pet->toArray(), $this->progress($pet->xp), [
            'streak_days' => $last === null || $last < $yesterday ? 0 : $pet->streak_days,
            'completed_count' => Task::where('user_id', $pet->user_id)->where('status', 'completed')->count(),
        ]);
    }

    /**
     * One transaction owns both completion and rewards. The user lock serializes
     * adoption and completions of different tasks, protecting the daily cap.
     * Always acquire locks in user -> task -> pet order.
     */
    public function complete(Task $task): array
    {
        return DB::transaction(function () use ($task): array {
            User::whereKey($task->user_id)->lockForUpdate()->firstOrFail();
            $task = Task::whereKey($task->id)->where('user_id', $task->user_id)->lockForUpdate()->firstOrFail();
            $pet = Pet::where('user_id', $task->user_id)->lockForUpdate()->first();
            $now = CarbonImmutable::now(config('app.timezone'));
            $wasPending = $task->status === 'pending';
            $task->forceFill(['status' => 'completed', 'completed_at' => $now])->save();
            $payload = $task->toArray();
            if ($pet === null) {
                return $payload;
            }

            $before = $this->progress($pet->xp)['level'];
            $gained = 0;
            // Repeating /complete on an already completed task cannot claim a
            // pre-adoption completion. Adoption itself never backfills rewards.
            if ($wasPending && $task->xp_awarded_at === null) {
                $today = $now->toDateString();
                $used = $pet->xp_today_date?->toDateString() === $today ? $pet->xp_today : 0;
                $amount = $this->settings['priority_xp'][$task->priority];
                if ($task->due_date !== null && $today <= $task->due_date->toDateString()) {
                    $amount += $this->settings['on_time_bonus'];
                }
                $gained = max(0, min($amount, $this->settings['daily_cap'] - $used));
                $streak = $this->streak($pet->last_streak_date?->toDateString(), $pet->streak_days, $pet->longest_streak, $now);
                $pet->forceFill($streak + [
                    'xp' => $pet->xp + $gained, 'xp_today' => $used + $gained,
                    'xp_today_date' => $today, 'last_streak_date' => $today,
                ])->save();
                // Even a cap-clipped zero is consumed; reopening cannot bank XP.
                $task->forceFill(['xp_awarded_at' => $now])->save();
                $payload = $task->toArray();
            }
            $progress = $this->progress($pet->xp);
            $last = $pet->last_streak_date?->toDateString();
            $payload['pet'] = [
                'xp_gained' => $gained, 'level' => $progress['level'],
                'leveled_up' => $progress['level'] > $before, 'new_stage' => $progress['stage'],
                'streak_days' => $last === null || $last < $now->subDay()->toDateString() ? 0 : $pet->streak_days,
            ];

            return $payload;
        }, 3);
    }
}
