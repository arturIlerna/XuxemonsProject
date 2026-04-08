<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Xuxemon;
use App\Models\UserXuxemon;
use App\Models\UserItem;

class AdminController extends Controller
{
    // 1. Dar un Xuxemon Aleatorio a un jugador
    public function giveRandomXuxemon(Request $request)
    {
        // Validamos que nos envíen el ID del jugador
        $request->validate(['user_id' => 'required|exists:users,id']);

        // Cogemos un Xuxemon aleatorio del catálogo global
        $randomXuxemon = Xuxemon::inRandomOrder()->first();

        // Se lo guardamos al usuario en su colección
        UserXuxemon::create([
            'user_id' => $request->user_id,
            'xuxemon_id' => $randomXuxemon->id,
            'size' => 'Pequeño' // Siempre nacen pequeños
        ]);

        return response()->json([
            'message' => '¡Xuxemon aleatorio regalado con éxito!',
            'xuxemon' => $randomXuxemon->name
        ], 200);
    }

    // 2. Dar cantidad de Chuches a un jugador
    public function giveXuxes(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'name' => 'required|string', // ej: "Chuche de Fresa"
            'quantity' => 'required|integer|min:1'
        ]);

        $userId = $request->user_id;
        $name = $request->name;
        $quantityToGive = $request->quantity;

        // FASE 1: Rellenar huecos que ya existan y tengan menos de 5 chuches
        $existingSlots = UserItem::where('user_id', $userId)
            ->where('name', $name)
            ->where('type', 'apilable')
            ->where('quantity', '<', 5)
            ->get();

        foreach ($existingSlots as $slot) {
            if ($quantityToGive <= 0) break;

            $spaceLeft = 5 - $slot->quantity;
            if ($quantityToGive <= $spaceLeft) {
                $slot->quantity += $quantityToGive;
                $slot->save();
                $quantityToGive = 0;
            } else {
                $slot->quantity = 5;
                $slot->save();
                $quantityToGive -= $spaceLeft;
            }
        }

        // FASE 2: Si sobran chuches, buscar huecos nuevos (Máximo 20 slots)
        if ($quantityToGive > 0) {
            // Sacamos un array con los números de los huecos ocupados (ej: [1, 2, 5])
            $occupiedSlots = UserItem::where('user_id', $userId)->pluck('slot')->toArray();
            
            for ($i = 1; $i <= 20; $i++) {
                if ($quantityToGive <= 0) break;

                // Si el slot $i no está ocupado, metemos chuches ahí
                if (!in_array($i, $occupiedSlots)) {
                    $giveNow = min(5, $quantityToGive); // Máximo 5 por slot
                    
                    UserItem::create([
                        'user_id' => $userId,
                        'name' => $name,
                        'type' => 'apilable',
                        'quantity' => $giveNow,
                        'slot' => $i
                    ]);
                    
                    $occupiedSlots[] = $i; // Marcamos este hueco como ocupado
                    $quantityToGive -= $giveNow;
                }
            }
        }

        // Si después de todo sobra $quantityToGive, se descarta (como dice la rúbrica)
        return response()->json(['message' => '¡Chuches inyectadas en la mochila!'], 200);
    }
}