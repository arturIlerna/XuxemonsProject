<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Friendship;

class FriendController extends Controller
{
    // Buscar usuarios por ID o nombre (mínimo 3 caracteres)
    public function search(Request $request)
    {
        $request->validate([
            'query' => 'required|string|min:3'
        ]);
        
        $query = $request->input('query'); // Cambiado de $request->query a $request->input()
        $userId = auth()->id();
        
        $users = User::where('id', '!=', $userId)
            ->where(function($q) use ($query) {
                $q->where('xuxe_id', 'LIKE', "%{$query}%")
                  ->orWhere('name', 'LIKE', "%{$query}%")
                  ->orWhere('email', 'LIKE', "%{$query}%");
            })
            ->limit(10)
            ->get();
        
        // Añadir estado de amistad
        foreach ($users as $user) {
            $friendship = Friendship::where(function($q) use ($userId, $user) {
                $q->where('user_id', $userId)->where('friend_id', $user->id);
            })->orWhere(function($q) use ($userId, $user) {
                $q->where('user_id', $user->id)->where('friend_id', $userId);
            })->first();
            
            $user->friendship_status = $friendship ? $friendship->status : null;
            $user->friendship_id = $friendship ? $friendship->id : null;
        }
        
        return response()->json($users);
    }
    
    // Enviar solicitud
    public function sendRequest(Request $request)
    {
        $request->validate([
            'friend_id' => 'required|exists:users,id|different:user_id'
        ]);
        
        $userId = auth()->id();
        $friendId = $request->friend_id;
        
        $exists = Friendship::where(function($q) use ($userId, $friendId) {
            $q->where('user_id', $userId)->where('friend_id', $friendId);
        })->orWhere(function($q) use ($userId, $friendId) {
            $q->where('user_id', $friendId)->where('friend_id', $userId);
        })->exists();
        
        if ($exists) {
            return response()->json(['error' => 'Ya existe una solicitud o ya son amigos'], 400);
        }
        
        $friendship = Friendship::create([
            'user_id' => $userId,
            'friend_id' => $friendId,
            'status' => 'pending'
        ]);
        
        return response()->json([
            'message' => 'Solicitud enviada',
            'friendship' => $friendship
        ]);
    }
    
    // Aceptar solicitud
    public function acceptRequest($id)
    {
        $friendship = Friendship::where('id', $id)
            ->where('friend_id', auth()->id())
            ->where('status', 'pending')
            ->firstOrFail();
        
        $friendship->status = 'accepted';
        $friendship->save();
        
        return response()->json(['message' => 'Solicitud aceptada']);
    }
    
    // Rechazar solicitud
    public function rejectRequest($id)
    {
        $friendship = Friendship::where('id', $id)
            ->where('friend_id', auth()->id())
            ->where('status', 'pending')
            ->firstOrFail();
        
        $friendship->delete();
        
        return response()->json(['message' => 'Solicitud rechazada']);
    }
    
    // Eliminar amigo
    public function removeFriend($id)
    {
        $friendship = Friendship::where('id', $id)
            ->where(function($q) {
                $q->where('user_id', auth()->id())
                  ->orWhere('friend_id', auth()->id());
            })
            ->where('status', 'accepted')
            ->firstOrFail();
        
        $friendship->delete();
        
        return response()->json(['message' => 'Amigo eliminado']);
    }
    
    // Listar solicitudes pendientes recibidas
    public function pendingRequests()
    {
        $requests = Friendship::with('user')
            ->where('friend_id', auth()->id())
            ->where('status', 'pending')
            ->get();
        
        return response()->json($requests);
    }
    
    // Listar amigos aceptados
    public function friendsList()
    {
        $userId = auth()->id();
        
        $friends = Friendship::where(function($q) use ($userId) {
            $q->where('user_id', $userId)->where('status', 'accepted');
        })->orWhere(function($q) use ($userId) {
            $q->where('friend_id', $userId)->where('status', 'accepted');
        })->with('user', 'friend')->get();
        
        $result = [];
        foreach ($friends as $friendship) {
            if ($friendship->user_id == $userId) {
                $result[] = $friendship->friend;
            } else {
                $result[] = $friendship->user;
            }
        }
        
        return response()->json($result);
    }
    
    // Contar solicitudes pendientes (para el badge)
    public function pendingCount()
    {
        $count = Friendship::where('friend_id', auth()->id())
            ->where('status', 'pending')
            ->count();
        
        return response()->json(['count' => $count]);
    }
}