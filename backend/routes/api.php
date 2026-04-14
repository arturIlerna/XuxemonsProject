<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\XuxemonController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\InventoryController;

// RUTAS PÚBLICAS (Sin necesidad de Token)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Ruta de comprobación rápida de estado
Route::get('/health', function () {
    return response()->json(['status' => 'OK', 'message' => 'API de Xuxedex funcionando']);
});


// RUTAS PROTEGIDAS (Requieren Token JWT) 
Route::middleware(['auth:api'])->group(function () {
    
    // Gestión de Sesión y Usuario Actual
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // Seguridad
    Route::put('/users/{id}', [AuthController::class, 'update']);
    Route::delete('/users/{id}', [AuthController::class, 'destroy']);

    // Dashboard de bienvenida
    Route::get('/dashboard', function () {
        return response()->json([
            'message' => 'Bienvenido al dashboard de Xuxedex',
            'user' => auth()->user()
        ]);
    });

    // --- CATÁLOGOS GLOBALES (Lectura) ---
    // Obtener catálogo de Xuxemons (con filtros)
    Route::get('/xuxemons', [XuxemonController::class, 'index']);
    
    // Obtener catálogo de Objetos/Chuches (Nivel 2)
    Route::get('/items', [AdminController::class, 'getItems']);


    // --- RUTAS DE ADMINISTRADOR ---
    // Gestión de Usuarios
    Route::get('/users', [AuthController::class, 'index']);
    
    // Acciones de Inyección de Items
    Route::post('/admin/give-xuxemon', [AdminController::class, 'giveRandomXuxemon']);
    Route::post('/admin/give-xuxes', [AdminController::class, 'giveXuxes']);

    // CRUD Global de Especies Xuxemon
    Route::post('/xuxemons', [XuxemonController::class, 'store']);
    Route::put('/xuxemons/{id}', [XuxemonController::class, 'update']);
    Route::delete('/xuxemons/{id}', [XuxemonController::class, 'destroy']);


    // --- COLECCIÓN Y MOCHILA PERSONAL ---
    // Mis Xuxemons capturados
    Route::get('/my-xuxemons', [XuxemonController::class, 'myCollection']);
    
    // Mi inventario real (slots)
    Route::get('/my-inventory', [InventoryController::class, 'index']);
});