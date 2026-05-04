<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Xuxemon; 

class XuxemonSeeder extends Seeder
{
    public function run(): void
    {
        // Nuestro catálogo oficial de Xuxemons (todos tamaño Pequeño)
        $xuxemons = [
            ['name' => 'Aerion', 'type' => 'Aire', 'size' => 'Pequeño', 'level' => 5, 'attack' => 40, 'defense' => 50],
            ['name' => 'Aurael', 'type' => 'Aire', 'size' => 'Pequeño', 'level' => 18, 'attack' => 70, 'defense' => 45],
            ['name' => 'Batty', 'type' => 'Aire', 'size' => 'Pequeño', 'level' => 10, 'attack' => 45, 'defense' => 60],
            ['name' => 'Huracan', 'type' => 'Aire', 'size' => 'Pequeño', 'level' => 20, 'attack' => 60, 'defense' => 65],
            ['name' => 'Plumy', 'type' => 'Aire', 'size' => 'Pequeño', 'level' => 8, 'attack' => 55, 'defense' => 40],
            ['name' => 'Ventus', 'type' => 'Aire', 'size' => 'Pequeño', 'level' => 15, 'attack' => 50, 'defense' => 75],
            ['name' => 'Dolfin', 'type' => 'Agua', 'size' => 'Pequeño', 'level' => 5, 'attack' => 40, 'defense' => 50],
            ['name' => 'Gangrer', 'type' => 'Agua', 'size' => 'Pequeño', 'level' => 18, 'attack' => 70, 'defense' => 45],
            ['name' => 'langostini', 'type' => 'Agua', 'size' => 'Pequeño', 'level' => 10, 'attack' => 45, 'defense' => 60],
            ['name' => 'Manantial', 'type' => 'Agua', 'size' => 'Pequeño', 'level' => 20, 'attack' => 60, 'defense' => 65],
            ['name' => 'Marea', 'type' => 'Agua', 'size' => 'Pequeño', 'level' => 8, 'attack' => 55, 'defense' => 40],
            ['name' => 'Medusi', 'type' => 'Agua', 'size' => 'Pequeño', 'level' => 15, 'attack' => 50, 'defense' => 75],
            ['name' => 'Patigua', 'type' => 'Agua', 'size' => 'Pequeño', 'level' => 5, 'attack' => 50, 'defense' => 40],
            ['name' => 'Grisli', 'type' => 'Tierra', 'size' => 'Pequeño', 'level' => 5, 'attack' => 40, 'defense' => 50],
            ['name' => 'Lion', 'type' => 'Tierra', 'size' => 'Pequeño', 'level' => 18, 'attack' => 70, 'defense' => 45],
            ['name' => 'Lodo', 'type' => 'Tierra', 'size' => 'Pequeño', 'level' => 10, 'attack' => 45, 'defense' => 60],
            ['name' => 'Roc', 'type' => 'Tierra', 'size' => 'Pequeño', 'level' => 20, 'attack' => 60, 'defense' => 65],
            ['name' => 'Tortu', 'type' => 'Tierra', 'size' => 'Pequeño', 'level' => 8, 'attack' => 55, 'defense' => 40],
            ['name' => 'Tronc', 'type' => 'Tierra', 'size' => 'Pequeño', 'level' => 15, 'attack' => 50, 'defense' => 75],
            
        ];

        foreach ($xuxemons as $xuxe) {
            Xuxemon::updateOrCreate(['name' => $xuxe['name']], $xuxe);
        }
    }
}