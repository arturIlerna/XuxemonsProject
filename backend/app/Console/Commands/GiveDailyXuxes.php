<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\UserItem;
use App\Models\Configuracion;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GiveDailyXuxes extends Command
{
    protected $signature = 'daily:xuxes';
    protected $description = 'Entrega Xuxes diarias a todos los usuarios según configuración';

    public function handle()
    {
        // Obtener configuración
        $hora = Configuracion::where('clave', 'hora_xuxes_diarias')->first();
        $cantidad = Configuracion::where('clave', 'cantidad_xuxes_diarias')->first();
        
        $cantidadXuxes = $cantidad ? json_decode($cantidad->valor, true) : 10;
        $horaXuxes = $hora ? json_decode($hora->valor, true) : '08:00';
        
        // Verificar si es la hora correcta
        if (now()->format('H:i') !== $horaXuxes) {
            $this->info("No es la hora de entrega. Hora configurada: {$horaXuxes}");
            return;
        }
        
        $users = User::all();
        $entregados = 0;
        
        foreach ($users as $user) {
            $this->giveXuxesToUser($user->id, $cantidadXuxes);
            $entregados++;
        }
        
        $this->info("✅ Se entregaron {$cantidadXuxes} Xuxes a {$entregados} usuarios");
        Log::info("Xuxes diarias entregadas a {$entregados} usuarios a las " . now());
    }
    
    private function giveXuxesToUser($userId, $cantidad)
    {
        // Llista de xuxes possibles basades en el nostre ItemSeeder
        $tiposXuxes = ['Xuxe de Maduixa', 'Xuxe de Menta', 'Xuxe de Llimona'];
        $name = $tiposXuxes[array_rand($tiposXuxes)]; // Tria una a l'atzar
        
        // 1. Busquem si l'usuari ja té aquesta Xuxe a la motxilla
        $existingItem = UserItem::where('user_id', $userId)
            ->where('name', $name)
            ->first();
            
        if ($existingItem) {
            // Si ja la té, apilem la quantitat sencera en aquell mateix slot
            $existingItem->quantity += $cantidad;
            $existingItem->save();
        } else {
            // 2. Si no la té, busquem el primer forat lliure del 0 al 19
            $occupiedSlots = UserItem::where('user_id', $userId)->pluck('slot')->toArray();
            $freeSlot = null;

            for ($i = 0; $i <= 19; $i++) {
                if (!in_array($i, $occupiedSlots)) {
                    $freeSlot = $i;
                    break;
                }
            }

            // 3. Si hi ha un slot lliure, creem l'objecte allà
            if ($freeSlot !== null) {
                UserItem::create([
                    'user_id' => $userId,
                    'name' => $name,
                    'type' => 'apilable',
                    'quantity' => $cantidad,
                    'slot' => $freeSlot
                ]);
            } else {
                Log::warning("L'usuari ID {$userId} té la motxilla plena (20 slots ocupats) y no ha rebut la recompensa diària.");
            }
        }

        // Guardem l'historial de la recompensa
        DB::table('recompensas_historial')->insert([
            'user_id' => $userId,
            'tipo' => 'xuxes',
            'cantidad' => $cantidad,
            'xuxemon_id' => null,
            'fecha' => now()->toDateString(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}