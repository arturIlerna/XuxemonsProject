<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Xuxemon;
use App\Models\UserXuxemon;
use App\Models\Configuracion;

class GiveDailyXuxemon extends Command
{
    protected $signature = 'daily:xuxemon';
    protected $description = 'Entrega un Xuxemon diario a todos los usuarios';

    public function handle()
    {
        // Obtener hora configurada
        $config = Configuracion::where('clave', 'hora_xuxemon_diario')->first();
        $horaXuxemon = $config ? json_decode($config->valor, true) : '08:00';
        
        // Verificar si es la hora correcta
        if (now()->format('H:i') !== $horaXuxemon) {
            $this->info("No es la hora de entrega. Hora configurada: {$horaXuxemon}");
            return;
        }
        
        $users = User::all();
        $xuxemons = Xuxemon::all();
        
        if ($xuxemons->isEmpty()) {
            $this->error('No hay Xuxemons en la base de datos');
            return;
        }
        
        $entregados = 0;
        
        foreach ($users as $user) {
            $randomXuxemon = $xuxemons->random();
            
            UserXuxemon::create([
                'user_id' => $user->id,
                'xuxemon_id' => $randomXuxemon->id,
                'size' => 'Pequeño',
                'obtained_at' => now()
            ]);
            
            $entregados++;
        }
        
        $this->info("✅ Se entregó 1 Xuxemon a {$entregados} usuarios");
        \Log::info("Xuxemon diario entregado a {$entregados} usuarios a las " . now());
    }
}
