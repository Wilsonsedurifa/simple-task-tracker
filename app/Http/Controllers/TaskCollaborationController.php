<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTaskInvitationRequest;
use App\Http\Resources\CollaboratorResource;
use App\Http\Resources\TaskInvitationResource;
use App\Models\Task;
use App\Models\User;
use App\Services\TaskCollaborationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class TaskCollaborationController extends Controller
{
    public function pending(Task $task): JsonResponse
    {
        Gate::authorize('invite', $task);

        return response()->json($task->invitations()->where('status', 'pending')->where('expires_at', '>', now())->with('invitee:id,name,username')->get()->map(fn ($invitation) => [
            'id' => $invitation->id, 'name' => $invitation->invitee?->name, 'username' => $invitation->invitee?->username, 'role' => $invitation->role,
        ]));
    }

    public function store(StoreTaskInvitationRequest $request, Task $task, TaskCollaborationService $service): JsonResponse
    {
        Gate::authorize('invite', $task);
        $invitation = $service->invite($task, $request->user(), $request->validated());

        return response()->json((new TaskInvitationResource($invitation))->resolve($request), 201);
    }

    public function index(Task $task): JsonResponse
    {
        Gate::authorize('view', $task);

        return response()->json(CollaboratorResource::collection($task->collaborators()->get())->resolve(request()));
    }

    public function destroy(Task $task, User $user, TaskCollaborationService $service): JsonResponse
    {
        Gate::authorize('removeCollaborator', $task);
        abort_unless($task->collaborators()->whereKey($user->id)->exists(), 404);
        $service->remove($task, $user);

        return response()->json(['message' => 'Collaborator removed.']);
    }
}
