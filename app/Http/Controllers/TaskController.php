<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $query = Task::query();

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $tasks = $query
            ->orderByRaw("
                CASE priority
                    WHEN 'high' THEN 1
                    WHEN 'medium' THEN 2
                    WHEN 'low' THEN 3
                    ELSE 4
                END
            ")
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($tasks);
    }

    public function store(Request $request)
    {
        if (!$request->filled('title')) {
            return response()->json([
                'message' => 'Title is required.'
            ], 400);
        }

        $task = Task::create([
            'title' => $request->title,
            'description' => $request->description,
            'priority' => $request->priority ?? 'low',
            'status' => 'pending',
        ]);

        return response()->json($task, 201);
    }

    public function complete(int $id)
    {
        $task = Task::find($id);

        if (!$task) {
            return response()->json([
                'message' => 'Task not found.'
            ], 404);
        }

        $task->status = 'completed';
        $task->save();

        return response()->json($task, 200);
    }

    public function destroy(int $id)
    {
        $task = Task::find($id);

        if (!$task) {
            return response()->json([
                'message' => 'Task not found.'
            ], 404);
        }

        $task->delete();

        return response()->json([
            'message' => 'Task deleted successfully.'
        ], 200);
    }
}