<?php

namespace App\Http\Controllers;

use App\Ai\Agents\AppointmentAssistant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AssistantController extends Controller
{
    public function index(Request $request){
        return Inertia::render('assistant/index',[
            'conversations' => DB::table('agent_conversations')
            ->where('participant_id', $request->user()->id)
            ->where('participant_type', get_class($request->user()))
            ->orderByDesc('updated_at')
            ->limit(30)
            ->get(['id', 'title', 'updated_at']),

        ]);
    }

   public function show(Request $request, string $conversation): JsonResponse
{
    $ownsConversation = DB::table('agent_conversations')
        ->where('id', $conversation)
        ->where('participant_id', $request->user()->id)
        ->where('participant_type', get_class($request->user()))
        ->exists();

    abort_unless($ownsConversation, 404);

    $messages = DB::table('agent_conversation_messages')
        ->where('conversation_id', $conversation)
        ->whereIn('role', ['user', 'assistant'])
        ->orderBy('id')
        ->get(['role', 'content'])
        ->filter(fn ($message) => filled($message->content))
        ->map(fn ($message) => [
            'role' => $message->role,
            'content' => $message->content,
        ])
        ->values();

    return response()->json([
        'conversation_id' => $conversation,
        'messages' => $messages,
    ]);
}


    public function message(Request $request){
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
            'conversation_id' => ['nullable', 'string']
        ]);

        $assistant = new AppointmentAssistant;

        if($validated['conversation_id']){
            $assistant->continue($validated['conversation_id'], as: $request->user());
        }else{
            $assistant->forUser($request->user());
        }

        $response = $assistant->prompt($validated['message']);

        return response()->json([
            'reply' => (string) $response,
            'conversation_id' => $response->conversationId,
        ]);
    }
}
