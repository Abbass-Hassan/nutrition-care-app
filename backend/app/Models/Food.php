<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Food extends Model
{
    protected $table = 'foods';

    protected $fillable = [
        'dietitian_id',
        'name',
        'category',
        'default_serving',
        'calories',
        'carbs',
        'protein',
        'fat',
        'photo_path',
        'notes',
        'approval_status',
        'created_by_client_id',
        'rejection_reason',
        'approved_at',
        'approved_by_dietitian_id',
    ];

    protected $appends = [
        'photo_url'
    ];

    protected $casts = [
        'calories' => 'float',
        'carbs' => 'float',
        'protein' => 'float',
        'fat' => 'float',
        'approved_at' => 'datetime',
    ];

    /**
     * Get the dietitian that owns the food.
     */
    public function dietitian(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dietitian_id');
    }

    /**
     * Get the client who created this food.
     */
    public function createdByClient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_client_id');
    }

    /**
     * Get the dietitian who approved this food.
     */
    public function approvedByDietitian(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by_dietitian_id');
    }

    /**
     * Scope for approved foods only.
     */
    public function scopeApproved($query)
    {
        return $query->where('approval_status', 'approved');
    }

    /**
     * Scope for pending foods only.
     */
    public function scopePending($query)
    {
        return $query->where('approval_status', 'pending');
    }

    /**
     * Get the photo URL.
     */
    public function getPhotoUrlAttribute(): ?string
    {
        if (!$this->photo_path) {
            return null;
        }

        return asset('storage/foods/' . basename($this->photo_path));
    }

    /**
     * Delete the photo file when the food is deleted.
     */
    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($food) {
            if ($food->photo_path && Storage::disk('public')->exists('foods/' . basename($food->photo_path))) {
                Storage::disk('public')->delete('foods/' . basename($food->photo_path));
            }
        });
    }
}
