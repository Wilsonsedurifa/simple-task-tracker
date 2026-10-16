<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // Preserve every existing model field, cast, timestamp and unwrapped shape.
        return $this->resource->toArray();
    }
}
