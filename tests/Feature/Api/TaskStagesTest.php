<?php

namespace Tests\Feature\Api;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class TaskStagesTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_tasks_default_to_todo_and_include_stage_in_responses(): void
    {
        $this->actingAs(User::factory()->create());
        $this->postJson('/api/tasks', ['title' => 'Example', 'priority' => 'medium'])
            ->assertCreated()->assertJsonPath('stage', 'todo');
        $this->getJson('/api/tasks?sort=deadline')->assertOk()->assertJsonPath('0.stage', 'todo');
    }

    public function test_pending_task_stage_can_be_changed(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create();
        foreach (['in_progress', 'review', 'todo'] as $stage) {
            $this->actingAs($user)->patchJson('/api/tasks/'.$task->id, ['stage' => $stage])
                ->assertOk()->assertJsonPath('stage', $stage);
            $this->assertDatabaseHas('tasks', ['id' => $task->id, 'stage' => $stage]);
        }
    }

    public function test_invalid_stages_are_rejected_in_existing_error_format(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create();
        foreach (['completed', 'unknown', '', null, ['todo']] as $stage) {
            $this->actingAs($user)->patchJson('/api/tasks/'.$task->id, ['stage' => $stage])
                ->assertStatus(400)->assertJsonValidationErrors('stage');
        }
    }

    public function test_completed_task_must_be_reopened_before_stage_change(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create(['status' => 'completed', 'completed_at' => now()]);
        $this->actingAs($user)->patchJson('/api/tasks/'.$task->id, ['stage' => 'review'])
            ->assertStatus(400)->assertJsonValidationErrors('stage')
            ->assertJsonPath('message', 'Reopen this task before changing its stage.');
        $this->patchJson('/api/tasks/'.$task->id, ['title' => 'Still editable'])->assertOk();
        $this->assertSame('completed', $task->fresh()->status);
    }

    public function test_reopen_resets_completion_and_defaults_to_todo(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create(['status' => 'completed', 'completed_at' => now(), 'stage' => 'review']);
        $this->actingAs($user)->patchJson('/api/tasks/'.$task->id.'/reopen')
            ->assertOk()->assertJsonPath('status', 'pending')->assertJsonPath('completed_at', null)->assertJsonPath('stage', 'todo');
        $this->assertDatabaseHas('tasks', ['id' => $task->id, 'status' => 'pending', 'completed_at' => null, 'stage' => 'todo']);
    }

    public function test_reopen_accepts_stage_and_rejects_invalid_stage(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create(['status' => 'completed', 'completed_at' => now()]);
        $this->actingAs($user)->patchJson('/api/tasks/'.$task->id.'/reopen', ['stage' => 'bad'])
            ->assertStatus(400)->assertJsonValidationErrors('stage');
        $this->assertSame('completed', $task->fresh()->status);
        $this->patchJson('/api/tasks/'.$task->id.'/reopen', ['stage' => 'in_progress'])
            ->assertOk()->assertJsonPath('stage', 'in_progress');
    }

    public function test_stage_and_reopen_are_scoped_to_owner(): void
    {
        $task = Task::factory()->create();
        $this->actingAs(User::factory()->create())
            ->patchJson('/api/tasks/'.$task->id, ['stage' => 'review'])->assertNotFound();
        $this->patchJson('/api/tasks/'.$task->id.'/reopen')->assertNotFound();
        $this->patchJson('/api/tasks/999999/reopen')->assertNotFound();
    }

    public function test_guest_cannot_reopen_or_change_stage(): void
    {
        $task = Task::factory()->create();
        $this->patchJson('/api/tasks/'.$task->id.'/reopen')->assertUnauthorized();
        $this->patchJson('/api/tasks/'.$task->id, ['stage' => 'review'])->assertUnauthorized();
    }
}
