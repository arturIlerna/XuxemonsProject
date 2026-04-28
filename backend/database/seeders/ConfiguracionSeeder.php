<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Configuracion;

class ConfiguracionSeeder extends Seeder
{
    public function run(): void
    {
        Configuracion::updateOrCreate(
            ['clave' => 'hora_xuxes_diarias'],
            ['valor' => json_encode('08:00')]
        );
        
        Configuracion::updateOrCreate(
            ['clave' => 'cantidad_xuxes_diarias'],
            ['valor' => json_encode(10)]
        );
        
        Configuracion::updateOrCreate(
            ['clave' => 'hora_xuxemon_diario'],
            ['valor' => json_encode('08:00')]
        );
        
        $this->command->info('✅ Configuraciones creadas');
    }
}