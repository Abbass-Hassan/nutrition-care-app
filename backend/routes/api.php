<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ChatController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public authentication routes
Route::post('/signin', [AuthController::class, 'signIn']);
Route::post('/signup', [AuthController::class, 'signUp']);

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        $user = $request->user();
        
        // For clients, load profile and nutrition target
        if ($user->isClient()) {
            $user->load(['profile', 'activeNutritionTarget']);
        }
        
        return $user;
    });

    // Clients (dietitian-only) - controller already enforces access
    Route::get('/clients', [AuthController::class, 'getClients']);
    Route::get('/clients/{id}', [AuthController::class, 'getClient']);
    Route::put('/clients/{id}', [AuthController::class, 'updateClient']);

    // Chats
    Route::get('/chats', [ChatController::class, 'listChats']);
    Route::get('/my-chat', [ChatController::class, 'myChat']); // client-only
    Route::post('/chats/init/{clientId}', [ChatController::class, 'initWithClient']); // dietitian-only
    Route::get('/chats/{chatId}/messages', [ChatController::class, 'getMessages']);
    Route::post('/chats/{chatId}/messages', [ChatController::class, 'sendMessage']);
});

// Health check route
Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'timestamp' => now(),
        'message' => 'Nutrition Care API is running'
    ]);
}); 
// Food management routes
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('foods', App\Http\Controllers\FoodController::class);
    Route::get('/client-foods', [App\Http\Controllers\FoodController::class, 'getClientFoods']);
    
    // Client food submission
    Route::post('/client-foods/submit', [App\Http\Controllers\FoodController::class, 'submitClientFood']);
    
    // Dietitian food approval
    Route::get('/pending-foods', [App\Http\Controllers\FoodController::class, 'getPendingFoods']);
    Route::post('/foods/{id}/approve', [App\Http\Controllers\FoodController::class, 'approveFood']);
    Route::post('/foods/{id}/reject', [App\Http\Controllers\FoodController::class, 'rejectFood']);
    Route::put('/foods/{id}/edit-pending', [App\Http\Controllers\FoodController::class, 'editPendingFood']);
    
        // Client management
        Route::post('/clients', [App\Http\Controllers\ClientController::class, 'createClient']);
        Route::get('/clients', [App\Http\Controllers\ClientController::class, 'getClients']);
        Route::get('/clients/{id}', [App\Http\Controllers\ClientController::class, 'getClient']);
        Route::put('/clients/{id}/update', [App\Http\Controllers\ClientController::class, 'updateClient']);
        Route::delete('/clients/{id}', [App\Http\Controllers\ClientController::class, 'deleteClient']);
        
        // Client nutrition goals (for mobile app)
        Route::get('/nutrition-goals', [App\Http\Controllers\ClientController::class, 'getNutritionGoals']);
        
        // Daily Progress Tracking
        Route::post('/progress/daily', [App\Http\Controllers\ProgressController::class, 'saveDailyProgress']);
        Route::get('/progress/daily', [App\Http\Controllers\ProgressController::class, 'getDailyProgress']);
        Route::get('/progress/clients', [App\Http\Controllers\ProgressController::class, 'getAllClientsProgress']);
        Route::get('/progress/clients/{clientId}', [App\Http\Controllers\ProgressController::class, 'getClientProgress']);
        Route::get('/progress/clients/{clientId}/weekly', [App\Http\Controllers\ProgressController::class, 'getWeeklySummary']);
});
