<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DailyProgress extends Model
{
    protected $table = 'daily_progress';

    protected $fillable = [
        'user_id',
        'date',
        'calories_consumed',
        'calories_goal',
        'protein_consumed',
        'carbs_consumed',
        'fat_consumed',
        'protein_goal',
        'carbs_goal',
        'fat_goal',
        'protein_percentage',
        'carbs_percentage',
        'fat_percentage',
        'water_intake',
        'water_goal',
        'status',
        'within_tolerance',
        'meals_logged',
    ];

    protected $casts = [
        'date' => 'date',
        'calories_consumed' => 'float',
        'calories_goal' => 'float',
        'protein_consumed' => 'float',
        'carbs_consumed' => 'float',
        'fat_consumed' => 'float',
        'protein_goal' => 'float',
        'carbs_goal' => 'float',
        'fat_goal' => 'float',
        'protein_percentage' => 'float',
        'carbs_percentage' => 'float',
        'fat_percentage' => 'float',
        'water_intake' => 'integer',
        'water_goal' => 'integer',
        'within_tolerance' => 'boolean',
        'meals_logged' => 'integer',
    ];

    /**
     * Get the user that owns the daily progress.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Calculate status based on tolerance band and goals.
     */
    public function calculateStatus(float $toleranceBand = 10): string
    {
        if (!$this->calories_goal) {
            return 'good';
        }

        $calorieVariance = abs($this->calories_consumed - $this->calories_goal);
        $caloriePercentage = ($calorieVariance / $this->calories_goal) * 100;

        // Check if within tolerance band
        if ($caloriePercentage <= $toleranceBand) {
            $this->within_tolerance = true;
            return 'excellent';
        }

        // Check if over/under by moderate amount
        if ($caloriePercentage <= $toleranceBand * 2) {
            $this->within_tolerance = false;
            return 'good';
        }

        // Check if significantly off
        if ($caloriePercentage <= $toleranceBand * 3) {
            $this->within_tolerance = false;
            return 'needs_attention';
        }

        // Very far from goal
        $this->within_tolerance = false;
        return 'poor';
    }

    /**
     * Calculate macro percentages from consumed amounts.
     */
    public function calculateMacroPercentages(): void
    {
        $totalCaloriesFromMacros = ($this->protein_consumed * 4) + 
                                   ($this->carbs_consumed * 4) + 
                                   ($this->fat_consumed * 9);

        if ($totalCaloriesFromMacros > 0) {
            $this->protein_percentage = (($this->protein_consumed * 4) / $totalCaloriesFromMacros) * 100;
            $this->carbs_percentage = (($this->carbs_consumed * 4) / $totalCaloriesFromMacros) * 100;
            $this->fat_percentage = (($this->fat_consumed * 9) / $totalCaloriesFromMacros) * 100;
        } else {
            $this->protein_percentage = 0;
            $this->carbs_percentage = 0;
            $this->fat_percentage = 0;
        }
    }
}
