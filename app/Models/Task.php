<?php

namespace App\Models;

use Database\Factories\TaskFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Task extends Model
{
    protected $attributes = ['stage' => 'todo'];

    /** @use HasFactory<TaskFactory> */
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'priority',
        'status',
        'stage',
        'due_date',
        'completed_at',
        'user_id',
    ];

    protected function casts(): array
    {
        return ['due_date' => 'date', 'completed_at' => 'datetime', 'stage' => 'string', 'xp_awarded_at' => 'datetime'];
    }

    public function scopeForUser(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function collaborators(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->withPivot('role')
            ->withTimestamps();
    }

    public function invitations(): HasMany
    {
        return $this->hasMany(TaskInvitation::class);
    }
}
