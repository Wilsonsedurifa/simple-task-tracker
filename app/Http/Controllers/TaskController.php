<?php

namespace App\Http\Controllers;

use App\Http\Requests\IndexTaskRequest;
use App\Http\Requests\ReopenTaskRequest;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use App\Services\PetService;
use App\Services\TaskService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index(IndexTaskRequest $request, TaskService $service): JsonResponse
    {
        $tasks = $service->listing(
            $request->user(),
            $request->filled('status') ? $request->string('status')->toString() : null,
            $request->string('sort')->toString(),
        );

        return response()->json(TaskResource::collection($tasks)->resolve($request));
    }

    public function store(StoreTaskRequest $request, TaskService $service): JsonResponse
    {
        $task = $service->create($request->user(), $request->validated());

        return response()->json((new TaskResource($task))->resolve($request), 201);
    }

    public function update(UpdateTaskRequest $request, Task $task, TaskService $service): JsonResponse
    {
        if ($request->has('stage') && $task->status === 'completed') {
            return response()->json([
                'message' => 'Reopen this task before changing its stage.',
                'errors' => ['stage' => ['Reopen this task before changing its stage.']],
            ], 400);
        }
        $service->update($task, $request->validated());

        return response()->json((new TaskResource($task))->resolve($request));
    }

    public function complete(Task $task, PetService $pets): JsonResponse
    {
        abort_unless($task->user_id === request()->user()->id, 404);

        return response()->json($pets->complete($task));
    }

    public function destroyCompleted(Request $request, TaskService $service): JsonResponse
    {
        $count = $service->deleteCompleted($request->user());

        return response()->json(['message' => 'Completed tasks deleted.', 'deleted_count' => $count]);
    }

    public function destroy(Task $task): JsonResponse
    {
        abort_unless($task->user_id === request()->user()->id, 404);
        $task->delete();

        return response()->json(['message' => 'Task deleted successfully.']);
    }

    public function reopen(ReopenTaskRequest $request, Task $task, TaskService $service): JsonResponse
    {
        $service->reopen($task, $request->validated());

        return response()->json((new TaskResource($task))->resolve($request));
    }
}
