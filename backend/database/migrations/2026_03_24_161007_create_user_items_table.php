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
        Schema::create('user_items', function (Blueprint $table) {
            $table->id();
            // El dueño del objeto
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            // Nombre de la chuche o vacuna
            $table->string('name'); 
            // Tipo: 'apilable' (xuxes) o 'no_apilable' (vacunas)
            $table->string('type'); 
            // Cantidad en ese hueco (Máximo 5 si es apilable)
            $table->integer('quantity')->default(1); 
            // En qué hueco de la mochila está (del 1 al 20)
            $table->integer('slot'); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_items');
    }
};
