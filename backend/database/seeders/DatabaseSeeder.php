<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Solo llamamos al seeder de los Xuxemons para que se carguen en la base de datos.
        // Hemos eliminado la creación del "Test User" que provocaba el error.
        $this->call([
            XuxemonSeeder::class,
            
            // Nota: Si has creado un Seeder para los 3 tipos de Chuches, 
            // añádelo aquí debajo (ej: ItemSeeder::class). Si no, déjalo así.
        ]);
    }
}