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
        Schema::table('users', function (Blueprint $table) {
            // Campos nivel 1
            $table->string('lastname')->after('name'); // nombre/apellido
            $table->string('xuxe_id')->unique()->after('id'); // Formato #NomXXXX
            $table->enum('role', ['admin', 'player'])->default('player'); // Admin/Jugador
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['lastname', 'xuxe_id', 'role']);
        });
    }
};
