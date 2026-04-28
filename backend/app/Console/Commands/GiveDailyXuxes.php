<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\UserItem;
use App\Models\Configuracion;

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
        \Log::info("Xuxes diarias entregadas a {$entregados} usuarios a las " . now());
    }
    
    private function giveXuxesToUser($userId, $cantidad)
    {
        $name = 'Xuxe';
        $quantityToGive = $cantidad;
        
        // Buscar slots existentes con menos de 5
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
        
        // Crear nuevos slots si es necesario
        if ($quantityToGive > 0) {
            $occupiedSlots = UserItem::where('user_id', $userId)->pluck('slot')->toArray();
            for ($i = 1; $i <= 20 && $quantityToGive > 0; $i++) {
                if (!in_array($i, $occupiedSlots)) {
                    $giveNow = min(5, $quantityToGive);
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
    }
}