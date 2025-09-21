<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ChatController extends Controller
{
    // Create or get chat for client and their dietitian
    public function initWithClient(Request $request, $clientId)
    {
        $user = $request->user();

        // Only dietitian can initialize with a client
        if (!$user->isDietitian()) {
            return response()->json(['success' => false, 'message' => 'Only dietitians can start chats'], 403);
        }

        $client = User::where('user_type', 'client')->findOrFail($clientId);

        // Optional: enforce that this client belongs to the dietitian
        if ($client->dietitian_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Client is not assigned to you'], 403);
        }

        $chat = Chat::firstOrCreate([
            'dietitian_id' => $user->id,
            'client_id' => $client->id,
        ]);

        return response()->json(['success' => true, 'chat' => $chat]);
    }

    // List chats for current user
    public function listChats(Request $request)
    {
        $user = $request->user();

        if ($user->isDietitian()) {
            $chats = Chat::with(['client:id,name,username', 'dietitian:id,name'])
                ->where('dietitian_id', $user->id)
                ->orderByDesc('last_message_at')
                ->get();
        } else {
            $chats = Chat::with(['client:id,name,username', 'dietitian:id,name'])
                ->where('client_id', $user->id)
                ->orderByDesc('last_message_at')
                ->get();
        }

        return response()->json(['success' => true, 'chats' => $chats]);
    }

    // Get or create the single chat for a client with their dietitian
    public function myChat(Request $request)
    {
        $user = $request->user();
        if (!$user->isClient()) {
            return response()->json(['success' => false, 'message' => 'Only clients have a single chat'], 403);
        }

        if (!$user->dietitian_id) {
            return response()->json(['success' => false, 'message' => 'No dietitian assigned'], 400);
        }

        $chat = Chat::firstOrCreate([
            'dietitian_id' => $user->dietitian_id,
            'client_id' => $user->id,
        ]);

        // Reload with relations for client display
        $chat = Chat::with(['dietitian:id,name,username'])->find($chat->id);

        return response()->json(['success' => true, 'chat' => $chat]);
    }

    // Fetch messages in a chat
    public function getMessages(Request $request, $chatId)
    {
        $user = $request->user();
        $chat = Chat::findOrFail($chatId);

        if (!$this->canAccessChat($user, $chat)) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }

        $messages = Message::where('chat_id', $chat->id)
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json(['success' => true, 'messages' => $messages]);
    }

    // Send a message
    public function sendMessage(Request $request, $chatId)
    {
        $user = $request->user();
        $chat = Chat::findOrFail($chatId);

        if (!$this->canAccessChat($user, $chat)) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }

        $validator = Validator::make($request->all(), [
            'text' => 'required|string|max:5000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $message = null;
        DB::transaction(function () use ($request, $chat, $user, &$message) {
            $message = Message::create([
                'chat_id' => $chat->id,
                'sender_id' => $user->id,
                'text' => $request->text,
            ]);
            $chat->last_message_at = now();
            $chat->save();
        });

        return response()->json(['success' => true, 'message' => $message]);
    }

    private function canAccessChat(User $user, Chat $chat): bool
    {
        if ($user->isDietitian() && $chat->dietitian_id === $user->id) return true;
        if ($user->isClient() && $chat->client_id === $user->id) return true;
        return false;
    }
} 