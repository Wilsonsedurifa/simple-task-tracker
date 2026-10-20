<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'username', 'deadline_emails', 'timezone'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    protected $attributes = ['deadline_emails' => true, 'timezone' => 'Asia/Manila'];

    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'deadline_emails' => 'boolean',
        ];
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function sharedTasks(): BelongsToMany
    {
        return $this->belongsToMany(Task::class)
            ->withPivot('role')
            ->withTimestamps();
    }

    public function pet(): HasOne
    {
        return $this->hasOne(Pet::class);
    }
}
