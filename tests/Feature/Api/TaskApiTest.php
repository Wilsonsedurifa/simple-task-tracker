<?php

namespace Tests\Feature\Api;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class TaskApiTest extends TestCase
{
    use LazilyRefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->actingAs($this->user);
    }

    private function createTask(array $attributes = []): Task
    {
        return Task::factory()->for($this->user)->create($attributes);
    }

    public function test_creates_a_task_and_returns_201(): void
    {
        $response = $this->postJson('/api/tasks', [
            'title' => 'Write project README',
            'description' => 'Document the local setup steps.',
            'priority' => 'high',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('title', 'Write project README')
            ->assertJsonPath('priority', 'high')
            ->assertJsonPath('status', 'pending');

        $this->assertDatabaseHas('tasks', [
            'title' => 'Write project README',
            'priority' => 'high',
            'status' => 'pending',
            'user_id' => $this->user->id,
        ]);
    }

    public function test_returns_400_when_title_is_missing(): void
    {
        $response = $this->postJson('/api/tasks', [
            'priority' => 'medium',
        ]);

        $response
            ->assertBadRequest()
            ->assertInvalid(['title' => 'The title field is required.']);

        $this->assertDatabaseCount('tasks', 0);
    }

    public function test_guest_api_requests_are_rejected_with_401(): void
    {
        $this->app['auth']->logout();

        $this->getJson('/api/tasks')->assertUnauthorized();
        $this->postJson('/api/tasks', ['title' => 'Unauthorised', 'priority' => 'low'])->assertUnauthorized();
    }

    public function test_returns_400_when_priority_is_invalid(): void
    {
        $response = $this->postJson('/api/tasks', [
            'title' => 'Invalid priority task',
            'priority' => 'urgent',
        ]);

        $response
            ->assertBadRequest()
            ->assertInvalid(['priority' => 'The selected priority is invalid.']);

        $this->assertDatabaseCount('tasks', 0);
    }

    public function test_lists_pending_tasks_before_completed_tasks(): void
    {
        $pendingTask = $this->createTask([
            'priority' => 'low',
            'status' => 'pending',
        ]);
        $completedTask = $this->createTask([
            'priority' => 'high',
            'status' => 'completed',
        ]);

        $this->getJson('/api/tasks')
            ->assertOk()
            ->assertJsonPath('0.id', $pendingTask->id)
            ->assertJsonPath('1.id', $completedTask->id);
    }

    public function test_filters_tasks_by_status(): void
    {
        $pendingTask = $this->createTask(['status' => 'pending']);
        $this->createTask(['status' => 'completed']);

        $this->getJson('/api/tasks?status=pending')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', $pendingTask->id)
            ->assertJsonPath('0.status', 'pending');
    }

    public function test_marks_a_task_as_completed(): void
    {
        $task = $this->createTask(['status' => 'pending']);

        $this->patchJson("/api/tasks/{$task->id}/complete")
            ->assertOk()
            ->assertJsonPath('status', 'completed');

        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'status' => 'completed',
        ]);
    }

    public function test_updates_a_task(): void
    {
        $task = $this->createTask([
            'title' => 'Draft project notes',
            'description' => 'Initial notes',
            'priority' => 'low',
            'status' => 'pending',
        ]);

        $this->patchJson("/api/tasks/{$task->id}", [
            'title' => 'Finalize project notes',
            'description' => 'Reviewed notes',
            'priority' => 'high',
        ])
            ->assertOk()
            ->assertJsonPath('title', 'Finalize project notes')
            ->assertJsonPath('priority', 'high')
            ->assertJsonPath('status', 'pending');

        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'title' => 'Finalize project notes',
            'description' => 'Reviewed notes',
            'priority' => 'high',
            'status' => 'pending',
        ]);
    }

    public function test_returns_400_when_an_updated_task_has_invalid_data(): void
    {
        $task = $this->createTask();

        $this->patchJson("/api/tasks/{$task->id}", [
            'title' => '',
            'priority' => 'urgent',
        ])
            ->assertBadRequest()
            ->assertInvalid(['title', 'priority']);

        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'title' => $task->title,
            'priority' => $task->priority,
        ]);
    }

    public function test_returns_404_when_updating_a_missing_task(): void
    {
        $this->patchJson('/api/tasks/999', [
            'title' => 'Missing task',
            'priority' => 'low',
        ])->assertNotFound();
    }

    public function test_deletes_a_task(): void
    {
        $task = $this->createTask();

        $this->deleteJson("/api/tasks/{$task->id}")
            ->assertOk()
            ->assertJsonPath('message', 'Task deleted successfully.');

        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
    }

    public function test_returns_404_when_deleting_a_missing_task(): void
    {
        $this->deleteJson('/api/tasks/999')
            ->assertNotFound();
    }

    public function test_a_user_cannot_read_or_modify_another_users_tasks(): void
    {
        $otherUser = User::factory()->create();
        $otherTask = Task::factory()->for($otherUser)->create(['status' => 'pending']);
        $ownTask = $this->createTask();

        $this->getJson('/api/tasks')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', $ownTask->id);

        $this->patchJson("/api/tasks/{$otherTask->id}/complete")->assertNotFound();
        $this->patchJson("/api/tasks/{$otherTask->id}", [
            'title' => 'Attempted change',
            'priority' => 'high',
        ])->assertNotFound();
        $this->deleteJson("/api/tasks/{$otherTask->id}")->assertNotFound();

        $this->assertDatabaseHas('tasks', [
            'id' => $otherTask->id,
            'status' => 'pending',
            'title' => $otherTask->title,
        ]);
    }
}
