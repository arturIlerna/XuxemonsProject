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
        Schema::create('user_xuxemons', function (Blueprint $table) {
            $table->id();
            // El dueño del Xuxemon
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            // El tipo de Xuxemon 
            $table->foreignId('xuxemon_id')->constrained()->onDelete('cascade');
            // Tamaño actual de ESTE Xuxemon en concreto (para cuando crezcan)
            $table->string('size')->default('Pequeño'); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_xuxemons');
    }
};
