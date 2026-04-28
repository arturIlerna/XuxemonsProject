<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Xuxemon;
use App\Models\UserXuxemon;
use App\Models\UserItem;
use App\Models\Item; 
use App\Models\Configuracion; // ← Agregar esta importación

class AdminController extends Controller
{
    // Obtenemos el catálogo global de Chuches
    public function getItems()
    {
        // Devuelve las 3 chuches que creamos en el Seeder
        return response()->json(Item::all(), 200);
    }

    // Dar un Xuxemon Aleatorio a un jugador
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

    // Dar cantidad de Chuches a un jugador 
    public function giveXuxes(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'name' => 'required|string', 
            'quantity' => 'required|integer|min:1'
        ]);

        $userId = $request->user_id;
        $name = $request->name;
        $quantityToGive = $request->quantity;

        // Rellenar huecos que ya existan y tengan menos de 5 chuches
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

        // Si sobran chuches, buscar huecos nuevos (Máximo 20 slots)
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

        // GESTIÓN DEL MENSAJE FINAL (Con o sin descartes) 
        // Si después de todo sobra $quantityToGive, significa que se han tirado a la basura
        $discarded = $quantityToGive > 0;
        
        if ($discarded) {
            return response()->json([
                'message' => "Se han guardado las posibles, pero se han descartado $quantityToGive chuches por falta de espacio en la mochila.",
                'discarded' => true
            ], 200);
        }

        return response()->json([
            'message' => '¡Todas las chuches inyectadas en la mochila correctamente!',
            'discarded' => false
        ], 200);
    }

    // ========== NUEVOS MÉTODOS PARA CONFIGURACIÓN ==========

    // Obtener todas las configuraciones
    public function getConfig()
    {
        $configs = Configuracion::all();
        return response()->json($configs, 200);
    }

    // Actualizar configuraciones
    public function updateConfig(Request $request)
    {
        $request->validate([
            'hora_xuxes_diarias' => 'nullable|date_format:H:i',
            'cantidad_xuxes_diarias' => 'nullable|integer|min:1|max:100',
            'hora_xuxemon_diario' => 'nullable|date_format:H:i',
        ]);
        
        if ($request->has('hora_xuxes_diarias')) {
            Configuracion::updateOrCreate(
                ['clave' => 'hora_xuxes_diarias'],
                ['valor' => json_encode($request->hora_xuxes_diarias)]
            );
        }
        
        if ($request->has('cantidad_xuxes_diarias')) {
            Configuracion::updateOrCreate(
                ['clave' => 'cantidad_xuxes_diarias'],
                ['valor' => json_encode($request->cantidad_xuxes_diarias)]
            );
        }
        
        if ($request->has('hora_xuxemon_diario')) {
            Configuracion::updateOrCreate(
                ['clave' => 'hora_xuxemon_diario'],
                ['valor' => json_encode($request->hora_xuxemon_diario)]
            );
        }
        
        return response()->json(['message' => 'Configuración actualizada correctamente'], 200);
    }
}