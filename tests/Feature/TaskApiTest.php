<?php

namespace Tests\Feature;

use App\Models\Task;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class TaskApiTest extends TestCase
{
    use LazilyRefreshDatabase;

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
        $pendingTask = Task::factory()->create([
            'priority' => 'low',
            'status' => 'pending',
        ]);
        $completedTask = Task::factory()->create([
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
        $pendingTask = Task::factory()->create(['status' => 'pending']);
        Task::factory()->create(['status' => 'completed']);

        $this->getJson('/api/tasks?status=pending')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', $pendingTask->id)
            ->assertJsonPath('0.status', 'pending');
    }

    public function test_marks_a_task_as_completed(): void
    {
        $task = Task::factory()->create(['status' => 'pending']);

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
        $task = Task::factory()->create([
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
        $task = Task::factory()->create();

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
        $task = Task::factory()->create();

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
}
