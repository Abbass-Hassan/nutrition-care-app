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
        // Determine validation rules based on user type
        if ($request->user_type === 'client') {
            $validator = Validator::make($request->all(), [
                'username' => 'required|string',
                'password' => 'required|string',
                'user_type' => 'required|in:dietitian,client',
            ]);
        } else {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'password' => 'required|string',
                'user_type' => 'required|in:dietitian,client',
            ]);
        }

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Prepare credentials based on user type
        if ($request->user_type === 'client') {
            $credentials = [
                'username' => $request->username,
                'password' => $request->password
            ];
        } else {
            $credentials = [
                'email' => $request->email,
                'password' => $request->password
            ];
        }
        
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
                    'username' => $user->username,
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
     * Sign Up (dietitians can register themselves, or create client accounts)
     */
    public function signUp(Request $request)
    {
        // Different validation rules based on user type
        if ($request->user_type === 'client') {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'username' => 'required|string|max:255|unique:users,username',
                'password' => 'required|string|min:8|confirmed',
                'user_type' => 'required|in:dietitian,client',
                'email' => 'nullable|email|unique:users,email', // Optional for clients
            ]);
        } else {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:8|confirmed',
                'user_type' => 'required|in:dietitian,client',
            ]);
        }

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Prepare user data based on user type
        if ($request->user_type === 'client') {
            $userData = [
                'name' => $request->name,
                'username' => $request->username,
                'password' => Hash::make($request->password),
                'user_type' => $request->user_type,
            ];
            
            // Add email if provided
            if ($request->email) {
                $userData['email'] = $request->email;
            }
        } else {
            $userData = [
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'user_type' => $request->user_type,
            ];
        }

        $user = User::create($userData);

        $token = $user->createToken($request->user_type . '-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => ucfirst($request->user_type) . ' registered successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'username' => $user->username,
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

    /**
     * Get clients for dietitians
     */
    public function getClients(Request $request)
    {
        $user = $request->user();
        
        // Only dietitians can access this endpoint
        if (!$user->isDietitian()) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Only dietitians can view clients.'
            ], 403);
        }

        $clients = User::where('user_type', 'client')
                      ->orderBy('created_at', 'desc')
                      ->get(['id', 'name', 'username', 'email', 'created_at']);

        return response()->json([
            'success' => true,
            'clients' => $clients
        ]);
    }

    // Get single client by ID
    public function getClient($id)
    {
        try {
            $client = User::where('user_type', 'client')->findOrFail($id);
            
            return response()->json([
                'success' => true,
                'client' => $client
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Client not found'
            ], 404);
        }
    }

    // Update client information
    public function updateClient(Request $request, $id)
    {
        try {
            $client = User::where('user_type', 'client')->findOrFail($id);
            
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'nullable|email|unique:users,email,' . $id,
                'subscription_type' => 'required|in:paid,free'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $client->update([
                'name' => $request->name,
                'email' => $request->email,
                'subscription_type' => $request->subscription_type
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Client updated successfully',
                'client' => $client
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Client not found'
            ], 404);
        }
    }
} 