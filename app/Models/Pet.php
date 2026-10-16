<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pet extends Model
{
    protected $fillable = ['species', 'name'];

    protected function casts(): array
    {
        return [
            'xp' => 'integer', 'xp_today' => 'integer',
            'streak_days' => 'integer', 'longest_streak' => 'integer',
            'last_streak_date' => 'date:Y-m-d', 'xp_today_date' => 'date:Y-m-d',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
