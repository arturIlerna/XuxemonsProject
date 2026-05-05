<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Xuxemon;
use App\Models\UserXuxemon;
use App\Models\UserItem;
use App\Models\Item; 
use App\Models\Configuracion; 

class AdminController extends Controller
{
    // Obtenemos el catálogo global de Chuches y Vacunas
    public function getItems()
    {
        return response()->json(Item::all(), 200);
    }

    // Dar un Xuxemon Aleatorio a un jugador
    public function giveRandomXuxemon(Request $request)
    {
        $request->validate(['user_id' => 'required|exists:users,id']);

        $randomXuxemon = Xuxemon::inRandomOrder()->first();

        UserXuxemon::create([
            'user_id' => $request->user_id,
            'xuxemon_id' => $randomXuxemon->id,
            'size' => 'Pequeño' 
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
            $occupiedSlots = UserItem::where('user_id', $userId)->pluck('slot')->toArray();
            
            for ($i = 1; $i <= 20; $i++) {
                if ($quantityToGive <= 0) break;

                if (!in_array($i, $occupiedSlots)) {
                    $giveNow = min(5, $quantityToGive); // Máximo 5 por slot
                    
                    UserItem::create([
                        'user_id' => $userId,
                        'name' => $name,
                        'type' => 'apilable',
                        'quantity' => $giveNow,
                        'slot' => $i
                    ]);
                    
                    $occupiedSlots[] = $i; 
                    $quantityToGive -= $giveNow;
                }
            }
        }
        
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

    // ========== DAR VACUNAS ==========
    public function giveVacunas(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'name' => 'required|string', 
            'quantity' => 'required|integer|min:1'
        ]);

        $userId = $request->user_id;
        $name = $request->name;
        $quantityToGive = $request->quantity;

        // Las vacunas NO se apilan. Cada vacuna ocupa 1 slot.
        $occupiedSlots = UserItem::where('user_id', $userId)->pluck('slot')->toArray();
        $vacunasGuardadas = 0;

        for ($i = 1; $i <= 20; $i++) {
            if ($quantityToGive <= 0) break;

            if (!in_array($i, $occupiedSlots)) {
                UserItem::create([
                    'user_id' => $userId,
                    'name' => $name,
                    'type' => 'no apilable',
                    'quantity' => 1, // Siempre 1 porque no se apilan
                    'slot' => $i
                ]);
                
                $occupiedSlots[] = $i; 
                $quantityToGive--;
                $vacunasGuardadas++;
            }
        }

        $discarded = $quantityToGive > 0;
        
        if ($discarded) {
            return response()->json([
                'message' => "Se han guardado $vacunasGuardadas vacunas, pero se han descartado $quantityToGive por falta de espacio en la mochila.",
                'discarded' => true
            ], 200);
        }

        return response()->json([
            'message' => '¡Todas las vacunas inyectadas en la mochila correctamente!',
            'discarded' => false
        ], 200);
    }

    // ========== MÉTODOS PARA CONFIGURACIÓN ==========

    // Obtener todas las configuraciones
    public function getConfig()
    {
        $configs = Configuracion::all();
        return response()->json($configs, 200);
    }

    // Actualizar configuraciones (Actualizado con los nuevos campos)
    public function updateConfig(Request $request)
    {
        $request->validate([
            'hora_xuxes_diarias' => 'nullable|date_format:H:i',
            'cantidad_xuxes_diarias' => 'nullable|integer|min:1|max:100',
            'hora_xuxemon_diario' => 'nullable|date_format:H:i',
            'probabilidad_infeccion' => 'nullable|integer|min:0|max:100',
            'xuxes_mediano' => 'nullable|integer|min:1',
            'xuxes_grande' => 'nullable|integer|min:1',
        ]);
        
        $camposConfigurables = [
            'hora_xuxes_diarias',
            'cantidad_xuxes_diarias',
            'hora_xuxemon_diario',
            'probabilidad_infeccion',
            'xuxes_mediano',
            'xuxes_grande'
        ];

        foreach ($camposConfigurables as $campo) {
            if ($request->has($campo)) {
                Configuracion::updateOrCreate(
                    ['clave' => $campo],
                    ['valor' => json_encode($request->$campo)]
                );
            }
        }
        
        return response()->json(['message' => 'Configuración actualizada correctamente'], 200);
    }
}