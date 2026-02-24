<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// RUTAS PÚBLICAS (No necesitan Token) ---
Route::post('/register', [AuthController::class, 'register']);

// Login para obtener el Token JWT
Route::post('/login', [AuthController::class, 'login']);


// RUTAS PROTEGIDAS (Necesitan JWT) ---
// Estas rutas solo funcionarán con el Provider activo
Route::middleware(['auth:api'])->group(function () {
    
    // Cerrar sesión y refrescar token
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    
    // Obtener mis datos de usuario logueado
    Route::get('/me', [AuthController::class, 'me']);

    // Dashboard de bienvenida
    Route::get('/dashboard', function () {
        return response()->json([
            'message' => 'Bienvenido al dashboard de Xuxedex',
            'user' => auth()->user()
        ]);
    });

});

// Ruta de comprobación rápida
Route::get('/health', function () {
    return response()->json(['status' => 'OK', 'message' => 'API de Xuxedex funcionando']);
});