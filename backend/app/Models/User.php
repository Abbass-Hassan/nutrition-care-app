<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'username',
        'password',
        'user_type',
        'dietitian_id',
        'subscription_type',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Check if user is a dietitian
     */
    public function isDietitian()
    {
        return $this->user_type === 'dietitian';
    }

    /**
     * Check if user is a client
     */
    public function isClient()
    {
        return $this->user_type === 'client';
    }

    public function dietitian(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dietitian_id');
    }

    public function clients(): HasMany
    {
        return $this->hasMany(User::class, 'dietitian_id');
    }

    public function dietitianChats(): HasMany
    {
        return $this->hasMany(Chat::class, 'dietitian_id');
    }

    public function clientChats(): HasMany
    {
        return $this->hasMany(Chat::class, 'client_id');
    }

    /**
     * Get the client's profile.
     */
    public function profile()
    {
        return $this->hasOne(ClientProfile::class);
    }

    /**
     * Get the client's nutrition targets.
     */
    public function nutritionTargets()
    {
        return $this->hasMany(NutritionTarget::class);
    }

    public function dailyProgress(): HasMany
    {
        return $this->hasMany(DailyProgress::class);
    }

    /**
     * Get the client's active nutrition target.
     */
    public function activeNutritionTarget()
    {
        return $this->hasOne(NutritionTarget::class)->where('is_active', true)->latest();
    }

    /**
     * Get the client's measurements.
     */
    public function measurements()
    {
        return $this->hasMany(Measurement::class);
    }

    /**
     * Get the client's blood tests.
     */
    public function bloodTests()
    {
        return $this->hasMany(BloodTest::class);
    }
}
