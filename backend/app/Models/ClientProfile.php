<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClientProfile extends Model
{
    protected $fillable = [
        'user_id',
        'age',
        'gender',
        'height',
        'weight',
        'goal',
        'health_conditions',
        'allergies',
        'dietary_history',
        'body_goal_questions',
        'appetite_level',
    ];

    protected $casts = [
        'health_conditions' => 'array',
        'height' => 'decimal:2',
        'weight' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}