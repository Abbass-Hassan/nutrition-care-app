<?php

namespace App\Http\Controllers;

use App\Models\Food;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Database\QueryException;

class FoodController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $foods = Food::where('dietitian_id', Auth::id())
            ->where('approval_status', 'approved')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'foods' => $foods
        ]);
    }

    /**
     * Get foods for a client (from their dietitian) - only approved foods.
     */
    public function getClientFoods(): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user->isClient()) {
            return response()->json([
                'success' => false,
                'message' => 'Only clients can access this endpoint'
            ], 403);
        }

        if (!$user->dietitian_id) {
            return response()->json([
                'success' => false,
                'message' => 'No dietitian assigned'
            ], 404);
        }

        // Get dietitian's approved foods + client's approved custom foods
        $foods = Food::where(function($query) use ($user) {
                $query->where('dietitian_id', $user->dietitian_id)
                      ->where('approval_status', 'approved');
            })
            ->orWhere(function($query) use ($user) {
                $query->where('created_by_client_id', $user->id)
                      ->where('approval_status', 'approved');
            })
            ->orderBy('category')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'foods' => $foods
        ]);
    }

    /**
     * Client submits a custom food for approval.
     */
    public function submitClientFood(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user->isClient()) {
            return response()->json([
                'success' => false,
                'message' => 'Only clients can submit custom foods'
            ], 403);
        }

        if (!$user->dietitian_id) {
            return response()->json([
                'success' => false,
                'message' => 'No dietitian assigned'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'default_serving' => 'nullable|string|max:255',
            'calories' => 'required|numeric|min:0',
            'carbs' => 'nullable|numeric|min:0',
            'protein' => 'nullable|numeric|min:0',
            'fat' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $request->only([
                'name', 'default_serving', 'calories',
                'carbs', 'protein', 'fat'
            ]);

            $data['dietitian_id'] = $user->dietitian_id;
            $data['created_by_client_id'] = $user->id;
            $data['category'] = 'Custom Food';
            $data['default_serving'] = $data['default_serving'] ?? '1 serving';
            $data['approval_status'] = 'pending';
            $data['calories'] = (float) $data['calories'];
            $data['carbs'] = isset($data['carbs']) ? (float) $data['carbs'] : 0;
            $data['protein'] = isset($data['protein']) ? (float) $data['protein'] : 0;
            $data['fat'] = isset($data['fat']) ? (float) $data['fat'] : 0;

            $food = Food::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Food submitted for approval',
                'food' => $food
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Client food submission error:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit food for approval.'
            ], 500);
        }
    }

    /**
     * Get pending foods for dietitian approval.
     */
    public function getPendingFoods(): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user->isDietitian()) {
            return response()->json([
                'success' => false,
                'message' => 'Only dietitians can access this endpoint'
            ], 403);
        }

        $pendingFoods = Food::where('dietitian_id', $user->id)
            ->where('approval_status', 'pending')
            ->with('createdByClient:id,name,email')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'pending_foods' => $pendingFoods
        ]);
    }

    /**
     * Approve a food.
     */
    public function approveFood(string $id): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user->isDietitian()) {
            return response()->json([
                'success' => false,
                'message' => 'Only dietitians can approve foods'
            ], 403);
        }

        $food = Food::where('dietitian_id', $user->id)
            ->where('id', $id)
            ->firstOrFail();

        $food->update([
            'approval_status' => 'approved',
            'approved_at' => now(),
            'approved_by_dietitian_id' => $user->id,
            'rejection_reason' => null
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Food approved successfully',
            'food' => $food->fresh()
        ]);
    }

    /**
     * Edit a pending food.
     */
    public function editPendingFood(Request $request, string $id): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user->isDietitian()) {
            return response()->json([
                'success' => false,
                'message' => 'Only dietitians can edit foods'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'default_serving' => 'nullable|string|max:255',
            'calories' => 'required|numeric|min:0',
            'carbs' => 'nullable|numeric|min:0',
            'protein' => 'nullable|numeric|min:0',
            'fat' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $food = Food::where('dietitian_id', $user->id)
            ->where('id', $id)
            ->where('approval_status', 'pending')
            ->firstOrFail();

        $data = $request->only([
            'name', 'default_serving', 'calories',
            'carbs', 'protein', 'fat'
        ]);

        $data['calories'] = (float) $data['calories'];
        $data['carbs'] = isset($data['carbs']) ? (float) $data['carbs'] : 0;
        $data['protein'] = isset($data['protein']) ? (float) $data['protein'] : 0;
        $data['fat'] = isset($data['fat']) ? (float) $data['fat'] : 0;

        $food->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Food updated successfully',
            'food' => $food->fresh()
        ]);
    }

    /**
     * Reject a food.
     */
    public function rejectFood(Request $request, string $id): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user->isDietitian()) {
            return response()->json([
                'success' => false,
                'message' => 'Only dietitians can reject foods'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'reason' => 'nullable|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $food = Food::where('dietitian_id', $user->id)
            ->where('id', $id)
            ->firstOrFail();

        $food->update([
            'approval_status' => 'rejected',
            'rejection_reason' => $request->input('reason'),
            'approved_at' => null,
            'approved_by_dietitian_id' => null
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Food rejected',
            'food' => $food->fresh()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        // Debug: Log the incoming request data
        \Log::info('Food creation request data:', $request->all());

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:foods,name,NULL,id,dietitian_id,' . Auth::id(),
            'category' => 'required|string|max:255',
            'default_serving' => 'required|string|max:255',
            'calories' => 'required|numeric|min:0',
            'carbs' => 'nullable|numeric|min:0',
            'protein' => 'nullable|numeric|min:0',
            'fat' => 'nullable|numeric|min:0',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            \Log::error('Validation failed:', $validator->errors()->toArray());
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $request->only([
                'name', 'category', 'default_serving', 'calories',
                'carbs', 'protein', 'fat', 'notes'
            ]);
            $data['dietitian_id'] = Auth::id();

            // Convert to proper numeric types
            \Log::info('Food update data received:', [
                'calories' => $data['calories'],
                'carbs' => $data['carbs'],
                'protein' => $data['protein'],
                'fat' => $data['fat']
            ]);            $data['calories'] = (float) $data['calories'];
            $data['carbs'] = $data['carbs'] === '' ? 0 : (float) $data['carbs'];
            $data['protein'] = $data['protein'] === '' ? 0 : (float) $data['protein'];
            $data['fat'] = $data['fat'] === '' ? 0 : (float) $data['fat'];
            $data['notes'] = $data['notes'] === '' ? null : $data['notes'];

            // Handle photo upload
            if ($request->hasFile('photo')) {
                $photo = $request->file('photo');
                $filename = time() . '_' . $photo->getClientOriginalName();
                $path = $photo->storeAs('foods', $filename, 'public');
                $data['photo_path'] = $path;
            }

            $food = Food::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Food created successfully',
                'food' => $food
            ], 201);

        } catch (QueryException $e) {
            if ($e->getCode() == '23000') { // integrity constraint violation
                return response()->json([
                    'success' => false,
                    'message' => 'A food with this name already exists.',
                ], 409);
            }
            \Log::error('Food creation DB error:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Database error occurred while creating food.'
            ], 500);
        } catch (\Exception $e) {
            \Log::error('Food creation error:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to create food.'
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $food = Food::where('dietitian_id', Auth::id())->findOrFail($id);

        return response()->json([
            'success' => true,
            'food' => $food
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $food = Food::where('dietitian_id', Auth::id())->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:foods,name,' . $id . ',id,dietitian_id,' . Auth::id(),
            'category' => 'required|string|max:255',
            'default_serving' => 'required|string|max:255',
            'calories' => 'required|numeric|min:0',
            'carbs' => 'nullable|numeric|min:0',
            'protein' => 'nullable|numeric|min:0',
            'fat' => 'nullable|numeric|min:0',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $request->only([
                'name', 'category', 'default_serving', 'calories',
                'carbs', 'protein', 'fat', 'notes'
            ]);

            // Convert to proper numeric types
            \Log::info('Food update data received:', [
                'calories' => $data['calories'],
                'carbs' => $data['carbs'],
                'protein' => $data['protein'],
                'fat' => $data['fat']
            ]);            $data['calories'] = (float) $data['calories'];
            $data['carbs'] = $data['carbs'] === '' ? 0 : (float) $data['carbs'];
            $data['protein'] = $data['protein'] === '' ? 0 : (float) $data['protein'];
            $data['fat'] = $data['fat'] === '' ? 0 : (float) $data['fat'];
            $data['notes'] = $data['notes'] === '' ? null : $data['notes'];

            // Handle photo upload
            if ($request->hasFile('photo')) {
                // Delete old photo if exists
                if ($food->photo_path && Storage::disk('public')->exists($food->photo_path)) {
                    Storage::disk('public')->delete($food->photo_path);
                }

                $photo = $request->file('photo');
                $filename = time() . '_' . $photo->getClientOriginalName();
                $path = $photo->storeAs('foods', $filename, 'public');
                $data['photo_path'] = $path;
            }

            $food->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Food updated successfully',
                'food' => $food->fresh()
            ]);

        } catch (QueryException $e) {
            if ($e->getCode() == '23000') {
                return response()->json([
                    'success' => false,
                    'message' => 'A food with this name already exists.',
                ], 409);
            }
            return response()->json([
                'success' => false,
                'message' => 'Database error occurred while updating food.'
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update food.'
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $food = Food::where('dietitian_id', Auth::id())->findOrFail($id);
            
            // Delete photo file if exists
            if ($food->photo_path && Storage::disk('public')->exists($food->photo_path)) {
                Storage::disk('public')->delete($food->photo_path);
            }

            $food->delete();

            return response()->json([
                'success' => true,
                'message' => 'Food deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete food: ' . $e->getMessage()
            ], 500);
        }
    }
}
