<?php

namespace App\Console\Commands;

use App\Jobs\SendDeadlineDigest;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Console\Command;

class SendDeadlineReminders extends Command
{
    protected $signature = 'tasks:send-deadline-reminders';

    protected $description = 'Queue deadline email digests after 8 AM in each recipient timezone';

    public function handle(): int
    {
        User::where('deadline_emails', true)->chunkById(100, function ($users): void {
            foreach ($users as $user) {
                if (CarbonImmutable::now($user->timezone)->hour >= 8) {
                    SendDeadlineDigest::dispatch($user->id);
                }
            }
        });

        return self::SUCCESS;
    }
}
