<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // Preserve every existing model field, cast, timestamp and unwrapped shape.
        $task = $this->resource->toArray();
        $role = $this->resource->relationLoaded('collaborators')
            ? $this->resource->collaborators->firstWhere('id', $request->user()?->id)?->pivot?->role
            : null;
        unset($task['collaborators']);
        if ($this->resource->relationLoaded('collaborators') && $this->resource->collaborators->isNotEmpty()) {
            $task['collaborator_usernames'] = $this->resource->collaborators->pluck('username')->all();
        }

        return $role ? $task + ['collaboration_role' => $role] : $task;
    }
}
