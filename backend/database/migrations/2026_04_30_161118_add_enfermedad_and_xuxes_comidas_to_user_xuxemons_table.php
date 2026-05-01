<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('user_xuxemons', function (Blueprint $table) {
            // Añadimos el estado de salud y el progreso de alimentación
            $table->string('enfermedad')->nullable()->after('size'); 
            $table->integer('xuxes_comidas')->default(0)->after('enfermedad'); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_xuxemons', function (Blueprint $table) {
            $table->dropColumn(['enfermedad', 'xuxes_comidas']);
        });
    }
};