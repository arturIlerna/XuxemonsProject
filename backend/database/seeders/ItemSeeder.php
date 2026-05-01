<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Item; 

class ItemSeeder extends Seeder
{
    public function run(): void
    {
        // ========== XUXES (Apilables) ==========
        Item::create([
            'name' => 'Xuxe de Maduixa',
            'type' => 'apilable',
            'description' => 'Una chuche dulce que ayuda a tu Xuxemon a crecer.'
        ]);

        Item::create([
            'name' => 'Xuxe de Menta',
            'type' => 'apilable',
            'description' => 'Refrescante y deliciosa, perfecta para evolucionar.'
        ]);

        Item::create([
            'name' => 'Xuxe de Llimona',
            'type' => 'apilable',
            'description' => 'Un poco ácida, pero llena de energía.'
        ]);

        // ========== VACUNES (No apilables) ==========
        Item::create([
            'name' => 'Xocolatina',
            'type' => 'no apilable',
            'description' => 'Cura ràpidament el Bajón de azúcar.'
        ]);

        Item::create([
            'name' => 'Xal de fruites',
            'type' => 'no apilable',
            'description' => 'Perfecte per baixar l\'Atracón i fer la digestió.'
        ]);

        Item::create([
            'name' => 'Inxulina',
            'type' => 'no apilable',
            'description' => 'Vacuna comodí. Ho cura absolutament tot.'
        ]);
    }
}