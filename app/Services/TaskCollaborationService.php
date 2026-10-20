<?php

namespace App\Services;

use App\Models\Task;
use App\Models\TaskInvitation;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TaskCollaborationService
{
    public function invite(Task $task, User $inviter, array $values): TaskInvitation
    {
        $invitee = isset($values['user_id'])
            ? User::find($values['user_id'])
            : User::query()->where('email', mb_strtolower($values['email']))->first();

        if (! $invitee) {
            throw ValidationException::withMessages(['email' => ['No registered user has this email address.']]);
        }
        if ($invitee->id === $inviter->id) {
            throw ValidationException::withMessages(['email' => ['You cannot invite yourself.']]);
        }
        if ($task->collaborators()->whereKey($invitee->id)->exists()) {
            throw ValidationException::withMessages(['email' => ['This user is already a collaborator.']]);
        }
        if ($task->invitations()->where('invitee_id', $invitee->id)->where('status', 'pending')->where('expires_at', '>', now())->exists()) {
            throw ValidationException::withMessages(['email' => ['A pending invitation already exists for this user.']]);
        }

        return $task->invitations()->create([
            'inviter_id' => $inviter->id,
            'invitee_id' => $invitee->id,
            'invitee_email' => $invitee->email,
            'role' => $values['role'],
            'expires_at' => now()->addDays(7),
        ]);
    }

    public function pending(User $user): Collection
    {
        return TaskInvitation::query()->with(['task', 'inviter'])
            ->where('invitee_id', $user->id)
            ->where('status', 'pending')
            ->where('expires_at', '>', now())
            ->latest()->get();
    }

    public function accept(TaskInvitation $invitation, User $user): TaskInvitation
    {
        $this->assertInvitee($invitation, $user);
        $this->assertPending($invitation);

        DB::transaction(function () use ($invitation, $user): void {
            $invitation->task->collaborators()->syncWithoutDetaching([$user->id => ['role' => $invitation->role]]);
            $invitation->update(['status' => 'accepted']);
        });

        return $invitation->refresh();
    }

    public function decline(TaskInvitation $invitation, User $user): TaskInvitation
    {
        $this->assertInvitee($invitation, $user);
        $this->assertPending($invitation);
        $invitation->update(['status' => 'declined']);

        return $invitation->refresh();
    }

    public function remove(Task $task, User $user): void
    {
        $task->collaborators()->detach($user->id);
    }

    private function assertInvitee(TaskInvitation $invitation, User $user): void
    {
        abort_unless($invitation->invitee_id === $user->id, 404);
    }

    private function assertPending(TaskInvitation $invitation): void
    {
        if ($invitation->status !== 'pending' || $invitation->expires_at->isPast()) {
            abort(400, 'This invitation is no longer available.');
        }
    }
}
