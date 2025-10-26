<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ClientProfile;
use App\Models\NutritionTarget;
use App\Models\Measurement;
use App\Models\BloodTest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ClientController extends Controller
{
    /**
     * Create a comprehensive client profile.
     */
    public function createClient(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user->isDietitian()) {
            return response()->json([
                'success' => false,
                'message' => 'Only dietitians can create clients'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            // Basic Account Information
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'subscription_type' => 'required|in:free,paid',
            
            // Personal & Health Information
            'age' => 'nullable|integer|min:1|max:120',
            'gender' => 'nullable|in:male,female,other',
            'height' => 'nullable|numeric|min:50|max:300',
            'weight' => 'nullable|numeric|min:20|max:500',
            'goal' => 'nullable|in:lose_weight,maintain,gain_weight,gain_muscle',
            'health_conditions' => 'nullable|array',
            'allergies' => 'nullable|string',
            'dietary_history' => 'nullable|string',
            'body_goal_questions' => 'nullable|string',
            'appetite_level' => 'nullable|in:low,medium,high',
            
            // Initial Measurements (optional)
            'initial_weight' => 'nullable|numeric|min:20|max:500',
            'body_fat_percentage' => 'nullable|numeric|min:0|max:100',
            'muscle_percentage' => 'nullable|numeric|min:0|max:100',
            'other_composition' => 'nullable|array',
            
            // Blood Test Indicators (optional)
            'hba1c' => 'nullable|numeric|min:0|max:20',
            'ldl' => 'nullable|numeric|min:0|max:500',
            'hdl' => 'nullable|numeric|min:0|max:200',
            'total_cholesterol' => 'nullable|numeric|min:0|max:1000',
            'fasting_blood_sugar' => 'nullable|numeric|min:0|max:1000',
            'triglycerides' => 'nullable|numeric|min:0|max:2000',
            'blood_test_photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            
            // Nutrition Targets
            'daily_calorie_target' => 'nullable|integer|min:500|max:10000',
            'carbs_target' => 'nullable|numeric|min:0|max:1000',
            'carbs_percentage' => 'nullable|numeric|min:0|max:100',
            'protein_target' => 'nullable|numeric|min:0|max:1000',
            'protein_percentage' => 'nullable|numeric|min:0|max:100',
            'fat_target' => 'nullable|numeric|min:0|max:1000',
            'fat_percentage' => 'nullable|numeric|min:0|max:100',
            'tolerance_band' => 'nullable|integer|min:0|max:50',
            'nutrition_notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Create the user
            $client = User::create([
                'name' => $request->name,
                'username' => $request->username,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'user_type' => 'client',
                'dietitian_id' => $user->id,
                'subscription_type' => $request->subscription_type,
            ]);

            // Create client profile
            if ($request->hasAny(['age', 'gender', 'height', 'weight', 'goal', 'health_conditions', 'allergies', 'dietary_history', 'body_goal_questions', 'appetite_level'])) {
                ClientProfile::create([
                    'user_id' => $client->id,
                    'age' => $request->age,
                    'gender' => $request->gender,
                    'height' => $request->height,
                    'weight' => $request->weight,
                    'goal' => $request->goal,
                    'health_conditions' => $request->health_conditions,
                    'allergies' => $request->allergies,
                    'dietary_history' => $request->dietary_history,
                    'body_goal_questions' => $request->body_goal_questions,
                    'appetite_level' => $request->appetite_level,
                ]);
            }

            // Create initial measurement if provided
            if ($request->hasAny(['initial_weight', 'body_fat_percentage', 'muscle_percentage', 'other_composition'])) {
                Measurement::create([
                    'user_id' => $client->id,
                    'measurement_date' => now(),
                    'weight' => $request->initial_weight ?? $request->weight,
                    'body_fat_percentage' => $request->body_fat_percentage,
                    'muscle_percentage' => $request->muscle_percentage,
                    'other_composition' => $request->other_composition,
                ]);
            }

            // Create blood test if provided
            if ($request->hasAny(['hba1c', 'ldl', 'hdl', 'total_cholesterol', 'fasting_blood_sugar', 'triglycerides', 'blood_test_photo'])) {
                $bloodTestData = [
                    'user_id' => $client->id,
                    'test_date' => now(),
                    'hba1c' => $request->hba1c,
                    'ldl' => $request->ldl,
                    'hdl' => $request->hdl,
                    'total_cholesterol' => $request->total_cholesterol,
                    'fasting_blood_sugar' => $request->fasting_blood_sugar,
                    'triglycerides' => $request->triglycerides,
                ];

                // Handle blood test photo upload
                if ($request->hasFile('blood_test_photo')) {
                    $photo = $request->file('blood_test_photo');
                    $filename = time() . '_' . $photo->getClientOriginalName();
                    $path = $photo->storeAs('blood_tests', $filename, 'public');
                    $bloodTestData['blood_test_photo_path'] = $path;
                }

                BloodTest::create($bloodTestData);
            }

            // Create nutrition targets if provided
            if ($request->hasAny(['daily_calorie_target', 'carbs_target', 'carbs_percentage', 'protein_target', 'protein_percentage', 'fat_target', 'fat_percentage', 'tolerance_band', 'nutrition_notes'])) {
                NutritionTarget::create([
                    'user_id' => $client->id,
                    'daily_calorie_target' => $request->daily_calorie_target,
                    'carbs_target' => $request->carbs_target,
                    'carbs_percentage' => $request->carbs_percentage,
                    'protein_target' => $request->protein_target,
                    'protein_percentage' => $request->protein_percentage,
                    'fat_target' => $request->fat_target,
                    'fat_percentage' => $request->fat_percentage,
                    'tolerance_band' => $request->tolerance_band ?? 10,
                    'notes' => $request->nutrition_notes,
                    'is_active' => true,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Client created successfully',
                'client' => $client->load(['profile', 'activeNutritionTarget', 'measurements', 'bloodTests'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Client creation error:', ['error' => $e->getMessage()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create client: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all clients for the authenticated dietitian.
     */
    public function getClients(): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user->isDietitian()) {
            return response()->json([
                'success' => false,
                'message' => 'Only dietitians can access this endpoint'
            ], 403);
        }

        $clients = User::where('dietitian_id', $user->id)
            ->where('user_type', 'client')
            ->with(['profile', 'activeNutritionTarget', 'measurements' => function($query) {
                $query->latest()->limit(1);
            }, 'bloodTests' => function($query) {
                $query->latest()->limit(1);
            }])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'clients' => $clients
        ]);
    }

    /**
     * Get a specific client with full details.
     */
    public function getClient(string $id): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user->isDietitian()) {
            return response()->json([
                'success' => false,
                'message' => 'Only dietitians can access this endpoint'
            ], 403);
        }

        $client = User::where('dietitian_id', $user->id)
            ->where('id', $id)
            ->where('user_type', 'client')
            ->with(['profile', 'nutritionTargets', 'measurements', 'bloodTests'])
            ->firstOrFail();

        // Load the active nutrition target manually
        $client->active_nutrition_target = $client->nutritionTargets()->where('is_active', true)->latest()->first();

        return response()->json([
            'success' => true,
            'client' => $client
        ]);
    }

    /**
     * Update client information comprehensively.
     */
    public function updateClient(Request $request, string $id): JsonResponse
    {
        $dietitian = Auth::user();
        if (!$dietitian || !$dietitian->isDietitian()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $client = User::where('dietitian_id', $dietitian->id)
                    ->where('user_type', 'client')
                    ->where('id', $id)
                    ->firstOrFail();

        $validator = Validator::make($request->all(), [
            // Basic Account Information
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|unique:users,email,' . $id,
            'subscription_type' => ['required', Rule::in(['free', 'paid'])],
            
            // Client Profile Information
            'age' => 'nullable|integer|min:0',
            'gender' => ['nullable', Rule::in(['male', 'female', 'other'])],
            'height_cm' => 'nullable|numeric|min:0',
            'current_weight_kg' => 'nullable|numeric|min:0',
            'goal' => ['nullable', Rule::in(['lose_weight', 'maintain', 'gain_weight', 'gain_muscle'])],
            'health_conditions' => 'nullable|array',
            'health_conditions.*' => 'string|max:255',
            'allergies' => 'nullable|string|max:1000',
            'dietary_history_questions' => 'nullable|array',
            'body_goal_questions' => 'nullable|array',
            'appetite_level' => ['nullable', Rule::in(['low', 'medium', 'high'])],
            
            // Initial Measurements (optional)
            'initial_weight_kg' => 'nullable|numeric|min:0',
            'body_fat_percentage' => 'nullable|numeric|min:0|max:100',
            'muscle_percentage' => 'nullable|numeric|min:0|max:100',
            'other_composition_indicators' => 'nullable|array',
            
            // Blood Test Indicators (optional)
            'hba1c' => 'nullable|numeric|min:0',
            'ldl' => 'nullable|numeric|min:0',
            'hdl' => 'nullable|numeric|min:0',
            'total_cholesterol' => 'nullable|numeric|min:0',
            'fasting_blood_sugar' => 'nullable|numeric|min:0',
            'triglycerides' => 'nullable|numeric|min:0',
            'blood_test_photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            
            // Nutrition Targets
            'daily_calorie_target' => 'nullable|numeric|min:0',
            'carbs_target_grams' => 'nullable|numeric|min:0',
            'protein_target_grams' => 'nullable|numeric|min:0',
            'fat_target_grams' => 'nullable|numeric|min:0',
            'carbs_target_percentage' => 'nullable|numeric|min:0|max:100',
            'protein_target_percentage' => 'nullable|numeric|min:0|max:100',
            'fat_target_percentage' => 'nullable|numeric|min:0|max:100',
            'tolerance_band_percentage' => 'nullable|numeric|min:0|max:100',
            'target_notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            // 1. Update User Account
            $client->update([
                'name' => $request->name,
                'email' => $request->email,
                'subscription_type' => $request->subscription_type,
            ]);

            // 2. Update Client Profile
            $profile = $client->profile;
            if ($profile) {
                $profile->update([
                    'age' => $request->age,
                    'gender' => $request->gender,
                    'height_cm' => $request->height_cm,
                    'weight_kg' => $request->current_weight_kg,
                    'goal' => $request->goal,
                    'health_conditions' => $request->health_conditions,
                    'allergies' => $request->allergies,
                    'dietary_history_questions' => $request->dietary_history_questions,
                    'body_goal_questions' => $request->body_goal_questions,
                    'appetite_level' => $request->appetite_level,
                ]);
            } else {
                // Create profile if it doesn't exist
                $client->profile()->create([
                    'age' => $request->age,
                    'gender' => $request->gender,
                    'height_cm' => $request->height_cm,
                    'weight_kg' => $request->current_weight_kg,
                    'goal' => $request->goal,
                    'health_conditions' => $request->health_conditions,
                    'allergies' => $request->allergies,
                    'dietary_history_questions' => $request->dietary_history_questions,
                    'body_goal_questions' => $request->body_goal_questions,
                    'appetite_level' => $request->appetite_level,
                ]);
            }

            // 3. Update Nutrition Target
            $nutritionTarget = $client->activeNutritionTarget;
            if ($nutritionTarget) {
                $nutritionTarget->update([
                    'daily_calorie_target' => $request->daily_calorie_target,
                    'carbs_target' => $request->carbs_target_grams,
                    'protein_target' => $request->protein_target_grams,
                    'fat_target' => $request->fat_target_grams,
                    'carbs_percentage' => $request->carbs_target_percentage,
                    'protein_percentage' => $request->protein_target_percentage,
                    'fat_percentage' => $request->fat_target_percentage,
                    'tolerance_band' => $request->tolerance_band_percentage ?? 10,
                    'notes' => $request->target_notes,
                ]);
            } else {
                // Create nutrition target if it doesn't exist
                $client->nutritionTargets()->create([
                    'daily_calorie_target' => $request->daily_calorie_target,
                    'carbs_target' => $request->carbs_target_grams,
                    'protein_target' => $request->protein_target_grams,
                    'fat_target' => $request->fat_target_grams,
                    'carbs_percentage' => $request->carbs_target_percentage,
                    'protein_percentage' => $request->protein_target_percentage,
                    'fat_percentage' => $request->fat_target_percentage,
                    'tolerance_band' => $request->tolerance_band_percentage ?? 10,
                    'notes' => $request->target_notes,
                    'is_active' => true,
                ]);
            }

            // 4. Update Initial Measurement (if provided)
            if ($request->filled('initial_weight_kg') || $request->filled('body_fat_percentage') || $request->filled('muscle_percentage') || $request->filled('other_composition_indicators')) {
                $measurement = $client->measurements()->latest()->first();
                if ($measurement) {
                    $measurement->update([
                        'weight' => $request->initial_weight_kg,
                        'body_fat_percentage' => $request->body_fat_percentage,
                        'muscle_percentage' => $request->muscle_percentage,
                        'other_composition' => $request->other_composition_indicators,
                    ]);
                } else {
                    $client->measurements()->create([
                        'weight' => $request->initial_weight_kg,
                        'body_fat_percentage' => $request->body_fat_percentage,
                        'muscle_percentage' => $request->muscle_percentage,
                        'other_composition' => $request->other_composition_indicators,
                        'measurement_date' => now()->toDateString(),
                    ]);
                }
            }

            // 5. Update Blood Test (if provided)
            if ($request->filled('hba1c') || $request->filled('ldl') || $request->filled('hdl') || $request->filled('total_cholesterol') || $request->filled('fasting_blood_sugar') || $request->filled('triglycerides') || $request->hasFile('blood_test_photo')) {
                $bloodTest = $client->bloodTests()->latest()->first();
                $bloodTestData = [
                    'hba1c' => $request->hba1c,
                    'ldl' => $request->ldl,
                    'hdl' => $request->hdl,
                    'total_cholesterol' => $request->total_cholesterol,
                    'fasting_blood_sugar' => $request->fasting_blood_sugar,
                    'triglycerides' => $request->triglycerides,
                ];
                
                if ($request->hasFile('blood_test_photo')) {
                    $photoPath = $request->file('blood_test_photo')->store('blood_tests', 'public');
                    $bloodTestData['photo_path'] = $photoPath;
                }
                
                if ($bloodTest) {
                    $bloodTest->update($bloodTestData);
                } else {
                    $bloodTestData['tested_at'] = now();
                    $client->bloodTests()->create($bloodTestData);
                }
            }

            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Client updated successfully!',
                'client' => $client->load(['profile', 'activeNutritionTarget', 'measurements', 'bloodTests'])
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Client update failed: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['success' => false, 'message' => 'Failed to update client: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get client's nutrition goals for mobile app
     */
    public function getNutritionGoals(): JsonResponse
    {
        $client = Auth::user();
        if (!$client || !$client->isClient()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $nutritionTarget = $client->activeNutritionTarget;
        
        if (!$nutritionTarget) {
            return response()->json([
                'success' => true,
                'goals' => null,
                'message' => 'No nutrition goals set'
            ]);
        }

        return response()->json([
            'success' => true,
            'goals' => [
                'daily_calorie_target' => $nutritionTarget->daily_calorie_target,
                'protein_target_grams' => $nutritionTarget->protein_target,
                'carbs_target_grams' => $nutritionTarget->carbs_target,
                'fat_target_grams' => $nutritionTarget->fat_target,
            ]
        ]);
    }

    /**
     * Delete a client.
     */
    public function deleteClient(string $id): JsonResponse
    {
        $dietitian = Auth::user();
        if (!$dietitian || !$dietitian->isDietitian()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $client = User::where('dietitian_id', $dietitian->id)
                    ->where('user_type', 'client')
                    ->where('id', $id)
                    ->firstOrFail();

        try {
            // Delete the client (cascade will handle related records)
            $client->delete();

            return response()->json([
                'success' => true,
                'message' => 'Client deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete client: ' . $e->getMessage()
            ], 500);
        }
    }
}