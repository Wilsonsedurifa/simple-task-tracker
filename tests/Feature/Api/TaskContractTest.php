<?php

namespace Tests\Feature\Api;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class TaskContractTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_index_and_update_keep_the_complete_unwrapped_model_shape(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create(['due_date' => now()->subDay()->format('Y-m-d')]);
        $this->actingAs($user)->getJson('/api/tasks')->assertExactJson([$task->fresh()->toArray()]);
        $response = $this->patchJson('/api/tasks/'.$task->id, ['title' => 'Changed only']);
        $response->assertOk()->assertExactJson($task->fresh()->toArray());
    }

    public function test_create_does_not_add_model_defaults_or_a_resource_wrapper(): void
    {
        $user = User::factory()->create();
        $response = $this->actingAs($user)->postJson('/api/tasks', ['title' => 'Contract', 'priority' => 'low']);
        $response->assertCreated()->assertJsonMissingPath('data')->assertJsonMissingPath('due_date')
            ->assertJsonMissingPath('completed_at')->assertJsonMissingPath('xp_awarded_at');
        $this->assertEqualsCanonicalizing(
            ['stage', 'title', 'priority', 'status', 'user_id', 'updated_at', 'created_at', 'id'],
            array_keys($response->json()),
        );
    }

    public function test_validation_payload_and_completed_stage_guard_keep_their_order(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create(['status' => 'completed']);
        $this->actingAs($user)->patchJson('/api/tasks/'.$task->id, ['stage' => 'invalid'])
            ->assertBadRequest()->assertExactJson([
                'message' => 'The given data was invalid.',
                'errors' => ['stage' => ['The selected stage is invalid.']],
            ]);
        $this->patchJson('/api/tasks/'.$task->id, ['stage' => 'todo'])->assertBadRequest()->assertExactJson([
            'message' => 'Reopen this task before changing its stage.',
            'errors' => ['stage' => ['Reopen this task before changing its stage.']],
        ]);
    }

    public function test_ownership_is_checked_before_update_and_reopen_validation(): void
    {
        $task = Task::factory()->create();
        $this->actingAs(User::factory()->create())->patchJson('/api/tasks/'.$task->id, ['priority' => 'invalid'])->assertNotFound();
        $this->patchJson('/api/tasks/'.$task->id.'/reopen', ['stage' => 'invalid'])->assertNotFound();
    }
}
