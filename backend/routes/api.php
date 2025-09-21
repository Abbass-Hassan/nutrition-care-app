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
        return $request->user();
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
});
