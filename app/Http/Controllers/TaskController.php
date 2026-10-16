<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Services\PetService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TaskController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Task::query()->where('user_id', $request->user()->id);

        $validator = Validator::make($request->query(), [
            'status' => ['nullable', 'in:pending,completed'],
            'sort' => ['nullable', 'in:priority,deadline'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'The given data was invalid.',
                'errors' => $validator->errors(),
            ], 400);
        }

        $tasks = $query
            ->when($request->filled('status'), function (Builder $query) use ($request): void {
                $query->where('status', $request->string('status')->toString());
            })
            ->when($request->string('sort')->toString() === 'deadline', function (Builder $query): void {
                $query->orderByRaw("CASE WHEN status = 'pending' AND due_date IS NOT NULL THEN 0 WHEN status = 'pending' THEN 1 ELSE 2 END")
                    ->orderByRaw("CASE WHEN status = 'pending' AND due_date IS NOT NULL THEN due_date END ASC");
            })
            ->orderByRaw("
                CASE status
                    WHEN 'pending' THEN 1
                    WHEN 'completed' THEN 2
                    ELSE 3
                END
            ")
            ->orderByRaw("
                CASE priority
                    WHEN 'high' THEN 1
                    WHEN 'medium' THEN 2
                    WHEN 'low' THEN 3
                    ELSE 4
                END
            ")
            ->when($request->string('sort')->toString() === 'deadline', function (Builder $query): void {
                $query->orderByRaw("CASE WHEN status = 'completed' THEN completed_at END DESC");
            })
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($tasks);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), $this->taskRules());

        if ($validator->fails()) {
            return response()->json([
                'message' => 'The given data was invalid.',
                'errors' => $validator->errors(),
            ], 400);
        }

        $task = $request->user()->tasks()->create($validator->validated() + [
            'status' => 'pending',
        ]);

        return response()->json($task, 201);
    }

    public function update(Request $request, Task $task): JsonResponse
    {
        $task = $this->ownedTask($request, $task);
        $rules = $this->taskRules(true);

        // An unchanged past deadline must not prevent editing another field.
        // The frontend sends only changed fields, so validate due_date only when supplied.
        if (! $request->has('due_date')) {
            unset($rules['due_date']);
        }

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'The given data was invalid.',
                'errors' => $validator->errors(),
            ], 400);
        }

        if ($request->has('stage') && $task->status === 'completed') {
            return response()->json([
                'message' => 'Reopen this task before changing its stage.',
                'errors' => ['stage' => ['Reopen this task before changing its stage.']],
            ], 400);
        }
        $task->update($validator->validated());

        return response()->json($task);
    }

    public function complete(Task $task, PetService $pets): JsonResponse
    {
        abort_unless($task->user_id === request()->user()->id, 404);
        return response()->json($pets->complete($task));
    }

    public function destroyCompleted(Request $request): JsonResponse
    {
        $count = $request->user()->tasks()->where('status', 'completed')->delete();

        return response()->json(['message' => 'Completed tasks deleted.', 'deleted_count' => $count]);
    }

    public function destroy(Task $task): JsonResponse
    {
        abort_unless($task->user_id === request()->user()->id, 404);
        $task->delete();

        return response()->json([
            'message' => 'Task deleted successfully.',
        ]);
    }

    public function reopen(Request $request, Task $task): JsonResponse
    {
        $task = $this->ownedTask($request, $task);
        $validator = Validator::make($request->all(), [
            'stage' => ['sometimes', 'required', 'in:todo,in_progress,review'],
        ]);
        if ($validator->fails()) {
            return response()->json([
                'message' => 'The given data was invalid.',
                'errors' => $validator->errors(),
            ], 400);
        }
        $task->update([
            'status' => 'pending',
            'completed_at' => null,
            'stage' => $validator->validated()['stage'] ?? 'todo',
        ]);
        return response()->json($task);
    }

    /**
     * @return array<string, array<int, string>>
     */
    private function taskRules(bool $partial = false): array
    {
        return [
            'title' => [$partial ? 'sometimes' : 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'priority' => [$partial ? 'sometimes' : 'required', 'in:low,medium,high'],
            'stage' => ['sometimes', 'required', 'in:todo,in_progress,review'],
            'due_date' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:today'],
        ];
    }

    private function ownedTask(Request $request, Task $task): Task
    {
        abort_unless($task->user_id === $request->user()->id, 404);

        return $task;
    }
}
