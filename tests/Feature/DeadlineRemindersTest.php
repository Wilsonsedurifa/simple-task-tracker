<?php

namespace Tests\Feature;

use App\Jobs\SendDeadlineDigest;
use App\Mail\DeadlineDigest;
use App\Models\Task;
use App\Models\User;
use App\Services\DeadlineReminderService;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class DeadlineRemindersTest extends TestCase
{
    use RefreshDatabase;

    public function test_email_renders_task_links_without_descriptions(): void
    {
        $mail = new DeadlineDigest('wilson', 'Asia/Manila', [[
            'id' => 1, 'title' => 'Finish report', 'priority' => 'high', 'due_date' => '2026-10-21', 'kind' => 'tomorrow',
        ]]);
        $mail->assertSeeInHtml('Finish report');
        $mail->assertSeeInHtml('Due tomorrow');
        $mail->assertSeeInHtml('/tasks?task=1');
    }

    public function test_digest_groups_due_tasks_and_does_not_repeat(): void
    {
        $this->travelTo(CarbonImmutable::parse('2026-10-20 00:00:00', 'UTC'));
        Mail::fake();
        $user = User::factory()->create();
        foreach (['2026-10-19', '2026-10-20', '2026-10-21'] as $date) {
            Task::factory()->for($user)->create(['due_date' => $date]);
        }
        Task::factory()->for($user)->create(['due_date' => '2026-10-20', 'status' => 'completed']);
        Task::factory()->for($user)->create(['due_date' => '2026-10-18']);
        $service = app(DeadlineReminderService::class);
        (new SendDeadlineDigest($user->id))->handle($service);
        (new SendDeadlineDigest($user->id))->handle($service);
        Mail::assertSent(DeadlineDigest::class, fn ($mail) => count($mail->tasks) === 3);
        Mail::assertSentCount(1);
        $this->assertDatabaseCount('deadline_reminders', 3);
    }

    public function test_timezone_preference_and_collaborator_access_are_respected(): void
    {
        $now = CarbonImmutable::parse('2026-10-20 00:00:00', 'UTC');
        $user = User::factory()->create();
        $task = Task::factory()->create(['due_date' => '2026-10-20']);
        $service = app(DeadlineReminderService::class);
        $this->assertCount(0, $service->candidates($user, $now));
        $task->collaborators()->attach($user, ['role' => 'viewer']);
        $this->assertCount(1, $service->candidates($user, $now));
        $user->timezone = 'Europe/London';
        $this->assertCount(0, $service->candidates($user, $now));
        $user->timezone = 'Asia/Manila';
        $user->deadline_emails = false;
        $this->assertCount(0, $service->candidates($user, $now));
    }

    public function test_changed_deadline_gets_a_new_reminder_and_revoked_access_is_excluded(): void
    {
        $this->travelTo(CarbonImmutable::parse('2026-10-20 00:00:00', 'UTC'));
        Mail::fake();
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create(['due_date' => '2026-10-20']);
        $service = app(DeadlineReminderService::class);
        (new SendDeadlineDigest($user->id))->handle($service);
        $task->update(['due_date' => '2026-10-21']);
        (new SendDeadlineDigest($user->id))->handle($service);
        Mail::assertSentCount(2);
        $other = User::factory()->create();
        $task->collaborators()->attach($other, ['role' => 'editor']);
        $task->collaborators()->detach($other);
        (new SendDeadlineDigest($other->id))->handle($service);
        Mail::assertSentCount(2);
    }

    public function test_mail_failure_does_not_mark_tasks_as_sent(): void
    {
        $this->travelTo(CarbonImmutable::parse('2026-10-20 00:00:00', 'UTC'));
        $user = User::factory()->create();
        Task::factory()->for($user)->create(['due_date' => '2026-10-20']);
        Mail::shouldReceive('to')->once()->andThrow(new \RuntimeException('Transport unavailable'));
        try {
            (new SendDeadlineDigest($user->id))->handle(app(DeadlineReminderService::class));
            $this->fail('Expected mail transport failure.');
        } catch (\RuntimeException $exception) {
            $this->assertSame('Transport unavailable', $exception->getMessage());
        }
        $this->assertDatabaseCount('deadline_reminders', 0);
    }
}
