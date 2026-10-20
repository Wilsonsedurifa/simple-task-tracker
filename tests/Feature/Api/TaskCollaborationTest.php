<?php

namespace Tests\Feature\Api;

use App\Models\Task;
use App\Models\TaskInvitation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskCollaborationTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_invite_and_invitee_can_accept(): void
    {
        [$owner, $invitee, $task] = $this->taskWithUsers();
        $invitation = $this->actingAs($owner)->postJson("/api/tasks/{$task->id}/invitations", ['email' => $invitee->email, 'role' => 'editor'])->assertCreated()->json();

        $this->actingAs($invitee)->postJson("/api/invitations/{$invitation['id']}/accept")->assertOk();
        $this->assertDatabaseHas('task_user', ['task_id' => $task->id, 'user_id' => $invitee->id, 'role' => 'editor']);
        $this->actingAs($invitee)->getJson('/api/tasks')->assertOk()->assertJsonFragment(['id' => $task->id]);
    }

    public function test_invitee_can_decline_an_invitation(): void
    {
        [$owner, $invitee, $task] = $this->taskWithUsers();
        $invitation = TaskInvitation::create(['task_id' => $task->id, 'inviter_id' => $owner->id, 'invitee_id' => $invitee->id, 'invitee_email' => $invitee->email, 'role' => 'viewer', 'expires_at' => now()->addDay()]);

        $this->actingAs($invitee)->postJson("/api/invitations/{$invitation->id}/decline")->assertOk();
        $this->assertDatabaseHas('task_invitations', ['id' => $invitation->id, 'status' => 'declined']);
    }

    public function test_self_duplicate_and_expired_invitations_are_rejected(): void
    {
        [$owner, $invitee, $task] = $this->taskWithUsers();
        $this->actingAs($owner)->postJson("/api/tasks/{$task->id}/invitations", ['email' => $owner->email, 'role' => 'viewer'])->assertUnprocessable();
        $this->postJson("/api/tasks/{$task->id}/invitations", ['email' => $invitee->email, 'role' => 'viewer'])->assertCreated();
        $this->postJson("/api/tasks/{$task->id}/invitations", ['email' => $invitee->email, 'role' => 'viewer'])->assertUnprocessable();
        $expired = TaskInvitation::create(['task_id' => $task->id, 'inviter_id' => $owner->id, 'invitee_id' => $invitee->id, 'invitee_email' => $invitee->email, 'role' => 'viewer', 'expires_at' => now()->subMinute()]);
        $this->actingAs($invitee)->postJson("/api/invitations/{$expired->id}/accept")->assertBadRequest();
    }

    public function test_editor_can_update_but_viewer_cannot_and_stranger_gets_not_found(): void
    {
        [$owner, $editor, $task] = $this->taskWithUsers();
        $viewer = User::factory()->create();
        $stranger = User::factory()->create();
        $task->collaborators()->attach([$editor->id => ['role' => 'editor'], $viewer->id => ['role' => 'viewer']]);

        $this->actingAs($editor)->patchJson("/api/tasks/{$task->id}", ['title' => 'Edited'])->assertOk();
        $this->actingAs($viewer)->patchJson("/api/tasks/{$task->id}", ['title' => 'Blocked'])->assertForbidden();
        $this->actingAs($stranger)->getJson("/api/tasks/{$task->id}/collaborators")->assertNotFound();
    }

    private function taskWithUsers(): array
    {
        $owner = User::factory()->create();
        $invitee = User::factory()->create();

        return [$owner, $invitee, Task::factory()->for($owner)->create()];
    }
}
