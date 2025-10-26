<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Measurement extends Model
{
    protected $fillable = [
        'user_id',
        'measurement_date',
        'weight',
        'body_fat_percentage',
        'muscle_percentage',
        'other_composition',
        'notes',
    ];

    protected $casts = [
        'measurement_date' => 'date',
        'weight' => 'decimal:2',
        'body_fat_percentage' => 'decimal:2',
        'muscle_percentage' => 'decimal:2',
        'other_composition' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}