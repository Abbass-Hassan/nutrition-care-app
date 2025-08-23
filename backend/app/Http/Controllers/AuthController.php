<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * Sign In (for both dietitians and clients)
     */
    public function signIn(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
            'user_type' => 'required|in:dietitian,client',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $credentials = $request->only('email', 'password');
        
        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            
            // Check if user type matches
            if ($user->user_type !== $request->user_type) {
                Auth::logout();
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Invalid user type for this platform.'
                ], 403);
            }

            $token = $user->createToken($request->user_type . '-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => ucfirst($request->user_type) . ' signed in successfully',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'user_type' => $user->user_type,
                    'created_at' => $user->created_at
                ],
                'token' => $token
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Invalid credentials'
        ], 401);
    }

    /**
     * Sign Up (for both dietitians and clients)
     */
    public function signUp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'user_type' => 'required|in:dietitian,client',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'user_type' => $request->user_type,
        ]);

        $token = $user->createToken($request->user_type . '-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => ucfirst($request->user_type) . ' registered successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'user_type' => $user->user_type,
                'created_at' => $user->created_at
            ],
            'token' => $token
        ], 201);
    }

    /**
     * Sign Out
     */
    public function signOut(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Signed out successfully'
        ]);
    }

    /**
     * Get current user profile
     */
    public function profile(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'success' => true,
            'user' => $user
        ]);
    }
} 