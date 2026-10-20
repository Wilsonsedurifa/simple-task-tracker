<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class TaskPolicy
{
    public function view(User $user, Task $task): Response
    {
        return $this->related($user, $task);
    }

    public function update(User $user, Task $task): Response
    {
        if ($task->user_id === $user->id || $this->role($user, $task) === 'editor') {
            return Response::allow();
        }

        return $this->related($user, $task, false);
    }

    public function complete(User $user, Task $task): Response
    {
        return $this->update($user, $task);
    }

    public function delete(User $user, Task $task): Response
    {
        return $task->user_id === $user->id ? Response::allow() : $this->related($user, $task, false);
    }

    public function invite(User $user, Task $task): Response
    {
        return $this->delete($user, $task);
    }

    public function removeCollaborator(User $user, Task $task): Response
    {
        return $this->delete($user, $task);
    }

    private function related(User $user, Task $task, bool $allow = true): Response
    {
        if ($task->user_id === $user->id || $this->role($user, $task) !== null) {
            return $allow ? Response::allow() : Response::deny();
        }

        return Response::denyAsNotFound();
    }

    private function role(User $user, Task $task): ?string
    {
        return $task->collaborators()->whereKey($user->id)->value('task_user.role');
    }
}
