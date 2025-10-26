<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BloodTest extends Model
{
    protected $fillable = [
        'user_id',
        'test_date',
        'hba1c',
        'ldl',
        'hdl',
        'total_cholesterol',
        'fasting_blood_sugar',
        'triglycerides',
        'blood_test_photo_path',
        'notes',
    ];

    protected $casts = [
        'test_date' => 'date',
        'hba1c' => 'decimal:2',
        'ldl' => 'decimal:2',
        'hdl' => 'decimal:2',
        'total_cholesterol' => 'decimal:2',
        'fasting_blood_sugar' => 'decimal:2',
        'triglycerides' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}