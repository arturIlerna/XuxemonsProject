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
        // Hemos eliminado la creación del "Test User" que provocaba error.
        $this->call([
            XuxemonSeeder::class,
            ItemSeeder::class,
        ]);
    }
}