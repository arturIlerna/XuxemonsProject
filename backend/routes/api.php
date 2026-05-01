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
    
    // Seguridad (CRUD Usuarios: Update y Delete)
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
    Route::get('/xuxemons', [XuxemonController::class, 'index']);
    Route::get('/items', [AdminController::class, 'getItems']);

    // --- RUTAS DE ADMINISTRADOR ---
    Route::get('/users', [AuthController::class, 'index']);
    Route::post('/admin/give-xuxemon', [AdminController::class, 'giveRandomXuxemon']);
    Route::post('/admin/give-xuxes', [AdminController::class, 'giveXuxes']);
    Route::post('/admin/give-vacunas', [AdminController::class, 'giveVacunas']); // <-- NOVA RUTA

    // CRUD Global de Especies Xuxemon
    Route::post('/xuxemons', [XuxemonController::class, 'store']);
    Route::put('/xuxemons/{id}', [XuxemonController::class, 'update']);
    Route::delete('/xuxemons/{id}', [XuxemonController::class, 'destroy']);

    // COLECCIÓN Y MOCHILA PERSONAL
    Route::get('/my-xuxemons', [XuxemonController::class, 'myCollection']);
    Route::get('/my-inventory', [InventoryController::class, 'index']);
    Route::post('/my-inventory/use/{id}', [InventoryController::class, 'useItem']);
    Route::delete('/my-inventory/{id}', [InventoryController::class, 'destroy']);

    // ========== CONFIGURACIÓN ==========
    Route::get('/admin/config', [AdminController::class, 'getConfig']);
    Route::put('/admin/config', [AdminController::class, 'updateConfig']);
    Route::post('/evolve/{id}/feed', [XuxemonController::class, 'feed']);
    Route::post('/evolve/{id}/heal', [XuxemonController::class, 'aplicarVacuna']);
    
    // ========== AMIGOS ==========
    Route::get('/friends/search', [App\Http\Controllers\API\FriendController::class, 'search']);
    Route::get('/friends', [App\Http\Controllers\API\FriendController::class, 'friendsList']);
    Route::get('/friends/pending', [App\Http\Controllers\API\FriendController::class, 'pendingRequests']);
    Route::get('/friends/pending/count', [App\Http\Controllers\API\FriendController::class, 'pendingCount']);
    Route::post('/friends/request', [App\Http\Controllers\API\FriendController::class, 'sendRequest']);
    Route::put('/friends/accept/{id}', [App\Http\Controllers\API\FriendController::class, 'acceptRequest']);
    Route::delete('/friends/reject/{id}', [App\Http\Controllers\API\FriendController::class, 'rejectRequest']);
    Route::delete('/friends/remove/{id}', [App\Http\Controllers\API\FriendController::class, 'removeFriend']);
});