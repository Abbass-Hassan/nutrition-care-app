<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

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
    Route::post('/signout', [AuthController::class, 'signOut']);
    Route::get('/profile', [AuthController::class, 'profile']);
});

// Health check route
Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'timestamp' => now(),
        'message' => 'Nutrition Care API is running'
    ]);
}); 