<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Item; 

class ItemSeeder extends Seeder
{
    public function run(): void
    {
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
    }
}