<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NutritionTarget extends Model
{
    protected $fillable = [
        'user_id',
        'daily_calorie_target',
        'carbs_target',
        'carbs_percentage',
        'protein_target',
        'protein_percentage',
        'fat_target',
        'fat_percentage',
        'tolerance_band',
        'notes',
        'is_active',
    ];

    protected $casts = [
        'daily_calorie_target' => 'integer',
        'carbs_target' => 'decimal:2',
        'carbs_percentage' => 'decimal:2',
        'protein_target' => 'decimal:2',
        'protein_percentage' => 'decimal:2',
        'fat_target' => 'decimal:2',
        'fat_percentage' => 'decimal:2',
        'tolerance_band' => 'integer',
        'is_active' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}