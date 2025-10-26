<?php

namespace App\Http\Controllers;

use App\Models\DailyProgress;
use App\Models\NutritionTarget;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class ProgressController extends Controller
{
    /**
     * Save or update daily progress for a client.
     */
    public function saveDailyProgress(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user->isClient()) {
            return response()->json([
                'success' => false,
                'message' => 'Only clients can save daily progress'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'date' => 'required|date',
            'calories_consumed' => 'required|numeric|min:0',
            'protein_consumed' => 'required|numeric|min:0',
            'carbs_consumed' => 'required|numeric|min:0',
            'fat_consumed' => 'required|numeric|min:0',
            'water_intake' => 'nullable|integer|min:0',
            'meals_logged' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Get nutrition goals for the user
            $nutritionTarget = NutritionTarget::where('user_id', $user->id)
                ->where('is_active', true)
                ->first();

            // Create or update daily progress
            // Parse date to ensure consistent format (YYYY-MM-DD only, no time)
            $dateOnly = Carbon::parse($request->date)->toDateString();
            
            // Find existing progress using whereDate for proper date comparison
            $progress = DailyProgress::where('user_id', $user->id)
                ->whereDate('date', $dateOnly)
                ->first();

            if ($progress) {
                // Update existing progress
                $progress->update([
                    'calories_consumed' => $request->calories_consumed,
                    'protein_consumed' => $request->protein_consumed,
                    'carbs_consumed' => $request->carbs_consumed,
                    'fat_consumed' => $request->fat_consumed,
                    'water_intake' => $request->water_intake ?? 0,
                    'meals_logged' => $request->meals_logged ?? 0,
                    'calories_goal' => $nutritionTarget->daily_calorie_target ?? null,
                    'protein_goal' => $nutritionTarget->protein_target ?? null,
                    'carbs_goal' => $nutritionTarget->carbs_target ?? null,
                    'fat_goal' => $nutritionTarget->fat_target ?? null,
                    'water_goal' => 8,
                ]);
            } else {
                // Create new progress
                $progress = DailyProgress::create([
                    'user_id' => $user->id,
                    'date' => $dateOnly,
                    'calories_consumed' => $request->calories_consumed,
                    'protein_consumed' => $request->protein_consumed,
                    'carbs_consumed' => $request->carbs_consumed,
                    'fat_consumed' => $request->fat_consumed,
                    'water_intake' => $request->water_intake ?? 0,
                    'meals_logged' => $request->meals_logged ?? 0,
                    'calories_goal' => $nutritionTarget->daily_calorie_target ?? null,
                    'protein_goal' => $nutritionTarget->protein_target ?? null,
                    'carbs_goal' => $nutritionTarget->carbs_target ?? null,
                    'fat_goal' => $nutritionTarget->fat_target ?? null,
                    'water_goal' => 8,
                ]);
            }

            // Calculate macro percentages
            $progress->calculateMacroPercentages();

            // Calculate status based on tolerance band
            $toleranceBand = $nutritionTarget->tolerance_band ?? 10;
            $progress->status = $progress->calculateStatus($toleranceBand);

            $progress->save();

            return response()->json([
                'success' => true,
                'message' => 'Daily progress saved successfully',
                'progress' => $progress
            ]);

        } catch (\Exception $e) {
            \Log::error('Error saving daily progress:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to save daily progress'
            ], 500);
        }
    }

    /**
     * Get daily progress for a specific date (client).
     */
    public function getDailyProgress(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user->isClient()) {
            return response()->json([
                'success' => false,
                'message' => 'Only clients can view their progress'
            ], 403);
        }

        $date = $request->query('date', Carbon::today()->toDateString());

        $progress = DailyProgress::where('user_id', $user->id)
            ->where('date', $date)
            ->first();

        return response()->json([
            'success' => true,
            'progress' => $progress
        ]);
    }

    /**
     * Get client progress for dietitian dashboard.
     */
    public function getClientProgress(string $clientId, Request $request): JsonResponse
    {
        $dietitian = Auth::user();
        
        if (!$dietitian->isDietitian()) {
            return response()->json([
                'success' => false,
                'message' => 'Only dietitians can view client progress'
            ], 403);
        }

        // Verify the client belongs to this dietitian
        $client = User::where('id', $clientId)
            ->where('dietitian_id', $dietitian->id)
            ->where('user_type', 'client')
            ->firstOrFail();

        $view = $request->query('view', 'week'); // 'day', 'week', 'month'
        $date = $request->query('date', Carbon::today()->toDateString());

        $progress = [];

        if ($view === 'day') {
            // Get single day progress
            $progress = DailyProgress::where('user_id', $client->id)
                ->whereDate('date', $date)
                ->first();
        } elseif ($view === 'week') {
            // Get last 7 days
            $startDate = Carbon::parse($date)->subDays(6)->toDateString();
            $endDate = Carbon::parse($date)->toDateString();
            
            $progress = DailyProgress::where('user_id', $client->id)
                ->whereDate('date', '>=', $startDate)
                ->whereDate('date', '<=', $endDate)
                ->orderBy('date', 'desc')
                ->get();
        } elseif ($view === 'month') {
            // Get last 30 days
            $startDate = Carbon::parse($date)->subDays(29)->toDateString();
            $endDate = Carbon::parse($date)->toDateString();
            
            $progress = DailyProgress::where('user_id', $client->id)
                ->whereDate('date', '>=', $startDate)
                ->whereDate('date', '<=', $endDate)
                ->orderBy('date', 'desc')
                ->get();
        }

        // Get client's nutrition target
        $nutritionTarget = NutritionTarget::where('user_id', $client->id)
            ->where('is_active', true)
            ->first();

        return response()->json([
            'success' => true,
            'client' => [
                'id' => $client->id,
                'name' => $client->name,
                'email' => $client->email,
            ],
            'nutrition_target' => $nutritionTarget,
            'progress' => $progress,
            'view' => $view,
            'date' => $date,
        ]);
    }

    /**
     * Get progress summary for all clients (dietitian dashboard overview).
     */
    public function getAllClientsProgress(Request $request): JsonResponse
    {
        $dietitian = Auth::user();
        
        if (!$dietitian->isDietitian()) {
            return response()->json([
                'success' => false,
                'message' => 'Only dietitians can view client progress'
            ], 403);
        }

        // Get all clients for this dietitian with their progress data
        $clients = User::where('dietitian_id', $dietitian->id)
            ->where('user_type', 'client')
            ->with(['dailyProgress' => function($query) {
                $query->orderBy('date', 'desc');
            }])
            ->get()
            ->map(function($client) {
                $allProgress = $client->dailyProgress;
                
                if ($allProgress->isEmpty()) {
                    return [
                        'id' => $client->id,
                        'name' => $client->name,
                        'email' => $client->email,
                        'progress' => null,
                        'has_logged_today' => false,
                        'avg_calories' => null,
                        'avg_meals' => null,
                        'avg_goal_rate' => null,
                        'total_logged_days' => 0
                    ];
                }

                // Calculate averages across all logged days
                $totalDays = $allProgress->count();
                $avgCalories = $allProgress->avg('calories_consumed');
                $avgMeals = $allProgress->avg('meals_logged');
                
                // Calculate average goal achievement rate
                $goalRates = $allProgress->map(function($progress) {
                    if ($progress->calories_goal && $progress->calories_goal > 0) {
                        return ($progress->calories_consumed / $progress->calories_goal) * 100;
                    }
                    return 0;
                })->filter(function($rate) {
                    return $rate > 0;
                });
                
                $avgGoalRate = $goalRates->isNotEmpty() ? $goalRates->avg() : 0;
                
                // Get today's progress if available
                $todayProgress = $allProgress->where('date', Carbon::today()->toDateString())->first();
                
                return [
                    'id' => $client->id,
                    'name' => $client->name,
                    'email' => $client->email,
                    'progress' => $todayProgress,
                    'has_logged_today' => $todayProgress !== null,
                    'avg_calories' => round($avgCalories, 0),
                    'avg_meals' => round($avgMeals, 1),
                    'avg_goal_rate' => round($avgGoalRate, 0),
                    'total_logged_days' => $totalDays
                ];
            });

        return response()->json([
            'success' => true,
            'clients' => $clients,
            'summary' => [
                'total_clients' => $clients->count(),
                'logged_today' => $clients->where('has_logged_today', true)->count(),
                'not_logged' => $clients->where('has_logged_today', false)->count(),
            ]
        ]);
    }

    /**
     * Get weekly summary (aggregated data).
     */
    public function getWeeklySummary(string $clientId, Request $request): JsonResponse
    {
        $dietitian = Auth::user();
        
        if (!$dietitian->isDietitian()) {
            return response()->json([
                'success' => false,
                'message' => 'Only dietitians can view client progress'
            ], 403);
        }

        // Verify the client belongs to this dietitian
        $client = User::where('id', $clientId)
            ->where('dietitian_id', $dietitian->id)
            ->where('user_type', 'client')
            ->firstOrFail();

        $date = $request->query('date', Carbon::today()->toDateString());
        $startDate = Carbon::parse($date)->startOfWeek();
        $endDate = Carbon::parse($date)->endOfWeek();

        $weekProgress = DailyProgress::where('user_id', $client->id)
            ->whereBetween('date', [$startDate, $endDate])
            ->get();

        // Calculate weekly averages
        $summary = [
            'avg_calories' => $weekProgress->avg('calories_consumed'),
            'avg_protein' => $weekProgress->avg('protein_consumed'),
            'avg_carbs' => $weekProgress->avg('carbs_consumed'),
            'avg_fat' => $weekProgress->avg('fat_consumed'),
            'avg_water' => $weekProgress->avg('water_intake'),
            'days_logged' => $weekProgress->count(),
            'days_within_tolerance' => $weekProgress->where('within_tolerance', true)->count(),
            'status_breakdown' => [
                'excellent' => $weekProgress->where('status', 'excellent')->count(),
                'good' => $weekProgress->where('status', 'good')->count(),
                'needs_attention' => $weekProgress->where('status', 'needs_attention')->count(),
                'poor' => $weekProgress->where('status', 'poor')->count(),
            ],
        ];

        return response()->json([
            'success' => true,
            'client' => [
                'id' => $client->id,
                'name' => $client->name,
            ],
            'period' => [
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
            ],
            'daily_progress' => $weekProgress,
            'summary' => $summary,
        ]);
    }
}
