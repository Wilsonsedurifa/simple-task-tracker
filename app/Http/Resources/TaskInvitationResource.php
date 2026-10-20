<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskInvitationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'task_id' => $this->task_id,
            'task_title' => $this->whenLoaded('task', fn (): string => $this->task->title),
            'inviter_name' => $this->whenLoaded('inviter', fn (): string => $this->inviter->name),
            'role' => $this->role,
            'status' => $this->status,
            'expires_at' => $this->expires_at?->toISOString(),
        ];
    }
}
